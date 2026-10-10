// Pixel art for terminals, and the desktop's sprite. Each ninja is drawn by
// the sprite engine (sprite/: hand-placed pixels, one 48 x 24 stage per
// frame); here the stage is set in the band, a flicker of chakra burns in the
// outline between jutsu, the badge (a pixel icon in a speech bubble) goes by
// the head, and the frame becomes terminal cells (two pixels a cell, one above
// the other, with a half-block character) or the desktop's SVG.

import type { Badge, ChibiState } from './chibi.ts'
import { mixc } from './portrait.ts'
import { CHEER_INDEX, playOf } from './moves.ts'
import { FRAME } from './move.ts'
import { NATIVE, STAGE_H, STAGE_W, frameOf, peekLeftOf } from '../sprite/index.ts'
import { focusOf } from '../sprite/compose.ts'
import type { Box, HeadAt } from '../sprite/compose.ts'
import { GROUND } from '../sprite/stage.ts'
import type { CelMove, NinjaSprite } from '../sprite/types.ts'

// The stage: 48 columns by 12 rows of half blocks, 48 x 24 pixels.
export const SPRITE = { columns: 48, rows: 12 } as const

const CLEAR = -1
// a head's width with its outline, for the peek
const HEAD_W = 21
const OUTLINE = 0x16121e
type Pixels = Int32Array

// a dark outline one pixel round whatever is drawn
const outline = (px: Pixels, w: number, h: number): void => {
  const solid = px.slice()
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (solid[y * w + x] !== CLEAR) continue
      if ((x > 0 && solid[y * w + x - 1] !== CLEAR) || (x < w - 1 && solid[y * w + x + 1] !== CLEAR) || (y > 0 && solid[(y - 1) * w + x] !== CLEAR) || (y < h - 1 && solid[(y + 1) * w + x] !== CLEAR))
        px[y * w + x] = OUTLINE
    }
}

const over = (dst: Pixels, src: Pixels): void => {
  for (let i = 0; i < dst.length; i++) if (src[i] !== CLEAR) dst[i] = src[i]!
}

// ------------------------------------------------------------------ the frame

// A frame as pixels, w by h, and where its head is.
type Rendered = { px: Pixels; head: HeadAt | null }

// The chakra flickering in the outline between jutsu: the ninja's glow unless
// it is lost on their hair (AURA).
const AURA: Record<string, number> = {
  // the Sharingan's crimson, not his fire's orange
  itachi: 0xd8202c,
  // glows too near the hair they would ring: Sakura's the medic's green
  // (pink on pink hair read as no outline at all)
  sakura: 0x62e08c,
  kakashi: 0x4696ff,
  minato: 0x62b8ff,
  deidara: 0x5ad8c8,
  shikamaru: 0xb8bce0,
  obito: 0xb08cff,
  kisame: 0x7ae0ff,
  jiraiya: 0x3c96ff,
}

// The aura's colour for a ninja: AURA's, or their glow. AURA must name every
// ninja whose glow is lost on their hair (within about 5000 of its main colour,
// the commonest in the head's top rows): none of the others' is.
const auraOf = (id: string, glow: number): number => AURA[id] ?? glow

// ------------------------------------------------------------------ badges

// what Claude is at, as 7x7 pixel icons in a speech bubble beside the head
// (their corners left clear: the bubble's are clipped)
const INK = 0x2a2436
const BUBBLE = 0xe8e6f0
const ICON_COLOURS: Record<string, number> = {
  k: INK,
  r: 0xe0303c,
  g: 0x2ea84a,
  c: 0xb4e0ff,
  h: 0x8a5a3a,
  // the kunai's blade: mid steel, its lower edge dark (pale steel was lost
  // on the pale bubble)
  s: 0x4a5068,
  S: 0x949cb2,
  o: 0x5a5e6a,
}
const ICONS: Record<string, readonly string[]> = {
  // thinking: the dots rise in turn (the raised one is set apart)
  think: ['.......', '.......', '.......', '.k.k.k.', '.......', '.......', '.......'],
  look: ['.kkk...', 'kccck..', 'kccck..', 'kccck..', '.kkkh..', '....hh.', '.....h.'],
  edit: ['.....S.', '....SSs', '...SSs.', '..kss..', '.hk....', 'oh.....', '.o.....'],
  shell: ['.......', '.k.....', '..k....', '...k...', '..k....', '.k.kkk.', '.......'],
  // a bang: a wide head tapering to a stem, a gap, the dot (never a cross)
  alert: ['..rrr..', '..rrr..', '..rrr..', '...r...', '...r...', '.......', '...r...'],
  done: ['.......', '.....gg', '....gg.', 'gg.gg..', '.ggg...', '..g....', '.......'],
}
const iconOf = (b: Badge): string | null =>
  b === 'think' || b === 'plan' || b === 'agent' ? 'think' : b === 'read' || b === 'search' || b === 'web' ? 'look' : b === 'edit' ? 'edit' : b === 'shell' ? 'shell' : b === 'alert' ? 'alert' : b === 'done' ? 'done' : null

// the sleeper's z, drifting up a pixel each tick; the sweat drop of an error
const ZED = ['zzzz', '..z.', '.z..', 'zzzz']
const DROP = ['.b', 'bb', 'wb']

// little drawings outlined in dark, set over `px` with their top-left at (x, y)
const sticker = (px: Pixels, w: number, h: number, x: number, y: number, rows: readonly string[], colours: Record<string, number>): void => {
  const buf = new Int32Array(w * h).fill(CLEAR)
  rows.forEach((row, dy) =>
    [...row].forEach((ch, dx) => {
      const X = x + dx
      const Y = y + dy
      if (ch !== '.' && X >= 0 && Y >= 0 && X < w && Y < h) buf[Y * w + X] = colours[ch] ?? INK
    }),
  )
  outline(buf, w, h)
  over(px, buf)
}

// The badge: a speech bubble up and to the left of the head (`left` is the
// head's leftmost column near its top, `top` the row its hair begins on), a
// sweat drop on the head's side for an error, a drifting z asleep. During a
// jutsu only an alert shows (and the ✓ of a turn done, during the cheer that
// celebrates it). A bubble or z with no room right of column `from` (the
// first column shown) is left out rather than cut or pushed over the hair.
const badge = (px: Pixels, w: number, h: number, st: ChibiState, left: number, from: number, top = 0): void => {
  const b = st.badge
  if (!b || (st.move && b !== 'alert' && !(b === 'done' && st.move.index === CHEER_INDEX))) return
  if (b === 'error') {
    sticker(px, w, h, left - 1, top + 6, DROP, { b: 0x5aa8f0, w: 0xe0f2ff })
    return
  }
  if (b === 'sleep') {
    if (left - 6 >= from) sticker(px, w, h, left - 6, top + 5 - (st.tick % 3), ZED, { z: 0xdcd8f4 })
    return
  }
  const name = iconOf(b)
  if (!name) return
  const icon = ICONS[name]!
  // the bubble: a 7x7 face, its corners clipped, inside its outline, and a
  // tail two pixels long slanting down toward the head
  const x = left - 10
  const y = top
  if (x < from) return
  const rows: string[] = []
  for (let r = 0; r < 10; r++) {
    let row = ''
    for (let c = 0; c < 10; c++) {
      const corner = (r === 1 || r === 7) && (c === 1 || c === 7)
      const inside = r >= 1 && r <= 7 && c >= 1 && c <= 7 && !corner
      const tail = (r === 8 && c === 6) || (r === 9 && c === 7)
      if (!inside && !tail) {
        row += '.'
        continue
      }
      let ch = inside ? icon[r - 1]![c - 1]! : '.'
      if (name === 'think' && inside && r - 1 === 3 && ch !== '.' && (c - 2) / 2 === st.tick % 3) ch = '.'
      if (name === 'think' && inside && r - 1 === 2 && (c - 2) / 2 === st.tick % 3) ch = 'k'
      row += ch === '.' ? 'W' : ch
    }
    rows.push(row)
  }
  sticker(px, w, h, x, y, rows, { ...ICON_COLOURS, W: BUBBLE })
}

// The ninja's frame, `w` by `h` pixels (`from`: the first column it will
// show): the stage composed from their cels (sprite/), set in the canvas by
// its right edge and the ground (a narrower one shows the arena cut, a
// shorter one the top cut), the badge over it by the head where the pose put
// it. Between jutsu a flicker of chakra burns in their outline.
const render = (st: ChibiState, glow: number, w: number, h: number, from = 0): Rendered => {
  // (an id no ninja has, say a hero stored by another version, draws the
  // default ninja at rest rather than nothing)
  const n = NATIVE[st.id] ?? NATIVE['kakashi']!
  const level = Math.min(1, (st.aura - 0.25) / 0.75)
  const lit = mixc(auraOf(st.id, glow), OUTLINE, level >= 0.6 ? 0.3 : 0.55)
  const f = frameOf(n, st, index => playOf(st.id, index), { flicker: lit, chakra: auraOf(st.id, glow) })
  const ox = Math.max(0, w) - STAGE_W
  const oy = Math.max(0, h) - STAGE_H
  let px = f.px
  if (ox !== 0 || oy !== 0) {
    px = new Int32Array(Math.max(0, w) * Math.max(0, h)).fill(CLEAR)
    for (let y = Math.max(0, -oy); y < STAGE_H && y + oy < h; y++)
      for (let x = Math.max(0, -ox); x < STAGE_W && x + ox < w; x++) px[(y + oy) * w + x + ox] = f.px[y * STAGE_W + x]!
  }
  const hd = f.head
  const at: HeadAt | null = hd ? { x: hd.x + ox, y: hd.y + oy, top: hd.top + oy, eyes: hd.eyes + oy, neck: hd.neck + oy, left: hd.left + ox } : null
  badge(px, w, h, st, at ? at.left : peekLeftOf(n) + ox, from, Math.max(0, at ? at.top : oy))
  return { px, head: at }
}

// the ninja's frame as pixels, `w` by `h`
export const sprite = (st: ChibiState, glow: number, w: number, h: number): Pixels => render(st, glow, w, h).px

// ------------------------------------------------------------------ the peek's camera

// The peek has no arena to hold still against, so in a move its 22 columns
// are a camera on the ninja, worked out once a move (and width) and kept:
//   - it follows the head where the move takes it (a dash to the post), the
//     head whole, a column to spare
//   - on the action (a release, a blow, a hit, a dash, a flurry; a frame
//     that shakes or flashes) it leads: it slides toward the post to frame
//     the body (a kick's leg) and the effects where they land, as far as
//     keeps the face (the far eye) in view, the back of the head cropped
//   - between, it leads only to an effect riding the figure (at its hand,
//     head or feet) of 4 x 4 pixels or more, held four frames or more: a
//     Rasengan forming in the hand, never a puff of sweat or the post's poof
//   - an effect over the face (an aura, steam round the body) frames nothing
//     more than the face does
//   - an effect beyond its reach (a fireball landing on the post 15 pixels
//     off), or of which it could show only a sliver, frames nothing: it
//     never leads into empty air
//   - in a band too short for the whole ninja it tilts down to the effects,
//     the eyes kept three rows from its top
//   - it eases into a lead a frame early (halfway) and back out over three
//     frames, never a jump cut; a lead that wavers a pixel holds still
const ACTION = /^(release|impact|hit|finish|dash|rush|slam|strike|throw|launch|jab|palms|kick|burst|crush|fly|dive|swing|katsu|spit|flood|carpet)\d*$/
// frames an effect riding the figure must hold to be led to outside the action
const HELD = 4
type Camera = { x: Int16Array; down: Int8Array }
const cameras = new WeakMap<CelMove, Map<string, Camera>>()

// the peek's first column on the canvas (W wide, the stage at its right) as
// it follows a head at `hx`; `base` its column at rest
const followOf = (base: number, hx: number | undefined, W: number, cols: number): number =>
  hx === undefined ? base : Math.max(0, Math.min(W - cols, Math.min(base, hx - 1), Math.max(base, hx + HEAD_W + 1 - cols)))

const cameraOf = (n: NinjaSprite, m: CelMove, W: number, cols: number): Camera => {
  let byCols = cameras.get(m)
  if (!byCols) cameras.set(m, (byCols = new Map()))
  const key = `${n.id}:${W}:${cols}`
  let cam = byCols.get(key)
  if (cam) return cam
  const F = m.frames
  const N = F.length
  const ox = W - STAGE_W
  const base = Math.max(0, Math.min(W - cols, ox + peekLeftOf(n)))
  const follow: number[] = []
  const reach: number[] = []
  // the lead (columns left of following, 0 or less) and tilt (rows down) a
  // frame asks for: on the action, and between it
  const act = { lead: [] as number[], tilt: [] as number[] }
  const held = { lead: [] as number[], tilt: [] as number[] }
  const acts: boolean[] = []
  for (let j = 0; j < N; j++) {
    const fr = F[j]!
    const fo = focusOf(n, fr, fr.t)
    const fw = followOf(base, fo ? fo.head.x + ox : undefined, W, cols)
    follow.push(fw)
    acts.push(ACTION.test(fr.tag) || fr.shake !== undefined || fr.flash !== undefined)
    if (!fo) {
      reach.push(fw)
      for (const a of [act, held]) a.lead.push(0), a.tilt.push(0)
      continue
    }
    // as far as keeps the face; the boxes within reach of that
    const most = Math.max(0, Math.min(fw, fo.keep + ox + 1 - cols))
    reach.push(most)
    const frame = (boxes: Box[], body: boolean): void => {
      const a = body ? act : held
      let left = body ? fo.body[0] + ox : Infinity
      let low = -1
      for (const b of boxes) {
        // (a box the lead would show a sliver of, 3 columns or fewer, is out of reach too)
        if (b[2] + ox < most + Math.min(3, b[2] - b[0])) continue
        left = Math.min(left, b[0] + ox)
        // (dust on the ground frames nothing above the feet)
        if (b[1] < GROUND - 3) low = Math.max(low, b[3])
      }
      a.lead.push(Number.isFinite(left) ? Math.min(0, Math.max(most, left - 1) - fw) : 0)
      // rows the effects reach below the eyes' three (the peek's bottom at rest)
      a.tilt.push(Math.max(0, low + 1 - (fo.head.eyes + 2)))
    }
    const big = (b: Box, min: number): boolean => b[2] - b[0] + 1 >= min && b[3] - b[1] + 1 >= min
    // (an effect over the face, an aura or steam round the body, frames nothing more than the face)
    const mid = fo.head.x + (HEAD_W >> 1)
    const shown = fo.fx.filter(e => !(e.box[0] <= mid && e.box[2] >= mid && e.box[1] <= fo.head.eyes && e.box[3] >= fo.head.eyes))
    frame(shown.filter(e => big(e.box, 3)).map(e => e.box), true)
    frame(shown.filter(e => e.rides && big(e.box, 4)).map(e => e.box), false)
  }
  // between the action, a lead only where it holds HELD frames running
  const want = { lead: act.lead.map((v, j) => (acts[j] ? v : 0)), tilt: act.tilt.map((v, j) => (acts[j] ? v : 0)) }
  const asks = (j: number): boolean => held.lead[j]! < 0 || held.tilt[j]! > 0
  for (let j = 0; j < N; ) {
    if (acts[j] || !asks(j)) {
      j++
      continue
    }
    let e = j
    while (e < N && !acts[e] && asks(e)) e++
    if (e - j >= HELD) for (let i = j; i < e; i++) (want.lead[i] = held.lead[i]!), (want.tilt[i] = held.tilt[i]!)
    j = e
  }
  const x = new Int16Array(N)
  const down = new Int8Array(N)
  let D = 0
  let E = 0
  for (let j = 0; j < N; j++) {
    let td = want.lead[j]!
    let te = want.tilt[j]!
    // a frame early, halfway
    if (j + 1 < N) {
      td = Math.min(td, Math.trunc(want.lead[j + 1]! / 2))
      te = Math.max(te, Math.trunc(want.tilt[j + 1]! / 2))
    }
    // snap to a deeper lead; hold through a pixel's waver; else ease back (3 frames)
    if (td <= D) D = td
    else if (!(td < 0 && td - D <= 1)) D += Math.ceil((td - D) * 0.6)
    if (te >= E) E = te
    else if (!(te > 0 && E - te <= 1)) E -= Math.ceil((E - te) * 0.6)
    x[j] = Math.max(reach[j]!, Math.min(W - cols, follow[j]! + D))
    down[j] = Math.min(127, E)
  }
  byCols.set(key, (cam = { x, down }))
  return cam
}

// ------------------------------------------------------------------ outputs

const UPPER = 0x2580
const LOWER = 0x2584
const FULL = 0x2588
const SPACE = 0x20
const DEFAULT = 0x01000000

// The frame as terminal cells (glyph, foreground, background per cell), two
// pixels a cell: the upper one in the foreground of ▀, the lower behind it.
// `view` picks what of the sprite a band of `rows` shows:
//   'stage': the whole stage, `rows` tall (the arena opens left as `cols` grows);
//   'peek':  the sprite's right `cols` columns (22 hold the whole head),
//            pixel for pixel and lined up with the stage's right edge (a
//            native ninja's from PEEK_LEFT, their head whole), its bottom a
//            row under the eyes when `rows` is too short for all of him: the
//            head peeking up from the band's bottom edge (at 12 rows, the
//            whole ninja without the arena).
export const pixelCells = (st: ChibiState, glow: number, cols: number, rows: number, map: (c: number) => number = c => c, view: 'stage' | 'peek' = 'stage'): Uint32Array => {
  const h = rows * 2
  let px: Pixels
  let W = cols
  let x0 = 0
  let y0 = 0
  if (view === 'stage') px = render(st, glow, cols, h).px
  else {
    const H = SPRITE.rows * 2
    W = Math.max(cols, SPRITE.columns)
    const native = NATIVE[st.id]
    x0 = native ? Math.max(0, Math.min(W - cols, W - STAGE_W + peekLeftOf(native))) : W - cols
    // in a move, the camera (cameraOf): following the head, leading the action
    const m = native && st.move ? playOf(st.id, st.move.index) : undefined
    let down = 0
    if (native && m && m.frames.length > 0) {
      const cam = cameraOf(native, m, W, cols)
      const j = Math.max(0, Math.min(m.frames.length - 1, Math.floor(st.move!.t / FRAME + 1e-6) || 0))
      x0 = cam.x[j]!
      down = cam.down[j]!
    }
    let f = render(st, glow, W, H, x0)
    // (a move the engine has no cels for: the window follows the head)
    const hx = f.head?.x
    if (st.move && !m && hx !== undefined) {
      const to = followOf(x0, hx, W, cols)
      if (to !== x0) f = render(st, glow, W, H, (x0 = to))
    }
    px = f.px
    // its bottom three rows under the eyes; tilted down to the action, the eyes
    // kept three rows from its top
    const eyes = f.head?.eyes ?? 12
    y0 = Math.max(0, Math.min(H - h, eyes + 3 - h + Math.min(down, Math.max(0, h - 6))))
  }
  const words = new Uint32Array(cols * rows * 3)
  const H = px.length / W
  const pixel = (x: number, y: number): number => {
    const X = x + x0
    const Y = y + y0
    return X < 0 || Y < 0 || X >= W || Y >= H ? CLEAR : px[Y * W + X]!
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const top = pixel(c, r * 2)
      const low = pixel(c, r * 2 + 1)
      const o = (r * cols + c) * 3
      if (top === CLEAR && low === CLEAR) {
        words[o] = SPACE
        words[o + 1] = DEFAULT
        words[o + 2] = DEFAULT
      } else if (top === CLEAR) {
        words[o] = LOWER
        words[o + 1] = map(low)
        words[o + 2] = DEFAULT
      } else if (low === CLEAR) {
        words[o] = UPPER
        words[o + 1] = map(top)
        words[o + 2] = DEFAULT
      } else if (top === low) {
        words[o] = FULL
        words[o + 1] = map(top)
        words[o + 2] = map(top)
      } else {
        words[o] = UPPER
        words[o + 1] = map(top)
        words[o + 2] = map(low)
      }
    }
  return words
}

// The same sprite as SVG, for the desktop's band of w by h: 24 pixels tall
// (and at least the terminal stage's 48 across, more for a wider band), one
// <rect> for each run of a colour along a row, standing at the band's bottom.
export const spriteSvg = (st: ChibiState, glow: number, w: number, h: number): string => {
  const H = SPRITE.rows * 2
  const W = Math.max(SPRITE.columns, Math.round((H * w) / Math.max(1, h)))
  const px = render(st, glow, W, H).px
  let body = ''
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; ) {
      const c = px[y * W + x]!
      let e = x + 1
      while (e < W && px[y * W + e] === c) e++
      if (c !== CLEAR) body += `<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="#${c.toString(16).padStart(6, '0')}"/>`
      x = e
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" shape-rendering="crispEdges">${body}</svg>`
}
