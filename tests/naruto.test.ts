import type { On, RenderViewport } from 'claude-code'
import { describe, expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { SPRITE, pixelCells } from '../hooks/art/pixel.ts'
import { climax, frameTime, hitsOf, poseAt, shoutAt, sinceOf, totalOf } from '../hooks/art/move.ts'
import type { Move } from '../hooks/art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { CHEER, Companion, JUTSU_EVERY, QUICK_EVERY, REPEAT, SHELL_JUTSU, keyOf } from '../hooks/companion.ts'
import { pickLine } from '../hooks/lines.ts'
import { isTruecolor, to256 } from '../hooks/palette.ts'
import type { ColorEnv } from '../hooks/palette.ts'
import { NINJA, byId, distance, findNinja, nearestNinja, notYet } from '../hooks/roster.ts'
import type { Ninja } from '../hooks/roster.ts'
import { missing } from '../hooks/sprite/grid.ts'
import { NATIVE, frameOf } from '../hooks/sprite/index.ts'
import { LEAP_CLIP } from '../hooks/sprite/anims/kit.ts'

// the test runner's console, for the frame-time log
declare const console: { log: (...args: unknown[]) => void }

// ---------------------------------------------------------------- helpers

const band = (maxRows: number, bodyColumns = 120, o: { hasSurvey?: boolean; isWorking?: boolean; viewport?: RenderViewport } = {}) =>
  ({
    plugin: 'naruto',
    component: 'AbovePrompt',
    ...(o.viewport ? { viewport: o.viewport } : {}),
    props: {
      hasSurvey: o.hasSurvey ?? false,
      isWorking: o.isWorking ?? false,
      maxRows,
      bodyColumns,
      scroll: { offset: 0, bodyRows: maxRows },
      view: {},
    },
  }) as const

const spinner = (mode: 'thinking' | 'tool-use' = 'tool-use') =>
  ({ plugin: 'naruto', component: 'Spinner', props: { word: 'Sauteing', message: null, suffix: '…', mode } }) as const

const signature = (id: string): number => movesOf(id).findIndex(m => m.on?.includes('shell'))
const moveOf = (id: string, index: number): Move => movesOf(id)[index]!

// moves the companion on by `seconds`, a tick at a time
const run = (c: Companion, seconds: number, step = 0.05): void => {
  for (let s = 0; s < seconds - 1e-9; s += step) c.update(step)
}

// the moves that start over `seconds` (not one already under way): a jutsu
// of the set (0-2), a quick strike (QUICK_INDEX), an arrival (ARRIVAL_INDEX)
const starts = (c: Companion, seconds: number, step = 0.05): { at: number; index: number }[] => {
  const out: { at: number; index: number }[] = []
  let was = c.state().move
  let t = 0
  for (let s = 0; s < seconds - 1e-9; s += step) {
    c.update(step)
    t += step
    const m = c.state().move
    if (m && (was === null || m.t < was.t || m.index !== was.index)) out.push({ at: t, index: m.index })
    was = m
  }
  return out
}
const jutsuOnly = (list: { at: number; index: number }[]) => list.filter(s => s.index >= 0 && s.index < QUICK_INDEX)

// Moves the companion on, a tick at a time, until a jutsu of the set begins
// (a command calls its own once it has run SHELL_JUTSU), so the jutsu is at
// its very start; how long that took, or -1 if none began within `most` seconds
const untilJutsu = (c: Companion, most = 60, step = 0.05): number => {
  let was = c.state().move
  for (let t = step; t < most + 1e-9; t += step) {
    c.update(step)
    const m = c.state().move
    if (m && m.index >= 0 && m.index < QUICK_INDEX && (was === null || m.t < was.t || m.index !== was.index)) return t
    was = m
  }
  return -1
}

// the state of a ninja at a moment of one of their jutsu, as the companion makes it
const moveState = (id: string, index: number, t: number, badge: ChibiState['badge'] = null): ChibiState => {
  const m = playOf(id, index)!
  const f = poseAt(m, frameTime(t))
  return {
    id,
    face: { blink: 0, gaze: [f.gaze[0], f.gaze[1]], mood: f.mood, active: m.dojutsu !== false },
    pose: f.pose,
    aura: Math.round(f.aura * 4) / 4,
    badge,
    tick: 0,
    bob: 0,
    move: { index, t: frameTime(t) },
  }
}

const still = (id: string, pose: Pose, mood: Mood, active = false): ChibiState => ({
  id,
  face: { blink: 0, gaze: [0, 0], mood, active },
  pose,
  aura: 0,
  badge: null,
  tick: 0,
  bob: 0,
  move: null,
})

const base64 = (words: Uint32Array): string => (new Uint8Array(words.buffer, words.byteOffset, words.byteLength) as Uint8Array & { toBase64(): string }).toBase64()

// a frame's cells are glyph, foreground, background: half blocks, a full one or
// a space, in 24-bit colours or the terminal's own
const GLYPHS = new Set([0x20, 0x2580, 0x2584, 0x2588])
const DEFAULT = 0x01000000
const badCell = (words: Uint32Array): number => {
  for (let o = 0; o < words.length; o += 3) {
    if (!GLYPHS.has(words[o]!)) return o / 3
    for (const c of [words[o + 1]!, words[o + 2]!]) if (c !== DEFAULT && c > 0xffffff) return o / 3
  }
  return -1
}

// every line the spinner says for a ninja, over many turns and every mode
const MODES = ['requesting', 'responding', 'thinking', 'tool-input', 'tool-use'] as const
const spoken = (n: Ninja): Set<string> => {
  const out = new Set<string>()
  for (let turn = 0; turn < 300; turn++) for (const mode of MODES) out.add(pickLine(n, mode, turn))
  return out
}

// A session to start: a clock and a store in memory, 24-bit colour, and the
// stubs session.start needs. The test adds its own hooks, then starts it.
const session = (on: On, entries: Record<string, unknown> = { hero: 'kakashi', welcomed: true }, settings: Record<string, unknown> = {}) => {
  const clock = mock.clock(on)
  mock.env(on, { TERM: 'xterm-256color', COLORTERM: 'truecolor' })
  const saved = new Map<string, unknown>(Object.entries(entries))
  const suggested: string[] = []
  on('store.get', ($, e) => ({ value: saved.get(e.key) }))
  on('store.set', ($, e) => {
    saved.set(e.key, e.value)
    return { value: undefined }
  })
  on('settings.read', () => ({ value: settings }))
  on('command.register', () => ({ value: { command: 'ninja' } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('prompt.suggest', ($, e) => {
    suggested.push(e.text)
    return { isShown: true }
  })
  const start = ($: Engine) => $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  return { clock, saved, suggested, start }
}

// ---------------------------------------------------------------- the corner

describe('the corner', () => {
  test('draws the ninja as a pixel-art sprite on its stage, at the right of the band', async ($, on) => {
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal' })
    const avatar = await ui.find({ key: 'ninja' })
    expect(avatar?.type).toBe('Raster')
    expect(avatar?.props['rows']).toBe(SPRITE.rows)
    expect(avatar?.props['columns']).toBe(SPRITE.columns)
    await ui.unmount()
  })

  test('draws block characters in Ghostty and kitty too: one style that works everywhere', async ($, on) => {
    const env: Record<string, string> = { TERM: 'xterm-ghostty', TERM_PROGRAM: 'ghostty', COLORTERM: 'truecolor' }
    on('env.get', ($, e) => ({ value: env[e.name] }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal' })
    expect(await ui.find({ type: 'Image' })).toBeUndefined()
    expect((await ui.find({ key: 'ninja' }))?.type).toBe('Raster')
    await ui.unmount()
  })

  // the size drawn for a band of `maxRows` (a terminal `rows` tall, in fullscreen or not) and `columns`
  const drawnIn = async ($: Engine, maxRows: number, columns = 120, viewport?: RenderViewport) => {
    const ui = await $.ui.mount({ ...band(maxRows, columns, { viewport }), surface: 'terminal' })
    const found = await ui.find({ key: 'ninja' })
    const name = await ui.find({ type: 'Text', text: /Kakashi/ })
    await ui.unmount()
    return found ? `${found.props['columns']}x${found.props['rows']}` : name ? 'name' : 'nothing'
  }

  test('hides the stage\'s bottom rows in a band of 9 to 11, shows the ninja\'s column in 5 to 8, then the name', async ($, on) => {
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    expect(await drawnIn($, 12)).toBe('48x12')
    expect(await drawnIn($, 11)).toBe('48x11')
    expect(await drawnIn($, 9)).toBe('48x9')
    expect(await drawnIn($, 8)).toBe('22x8')
    expect(await drawnIn($, 5)).toBe('22x5')
    expect(await drawnIn($, 4)).toBe('name')
    expect(await drawnIn($, 3)).toBe('name')
  })

  test('keeps the ninja its size in a band a few rows short, as when the tasks list opens: the same stage, its bottom rows hidden', async ($, on) => {
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const cellsIn = async (maxRows: number): Promise<string> => {
      const ui = await $.ui.mount({ ...band(maxRows), surface: 'terminal' })
      const cells = String((await ui.find({ key: 'ninja' }))?.props['cells'])
      await ui.unmount()
      return cells
    }
    const words = (cells: string): Uint32Array => {
      const bytes = Uint8Array.from(atob(cells), c => c.charCodeAt(0))
      return new Uint32Array(bytes.buffer)
    }
    const whole = words(await cellsIn(12))
    for (const rows of [11, 10, 9]) expect([...words(await cellsIn(rows))]).toEqual([...whole.subarray(0, SPRITE.columns * rows * 3)])
  })

  test('steps down in a band too narrow, to the ninja\'s column and then the name', async ($, on) => {
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    expect(SPRITE.columns).toBe(48)
    expect(await drawnIn($, 20, SPRITE.columns)).toBe('48x12')
    expect(await drawnIn($, 20, SPRITE.columns - 1)).toBe('22x12')
    expect(await drawnIn($, 20, 32)).toBe('22x12')
    expect(await drawnIn($, 20, 22)).toBe('22x12')
    expect(await drawnIn($, 20, 21)).toBe('name')
  })

  test('takes a third of the terminal on the main screen, never under the peek\'s eight rows if half the terminal allows, and its own slot in fullscreen', async ($, on) => {
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const main = (rows: number, columns = 120): RenderViewport => ({ columns, rows, isFullscreen: false })
    // on the main screen the band may take the whole height
    expect(await drawnIn($, 60, 120, main(60))).toBe('48x12')
    expect(await drawnIn($, 36, 120, main(36))).toBe('48x12')
    expect(await drawnIn($, 30, 120, main(30))).toBe('48x10')
    // 80x24: the peek, eight rows, the whole head
    expect(await drawnIn($, 24, 75, main(24, 80))).toBe('22x8')
    expect(await drawnIn($, 18, 120, main(18))).toBe('22x8')
    // a tiny terminal keeps half its rows for the conversation
    expect(await drawnIn($, 12, 120, main(12))).toBe('22x6')
    expect(await drawnIn($, 8, 120, main(8))).toBe('name')
    // in fullscreen the slot is the band's own: at 80x24, half the terminal less the prompt
    expect(await drawnIn($, 12, 120, { columns: 120, rows: 24, isFullscreen: true })).toBe('48x12')
    expect(await drawnIn($, 9, 120, { columns: 120, rows: 18, isFullscreen: true })).toBe('48x9')
    expect(await drawnIn($, 7, 75, { columns: 80, rows: 24, isFullscreen: true })).toBe('22x7')
  })

  test('draws the same pixel art on the desktop, under a new key for each new frame', async ($, on) => {
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    const svg = await ui.find({ type: 'Svg' })
    const source = String(svg?.props['source'])
    expect(source).toContain('<svg')
    expect(source.length).toBeLessThan(131072)
    // five points to a pixel of the 48 x 24 stage
    expect(svg?.props['width']).toBe(240)
    expect(svg?.props['height']).toBe(120)
    expect(source).toContain('viewBox="0 0 48 24"')
    expect(svg?.props['alt']).toBe('Kakashi Hatake')
    await ui.unmount()
  })

  test("draws each new desktop frame under a new key, since the desktop keeps an Svg's first picture", async ($, on) => {
    const { clock, start } = session(on)
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    const frame = async () => {
      const boxes = await ui.findAll({ type: 'Box' })
      return { key: boxes.map(b => b.key).find(k => k?.startsWith('ninja-')), source: String((await ui.find({ type: 'Svg' }))?.props['source']) }
    }
    const frames = [await frame()]
    for (let i = 0; i < 30; i++) {
      await clock.advance(250)
      frames.push(await frame())
    }
    expect(frames.every(f => f.key !== undefined)).toBe(true)
    expect(new Set(frames.map(f => f.source)).size).toBeGreaterThan(2)
    frames.forEach((f, i) => {
      if (i > 0 && f.source !== frames[i - 1]!.source) expect(f.key).not.toBe(frames[i - 1]!.key)
    })
    await ui.unmount()
  })

  test('says what the desktop picture shows: the jutsu, a call for you, or the name', () => {
    const c = new Companion(byId('kakashi'))
    expect(c.caption()).toBe('Kakashi Hatake')
    c.setWorking(true)
    // a command: its quick strike at once, its jutsu once it has run a while
    c.toolStart('1', 'Bash')
    expect(c.caption()).toBe(`Kakashi Hatake, ${playOf('kakashi', QUICK_INDEX)!.name}`)
    expect(untilJutsu(c)).toBeGreaterThan(0)
    expect(c.caption()).toBe(`Kakashi Hatake, ${moveOf('kakashi', signature('kakashi')).name}`)
    c.permission('Bash')
    expect(c.caption()).toBe('Kakashi Hatake, Claude needs you')
    c.toolEnd('1', false)
    expect(c.caption()).toBe('Kakashi Hatake')
    // an arrival is just the ninja
    c.setNinja(byId('itachi'))
    expect(c.state().move?.index).toBe(ARRIVAL_INDEX)
    expect(c.caption()).toBe('Itachi Uchiha')
  })

  test('leaves the band alone while a survey holds it', async ($, on) => {
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
      const { Text } = $.ui.resolve(e)
      return Text({ children: 'survey' })
    })
    const ui = await $.ui.mount({ ...band(20, 120, { hasSurvey: true }), surface: 'terminal' })
    expect(await ui.find({ key: 'ninja' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: 'survey' })).toBeDefined()
    await ui.unmount()
  })

  test('shows a red "!" beside a peek or the name while Claude needs you, where no bubble fits', async ($, on) => {
    const { clock, start } = session(on)
    on('ui.blit', () => ({ value: {} }))
    on('classic.PermissionRequest', () => ({}))
    on('prompt.submit', ($, e) => ({ text: e.text }) as never)
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const bang = async (ui: { find: (q: { type?: string; text?: RegExp }) => Promise<{ text: string; props: Record<string, unknown> } | undefined> }) => {
      const found = await ui.find({ type: 'Text', text: /^! ?$/ })
      return found ? `${found.text}|${String(found.props['color'])}|${String(found.props['bold'])}` : null
    }
    const peek = await $.ui.mount({ ...band(6), surface: 'terminal' })
    const name = await $.ui.mount({ ...band(3), surface: 'terminal' })
    expect(await bang(peek)).toBeNull()
    expect(await bang(name)).toBeNull()
    // a permission prompt opens: the "!" comes with the next tick
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'rm -rf build' } })
    await clock.advance(300)
    expect(await bang(peek)).toBe('!|#ff3b30|true')
    expect(await bang(name)).toBe('! |#ff3b30|true')
    expect((await peek.find({ key: 'ninja' }))?.props['columns']).toBe(22)
    expect(await name.find({ type: 'Text', text: /Kakashi/ })).toBeDefined()
    // answered: it goes with the next tick
    await $.prompt.submit({ text: 'yes' } as never)
    await clock.advance(1100)
    expect(await bang(peek)).toBeNull()
    expect(await bang(name)).toBeNull()
    // the stage has room for the badge's own bubble
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'rm -rf build' } })
    const stage = await $.ui.mount({ ...band(20), surface: 'terminal' })
    expect(await bang(stage)).toBeNull()
    for (const ui of [peek, name, stage]) await ui.unmount()
  })

  test('shows a green ✓ beside a peek or the name once Claude has answered, as the "!" shows there', async ($, on) => {
    const { clock, start } = session(on)
    on('ui.blit', () => ({ value: {} }))
    on('prompt.submit', ($, e) => ({ text: e.text }) as never)
    on('turn.complete', () => ({ text: 'done' }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const mark = async (ui: { find: (q: { type?: string; text?: RegExp }) => Promise<{ text: string; props: Record<string, unknown> } | undefined> }) => {
      const found = await ui.find({ type: 'Text', text: /^[!✓] ?$/ })
      return found ? `${found.text}|${String(found.props['color'])}|${String(found.props['bold'])}` : null
    }
    const peek = await $.ui.mount({ ...band(6), surface: 'terminal' })
    const name = await $.ui.mount({ ...band(3), surface: 'terminal' })
    await $.prompt.submit({ text: 'fix the bug' } as never)
    expect(await mark(peek)).toBeNull()
    await $.turn.complete({ reason: 'answer', agentId: undefined } as never)
    await clock.advance(300)
    expect(await mark(peek)).toBe('✓|#34c759|true')
    expect(await mark(name)).toBe('✓ |#34c759|true')
    // it stays through the cheer, and goes with your next prompt
    for (let i = 0; i < 30; i++) await clock.advance(100)
    expect(await mark(peek)).toBe('✓|#34c759|true')
    await $.prompt.submit({ text: 'thanks' } as never)
    await clock.advance(1100)
    expect(await mark(peek)).toBeNull()
    expect(await mark(name)).toBeNull()
    const stage = await $.ui.mount({ ...band(20), surface: 'terminal' })
    await $.turn.complete({ reason: 'answer', agentId: undefined } as never)
    await clock.advance(300)
    expect(await mark(stage)).toBeNull()
    for (const ui of [peek, name, stage]) await ui.unmount()
  })

  test('a blit refused ten times in a row asks once for the band to be drawn again', async ($, on) => {
    const { clock, start } = session(on)
    let blits = 0
    let asks = 0
    on('ui.blit', () => {
      blits++
      return { deny: 'not mounted' }
    })
    on('ui.invalidate', ($, e, next) => {
      asks++
      return next(e)
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal' })
    for (let i = 0; i < 60; i++) await clock.advance(250)
    expect(blits).toBeGreaterThanOrEqual(10)
    expect(asks).toBe(1)
    await ui.unmount()
  })
})

describe('colour depth', () => {
  const env = (o: Partial<ColorEnv>): ColorEnv => ({ term: '', program: '', colorterm: '', force: '', os: '', ...o })

  // the sprite's cells for a ninja just loaded, in 24-bit colour
  const loaded = (): string => base64(pixelCells(new Companion(byId('kakashi')).state(), byId('kakashi').glow, SPRITE.columns, SPRITE.rows))
  const drawn = async ($: Engine, on: On, vars: Record<string, string>): Promise<unknown> => {
    on('env.get', ($, e) => ({ value: vars[e.name] }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal' })
    const found = await ui.find({ key: 'ninja' })
    await ui.unmount()
    return found?.props['cells']
  }

  test('sends 24-bit colour where Claude Code paints it', async ($, on) => {
    expect(await drawn($, on, { TERM: 'xterm-256color', COLORTERM: 'truecolor' })).toBe(loaded())
  })

  test('matches the 256-colour palette where Claude Code rounds to it', async ($, on) => {
    expect(await drawn($, on, { TERM: 'xterm-256color', TERM_PROGRAM: 'Apple_Terminal' })).not.toBe(loaded())
  })

  test("24-bit colour where Claude Code paints it, by chalk's rules", () => {
    expect(isTruecolor(env({ term: 'xterm-256color', colorterm: 'truecolor' }))).toBe(true)
    expect(isTruecolor(env({ term: 'xterm-ghostty' }))).toBe(true)
    expect(isTruecolor(env({ term: 'xterm-256color', program: 'iTerm.app' }))).toBe(true)
    expect(isTruecolor(env({ os: 'Windows_NT' }))).toBe(true)
    expect(isTruecolor(env({ force: '3' }))).toBe(true)
  })

  test('the 256-colour palette elsewhere, whatever else is set', () => {
    expect(isTruecolor(env({ term: 'xterm-256color', program: 'Apple_Terminal' }))).toBe(false)
    expect(isTruecolor(env({ term: 'xterm-256color', colorterm: '24bit' }))).toBe(false)
    // Ghostty over ssh: its name, but not its TERM
    expect(isTruecolor(env({ term: 'xterm-256color', program: 'ghostty' }))).toBe(false)
    expect(isTruecolor(env({ term: 'screen-256color', force: '3' }))).toBe(false)
  })

  test('in 256 colours a warm shade stays coloured, and no hair shade turns a pure primary', () => {
    // a sent value as the terminal shows it: each channel to the cube's nearest level
    const LEVELS = [0, 95, 135, 175, 215, 255]
    const shown = (c: number): number[] => [16, 8, 0].map(s => LEVELS.reduce((b, l) => (Math.abs(l - ((c >> s) & 255)) < Math.abs(b - ((c >> s) & 255)) ? l : b), 0))
    const chroma = (rgb: number[]): number => Math.max(...rgb) - Math.min(...rgb)
    // the training post's wood, Neji's brown hair, Lee's green, Gaara's sash: never grey
    for (const c of [0x6b3f1d, 0x704a34, 0x28642e, 0x621e30]) expect({ c, chroma: chroma(shown(to256(c))) >= 40 }).toEqual({ c, chroma: true })
    // Hinata's dark hair shade sits with the rest of her hair, not on a pure blue
    expect(shown(to256(0x30287a))).toEqual(shown(to256(0x463e92)))
  })
})

// ---------------------------------------------------------------- /ninja

describe('/ninja', () => {
  const ninja = async ($: Engine, args: string): Promise<string> => (await $.command.run({ command: 'ninja', args } as never)).text ?? ''

  test('says who you have and their jutsu, numbered, and how to switch or watch one', async ($, on) => {
    mock.store(on)
    expect(await ninja($, '')).toBe(
      [
        'Kakashi Hatake, the Copy Ninja',
        'Jutsu: 1. Raikiri · 2. Summoning Jutsu: Ninken · 3. Kamui',
        '/ninja <name> to switch · /ninja list for all 20',
        '/ninja jutsu 1-3 to watch one · /ninja help for the rest',
      ].join('\n'),
    )
  })

  test("fits an 80-column terminal: every ninja's own reply, and the help", async ($, on) => {
    mock.store(on)
    for (const n of NINJA) {
      await ninja($, n.id)
      for (const args of ['', n.id, 'off', 'quiet', 'quiet', '', 'on', 'on', 'jutsu nothing'])
        for (const line of (await ninja($, args)).split('\n')) expect({ id: n.id, line, fits: line.length <= 75 }).toEqual({ id: n.id, line, fits: true })
    }
    for (const line of (await ninja($, 'help')).split('\n')) expect({ line, fits: line.length <= 75 }).toEqual({ line, fits: true })
  })

  test('switches ninja by any part of the name and remembers it', async ($, on) => {
    mock.store(on)
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    expect(await ninja($, 'sasu')).toBe(`Sasuke Uchiha steps in. "I'm an avenger."`)
    const tiny = await $.ui.mount({ ...band(3), surface: 'terminal' })
    expect(await tiny.find({ type: 'Text', text: 'Sasuke' })).toBeDefined()
    await tiny.unmount()
  })

  test('knows the nicknames fans use', async ($, on) => {
    mock.store(on)
    const nick: Record<string, string> = {
      tobi: 'obito',
      nagato: 'pain',
      yahiko: 'pain',
      pein: 'pain',
      'pervy sage': 'jiraiya',
      'Pervy Sage': 'jiraiya',
      pervy: 'jiraiya',
      'ero sennin': 'jiraiya',
      'ero-sennin': 'jiraiya',
      erosennin: 'jiraiya',
      gai: 'guy',
      'might gai': 'guy',
      'maito gai': 'guy',
      'guy sensei': 'guy',
      'gai sensei': 'guy',
      'kakashi sensei': 'kakashi',
      'sixth hokage': 'kakashi',
      'fourth hokage': 'minato',
      yondaime: 'minato',
      'granny tsunade': 'tsunade',
      'lady tsunade': 'tsunade',
      'seventh hokage': 'naruto',
      kurama: 'naruto',
      'nine tails': 'naruto',
      'nine-tails': 'naruto',
      kyuubi: 'naruto',
      kyubi: 'naruto',
      dobe: 'naruto',
      teme: 'sasuke',
      'bushy brows': 'lee',
      senpai: 'deidara',
      'legendary sucker': 'tsunade',
      'baa chan': 'tsunade',
      'baa-chan': 'tsunade',
      baachan: 'tsunade',
      forehead: 'sakura',
      shukaku: 'gaara',
      'one tail': 'gaara',
      'one-tail': 'gaara',
      rinnegan: 'pain',
      samehada: 'kisame',
      // a title still finds its owner
      hokage: 'tsunade',
      // and what comes before or after a name is let go
      'kakashi-sensei': 'kakashi',
      kakashisensei: 'kakashi',
      'sasuke-kun': 'sasuke',
      'naruto kun': 'naruto',
      'hinata chan': 'hinata',
      'itachi-san': 'itachi',
      'gaara sama': 'gaara',
      'deidara senpai': 'deidara',
      'lord jiraiya': 'jiraiya',
      'Lady Tsunade': 'tsunade',
      'lord fourth': 'minato',
    }
    for (const [q, id] of Object.entries(nick)) expect({ q, id: findNinja(q)?.id }).toEqual({ q, id })
    // Tobi steps in as himself
    expect(await ninja($, 'tobi')).toBe('Tobi steps in. "Tobi is a good boy!"')
    expect(await ninja($, 'naruto')).toBe('Naruto Uzumaki steps in. "Believe it! I never go back on my word!"')
    expect(await ninja($, 'obito')).toBe('Obito Uchiha steps in. "I\'m no one. I don\'t want to be anyone."')
    expect(nearestNinja('tobii')?.id).toBe('obito')
    expect(nearestNinja('nagatoo')?.id).toBe('pain')
  })

  test('lists all twenty by side, six to a line at most, marks yours, and suggests one to try', async ($, on) => {
    mock.store(on)
    for (const args of ['list', 'ninja', 'roster']) {
      const res = await ninja($, args)
      // Claude Code leads the output with "naruto: ", so the groups start on a line of their own
      const lines = res.split('\n')
      expect(lines[0]).toBe('All 20, by side:')
      expect(lines[1]).toStartWith('Hidden Leaf  ')
      expect(lines[1]).toContain('Kakashi (you)')
      // the Leaf's fourteen go on, indented under the first name
      expect(lines[2]).toStartWith('             ')
      expect(lines.find(l => l.startsWith('Akatsuki     '))).toContain('Itachi · Obito · Pain · Deidara · Kisame')
      expect(lines.find(l => l.startsWith('Elsewhere    '))).toContain('Gaara · Orochimaru · Madara')
      expect(lines[lines.length - 1]).toBe('Try /ninja itachi')
      for (const n of NINJA) expect(res).toContain(n.short)
    }
    // whoever you are, no line runs past 78 columns or six names
    for (const n of NINJA) {
      await ninja($, n.id)
      for (const line of (await ninja($, 'list')).split('\n')) {
        expect({ id: n.id, line, fits: line.length <= 78 }).toEqual({ id: n.id, line, fits: true })
        expect(line.split(' · ').length).toBeLessThanOrEqual(6)
      }
    }
    await ninja($, 'itachi')
    const res = await ninja($, 'list')
    expect(res).toContain('Itachi (you)')
    expect(res).toContain('Try /ninja naruto')
  })

  test('says when a name is unknown, with the nearest one only if it is near', async ($, on) => {
    mock.store(on)
    expect(await ninja($, 'naruro')).toBe('No ninja called "naruro" (yet). Did you mean Naruto? /ninja list shows all 20.')
    expect(await ninja($, 'qwxz')).toBe('No ninja called "qwxz" (yet). /ninja list shows all 20.')
    // a first name is nearer than a surname: "gara" is Gaara, not Shikamaru Nara
    expect(await ninja($, 'gara')).toBe('No ninja called "gara" (yet). Did you mean Gaara? /ninja list shows all 20.')
    expect(nearestNinja('nara')?.id).toBe('shikamaru')
    // one letter off up to five letters, two up to eight, three beyond
    expect(nearestNinja('hinta')?.id).toBe('hinata')
    expect(nearestNinja('hnta')).toBeUndefined()
    expect(nearestNinja('kakasha')?.id).toBe('kakashi')
    expect(nearestNinja('orochimarooo')?.id).toBe('orochimaru')
    // two letters or more off, it must start the same
    expect(nearestNinja('xakasha')).toBeUndefined()
    expect(nearestNinja('lakashi')?.id).toBe('kakashi')
    // three letters may be one off at most: "the" is not Lee
    expect(await ninja($, 'the')).toBe('No ninja called "the" (yet). /ninja list shows all 20.')
    expect(nearestNinja('the')).toBeUndefined()
    expect(nearestNinja('le')?.id).toBe('lee')
    expect(nearestNinja('itachy')?.id).toBe('itachi')
    expect(nearestNinja('kakshi')?.id).toBe('kakashi')
    expect(nearestNinja('nartuo')?.id).toBe('naruto')
    expect(nearestNinja('orochimar')?.id).toBe('orochimaru')
    expect(nearestNinja('gai')?.id).toBe('guy')
    expect(nearestNinja('gxa')).toBeUndefined()
    // two letters side by side swapped are one slip, as one changed is
    expect(distance('lsit', 'list')).toBe(1)
    expect(distance('obtio', 'obito')).toBe(1)
    expect(distance('abc', 'ca')).toBe(3)
    expect(await ninja($, 'obtio')).toBe('No ninja called "obtio" (yet). Did you mean Obito? /ninja list shows all 20.')
    expect(await ninja($, 'itahci')).toBe('No ninja called "itahci" (yet). Did you mean Itachi? /ninja list shows all 20.')
    expect(await ninja($, 'lsit')).toBe('No ninja called "lsit". Did you mean /ninja list?')
    expect(await ninja($, 'qiuet')).toBe('No ninja called "qiuet". Did you mean /ninja quiet?')
    expect(nearestNinja('gia')?.id).toBe('guy')
  })

  test('jutsu plays one now, by number or name, and names the set when it is not theirs', async ($, on) => {
    const { clock, start } = session(on, { hero: 'itachi', welcomed: true })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    const alt = async (): Promise<string> => {
      await clock.advance(100)
      await ui.redraw()
      return String((await ui.find({ type: 'Svg' }))?.props['alt'])
    }
    expect(await ninja($, 'jutsu 3')).toBe('Itachi: "Amaterasu!"')
    expect(await alt()).toBe('Itachi Uchiha, Amaterasu')
    // at once, whatever just played
    expect(await ninja($, 'jutsu crow')).toBe('Itachi: "Crow Clone!"')
    expect(await alt()).toBe('Itachi Uchiha, Crow Clone Jutsu')
    expect(await ninja($, 'jutsu Tsukuyomi')).toBe('Itachi: "Tsukuyomi!"')
    expect(await alt()).toBe('Itachi Uchiha, Tsukuyomi')
    const theirs = "Itachi doesn't know that one. Itachi's jutsu:\n1. Tsukuyomi · 2. Crow Clone Jutsu · 3. Amaterasu"
    expect(await ninja($, 'jutsu rasengan')).toBe(theirs)
    expect(await ninja($, 'jutsu 4')).toBe(theirs)
    // none named: the next in turn
    expect(await ninja($, 'jutsu')).toMatch(/^Itachi: "(Tsukuyomi|Crow Clone|Amaterasu)!"$/)
    expect(await alt()).toMatch(/^Itachi Uchiha, /)
    await ui.unmount()
  })

  test('help, every line under 75 columns', async ($, on) => {
    mock.store(on)
    const help = await ninja($, 'help')
    expect(help.split('\n')[0]).toBe('How to use /ninja:')
    for (const sub of ['/ninja <name>', '/ninja list', '/ninja random', '/ninja jutsu', '/ninja on | quiet | off  the full ninja, calm (no jutsu), or hidden']) expect(help).toContain(sub)
    // the commands in one column, what they do in the next
    expect(new Set(help.split('\n').slice(1).map(l => /^\S.*?  +(?=\S)/.exec(l)![0].length))).toEqual(new Set([25]))
  })

  test('off hides the ninja until on brings them back, and is remembered', async ($, on) => {
    const { saved, start } = session(on)
    on('ui.blit', () => ({ value: {} }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({ children: $.ui.resolve(e).Text({ children: 'theirs' }) }))
    await start($)
    const shown = async (surface: 'terminal' | 'desktop', rows = 20): Promise<string> => {
      const ui = await $.ui.mount({ ...band(rows), surface })
      const corner = (await ui.find({ key: 'ninja' })) ?? (await ui.find({ type: 'Svg' })) ?? (await ui.find({ type: 'Text', text: 'Kakashi' }))
      const theirs = await ui.find({ type: 'Text', text: 'theirs' })
      await ui.unmount()
      return `${corner ? 'ninja' : 'none'}+${theirs ? 'theirs' : 'none'}`
    }
    expect(await shown('terminal')).toBe('ninja+theirs')
    for (const args of ['off', 'hide', 'stop']) expect(await ninja($, args)).toBe('Kakashi steps out of sight. /ninja on brings them back.\n(ctrl+x ctrl+a folds the whole band.)')
    expect(saved.get('hidden')).toBe(true)
    expect(await shown('terminal')).toBe('none+theirs')
    expect(await shown('terminal', 3)).toBe('none+theirs')
    expect(await shown('desktop')).toBe('none+theirs')
    // a session started again stays hidden
    await start($)
    expect(await shown('terminal')).toBe('none+theirs')
    // out of sight, /ninja says so, and how to bring them back
    expect(await ninja($, '')).toEndWith('\nKakashi is out of sight: /ninja on brings them back.')
    expect(await ninja($, 'on')).toBe('Kakashi is back, jutsu and all.')
    expect(saved.get('hidden')).toBe(false)
    expect(await shown('terminal')).toBe('ninja+theirs')
    expect(await ninja($, '')).not.toContain('out of sight')
    // already in sight, they are already here
    for (const args of ['on', 'show']) expect(await ninja($, args)).toBe('Kakashi is already here.')
    await ninja($, 'hide')
    expect(await ninja($, 'show')).toBe('Kakashi is back, jutsu and all.')
    // switching to someone shows them
    await ninja($, 'off')
    await ninja($, 'itachi')
    expect(await shown('terminal')).toBe('ninja+theirs')
  })

  test('says why the corner shows less than the stage, and what shows it all', async ($, on) => {
    const { start } = session(on)
    on('ui.blit', () => ({ value: {} }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    // /ninja after the corner is drawn in a terminal of `rows`, its band `columns` wide
    const after = async (rows: number, columns = 78, maxRows = 20): Promise<string> => {
      const ui = await $.ui.mount({ ...band(maxRows, columns), surface: 'terminal', viewport: { columns: columns + 2, rows, isFullscreen: false } })
      await ui.unmount()
      return ninja($, '')
    }
    const lines = (text: string): string[] => text.split('\n').slice(4)
    // an 80x24 terminal: the head
    expect(lines(await after(24))).toEqual(["Your terminal has room for Kakashi's head.", 'A window about 36 rows tall shows the whole stage.'])
    // the list the first run suggests says so too, before its suggestion
    expect((await ninja($, 'list')).split('\n').slice(-3)).toEqual(["Your terminal has room for Kakashi's head.", 'A window about 36 rows tall shows the whole stage.', 'Try /ninja itachi'])
    // tall enough for the stage, whole or with its feet cut
    expect(lines(await after(40))).toEqual([])
    expect(lines(await after(30))).toEqual([])
    // too narrow for it, however tall
    expect(lines(await after(60, 26))).toEqual(["Your terminal has room for Kakashi's head.", 'A wider window shows the whole stage.'])
    // a band of three rows: the name
    expect(lines(await after(60, 78, 3))).toEqual(["Your terminal has room for Kakashi's name only."])
    expect(lines(await after(9, 78, 3))).toEqual(["Your terminal has room for Kakashi's name only.", 'A window about 36 rows tall shows the whole stage.'])
    // out of sight, that comes first
    await ninja($, 'off')
    expect(lines(await ninja($, ''))).toEqual(['Kakashi is out of sight: /ninja on brings them back.'])
  })

  test('out of sight, the spinner and the footer keep Claude Code\'s own words', async ($, on) => {
    const { start } = session(on)
    let word = ''
    on('ui.render', { component: 'Spinner' }, ($, e) => {
      word = e.props.word
      return $.ui.resolve(e).Box({})
    })
    on('ui.render', { component: 'TurnDuration' }, ($, e) => {
      word = e.props.word
      return $.ui.resolve(e).Box({})
    })
    await start($)
    const said = async (component: 'Spinner' | 'TurnDuration'): Promise<string> => {
      const ui = await $.ui.mount(component === 'Spinner' ? { ...spinner(), surface: 'terminal' } : ({ plugin: 'naruto', component, props: { word: 'Cooked', durationMs: 4200 }, surface: 'terminal' } as never))
      await ui.unmount()
      return word
    }
    expect(await said('Spinner')).not.toBe('Sauteing')
    await ninja($, 'off')
    expect(await said('Spinner')).toBe('Sauteing')
    expect(await said('TurnDuration')).toBe('Cooked')
    await ninja($, 'on')
    expect(await said('Spinner')).not.toBe('Sauteing')
  })

  test('the ninja you have already is already here: no hello again', async ($, on) => {
    const { clock, saved, start } = session(on)
    const blits: string[] = []
    on('ui.blit', ($, e) => {
      if ('cells' in e) blits.push(e.cells)
      return { value: {} }
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal', viewport: { columns: 120, rows: 60, isFullscreen: false } })
    // the arrival, every frame, as each would draw it
    const arrival = (id: string): Set<string> => {
      const out = new Set<string>()
      for (let t = 0; t < totalOf(playOf(id, ARRIVAL_INDEX)!); t += 0.1) out.add(base64(pixelCells(moveState(id, ARRIVAL_INDEX, t), byId(id).glow, SPRITE.columns, SPRITE.rows)))
      return out
    }
    expect(await ninja($, 'kakashi')).toBe('Kakashi is already here.\n/ninja jutsu to watch a jutsu, /ninja list for the others.')
    expect(await ninja($, 'Kakashi Hatake')).toStartWith('Kakashi is already here.')
    for (let i = 0; i < 10; i++) await clock.advance(100)
    const kakashi = arrival('kakashi')
    expect(blits.filter(b => kakashi.has(b))).toEqual([])
    expect(saved.get('hero')).toBe('kakashi')
    // someone new arrives in a puff of smoke
    expect(await ninja($, 'itachi')).toStartWith('Itachi Uchiha steps in.')
    for (let i = 0; i < 10; i++) await clock.advance(100)
    const itachi = arrival('itachi')
    expect(blits.filter(b => itachi.has(b)).length).toBeGreaterThan(2)
    await ui.unmount()
  })

  test('a slip of a subcommand is taken for one, and quiet takes no word but its old on and off', async ($, on) => {
    mock.store(on)
    expect(await ninja($, 'quit')).toBe('No ninja called "quit". Did you mean /ninja quiet?')
    expect(await ninja($, 'lst')).toBe('No ninja called "lst". Did you mean /ninja list?')
    expect(await ninja($, 'jutsuu')).toBe('No ninja called "jutsuu". Did you mean /ninja jutsu?')
    expect(await ninja($, 'randon')).toBe('No ninja called "randon". Did you mean /ninja random?')
    // before a part of a title: "hid" is not Kisame "of the Hidden Mist"
    expect(await ninja($, 'hid')).toBe('No ninja called "hid". Did you mean /ninja hide?')
    expect(await ninja($, 'hokage')).toStartWith('Tsunade steps in.')
    // a slip of a name is still a name
    expect(await ninja($, 'lees')).toBe('No ninja called "lees" (yet). Did you mean Rock Lee? /ninja list shows all 20.')
    expect(await ninja($, 'quiet maybe')).toBe('Just /ninja quiet: no jutsu. /ninja on brings them back.')
    expect(await ninja($, 'quite')).toBe('No ninja called "quite". Did you mean /ninja quiet?')
  })

  test('with reduced motion, /ninja jutsu says jutsu do not play', async ($, on) => {
    const { start } = session(on, { hero: 'kakashi', welcomed: true }, { prefersReducedMotion: true })
    await start($)
    expect(await ninja($, 'jutsu')).toBe("(Reduced motion is on, so jutsu don't play.)")
    expect(await ninja($, 'jutsu 2')).toBe("(Reduced motion is on, so jutsu don't play.)")
  })

  test('someone not on the roster yet is not here (yet), with someone who is', async ($, on) => {
    mock.store(on)
    expect(await ninja($, 'hashirama')).toBe("Hashirama isn't here (yet). Madara is still looking for him: /ninja madara")
    expect(await ninja($, 'Lord Hashirama')).toBe("Hashirama isn't here (yet). Madara is still looking for him: /ninja madara")
    expect(await ninja($, 'hashirama-sama')).toBe("Hashirama isn't here (yet). Madara is still looking for him: /ninja madara")
    expect(await ninja($, 'boruto')).toBe("Boruto isn't here (yet). His dad is: /ninja naruto")
    expect(await ninja($, 'kushina')).toBe("Kushina isn't here (yet), dattebane!\nHer husband and son are: /ninja minato or /ninja naruto")
    expect(await ninja($, 'bee')).toBe("Killer Bee isn't here (yet), fool ya fool! His student is: /ninja naruto")
    expect(await ninja($, 'Killer-Bee')).toBe(await ninja($, 'bee'))
    // whose sensei?
    expect(await ninja($, 'sensei')).toBe('Which sensei? Kakashi, Jiraiya and Might Guy are all here: /ninja kakashi')
    expect(await ninja($, 'guy sensei')).toStartWith('Might Guy steps in.')
    const all = ['Hashirama', 'Tobirama', 'Hiruzen', 'Sai', 'Yamato', 'Kabuto', 'Konan', 'Sasori', 'Hidan', 'Kakuzu', 'Zabuza', 'Haku', 'Temari', 'Kankuro', 'Choji', 'Ino', 'Kiba', 'Shino', 'Tenten', 'Iruka', 'Konohamaru', 'Boruto', 'Sarada', 'Himawari', 'Mitsuki', 'Shisui', 'Kushina', 'Asuma', 'Kurenai', 'Killer Bee', 'Zetsu', 'Kaguya', 'Sensei']
    for (const name of all) {
      const said = notYet(name.toLowerCase()) ?? ''
      const first = name === 'Sensei' ? said.startsWith('Which sensei?') : said.startsWith(`${name} isn't here (yet)`)
      expect({ name, said: first, fits: said.split('\n').every(l => l.length <= 75) }).toEqual({ name, said: true, fits: true })
      // everyone it points to is here
      const to = [...said.matchAll(/\/ninja (\w+)/g)].map(m => m[1]!)
      expect(to.length).toBeGreaterThan(0)
      for (const id of to) expect({ name, id, here: findNinja(id)?.id }).toEqual({ name, id, here: id })
      expect(await ninja($, name)).toBe(said)
    }
    // and no one on the roster is mistaken for one
    for (const n of NINJA) expect({ id: n.id, later: notYet(n.id) }).toEqual({ id: n.id, later: undefined })
  })

  test('random switches to someone new', async ($, on) => {
    const { saved, start } = session(on)
    await start($)
    for (let i = 0; i < 5; i++) {
      const was = saved.get('hero')
      const res = await ninja($, 'random')
      const now = byId(String(saved.get('hero')))
      expect(now.id).not.toBe(was)
      expect(res).toBe(`${now.name} steps in. "${now.quote}"`)
    }
  })

  test('offers its subcommands, the names and the jutsu as you type', async ($, on) => {
    mock.store(on)
    on('prompt.autocomplete', () => ({ suggestions: [] }))
    const offered = async (text: string): Promise<string[]> => {
      const start = text.lastIndexOf(' ') + 1
      // (the engine's own call, which its typings leave out)
      const prompt = $.prompt as unknown as { autocomplete: (e: { text: string; cursor: number; token: string; start: number }) => Promise<{ suggestions: { text: string }[] }> }
      const res = await prompt.autocomplete({ text, cursor: text.length, token: text.slice(start), start })
      return res.suggestions.map(s => s.text)
    }
    expect(await offered('/ninja it')).toEqual(['itachi'])
    expect(await offered('/ninja l')).toEqual(['list', 'lee'])
    expect(await offered('/ninja ju')).toEqual(['jutsu'])
    expect(await offered('/ninja to')).toEqual(['obito'])
    expect(await offered('/ninja jutsu 2')).toEqual(['2'])
    expect(await offered('/ninja jutsu k')).toEqual(['3'])
    // (quiet takes no word after it)
    expect(await offered('/ninja quiet o')).toEqual([])
    expect(await offered('/ninja of')).toEqual(['off'])
    expect(await offered('/ninja on')).toEqual(['on'])
    expect(await offered('/ninja one')).toEqual(['gaara'])
    expect(await offered('/ninja same')).toEqual(['kisame'])
    expect(await offered('/ninja sasuke x')).toEqual([])
    expect(await offered('/other it')).toEqual([])
  })

  test('quiet turns the jutsu off while Claude works and leaves the spinner and footer alone, and is remembered', async ($, on) => {
    const { saved, start } = session(on)
    let word = ''
    on('ui.render', { component: 'Spinner' }, ($, e) => {
      word = e.props.word
      return $.ui.resolve(e).Text({ children: e.props.word })
    })
    let past = ''
    on('ui.render', { component: 'TurnDuration' }, ($, e) => {
      past = e.props.word
      return $.ui.resolve(e).Text({ children: e.props.word })
    })
    await start($)
    const footer = async (): Promise<string> => {
      const ui = await $.ui.mount({ plugin: 'naruto', component: 'TurnDuration', props: { word: 'Cooked', durationMs: 4200 }, surface: 'terminal' } as never)
      await ui.unmount()
      return past
    }
    expect(byId('kakashi').past).toContain(await footer())
    expect(await ninja($, 'quiet')).toBe('Kakashi keeps calm: no jutsu while Claude works,\nand the spinner keeps its own words. /ninja on brings the jutsu back.')
    expect(saved.get('quiet')).toBe(true)
    const ui = await $.ui.mount({ ...spinner(), surface: 'terminal' })
    expect(word).toBe('Sauteing')
    await ui.unmount()
    expect(await footer()).toBe('Cooked')
    expect(await ninja($, '')).toEndWith('\nQuiet: no jutsu. /ninja on brings them back.')
    // quiet again is no toggle
    expect(await ninja($, 'quiet')).toBe('Kakashi is already keeping quiet. /ninja on brings the jutsu back.')
    expect(saved.get('quiet')).toBe(true)
    // on: the full ninja
    expect(await ninja($, 'on')).toBe('Kakashi is back, jutsu and all.')
    expect(saved.get('quiet')).toBe(false)
    expect(await ninja($, '')).not.toContain('Quiet')
    expect(await footer()).not.toBe('Cooked')
    // the old words still work, without a word of their own
    expect(await ninja($, 'quiet on')).toStartWith('Kakashi keeps calm')
    expect(await ninja($, 'quiet off')).toBe('Kakashi is back, jutsu and all.')
    expect(await ninja($, 'quiet off')).toBe('Kakashi is already here.')
  })

  test('three plain modes: on is the full ninja from either of the others, quiet shows a hidden ninja calm, off keeps quiet for later', async ($, on) => {
    const { saved, start } = session(on)
    on('ui.blit', () => ({ value: {} }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const mode = async (): Promise<string> => {
      const ui = await $.ui.mount({ ...band(20), surface: 'terminal' })
      const seen = (await ui.find({ key: 'ninja' })) !== undefined
      await ui.unmount()
      return `${seen ? 'seen' : 'hidden'}${saved.get('quiet') === true ? '+quiet' : ''}`
    }
    expect(await mode()).toBe('seen')
    await ninja($, 'quiet')
    expect(await mode()).toBe('seen+quiet')
    // out of sight, quiet is kept for later, and only the hiding is said
    await ninja($, 'off')
    expect(await mode()).toBe('hidden+quiet')
    expect((await ninja($, '')).split('\n').slice(4)).toEqual(['Kakashi is out of sight: /ninja on brings them back.'])
    // quiet brings them back, still calm
    expect(await ninja($, 'quiet')).toStartWith('Kakashi keeps calm')
    expect(await mode()).toBe('seen+quiet')
    // and on, from hidden and quiet both, the full ninja
    await ninja($, 'stop')
    expect(await ninja($, 'show')).toBe('Kakashi is back, jutsu and all.')
    expect(await mode()).toBe('seen')
    // remembered by the next session
    await ninja($, 'quiet')
    await ninja($, 'hide')
    await start($)
    expect(await mode()).toBe('hidden+quiet')
    expect(await ninja($, 'on')).toBe('Kakashi is back, jutsu and all.')
    expect(await mode()).toBe('seen')
  })
})

// ---------------------------------------------------------------- the first session

describe('the first session', () => {
  // the cells of every frame of a ninja's signature jutsu
  const signatureFrames = (id: string): Set<string> => {
    const out = new Set<string>()
    const index = signature(id)
    for (let t = 0; t < totalOf(moveOf(id, index)); t += 0.1) out.add(base64(pixelCells(moveState(id, index, t), byId(id).glow, SPRITE.columns, SPRITE.rows)))
    return out
  }
  // what the band shows over `seconds`
  const watch = async ($: Engine, on: On, entries: Record<string, unknown>) => {
    const blits: string[] = []
    on('ui.blit', ($, e) => {
      if ('cells' in e) blits.push(e.cells)
      return { value: {} }
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const s = session(on, entries)
    await s.start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal', viewport: { columns: 120, rows: 60, isFullscreen: false } })
    for (let i = 0; i < 70; i++) await s.clock.advance(100)
    await ui.unmount()
    return { saved: s.saved, suggested: s.suggested, blits }
  }

  test('arrives, cheers, plays the signature jutsu, suggests /ninja list, and does it once', async ($, on) => {
    const { saved, suggested, blits } = await watch($, on, {})
    const frames = signatureFrames('kakashi')
    expect(blits.filter(b => frames.has(b)).length).toBeGreaterThan(5)
    expect(suggested).toEqual(['/ninja list'])
    expect(saved.get('welcomed')).toBe(true)
  })

  test('a returning ninja just stands there', async ($, on) => {
    const { suggested, blits } = await watch($, on, { hero: 'kakashi', welcomed: true })
    const frames = signatureFrames('kakashi')
    expect(blits.filter(b => frames.has(b)).length).toBe(0)
    expect(suggested).toEqual([])
  })
})

// ---------------------------------------------------------------- Claude's work

describe("Claude's work", () => {
  test("an event's change is drawn at once, not a tick later", async ($, on) => {
    const { start } = session(on)
    const blits: string[] = []
    on('ui.blit', ($, e) => {
      if ('cells' in e) blits.push(e.cells)
      return { value: {} }
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    on('tool.call', () => ({ result: {}, text: 'ok' }) as never)
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal', viewport: { columns: 120, rows: 60, isFullscreen: false } })
    // (the picture drawn has shown a while: a wait on the wall clock, which events read)
    const shown = (ms: number): void => {
      for (const until = Date.now() + ms; Date.now() < until; );
    }
    shown(70)
    // with no tick since: the command's quick strike, its first frame
    await $.tool.call({ tool: 'Bash', command: 'make' } as never)
    expect(blits).toEqual([base64(pixelCells(moveState('kakashi', QUICK_INDEX, 0), byId('kakashi').glow, SPRITE.columns, SPRITE.rows))])
    await ui.unmount()
  })

  test("an event's change waits until the picture before it has shown a frame's time", async ($, on) => {
    const { clock, start } = session(on)
    const blits: string[] = []
    on('ui.blit', ($, e) => {
      if ('cells' in e) blits.push(e.cells)
      return { value: {} }
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    on('tool.call', () => ({ result: {}, text: 'ok' }) as never)
    on('classic.PermissionRequest', () => ({}))
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal', viewport: { columns: 120, rows: 60, isFullscreen: false } })
    const shown = (ms: number): void => {
      for (const until = Date.now() + ms; Date.now() < until; );
    }
    shown(70)
    // a read: the ninja ponders, at once
    await $.tool.call({ tool: 'Read', file_path: '/work/a.ts' } as never)
    expect(blits.length).toBe(1)
    // a dialog straight after: its "!" once the pondering has shown a while
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'make' } })
    expect(blits.length).toBe(1)
    await clock.advance(70)
    expect(blits.length).toBe(2)
    await ui.unmount()
  })

  test('a tool call and its result pass through untouched', async ($, on) => {
    on('tool.call', () => ({ result: { stdout: 'ok', stderr: '' }, text: 'ok' }) as never)
    const ran = await $.tool.call({ tool: 'Bash', command: 'echo ok' } as never)
    expect(ran).toMatchObject({ text: 'ok' })
  })

  test('the spinner speaks like the chosen ninja', async ($, on) => {
    let word = ''
    on('ui.render', { component: 'Spinner' }, ($, e) => {
      word = e.props.word
      return $.ui.resolve(e).Text({ children: e.props.word })
    })
    const ui = await $.ui.mount({ ...spinner('thinking'), surface: 'terminal' })
    expect(word).not.toBe('Sauteing')
    expect(spoken(byId('kakashi')).has(word)).toBe(true)
    await ui.unmount()
  })

  test("the desktop's spinner says what Claude's step is doing, untouched", async ($, on) => {
    let word = ''
    on('ui.render', { component: 'Spinner' }, ($, e) => {
      word = e.props.word
      return $.ui.resolve(e).Text({ children: e.props.word })
    })
    const ui = await $.ui.mount({ ...spinner(), surface: 'desktop' })
    expect(word).toBe('Sauteing')
    await ui.unmount()
  })

  // the spinner's words while a command runs ten seconds: its quick strike,
  // then its jutsu (called once it has run SHELL_JUTSU), played out
  const shouts = async ($: Engine, on: On, settings: Record<string, unknown> = {}): Promise<string[]> => {
    const { clock, start } = session(on, { hero: 'kakashi', welcomed: true }, settings)
    let finish = (): void => {}
    on('tool.call', () => new Promise(r => (finish = () => r({ result: { stdout: 'ok', stderr: '' }, text: 'ok' } as never))) as never)
    on('ui.blit', () => ({ value: {} }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const words: string[] = []
    on('ui.render', { component: 'Spinner' }, ($, e) => {
      words.push(`${e.props.word}${e.props.suffix}`)
      return $.ui.resolve(e).Text({ children: e.props.word })
    })
    await start($)
    const working = await $.ui.mount({ ...band(20, 120, { isWorking: true }), surface: 'terminal' })
    const ui = await $.ui.mount({ ...spinner(), surface: 'terminal' })
    const ran = $.tool.call({ tool: 'Bash', command: 'npm test' } as never)
    for (let i = 0; i < 100; i++) await clock.advance(100)
    finish()
    await ran
    await ui.unmount()
    await working.unmount()
    return words
  }

  test('the spinner shouts the jutsu as it lands, and only then', async ($, on) => {
    const words = await shouts($, on)
    const shout = `${moveOf('kakashi', signature('kakashi')).shout}!`
    expect(words[0]).not.toBe(shout)
    expect(words).toContain(shout)
    expect(words[words.length - 1]).not.toBe(shout)
    // the command's quick strike shouts first, the jutsu only once it is called
    const strike = `${playOf('kakashi', QUICK_INDEX)!.shout.replace(/!+$/, '')}!`
    expect(words).toContain(strike)
    expect(words.indexOf(strike)).toBeLessThan(words.indexOf(shout))
  })

  test('with reduced motion, no jutsu and no shouts', async ($, on) => {
    const words = await shouts($, on, { prefersReducedMotion: true })
    expect(words.some(w => w.endsWith('!'))).toBe(false)
  })

  test('a permission dialog finds its call by the agent and the input, among calls alike', async ($, on) => {
    const { start } = session(on)
    on('classic.PermissionRequest', () => ({}))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const pending: (() => void)[] = []
    on('tool.call', () => new Promise(r => pending.push(() => r({ result: {}, text: 'ok' } as never))) as never)
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    const caption = async (): Promise<string> => {
      await ui.redraw()
      return String((await ui.find({ type: 'Svg' }))?.props['alt'])
    }
    // two subagents run the same command, a third another
    const a = $.tool.call({ tool: 'Bash', command: 'npm test', agentId: 'agent-1' } as never)
    const b = $.tool.call({ tool: 'Bash', command: 'npm test', agentId: 'agent-2' } as never)
    const c = $.tool.call({ tool: 'Bash', command: 'ls', agentId: 'agent-2' } as never)
    // the first subagent's asks
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'npm test' }, agent_id: 'agent-1' } as never)
    expect(await caption()).toBe('Kakashi Hatake, Claude needs you')
    // the others end: still waiting
    pending[1]!()
    pending[2]!()
    await Promise.all([b, c])
    expect(await caption()).toBe('Kakashi Hatake, Claude needs you')
    // approved: it runs and ends, and the "!" with it
    pending[0]!()
    await a
    expect(await caption()).toBe('Kakashi Hatake')
    await ui.unmount()
  })

  test('your "no" at a permission dialog is not a failure: no frown, no sweat drop', async ($, on) => {
    const { start, clock } = session(on)
    const drops: boolean[] = []
    on('ui.blit', ($, e) => {
      if ('cells' in e) {
        const bytes = Uint8Array.from(atob(e.cells), ch => ch.charCodeAt(0))
        const words = new Uint32Array(bytes.buffer)
        // the sweat drop's blue
        drops.push(words.some((w, i) => i % 3 !== 0 && w === 0x5aa8f0))
      }
      return { value: {} }
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    let answer: Record<string, unknown> = {}
    on('tool.call', () => answer as never)
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'terminal', viewport: { columns: 120, rows: 60, isFullscreen: false } })
    const after = async (result: Record<string, unknown>): Promise<boolean> => {
      answer = result
      drops.length = 0
      // (an edit, whose failure is one to sweat at)
      await $.tool.call({ tool: 'Edit', file_path: '/work/a.ts', old_string: 'a', new_string: 'b' } as never)
      for (let i = 0; i < 10; i++) await clock.advance(100)
      return drops.some(Boolean)
    }
    // a "no", a "no" with words for Claude, Esc at the dialog, a rule of yours
    for (const text of [
      "The user doesn't want to proceed with this tool use. The tool use was rejected.",
      "The user doesn't want to proceed with this tool use. The tool use was rejected (eg. if it was a file edit, the new_string was NOT written to the file). To tell you how to proceed, the user said:\nuse pnpm",
      "The user doesn't want to take this action right now. STOP what you are doing and wait for the user to tell you how to proceed.",
      '[Request interrupted by user for tool use]',
      'Permission to use Bash with command rm -rf build has been denied.',
    ]) {
      expect({ text, sweats: await after({ result: {}, text, isError: true }) }).toEqual({ text, sweats: false })
      for (let i = 0; i < 40; i++) await clock.advance(100)
    }
    // a real failure still sweats
    expect(await after({ result: {}, text: 'String to replace not found in file.', isError: true })).toBe(true)
    await ui.unmount()
  })

  test('an approved command that runs on has its answer as soon as its progress row is drawn', async ($, on) => {
    const { start } = session(on)
    on('classic.PermissionRequest', () => ({}))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    on('ui.render', { component: 'ToolProgress' }, ($, e) => $.ui.resolve(e).Text({ children: e.props.hint }))
    let finish = (): void => {}
    let id = ''
    on('tool.call', ($, e) => {
      id = e.tool_use_id
      return new Promise(r => (finish = () => r({ result: {}, text: 'ok' } as never))) as never
    })
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    const caption = async (): Promise<string> => {
      await ui.redraw()
      return String((await ui.find({ type: 'Svg' }))?.props['alt'])
    }
    const run = $.tool.call({ tool: 'Bash', command: 'npm run build' } as never)
    await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'npm run build' } })
    expect(await caption()).toBe('Kakashi Hatake, Claude needs you')
    // another call's row is not this one's answer
    const other = await $.ui.mount({ plugin: 'naruto', component: 'ToolProgress', props: { tool_use_id: 'toolu_other', kind: 'background_hint', hint: '(ctrl+b to run in background)' }, surface: 'terminal' } as never)
    expect(await caption()).toBe('Kakashi Hatake, Claude needs you')
    await other.unmount()
    // the build's own row: it runs, so you have answered
    expect(id).not.toBe('')
    const row = await $.ui.mount({ plugin: 'naruto', component: 'ToolProgress', props: { tool_use_id: id, kind: 'background_hint', hint: '(ctrl+b to run in background)' }, surface: 'terminal' } as never)
    expect(await caption()).not.toContain('needs you')
    await row.unmount()
    finish()
    await run
    await ui.unmount()
  })
})

// ---------------------------------------------------------------- the companion

describe('the companion', () => {
  test('a command calls the signature jutsu, and its name is shouted only as it lands', () => {
    const c = new Companion(byId('kakashi'))
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    const m = moveOf('kakashi', signature('kakashi'))
    // (once it has run SHELL_JUTSU)
    const at = untilJutsu(c)
    expect(at).toBeGreaterThanOrEqual(SHELL_JUTSU - 1e-6)
    expect(at).toBeLessThan(SHELL_JUTSU + 0.1)
    expect(c.state().move?.index).toBe(signature('kakashi'))
    expect(c.shout()).toBeNull()
    let shouted = 0
    let steps = 0
    for (let t = 0; t < totalOf(m); t += 0.05) {
      c.update(0.05)
      steps++
      const s = c.shout()
      if (s !== null) {
        expect(s).toBe(m.shout)
        shouted++
      }
    }
    expect(shouted).toBeGreaterThan(5)
    expect(shouted).toBeLessThan(steps / 2)
    expect(c.shout()).toBeNull()
  })

  test('a quick command, done before SHELL_JUTSU, plays its quick strike and never a jutsu', () => {
    for (const id of ['kakashi', 'naruto', 'guy'])
      for (const lasts of [0, 1, SHELL_JUTSU - 0.1]) {
        const c = new Companion(byId(id))
        c.prompt()
        c.setWorking(true)
        c.toolStart('1', 'Bash')
        expect({ id, lasts, move: c.state().move?.index }).toEqual({ id, lasts, move: QUICK_INDEX })
        const seen = starts(c, lasts)
        c.toolEnd('1', false)
        // nor any move after it, however long the turn goes on
        seen.push(...starts(c, 60))
        expect({ id, lasts, seen }).toEqual({ id, lasts, seen: [] })
      }
  })

  test('a command that runs SHELL_JUTSU or longer: its quick strike, then its jutsu once, the jutsu shouted only as it lands', () => {
    const c = new Companion(byId('kakashi'))
    const m = moveOf('kakashi', signature('kakashi'))
    const strike = playOf('kakashi', QUICK_INDEX)!.shout.replace(/!+$/, '')
    c.prompt()
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    expect(c.state().move?.index).toBe(QUICK_INDEX)
    // half a minute of it, a tick at a time: the moves that start, and what the spinner shouts
    const seen: { at: number; index: number }[] = []
    const heard: { at: number; shout: string }[] = []
    let was = c.state().move
    for (let t = 0.05; t < 30; t += 0.05) {
      c.update(0.05)
      const mv = c.state().move
      if (mv && (was === null || mv.t < was.t || mv.index !== was.index)) seen.push({ at: t, index: mv.index })
      was = mv
      const s = c.shout()
      if (s !== null) heard.push({ at: t, shout: s })
    }
    c.toolEnd('1', false)
    // the signature at SHELL_JUTSU, and not again at five or six seconds, nor
    // any time on until a long call's repeat
    expect(seen.map(s => s.index)).toEqual([signature('kakashi')])
    const at = seen[0]!.at
    expect(at).toBeGreaterThanOrEqual(SHELL_JUTSU - 1e-6)
    expect(at).toBeLessThan(SHELL_JUTSU + 0.1)
    // before it, the strike's own shout and nothing else
    expect(heard.some(h => h.shout === strike)).toBe(true)
    expect(heard.filter(h => h.at < at).map(h => h.shout)).toEqual(heard.filter(h => h.at < at).map(() => strike))
    // the jutsu's name only as it lands: from its first shouted frame on, inside the jutsu
    let first = 0
    while (first < totalOf(m) && shoutAt(m, frameTime(first)) === null) first = Math.round((first + 0.1) * 10) / 10
    const named = heard.filter(h => h.shout === m.shout)
    expect(named.length).toBeGreaterThan(5)
    expect(named[0]!.at).toBeGreaterThanOrEqual(at + first - 0.06)
    expect(named[named.length - 1]!.at).toBeLessThan(at + totalOf(m))
  })

  test('a stream of quick commands strikes at most once in eight seconds, as often as that allows, and calls no jutsu', () => {
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    // a command every two seconds for a minute, each done in one
    const seen: { at: number; index: number }[] = []
    for (let k = 0; k < 30; k++) {
      const before = c.state().move
      c.toolStart(`b${k}`, 'Bash')
      const now = c.state().move
      if (now && (before === null || now.index !== before.index || now.t < before.t)) seen.push({ at: k * 2, index: now.index })
      seen.push(...starts(c, 1).map(s => ({ ...s, at: s.at + k * 2 })))
      c.toolEnd(`b${k}`, false)
      seen.push(...starts(c, 1).map(s => ({ ...s, at: s.at + k * 2 + 1 })))
    }
    // only strikes: the first command's, then the first command's eight seconds on or after
    const strikes = seen.filter(s => s.index === QUICK_INDEX).map(s => s.at)
    expect(seen.length).toBe(strikes.length)
    expect(strikes[0]).toBe(0)
    expect(strikes.length).toBeGreaterThanOrEqual(6)
    for (let i = 1; i < strikes.length; i++) {
      expect(strikes[i]! - strikes[i - 1]!).toBeGreaterThanOrEqual(QUICK_EVERY - 0.1)
      expect(strikes[i]! - strikes[i - 1]!).toBeLessThanOrEqual(QUICK_EVERY + 2 + 0.1)
    }
    // and nothing once they stop
    expect(starts(c, 60)).toEqual([])
  })

  test('a quick command that fails fizzles its strike, then slumps; a long one fizzles its jutsu', () => {
    const quick = playOf('sasuke', QUICK_INDEX)!
    const fizzle = playOf('sasuke', FIZZLE_INDEX)!
    const m = moveOf('sasuke', signature('sasuke'))
    // it fails as it strikes, before the blow lands: the strike fizzles, then the slump
    const q = new Companion(byId('sasuke'))
    q.prompt()
    q.setWorking(true)
    q.toolStart('1', 'Bash')
    expect(q.state().move?.index).toBe(QUICK_INDEX)
    run(q, hitsOf(quick)[0]!.at / 2)
    q.toolEnd('1', true)
    expect(q.state()).toMatchObject({ move: { index: FIZZLE_INDEX, t: 0 }, badge: null })
    expect(q.shout()).toBeNull()
    run(q, totalOf(fizzle) + 0.05)
    expect(q.state()).toMatchObject({ move: null, badge: 'error', pose: 'slump', face: { mood: 'worried' } })
    expect(jutsuOnly(starts(q, 30))).toEqual([])
    // it fails once its strike is over, before SHELL_JUTSU: the slump at once, no fizzle and no jutsu
    const r = new Companion(byId('sasuke'))
    r.prompt()
    r.setWorking(true)
    r.toolStart('1', 'Bash')
    run(r, totalOf(quick) + 0.5)
    expect(r.state().move).toBeNull()
    r.toolEnd('1', true)
    expect(r.state()).toMatchObject({ move: null, badge: 'error', pose: 'slump' })
    expect(jutsuOnly(starts(r, 30))).toEqual([])
    // a long command fails as its jutsu gathers: the jutsu fizzles, then the slump
    const l = new Companion(byId('sasuke'))
    l.prompt()
    l.setWorking(true)
    l.toolStart('1', 'Bash')
    expect(untilJutsu(l)).toBeLessThan(SHELL_JUTSU + 0.1)
    run(l, hitsOf(m)[0]!.at / 2)
    l.toolEnd('1', true)
    expect(l.state()).toMatchObject({ move: { index: FIZZLE_INDEX, t: 0 }, badge: null })
    run(l, totalOf(fizzle) + 0.05)
    expect(l.state()).toMatchObject({ move: null, badge: 'error', pose: 'slump' })
  })

  test("the shout is the jutsu's short name, 24 characters at most, at its climax", () => {
    for (const n of NINJA)
      for (const m of [...movesOf(n.id), playOf(n.id, QUICK_INDEX)!]) {
        expect({ move: m.name, shout: m.shout, short: (m.shout ?? '').length > 0 && (m.shout ?? '').length <= 24 }).toEqual({ move: m.name, shout: m.shout, short: true })
        let any = false
        for (let t = 0; t < totalOf(m); t += 0.1) any ||= climax(m, frameTime(t))
        expect({ move: m.name, climax: any }).toEqual({ move: m.name, climax: true })
      }
  })

  test("the spinner's shout is each beat's own, else the jutsu's at its climax, never with a \"!\" of its own", () => {
    for (const n of NINJA)
      movesOf(n.id).forEach((m, i) => {
        const c = new Companion(n)
        c.perform(i)
        for (let t = 0; t < totalOf(m) - 0.05; t += 0.1) {
          const own = shoutAt(m, frameTime(t))
          const s = c.shout()
          expect({ move: m.name, t, s }).toEqual({ move: m.name, t, s: own ? own.replace(/!+$/, '') : null })
          if (s !== null) expect(s.endsWith('!')).toBe(false)
          c.update(0.1)
        }
      })
  })

  test('a subagent calls its summoning, and an edit a quick strike', () => {
    const agent = new Companion(byId('kakashi'))
    agent.toolStart('1', 'Agent')
    expect(agent.state().move?.index).toBe(movesOf('kakashi').findIndex(m => m.on?.includes('agent')))
    for (const id of ['sasuke', 'kakashi', 'hinata']) {
      const c = new Companion(byId(id))
      c.setWorking(true)
      c.toolStart('1', 'Edit')
      expect(c.state().move?.index).toBe(QUICK_INDEX)
      const quick = playOf(id, QUICK_INDEX)!
      expect(totalOf(quick)).toBeGreaterThanOrEqual(1.5)
      expect(totalOf(quick)).toBeLessThanOrEqual(2)
      let shouted = false
      for (let t = 0; t < totalOf(quick); t += 0.05) {
        c.update(0.05)
        shouted ||= c.shout() === quick.shout.replace(/!+$/, '')
      }
      expect(shouted).toBe(true)
    }
  })

  test('an edit strikes at most once in eight seconds, never waits, and does not tire the ninja', () => {
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    // an edit every three seconds for half a minute
    const seen: { at: number; index: number }[] = []
    for (let k = 0; k < 10; k++) {
      c.toolStart(`e${k}`, 'Edit')
      const now = c.state().move
      if (now?.t === 0) seen.push({ at: k * 3, index: now.index })
      c.toolEnd(`e${k}`, false)
      seen.push(...starts(c, 3).map(s => ({ ...s, at: s.at + k * 3 })))
    }
    const strikes = seen.filter(s => s.index === QUICK_INDEX).map(s => s.at)
    expect(strikes.length).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < strikes.length; i++) expect(strikes[i]! - strikes[i - 1]!).toBeGreaterThanOrEqual(QUICK_EVERY - 0.1)
    expect(jutsuOnly(seen).length).toBe(0)
    // the turn's first jutsu still come twelve seconds apart (commands long
    // enough to call theirs)
    c.toolStart('b1', 'Bash')
    expect(untilJutsu(c)).toBeLessThan(SHELL_JUTSU + 0.1)
    expect(c.state().move?.index).toBe(signature('naruto'))
    c.toolEnd('b1', false)
    run(c, 1)
    c.toolStart('b2', 'Bash')
    const next = jutsuOnly(starts(c, 15))
    expect(next.length).toBe(1)
    expect(next[0]!.at).toBeLessThan(JUTSU_EVERY - 1 + 0.2)
  })

  test("a subagent's command calls none, and its failure is not Claude's", () => {
    const c = new Companion(byId('kakashi'))
    c.toolStart('1', 'Bash', 'agent-1')
    expect(c.state().move).toBeNull()
    c.toolEnd('1', true)
    expect(c.state().badge).toBeNull()
  })

  test('a look in on a command already running calls no jutsu, however long it waits', () => {
    for (const tool of ['BashOutput', 'Monitor']) {
      const c = new Companion(byId('naruto'))
      c.setWorking(true)
      c.toolStart('1', tool)
      expect(c.state().move).toBeNull()
      expect(starts(c, 60).length).toBe(0)
    }
  })

  test('reads and searches call no jutsu: the ninja ponders, eyes awake', () => {
    const c = new Companion(byId('sasuke'))
    c.setWorking(true)
    c.toolStart('1', 'Read')
    expect(c.state()).toMatchObject({ move: null, pose: 'think', badge: 'read', face: { active: true } })
    c.toolEnd('1', false)
    c.toolStart('2', 'Grep')
    expect(c.state()).toMatchObject({ move: null, pose: 'think', badge: 'search' })
  })

  test('a prompt calls no jutsu, and between jutsu the hands weave signs, with no glow the renderer would not draw', () => {
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    const poses = new Set<string>()
    for (let s = 0; s < 60; s += 0.05) {
      c.update(0.05)
      const st = c.state()
      expect(st.move).toBeNull()
      poses.add(st.pose)
      // a glow outside a jutsu only if the renderer draws it
      if (st.aura > 0) expect(base64(pixelCells(st, byId('naruto').glow, SPRITE.columns, SPRITE.rows))).not.toBe(base64(pixelCells({ ...st, aura: 0 }, byId('naruto').glow, SPRITE.columns, SPRITE.rows)))
    }
    // the three signs and the arms crossed to wait
    expect([...poses].sort()).toEqual(['crossed', 'signs', 'signs2', 'signs3'])
  })

  // The runs of poses the working loop shows over `seconds`, at the pace the
  // companion asks for: a run of a pose, glowing or not (a flicker of chakra)
  type Run = { pose: string; glow: boolean; gaze: number; at: number; for: number }
  const loopRuns = (c: Companion, seconds: number): Run[] => {
    const runs: Run[] = []
    let t = 0
    let st = c.state()
    let run: Run = { pose: st.pose, glow: st.aura > 0, gaze: st.face.gaze[0], at: 0, for: 0 }
    while (t < seconds) {
      const dt = c.tickMs() / 1000
      c.update(dt)
      t += dt
      st = c.state()
      if (st.pose !== run.pose || (st.aura > 0) !== run.glow) {
        runs.push({ ...run, for: Math.round((t - run.at) * 100) / 100 })
        run = { pose: st.pose, glow: st.aura > 0, gaze: st.face.gaze[0], at: t, for: 0 }
      }
      if (st.pose === 'crossed' && st.face.gaze[0] < run.gaze) run.gaze = st.face.gaze[0]
    }
    return runs
  }

  test('the signs come in phrases: two to five quick changes, a hold with a breath, and a wait every three to five', () => {
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    const runs = loopRuns(c, 600).slice(1, -1)
    const SIGNS = new Set(['signs', 'signs2', 'signs3'])
    // a flicker of chakra (if the renderer draws a glow at rest): half a
    // second, then the sign held a moment more
    const flickers = runs.map((r, i) => ({ ...r, i })).filter(r => r.glow)
    for (const f of flickers) {
      expect(Math.abs(f.for - 0.5) < 0.03).toBe(true)
      expect(runs[f.i + 1]).toMatchObject({ pose: 'signs', glow: false })
      expect(Math.abs(runs[f.i + 1]!.for - 0.7) < 0.03).toBe(true)
    }
    const afterFlicker = new Set(flickers.map(f => f.i + 1))
    // a phrase: quick signs of 0.2 s (the last 0.3), then a hold of 1.4 to 2.2 s
    const holds = runs.filter((r, i) => r.pose === 'signs' && !r.glow && r.for > 0.5 && !afterFlicker.has(i))
    const quick = runs.filter(r => SIGNS.has(r.pose) && !r.glow && r.for <= 0.5)
    for (const r of quick) expect({ r, ok: Math.abs(r.for - 0.2) < 0.03 || Math.abs(r.for - 0.3) < 0.03 }).toEqual({ r, ok: true })
    for (const r of holds) expect({ r, ok: r.for >= 1.4 - 0.03 && r.for <= 2.2 + 0.03 }).toEqual({ r, ok: true })
    expect(new Set(holds.map(h => h.for)).size).toBeGreaterThan(3)
    // changes per phrase: its quick signs and the hold
    const phrases: number[] = []
    let n = 0
    for (const r of runs) {
      if (SIGNS.has(r.pose) && !r.glow && r.for <= 0.5) n++
      else if (n > 0) {
        phrases.push(n + 1)
        n = 0
      }
    }
    expect(phrases.length).toBeGreaterThan(100)
    for (const k of phrases) expect(k >= 2 && k <= 5).toBe(true)
    expect(new Set(phrases).size).toBeGreaterThan(1)
    // the waits: arms crossed 2.4 to 3.2 s with a glance at the post, or the
    // flicker, three to five phrases apart
    const waits = runs.map((r, i) => ({ ...r, i })).filter(r => r.pose === 'crossed' || r.glow)
    expect(waits.length).toBeGreaterThan(10)
    for (const w of waits.filter(r => r.pose === 'crossed')) {
      expect(w.for).toBeGreaterThanOrEqual(2.4 - 0.03)
      expect(w.for).toBeLessThanOrEqual(3.2 + 0.03)
      expect(w.gaze).toBeLessThan(-0.5)
    }
    for (let k = 1; k < waits.length; k++) {
      const between = runs.slice(waits[k - 1]!.i + 1, waits[k]!.i).filter(r => holds.includes(r)).length
      expect({ k, between, ok: between >= 3 && between <= 5 }).toEqual({ k, between, ok: true })
    }
    // far calmer than a change every half second
    expect(runs.length / 10).toBeLessThan(90)
  })

  test('at the pace the companion asks for, no phrase loses a sign and no breath is held over', () => {
    // a clock that wakes exactly when asked, as a test's mock clock does
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    const seen = new Map<number, number>()
    const planned = new Map<number, number>()
    let pose = c.state().pose
    for (let t = 0; t < 300; ) {
      const ms = c.tickMs()
      c.update(ms / 1000)
      t += ms / 1000
      const st = c.state()
      const phrase = (c as unknown as { signs: { phrase: { k: number; kind: string; poses: readonly string[] } } }).signs.phrase
      // (a wait crosses the arms; a flicker keeps the sign)
      planned.set(phrase.k, phrase.kind === 'signs' ? phrase.poses.length + 1 : phrase.kind === 'cross' ? 1 : 0)
      if (st.pose !== pose) seen.set(phrase.k, (seen.get(phrase.k) ?? 0) + 1)
      pose = st.pose
    }
    // every whole phrase shows each of its changes (the last may be cut short)
    const ks = [...planned.keys()].slice(0, -1)
    expect(ks.length).toBeGreaterThan(80)
    expect(ks.filter(k => (seen.get(k) ?? 0) !== planned.get(k))).toEqual([])
    // at rest, the breath turns every 1.3 s
    c.turnEnd(true)
    c.setWorking(false)
    run(c, 10)
    let bob = c.state().bob
    let since = 0
    let longest = 0
    for (let t = 0; t < 120; ) {
      const ms = c.tickMs()
      c.update(ms / 1000)
      t += ms / 1000
      since += ms / 1000
      const st = c.state()
      // (the cheer and its soft cue have bounces of their own)
      if (st.move || (st.pose !== 'idle' && st.pose !== 'crossed')) {
        since = 0
        bob = st.bob
        continue
      }
      if (st.bob !== bob) {
        longest = Math.max(longest, since)
        since = 0
        bob = st.bob
      }
    }
    expect(Math.abs(longest - 1.3)).toBeLessThan(0.06)
  })

  test('no change shows before the wake the companion asks for, through a whole session', () => {
    // A copy of the companion stepped 10 ms at a time across each wait longer
    // than a frame shows the same picture until the wait ends: a beat that
    // state() draws but tickMs() forgot would show here, drawn late.
    const fork = (c: Companion): Companion => {
      const k = Object.create(Object.getPrototypeOf(c)) as Record<string, unknown>
      for (const [f, v] of Object.entries(c)) k[f] = v !== null && typeof v === 'object' && !(v instanceof Map) && !Array.isArray(v) ? Object.assign(Object.create(Object.getPrototypeOf(v) as object), v) : v
      return k as unknown as Companion
    }
    const late: string[] = []
    for (const id of ['naruto', 'gaara']) {
      const c = new Companion(byId(id))
      let at = 0
      const wait = (seconds: number): void => {
        for (const end = at + seconds; at < end; ) {
          const ms = c.tickMs()
          if (ms > 100) {
            const k = fork(c)
            const before = keyOf(k.state())
            for (let s = 10; s < ms - 10; s += 10) {
              k.update(0.01)
              const now = keyOf(k.state())
              if (now !== before) {
                late.push(`${id} at ${at.toFixed(2)} s: waits ${ms} ms, changes at ${s} ms: ${before} -> ${now}`)
                break
              }
            }
          }
          c.update(ms / 1000)
          at += ms / 1000
        }
      }
      c.prompt()
      c.setWorking(true)
      c.setThinking(true)
      wait(3)
      c.setThinking(false)
      c.toolStart('r', 'Read')
      wait(2)
      c.toolEnd('r', false)
      c.toolStart('e', 'Edit')
      wait(1)
      c.toolEnd('e', false)
      c.toolStart('b', 'Bash')
      wait(40)
      c.toolEnd('b', false)
      c.toolStart('f', 'Bash')
      wait(2)
      c.toolEnd('f', true)
      wait(5)
      c.toolStart('a', 'Agent')
      for (let n = 0; n < 6; n++) c.toolStart(`s${n}`, 'Grep', `sub${n}`)
      wait(30)
      for (let n = 0; n < 6; n++) c.toolEnd(`s${n}`, false)
      c.toolEnd('a', false)
      c.toolStart('q', 'Bash', undefined, { command: 'x' })
      c.permission('Bash', { command: 'x' })
      wait(3)
      c.running('q')
      wait(2)
      c.toolEnd('q', false)
      c.turnEnd(true)
      c.setWorking(false)
      wait(320)
      c.prompt()
      wait(5)
    }
    expect(late.slice(0, 3)).toEqual([])
  })

  test('at rest, at work and thinking, every clock keeps to the frame grid: no picture shows for less than a frame', () => {
    // the companion at the pace it asks for, events landing off the grid: each
    // picture it shows, from the wake (or the event) that brought it
    const c = new Companion(byId('naruto'))
    const shown: { at: number; key: string; tick: number; event: boolean }[] = []
    let at = 0
    const look = (event = false): void => {
      const st = c.state()
      const key = keyOf(st)
      if (shown.at(-1)?.key !== key) shown.push({ at, key, tick: st.badge === 'think' ? st.tick : -1, event })
    }
    const wait = (seconds: number): void => {
      for (const end = at + seconds; at < end; ) {
        const ms = c.tickMs()
        c.update(ms / 1000)
        at += ms / 1000
        look()
      }
    }
    const event = (fn: () => void): void => {
      c.update(0.037)
      at += 0.037
      fn()
      look(true)
    }
    look()
    wait(200)
    event(() => c.prompt())
    event(() => c.setWorking(true))
    wait(120)
    event(() => c.setThinking(true))
    wait(30)
    expect(shown.length).toBeGreaterThan(300)
    // (an event's own picture, and the one it cuts short, aside)
    const short = shown.slice(0, -1).filter((f, i) => !f.event && !shown[i + 1]!.event && shown[i + 1]!.at - f.at < 0.095)
    expect(short.map(f => `${f.at.toFixed(3)} ${f.key}`).slice(0, 3)).toEqual([])
    // the thinking dots, a step every 0.3 s
    const dots = shown.filter(f => f.tick >= 0)
    const steps = dots.slice(1).filter((f, i) => f.tick !== dots[i]!.tick)
    expect(steps.length).toBeGreaterThan(60)
    for (let i = 1; i < steps.length; i++) expect(Math.round((steps[i]!.at - steps[i - 1]!.at) * 10) / 10).toBe(0.3)
  })

  test('the body holds the signs or the pondering a second and a half before it swaps, the badge at once', () => {
    const c = new Companion(byId('kakashi'))
    c.quiet = true
    c.prompt()
    c.setWorking(true)
    run(c, 0.5)
    expect(c.state().pose).toBe('signs')
    // a read half a second in: the badge now, the pondering a second later
    c.toolStart('r', 'Read')
    expect(c.state()).toMatchObject({ pose: 'signs', badge: 'read' })
    run(c, 0.9)
    expect(c.state()).toMatchObject({ pose: 'signs', badge: 'read' })
    run(c, 0.2)
    expect(c.state()).toMatchObject({ pose: 'think', badge: 'read' })
    c.toolEnd('r', false)
    // a command at once: the body ponders on a while
    c.toolStart('b', 'Bash')
    expect(c.state()).toMatchObject({ pose: 'think', badge: 'shell' })
    run(c, 1.3)
    expect(c.state().pose).toBe('think')
    run(c, 0.3)
    expect(c.state()).toMatchObject({ pose: 'signs', badge: 'shell' })
  })

  test('the first three jutsu of a turn come twelve seconds apart, then slower, never the same twice running', () => {
    // (Guy's signature, five seconds long, is not his first jutsu)
    for (const id of ['naruto', 'guy']) {
      const c = new Companion(byId(id))
      c.prompt()
      c.setWorking(true)
      // the jutsu while a command starts every five seconds for `seconds`, each
      // running long enough to call its own; their quick strikes never hold
      // back a jutsu whose turn has come
      const stream = (name: string, seconds: number): { at: number; index: number }[] => {
        const out: { at: number; index: number }[] = []
        const runs = SHELL_JUTSU + 0.5
        for (let k = 0; k < seconds / 5; k++) {
          c.toolStart(`${name}${k}`, 'Bash')
          out.push(...starts(c, runs).map(s => ({ ...s, at: s.at + k * 5 })))
          c.toolEnd(`${name}${k}`, false)
          out.push(...starts(c, 5 - runs).map(s => ({ ...s, at: s.at + k * 5 + runs })))
        }
        return jutsuOnly(out)
      }
      const seen = stream('b', 600)
      // the first once the first command has run SHELL_JUTSU
      expect({ id, first: seen[0]!.at >= SHELL_JUTSU - 1e-6 && seen[0]!.at < SHELL_JUTSU + 0.1 }).toEqual({ id, first: true })
      const gaps = seen.slice(1).map((s, i) => s.at - seen[i]!.at)
      const want = [12, 12, 20, 20, 20, 30, 30, 30, 30, 45, 45, 45]
      want.forEach((g, i) => expect({ id, i, gap: gaps[i]!, ok: gaps[i]! >= g - 0.1 && gaps[i]! < g + 1.2 }).toEqual({ id, i, gap: gaps[i]!, ok: true }))
      for (let i = 1; i < seen.length; i++) expect(seen[i]!.index).not.toBe(seen[i - 1]!.index)
      // a command so soon after the signature calls another
      expect(seen[0]!.index).toBe(signature(id))
      expect(seen[1]!.index).not.toBe(signature(id))
      expect(seen[2]!.index).not.toBe(signature(id))
      expect(seen.length).toBeLessThan(20)
      // a new turn is fresh again: its first two jutsu twelve seconds apart
      c.turnEnd(true)
      c.prompt()
      run(c, 60)
      const fresh = stream('n', 30)
      expect(fresh[0]!.at).toBeLessThan(SHELL_JUTSU + 0.1)
      expect(fresh[1]!.at - fresh[0]!.at).toBeGreaterThanOrEqual(JUTSU_EVERY - 0.2)
      expect(fresh[1]!.at - fresh[0]!.at).toBeLessThan(JUTSU_EVERY + 1.2)
      // A command's strike never holds back a jutsu waiting its turn: a
      // command two seconds before that turn strikes not at all; three and a
      // half before, its strike is over, smoke and all, in time. Either way
      // the jutsu comes twelve seconds after the one before.
      for (const before of [2, 3.5]) {
        const w = new Companion(byId(id))
        w.prompt()
        w.setWorking(true)
        w.toolStart('1', 'Bash')
        expect(untilJutsu(w)).toBeLessThan(SHELL_JUTSU + 0.1)
        w.toolEnd('1', false)
        // a second command a second on: its jutsu, wanted SHELL_JUTSU in, waits its turn
        run(w, 1)
        w.toolStart('2', 'Bash')
        run(w, JUTSU_EVERY - 1 - before)
        w.toolEnd('2', false)
        w.toolStart('3', 'Bash')
        expect({ id, before, strikes: w.state().move?.index === QUICK_INDEX }).toEqual({ id, before, strikes: before > 3 })
        const next = jutsuOnly(starts(w, before + 1))
        expect({ id, before, on: next.length === 1 && next[0]!.at >= before - 0.1 && next[0]!.at < before + 0.15 }).toEqual({ id, before, on: true })
      }
    }
  })

  test('a call that comes sooner waits, the latest winning', () => {
    const c = new Companion(byId('kakashi'))
    c.setWorking(true)
    // a command calls its jutsu once it has run SHELL_JUTSU
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeLessThan(SHELL_JUTSU + 0.1)
    c.toolEnd('1', false)
    // a second does too, SHELL_JUTSU later: too soon, so it waits
    c.toolStart('2', 'Bash')
    run(c, SHELL_JUTSU + 0.05)
    c.toolEnd('2', false)
    // then a subagent's
    c.toolStart('3', 'Agent')
    c.toolEnd('3', false)
    const seen = jutsuOnly(starts(c, 30))
    expect(seen.length).toBe(1)
    expect(seen[0]!.at).toBeGreaterThanOrEqual(JUTSU_EVERY - SHELL_JUTSU - 0.05 - 0.1)
    expect(seen[0]!.at).toBeLessThan(JUTSU_EVERY - SHELL_JUTSU - 0.05 + 0.5)
    expect(seen[0]!.index).toBe(movesOf('kakashi').findIndex(m => m.on?.includes('agent')))
  })

  test('a long command shows a jutsu again every forty-five seconds, the next in turn', () => {
    const c = new Companion(byId('naruto'))
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    // its quick strike at once, then its jutsu once it has run SHELL_JUTSU
    expect(c.state().move?.index).toBe(QUICK_INDEX)
    const seen = jutsuOnly(starts(c, SHELL_JUTSU + 140))
    expect(seen[0]!.at).toBeLessThan(SHELL_JUTSU + 0.1)
    expect(seen[0]!.index).toBe(signature('naruto'))
    // then about 45, 90 and 135 seconds on
    expect(seen.length).toBe(4)
    seen.slice(1).forEach((s, i) => {
      expect(s.at - seen[i]!.at).toBeGreaterThanOrEqual(REPEAT - 0.1)
      expect(s.at - seen[i]!.at).toBeLessThan(REPEAT + 0.5)
      expect(s.index).not.toBe(seen[i]!.index)
    })
    c.toolEnd('1', false)
    expect(starts(c, 60).length).toBe(0)
  })

  test('in quiet mode, no jutsu while Claude works and no training, but one asked for plays', () => {
    const c = new Companion(byId('naruto'))
    c.quiet = true
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    c.toolStart('2', 'Edit')
    expect(c.state().move).toBeNull()
    // and the hands hold one sign, just breathing
    const poses = new Set<string>()
    const bobs = new Set<number>()
    for (let s = 0; s < 45; s += 0.05) {
      c.update(0.05)
      expect(c.state().move).toBeNull()
      poses.add(c.state().pose)
      bobs.add(c.state().bob)
    }
    expect([...poses]).toEqual(['signs'])
    expect([...bobs].sort()).toEqual([0, 1])
    c.toolEnd('1', false)
    c.toolEnd('2', false)
    c.turnEnd(true)
    c.setWorking(false)
    expect(jutsuOnly(starts(c, 290, 0.1)).length).toBe(0)
    c.perform(2)
    expect(c.state().move?.index).toBe(2)
  })

  test('turning quiet on lets go of a jutsu waiting its turn and of a new ninja\'s signature; the move in hand plays out', () => {
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    // two commands a second apart: the first's jutsu in hand, the second's
    // waiting its turn, then /ninja quiet
    c.toolStart('1', 'Bash')
    run(c, 1)
    c.toolStart('2', 'Bash')
    expect(untilJutsu(c)).toBeLessThan(SHELL_JUTSU)
    run(c, 1.1)
    const inHand = c.state().move
    expect(inHand?.index).toBe(signature('naruto'))
    expect((c as unknown as { queued: unknown }).queued).not.toBeNull()
    c.prompt(false)
    c.quiet = true
    run(c, 0.5)
    expect(c.state().move?.index).toBe(inHand!.index)
    expect(jutsuOnly(starts(c, 30))).toEqual([])
    // a switch, then /ninja quiet during the hello
    c.quiet = false
    c.setNinja(byId('itachi'))
    run(c, 0.3)
    c.quiet = true
    expect(jutsuOnly(starts(c, 10))).toEqual([])
  })

  test('out of sight, no jutsu the work calls for, no strike, no training and no soft cue; the move in hand plays out, and one asked for plays', () => {
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    run(c, 1)
    // a second command a second after: the first's jutsu in hand, the
    // second's waiting its turn, then /ninja off
    c.toolStart('2', 'Bash')
    expect(untilJutsu(c)).toBeLessThan(SHELL_JUTSU)
    run(c, 1.1)
    expect((c as unknown as { queued: unknown }).queued).not.toBeNull()
    c.hidden = true
    expect(c.state().move?.index).toBe(signature('naruto'))
    c.toolStart('3', 'Edit')
    c.toolStart('4', 'Agent')
    // (the command runs past its repeat too)
    expect(starts(c, 60, 0.1)).toEqual([])
    for (const id of ['1', '2', '3', '4']) c.toolEnd(id, false)
    c.turnEnd(true)
    c.setWorking(false)
    run(c, 10, 0.1)
    expect(starts(c, 280, 0.1)).toEqual([])
    c.perform(2)
    expect(c.state().move?.index).toBe(2)
    // back in sight, the work calls jutsu again
    const d = new Companion(byId('naruto'))
    d.hidden = true
    d.setWorking(true)
    d.toolStart('1', 'Bash')
    expect(d.state().move).toBeNull()
    d.hidden = false
    d.toolStart('2', 'Bash')
    // a quick strike at once, a jutsu once the commands have run SHELL_JUTSU
    expect(d.state().move?.index).toBe(QUICK_INDEX)
    expect(untilJutsu(d)).toBeLessThan(SHELL_JUTSU + 0.1)
    expect(d.state().move?.index).toBe(signature('naruto'))
  })

  test('turning reduced motion on mid-jutsu ends it, and the eyes stop glancing', () => {
    const c = new Companion(byId('naruto'))
    c.prompt()
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    run(c, 0.5)
    expect(c.state().move?.index).toBe(signature('naruto'))
    c.reduced = true
    expect(c.state().move).toBeNull()
    const gazes = new Set<string>()
    for (let s = 0; s < 60; s += 0.1) {
      c.update(0.1)
      gazes.add(c.state().face.gaze.join(','))
    }
    expect([...gazes]).toEqual(['0,0'])
  })

  test('with reduced motion, poses and badges only: no jutsu, no shouts, no training', () => {
    const c = new Companion(byId('kakashi'))
    c.reduced = true
    c.toolStart('1', 'Bash')
    expect(c.state().move).toBeNull()
    expect(c.state().badge).toBe('shell')
    c.toolEnd('1', false)
    c.setNinja(byId('itachi'))
    expect(c.state().move).toBeNull()
    expect(c.state().pose).toBe(byId('itachi').cheer.pose)
    let moved = 0
    for (let s = 0; s < 400; s += 0.25) {
      c.update(0.25)
      if (c.state().move || c.shout() || c.state().bob) moved++
    }
    expect(moved).toBe(0)
  })

  test('a permission dialog stops the jutsu and holds the next until it is answered', () => {
    const c = new Companion(byId('kakashi'))
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    run(c, 0.5)
    c.permission('Bash')
    // the jutsu breaks off: up in the start, the post goes up in smoke, the "!" over it
    expect(c.state()).toMatchObject({ move: { index: DISPEL_INDEX, t: 0 }, pose: 'alert', badge: 'alert' })
    expect(c.shout()).toBeNull()
    expect(c.caption()).toBe('Kakashi Hatake, Claude needs you')
    run(c, totalOf(playOf('kakashi', DISPEL_INDEX)!) + 0.05)
    expect(c.state()).toMatchObject({ move: null, pose: 'alert', badge: 'alert' })
    // a second dialog does not dispel it again, nor does one with nothing playing
    c.permission('Bash')
    expect(c.state().move).toBeNull()
    run(c, 3)
    c.toolStart('2', 'Agent')
    expect(c.state().move).toBeNull()
    expect(c.state().badge).toBe('alert')
    run(c, 30)
    expect(c.state().move).toBeNull()
    // approved: the call that asked runs and ends, the "!" goes with it, and the waiting jutsu plays
    c.toolEnd('1', false)
    expect(c.state().badge).not.toBe('alert')
    run(c, 0.1)
    expect(c.state().move).not.toBeNull()
  })

  test("a command's wait at its permission dialog is not time running: its jutsu comes SHELL_JUTSU after you approve", () => {
    const c = new Companion(byId('kakashi'))
    c.prompt()
    c.setWorking(true)
    c.toolStart('b', 'Bash', undefined, { command: 'npm run build' })
    c.permission('Bash', { command: 'npm run build' })
    // ten seconds at the dialog: no jutsu
    expect(jutsuOnly(starts(c, 10))).toEqual([])
    // approved, its progress row drawn: it runs from now
    c.running('b')
    expect(c.calling()).toBe(false)
    const seen = jutsuOnly(starts(c, 10))
    expect(seen.map(s => s.index)).toEqual([signature('kakashi')])
    expect(seen[0]!.at).toBeGreaterThanOrEqual(SHELL_JUTSU - 1e-6)
    expect(seen[0]!.at).toBeLessThan(SHELL_JUTSU + 0.1)
  })

  test('the "!" holds for as long as Claude waits on you, past ten minutes, still and awake', () => {
    for (const ask of ['permission', 'AskUserQuestion', 'ExitPlanMode']) {
      const c = new Companion(byId('kakashi'))
      c.prompt()
      c.setWorking(true)
      c.toolStart('b', 'Bash', undefined, { command: 'rm -rf build' })
      if (ask === 'permission') c.permission('Bash', { command: 'rm -rf build' })
      else c.toolStart('q', ask)
      // the start, then a calm wait: no quick ticks once the surprise is over
      expect(c.state().pose).toBe('alert')
      run(c, 1)
      let wakes = 0
      let fast = 0
      for (let s = 0; s < 899; ) {
        const ms = c.tickMs()
        if (ms < 250) fast++
        wakes++
        c.update(ms / 1000)
        s += ms / 1000
        const st = c.state()
        expect({ ask, s, move: st.move, badge: st.badge }).toEqual({ ask, s, move: null, badge: 'alert' })
      }
      expect(c.calling()).toBe(true)
      expect(wakes).toBeLessThan(900 * 4)
      expect(fast).toBeLessThan(wakes / 2)
      // answered
      c.toolEnd(ask === 'permission' ? 'b' : 'q', false)
      expect(c.calling()).toBe(false)
    }
    // or you type, or the turn ends
    const typed = new Companion(byId('naruto'))
    typed.toolStart('q', 'AskUserQuestion')
    run(typed, 700, 0.5)
    typed.prompt()
    expect(typed.calling()).toBe(false)
    const ended = new Companion(byId('naruto'))
    ended.toolStart('q', 'AskUserQuestion')
    run(ended, 700, 0.5)
    ended.turnEnd(false)
    expect(ended.calling()).toBe(false)
    // a dialog that names no call it waits on still gives up in ten minutes
    const lost = new Companion(byId('naruto'))
    lost.permission('Bash')
    run(lost, 590, 0.5)
    expect(lost.calling()).toBe(true)
    run(lost, 20, 0.5)
    expect(lost.calling()).toBe(false)
  })

  test("a permission dialog waits on the very call it asks about, not the latest of the tool's", () => {
    const c = new Companion(byId('naruto'))
    c.setWorking(true)
    c.toolStart('main', 'Bash', undefined, { command: 'ls', description: 'list' })
    c.toolStart('a1', 'Bash', 'agent-1', { command: 'npm test' })
    c.toolStart('a2', 'Bash', 'agent-2', { command: 'npm test' })
    c.toolStart('a3', 'Bash', 'agent-2', { command: 'git push' })
    // agent-1's: the same input as agent-2's, told apart by the agent
    c.permission('Bash', { command: 'npm test' }, 'agent-1')
    c.toolEnd('a3', false)
    c.toolEnd('a2', false)
    expect(c.calling()).toBe(true)
    c.toolEnd('a1', false)
    expect(c.calling()).toBe(false)
    // Claude's own, its keys in any order
    c.permission('Bash', { description: 'list', command: 'ls' })
    c.toolStart('a4', 'Bash', 'agent-1', { command: 'ls' })
    c.toolEnd('a4', false)
    expect(c.calling()).toBe(true)
    c.toolEnd('main', false)
    expect(c.calling()).toBe(false)
  })

  test("a subagent's permission dialog ends with its call", () => {
    const c = new Companion(byId('naruto'))
    c.toolStart('a', 'WebFetch', 'agent-1')
    c.permission('WebFetch', undefined, 'agent-1')
    expect(c.state().badge).toBe('alert')
    c.toolEnd('a', false)
    expect(c.state().badge).not.toBe('alert')
  })

  test('a question or a plan to approve holds the "!" until it is answered, and replying clears any', () => {
    for (const tool of ['AskUserQuestion', 'ExitPlanMode']) {
      const c = new Companion(byId('naruto'))
      c.toolStart('q', tool)
      run(c, 30)
      expect(c.state().badge).toBe('alert')
      c.toolEnd('q', false)
      expect(c.state().badge).not.toBe('alert')
      c.permission('Bash')
      c.prompt()
      expect(c.state().badge).not.toBe('alert')
    }
  })

  test('the start at a call for you holds the eyes open a second, and does not breathe', () => {
    const c = new Companion(byId('kakashi'))
    run(c, 1.9)
    c.permission('Bash')
    for (let s = 0; s < 1; s += 0.05) {
      expect(c.state().face.blink).toBe(0)
      if (s < 0.85) expect(c.state()).toMatchObject({ pose: 'alert', bob: 0, face: { mood: 'surprised' } })
      c.update(0.05)
    }
  })

  test('cheers with its own cheer move, the ✓ over it, and the ✓ stays until the next prompt', () => {
    const c = new Companion(byId('naruto'))
    run(c, 3)
    c.turnEnd(true)
    const cheer = playOf('naruto', CHEER_INDEX)!
    const frames: ChibiState[] = []
    for (let s = 0; s < totalOf(cheer) - 0.01; s += 0.05) {
      frames.push(c.state())
      c.update(0.05)
    }
    expect(frames.every(f => f.badge === 'done')).toBe(true)
    expect(frames.every(f => f.face.mood === 'happy')).toBe(true)
    // the move as moves.ts plays it, from its first frame: a crouch, the cheer
    expect(frames.every(f => f.move?.index === CHEER_INDEX)).toBe(true)
    expect(frames[0]!.pose).toBe(poseAt(cheer, 0).pose)
    // the thumbs-up is the cheer's heart, and it ends at rest, not on a pop
    expect(frames.filter(f => f.pose === 'thumbs').length).toBeGreaterThan(frames.length / 4)
    expect(frames[frames.length - 1]!.pose).not.toBe('thumbs')
    run(c, 0.1)
    expect(c.state()).toMatchObject({ move: null })
    expect(c.state().pose).not.toBe('thumbs')
    // the ✓ stays, still, until you write again
    for (let s = 0; s < 50; s += 0.5) {
      run(c, 0.5)
      expect(c.state().badge).toBe('done')
    }
    c.prompt()
    expect(c.state().badge).toBeNull()
  })

  test('a cheer from a frame that already shows its pose does not dip out of it', () => {
    const cheer = playOf('gaara', CHEER_INDEX)!
    // Gaara's cheer is his arms folded, as he stands one moment in three at rest
    const c = new Companion(byId('gaara'))
    run(c, 23)
    expect(c.state().pose).toBe('crossed')
    c.turnEnd(true)
    const poses: string[] = []
    for (let i = 0; i < 200 && c.state().move?.index === CHEER_INDEX; i++) {
      poses.push(c.state().pose)
      c.update(0.05)
    }
    // straight into its hold, never out of the pose and back: the folded arms,
    // then the settle to rest the cheer ends on
    const held = poses.indexOf(poses.find(p => p !== 'crossed') ?? '')
    const hold = held === -1 ? poses.length : held
    expect(poses[0]).toBe('crossed')
    expect(hold).toBeGreaterThan(5)
    expect(poses.slice(hold)).not.toContain('crossed')
    // from the plain stance it crouches first
    const n = new Companion(byId('gaara'))
    run(n, 3)
    n.turnEnd(true)
    expect(n.state().pose).toBe(poseAt(cheer, 0).pose)
  })

  test('the ✓ goes when the ninja nods off', () => {
    const c = new Companion(byId('naruto'))
    c.turnEnd(true)
    run(c, 310, 0.25)
    expect(c.state().badge).toBe('sleep')
    c.prompt()
    run(c, 1)
    expect(c.state().badge).toBeNull()
  })

  test('an answer nobody replies to gets one soft cue a minute later: the cheer held, no leap, never the "!"; none when quiet or out of sight', () => {
    const watch = (set: (c: Companion) => void = () => undefined) => {
      const c = new Companion(byId('naruto'))
      set(c)
      c.turnEnd(true)
      let alerts = 0
      const cues: { s: number; badge: string | null; bob: number }[] = []
      const moves = new Set<number>()
      // (before the ninja first trains)
      for (let s = 0; s < 100; s += 0.05) {
        c.update(0.05)
        const st = c.state()
        if (st.badge === 'alert') alerts++
        if (s > 10 && st.pose === 'thumbs') cues.push({ s, badge: st.badge, bob: st.bob })
        if (s > 10 && st.move) moves.add(st.move.index)
      }
      return { alerts, cues, moves }
    }
    const { alerts, cues, moves } = watch()
    // no second leap: the pose held, breathing, the ✓ over it
    expect([...moves]).toEqual([])
    expect(alerts).toBe(0)
    expect(cues.length).toBeGreaterThan(20)
    expect(cues[0]!.s).toBeGreaterThanOrEqual(59)
    expect(cues[cues.length - 1]!.s - cues[0]!.s).toBeLessThan(CHEER)
    expect(cues.every(f => f.badge === 'done')).toBe(true)
    expect(new Set(cues.map(f => f.bob)).size).toBe(2)
    // in quiet mode, or out of sight, none
    expect(watch(c => (c.quiet = true)).cues).toEqual([])
    expect(watch(c => (c.hidden = true)).cues).toEqual([])
  })

  test('cheers in their own way, unlike standing still: a hello, an answer', () => {
    const cheers: Record<string, [Pose, Mood]> = {
      naruto: ['thumbs', 'happy'],
      sasuke: ['crossed', 'smug'],
      kakashi: ['scratch', 'happy'],
      shikamaru: ['scratch', 'calm'],
      gaara: ['crossed', 'calm'],
      itachi: ['raise', 'calm'],
      obito: ['raise', 'happy'],
      pain: ['spread', 'calm'],
      hinata: ['poke', 'happy'],
      deidara: ['raise', 'happy'],
      kisame: ['raise', 'smug'],
    }
    // (into the cheer's hold, past its crouch and hop)
    const into = 0.65
    for (const [id, [pose, mood]] of Object.entries(cheers)) {
      const c = new Companion(byId('naruto'))
      c.setNinja(byId(id))
      run(c, totalOf(playOf(id, ARRIVAL_INDEX)!) + into)
      expect({ id, pose: c.state().pose, mood: c.state().face.mood }).toEqual({ id, pose, mood })
      const done = new Companion(byId(id))
      done.turnEnd(true)
      run(done, into)
      expect({ id, pose: done.state().pose, mood: done.state().face.mood, badge: done.state().badge }).toEqual({ id, pose, mood, badge: 'done' })
    }
    // no cheer is the idle stance with a calm face, nor the hand sign the
    // working loop rests on (a cheer from it would skip into a hold of it)
    for (const n of NINJA) expect({ id: n.id, plain: (n.cheer.pose === 'idle' && n.cheer.mood === 'calm') || n.cheer.pose === 'signs' }).toEqual({ id: n.id, plain: false })
    // Itachi's, at the end of a turn of hand signs, crouches and leaps
    const itachi = new Companion(byId('itachi'))
    itachi.prompt()
    itachi.setWorking(true)
    run(itachi, 5)
    itachi.turnEnd(true)
    itachi.setWorking(false)
    expect(itachi.state()).toMatchObject({ move: { index: CHEER_INDEX, t: 0 }, pose: poseAt(playOf('itachi', CHEER_INDEX)!, 0).pose })
  })

  test('a new ninja arrives in a puff of smoke, cheers, then shows its signature jutsu, even mid-task', () => {
    const c = new Companion(byId('naruto'))
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    expect(c.state().move?.index).toBe(signature('naruto'))
    c.setNinja(byId('sasuke'))
    expect(c.state().move?.index).toBe(ARRIVAL_INDEX)
    expect(c.shout()).toBeNull()
    // nothing else cuts in during the hello
    c.toolStart('2', 'Bash')
    c.toolStart('3', 'Edit')
    const length = totalOf(playOf('sasuke', CHEER_INDEX)!)
    run(c, totalOf(playOf('sasuke', ARRIVAL_INDEX)!) + 0.05)
    expect(c.state().move?.index).toBe(CHEER_INDEX)
    // the whole cheer plays (it settles to rest in its own last frames)
    run(c, length - 0.2)
    expect(c.state().move?.index).toBe(CHEER_INDEX)
    // a breath between the cheer and the jutsu: out at once, half a second
    run(c, 0.3)
    expect(c.state()).toMatchObject({ move: null, pose: 'idle', bob: 1 })
    run(c, 0.1)
    expect(c.state().move).toBeNull()
    run(c, 0.4)
    expect(c.state().move?.index).toBe(signature('sasuke'))
  })

  test('after a jutsu with no cheer to follow, a breath out before the hands go back to work', () => {
    const c = new Companion(byId('kakashi'))
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    c.toolEnd('1', false)
    run(c, totalOf(moveOf('kakashi', signature('kakashi'))) + 0.05)
    expect(c.state()).toMatchObject({ move: null, pose: 'idle', bob: 1 })
    run(c, 0.25)
    expect(['signs', 'signs2', 'signs3']).toContain(c.state().pose)
  })

  // (a command calls its jutsu only once it has run SHELL_JUTSU, long after
  // a strike: a subagent calls its own at once)
  test('an edit then a subagent: the strike, a second at rest while the post\'s smoke clears, then the jutsu', () => {
    const quick = playOf('naruto', QUICK_INDEX)!
    const made = movesOf('naruto').findIndex(m => m.on?.includes('agent'))
    for (const after of [0.6, totalOf(quick) + 0.1]) {
      const c = new Companion(byId('naruto'))
      c.prompt()
      c.setWorking(true)
      c.toolStart('e', 'Edit')
      c.toolEnd('e', false)
      expect(c.state().move?.index).toBe(QUICK_INDEX)
      run(c, after)
      // the subagent, while the strike plays or just after it
      c.toolStart('a', 'Agent')
      let ended = -1
      let began = -1
      for (let s = after; s < 6 && began < 0; s += 0.05) {
        c.update(0.05)
        const st = c.state()
        if (ended < 0 && st.move === null) ended = s + 0.05
        if (ended >= 0 && st.move !== null) {
          began = s + 0.05
          expect(st.move.index).toBe(made)
        }
        // at rest meanwhile, never the hands at work
        if (ended >= 0 && began < 0) expect({ after, pose: st.pose }).toEqual({ after, pose: 'idle' })
      }
      expect({ after, rest: began - Math.max(ended, totalOf(quick)) >= 1 - 0.11 }).toEqual({ after, rest: true })
      expect(began - totalOf(quick)).toBeLessThan(1.3)
    }
  })

  test('the jutsu just played is not played again soon, but after a minute the signature comes back', () => {
    const c = new Companion(byId('kakashi'))
    const sig = signature('kakashi')
    c.prompt()
    c.setWorking(true)
    // (each command runs on until it calls its jutsu)
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    c.toolEnd('1', false)
    expect(c.state().move?.index).toBe(sig)
    run(c, 35 - SHELL_JUTSU)
    c.toolStart('2', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    c.toolEnd('2', false)
    expect(c.state().move?.index).not.toBe(sig)
    c.turnEnd(true)
    c.setWorking(false)
    run(c, 70)
    c.prompt()
    c.setWorking(true)
    c.toolStart('3', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    expect(c.state().move?.index).toBe(sig)
  })

  test('trains first two minutes after you leave, never within ninety seconds of an answer, and never asleep', () => {
    const c = new Companion(byId('kakashi'))
    c.prompt()
    c.setWorking(true)
    run(c, 5)
    c.setWorking(false)
    c.turnEnd(true)
    const seen = jutsuOnly(starts(c, 600, 0.1))
    expect(seen.length).toBeGreaterThanOrEqual(1)
    expect(seen[0]!.at).toBeGreaterThanOrEqual(120)
    expect(seen[0]!.at).toBeLessThan(150)
    // the next is three to four minutes on, unless the ninja has dozed off by then
    for (let i = 1; i < seen.length; i++) expect(seen[i]!.at - seen[i - 1]!.at).toBeGreaterThanOrEqual(180)
    for (const s of seen) expect(s.at).toBeLessThan(300)
    expect(c.state().pose).toBe('sleep')
  })

  test('an intro owed when the ninja nods off is forgotten', () => {
    const c = new Companion(byId('kakashi'))
    c.setNinja(byId('itachi'))
    // nobody answers
    c.permission('Bash')
    let played = 0
    for (let s = 0; s < 700; s += 0.05) {
      c.update(0.05)
      if (c.state().move) played++
    }
    expect(played).toBe(0)
    expect(c.state().pose).toBe('sleep')
  })

  test('slumps when a command, an edit or a subagent fails, whoever the ninja, and cheers at an answer once the jutsu in hand is done', () => {
    const slump = 'slump'
    for (const n of NINJA)
      for (const tool of ['Bash', 'Edit', 'Agent']) {
        const c = new Companion(n)
        // (in quiet mode, with no jutsu of the call's own to fizzle first)
        c.quiet = true
        c.toolStart('1', tool)
        c.toolEnd('1', true)
        // never the cheer's pose (Kakashi's and Shikamaru's is a scratch of the head)
        expect({ ...c.state(), who: n.id, tool }).toMatchObject({ who: n.id, tool, badge: 'error', pose: slump, face: { mood: 'worried' } })
      }
    // a read or a search that finds nothing, a page that will not load or a
    // look in on a command is no failure of Claude's: no slump, no sweat drop
    const c = new Companion(byId('kakashi'))
    for (const tool of ['Read', 'Grep', 'Glob', 'WebFetch', 'BashOutput', 'TodoWrite']) {
      c.toolStart(tool, tool)
      c.toolEnd(tool, true)
      expect({ tool, slumps: c.state().badge === 'error' || c.state().pose === slump }).toEqual({ tool, slumps: false })
    }
    run(c, 3)
    // a command runs on until it calls its jutsu, and the answer comes
    c.setWorking(true)
    c.toolStart('2', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    c.turnEnd(true)
    expect(c.state().move?.index).toBe(signature('kakashi'))
    run(c, totalOf(moveOf('kakashi', signature('kakashi'))) + 0.65)
    expect(c.state()).toMatchObject({ badge: 'done', pose: 'scratch', face: { mood: 'happy' } })
  })

  test('a command that fails before its blow lands makes the jutsu fizzle, then the slump', () => {
    const slump = 'slump'
    const m = moveOf('sasuke', signature('sasuke'))
    const hit = hitsOf(m)[0]!.at
    const c = new Companion(byId('sasuke'))
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    run(c, Math.min(1, hit / 2))
    c.toolEnd('1', true)
    const fizzle = playOf('sasuke', FIZZLE_INDEX)!
    // the post smokes out and the hands puff, nothing shouted, no sweat yet
    expect(c.state()).toMatchObject({ move: { index: FIZZLE_INDEX, t: 0 }, badge: null })
    expect(c.shout()).toBeNull()
    expect(c.caption()).toBe('Sasuke Uchiha')
    run(c, totalOf(fizzle) - 0.05)
    expect(c.state().move?.index).toBe(FIZZLE_INDEX)
    run(c, 0.1)
    expect(c.state()).toMatchObject({ move: null, badge: 'error', pose: slump, face: { mood: 'worried' } })
    expect(c.shout()).toBeNull()
  })

  test('a command that fails after the blow lands: the jutsu stops where it would recover, fizzles from its slump (never its seals again), then the slump', () => {
    const slump = 'slump'
    const fizzle = playOf('sasuke', FIZZLE_INDEX)!
    // the late fizzle is the fizzle's slump beat on
    const from = -sinceOf(fizzle, 0, 'slump')
    expect(from).toBeGreaterThan(0.2)
    const length = totalOf(fizzle) - from
    const m = moveOf('sasuke', signature('sasuke'))
    const hit = hitsOf(m)[0]!.at
    const recover = -sinceOf(m, 0, 'recover')
    const ends = Number.isFinite(recover) && recover > hit + 0.3 ? recover : totalOf(m)
    const late = new Companion(byId('sasuke'))
    late.setWorking(true)
    late.toolStart('1', 'Bash')
    expect(untilJutsu(late)).toBeGreaterThan(0)
    run(late, hit + 0.3)
    late.toolEnd('1', true)
    // the blow landed: the jutsu plays on, and no sweat yet
    expect(late.state()).toMatchObject({ move: { index: signature('sasuke') }, badge: null })
    run(late, ends - hit - 0.3 - 0.1)
    expect(late.state().move?.index).toBe(signature('sasuke'))
    run(late, 0.2)
    // where its recovery would begin, the slump and the post smoking out instead
    expect(late.state()).toMatchObject({ move: { index: FIZZLE_INDEX }, badge: null })
    expect(late.state().move!.t).toBeGreaterThanOrEqual(from - 1e-6)
    expect(poseAt(fizzle, late.state().move!.t).pose).toBe(slump)
    expect(late.shout()).toBeNull()
    run(late, length - 0.2)
    expect(late.state().move?.index).toBe(FIZZLE_INDEX)
    run(late, 0.2)
    expect(late.state()).toMatchObject({ move: null, badge: 'error', pose: slump, face: { mood: 'worried' } })
    // already recovering when it fails: the fizzle's slump at once
    const later = new Companion(byId('sasuke'))
    later.setWorking(true)
    later.toolStart('1', 'Bash')
    expect(untilJutsu(later)).toBeGreaterThan(0)
    run(later, Math.min(ends + 0.2, totalOf(m) - 0.2))
    later.toolEnd('1', true)
    expect(later.state().move?.index).toBe(FIZZLE_INDEX)
    expect(later.state().move!.t).toBeGreaterThanOrEqual(from - 1e-6)
    run(later, length + 0.1)
    expect(later.state()).toMatchObject({ move: null, badge: 'error', pose: slump })
  })

  test('the post stays up through a working turn: the first strike or jutsu poofs it in, the next neither poof it in nor out, and it leaves in one last poof as the turn ends', () => {
    const c = new Companion(byId('kakashi'))
    const sig = signature('kakashi')
    const quick = playOf('kakashi', QUICK_INDEX)!
    c.prompt()
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    // the turn's first move at the post, the command's quick strike: its own
    // poof in, and the post stays after it
    expect(c.state()).toMatchObject({ move: { index: QUICK_INDEX }, postStays: true })
    expect(c.state().postUp).toBeUndefined()
    run(c, totalOf(quick) + 0.1)
    expect(c.state()).toMatchObject({ move: null, postUp: true })
    // its jutsu, once it has run SHELL_JUTSU, finds it standing and leaves it so
    expect(untilJutsu(c)).toBeGreaterThan(0)
    expect(c.state()).toMatchObject({ move: { index: sig }, postUp: true, postStays: true })
    c.toolEnd('1', false)
    run(c, totalOf(moveOf('kakashi', sig)) + 0.1)
    // between jutsu, the post stands
    expect(c.state().move).toBeNull()
    expect(c.state()).toMatchObject({ postUp: true })
    run(c, 13)
    expect(c.state()).toMatchObject({ move: null, postUp: true })
    // the next command's strike and jutsu find it standing and leave it so
    c.toolStart('2', 'Bash')
    expect(c.state()).toMatchObject({ postUp: true, postStays: true })
    expect(c.state().move?.index).toBe(QUICK_INDEX)
    expect(untilJutsu(c)).toBeGreaterThan(0)
    expect(c.state()).toMatchObject({ postUp: true, postStays: true })
    c.toolEnd('2', false)
    run(c, 6)
    // the turn ends at rest: the post's last poof, a cloud and then wisps, then nothing
    c.turnEnd(true)
    c.setWorking(false)
    const st = c.state()
    expect(st.postUp).toBeUndefined()
    expect(st.postOut).toBe(0)
    run(c, 0.1)
    expect(c.state().postOut).toBe(1)
    run(c, 0.1)
    expect(c.state().postOut).toBeUndefined()
    run(c, 3)
    expect(c.state().postUp).toBeUndefined()

    // a turn that ends mid-jutsu: the jutsu's own poof out takes the post off,
    // no second one (it began with the post standing, from the command's strike)
    const d = new Companion(byId('kakashi'))
    d.prompt()
    d.setWorking(true)
    d.toolStart('1', 'Bash')
    expect(untilJutsu(d)).toBeGreaterThan(0)
    run(d, 1)
    d.toolEnd('1', false)
    d.turnEnd(true)
    d.setWorking(false)
    expect(d.state()).toMatchObject({ move: { index: sig } })
    expect([d.state().postUp, d.state().postStays, d.state().postOut]).toEqual([true, undefined, undefined])
    run(d, totalOf(moveOf('kakashi', sig)))
    expect(d.state().postUp).toBeUndefined()
    expect(d.state().postOut).toBeUndefined()

    // a call for you dispels it in its smoke: the next jutsu poofs it in again
    const e = new Companion(byId('kakashi'))
    e.prompt()
    e.setWorking(true)
    e.toolStart('1', 'Bash')
    expect(untilJutsu(e)).toBeGreaterThan(0)
    run(e, 1)
    e.permission('Bash')
    expect(e.state().move?.index).toBe(DISPEL_INDEX)
    expect(e.state().postUp).toBeUndefined()

    // outside a turn (training, a hello) the post comes and goes with each jutsu, as drawn
    const f = new Companion(byId('kakashi'))
    f.perform(0)
    expect([f.state().postUp, f.state().postStays]).toEqual([undefined, undefined])
  })

  test('woken, a sleeper keeps what they slept in through the start, then it lifts off in a puff', () => {
    const c = new Companion(byId('naruto'))
    run(c, 310, 0.25)
    expect(c.state().pose).toBe('sleep')
    c.prompt()
    const steps: (number | undefined)[] = []
    for (let s = 0; s < 0.8; s += 0.05) {
      steps.push(c.state().wake)
      c.update(0.05)
    }
    // two frames of the start, then the lift, the puff, the wisps (in the groggy moment), then none
    expect(steps.filter(x => x !== undefined)).toEqual([0, 0, 0, 0, 1, 1, 2, 2, 3, 3])
    expect(steps.slice(-4)).toEqual([undefined, undefined, undefined, undefined])
    // the key changes with each step, so each is drawn
    const keys = new Set<string>()
    const k = new Companion(byId('naruto'))
    run(k, 310, 0.25)
    k.prompt()
    for (let s = 0; s < 0.6; s += 0.05) {
      keys.add(keyOf(k.state()))
      k.update(0.05)
    }
    expect(keys.size).toBeGreaterThanOrEqual(5)
  })

  test("a failed Read during a passing command's jutsu: the jutsu plays on, no slump, and the answer cheers", () => {
    const c = new Companion(byId('kakashi'))
    const m = moveOf('kakashi', signature('kakashi'))
    c.prompt()
    c.setWorking(true)
    c.toolStart('b', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    run(c, 1.5)
    c.toolEnd('b', false)
    run(c, 1)
    // the file it looks for is not there
    c.toolStart('r', 'Read')
    c.toolEnd('r', true)
    const seen = new Set<number>()
    let slumps = 0
    for (let s = 0; s < totalOf(m) - 2.5 + 3; s += 0.05) {
      c.update(0.05)
      const st = c.state()
      if (st.move) seen.add(st.move.index)
      if (st.badge === 'error' || st.pose === 'slump') slumps++
    }
    expect([...seen]).toEqual([signature('kakashi')])
    expect(slumps).toBe(0)
    c.turnEnd(true)
    expect(c.state().move?.index).toBe(CHEER_INDEX)
  })

  test("a command that fails while another's jutsu plays: that jutsu plays out, then the slump, and the failed one's never plays", () => {
    const c = new Companion(byId('sasuke'))
    const m = moveOf('sasuke', signature('sasuke'))
    c.prompt()
    c.setWorking(true)
    // two commands a second apart: the first's jutsu, then the second's,
    // waiting its turn
    c.toolStart('1', 'Bash')
    run(c, 1)
    c.toolStart('2', 'Bash')
    expect(untilJutsu(c)).toBeLessThan(SHELL_JUTSU)
    run(c, 1.1)
    expect((c as unknown as { queued: unknown }).queued).not.toBeNull()
    // the second fails before the first's blow lands
    c.toolEnd('2', true)
    for (let s = 1.1; s < totalOf(m) - 0.15; s += 0.05) {
      expect({ s, index: c.state().move?.index, badge: c.state().badge }).toEqual({ s, index: signature('sasuke'), badge: null })
      c.update(0.05)
    }
    run(c, 0.25)
    expect(c.state()).toMatchObject({ move: null, badge: 'error', pose: 'slump', face: { mood: 'worried' } })
    c.toolEnd('1', false)
    expect(jutsuOnly(starts(c, 30))).toEqual([])
    // a failed edit's own strike fizzles, as a failed command's jutsu does
    const e = new Companion(byId('sasuke'))
    e.setWorking(true)
    e.toolStart('e', 'Edit')
    expect(e.state().move?.index).toBe(QUICK_INDEX)
    e.toolEnd('e', true)
    expect(e.state().move?.index).toBe(FIZZLE_INDEX)
  })

  test('no jutsu starts over the frown, and a failed turn ends without a cheer', () => {
    const c = new Companion(byId('kakashi'))
    c.prompt()
    c.setWorking(true)
    // a command runs on until it calls its jutsu
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    c.toolEnd('1', false)
    run(c, 11.4)
    // an edit fails: its strike fizzles, then the slump, and only then the
    // jutsu a subagent wants meanwhile (its turn due a moment later)
    c.toolStart('3', 'Edit')
    expect(c.state().move?.index).toBe(QUICK_INDEX)
    c.toolEnd('3', true)
    run(c, 0.1)
    c.toolStart('2', 'Agent')
    c.toolEnd('2', false)
    const seen = jutsuOnly(starts(c, 6))
    expect(seen.length).toBe(1)
    expect(seen[0]!.at).toBeGreaterThanOrEqual(totalOf(playOf('kakashi', FIZZLE_INDEX)!) + 2.6 - 0.1 - 0.05)
    // the jutsu a failed call wanted is never played
    const d = new Companion(byId('kakashi'))
    d.prompt()
    d.setWorking(true)
    d.toolStart('1', 'Bash')
    expect(untilJutsu(d)).toBeGreaterThan(0)
    d.toolEnd('1', false)
    run(d, 2)
    d.toolStart('2', 'Agent')
    d.toolEnd('2', true)
    expect(jutsuOnly(starts(d, 30)).length).toBe(0)
    // the turn answers after the failure: the ✓ (once the slump is over), but no cheer, then or a minute on
    d.turnEnd(true)
    d.setWorking(false)
    let ticked = 0
    for (let s = 0; s < 70; s += 0.1) {
      d.update(0.1)
      const st = d.state()
      if (st.badge === 'done') ticked++
      expect({ s, cheer: st.pose === byId('kakashi').cheer.pose || st.move?.index === CHEER_INDEX }).toEqual({ s, cheer: false })
    }
    expect(ticked).toBeGreaterThan(600)
  })

  test('Gaara never sleeps: left alone, he sits with arms folded, calm, eyes open, breathing slowly, no z', () => {
    const c = new Companion(byId('gaara'))
    for (let s = 0; s < 296; s += 0.25) {
      c.update(0.25)
      expect(c.state().face.blink === 0.5).toBe(false)
    }
    run(c, 20, 0.25)
    const bobs: number[] = []
    for (let s = 0; s < 12; s += 0.5) {
      c.update(0.5)
      const st = c.state()
      expect(st).toMatchObject({ move: null, pose: 'sleep', badge: null, tick: 0, face: { blink: 0, mood: 'calm' } })
      bobs.push(st.bob)
    }
    // a breath every two seconds
    expect(bobs.join('').match(/0+|1+/g)!.slice(1, -1).every(r => r.length === 4)).toBe(true)
    expect(c.tickMs()).toBe(1000)
    // a prompt: no start, he was awake all along
    c.prompt()
    expect(c.state().pose).not.toBe('alert')
  })

  test("asleep, the z drifts up a pixel a second and the sleeper breathes slowly, and nothing else moves", () => {
    const c = new Companion(byId('kakashi'))
    run(c, 310, 0.25)
    expect(c.state().badge).toBe('sleep')
    expect(c.tickMs()).toBe(1000)
    const ticks: number[] = []
    const bobs: number[] = []
    let changes = 0
    let key = keyOf(c.state())
    for (let i = 0; i < 12; i++) {
      c.update(c.tickMs() / 1000)
      const st = c.state()
      ticks.push(st.tick)
      bobs.push(st.bob)
      if (keyOf(st) !== key) changes++
      key = keyOf(st)
    }
    expect(new Set(ticks).size).toBe(3)
    // one new frame a tick, each the z a pixel higher (or back at the bottom)
    expect(changes).toBe(12)
    for (let i = 1; i < ticks.length; i++) expect((ticks[i]! - ticks[i - 1]! + 3) % 3).toBe(1)
    // a breath every two seconds: runs of two, but where the watch cuts them
    const runs = bobs.join('').match(/0+|1+/g)!.map(r => r.length)
    expect(runs.slice(1, -1).every(n => n === 2)).toBe(true)
    expect(new Set(bobs).size).toBe(2)
    // with reduced motion the z stays put
    c.reduced = true
    expect(c.state().tick).toBe(0)
  })

  test('nodding off, never a cut to the curled-up sleeper: a yawn, a sit, the puff that brings the cap on, its wisps, at the pace the companion asks for; the z once the puff comes', () => {
    const c = new Companion(byId('naruto'))
    run(c, 299, 0.25)
    const seen: { doze: number | undefined; badge: string | null; bob: number; pose: string }[] = []
    for (let s = 0; s < 3; ) {
      const dt = c.tickMs() / 1000
      c.update(dt)
      s += dt
      const st = c.state()
      if (st.pose === 'sleep') seen.push({ doze: st.doze, badge: st.badge, bob: st.bob, pose: st.pose })
    }
    // each step drawn, in order, then asleep as ever
    const steps = seen.map(f => f.doze ?? '-').join('').replace(/(.)\1+/g, '$1')
    expect(steps).toBe('0123-')
    // still while it nods off (no breath under it); the z from the puff on
    for (const f of seen) if (f.doze !== undefined) expect(f.bob).toBe(0)
    for (const f of seen) expect(f.badge).toBe(f.doze !== undefined && f.doze < 2 ? null : 'sleep')
    // the yawn held long enough to read (0.4 s), the sit 0.3 s
    const frames = (d: number) => seen.filter(f => f.doze === d).length
    expect(frames(0)).toBeGreaterThanOrEqual(1)
    // with reduced motion, or for one who never sleeps: no doze
    const r = new Companion(byId('naruto'))
    r.reduced = true
    run(r, 300.2, 0.1)
    expect([r.state().pose, r.state().doze]).toEqual(['sleep', undefined])
    const g = new Companion(byId('gaara'))
    run(g, 300.2, 0.1)
    expect([g.state().pose, g.state().doze]).toEqual(['sleep', undefined])
  })

  test('drowsy, the lids half shut and two slow nods before it dozes; woken, it starts', () => {
    const c = new Companion(byId('kakashi'))
    run(c, 293, 0.25)
    expect(c.state().face.blink).not.toBe(0.5)
    run(c, 1.1, 0.25)
    // the drowsy six seconds, at the pace the companion asks for
    const seen: { blink: number; bob: number; pose: string }[] = []
    for (let s = 0; s < 6; ) {
      const dt = c.tickMs() / 1000
      c.update(dt)
      s += dt
      const st = c.state()
      if (st.pose === 'sleep') break
      expect(st.move).toBeNull()
      seen.push({ blink: st.face.blink, bob: st.bob, pose: st.pose })
    }
    const lids = seen.map(f => (f.blink === 1 ? 'S' : f.blink === 0.5 ? 'h' : 'o')).join('')
    // half shut throughout, but for the nods (shut, the head dropped two pixels)
    expect(lids).not.toContain('o')
    const nods = lids.replace(/S+$/, '').match(/S+/g) ?? []
    expect(nods.length).toBe(2)
    for (const f of seen) if (f.blink === 1) expect(f.bob).toBe(2)
    run(c, 1)
    expect(c.state().pose).toBe('sleep')
    c.prompt()
    c.setWorking(true)
    expect(c.state()).toMatchObject({ pose: 'alert', bob: 0, badge: null, face: { mood: 'surprised' } })
    run(c, 0.45)
    // then a groggy moment, the lids half shut, before the hands go to work
    expect(c.state()).toMatchObject({ pose: 'idle', bob: 0, face: { blink: 0.5, mood: 'calm' } })
    expect(c.calling()).toBe(false)
    run(c, 0.3)
    expect(['signs', 'signs2', 'signs3']).toContain(c.state().pose)
    expect(c.state().face.blink).not.toBe(0.5)
  })

  test('every blink is half shut, shut, half shut, a frame each, at the pace the companion asks for', () => {
    const c = new Companion(byId('naruto'))
    const runs: number[][] = []
    let cur: number[] = []
    let last = 0
    for (let s = 0; s < 90; ) {
      const dt = c.tickMs() / 1000
      c.update(dt)
      s += dt
      const b = c.state().face.blink
      if (b !== last) {
        if (b === 0) {
          runs.push(cur)
          cur = []
        } else cur.push(b)
      }
      last = b
    }
    expect(runs.length).toBeGreaterThan(12)
    for (const r of runs) expect(r).toEqual([0.62, 1, 0.62])
  })

  test('breathes in every pose outside a jutsu: pondering, cheering, at rest', () => {
    const c = new Companion(byId('naruto'))
    c.setThinking(true)
    const bobs = new Set<number>()
    for (let s = 0; s < 3; s += 0.1) {
      c.update(0.1)
      expect(c.state().pose).toBe('think')
      bobs.add(c.state().bob)
    }
    expect([...bobs].sort()).toEqual([0, 1])
  })

  test('never glances toward an eye the design hides', () => {
    for (const id of ['kakashi', 'obito', 'deidara', 'naruto']) {
      const c = new Companion(byId(id))
      let right = 0
      for (let s = 0; s < 120; s += 0.1) {
        c.update(0.1)
        if (c.state().face.gaze[0] > 0.35) right++
      }
      if (id === 'naruto') expect(right).toBeGreaterThan(0)
      else expect({ id, right }).toEqual({ id, right: 0 })
    }
  })

  test('ticks fast only while a jutsu plays; otherwise when the picture next changes, a second at most', () => {
    const c = new Companion(byId('kakashi'))
    c.toolStart('1', 'Bash')
    expect(c.tickMs()).toBe(100)
    c.toolEnd('1', false)
    run(c, 7)
    // at rest: the breath, the blinks and glances, a few times a second at most
    let wakes = 0
    for (let s = 0; s < 60; ) {
      const ms = c.tickMs()
      expect(ms).toBeGreaterThanOrEqual(20)
      expect(ms).toBeLessThanOrEqual(1000)
      c.update(ms / 1000)
      s += ms / 1000
      wakes++
    }
    expect(wakes).toBeLessThan(60 * 4)
    // the working loop: its phrases, far less than every frame
    c.setWorking(true)
    wakes = 0
    for (let s = 0; s < 60; ) {
      const ms = c.tickMs()
      c.update(ms / 1000)
      s += ms / 1000
      wakes++
    }
    expect(wakes).toBeLessThan(60 * 7)
    c.setWorking(false)
    run(c, 320, 0.25)
    expect(c.state().pose).toBe('sleep')
    // asleep, once a second, on the second
    c.update(c.tickMs() / 1000)
    expect(c.tickMs()).toBe(1000)
  })

  test('a move is woken for on its own frames, however late it began', () => {
    const c = new Companion(byId('naruto'))
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    expect(untilJutsu(c)).toBeGreaterThan(0)
    const m = moveOf('naruto', signature('naruto'))
    c.turnEnd(true)
    c.setWorking(false)
    // the jutsu ends between two ticks: the cheer starts from its end, a few
    // hundredths ago, and the next wake lands on the cheer's next frame
    run(c, totalOf(m) - 0.01, 0.1)
    c.update(0.04)
    expect(c.state().move?.index).toBe(CHEER_INDEX)
    if (c.state().move) {
      const ms = c.tickMs()
      expect(ms).toBeLessThan(100)
      expect(ms).toBeGreaterThanOrEqual(20)
      const t = c.state().move!.t
      c.update(ms / 1000)
      expect(Math.round((c.state().move!.t - t) * 10) / 10).toBe(0.1)
    }
  })

  test('slow ticks do not skip the impact of a jutsu', () => {
    const c = new Companion(byId('kakashi'))
    c.setWorking(true)
    // (the command's strike, then its jutsu once it has run SHELL_JUTSU: its name shouted)
    c.toolStart('1', 'Bash')
    let shouted = false
    for (let s = 0; s < 30; s += 1) {
      c.update(1)
      shouted ||= c.shout() === moveOf('kakashi', signature('kakashi')).shout
    }
    expect(shouted).toBe(true)
  })
})

// ---------------------------------------------------------------- the roster's words

describe('words', () => {
  test('every line belongs to its speaker: Sage Mode and the Hokage to the Leaf, the ring to the rogues', () => {
    for (const n of NINJA) {
      const lines = spoken(n)
      if (n.id !== 'naruto' && n.id !== 'jiraiya') {
        expect(lines.has('Meditating in Sage Mode')).toBe(false)
        expect(lines.has('Sending a messenger toad')).toBe(false)
      }
      if (n.id !== 'naruto') expect(lines.has('Sending out shadow clones')).toBe(false)
      if (n.group !== 'Hidden Leaf') expect([...lines].some(l => /Hokage|ANBU/.test(l) && !n.lines.includes(l))).toBe(false)
      if (n.group === 'Akatsuki') expect(lines.has('Calling a meeting through the ring')).toBe(true)
      for (const l of n.lines) expect(lines.has(l)).toBe(true)
    }
    expect(byId('orochimaru').lines).toContain('Kukuku')
    expect(byId('deidara').lines.some(l => l.endsWith(', un'))).toBe(true)
  })

  test('quotes, titles and lines as the series has them, and safe to share a screen with', () => {
    expect(byId('sasuke').quote).toBe("I'm an avenger.")
    expect(byId('obito').quote).toBe("I'm no one. I don't want to be anyone.")
    expect(byId('minato').quote).toBe('I believe in you, Naruto.')
    expect(byId('kisame').quote).toBe("Samehada doesn't cut. It shaves!")
    expect(byId('pain').lines.join()).toContain('Bansho Ten’in')
    expect(byId('itachi').title).not.toMatch(/kill/i)
    expect(byId('itachi').lines).toContain('Poking Sasuke’s forehead')
    expect(byId('sasuke').past).toContain('Sharpened a Chidori')
    expect(byId('kakashi').lines).toContain('Reading his favourite book')
    expect(byId('kakashi').past).toContain('Read a chapter')
    for (const n of NINJA) for (const l of [...n.lines, ...n.past]) expect(l).not.toMatch(/Make-Out|Icha Icha.*(Read|reading)|Forgiving/)
  })

  test("lines in the series' own spirit: no book titles, no nicknames for a sensei, the Kage and the art", () => {
    expect(byId('jiraiya').lines).toContain('Writing his next novel')
    // (what Naruto calls his sensei is his own to say)
    expect(byId('naruto').lines).toContain('Training with Pervy Sage')
    expect(byId('sasuke').lines).toContain('Seeing through it with the Sharingan')
    expect(byId('madara').lines).toContain('Taking on all five Kage')
    expect(byId('tsunade').lines).toContain('Losing at the gambling tables')
    expect(byId('deidara').lines).toContain('Arguing art with Sasori, un')
    for (const n of NINJA) for (const l of n.lines) expect(l).not.toMatch(n.id === 'naruto' ? /Icha Icha|Dancing with/ : /Icha Icha|Pervy Sage|Dancing with|Shouting katsu|Gambling at the tables|Reading it with/)
  })

  test('the footer reads as time spent, never as a wound', () => {
    for (const n of NINJA)
      for (const word of n.past) {
        expect(word).not.toMatch(/’d\b|Pained/)
        expect(word).toMatch(/^[A-Z]/)
      }
  })
})

// ---------------------------------------------------------------- the pixels

describe('pixel heads', () => {
  test("each is a grid of its own colours, its neck and eyes inside it", () => {
    for (const n of NINJA) {
      const sprite = NATIVE[n.id]!
      for (const head of [sprite.head, ...(sprite.dojutsu?.head ? [sprite.dojutsu.head] : []), ...Object.values(sprite.heads ?? {})]) {
        const at = (x: number, y: number): string => head.rows[y]?.[x] ?? '.'
        expect({ id: n.id, missing: missing(head.rows, head.palette) }).toEqual({ id: n.id, missing: [] })
        expect({ id: n.id, neck: at(head.neck[0], head.neck[1]) !== '.' }).toEqual({ id: n.id, neck: true })
        for (const [x, y] of head.eyes)
          for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) expect({ id: n.id, eye: [x + dx, y + dy], inside: at(x + dx, y + dy) !== '.' }).toEqual({ id: n.id, eye: [x + dx, y + dy], inside: true })
      }
    }
  })
})

// the top row of a ninja's hair on the stage, where their pose seats it
// (under the arrival's first cloud there is no one to see)
const headTop = (st: ChibiState): number => frameOf(NATIVE[st.id]!, st, i => playOf(st.id, i)).head?.top ?? 0
// on the ground, a head may cut its hair's outline tips by a pixel; in the
// air, a leap's apex its hair's top by LEAP_CLIP (sprite/anims/kit.ts)
const HEAD_RISE = 1
const airborne = (id: string, index: number, t: number): boolean => (playOf(id, index)!.frames[Math.round(frameTime(t) * 10)]?.k?.lift ?? 0) > 0

describe('jutsu', () => {
  test('every ninja has three, one for commands, each about five seconds', () => {
    for (const n of NINJA) {
      const set = movesOf(n.id)
      expect(set.length).toBe(3)
      expect(set.some(m => m.on?.includes('shell'))).toBe(true)
      for (const m of set) {
        expect(m.name.length).toBeGreaterThan(0)
        expect(totalOf(m)).toBeGreaterThan(3.5)
        expect(totalOf(m)).toBeLessThan(7)
      }
    }
  })

  for (const n of NINJA)
    test(`${n.short}'s jutsu draw, every frame, with the head on the canvas`, () => {
      movesOf(n.id).forEach((m, index) => {
        for (let t = 0; t < totalOf(m); t += 0.1) {
          const st = moveState(n.id, index, t)
          const words = pixelCells(st, n.glow, SPRITE.columns, SPRITE.rows)
          expect(words.length).toBe(SPRITE.columns * SPRITE.rows * 3)
          expect({ move: m.name, t: frameTime(t), bad: badCell(words) }).toEqual({ move: m.name, t: frameTime(t), bad: -1 })
          expect({ move: m.name, t: frameTime(t), top: headTop(st) >= -(airborne(n.id, index, t) ? LEAP_CLIP : HEAD_RISE) }).toEqual({ move: m.name, t: frameTime(t), top: true })
        }
      })
    })

  test('the arrival and every quick strike draw, every frame, as the companion plays them', () => {
    for (const n of NINJA)
      for (const index of [ARRIVAL_INDEX, QUICK_INDEX]) {
        const m = playOf(n.id, index)!
        for (let t = 0; t < totalOf(m); t += 0.2) {
          const words = pixelCells(moveState(n.id, index, t), n.glow, SPRITE.columns, SPRITE.rows)
          expect({ id: n.id, index, t: frameTime(t), bad: badCell(words) }).toEqual({ id: n.id, index, t: frameTime(t), bad: -1 })
        }
      }
  })

  test('every pose with every mood draws, with the head on the canvas', () => {
    // (and the slump and the third sign)
    const later: Pose[] = ['slump', 'signs3']
    const poses: Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'charge', 'thumbs', 'scratch', 'alert', 'sleep', 'gather', 'strike', 'punch', 'kick', 'raise', 'slam', 'spread', 'dash', 'poke', 'tuck', ...later]
    const moods: Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']
    // a ninja of each kind of eyes: plain, a Sharingan under a mask, the Byakugan, the Rinnegan
    for (const id of ['naruto', 'kakashi', 'hinata', 'pain'])
      for (const pose of poses)
        for (const mood of moods) {
          const st = still(id, pose, mood, mood === 'focus')
          const words = pixelCells(st, byId(id).glow, SPRITE.columns, SPRITE.rows)
          expect({ id, pose, mood, bad: badCell(words) }).toEqual({ id, pose, mood, bad: -1 })
          expect({ id, pose, mood, top: headTop(st) >= 0 }).toEqual({ id, pose, mood, top: true })
        }
    // and everyone in every pose of the companion's own, breathing or not
    for (const n of NINJA)
      for (const pose of ['idle', 'crossed', 'think', 'signs', 'signs2', 'charge', 'scratch', 'alert', 'sleep', n.cheer.pose, ...later] as Pose[])
        for (const bob of [0, 1]) {
          const st = { ...still(n.id, pose, pose === 'sleep' ? 'sleep' : n.cheer.mood), bob }
          expect({ id: n.id, pose, bob, bad: badCell(pixelCells(st, n.glow, SPRITE.columns, SPRITE.rows)) }).toEqual({ id: n.id, pose, bob, bad: -1 })
        }
  })

  test('equal keys draw equal frames', () => {
    // a session's states, every one the companion makes, by key
    const c = new Companion(byId('naruto'))
    const seen = new Map<string, ChibiState[]>()
    const keep = (): void => {
      const st = c.state()
      const key = keyOf(st)
      const list = seen.get(key) ?? []
      if (list.length < 2) list.push(st)
      seen.set(key, list)
    }
    const go = (s: number): void => {
      for (let i = 0; i < s * 10; i++) {
        c.update(0.1)
        keep()
      }
    }
    go(5)
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    go(6)
    c.toolStart('2', 'Agent')
    c.toolStart('3', 'Edit')
    go(14)
    c.toolEnd('2', false)
    c.toolEnd('3', false)
    c.toolEnd('1', true)
    go(3)
    c.turnEnd(true)
    c.setWorking(false)
    go(5)
    let compared = 0
    for (const [key, [a, b]] of seen) {
      if (!a || !b || compared >= 120) continue
      compared++
      const glow = byId(a.id).glow
      expect({ key, same: base64(pixelCells(a, glow, SPRITE.columns, SPRITE.rows)) === base64(pixelCells(b, glow, SPRITE.columns, SPRITE.rows)) }).toEqual({ key, same: true })
    }
    expect(compared).toBeGreaterThan(20)
  })

  test('frame times against the 8 ms budget (logged)', () => {
    const stats = (a: number[]): string => {
      const s = [...a].sort((x, y) => x - y)
      const q = (p: number): number => s[Math.min(s.length - 1, Math.floor(p * s.length))]!
      return `avg ${(s.reduce((x, y) => x + y, 0) / s.length).toFixed(2)} ms, p95 ${q(0.95).toFixed(2)}, max ${s[s.length - 1]!.toFixed(2)} over ${s.length} frames`
    }
    const time = (map?: (c: number) => number): number[] => {
      const out: number[] = []
      for (const id of ['kakashi', 'madara'])
        movesOf(id).forEach((m, index) => {
          for (let t = 0; t < totalOf(m); t += 0.2) {
            const st = moveState(id, index, t)
            const t0 = performance.now()
            pixelCells(st, byId(id).glow, SPRITE.columns, SPRITE.rows, map)
            out.push(performance.now() - t0)
          }
        })
      return out
    }
    const truecolor = time()
    const low = time(to256)
    console.log(`frame time, 24-bit: ${stats(truecolor)}; 256 colours: ${stats(low)} (budget 8 ms)`)
    expect(truecolor.length).toBeGreaterThan(0)
  })
})
