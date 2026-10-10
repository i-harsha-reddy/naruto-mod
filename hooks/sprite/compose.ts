// The compositor: one 48 x 24 stage frame from a cel, every pixel stamped
// from a hand-drawn grid. In order, back to front:
//   1 the floor shadows: under the post; under the ninja and each clone,
//     smaller the higher they leap
//   2 the effects marked `back` (an aura, a seal on the floor, a stage-sized
//     sky)
//   3 the post (white within its outline on a cel's `flash: 'post'`)
//   4 the clones behind the ninja (z below 0), lowest z first, then the one
//     further right
//   5 the ninja. A figure is drawn: the props slung behind it, the body's
//     lowercase letters, the props' lowercase letters, the head (the
//     dojutsu's head when it is awake), the hand-drawn eyes, the body's
//     UPPERCASE letters over the head (hands in front of the face), the
//     props' UPPERCASE ones.
//     With a `glow`, the figure's outer outline from the hair to the
//     shoulders burns in it (the chakra flickering between jutsu); on a cel's
//     `flash: 'rim'` (or 'silhouette') a white rim is drawn round it, its
//     edge lit toward the chakra. Its pose is
//     the cel's, or in a moving hold (`held`) the pose's Wind drawing or
//     breath (heldOf); in the air its lift is cut short to keep the hair
//     within `clip` of the stage's top
//   6 the clones in front of the ninja (ahead of them, toward the post, or z
//     0 and over), in the same order
//   7 the cel's tint, over all of the above
//   8 the effects in front
// A cel's shake moves everything by whole pixels, the post and its shadow
// too, like a camera's (a cel's `postStill` keeps the post, its shadow and
// its anchor still: the old jolt of everything but the target); a haul of
// the post (pdx) moves its shadow with it. Nothing is scaled, rotated, blurred or blended: a tint recolours
// pixels, never adds any.

import { CLEAR, ALL, BACK, FRONT, compile, mixc, stamp, tableOf } from './grid.ts'
import { FX, FX_PALETTES } from './fx/index.ts'
import { POST, POST_ANCHOR, POST_PALETTE } from './post.ts'
import { GROUND, HOME, POST_HIT, POST_X, SHADOW, STAGE_H, STAGE_W } from './stage.ts'
import { FALLBACK, eyesOfFace, faceOfEyes, poseOf } from './cels.ts'
import type { FaceLike } from './cels.ts'
import { dressOf, namesOf } from './dress.ts'
import type { Cel, CloneCel, Dojutsu, EyeGrid, FxUse, Grid, HandEyes, HeadGrid, NinjaCel, NinjaSprite, PoseGrid, StageTint, Template, XY } from './types.ts'

// Where the head landed: its grid's top-left (x, y), the rows of its hair's
// top, its eyes and its neck, and its leftmost column in its top rows (the
// badge's bubble sits left of it).
export type HeadAt = { x: number; y: number; top: number; eyes: number; neck: number; left: number }

export type Composed = { px: Int32Array; head: HeadAt | null }

const W = STAGE_W
const H = STAGE_H

// ------------------------------------------------------------------ layout

// Where everything of a figure lands on the stage: its pose (from the
// ninja's own template), the names it answers to (asked for, drawn), the
// grid's top-left, the head's, the head grid drawn, the root on the feet,
// the held hand.
export type Layout = { pose: PoseGrid; names: [string, string]; left: number; top: number; hx: number; hy: number; head: HeadGrid; feet: XY; hand: XY | null; wear?: NinjaCel['wear'] }

// A moving hold's frame (NinjaCel's `held`): the drawing it shows, and how
// far its head sinks. The breath and the stirring play together:
//   - with a `<pose>Wind` drawing (under the name asked for, or the one
//     drawn) the pose and it alternate every two frames, and the hold
//     breathes on a slower beat beneath: frames 2-5 of every 8 sink the head
//     a pixel (on the pose's frames of those, its breath drawing if it has
//     one), so even a hold of four frames breathes once
//       0 1 2 3 4 5 6 7: pose pose Wind+1 Wind+1 breath+1 breath+1 Wind Wind
//   - without one, it breathes every other two frames, its breath drawing (if
//     it has one) and the head a pixel down, so the plain drawing never shows
//     more than two frames running
//       0 1 2 3: pose pose breath+1 breath+1
// (A breath drawing keeps the pose's head offset, so the sink is the one drop.)
export const heldOf = (t: Template, k: NinjaCel): { pose: PoseGrid; sink: number } => {
  const pose = poseOf(t, k.pose)
  if (k.held === undefined) return { pose, sink: 0 }
  const i = Math.max(0, Math.floor(k.held))
  const [asked, drawn] = namesOf(t, k.pose)
  const wind = t.poses[`${asked}Wind`] ?? t.poses[`${drawn}Wind`]
  const breath = pose.breath ? t.poses[pose.breath] : undefined
  if (wind) {
    const sink = i % 8 >= 2 && i % 8 < 6 ? 1 : 0
    if (Math.floor(i / 2) % 2 === 1) return { pose: wind, sink }
    return { pose: sink ? (breath ?? pose) : pose, sink }
  }
  if (i % 4 < 2) return { pose, sink: 0 }
  return { pose: breath ?? pose, sink: 1 }
}

// (`ox`, `oy`: a shake)
export const layoutOf = (n: NinjaSprite, k: NinjaCel, ox = 0, oy = 0): Layout => {
  const t = dressOf(n)
  const { pose, sink } = heldOf(t, k)
  const lift = k.lift ?? 0
  let feetY = GROUND - lift + (k.dy ?? 0) + oy
  const x = k.x + ox
  const left = x - t.root
  const dj = k.awake ? n.dojutsu : undefined
  const named = k.head === undefined ? undefined : n.heads?.[k.head]
  if (k.head !== undefined && !named) throw new Error(`${n.id} has no head ${k.head}`)
  const head = named ?? dj?.head ?? n.head
  const [hdx, hdy] = pose.head ?? [0, 0]
  const hx = x - head.neck[0] + hdx + (k.hdx ?? 0)
  let hy = feetY - t.neck - head.neck[1] + hdy + (k.hdy ?? 0) + sink
  // in the air, the hair cut by the stage's top `clip` pixels at most: the lift cut short
  if (k.clip !== undefined && lift > 0) {
    const over = -k.clip + oy - (hy + marksOf(head).top)
    if (over > 0) {
      const d = Math.min(over, lift)
      feetY += d
      hy += d
    }
  }
  const top = feetY - (pose.rows.length - 1)
  return { pose, names: namesOf(t, k.pose), left, top, hx, hy, head, feet: [x, feetY], hand: pose.hand ? [left + pose.hand[0], top + pose.hand[1]] : null, ...(k.wear ? { wear: k.wear } : {}) }
}

// the head's rows of hair top, and its leftmost column in its top eleven rows
const headMarks = new WeakMap<HeadGrid, { top: number; left: number }>()
const marksOf = (h: HeadGrid): { top: number; left: number } => {
  let m = headMarks.get(h)
  if (m) return m
  const top = Math.max(0, h.rows.findIndex(r => /[^. ]/.test(r)))
  let left = Infinity
  h.rows.forEach((r, y) => {
    const i = r.search(/[^. ]/)
    if (y <= 10 && i >= 0) left = Math.min(left, i)
  })
  m = { top, left: Number.isFinite(left) ? left : 0 }
  headMarks.set(h, m)
  return m
}

// ------------------------------------------------------------------ effects

const fxTable = (palette: string | object, override?: string): Int32Array => {
  const p = override !== undefined ? FX_PALETTES[override] : typeof palette === 'string' ? FX_PALETTES[palette] : palette
  if (!p) throw new Error(`no effect palette ${String(override ?? palette)}`)
  return tableOf(p as never)
}

// An effect in the ninja's chakra (FxUse's pal 'chakra'): each of its
// family's colours by its brightness, from a deep shade of the chakra through
// the chakra to near white, so the effect keeps its drawing's light and dark
// (a fizzle's sparks in a Rasengan's blue, a Chidori's white, Guy's red).
// Without a chakra colour (no ninja's glow given) it keeps its own palette.
export const CHAKRA_PAL = 'chakra'
const chakraTables = new WeakMap<object, Map<number, Int32Array>>()
const chakraTable = (palette: string | object, chakra: number): Int32Array => {
  const p = (typeof palette === 'string' ? FX_PALETTES[palette] : palette) as Record<string, number | null> | undefined
  if (!p) throw new Error(`no effect palette ${String(palette)}`)
  let m = chakraTables.get(p)
  if (!m) chakraTables.set(p, (m = new Map()))
  let table = m.get(chakra)
  if (!table) {
    const deep = mixc(chakra, 0x0c0c18, 0.6)
    const light = mixc(chakra, 0xffffff, 0.85)
    const lum = (c: number): number => (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255
    const recoloured = Object.fromEntries(Object.entries(p).map(([l, c]) => [l, c === null ? null : lum(c) < 0.5 ? mixc(deep, chakra, lum(c) * 2) : mixc(chakra, light, (lum(c) - 0.5) * 2)]))
    m.set(chakra, (table = tableOf(recoloured)))
  }
  return table
}

// (an effect at a stage pixel moves with the shake `ox`, `oy`; the named
// anchors have it already; `chakra` the ninja's colour, for pal 'chakra')
const drawFx = (px: Int32Array, list: readonly FxUse[] | undefined, back: boolean, t: number, anchors: Record<string, XY | null>, ox: number, oy: number, chakra?: number): void => {
  if (!list) return
  for (const e of list) {
    if (!!e.back !== back) continue
    const fam = FX[e.fx]
    if (!fam) throw new Error(`no effect ${e.fx}`)
    const count = fam.frames.length
    const fi = e.f === 'cycle' ? (((t + (e.phase ?? 0)) % count) + count) % count : Math.max(0, Math.min(count - 1, e.f))
    const fr = fam.frames[fi]!
    const rows = 'rows' in fr ? fr.rows : fr
    const anchor = 'rows' in fr ? fr.anchor : fam.anchor
    const base: XY | null = typeof e.at === 'string' ? anchors[e.at]! : [e.at[0] + ox, e.at[1] + oy]
    if (!base) continue
    const [dx, dy] = e.d ?? [0, 0]
    const sink = e.sink ?? 0
    const ax = e.flip ? compile(rows).w - 1 - anchor[0] : anchor[0]
    const by = base[1] + dy
    const table = e.pal === CHAKRA_PAL ? (chakra === undefined ? fxTable(fam.palette) : chakraTable(fam.palette, chakra)) : fxTable(fam.palette, e.pal)
    stamp(px, W, H, rows, base[0] + dx - ax, by - anchor[1] + sink, table, ALL, e.flip === true, sink > 0 ? by + 1 : Infinity)
  }
}

// ------------------------------------------------------------------ props

type Placed = { rows: Grid; x: number; y: number; table: Int32Array; behind: boolean; onto: Set<number> | null }

// where a prop's anchor is in this layout: the head, the grid, the feet, or a point of the pose
const anchorOf = (n: NinjaSprite, on: string, L: Layout): XY | null => {
  if (on === 'head') return [L.hx, L.hy]
  if (on === 'grid') return [L.left, L.top]
  if (on === 'feet') return L.feet
  if (on === 'hand') return L.hand
  const p = L.pose.points?.[on] ?? dressOf(n).points?.[on]
  return p ? [L.left + p[0], L.top + p[1]] : null
}

const ontoSets = new WeakMap<NinjaSprite, Map<string, Set<number>>>()
const ontoOf = (n: NinjaSprite, letters: string): Set<number> => {
  let m = ontoSets.get(n)
  if (!m) ontoSets.set(n, (m = new Map()))
  let s = m.get(letters)
  if (!s) {
    s = new Set([...letters].map(l => n.body[l]).filter((c): c is number => typeof c === 'number'))
    m.set(letters, s)
  }
  return s
}

// the props this figure wears in this pose, placed (and those only of the
// pose it `wear`s too, nudged)
const propsOf = (n: NinjaSprite, L: Layout): Placed[] => {
  if (!n.props) return []
  const [asked, drawn] = L.names
  const out: Placed[] = []
  for (const p of n.props) {
    const worn = L.wear !== undefined && p.only !== undefined && p.only.includes(L.wear.pose) && !p.only.includes(asked) && !p.only.includes(drawn)
    if (p.only && !worn && !p.only.includes(asked) && !p.only.includes(drawn)) continue
    if (!worn && p.skip && (p.skip.includes(asked) || p.skip.includes(drawn))) continue
    const per = p.poses ? (asked in p.poses ? p.poses[asked] : drawn in p.poses ? p.poses[drawn] : undefined) : undefined
    if (per === null && !worn) continue
    const q = per && !worn ? { ...p, ...per } : p
    const base = anchorOf(n, q.on, L)
    if (!base) continue
    const [dx, dy] = worn ? (L.wear!.d ?? [0, 0]) : [0, 0]
    out.push({ rows: q.rows, x: base[0] + q.at[0] + dx, y: base[1] + q.at[1] + dy, table: tableOf(q.palette ?? n.body), behind: q.behind === true, onto: q.onto ? ontoOf(n, q.onto) : null })
  }
  return out
}

// a prop's letters of one layer, only over pixels of the `onto` colours if it has them
const stampProp = (px: Int32Array, p: Placed, layer: number): void => {
  if (!p.onto) return stamp(px, W, H, p.rows, p.x, p.y, p.table, layer)
  const scratch = new Int32Array(W * H).fill(CLEAR)
  stamp(scratch, W, H, p.rows, p.x, p.y, p.table, layer)
  for (let i = 0; i < scratch.length; i++) if (scratch[i] !== CLEAR && p.onto.has(px[i]!)) px[i] = scratch[i]!
}

// ------------------------------------------------------------------ eyes

// an eye grid mirrored onto the viewer's right eye at (ex, ey)
const mirrored = (px: Int32Array, e: EyeGrid, ex: number, ey: number, table: Int32Array): void => {
  const w = compile(e.rows).w
  stamp(px, W, H, e.rows, ex + 2 - e.at[0] - w, ey + e.at[1], table, ALL, true)
}

// the drawn state for a face: the one asked for, its fallback, or open
const stateOf = (E: HandEyes, face: FaceLike): string => {
  const want = face.eyes ?? eyesOfFace(face)
  if (E.states[want]) return want
  const fb = FALLBACK[want]
  return fb && E.states[fb] ? fb : 'open'
}

// the dojutsu's eye for a state (`move`: a null state keeps the eye open)
const dojutsuEye = (D: Dojutsu, state: string, move: boolean): EyeGrid | null => {
  if (D.states && state in D.states) return D.states[state] ?? (move ? (D.eyes ?? null) : null)
  return D.eyes ?? null
}

const drawEyes = (px: Int32Array, n: NinjaSprite, L: Layout, face: FaceLike, move: boolean): void => {
  const hd = L.head
  const [[lx, ly], [rx, ry]] = hd.eyes
  const E = n.eyes
  const table = tableOf(E.palette)
  const state = stateOf(E, face)
  const e = E.states[state]!
  stamp(px, W, H, e.rows, L.hx + lx + e.at[0], L.hy + ly + e.at[1], table)
  const D = face.active ? n.dojutsu : undefined
  const dj = D ? dojutsuEye(D, state, move) : null
  if (E.mirror) {
    // the right eye: hidden (under a headband) unless the dojutsu bares it;
    // the dojutsu's own eye, or this state mirrored
    if (!E.rightHidden || D?.head !== undefined) {
      if (dj) stamp(px, W, H, dj.rows, L.hx + rx + dj.at[0], L.hy + ry + dj.at[1], table)
      else mirrored(px, e, L.hx + rx, L.hy + ry, table)
    }
  } else if (dj) stamp(px, W, H, dj.rows, L.hx + rx + dj.at[0], L.hy + ry + dj.at[1], table)
}

// ------------------------------------------------------------------ a figure

// The ninja (or a clone) in one layout: props behind, body, props, head,
// eyes, the body's and the props' UPPERCASE over the head.
const drawFigure = (px: Int32Array, n: NinjaSprite, L: Layout, face: FaceLike, move: boolean): void => {
  const body = tableOf(n.body)
  const props = propsOf(n, L)
  for (const p of props) if (p.behind) stampProp(px, p, ALL)
  stamp(px, W, H, L.pose.rows, L.left, L.top, body, BACK)
  for (const p of props) if (!p.behind) stampProp(px, p, BACK)
  stamp(px, W, H, L.head.rows, L.hx, L.hy, tableOf(L.head.palette))
  drawEyes(px, n, L, face, move)
  stamp(px, W, H, L.pose.rows, L.left, L.top, body, FRONT)
  for (const p of props) if (!p.behind) stampProp(px, p, FRONT)
}

// The chakra flickering between jutsu: the figure's outline, where it meets
// the clear air, from its top to the shoulders, in the glow's colour.
const burn = (fig: Int32Array, outline: number, glow: number, to: number): void => {
  const last = Math.min(H - 1, to)
  const src = fig.slice(0, (last + 2) * W)
  for (let y = 0; y <= last; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (src[i] !== outline) continue
      if ((x > 0 && src[i - 1] === CLEAR) || (x < W - 1 && src[i + 1] === CLEAR) || y === 0 || src[i - W] === CLEAR || (y < H - 1 && src[i + W] === CLEAR)) fig[i] = glow
    }
}

// An afterimage (a clone's `ghost`): a trace of the ninja, never a filled
// cut-out (a 50% checker of the tone read as a screen-door block at real
// size). Its outline in the tone; a line a pixel inside it, and the figure's
// own inner lines (the outline colour of the body and head: the face, the
// hair's parting, the arms), in a deeper tint of the tone; within those the
// stage showing through, but for a sparse dot of the tint (one pixel in
// eight, fixed to the stage) so a large ghost still reads as a body.
const GHOST_DEEP = 0x14141c
const ghostOf = (layer: Int32Array, tone: number, lines: ReadonlySet<number>): void => {
  const src = layer.slice()
  const tint = mixc(tone, GHOST_DEEP, 0.45)
  const isEdge = (x: number, y: number): boolean => {
    const i = y * W + x
    return x === 0 || x === W - 1 || y === 0 || y === H - 1 || src[i - 1] === CLEAR || src[i + 1] === CLEAR || src[i - W] === CLEAR || src[i + W] === CLEAR
  }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const v = src[i]!
      if (v === CLEAR) continue
      if (isEdge(x, y)) {
        layer[i] = tone
        continue
      }
      const ring = isEdge(x - 1, y) || isEdge(x + 1, y) || isEdge(x, y - 1) || isEdge(x, y + 1)
      const dot = (x & 3) === 0 && ((y >> 1) & 1) === ((x >> 2) & 1) && (y & 1) === 0
      layer[i] = ring || lines.has(v) || dot ? tint : CLEAR
    }
}

// the outline colours of a figure (its body's and its head's 'o')
const linesOf = (n: NinjaSprite, L: Layout): Set<number> => new Set([n.body['o'], L.head.palette['o']].filter((c): c is number => typeof c === 'number'))

// A clone: drawn like the ninja, then (in its own layer) traced in one tone
// for an afterimage (ghostOf) and mirrored about its root column to face
// right, and a puff of smoke over it.
const drawClone = (px: Int32Array, n: NinjaSprite, c: CloneCel, eyes: string | undefined, t: number, o: ComposeOptions, ox: number, oy: number): void => {
  const L = layoutOf(n, c, ox, oy)
  const state = c.eyes ?? eyes ?? n.poseEyes?.[L.names[0]] ?? n.poseEyes?.[L.names[1]] ?? L.pose.eyes ?? 'open'
  const face: FaceLike = { ...faceOfEyes(state, c.awake === true), eyes: state }
  const tone = c.ghost === 'chakra' ? (o.chakra ?? 0xffffff) : c.ghost
  if (!c.flip && tone === undefined) drawFigure(px, n, L, face, true)
  else {
    // a flipped clone is drawn first with its root mid-layer, so none of it is
    // cut off by the stage's edges, then mirrored onto its own root
    const M = c.flip ? layoutOf(n, { ...c, x: W >> 1 }, 0, oy) : L
    const layer = new Int32Array(W * H).fill(CLEAR)
    drawFigure(layer, n, M, face, true)
    if (tone !== undefined) ghostOf(layer, tone, linesOf(n, M))
    const root = L.feet[0]
    const mid = M.feet[0]
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const v = layer[y * W + x]!
        if (v === CLEAR) continue
        const X = c.flip ? root + mid - x : x
        if (X >= 0 && X < W) px[y * W + X] = v
      }
  }
  if (c.puff !== undefined) drawFx(px, [{ fx: 'smoke', f: c.puff, at: L.feet }, { fx: 'smoke', f: c.puff, at: [L.feet[0], L.feet[1] - 10] }], false, t, {}, 0, 0)
}

// the whole stage (all drawn so far) washed or remapped
const tintAll = (px: Int32Array, tint: StageTint): void => {
  for (let i = 0; i < px.length; i++) {
    const c = px[i]!
    if (c === CLEAR) continue
    if ('colour' in tint) px[i] = mixc(c, tint.colour, tint.amount)
    else {
      const l = (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255
      px[i] = mixc(tint.dark, tint.light, l)
    }
  }
}

// ------------------------------------------------------------------ where the action is

// A box of stage pixels, its corners inclusive: [x0, y0, x1, y1].
export type Box = readonly [number, number, number, number]

// the drawn pixels of a grid as a box of its own columns and rows (null: none)
const drawnBoxes = new WeakMap<Grid, Box | null>()
const drawnOf = (rows: Grid): Box | null => {
  if (drawnBoxes.has(rows)) return drawnBoxes.get(rows)!
  const g = compile(rows)
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++)
      if (g.codes[y * g.w + x]) {
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
  const b: Box | null = x1 < 0 ? null : [x0, y0, x1, y1]
  drawnBoxes.set(rows, b)
  return b
}

// Where a cel's action is, without drawing it (the terminal's peek frames it):
//   head  where the head lands (as compose reports it)
//   keep  the last stage column of the face (its far eye, a pixel past): a
//         window may crop the back of the head, never the face
//   body  the box of the figure's drawn pixels, head and pose
//   fx    a box for each effect drawn, cut to the stage (a stage-sized one,
//         a sky or a flood more than 30 pixels wide, left out: it frames
//         nothing), and whether it rides the figure (set at its hand, head,
//         brow, feet or a point of the pose) rather than the post or the stage
//   hand  the pose's hand, if it has one
// Shake is left out: the camera frames the blow, not its jolt.
export type Focus = { head: HeadAt; keep: number; body: Box; fx: { box: Box; rides: boolean }[]; hand: XY | null }
export const focusOf = (n: NinjaSprite, cel: Cel, t: number): Focus | null => {
  const k = cel.k
  if (!k) return null
  const L = layoutOf(n, k)
  const m = marksOf(L.head)
  const head: HeadAt = { x: L.hx, y: L.hy, top: L.hy + m.top, eyes: L.hy + L.head.eyes[0][1], neck: L.hy + L.head.neck[1], left: L.hx + m.left }
  const keep = L.hx + Math.max(L.head.eyes[0][0], L.head.eyes[1][0]) + 1
  let body: Box = [L.hx, head.top, L.hx + compile(L.head.rows).w - 1, head.neck]
  const pb = drawnOf(L.pose.rows)
  if (pb) body = [Math.min(body[0], L.left + pb[0]), Math.min(body[1], L.top + pb[1]), Math.max(body[2], L.left + pb[2]), Math.max(body[3], L.top + pb[3])]
  const hb = drawnOf(L.head.rows)
  if (hb) body = [Math.min(body[0], L.hx + hb[0]), Math.min(body[1], L.hy + hb[1]), Math.max(body[2], L.hx + hb[2]), Math.max(body[3], L.hy + hb[3])]
  const anchors: Record<string, XY | null> = {
    hand: L.hand,
    feet: L.feet,
    head: [L.hx, L.hy],
    brow: [L.hx + m.left, L.hy + m.top],
    post: POST_HIT,
    home: [n.home ?? HOME, GROUND],
  }
  const fx: Focus['fx'] = []
  for (const e of cel.fx ?? []) {
    const fam = FX[e.fx]
    if (!fam) continue
    const count = fam.frames.length
    const fi = e.f === 'cycle' ? (((t + (e.phase ?? 0)) % count) + count) % count : Math.max(0, Math.min(count - 1, e.f))
    const fr = fam.frames[fi]!
    const rows = 'rows' in fr ? fr.rows : fr
    const anchor = 'rows' in fr ? fr.anchor : fam.anchor
    const base: XY | null = typeof e.at === 'string' ? anchors[e.at]! : e.at
    const db = drawnOf(rows)
    if (!base || !db) continue
    const [dx, dy] = e.d ?? [0, 0]
    const sink = e.sink ?? 0
    const w = compile(rows).w
    const ax = e.flip ? w - 1 - anchor[0] : anchor[0]
    const by = base[1] + dy
    const left = base[0] + dx - ax
    const top = by - anchor[1] + sink
    const [gx0, gx1] = e.flip ? [w - 1 - db[2], w - 1 - db[0]] : [db[0], db[2]]
    const x0 = Math.max(0, left + gx0)
    const x1 = Math.min(W - 1, left + gx1)
    const y0 = Math.max(0, top + db[1])
    const y1 = Math.min(H - 1, top + db[3], sink > 0 ? by : Infinity)
    if (x1 < x0 || y1 < y0 || x1 - x0 + 1 > 30) continue
    fx.push({ box: [x0, y0, x1, y1], rides: typeof e.at === 'string' && e.at !== 'post' && e.at !== 'home' })
  }
  return { head, keep, body, fx, hand: L.hand }
}

// ------------------------------------------------------------------ the frame

// A cel's flash (Cel's `flash`): the post kept inside a white rim, or (on
// 'rim', and 'silhouette' drawn the same) the ninja kept as drawn inside a
// white rim a pixel wide, their outermost pixels lit toward their chakra (a
// burst of power, never the whole body blanked white), for the one frame a
// blow lands or a gate opens
const FLASH = 0xffffff

// the rim round a figure drawn in `fig`: the clear pixels touching it (4-way)
// white on the stage, and its own edge pixels (but its shadow) lit halfway
// to `lit`
const rim = (px: Int32Array, fig: Int32Array, lit: number): void => {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const v = fig[i]!
      const near = (x > 0 && fig[i - 1] !== CLEAR) || (x < W - 1 && fig[i + 1] !== CLEAR) || (y > 0 && fig[i - W] !== CLEAR) || (y < H - 1 && fig[i + W] !== CLEAR)
      const out = (x > 0 && fig[i - 1] === CLEAR) || (x < W - 1 && fig[i + 1] === CLEAR) || (y > 0 && fig[i - W] === CLEAR) || (y < H - 1 && fig[i + W] === CLEAR)
      if (v === CLEAR) {
        if (near && y < GROUND) px[i] = FLASH
      } else px[i] = out && y < GROUND ? mixc(v, lit, 0.55) : v
    }
}

// One stage frame. `t` is the frame's index in its move (effects that cycle);
// `face` the face the ninja shows. Options: `glow` the outline's colour while
// chakra flickers between jutsu; `chakra` the ninja's chakra colour (a
// ghost's); `move` a move's cel (the dojutsu's eye open throughout).
export type ComposeOptions = { glow?: number; chakra?: number; move?: boolean }
export const compose = (n: NinjaSprite, cel: Cel, t: number, face: FaceLike, o: ComposeOptions = {}): Composed => {
  const { glow, move = false } = o
  const px = new Int32Array(W * H).fill(CLEAR)
  const [ox, oy] = typeof cel.shake === 'number' ? [cel.shake, 0] : (cel.shake ?? [0, 0])
  // the post shakes with the rest (a camera's shake), unless the cel holds it still
  const [pox, poy] = cel.postStill ? [0, 0] : [ox, oy]
  const k = cel.k
  const L = k ? layoutOf(n, k, ox, oy) : null
  const marks = L ? marksOf(L.head) : null
  const anchors: Record<string, XY | null> = {
    hand: L?.hand ?? null,
    feet: L?.feet ?? null,
    head: L ? [L.hx, L.hy] : null,
    brow: L && marks ? [L.hx + marks.left, L.hy + marks.top] : null,
    post: [POST_HIT[0] + pox, POST_HIT[1] + poy],
    home: [(n.home ?? HOME) + ox, GROUND + oy],
  }
  // the floor shadows: the post's with the post; the figures' shake with them
  const shadow = (x: number, lift: number): void => {
    const y = GROUND + oy
    if (y < 0 || y >= H) return
    const half = Math.max(3, 8 - lift)
    for (let X = Math.max(0, x + ox - half); X < Math.min(W, x + ox + half); X++) px[y * W + X] = SHADOW
  }
  // (the post's follows it when a cel hauls it, `pdx`, and shrinks a pixel a
  // side for each it hops up, `pdy`)
  if (cel.post && GROUND + poy >= 0 && GROUND + poy < H) {
    const pdx = (cel.pdx ?? 0) + pox
    const up = Math.max(0, -(cel.pdy ?? 0))
    for (let x = Math.max(0, POST_X - 3 + pdx + up); x <= Math.min(W - 1, POST_X + 4 + pdx - up); x++) px[(GROUND + poy) * W + x] = SHADOW
  }
  if (k && !k.noShadow) shadow(k.x, k.lift ?? 0)
  const clones = cel.clones ?? []
  for (const c of clones) if (!c.noShadow && c.ghost === undefined) shadow(c.x, c.lift ?? 0)
  drawFx(px, cel.fx, true, t, anchors, ox, oy, o.chakra)
  if (cel.post) {
    const [px0, py0] = [POST_X - POST_ANCHOR[0] + (cel.pdx ?? 0) + pox, GROUND - POST_ANCHOR[1] + (cel.pdy ?? 0) + poy]
    if (cel.flash !== 'post') stamp(px, W, H, POST[cel.post], px0, py0, tableOf(POST_PALETTE))
    else {
      // the blow lands: the post kept as drawn inside a white rim, its edges lit
      // (never a slab of white, which reads as a glitch)
      const lay = new Int32Array(W * H).fill(CLEAR)
      stamp(lay, W, H, POST[cel.post], px0, py0, tableOf(POST_PALETTE))
      rim(px, lay, FLASH)
    }
  }
  // the clones: behind the ninja, or in front when ahead of them (toward the
  // post), unless their z says (the ninja is z 0); lower z first, then the
  // one further right, so the further left is drawn over
  const zOf = (c: CloneCel): number => c.z ?? ((c.front ?? (k ? c.x < k.x : true)) ? 1 : -1)
  const sorted = [...clones].sort((a, b) => zOf(a) - zOf(b) || b.x - a.x)
  for (const c of sorted) if (zOf(c) < 0) drawClone(px, n, c, k?.eyes, t, o, ox, oy)
  let head: HeadAt | null = null
  if (L) {
    const rimmed = cel.flash === 'rim' || cel.flash === 'silhouette'
    if (glow === undefined && !rimmed) drawFigure(px, n, L, face, move)
    else {
      const fig = new Int32Array(W * H).fill(CLEAR)
      drawFigure(fig, n, L, face, move)
      const outline = n.body['o']
      if (glow !== undefined && typeof outline === 'number') burn(fig, outline, glow, L.hy + L.head.neck[1] + 1)
      if (rimmed) rim(px, fig, o.chakra ?? FLASH)
      else for (let i = 0; i < fig.length; i++) if (fig[i] !== CLEAR) px[i] = fig[i]!
    }
    const m = marksOf(L.head)
    head = { x: L.hx, y: L.hy, top: L.hy + m.top, eyes: L.hy + L.head.eyes[0][1], neck: L.hy + L.head.neck[1], left: L.hx + m.left }
  }
  for (const c of sorted) if (zOf(c) >= 0) drawClone(px, n, c, k?.eyes, t, o, ox, oy)
  if (cel.tint) tintAll(px, cel.tint)
  drawFx(px, cel.fx, false, t, anchors, ox, oy, o.chakra)
  return { px, head }
}
