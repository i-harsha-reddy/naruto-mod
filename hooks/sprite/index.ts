// The sprite engine: every ninja drawn from hand-placed pixels (see types.ts
// for the format), every frame: at rest, at work and in every move. The one
// seam is pixel.ts's render(), which asks `frameOf` for a ninja's stage;
// moves.ts's playOf hands the companion their CelMoves.
//
// ADDING A NINJA is one line here. Write ninja/<id>.ts (ninja/kakashi.ts is
// the model: a NinjaSprite built on a template, with its moves from
// anims/<id>.ts), end it with `register(THEIR_SPRITE)` (registry.ts), and
// import the file below, once:
//
//     import './ninja/naruto.ts'
//
// From then on the mod draws them everywhere (rest, work, every move, the
// desktop) and plays their cel moves. Their roster entry (roster.ts) is who
// they are and their voice.
//
// Layout:
//   types.ts        the data format (Template, PoseGrid, NinjaSprite,
//                   FxFamily, Cel, CelMove), and what a ninja and a cel can carry
//   grid.ts         letter grids and palettes to pixels
//   stage.ts        the 48 x 24 stage: the ground, home, the post's place
//   post.ts         the training post's drawings
//   templates/      outfits, drawn once in semantic letters (vest.ts)
//   ninja/          each ninja: palette, head, eyes, poses, props, moves
//   registry.ts     NATIVE, which each ninja's file registers itself in
//   dress.ts        a ninja's own copy of their template (their poses, overlays)
//   fx/             the effect library (lightning, aura, smoke, dust,
//                   impact, Kamui's vortex, the summoning seal, the summons)
//   anims/          moves as cel lists (kakashi.ts; kit.ts: the shorthand;
//                   shared.ts: the arrival, fizzle and dispel every native ninja gets)
//   cels.ts         cels to the mod's Move: beats from the cels' tags
//   compose.ts      the compositor: a stage frame from a cel

import type { ChibiState } from '../art/chibi.ts'
import { arrivalOf, chargeHandOf, dispelOf, fizzleOf } from './anims/shared.ts'
import { eyesOfCel, eyesOfFace, faceOfEyes, frameAt, poseOf } from './cels.ts'
import type { FaceLike } from './cels.ts'
import { compose } from './compose.ts'
import type { Composed } from './compose.ts'
import { dressOf, namesOf } from './dress.ts'
import { HOME, STAGE_W } from './stage.ts'
import type { Cel, CelMove, Frame, FxUse, NinjaCel, NinjaSprite, PostFrame, XY } from './types.ts'

// ------------------------------------------------------------------ the ninja, a line each
import './ninja/kakashi.ts'
import './ninja/naruto.ts'
import './ninja/hinata.ts'
import './ninja/sasuke.ts'
import './ninja/sakura.ts'
import './ninja/tsunade.ts'
import './ninja/jiraiya.ts'
import './ninja/madara.ts'
import './ninja/shikamaru.ts'
import './ninja/guy.ts'
import './ninja/minato.ts'
import './ninja/lee.ts'
import './ninja/gaara.ts'
import './ninja/neji.ts'
import './ninja/orochimaru.ts'
import './ninja/itachi.ts'
import './ninja/kisame.ts'
import './ninja/deidara.ts'
import './ninja/pain.ts'
import './ninja/obito.ts'

export { NATIVE, register } from './registry.ts'
export { PEEK_LEFT, STAGE_H, STAGE_W } from './stage.ts'

// The shared moves in a ninja's own template, made once each.
type Shared = { arrival: CelMove; fizzle: CelMove; dispel: CelMove }
const shared = new WeakMap<NinjaSprite, Shared>()
export const sharedOf = (n: NinjaSprite): Shared => {
  let s = shared.get(n)
  if (!s) {
    const home = n.home ?? HOME
    // (the fizzle's charge breaks apart where their own charge pose holds the hand)
    const o = { home, hand: chargeHandOf(dressOf(n), home) }
    shared.set(n, (s = { arrival: n.arrival ?? arrivalOf(n.template, o), fizzle: n.fizzle ?? fizzleOf(n.template, o), dispel: n.dispel ?? dispelOf(n.template, o) }))
  }
  return s
}

// The ninja at rest (not in a move) as a cel: the companion's pose drawn as
// their template has it; on the breath (`bob` 1) its other breathing frame,
// if it has one, and the head sunk a pixel with it; a drowsy nod (`bob` 2)
// the head dropped two; a slump under gloom lines. The post standing through
// a working turn (`postUp`), and waking (`wake`): what they slept in still
// on through the start, then lifting off in a puff.
const restOf = (n: NinjaSprite, st: ChibiState): Cel => {
  const t = dressOf(n)
  if (st.doze !== undefined && st.doze >= 0) return dozeOf(n, st)
  const name = t.poses[st.pose] ? st.pose : (t.map[st.pose] ?? 'idle0')
  const pose = poseOf(t, name)
  const sink = st.bob >= 1 ? Math.min(2, Math.round(st.bob)) : 0
  const breath = sink > 0 && pose.breath && t.poses[pose.breath] ? pose.breath : undefined
  const fx: FxUse[] = st.pose === 'slump' && st.face.mood === 'worried' ? [{ fx: 'gloom', f: 1, at: 'head', d: [3, 2] }] : []
  const wake = st.wake === undefined ? {} : wakeOf(n, st.wake)
  if (wake.fx) fx.push(...wake.fx)
  return { n: 1, tag: 'rest', k: { pose: breath ?? name, x: n.home ?? HOME, ...(sink ? { hdy: sink } : {}), awake: st.face.active, ...(wake.wear ? { wear: wake.wear } : {}) }, ...(st.postUp ? { post: 'stand' as const } : {}), ...(fx.length ? { fx } : {}) }
}

// ------------------------------------------------------------------ waking

// A sleeper woken, step by step (ChibiState's `wake`): the props worn only
// asleep (Naruto's nightcap) kept on through the start, jolted up a pixel;
// then flung up and off over the arena in a puff; the cloud parting where it
// was; its last puffs. Nothing for one who sleeps in nothing.
const SLEEP = 'sleep'
const wakeOf = (n: NinjaSprite, step: number): { wear?: NinjaCel['wear']; fx?: FxUse[] } => {
  if (!n.props?.some(p => p.only?.includes(SLEEP))) return {}
  // (the smoke where the cap rides: over the crown of the head, a little toward the arena)
  const puff = (f: number, d: XY): FxUse => ({ fx: 'smoke', f, at: 'head', d, sink: 0 })
  if (step <= 0) return { wear: { pose: SLEEP, d: [0, -1] } }
  if (step === 1) return { wear: { pose: SLEEP, d: [-3, -3] }, fx: [puff(0, [6, 9])] }
  if (step === 2) return { fx: [puff(2, [7, 8])] }
  if (step === 3) return { fx: [puff(3, [7, 7])] }
  return {}
}

// ------------------------------------------------------------------ nodding off

// A sleeper nodding off, step by step (ChibiState's `doze`), the wake run
// backwards: a yawn (standing on the breath, the head dipped two pixels, a
// sigh out of the mouth); sitting down (the crouch); the sleep pose, a puff
// over the crown bringing on what they sleep in (Naruto's nightcap), or for
// one who sleeps in nothing just the sleep pose; then the puff's last wisps.
const dozeOf = (n: NinjaSprite, st: ChibiState): Cel => {
  const t = dressOf(n)
  const x = n.home ?? HOME
  const step = Math.floor(st.doze ?? 0)
  const post = st.postUp ? { post: 'stand' as const } : {}
  const awake = st.face.active
  if (step <= 0) {
    const idle = poseOf(t, 'idle0')
    const pose = idle.breath && t.poses[idle.breath] ? idle.breath : 'idle0'
    return { n: 1, tag: 'rest', k: { pose, x, hdy: 2, awake }, ...post, fx: [{ fx: 'sigh', f: 0, at: 'head', d: [-1, 15] }] }
  }
  if (step === 1) return { n: 1, tag: 'rest', k: { pose: t.poses['crouch'] ? 'crouch' : 'sleep', x, awake }, ...post, fx: [{ fx: 'sigh', f: 1, at: 'head', d: [-3, 13] }] }
  const capped = n.props?.some(p => p.only?.includes(SLEEP)) === true
  const puff = (f: number, d: XY): FxUse => ({ fx: 'smoke', f, at: 'head', d, sink: 0 })
  const fx: FxUse[] = !capped ? [] : step === 2 ? [puff(1, [8, 6])] : step === 3 ? [puff(3, [8, 6])] : []
  return { n: 1, tag: 'rest', k: { pose: 'sleep', x, awake }, ...post, ...(fx.length ? { fx } : {}) }
}

// ------------------------------------------------------------------ the post through a turn

// A move's frames as they touch the post, found once: the first frame with
// the post (or its poof in), the post its poof in leaves standing, the
// first frame of its poof out and the post that cloud covers, the last frame
// with the post (or its poof out).
type PostPlan = { first: number; inPost: PostState; outAt: number; outPost: PostState; last: number }
type PostState = { post: PostFrame | null; pdx: number; pdy: number }
const plans = new WeakMap<CelMove, PostPlan>()
const planOf = (m: CelMove): PostPlan => {
  let p = plans.get(m)
  if (p) return p
  const F = m.frames
  const has = (f: Frame): boolean => !!f.post || f.poof !== undefined
  const first = F.findIndex(has)
  let last = -1
  for (let i = F.length - 1; i >= 0; i--) if (has(F[i]!)) { last = i; break }
  const ins = F.filter(f => f.poof === 'in')
  const lit = ins.find(f => f.post) ?? null
  // the last run of the poof out
  let outAt = -1
  for (let i = F.length - 1; i >= 0; i--) if (F[i]!.poof === 'out') outAt = i
    else if (outAt >= 0) break
  const cloud = outAt >= 0 ? F[outAt]! : null
  const stateOf = (f: Frame | null): PostState => ({ post: f?.post ?? null, pdx: f?.pdx ?? 0, pdy: f?.pdy ?? 0 })
  p = { first: first < 0 ? Infinity : first, inPost: lit ? stateOf(lit) : { post: 'stand', pdx: 0, pdy: 0 }, outAt: outAt < 0 ? Infinity : outAt, outPost: stateOf(cloud), last }
  plans.set(m, p)
  return p
}

// the post's own poof (kit.ts's smokeAt and wispsAt); in a poof cel, any
// smoke at a stage pixel too (a poof drawn where the post was hauled to)
const postSmoke = (e: FxUse): boolean => e.fx === 'smoke' && e.at === 'post'
const poofSmoke = (e: FxUse): boolean => postSmoke(e) || (e.fx === 'smoke' && Array.isArray(e.at))
const unpoofed = (f: Frame, post: PostFrame | null, more: FxUse[] = []): Frame => {
  const { pdx: _x, pdy: _y, ...rest } = f
  const keep = f.post ? { ...(f.pdx ? { pdx: f.pdx } : {}), ...(f.pdy ? { pdy: f.pdy } : {}) } : {}
  return { ...rest, ...keep, post, fx: [...(f.fx ?? []).filter(e => !(f.poof ? poofSmoke(e) : postSmoke(e))), ...more] }
}
const plain = (s: PostState, lean = false): boolean => (s.post === 'stand' || (lean && s.post === 'lean')) && !s.pdx && !s.pdy

// A move's frame with the post kept up through a working turn (ChibiState's
// postUp, postStays):
//   - before the move's first post frame and through its poof in, the post
//     standing, no smoke (unless it arrives other than plain standing:
//     scarred, hauled; then its puff plays as drawn)
//   - through its poof out and after, the post left standing, no smoke (a
//     post left damaged or hauled: the cloud over it as drawn, then the post
//     standing in the cloud's last puffs)
//   - a move that does away with the post and never poofs it out (Kamui
//     wrings it away, a Shinra Tensei blasts it to bits) plays as drawn, and
//     a new post poofs in over its last two frames (the cloud, then the post
//     standing in its last puffs)
//   - a move that never draws the post: the post standing through it
const SMOKE_IN: FxUse = { fx: 'smoke', f: 1, at: 'post', d: [0, 6] }
const SMOKE_LAST: FxUse = { fx: 'smoke', f: 3, at: 'post', d: [0, 6] }
const withPost = (m: CelMove, f: Frame, up: boolean, stays: boolean): Frame => {
  const p = planOf(m)
  const i = f.t
  const n = m.frames.length
  if (p.last < 0) return up || stays ? unpoofed(f, 'stand') : f
  if (up && i < p.first) return unpoofed(f, 'stand')
  if (up && f.poof === 'in' && plain(p.inPost)) return unpoofed(f, f.post ?? 'stand')
  if (!stays) return f
  if (p.outAt < n) {
    if (f.poof === 'out' && i >= p.outAt) {
      if (plain(p.outPost, true)) return unpoofed(f, f.post ?? 'stand')
      return i === p.outAt ? f : { ...unpoofed(f, 'stand', [SMOKE_LAST]), pdx: 0, pdy: 0 }
    }
    return i > p.last ? unpoofed(f, 'stand') : f
  }
  // (no poof out: the post done away with, or standing to the end)
  if (i <= p.last) return f
  if (p.last >= n - 2) return unpoofed(f, 'stand')
  if (i === n - 2) return unpoofed(f, null, [SMOKE_IN])
  if (i === n - 1) return unpoofed(f, 'stand', [SMOKE_LAST])
  return f
}

// the post leaving as a turn ends (ChibiState's postOut), over a frame: the
// cloud over it standing, then two small wisps where it stood
const leaving = (cel: Cel, step: number): Cel => {
  const fx = (cel.fx ?? []).filter(e => !postSmoke(e))
  if (step <= 0) return { ...cel, post: cel.post ?? 'stand', fx: [...fx, { fx: 'smoke', f: 1, at: 'post', d: [0, 6] }] }
  return { ...cel, post: null, fx: [...fx, { fx: 'smoke', f: 4, at: 'post', d: [0, -8], sink: 11 }] }
}

// The first column of the terminal's 22-column peek for a ninja: their head
// whole at rest, from its outline (10 left of where they stand), on the stage
export const peekLeftOf = (n: NinjaSprite): number => Math.max(0, Math.min(STAGE_W - 22, (n.home ?? HOME) - 10))

// faces a pose's own eyes give way to: a blink, sleep, a start, worry (a
// look down, the lids lowered over a read, is the pose's own to draw: a book)
const PLAIN = new Set(['open', 'left', 'focus', 'happy', 'smug'])
const ownEyes = (face: FaceLike): boolean => {
  const e = eyesOfFace(face)
  return PLAIN.has(e) || (e === 'half' && face.blink <= 0.3 && face.mood !== 'sleep')
}

export type FrameOptions = { flicker?: number; chakra?: number }

// The ninja's frame for a state: a move's cel at its time (the face its cel
// asks for), or at rest (the companion's face; a pose's own eyes in the
// ninja's poseEyes over a plain look or a look down, never over a blink).
// `flicker` is the outline's colour for
// a flicker of chakra between jutsu, `chakra` their glow (an afterimage's).
// `play` finds the state's move (moves.ts's playOf).
export const frameOf = (n: NinjaSprite, st: ChibiState, play: (index: number) => CelMove | undefined, o: FrameOptions = {}): Composed => {
  const m = st.move ? play(st.move.index) : undefined
  if (m) {
    let f = frameAt(m, st.move!.t)
    if (st.postUp || st.postStays) f = withPost(m, f, st.postUp === true, st.postStays === true)
    if (st.postOut !== undefined) f = { ...leaving(f, st.postOut), t: f.t }
    let face: FaceLike = faceOfEyes('open')
    if (f.k) {
      const [asked, drawn] = namesOf(dressOf(n), f.k.pose)
      const eyes = f.k.eyes ?? n.poseEyes?.[asked] ?? n.poseEyes?.[drawn] ?? poseOf(dressOf(n), f.k.pose).eyes ?? eyesOfCel(dressOf(n), f.k)
      face = { ...faceOfEyes(eyes, f.k.awake === true), eyes }
    }
    return compose(n, f, f.t, face, { chakra: o.chakra, move: true })
  }
  let cel = restOf(n, st)
  if (st.postOut !== undefined) cel = leaving(cel, st.postOut)
  let face: FaceLike = { blink: st.face.blink, gaze: st.face.gaze, mood: st.face.mood, active: st.face.active }
  const own = n.poseEyes?.[st.pose] ?? n.poseEyes?.[cel.k!.pose]
  if (own && ownEyes(face)) face = { ...face, eyes: own }
  return compose(n, cel, 0, face, { chakra: o.chakra, ...(st.aura > 0 && o.flicker !== undefined ? { glow: o.flicker } : {}) })
}
