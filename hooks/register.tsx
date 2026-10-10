import { atom, read, update } from 'claude-code'
import type { PromptAutocompleteSuggestion, Register, Timer } from 'claude-code'

import type { ChibiState } from './art/chibi.ts'
import type { Move } from './art/move.ts'
import { movesOf } from './art/moves.ts'
import { SPRITE, pixelCells, spriteSvg } from './art/pixel.ts'
import { Companion, keyOf } from './companion.ts'
import { pickLine } from './lines.ts'
import { isTruecolor, to256 } from './palette.ts'
import { NINJA, byId, findNinja, nearestNinja, nearestWord, notYet, voiceOf } from './roster.ts'
import type { Group, Ninja } from './roster.ts'

// the Raster's key in the band
const KEY = 'ninja'
const DEFAULT_HERO = 'kakashi'
// the longest step the companion takes at once, in seconds: a late tick
// catches up, a stalled one does not make the ninja leap
const MAX_STEP = 1.2
// The least time a picture shows, in milliseconds, but for a jutsu's own
// frames: an event's change waits until the picture on screen has shown this
// long, and is left to a change due within this long after that
const DRAW_SOON = 60

// In a terminal the ninja is a pixel-art sprite: the whole stage (the ninja on
// the right, the arena its jutsu land on to the left, 48 columns by 12 rows:
// pixel.ts's SPRITE) when it fits. A shorter
// band hides the stage's bottom rows rather than shrinking it, so the ninja
// keeps its size and place while the band grows and shrinks (the tasks list
// opening under the prompt takes a few of its rows). Shorter still, or
// narrower than the stage, just the ninja's own column with the eyes in view;
// then the name. On the main screen the band takes a third of the terminal's
// height at most, so a short terminal keeps room for the conversation, but
// not fewer than the peek's eight rows (an 80x24 terminal shows the head
// whole) unless that is over half the terminal. In fullscreen the band's slot
// is the engine's: half the terminal less the prompt and its footer, seven
// rows at 80x24.
type View = 'stage' | 'peek'
type Fit = { view: View; columns: number; rows: number }
// what the terminal's corner last showed: the stage (whole or cut), the peek
// or the name; whether the band's width held it back (`narrow`), and whether
// the terminal is already tall enough for the whole stage (`tall`; false if
// Claude Code did not say)
type Shown = { view: View | 'name'; narrow: boolean; tall: boolean }
// the fewest rows the stage is cut to: its feet and legs out of sight
const STAGE_ROWS = 9
// the ninja's column, the whole head across, and the fewest rows that show the eyes
const SOLO = { columns: 22, rows: 5 }
// the fewest rows the main screen gives the band, if the terminal has them
const PEEK_ROWS = 8
// the terminal rows whose third is the whole stage
const STAGE_TERMINAL = SPRITE.rows * 3
const fitFor = (room: number, columns: number): Fit | null => {
  const rows = Math.min(room, SPRITE.rows)
  if (rows >= STAGE_ROWS && columns >= SPRITE.columns) return { view: 'stage', columns: SPRITE.columns, rows }
  if (rows >= SOLO.rows && columns >= SOLO.columns) return { view: 'peek', columns: SOLO.columns, rows }
  return null
}

// The desktop draws the same pixel art as an SVG of crisp squares, five
// points to a pixel: the 48 x 24 stage.
const DESKTOP = { width: 240, height: 120 }

const hero = atom({ plugin: 'naruto', key: 'hero' } as const, DEFAULT_HERO)

// a Raster's `cells`: the words' bytes, in base64
const base64 = (words: Uint32Array): string => (new Uint8Array(words.buffer, words.byteOffset, words.byteLength) as Uint8Array & { toBase64(): string }).toBase64()

// the most recent frames by key, so a blink drawn once is never drawn again
class Frames<T> {
  private map = new Map<string, T>()
  constructor(private readonly size: number) {}
  get(key: string, make: () => T): T {
    const hit = this.map.get(key)
    if (hit !== undefined) {
      this.map.delete(key)
      this.map.set(key, hit)
      return hit
    }
    const v = make()
    this.map.set(key, v)
    if (this.map.size > this.size) this.map.delete(this.map.keys().next().value!)
    return v
  }
}

// ---------------------------------------------------------------- what /ninja says

const GROUPS: readonly Group[] = ['Hidden Leaf', 'Akatsuki', 'Elsewhere']

// Items joined with " · " after `lead`, at most `per` to a line and none past
// `width` columns, each further line indented under the first item. Claude
// Code indents a command's output five columns, so 75 fill an 80-column terminal.
const WIDTH = 74
const wrap = (lead: string, items: readonly string[], per = Infinity, width = WIDTH): string[] => {
  const pad = ' '.repeat(lead.length)
  const lines: string[] = []
  let line = lead
  let count = 0
  for (const item of items) {
    if (count > 0 && (count >= per || line.length + 3 + item.length > width)) {
      lines.push(line)
      line = pad
      count = 0
    }
    line += (count > 0 ? ' · ' : '') + item
    count++
  }
  lines.push(line)
  return lines
}

const numbered = (set: readonly Move[]): string[] => set.map((m, i) => `${i + 1}. ${m.name}`)

// what the spinner shouts for a move, as the reply to /ninja jutsu says it
const shoutOf = (m: Move): string => (m.shout || m.name).replace(/!+$/, '')

// why the corner shows less than the stage, and what would show it all
const roomText = (n: Ninja, shown: Shown | null): string[] => {
  if (shown === null || shown.view === 'stage') return []
  const has = `Your terminal has room for ${n.short}'s ${shown.view === 'peek' ? 'head' : 'name only'}.`
  if (shown.narrow) return [has, 'A wider window shows the whole stage.']
  return shown.tall ? [has] : [has, `A window about ${STAGE_TERMINAL} rows tall shows the whole stage.`]
}

const whoText = (n: Ninja, o: { quiet: boolean; hidden: boolean; shown: Shown | null }): string =>
  [
    `${n.name}, ${n.title}`,
    ...wrap('Jutsu: ', numbered(movesOf(n.id))),
    `/ninja <name> to switch · /ninja list for all ${NINJA.length}`,
    `/ninja jutsu 1-${Math.max(1, movesOf(n.id).length)} to watch one · /ninja help for the rest`,
    // the mode, unless it is the full ninja
    ...(o.hidden ? [`${n.short} is out of sight: /ninja on brings them back.`] : [...(o.quiet ? ['Quiet: no jutsu. /ninja on brings them back.'] : []), ...roomText(n, o.shown)]),
  ].join('\n')

const listText = (you: Ninja, shown: Shown | null): string => {
  const width = Math.max(...GROUPS.map(g => g.length)) + 2
  const rows = GROUPS.flatMap(g =>
    wrap(
      g.padEnd(width),
      NINJA.filter(n => n.group === g).map(n => (n.id === you.id ? `${n.short} (you)` : n.short)),
      6,
      78,
    ),
  )
  // a first line of its own, since Claude Code leads the output with the plugin's name
  // and, in a small terminal, that the whole stage exists (the first run suggests this list)
  return [`All ${NINJA.length}, by side:`, ...rows, ...roomText(you, shown), `Try /ninja ${you.id === 'itachi' ? 'naruto' : 'itachi'}`].join('\n')
}

const helpText = (): string =>
  [
    'How to use /ninja:',
    '/ninja                   who you have, and their jutsu',
    '/ninja <name>            switch ninja (nicknames too: /ninja tobi)',
    `/ninja list              all ${NINJA.length}, by side`,
    '/ninja random            someone new',
    '/ninja jutsu [1-3]       watch a jutsu now, by number or name',
    '/ninja on | quiet | off  the full ninja, calm (no jutsu), or hidden',
  ].join('\n')

// the words /ninja takes besides a name, for a slip of one ("quit")
const WORDS = ['list', 'jutsu', 'random', 'quiet', 'help', 'off', 'hide', 'stop', 'on', 'show']
const slipOf = (arg: string): string | undefined => (arg.length >= 3 ? nearestWord(arg, WORDS) : undefined)

// A name nobody has: someone not on the roster yet, a slip of a subcommand,
// or of a name
const unknownText = (arg: string): string => {
  const later = notYet(arg)
  if (later) return later
  const word = slipOf(arg)
  if (word) return `No ninja called "${arg}". Did you mean /ninja ${word}?`
  const near = nearestNinja(arg)
  return `No ninja called "${arg}" (yet).${near ? ` Did you mean ${near.short}?` : ''} /ninja list shows all ${NINJA.length}.`
}

// a move of the set by its number (from 1) or by a part of its name or shout; -1 if none
const letters = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const moveIndex = (set: readonly Move[], q: string): number => {
  if (/^\d+$/.test(q)) {
    const i = Number(q) - 1
    return i >= 0 && i < set.length ? i : -1
  }
  const c = letters(q)
  if (c === '') return -1
  const exact = set.findIndex(m => letters(m.name) === c || letters(m.shout) === c)
  if (exact >= 0 || c.length < 3) return exact
  return set.findIndex(m => letters(m.name).includes(c) || letters(m.shout).includes(c))
}

// what the model reads when you answer a permission dialog "no": the call
// never ran, so it is no failure to frown at
// (or presses Esc at it, or a rule of theirs denies it)
const REJECTED = /^\s*(?:Error:\s*)?(?:The user doesn['’]t want to (?:proceed with this tool use|take this action right now)|\[Request interrupted by user|Permission to use \S+ (?:with [^\n]* )?(?:has been|was) denied)/

// the mark beside a peek or the name for a badge: the "!", the ✓, or none
const markOf = (badge: string | null): 'alert' | 'done' | '' => (badge === 'alert' || badge === 'done' ? badge : '')

// the subcommands /ninja offers as you type
const SUBCOMMANDS: readonly PromptAutocompleteSuggestion[] = [
  { text: 'list', description: `all ${NINJA.length}, by side` },
  { text: 'jutsu', description: 'watch a jutsu now' },
  { text: 'random', description: 'someone new' },
  { text: 'on', description: 'the full ninja' },
  { text: 'quiet', description: 'calm (no jutsu)' },
  { text: 'off', description: 'hidden' },
  { text: 'help', description: 'how to use /ninja' },
]

// the corner's colours for a call for you and for a turn answered
const RED = '#ff3b30'
const GREEN = '#34c759'

// the terminal band's Raster and the frame that Raster shows
type Drawn = { requestId: string } & Fit

export const register: Register = on => {
  const companion = new Companion(byId(DEFAULT_HERO))
  // a count of your prompts, so the spinner's line changes from turn to turn
  let turns = 0

  // The clock: the companion moves on by the time that really passed, woken
  // when its picture may next change (Companion.tickMs), and at once when
  // Claude does something.
  let last = Date.now()
  let period = 0
  let synced = false
  // the companion's time, in seconds, as the steps below add it up
  let elapsed = 0
  const step = (dt: number): void => {
    companion.update(dt)
    elapsed += dt
  }
  // moves the companion up to now, before an event lands on it
  const sync = (): void => {
    const now = Date.now()
    step(Math.min(MAX_STEP, Math.max(0, now - last) / 1000))
    last = now
    synced = true
  }
  // sets the next tick for when the companion needs it, and shows a change
  // (and one in the "!") at once (once the session has started it); `ticked`
  // when a tick has just drawn
  let arm = (ticked?: boolean): void => {}
  // the tick's timer: one per process, whatever starts the session again (an
  // enable, a worker respawn)
  let timer: Timer | null = null
  // /ninja switches begun and finished: a corner drawn while one was under
  // way read the hero before it was saved, and must not switch back to it
  let switching = 0
  let switches = 0
  // whether session.start has set the stored hero everywhere: until then a
  // corner drawn may read the band's state before or after it lands (or one
  // a hot reload left behind), and must not take that for a switch
  let loaded = false

  // the terminal band's Raster, the frame that Raster shows, and since when
  // (Date.now())
  let raster: Drawn | null = null
  let rasterKey = ''
  let drewAt = -Infinity
  // blits refused in a row: a few are tried again (the band may not be mounted
  // yet), then the tick stops and asks once for the band to be drawn again
  let refusals = 0
  let asked = false
  // A peek and the name have no room for the badge's bubble, so a call for you
  // shows as a red "!" beside them, and an answer as a green ✓: whether the
  // terminal's corner is one of those (null: the stage, whose bubble shows
  // them), and which it shows ('': neither)
  let mark: 'alert' | 'done' | '' | null = null
  // `/ninja off`: the corner draws nothing until `/ninja on` (nor does the
  // ninja play a jutsu nobody sees)
  let hidden = false
  // what the terminal's corner last showed, for /ninja to say why it is small
  let shown: Shown | null = null
  // whether Claude Code paints this terminal in 256 colours, read once
  let depth: Promise<boolean> | undefined
  let lowColor = false

  // the desktop band: it has no blit, so it is drawn again for a new frame,
  // each under a new key (the desktop keeps an Svg's first picture while its
  // place in the tree holds)
  let vector = false
  // the frame last asked for, the one last drawn, and how many have been
  let vectorKey = ''
  let svgKey = ''
  let svgCount = 0
  let invalidateAt = -1

  // One ninja's three jutsu, quick strike and arrival at a frame every 0.1 s
  // are some 200 frames, and the rest (breaths, blinks, glances, the hand
  // signs' phrases, the cheer's bounces, each with its bubble) some 500 more,
  // though a few hundred of all those cover a long session: keep 512 cells (6
  // KB of base64 each, 3 MB in all), and fewer SVGs for the desktop, which
  // draws fewer frames.
  const cellFrames = new Frames<string>(512)
  const svgFrames = new Frames<string>(48)

  // `key` is keyOf(st); the glow is the ninja's, so the key covers it
  const cellsOf = (st: ChibiState, key: string, r: Drawn): string =>
    cellFrames.get(`${key}@${r.view}${r.columns}x${r.rows}${lowColor ? 'L' : ''}`, () =>
      base64(
        r.view === 'stage'
          ? // the whole stage, its top rows as many as the band has
            pixelCells(st, byId(st.id).glow, SPRITE.columns, SPRITE.rows, lowColor ? to256 : undefined).subarray(0, r.columns * r.rows * 3)
          : pixelCells(st, byId(st.id).glow, r.columns, r.rows, lowColor ? to256 : undefined, 'peek'),
      ),
    )

  const svgOf = (st: ChibiState, key: string): string =>
    svgFrames.get(key, () => spriteSvg(st, byId(st.id).glow, DESKTOP.width, DESKTOP.height))

  on('session.start', async ($, e, next) => {
    const [storedHero, welcomed, quiet, away, settings] = await Promise.all([
      $.store.get('hero'),
      $.store.get('welcomed'),
      $.store.get('quiet'),
      $.store.get('hidden'),
      $.settings.read().catch(() => ({}) as Record<string, unknown>),
    ])
    const id = typeof storedHero === 'string' && NINJA.some(n => n.id === storedHero) ? storedHero : DEFAULT_HERO
    // the ninja from last time, without the hello a switch gets
    companion.ninja = byId(id)
    companion.quiet = quiet === true
    companion.reduced = settings['prefersReducedMotion'] === true
    hidden = away === true
    companion.hidden = hidden
    await update($, hero, () => id)
    loaded = true
    await $.command.register({
      name: 'ninja',
      description: 'Your ninja above the prompt: /ninja <name> to switch, /ninja list for all twenty, /ninja jutsu to watch one',
      argumentHint: '[name | list | jutsu | random | on | quiet | off | help]',
      immediate: true,
    })

    let shouted: string | null = null
    let failed = false
    const tick = (): void => {
      try {
        const now = Date.now()
        const real = Math.max(0, now - last) / 1000
        // a whole period, unless an event moved the companion on meanwhile, or
        // a test's clock runs with no real time passing
        step(Math.min(MAX_STEP, synced || real >= period / 2000 ? real : period / 1000))
        last = now
        synced = false
        // the spinner shouts the jutsu as it lands, and is drawn again only when asked
        const shout = companion.quiet || hidden ? null : companion.shout()
        if (shout !== shouted) {
          shouted = shout
          if (companion.working) $.ui.invalidate('ui.render')
        }
        if (raster || vector) draw()
      } catch (err) {
        // this frame is lost; the next tick tries again
        if (!failed) {
          failed = true
          $.ui.log(`naruto: a frame failed: ${String(err)}`, { to: 'debug' })
        }
      }
      arm(true)
    }
    const draw = (): void => {
      const st = companion.state()
      const key = keyOf(st)
      if (vector && key !== vectorKey && elapsed - invalidateAt > 0.16) {
        // a few times a second at most
        vectorKey = key
        invalidateAt = elapsed
        $.ui.invalidate('ui.render')
      }
      const drawn = raster
      if (!drawn || key === rasterKey) return
      rasterKey = key
      drewAt = Date.now()
      const refused = (): void => {
        // a newer drawing has its own Raster
        if (raster !== drawn) return
        if (++refusals < 10) {
          rasterKey = ''
          return
        }
        raster = null
        if (!asked) {
          asked = true
          $.ui.invalidate('ui.render')
        }
      }
      void $.ui.blit({ requestId: drawn.requestId, key: KEY, cells: cellsOf(st, key, drawn), columns: drawn.columns, rows: drawn.rows }).then(res => {
        if (res.deny !== undefined) return refused()
        refusals = 0
        asked = false
      }, refused)
    }
    arm = (ticked = false) => {
      // the next wait first: should working it out throw, the clock goes on
      // a second later rather than stopping for good
      let wait = 1000
      try {
        wait = companion.tickMs()
        if (!ticked && (raster || vector)) {
          // An event's change is drawn (a tick draws its own): re-arming the
          // clock must not cancel a frame that was due. At once, unless the
          // picture on screen has shown for less than DRAW_SOON (then a tick
          // draws it when it has), or a change due within DRAW_SOON of that
          // will draw it anyway: so no picture shows for a few milliseconds.
          const after = Math.max(0, DRAW_SOON - (Date.now() - drewAt))
          if (wait - after >= DRAW_SOON) {
            if (after === 0) draw()
            else if (keyOf(companion.state()) !== rasterKey) wait = Math.ceil(after)
          }
        }
        // the "!" or the ✓ beside a peek or the name comes and goes with a
        // redraw, at once when an event brings or answers it
        const now = mark === null ? null : markOf(companion.state().badge)
        if (now !== null && mark !== now) {
          mark = now
          $.ui.invalidate('ui.render')
        }
      } catch (err) {
        if (!failed) {
          failed = true
          $.ui.log(`naruto: a frame failed: ${String(err)}`, { to: 'debug' })
        }
      }
      timer?.cancel()
      period = wait
      timer = $.clock.after(period, tick)
    }
    last = Date.now()
    timer?.cancel()
    timer = null
    if (storedHero === undefined && welcomed === undefined && e.isInteractive) {
      // the first session ever: a hello and the signature jutsu at once, and a
      // hint of who else there is
      companion.setNinja(byId(id))
      void $.store.set('welcomed', true).catch(() => undefined)
      void $.prompt.suggest({ text: '/ninja list' }).catch(() => undefined)
    }
    arm()
    return next(e)
  })

  // The ninja's three modes: the full ninja (`/ninja on`), calm with no jutsu
  // (`/ninja quiet`), or out of sight (`/ninja off`); `on` always brings back
  // the full ninja
  on('command.run', { command: 'ninja' }, async ($, e) => {
    // the corner hidden or shown, drawn again, and remembered (kept for this
    // session even if the store cannot save it)
    const show = async (visible: boolean): Promise<void> => {
      if (hidden === !visible) return
      hidden = !visible
      companion.hidden = hidden
      $.ui.invalidate('ui.render')
      await $.store.set('hidden', hidden).catch(() => undefined)
    }
    // quiet mode on or off, the spinner and footer following at once, and remembered
    const calm = async (quiet: boolean): Promise<void> => {
      if (companion.quiet === quiet) return
      companion.quiet = quiet
      $.ui.invalidate('ui.render')
      await $.store.set('quiet', quiet).catch(() => undefined)
    }
    const arg = e.args.trim().replace(/\s+/g, ' ')
    const you = byId(await read($, hero))
    if (arg === '') return { text: whoText(you, { quiet: companion.quiet, hidden, shown }) }
    if (/^(help|-h|--help|\?)$/i.test(arg)) return { text: helpText() }
    if (/^(list|ninja|ninjas|roster|all)$/i.test(arg)) return { text: listText(you, shown) }
    if (/^(off|hide|stop)$/i.test(arg)) {
      await show(false)
      // (two lines, to fit 80 columns)
      return { text: `${you.short} steps out of sight. /ninja on brings them back.\n(ctrl+x ctrl+a folds the whole band.)` }
    }
    // (and `quiet off`, as it once was)
    if (/^(on|show|quiet off)$/i.test(arg)) {
      if (!hidden && !companion.quiet) return { text: `${you.short} is already here.` }
      await calm(false)
      await show(true)
      return { text: `${you.short} is back, jutsu and all.` }
    }
    // (and `quiet on`, as it once was); out of sight, it brings them back
    const quiet = /^quiet(?: (.+))?$/i.exec(arg)
    if (quiet) {
      if (quiet[1] !== undefined && !/^on$/i.test(quiet[1])) return { text: 'Just /ninja quiet: no jutsu. /ninja on brings them back.' }
      const already = companion.quiet && !hidden
      await calm(true)
      await show(true)
      // (two lines, to fit 80 columns)
      return {
        text: already
          ? `${you.short} is already keeping quiet. /ninja on brings the jutsu back.`
          : `${you.short} keeps calm: no jutsu while Claude works,\nand the spinner keeps its own words. /ninja on brings the jutsu back.`,
      }
    }
    const jutsu = /^jutsu(?: (.+))?$/i.exec(arg)
    if (jutsu) {
      const set = movesOf(you.id)
      const index = jutsu[1] === undefined ? undefined : moveIndex(set, jutsu[1])
      if (index === -1) return { text: [`${you.short} doesn't know that one. ${you.short}'s jutsu:`, ...wrap('', numbered(set))].join('\n') }
      if (companion.reduced) return { text: "(Reduced motion is on, so jutsu don't play.)" }
      sync()
      // the hero as this surface knows it, without a hello
      if (companion.ninja.id !== you.id) companion.ninja = you
      const m = companion.perform(index)
      arm()
      if (!m) return { text: `${you.short} has no jutsu to show.` }
      // a jutsu asked to be watched is shown
      await show(true)
      return { text: `${you.short}: "${shoutOf(m)}!"` }
    }
    // a switch, to someone new at random or by name: the hello at once, the
    // hero saved for every surface
    const others = NINJA.filter(n => n.id !== you.id)
    const name = arg.replace(/^(pick|choose|be) /i, '')
    // (a name, before someone not here yet or a slip of a subcommand, before
    // a part of a name or title: "hid" is no Kisame "of the Hidden Mist")
    const found = /^random$/i.test(arg) ? others[Math.floor(Math.random() * others.length)]! : findNinja(name, false) ?? (notYet(name) || slipOf(name) ? undefined : findNinja(name))
    if (!found) return { text: unknownText(name) }
    if (found.id === you.id) {
      // (out of sight, asking for them brings them back)
      if (hidden) {
        await show(true)
        return { text: `${you.short} is back.` }
      }
      return { text: `${you.short} is already here.\n/ninja jutsu to watch a jutsu, /ninja list for the others.` }
    }
    sync()
    companion.setNinja(found)
    arm()
    switching++
    switches++
    try {
      await update($, hero, () => found.id)
    } finally {
      switching--
      switches++
    }
    await $.store.set('hero', found.id).catch(() => undefined)
    // someone new asked for is shown
    await show(true)
    const voice = voiceOf(found, name)
    return { text: `${voice.name} steps in. "${voice.quote}"` }
  })

  // As you type /ninja's argument: its subcommands and the ninja's names, and
  // after `jutsu` the hero's own jutsu by number
  on('prompt.autocomplete', { text: /^\/ninja / }, async ($, e, next) => {
    const theirs = await next(e)
    const before = e.text.slice('/ninja'.length, e.start).trim()
    const tok = e.token.toLowerCase()
    let mine: PromptAutocompleteSuggestion[] = []
    // (a nickname from two letters on, unless they are a subcommand: "on" is not Gaara's "one tail")
    const nick = tok.length >= 2 && !SUBCOMMANDS.some(s => s.text === tok)
    if (before === '')
      mine = [
        ...SUBCOMMANDS.filter(s => s.text.startsWith(tok)),
        ...NINJA.filter(n => n.id.startsWith(tok) || n.short.toLowerCase().startsWith(tok) || (nick && n.aliases?.some(a => a.startsWith(tok)))).map(n => ({
          text: n.id,
          label: n.short,
          description: n.title,
        })),
      ]
    else if (/^jutsu$/i.test(before))
      mine = movesOf(companion.ninja.id)
        .map((m, i) => ({ text: String(i + 1), label: `${i + 1}. ${m.name}`, words: m.name.toLowerCase().split(/[^a-z0-9]+/) }))
        .filter(s => s.text.startsWith(tok) || s.words.some(w => w.startsWith(tok)))
        .map(({ text, label }) => ({ text, label }))
    return mine.length > 0 ? { suggestions: [...theirs.suggestions, ...mine.slice(0, 8)] } : theirs
  }).catch(($, e, next) => next(e))

  // ---------------------------------------------------------------- Claude's work

  on('prompt.submit', async ($, e, next) => {
    const command = e.text.startsWith('/')
    if (!command) turns++
    sync()
    // a slash command is you about, not a new turn
    companion.prompt(!command)
    arm()
    // the motion setting, as it is now
    void $.settings.read().then(
      s => {
        companion.reduced = s['prefersReducedMotion'] === true
      },
      () => undefined,
    )
    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    const id = e.tool_use_id
    sync()
    // the tool's own arguments, for a permission dialog to find this call by
    const { tool, tool_use_id, agentId, requestMeta, consent, ...input } = e as Record<string, unknown>
    companion.toolStart(id, e.tool, e.agentId, input)
    arm()
    let failed = false
    try {
      const ran = await next(e)
      // a refusal is not a failure, nor is your "no" at its permission dialog
      failed = ran.deny === undefined && ran.isError === true && !REJECTED.test(ran.text ?? (typeof ran.result === 'string' ? ran.result : ''))
      return ran
    } finally {
      sync()
      companion.toolEnd(id, failed)
      arm()
    }
  }).catch(($, e, next) => next(e))

  on('classic.PermissionRequest', async ($, e, next) => {
    sync()
    companion.permission(e.tool_name, e.tool_input, e.agent_id)
    arm()
    return next(e)
  }).catch(($, e, next) => next(e))

  // A call's progress row (the run-in-background pill) is drawn only once it
  // runs, never while a permission dialog holds it: a dialog asked about it
  // has been answered, though the command may run on for minutes
  on('ui.render', { component: 'ToolProgress' }, async ($, e, next) => {
    if (companion.calling()) {
      sync()
      companion.running(e.props.tool_use_id)
      arm()
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      sync()
      companion.turnEnd(e.reason === 'answer')
      arm()
    }
    return next(e)
  })

  // On the terminal the spinner shouts each jutsu's name as it lands and
  // otherwise thinks out loud in the ninja's voice; the desktop's row says
  // what Claude's step is doing, so it is left alone, as it is in quiet mode
  // and while the ninja is out of sight.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    companion.setThinking(e.props.mode === 'thinking')
    if (e.surface !== 'terminal' || companion.quiet || hidden) return next(e)
    const shout = companion.shout()
    if (shout) return next({ ...e, props: { ...e.props, word: shout, suffix: '!' } })
    return next({ ...e, props: { ...e.props, word: pickLine(companion.ninja, e.props.mode, turns) } })
  })

  // the turn's footer in the ninja's words, picked by its length so it stays
  // put (and Claude Code's own in quiet mode, or with the ninja out of sight)
  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    if (companion.quiet || hidden) return next(e)
    const past = companion.ninja.past
    return next({ ...e, props: { ...e.props, word: past[Math.floor(e.props.durationMs / 997) % past.length] ?? e.props.word } })
  })

  // ---------------------------------------------------------------- the corner

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface !== 'terminal' && e.surface !== 'desktop') return next(e)
    if (companion.working !== e.props.isWorking) {
      sync()
      companion.setWorking(e.props.isWorking)
      arm()
    } else if (e.props.isWorking) companion.setWorking(true)
    if (e.props.hasSurvey || hidden) {
      // the survey has the band, or the ninja is out of sight
      if (e.surface === 'terminal') {
        raster = null
        mark = null
      } else vector = false
      return next(e)
    }
    // the hero switched elsewhere (another surface): unless a /ninja of this
    // session's was saving it meanwhile, or session.start had yet to set it
    const seen = switches
    const ready = loaded
    const n = byId(await read($, hero))
    if (ready && companion.ninja.id !== n.id && switching === 0 && seen === switches) {
      sync()
      companion.setNinja(n)
      arm()
    }
    const st = companion.state()
    const key = keyOf(st)
    const { Box, Text } = $.ui.resolve(e)
    let corner
    if (e.surface === 'desktop') {
      const { Svg } = $.ui.resolve(e)
      vector = true
      vectorKey = key
      if (key !== svgKey) {
        svgKey = key
        svgCount++
      }
      corner = (
        <Box key={`${KEY}-${svgCount}`} flexShrink={0}>
          <Svg source={svgOf(st, key)} alt={companion.caption()} {...DESKTOP} />
        </Box>
      )
    } else {
      // the 256-colour palette to match against, unless Claude Code paints in 24-bit colour
      depth ??= Promise.all([$.env.get('TERM'), $.env.get('TERM_PROGRAM'), $.env.get('COLORTERM'), $.env.get('FORCE_COLOR'), $.env.get('OS')]).then(
        ([term = '', program = '', colorterm = '', force = '', os = '']) => !isTruecolor({ term, program, colorterm, force, os }),
        () => true,
      )
      lowColor = await depth
      // in fullscreen the band has a slot of its own; on the main screen,
      // a third of the terminal at most
      const viewport = e.viewport
      const room =
        viewport && viewport.isFullscreen !== true
          ? Math.min(e.props.maxRows, Math.max(PEEK_ROWS, Math.floor(viewport.rows / 3)), Math.floor(viewport.rows / 2))
          : e.props.maxRows
      const fit = fitFor(room, e.props.bodyColumns)
      // (with the rows for more, it is the band's width that holds it back)
      const rows = Math.min(room, SPRITE.rows)
      shown = {
        view: fit === null ? 'name' : fit.view,
        narrow: fit === null ? rows >= SOLO.rows : fit.view === 'peek' && rows >= STAGE_ROWS,
        tall: viewport !== undefined && viewport.rows >= STAGE_TERMINAL,
      }
      if (fit === null) {
        // too little room for a picture: just the name
        raster = null
        corner = (
          <Text bold color={`#${n.glow.toString(16).padStart(6, '0')}`} wrap="truncate">
            {n.short}
          </Text>
        )
      } else {
        const { Raster } = $.ui.resolve(e)
        raster = { requestId: e.requestId, ...fit }
        if (key !== rasterKey) drewAt = Date.now()
        rasterKey = key
        refusals = 0
        corner = <Raster key={KEY} columns={fit.columns} rows={fit.rows} cells={cellsOf(st, key, raster)} />
      }
      // no bubble fits a peek or the name: Claude needing you is a red "!"
      // beside them, an answer a green ✓
      mark = fit === null || fit.view === 'peek' ? markOf(st.badge) : null
      if (mark)
        corner = (
          <Box flexDirection="row" flexShrink={0}>
            <Text bold color={mark === 'alert' ? RED : GREEN}>
              {`${mark === 'alert' ? '!' : '✓'}${fit === null ? ' ' : ''}`}
            </Text>
            {corner}
          </Box>
        )
    }
    const theirs = await next(e)
    return theirs ? (
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexGrow={1}>{theirs}</Box>
        {corner}
      </Box>
    ) : (
      <Box flexDirection="row" justifyContent="flex-end">
        {corner}
      </Box>
    )
  })
}
