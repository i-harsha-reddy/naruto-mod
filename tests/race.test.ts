import type { On } from 'claude-code'
import { describe, expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const band = (maxRows: number) =>
  ({ plugin: 'naruto', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows, bodyColumns: 120, scroll: { offset: 0, bodyRows: maxRows }, view: {} } }) as const

const session = (on: On) => {
  const clock = mock.clock(on)
  mock.env(on, { TERM: 'xterm-256color', COLORTERM: 'truecolor' })
  const saved = new Map<string, unknown>([['hero', 'kakashi'], ['welcomed', true]])
  on('store.get', ($, e) => ({ value: saved.get(e.key) }))
  on('store.set', ($, e) => {
    saved.set(e.key, e.value)
    return { value: undefined }
  })
  on('settings.read', () => ({ value: {} }))
  on('command.register', () => ({ value: { command: 'ninja' } }))
  on('session.start', () => ({ cwd: '/work' }))
  on('prompt.suggest', () => ({ isShown: true }))
  const start = ($: Engine) => $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  return { clock, start }
}

describe('races', () => {
  test('R1: a desktop redraw that lands while /ninja is still saving keeps the new ninja', async ($, on) => {
    const { clock, start } = session(on)
    let hold = false
    let release: (() => void) | null = null
    on('state.set', async ($, e, next) => {
      if (hold) await new Promise<void>(r => (release = r))
      return next(e)
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    hold = true
    const run = $.command.run({ command: 'ninja', args: 'itachi' } as never)
    for (let i = 0; i < 5 && !release; i++) await clock.advance(1)
    await ui.redraw()
    const alt = String((await ui.find({ type: 'Svg' }))?.props['alt'])
    hold = false
    ;(release as (() => void) | null)?.()
    await run
    expect(alt).toBe('Itachi Uchiha')
    await ui.unmount()
  })

  const firstMove = async ($: Engine, on: On, starts: number): Promise<number> => {
    const { clock, start } = session(on)
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    for (let i = 0; i < starts; i++) await start($)
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    let at = -1
    for (let s = 1; s <= 110 && at < 0; s++) {
      await clock.advance(1000)
      await ui.redraw()
      const alt = String((await ui.find({ type: 'Svg' }))?.props['alt'])
      if (alt.includes(',')) at = s
    }
    await ui.unmount()
    return at
  }
  test('R2a: one session.start: no training round in the first 110 s', async ($, on) => {
    const at = await firstMove($, on, 1)
    expect(at).toBe(-1)
  })
  test('R2b: a second session.start (a worker respawn, an enable) leaves one clock', async ($, on) => {
    const at = await firstMove($, on, 2)
    expect(at).toBe(-1)
  })

  test('R3: a redraw while session.start is still setting the stored hero plays no hello, for anyone', async ($, on) => {
    const clock = mock.clock(on)
    mock.env(on, { TERM: 'xterm-256color', COLORTERM: 'truecolor' })
    const saved = new Map<string, unknown>([['hero', 'itachi'], ['welcomed', true]])
    on('store.get', ($, e) => ({ value: saved.get(e.key) }))
    on('store.set', () => ({ value: undefined }))
    on('settings.read', () => ({ value: {} }))
    on('command.register', () => ({ value: { command: 'ninja' } }))
    on('session.start', () => ({ cwd: '/work' }))
    // session.start's write of the hero to the band's state is slow to land
    let hold = true
    let release: (() => void) | null = null
    on('state.set', async ($, e, next) => {
      if (hold) await new Promise<void>(r => (release = r))
      return next(e)
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({}))
    const started = $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    for (let i = 0; i < 5 && !release; i++) await clock.advance(1)
    const ui = await $.ui.mount({ ...band(20), surface: 'desktop' })
    await ui.redraw()
    hold = false
    ;(release as (() => void) | null)?.()
    await started
    const alts: string[] = []
    for (let s = 0; s < 80; s++) {
      await clock.advance(100)
      await ui.redraw()
      alts.push(String((await ui.find({ type: 'Svg' }))?.props['alt']))
    }
    await ui.unmount()
    expect(alts.filter(a => a.includes(','))).toEqual([])
    expect(alts.at(-1)).toBe('Itachi Uchiha')
  })
})
