// Makes the README's pictures from the mod's own renderer and state machine:
//
//   node scripts/media.mjs        → media/hero.gif, media/roster.png,
//                                   media/jutsu-*.gif, media/subagent.gif
//
// Every frame is the real thing: the Companion driven through a scripted turn
// (a Bash call, a permission prompt...) at ten frames a second, its state drawn
// by pixelCells() as half-block cells, two pixels a cell, the way a terminal
// shows them. A contact sheet of each GIF's frames, decoded back from the GIF
// itself, goes to .preview/media-<name>.png to check it.
// env: ONLY=hero,roster,jutsu,subagent to make some of them

import { deflateSync } from 'node:zlib'
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { decodeGif, encodeGif } from './gif.mjs'

// the mod's root, as a path for the files written and a URL for the modules
// loaded (a path with a space or a drive letter is no URL path)
const base = new URL('..', import.meta.url)
const root = fileURLToPath(base)
const load = (path) => import(new URL(path, base).href)
const { SPRITE, pixelCells } = await load('hooks/art/pixel.ts')
const { Companion, SHELL_JUTSU } = await load('hooks/companion.ts')
const { NINJA, byId } = await load('hooks/roster.ts')
const { movesOf, playOf, CHEER_INDEX } = await load('hooks/art/moves.ts')
const { totalOf } = await load('hooks/art/move.ts')
const { pickLine } = await load('hooks/lines.ts')
const { NATIVE } = await load('hooks/sprite/index.ts')

const OUT = root + 'media/'
const PREVIEW = root + '.preview/'
mkdirSync(OUT, { recursive: true })
mkdirSync(PREVIEW, { recursive: true })
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const wanted = name => !ONLY || ONLY.includes(name)

// ------------------------------------------------------------------ colours

const C = {
  bg: 0x15151a, // the terminal
  edge: 0x2e2e36, // the window's outline
  chrome: 0x222228, // the title bar
  text: 0xe6e4e0,
  dim: 0x8c8c94,
  faint: 0x55555e,
  rule: 0x44444c,
  user: 0x25252c, // the band behind your own message
  claude: 0xd77757, // the spinner
  green: 0x4eba65,
  permission: 0xb1b9f9,
  close: 0xff5f57,
  min: 0xfebc2e,
  zoom: 0x28c840,
}

// ------------------------------------------------------------------ the pixel font

// 5 by 7 (descenders 2 more), drawn at 2x: a terminal's monospace grid of 12 px
const GLYPHS = {
  ' ': '..... ..... ..... ..... ..... ..... .....',
  A: '.###. #...# #...# ##### #...# #...# #...#',
  B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.',
  D: '####. #...# #...# #...# #...# #...# ####.',
  E: '##### #.... #.... ####. #.... #.... #####',
  F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .####',
  H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  J: '..### ...#. ...#. ...#. ...#. #..#. .##..',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#',
  L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#',
  N: '#...# #...# ##..# #.#.# #..## #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.',
  P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#',
  R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.',
  T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.',
  V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.',
  X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..',
  Z: '##### ....# ...#. ..#.. .#... #.... #####',
  a: '..... ..... .###. ....# .#### #...# .####',
  b: '#.... #.... #.##. ##..# #...# #...# ####.',
  c: '..... ..... .###. #.... #.... #...# .###.',
  d: '....# ....# .##.# #..## #...# #...# .####',
  e: '..... ..... .###. #...# ##### #.... .###.',
  f: '..##. .#..# .#... ###.. .#... .#... .#...',
  g: '..... ..... .#### #...# #...# #...# .#### ....# .###.',
  h: '#.... #.... #.##. ##..# #...# #...# #...#',
  i: '..#.. ..... .##.. ..#.. ..#.. ..#.. .###.',
  j: '...#. ..... ..##. ...#. ...#. ...#. ...#. ...#. .##..',
  k: '#.... #.... #..#. #.#.. ##... #.#.. #..#.',
  l: '.##.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  m: '..... ..... ##.#. #.#.# #.#.# #.#.# #.#.#',
  n: '..... ..... #.##. ##..# #...# #...# #...#',
  o: '..... ..... .###. #...# #...# #...# .###.',
  p: '..... ..... ####. #...# #...# #...# ####. #.... #....',
  q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
  r: '..... ..... #.##. ##..# #.... #.... #....',
  s: '..... ..... .###. #.... .###. ....# ####.',
  t: '.#... .#... ###.. .#... .#... .#..# ..##.',
  u: '..... ..... #...# #...# #...# #..## .##.#',
  v: '..... ..... #...# #...# #...# .#.#. ..#..',
  w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
  x: '..... ..... #...# .#.#. ..#.. .#.#. #...#',
  y: '..... ..... #...# #...# #...# #...# .#### ....# .###.',
  z: '..... ..... ##### ...#. ..#.. .#... #####',
  0: '.###. #...# #..## #.#.# ##..# #...# .###.',
  1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  2: '.###. #...# ....# ...#. ..#.. .#... #####',
  3: '####. ....# ....# .###. ....# ....# ####.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.',
  5: '##### #.... ####. ....# ....# #...# .###.',
  6: '..##. .#... #.... ####. #...# #...# .###.',
  7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.',
  9: '.###. #...# #...# .#### ....# ...#. .##..',
  '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..',
  '"': '.#.#. .#.#. ..... ..... ..... ..... .....',
  '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.',
  $: '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
  '%': '##... ##..# ...#. ..#.. .#... #..## ...##',
  '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
  "'": '..#.. ..#.. ..... ..... ..... ..... .....',
  '(': '...#. ..#.. .#... .#... .#... ..#.. ...#.',
  ')': '.#... ..#.. ...#. ...#. ...#. ..#.. .#...',
  '*': '..... ..#.. #.#.# .###. #.#.# ..#.. .....',
  '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....',
  ',': '..... ..... ..... ..... ..... ..#.. ..#.. .#...',
  '-': '..... ..... ..... ##### ..... ..... .....',
  '.': '..... ..... ..... ..... ..... ..... ..#..',
  '/': '..... ....# ...#. ..#.. .#... #.... .....',
  ':': '..... ..... ..#.. ..... ..... ..#.. .....',
  ';': '..... ..... ..#.. ..... ..... ..#.. ..#.. .#...',
  '<': '...#. ..#.. .#... #.... .#... ..#.. ...#.',
  '=': '..... ..... ##### ..... ##### ..... .....',
  '>': '.#... ..#.. ...#. ....# ...#. ..#.. .#...',
  '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
  '@': '.###. #...# ....# .##.# #.#.# #.#.# .###.',
  '[': '.###. .#... .#... .#... .#... .#... .###.',
  '\\': '..... #.... .#... ..#.. ...#. ....# .....',
  ']': '.###. ...#. ...#. ...#. ...#. ...#. .###.',
  '^': '..#.. .#.#. #...# ..... ..... ..... .....',
  _: '..... ..... ..... ..... ..... ..... #####',
  '`': '.#... ..#.. ..... ..... ..... ..... .....',
  '{': '...#. ..#.. ..#.. .#... ..#.. ..#.. ...#.',
  '|': '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  '}': '.#... ..#.. ..#.. ...#. ..#.. ..#.. .#...',
  '~': '..... ..... .#... #.#.# ...#. ..... .....',
  // Claude Code's own: an ellipsis, a middle dot, the prompt, a tool's dot and
  // its result's corner, a tick
  '…': '..... ..... ..... ..... ..... ..... #.#.#',
  '·': '..... ..... ..... ..#.. ..... ..... .....',
  '❯': '##... .##.. ..##. ...## ..##. .##.. ##...',
  '⏺': '..... .###. ##### ##### ##### .###. .....',
  '⎿': '#.... #.... #.... #.... ##### ..... .....',
  '✓': '..... ....# ...## #.##. ###.. .#... .....',
}
const ALIAS = { '’': "'", '‘': "'", '“': '"', '”': '"', '—': '-', '–': '-' }

const FONT = new Map(
  Object.entries(GLYPHS).map(([ch, rows]) => {
    const grid = rows.split(' ')
    const cols = grid.flatMap(r => [...r].map((v, x) => (v === '#' ? x : -1)).filter(x => x >= 0))
    const left = cols.length ? Math.min(...cols) : 0
    const right = cols.length ? Math.max(...cols) : 1
    return [ch, { grid, left, width: right - left + 1 }]
  }),
)
const glyphOf = ch => FONT.get(ch) ?? FONT.get(ALIAS[ch]) ?? FONT.get(ch.normalize('NFD')[0]) ?? FONT.get('?')

// The spinner's star, 7 by 7, through its sizes and back as Claude Code's does
const STARS = [
  '....... ....... ....... ...#... ....... ....... .......',
  '....... ....... ...#... ..###.. ...#... ....... .......',
  '....... .#.#.#. ..###.. .#####. ..###.. .#.#.#. .......',
  '...#... .#.#.#. ..###.. ####### ..###.. .#.#.#. ...#...',
  '#..#..# .#.#.#. ..###.. ###.### ..###.. .#.#.#. #..#..#',
].map(s => s.split(' '))
const STAR_CYCLE = [4, 4, 3, 2, 1, 0, 1, 2, 3, 4]

// ------------------------------------------------------------------ drawing

class Canvas {
  constructor(w, h, fill = -1) {
    this.w = w
    this.h = h
    this.px = new Int32Array(w * h).fill(fill)
  }
  rect(x, y, w, h, c) {
    const x0 = Math.max(0, x)
    const x1 = Math.min(this.w, x + w)
    for (let Y = Math.max(0, y); Y < Math.min(this.h, y + h); Y++) if (x1 > x0) this.px.fill(c, Y * this.w + x0, Y * this.w + x1)
  }
  // a rectangle with pixel-stepped round corners of radius r
  rounded(x, y, w, h, r, c) {
    for (let Y = y; Y < y + h; Y++)
      for (let X = x; X < x + w; X++) {
        const px = X + 0.5
        const py = Y + 0.5
        const cx = Math.min(Math.max(px, x + r), x + w - r)
        const cy = Math.min(Math.max(py, y + r), y + h - r)
        if ((px - cx) ** 2 + (py - cy) ** 2 <= r * r && X >= 0 && Y >= 0 && X < this.w && Y < this.h) this.px[Y * this.w + X] = c
      }
  }
  disc(cx, cy, r, c) {
    for (let Y = Math.floor(cy - r); Y <= cy + r; Y++)
      for (let X = Math.floor(cx - r); X <= cx + r; X++) if ((X + 0.5 - cx) ** 2 + (Y + 0.5 - cy) ** 2 <= r * r) this.rect(X, Y, 1, 1, c)
  }
  // rows of '#' and '.', each pixel s by s
  bits(rows, x, y, s, c) {
    rows.forEach((row, r) => [...row].forEach((v, k) => v === '#' && this.rect(x + k * s, y + r * s, s, s, c)))
  }
  // text in the pixel font: monospace on the terminal's grid, or proportional; returns where it ends
  text(str, x, y, c, { s = 2, mono = true } = {}) {
    for (const ch of str) {
      const g = glyphOf(ch)
      this.bits(g.grid, mono ? x : x - g.left * s, y, s, c)
      x += mono ? 6 * s : ch === ' ' ? 3 * s : (g.width + 1) * s
    }
    return x
  }
}

const textWidth = (str, s = 2, mono = true) => [...str].reduce((w, ch) => w + (mono ? 6 : ch === ' ' ? 3 : glyphOf(ch).width + 1) * s, 0) - (mono ? 0 : s)

// The ninja's cells as a terminal draws them: a half-block cell `cw` by `ch`
// screen pixels, its upper half the foreground of ▀ (or the background of ▄)
const UPPER = 0x2580
const LOWER = 0x2584
const DEFAULT = 0x01000000
const drawCells = (cv, words, cols, rows, x0, y0, cw, ch, from = 0) => {
  const half = ch / 2
  for (let r = 0; r < rows; r++)
    for (let c = from; c < cols; c++) {
      const o = (r * cols + c) * 3
      if (words[o] === 0x20) continue
      const fg = words[o + 1]
      const bg = words[o + 2]
      const top = words[o] === LOWER ? bg : fg
      const low = words[o] === UPPER ? bg : fg
      const x = x0 + (c - from) * cw
      if (top !== DEFAULT) cv.rect(x, y0 + r * ch, cw, half, top)
      if (low !== DEFAULT) cv.rect(x, y0 + r * ch + half, cw, ch - half, low)
    }
}
const cellsOf = st => pixelCells(st, byId(st.id).glow, SPRITE.columns, SPRITE.rows)

// ------------------------------------------------------------------ scenes

const FPS = 10

// Plays a scripted turn on a Companion at ten frames a second: each cue
// [seconds, fn] runs at its moment, then the frame is drawn from the state
const film = (c, seconds, cues, draw) => {
  const frames = []
  const queue = [...cues].sort((a, b) => a[0] - b[0])
  let k = 0
  const count = Math.round(seconds * FPS)
  for (let f = 0; f < count; f++) {
    const t = f / FPS
    while (k < queue.length && queue[k][0] <= t + 1e-6) queue[k++][1](c)
    const cv = draw(c.state(), t, c, f)
    frames.W = cv.w
    frames.H = cv.h
    frames.push({ px: cv.px, ms: 1000 / FPS })
    c.update(1 / FPS)
  }
  return frames
}

// A dark window with a title bar: the terminal's text grid starts at (x, y)
const CELL = { w: 10, h: 20 }
const ADV = 12 // the text's advance, 6 font pixels at 2x
const TITLE = 28
const PAD = { x: 18, y: 10 }
const windowOf = (W, rows, title) => {
  const H = TITLE + PAD.y * 2 + rows * CELL.h
  const cv = new Canvas(W, H, -1)
  cv.rounded(0, 0, W, H, 10, C.edge)
  cv.rounded(1, 1, W - 2, H - 2, 9, C.bg)
  cv.rounded(1, 1, W - 2, TITLE + 10, 9, C.chrome)
  cv.rect(1, TITLE, W - 2, 12, C.bg)
  cv.rect(1, TITLE, W - 2, 1, C.edge)
  ;[C.close, C.min, C.zoom].forEach((c, i) => cv.disc(18 + i * 20, TITLE / 2 + 0.5, 6, c))
  const tw = textWidth(title, 1, false)
  cv.text(title, Math.round((W - tw) / 2), Math.round(TITLE / 2 - 3), C.dim, { s: 1, mono: false })
  const y0 = TITLE + PAD.y
  return {
    cv,
    W,
    // a line of [text, colour] runs at a row and text column of the terminal
    line: (row, col, ...runs) => {
      let x = PAD.x + col * ADV
      for (const [str, c] of runs) x = cv.text(str, x, y0 + row * CELL.h + 2, c)
      return x
    },
    rowY: row => y0 + row * CELL.h,
    // a box-drawing rule across the terminal, at the middle of its row
    rule: (row, c = C.rule) => cv.rect(PAD.x, y0 + row * CELL.h + CELL.h / 2, W - PAD.x * 2, 2, c),
    // your message, on its band
    user: (row, str) => {
      cv.rect(PAD.x - 6, y0 + row * CELL.h, W - PAD.x * 2 + 12, CELL.h, C.user)
      cv.text('> ' + str, PAD.x, y0 + row * CELL.h + 2, C.dim)
    },
    // the spinner: the star, the words, the seconds
    spinner: (row, f, words, seconds) => {
      cv.bits(STARS[STAR_CYCLE[f % STAR_CYCLE.length]], PAD.x - 1, y0 + row * CELL.h + 3, 2, C.claude)
      const x = cv.text(words, PAD.x + 2 * ADV, y0 + row * CELL.h + 2, C.claude)
      if (seconds !== undefined) cv.text(` (${seconds}s)`, x, y0 + row * CELL.h + 2, C.dim)
    },
    // the band's corner: the ninja's 48 by 12 cells at the terminal's right edge
    corner: (row, st) => drawCells(cv, cellsOf(st), SPRITE.columns, SPRITE.rows, W - PAD.x - SPRITE.columns * CELL.w, y0 + row * CELL.h, CELL.w, CELL.h),
    // the prompt: a rule, ❯ and the cursor, a rule
    prompt: (row, t) => {
      cv.rect(PAD.x, y0 + row * CELL.h + CELL.h / 2, W - PAD.x * 2, 2, C.rule)
      cv.text('❯', PAD.x, y0 + (row + 1) * CELL.h + 2, C.text)
      if (Math.floor(t * 2) % 2 === 0) cv.rect(PAD.x + 2 * ADV, y0 + (row + 1) * CELL.h + 1, 10, 18, C.text)
      cv.rect(PAD.x, y0 + (row + 2) * CELL.h + CELL.h / 2, W - PAD.x * 2, 2, C.rule)
    },
  }
}

// a tool's line: its dot (blinking while it runs, green once done) and its call
const toolLine = (w, row, t, done, name, arg) =>
  w.line(row, 0, ['⏺', done ? C.green : Math.floor(t * 2) % 2 ? C.faint : C.text], [' ' + name, C.text], [`(${arg})`, C.dim])

// The hero: Kakashi above the prompt while Claude runs the tests. The Bash
// call calls his signature jutsu: hand signs, then the spinner shouts
// "Raikiri!" as it lands; then Claude reads, and he ponders with the Sharingan.
const hero = () => {
  const n = byId('kakashi')
  const c = new Companion(n)
  // the tests have run a few seconds before the film: their quick strike is
  // over, and the jutsu a command that takes a while calls starts as it opens
  c.prompt()
  c.setWorking(true)
  c.toolStart('bash', 'Bash')
  for (let s = 0; s < SHELL_JUTSU - 0.05; s += 0.05) c.update(0.05)
  // the spinner's words while Claude works, as the mod picks them (a turn whose
  // line fits the charge, not his book), and the jutsu's name as it lands
  const line = pickLine(n, 'tool-use', 6)
  const cues = [
    [3.8, c => c.toolEnd('bash', false)],
    [4.0, c => c.toolStart('read', 'Read')],
  ]
  const W = 680
  const ROWS = 22
  // (it ends a beat after he opens his book, not on seconds of reading)
  const frames = film(c, 6, cues, (st, t, c, f) => {
    const w = windowOf(W, ROWS, 'claude  ~/dojo')
    w.user(0, 'run the tests')
    toolLine(w, 2, t, t >= 3.8, 'Bash', 'npm test')
    if (t < 3.8) w.line(3, 2, ['⎿  ', C.dim], ['Running…', C.dim])
    else w.line(3, 2, ['⎿  ', C.dim], ['42 passed', C.dim], [' (7.8s)', C.faint])
    if (t >= 4.0) toolLine(w, 4, t, false, 'Read', 'src/jutsu.ts')
    const shout = c.shout()
    // the turn began with the tests, before the film
    w.spinner(6, f, shout ? `${shout}!` : `${line}…`, Math.floor(t + SHELL_JUTSU))
    w.corner(7, st)
    w.prompt(19, t)
    return w.cv
  })
  return { frames, W, H: frames.H }
}

// A subagent: Naruto sends out his shadow clones while it explores, the
// spinner shouting the jutsu as it lands, then cheers when the answer comes.
const AGENT = 'naruto'
const subagent = () => {
  const n = byId(AGENT)
  const c = new Companion(n)
  const START = 0.3
  const BACK = 6.0
  const DONE = 6.3
  const cues = [
    [0, c => (c.prompt(), c.setWorking(true), c.setThinking(true))],
    [START, c => (c.setThinking(false), c.toolStart('agent', 'Agent'))],
    [BACK, c => c.toolEnd('agent', false)],
    [DONE, c => (c.turnEnd(true), c.setWorking(false))],
  ]
  const line = pickLine(n, 'tool-use', 9)
  const W = 680
  const ROWS = 21
  const frames = film(c, 8.4, cues, (st, t, c, f) => {
    const w = windowOf(W, ROWS, 'claude  ~/dojo')
    w.user(0, 'how does the login work?')
    if (t >= START) toolLine(w, 2, t, t >= BACK, 'Agent', 'Explore the login flow')
    if (t >= START && t < BACK) w.line(3, 2, ['⎿  ', C.dim], ['Searching src/auth…', C.dim])
    if (t >= BACK) w.line(3, 2, ['⎿  ', C.dim], ['Done (14 tool uses)', C.dim])
    if (t >= DONE) w.line(5, 0, ['⏺', C.text], [' Login goes through src/auth/session.ts.', C.text])
    const shout = c.shout()
    if (t < DONE) w.spinner(7, f, shout ? `${shout}!` : `${line}…`, Math.floor(t) + 1)
    else {
      const past = n.past[Math.floor(6000 / 997) % n.past.length]
      w.cv.bits(STARS[4], PAD.x - 1, w.rowY(7) + 3, 2, C.dim)
      w.line(7, 2, [`${past} for 6s`, C.dim])
    }
    w.corner(8, st)
    w.prompt(18, t)
    return w.cv
  })
  return { frames, W, H: frames.H }
}

// One jutsu, sprite only: the ninja's stage, arena and all, at 8x (48 by 24
// for a ninja drawn natively, the 32 by 24 a vector ninja's jutsu play on)
const ZOOM = 8
const jutsu = (id, index) => {
  const c = new Companion(byId(id))
  const m = movesOf(id)[index]
  if (!m) throw new Error(`${id} has no move ${index}`)
  const PRE = 0.2
  const TAIL = 0.5
  const total = totalOf(m)
  // the move as the companion plays it, as /ninja jutsu does
  const cues = [[PRE, c => c.perform(index)]]
  const cols = NATIVE[id] ? SPRITE.columns : 32
  const W = cols * ZOOM + 32
  const H = SPRITE.rows * 2 * ZOOM + 32
  const frames = film(c, PRE + total + TAIL, cues, st => {
    const cv = new Canvas(W, H, -1)
    cv.rounded(0, 0, W, H, 10, C.edge)
    cv.rounded(1, 1, W - 2, H - 2, 9, C.bg)
    drawCells(cv, cellsOf(st), SPRITE.columns, SPRITE.rows, 16, 16, ZOOM, ZOOM * 2, SPRITE.columns - cols)
    return cv
  })
  return { frames, W, H, name: m.name }
}

// ------------------------------------------------------------------ output

const sizes = []
const kb = n => `${(n / 1024).toFixed(0)} KB`

const saveGif = (name, W, H, frames) => {
  const buf = encodeGif(W, H, frames, { transparent: true })
  writeFileSync(OUT + name, buf)
  const s = buf.stats
  // read it back: every frame, as a viewer composites it, must be the one drawn
  const back = decodeGif(buf)
  let k = 0
  for (const d of back.frames) {
    for (let left = d.ms; left > 0; left -= frames[k++].ms) {
      const want = frames[k]?.px
      if (!want || want.some((v, i) => v !== d.px[i])) throw new Error(`${name}: frame ${k} does not read back as drawn`)
    }
  }
  if (k !== frames.length) throw new Error(`${name}: ${k} of ${frames.length} frames read back`)
  sizes.push([`media/${name}`, buf.length, `${W}×${H}, ${frames.length} frames (${s.frames} after merging), ${(s.ms / 1000).toFixed(1)} s, ${s.colors} colours${s.locals ? ` (${s.locals} frames with a local table)` : ''}`])
  sheet(name, buf)
}

// A contact sheet of the GIF's frames as a viewer composites them, decoded
// from the file itself (-1, the transparent corners, in dim magenta)
const sheet = (name, buf) => {
  const g = decodeGif(buf)
  let at = 0
  const shots = g.frames.map(f => {
    const shot = { ...f, at }
    at += f.ms
    return shot
  })
  const step = Math.max(1, Math.ceil(shots.length / 24))
  const pick = shots.filter((_, i) => i % step === 0)
  const down = Math.max(1, Math.ceil(g.width / 360))
  const tw = Math.ceil(g.width / down)
  const th = Math.ceil(g.height / down)
  const per = Math.min(pick.length, Math.max(3, Math.floor(1800 / (tw + 8))))
  const SW = per * (tw + 8) + 8
  const SH = Math.ceil(pick.length / per) * (th + 24) + 8
  const cv = new Canvas(SW, SH, 0x0b0b0e)
  pick.forEach((f, i) => {
    const ox = 8 + (i % per) * (tw + 8)
    const oy = 8 + Math.floor(i / per) * (th + 24)
    for (let y = 0; y < th; y++)
      for (let x = 0; x < tw; x++) {
        const c = f.px[y * down * g.width + x * down]
        cv.px[(oy + y) * SW + ox + x] = c < 0 ? 0x7f007f : c
      }
    cv.text(`${(f.at / 1000).toFixed(1)}s +${f.ms}ms`, ox, oy + th + 4, 0x9a98a8, { s: 1, mono: false })
  })
  const file = `media-${name.replace(/\.gif$/, '')}.png`
  writePng(PREVIEW + file, SW, SH, cv.px)
}

// an RGBA PNG (-1 clear), for the roster's round corners and the sheets
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data])
  let c = 0xffffffff
  for (const b of body) c = CRC[(c ^ b) & 255] ^ (c >>> 8)
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE((c ^ 0xffffffff) >>> 0, 8 + data.length)
  return out
}
const writePng = (path, w, h, px) => {
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = px[y * w + x]
      const o = y * (w * 4 + 1) + 1 + x * 4
      if (c < 0) continue
      raw[o] = (c >> 16) & 255
      raw[o + 1] = (c >> 8) & 255
      raw[o + 2] = c & 255
      raw[o + 3] = 255
    }
  const head = Buffer.alloc(13)
  head.writeUInt32BE(w, 0)
  head.writeUInt32BE(h, 4)
  head[8] = 8
  head[9] = 6
  writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]))
}

// All twenty in their cheer poses, two rows of ten, the sprite at 6x as
// half-block cells, the arena left out: the columns any of them fills
// the moment of each ninja's cheer the roster shows: by default two frames into
// its 'cheer' beat, where the pose has settled; a time here where another
// frame says more
const ROSTER_AT = Object.fromEntries(Object.entries({
  sasuke: 1, hinata: 7, neji: 1, gaara: 2, itachi: 9, jiraiya: 8, minato: 6,
  madara: 1, obito: 6, pain: 8, deidara: 6, kisame: 4, orochimaru: 5,
}).map(([id, frame]) => [id, frame * 0.1 + 0.001]))
const cheerAt = id => {
  if (ROSTER_AT[id] !== undefined) return ROSTER_AT[id]
  const frames = playOf(id, CHEER_INDEX).frames
  const at = frames.findIndex(f => f.tag === 'cheer')
  return Math.min(frames.length - 1, Math.max(0, at) + 2) * 0.1 + 0.001
}

const roster = () => {
  const S = 6
  // each in their cheer, without the arena (the peek: the ninja's own columns,
  // the post and the floor left of them being the stage's, not theirs)
  const PW = 22
  const states = NINJA.map(n => ({
    n,
    words: pixelCells({ id: n.id, face: { blink: 0, gaze: [0, 0], mood: n.cheer.mood, active: false }, pose: n.cheer.pose, aura: 0, effect: null, badge: null, tick: 0, clones: 0, bob: 0, move: { index: CHEER_INDEX, t: cheerAt(n.id) } }, n.glow, PW, SPRITE.rows, c => c, 'peek'),
  }))
  let from = PW
  let to = 0
  let top = SPRITE.rows
  for (const { words } of states)
    for (let r = 0; r < SPRITE.rows; r++)
      for (let c = 0; c < PW; c++)
        if (words[(r * PW + c) * 3] !== 0x20) {
          from = Math.min(from, c)
          to = Math.max(to, c)
          top = Math.min(top, r)
        }
  const cols = to - from + 1
  const rows = SPRITE.rows - top
  const NAME = 3
  const TW = Math.max(cols * S, ...NINJA.map(n => textWidth(n.short, NAME, false))) + 28
  const TH = rows * S * 2 + 76
  const PER = 10
  const W = PER * TW + 40
  const H = Math.ceil(NINJA.length / PER) * TH + 24
  const cv = new Canvas(W, H, -1)
  cv.rounded(0, 0, W, H, 14, C.edge)
  cv.rounded(1, 1, W - 2, H - 2, 13, C.bg)
  states.forEach(({ n, words }, i) => {
    const ox = 20 + (i % PER) * TW
    const oy = 28 + Math.floor(i / PER) * TH
    const sub = words.subarray(top * PW * 3)
    drawCells(cv, sub, PW, rows, ox + Math.round((TW - cols * S) / 2) - from * S, oy, S, S * 2, 0)
    const nw = textWidth(n.short, NAME, false)
    cv.text(n.short, ox + Math.round((TW - nw) / 2), oy + rows * S * 2 + 14, C.text, { s: NAME, mono: false })
  })
  writePng(OUT + 'roster.png', W, H, cv.px)
  sizes.push(['media/roster.png', statSync(OUT + 'roster.png').size, `${W}×${H}, ${NINJA.length} ninja at ${S}x`])
}

// ------------------------------------------------------------------ run

if (wanted('hero')) {
  const { frames, W, H } = hero()
  saveGif('hero.gif', W, H, frames)
}
if (wanted('roster')) roster()
if (wanted('jutsu'))
  for (const [id, index, file] of [
    ['itachi', 0, 'jutsu-tsukuyomi.gif'],
    ['jiraiya', 1, 'jutsu-gamabunta.gif'],
    ['naruto', 2, 'jutsu-rasenshuriken.gif'],
  ]) {
    const { frames, W, H } = jutsu(id, index)
    saveGif(file, W, H, frames)
  }
if (wanted('subagent')) {
  const { frames, W, H } = subagent()
  saveGif('subagent.gif', W, H, frames)
}

for (const [file, size, what] of sizes) console.log(`${file.padEnd(30)} ${kb(size).padStart(7)}  ${what}`)
