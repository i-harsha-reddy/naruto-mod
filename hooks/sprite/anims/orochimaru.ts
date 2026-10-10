// Orochimaru's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to
// write a move: its helpers hold(), runIn(), hopHome() and leap() are the
// shared motion). Unhurried and smug: snakes out of his sleeve (fx/serpent.ts's
// serpent, reared in the sleeve as serpentCoil), a great snake out of the
// ground (serpentRise), his long tongue (lick), Manda rearing over the arena (fx/summons/manda.ts's mandaRear, his
// head moving), the Kusanagi out of his mouth (his own props,
// ninja/orochimaru.ts, in his own Kusanagi poses). In the blows his head
// turns three-quarters to the post ('turn'). Every frame of a jutsu shows
// the post, a snake or smoke, so none is ever mistaken for him just standing.
//
// The moves are made for his own copy of the robe (ninja/orochimaru.ts's
// OROCHIMARU_ROBE: his hair, the knot, the Kusanagi's poses), so the beats
// name his poses as the companion knows them.

import { celMove } from '../cels.ts'
import { GROUND, HOME, POST_HIT, POST_X } from '../stage.ts'
import type { Cel, CelMove, FxUse, NinjaCel, PostFrame, Template, XY } from '../types.ts'
import type { CelOptions } from './kit.ts'
import { CAST_WEIGHT, K, c, cast, dustAt, fx, hold, postIn, postOut, smokeAt } from './kit.ts'

const smug: Partial<NinjaCel> = { eyes: 'smug' }
const focus: Partial<NinjaCel> = { eyes: 'focus' }
// the head turned to the post, for the blows
const aim = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ eyes: 'focus', head: 'turn', ...o })

// Every move ends settling (the robe's ease, a frame from rest), on idle1
// (the head dipped) for a frame, then idle0 for two as the post poofs away,
// the smile on.
const ending = (frame: PostFrame = 'stand', o: CelOptions = {}): Cel[] => [
  c(1, 'recover', K('ease', smug), { post: frame, ...o }),
  c(1, 'recover', K('idle1', { ...smug, hdy: 1 }), { post: frame, ...o }),
  ...postOut('recover', [K('idle0', smug), K('idle0', smug)], frame).map(cel => ({ ...cel, ...(o.pdy ? { pdy: o.pdy } : {}) })),
]

// A shadow snake out of his sleeve, behind him (so it comes out from under
// the sleeve), its jaws' tip `dx` right of the post's face and `dy` from its
// struck point: frames 0-1 lunging (jaws wide, the body writhing by turns),
// 2-3 clamped (squeezing by turns).
const snake = (f: number, dx: number, dy: number): FxUse => fx('serpent', f, 'post', { back: true, d: [dx, dy] })
// a bite: a violet spark where the jaws close
const bite = (f: number, dy: number): FxUse => fx('sparks', f, 'post', { pal: 'kamui', d: [1, dy] })
// a snake reared up out of the sleeve, waiting, swaying (frame i), behind
// him: `k` the second, a little further out
const coil = (i: number, k = 0): FxUse => fx('serpentCoil', (i + k) % 2, 'hand', { back: true, d: [-2 - 4 * k, k * 2] })
// and sliding back down into the sleeve, `n` pixels sunk
const sunk = (k: number, n: number): FxUse => fx('serpentCoil', k % 2, 'hand', { back: true, d: [-2 - 4 * k, k * 2], sink: n })

// ------------------------------------------------------------------ Striking Shadow Snakes (4.7 s)

// The seals as the post poofs in; the sleeve held out, the heads squirming
// in it; he sinks back on them, the arm cocked; the arm flung out at the post
// as he steps into it, and they strike, one after the other, jaws wide
// ("Shadow Snakes!"), and clamp on the post high and low as the fist clenches,
// rocking him back, a clear gap between them so each reads as a snake of its
// own; then he hauls on them, leaning back on his heels, and squeezes, pulse
// by pulse, the post dragged toward him, his weight rocking with each pull;
// they whip home into the sleeve one after the other, and the smile.
const HEIGHTS = [-4, 4] as const
// each snake's lunge, by frames since the first went: the next a frame behind
const lunge = (f: number): FxUse[] =>
  HEIGHTS.flatMap((dy, i) => {
    const k = f - i
    if (k < 0) return [coil(f, i)]
    if (k === 0) return [snake(0, 9, dy)]
    if (k === 1) return [snake(1, 4, dy)]
    return [snake(2, 0, dy), ...(k < 5 ? [bite(k - 2, dy)] : [])]
  })
// both clamped on, the post squeezed (dx: pulled toward him), the bodies
// squeezing by turns
const clamped = (dx = 0, f = 0): FxUse[] => HEIGHTS.map((dy, i) => snake(2 + ((f + i) % 2), dx, dy))
// the pulls, a frame each: his pose and root (hauling: the arm drawn back,
// leaning back and sunk on his heels, then both hands on them for the
// second; easing: the arm given back to them, a step in), the post and how
// far it is dragged, the snakes' squeeze
const HAUL = HOME + 1
const squeeze: readonly [string, number, number, PostFrame, number, number][] = [
  ['windup', HOME, 1, 'lean', 1, 1],
  ['windup', HOME, 1, 'lean', 0, 0],
  ['windup', HOME, 1, 'lean', 0, 0],
  ['punch', HOME - 1, 0, 'stand', 0, 0],
  ['punch', HOME - 1, 0, 'stand', 0, 0],
  ['punch', HOME - 1, 0, 'stand', 0, 0],
  ['charge', HOME + 1, 1, 'lean', 1, 1],
  ['charge', HOME + 1, 1, 'lean', 1, 0],
  ['charge', HOME + 1, 1, 'lean', 1, 0],
  ['punch', HOME, 0, 'stand', 0, 0],
]
const snakesCels: Cel[] = [
  ...postIn('signs', [K('sign1', { ...smug, hdy: 1 }), K('sign1', smug), K('sign2', { hdy: 1 }), K('sign2')]),
  ...hold(3, 'signs', K('sign2'), { post: 'stand', phase: 2 }),
  c(1, 'signs', K('sign3', { hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign3'), { post: 'stand' }),
  // the sleeve held out, a snake rearing up out of it, then a second
  c(1, 'charge', K('gather', { ...smug, hdy: 1 }), { post: 'stand', fx: [coil(0)] }),
  ...hold(4, 'charge', K('gather', smug), i => ({ post: 'stand', fx: [coil(i + 1), ...(i >= 2 ? [coil(i, 1)] : [])] })),
  // the cast: sunk back on them, the arm cocked; flung out, stepping into it:
  // they strike; they bite as the fist clenches, rocking him back
  // (creepy-light: the arm whipped out two pixels past its mark, the kick of
  // it on the release, not when the snakes bite twenty pixels off)
  ...cast({
    weight: 'light',
    recoil: 'release',
    gather: { n: 4, tag: 'charge', pose: 'windup', hold: true, d: i => [-CAST_WEIGHT.light.gather(i).x, 0], k: i => ({ ...focus, ...(i === 0 ? { hdy: 1 } : {}) }), fx: i => [coil(i), coil(i, 1)] },
    release: { n: 2, k: i => aim(i === 0 ? { hdy: 1 } : {}), fx: i => lunge(i) },
    impact: { n: 3, tag: 'hit', pose: 'punch', k: aim(), o: i => ({ post: 'lean', ...(i === 0 ? { flash: 'post' as const, shake: [-1, 0] as XY } : i === 1 ? { shake: [1, 0] as XY } : { pdx: -1 }), fx: lunge(i + 2) }) },
    settle: false,
  }),
  // hauling on them, leaning back on his heels
  c(1, 'wind', K('gather', { ...focus, x: HAUL }), { post: 'stand', pdx: 1, fx: [...clamped(1), bite(2, HEIGHTS[1])] }),
  c(2, 'wind', K('gather', { ...smug, x: HAUL }), { post: 'lean', pdx: 1, fx: clamped(1, 1) }),
  // squeezing, pulse by pulse: each pull held three frames, his weight in it
  ...squeeze.map(([pose, x, dy, post, pdx, dx], i) =>
    c(1, 'impact', K(pose, aim({ ...smug, x, ...(dy ? { dy } : {}), ...(i % 3 === 0 ? { hdy: 1 } : {}) })), { post, pdx, fx: [...clamped(dx, Math.floor(i / 3)), ...(i % 3 < 2 ? [fx('impact', i % 3 === 0 ? 2 : 3, 'post', { pal: 'kamui' })] : [])], ...(i === 6 ? { shake: [-1, 0] as XY } : {}) }),
  ),
  // whipped home into the sleeve, one after the other
  // (the arm flung up as they let go, the sleeve held out low to take them home)
  c(1, 'retract', K('raise', { ...focus, hdy: 1 }), { post: 'stand', fx: [snake(1, 6, HEIGHTS[0]), snake(3, 1, HEIGHTS[1])] }),
  c(1, 'retract', K('raise', focus), { post: 'stand', fx: [snake(0, 12, HEIGHTS[0]), snake(1, 6, HEIGHTS[1])] }),
  c(1, 'retract', K('gather', { ...smug, hdy: 1 }), { post: 'stand', fx: [coil(0), snake(0, 12, HEIGHTS[1])] }),
  c(1, 'retract', K('gather', smug), { post: 'stand', fx: [coil(1), coil(1, 1)] }),
  c(1, 'retract', K('gather', smug), { post: 'stand', fx: [coil(0), sunk(1, 5)] }),
  c(1, 'retract', K('gather', smug), { post: 'stand', fx: [sunk(0, 5)] }),
  c(1, 'retract', K('gather', smug), { post: 'stand', fx: [sunk(0, 9)] }),
  ...ending(),
]
const snakesMove = (t: Template): CelMove => celMove(t, { name: 'Striking Shadow Snakes', shout: 'Shadow Snakes', dojutsu: false, on: ['shell'] }, snakesCels)

// ------------------------------------------------------------------ Summoning Jutsu: Manda (5.1 s)

// The seals as the post poofs in; the palm slapped to the ground, the
// summoning seal opening round it ("Summon: Manda!"), its script racing to
// the post; the great snake rears up out of the ground over the arena in a
// burst of smoke, too big for the stage, his head over the post, jaws gaping,
// the tongue flicking. Arms folded, a finger to the chin, a palm flung out:
// crush it. Manda's head comes down on the post, again and again, driving it
// into the ground, and he goes as he came, in smoke.
const RISE: XY = [0, GROUND]
const manda = (f: number, sink = 0): FxUse => fx('mandaRear', f, RISE, { back: true, ...(sink ? { sink } : {}) })
// the summoning's smoke round him: two puffs on the ground and one at his head
const cloud = (f: number): FxUse[] => [fx('smoke', f, [2, GROUND]), fx('smoke', f, [14, GROUND]), fx('smoke', f, [9, 6])]
// looming: his head swaying and the jaws working, a frame pattern that never sits still
const LOOM = [0, 0, 1, 1, 2, 2, 1, 1] as const
const loom = (i: number): FxUse => manda(LOOM[i % LOOM.length]!)
const mandaCels: Cel[] = [
  ...postIn('signs', [K('sign1', { ...smug, hdy: 1 }), K('sign1', smug), K('sign3', { hdy: 1 }), K('sign3')]),
  c(1, 'signs', K('sign2', { hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign2'), { post: 'stand' }),
  // the palm to the ground: the seal's ring opens round it
  ...[0, 1, 2, 3].map(f => c(1, 'slam', K('slam', aim(f === 0 ? { hdy: 1 } : {})), { post: 'stand', fx: [fx('sealRing', f, 'hand', { back: true }), ...(f < 3 ? [dustAt(f, HOME - 9)] : [])] })),
  // the script races along the floor to the post
  // (the palm pressed down harder, the body sunk a pixel on it)
  ...[0, 1, 2, 3].map(f => c(1, 'track', K('slam', aim({ eyes: 'left', dy: 1 })), { post: 'stand', fx: [fx('sealRing', 3, 'hand', { back: true, d: [0, -1] }), fx('sealLine', f, 'hand', { back: true, d: [-1, -1] })] })),
  // Manda rears up out of the ground over the arena, the burst throwing him
  // back two pixels up off his palm, arms flung wide to greet it; a step home
  // (thrown up off his palm by the burst, the arms flung wide to it)
  c(1, 'appear', K('spread', { ...smug, x: HOME + 2, hdy: 1 }), { post: 'stand', fx: [manda(0, 18), ...cloud(1)], shake: [0, 1] }),
  c(1, 'appear', K('spread', { ...smug, x: HOME + 2 }), { post: 'lean', fx: [manda(0, 10), ...cloud(2)], shake: [0, 1] }),
  c(1, 'appear', K('gather', { ...focus, x: HOME + 1 }), { post: 'stand', fx: [manda(0, 4), ...cloud(3)] }),
  c(1, 'appear', K('gather', { ...focus, x: HOME + 1 }), { post: 'stand', fx: [manda(1), ...cloud(4)] }),
  // he looms, his head swaying, the tongue flicking; arms folded, a finger to the chin
  ...hold(4, 'hit', K('crossed', smug), i => ({ post: 'stand', fx: [loom(i + 2)] })),
  c(1, 'hit', K('think', { ...smug, hdy: 1 }), { post: 'stand', fx: [loom(6)] }),
  ...hold(4, 'hit', K('think', smug), i => ({ post: 'stand', fx: [loom(i + 7)] })),
  // a palm flung out as he steps into it (stoic: a small step, no overshoot,
  // he only gives the order): crush it. His head comes down on the post, the
  // post driven down; again, and the slam rocks him back
  c(1, 'impact', K('strike', aim({ hdy: 1, x: HOME - 1 })), { post: 'stand', pdy: 1, flash: 'post', fx: [manda(3)], shake: [0, 1] }),
  c(1, 'impact', K('strike', aim({ x: HOME - 1 })), { post: 'stand', pdy: 1, fx: [manda(3)] }),
  c(1, 'impact', K('strike', aim({ x: HOME - 1 })), { post: 'stand', pdy: 1, fx: [manda(2), fx('earth', 0, [POST_X + 1, GROUND])] }),
  c(1, 'impact', K('strike', aim({ x: HOME - 1 })), { post: 'stand', pdy: 1, fx: [manda(1), fx('earth', 1, [POST_X + 1, GROUND])] }),
  c(1, 'impact', K('strike', aim({ hdy: 1, x: HOME + 1 })), { post: 'stand', pdy: 2, fx: [manda(3), fx('earth', 2, [POST_X + 1, GROUND])], shake: [0, 1] }),
  c(1, 'impact', K('crossed', smug), { post: 'stand', pdy: 2, fx: [manda(2), fx('earth', 0, [POST_X + 1, GROUND])] }),
  c(1, 'impact', K('crossed', smug), { post: 'stand', pdy: 2, fx: [manda(1)] }),
  c(1, 'impact', K('crossed', { ...smug, hdy: 1 }), { post: 'stand', pdy: 3, fx: [manda(3), fx('earth', 1, [POST_X + 1, GROUND])], shake: [0, 1] }),
  ...hold(3, 'impact', K('crossed', smug), i => ({ post: 'stand', pdy: 3, fx: [manda(2 - (i % 2)), ...(i === 0 ? [fx('earth', 2, [POST_X + 1, GROUND])] : [])] })),
  // and he goes as he came
  c(1, 'vanish', K('think', smug), { post: 'stand', pdy: 3, fx: [manda(0), ...cloud(1)] }),
  // (the smoke thinning as it settles, never gone in a frame)
  // (a half step back off it as it clears)
  ...[[2, 0], [3, 0], [3, 3], [3, 5], [3, 8], [3, 11], [3, 14]].map(([f, sink], i) => c(1, 'vanish', K('think', { ...smug, held: i + 1, ...(i >= 3 ? { x: HOME + 1 } : {}) }), { post: 'stand', pdy: 3, fx: cloud(f!).map(e => (sink ? { ...e, sink } : e)) })),
  // the post, sunk, poofs away
  ...ending('stand', { pdy: 3 }),
]
const mandaMove = (t: Template): CelMove => celMove(t, { name: 'Summoning Jutsu: Manda', shout: 'Summon: Manda', dojutsu: false, on: ['agent'] }, mandaCels)

// ------------------------------------------------------------------ Kusanagi (4.7 s)

// Arms folded, the smile, as the post poofs in; arms flung wide as a snake's
// head comes up out of his mouth and the blade out of its jaws; he lunges in
// behind it as it runs out into the post; the head thrown back, it swings up
// over the post, and he drops low to bring it down through it; the blade
// slides back down his throat.
const flash = (f: number, at: XY | 'post' = 'post'): FxUse => fx('impact', f, at, { pal: 'hit' })
// where the blade's point is when it is brought down through the post
const CUT_AT: XY = [POST_X + 2, POST_HIT[1] + 4]
const kusanagiCels: Cel[] = [
  ...postIn('ready', [K('crossed', { ...smug, hdy: 1 }), K('crossed', smug), K('crossed', smug)]),
  ...hold(2, 'ready', K('crossed', smug), { post: 'stand', phase: 1 }),
  // the snake's head out of his mouth, then the point out of its jaws
  c(1, 'draw', K('kusaDraw', { hdx: 1 }), { post: 'stand' }),
  c(2, 'draw', K('kusaDraw'), { post: 'stand' }),
  c(1, 'draw', K('kusaTip', { hdy: 1 }), { post: 'stand', fx: [fx('sparks', 0, 'head', { pal: 'hit', d: [4, 15] })] }),
  c(2, 'draw', K('kusaTip'), { post: 'stand', fx: [fx('sparks', 1, 'head', { pal: 'hit', d: [4, 15] })] }),
  // the lunge, two columns in behind the blade: it runs out into the post,
  // and the blow rocks him back off it
  c(1, 'release', K('kusaLunge', { x: HOME - 2 }), { post: 'stand' }),
  c(1, 'release', K('kusaThrust', { x: HOME - 2 }), { post: 'stand' }),
  c(2, 'impact', K('kusaThrust', { x: HOME - 1 }), { post: 'lean', flash: 'post', fx: [flash(0)], shake: [-1, 0] }),
  c(1, 'impact', K('kusaThrust', { x: HOME }), { post: 'lean', pdx: -1, shake: [1, 0], fx: [flash(1)] }),
  c(1, 'impact', K('kusaThrust', { x: HOME, ...smug }), { post: 'stand', fx: [flash(2)] }),
  // the blade drawn halfway back out of it, a glint off the edge
  c(1, 'impact', K('kusaLunge', { ...smug, hdy: 1 }), { post: 'stand', fx: [fx('sparks', 2, 'post', { pal: 'hit' })] }),
  c(1, 'impact', K('kusaLunge', smug), { post: 'stand', fx: [fx('sparks', 0, 'head', { pal: 'hit', d: [-4, 15] })] }),
  // the head thrown back, his weight back on his heels: it swings up over the post
  c(1, 'raise', K('kusaRaise', { hdy: 1, x: HOME + 1 }), { post: 'stand' }),
  c(4, 'raise', K('kusaRaise', { x: HOME + 1 }), { post: 'stand', fx: [fx('sparks', 1, 'head', { pal: 'hit', d: [-6, 4] })] }),
  // and comes down through it as he drops into the cut, a step in
  c(2, 'finish', K('kusaCut', { hdy: 1, x: HOME - 2 }), { post: 'lean', pdx: -1, flash: 'post', fx: [flash(0, CUT_AT)], shake: [0, 1] }),
  c(1, 'finish', K('kusaCut', { x: HOME - 1 }), { post: 'lean', pdx: -2, fx: [flash(1, CUT_AT), dustAt(0, POST_X + 1)] }),
  c(1, 'finish', K('kusaCut', { x: HOME - 1 }), { post: 'lean', pdx: -1, fx: [flash(2, CUT_AT), dustAt(1, POST_X + 1)] }),
  c(1, 'finish', K('kusaCut', { x: HOME - 1 }), { post: 'stand', fx: [flash(3, CUT_AT), dustAt(2, POST_X + 1)] }),
  c(3, 'finish', K('kusaCut', smug), { post: 'stand' }),
  // rising out of the cut, the blade drawn back up into his mouth
  c(2, 'finish', K('kusaTip', { ...smug, hdy: 1 }), { post: 'stand' }),
  // the blade slides back down his throat
  c(1, 'sheathe', K('kusaTip'), { post: 'stand' }),
  c(2, 'sheathe', K('kusaDraw'), { post: 'stand' }),
  c(1, 'sheathe', K('crossed', { ...smug, hdy: 1 }), { post: 'stand' }),
  ...hold(3, 'recover', K('crossed', smug), { post: 'stand' }),
  ...ending(),
]
const kusanagiMove = (t: Template): CelMove => celMove(t, { name: 'Kusanagi', shout: 'Kusanagi', dojutsu: false, on: ['edit'] }, kusanagiCels)

// ------------------------------------------------------------------ Hidden Shadow Snake Hands (1.7 s)

// For an edit, his own trick: the sleeve swept down at the floor as the post
// poofs in, and something runs under the ground to the post, the floor
// heaving over it; his hand up, and a great snake bursts up out of the ground
// at the post's foot, jaws wide, and strikes down on it, the post jolted up
// in its bite ("Snake Hands!"). It lets go and sinks back into the floor.
const RISE_AT: XY = [POST_X + 6, GROUND]
// the great snake (its frame, sunk this many pixels into the floor)
const rise = (f: number, sink = 0): FxUse => fx('serpentRise', f, RISE_AT, sink ? { sink } : {})
// the floor heaving over the snake running under it, at column x
const heave = (f: number, x: number): FxUse => fx('earth', f, [x, GROUND])
// (creepy-light, kit.ts's CAST_WEIGHT.light: the sleeve swept low, drawn
// back then dipped; the hand flung up two pixels past its mark, and the kick
// of it on the release, then planted while the snake bites twenty pixels off)
const LIGHT = CAST_WEIGHT.light
const low: Partial<NinjaCel> = { x: HOME + LIGHT.gather(1).x, dy: LIGHT.gather(1).dy ?? 0 }
const kick = HOME + LIGHT.recoil(0).x
const quickCels: Cel[] = [
  ...postIn('ready', [K('gather', { ...smug, x: HOME + LIGHT.gather(0).x, hdy: 1 }), K('gather', { ...smug, x: HOME + LIGHT.gather(0).x }), K('gather', { ...focus, ...low })], i => (i >= 1 ? [heave(0, HOME - 8 - 5 * i)] : [])),
  c(1, 'ready', K('gather', { ...focus, ...low }), { post: 'stand', fx: [heave(1, HOME - 18), dustAt(0, HOME - 13)] }),
  // the hand flung up: it bursts up out of the ground, jaws wide
  c(1, 'release', K('raise', aim({ hdy: 1, x: HOME + LIGHT.release(0).x })), { post: 'stand', pdy: -1, fx: [rise(1, 14), heave(0, RISE_AT[0]), dustAt(0, RISE_AT[0] + 4)], shake: [0, 1] }),
  c(1, 'release', K('raise', aim({ x: kick })), { post: 'stand', pdy: -1, fx: [rise(0, 6), heave(1, RISE_AT[0]), dustAt(1, RISE_AT[0] + 4)] }),
  // and strikes down on the post, the fist clenched with the bite: the biggest frame
  c(2, 'impact', K('punch', aim({ x: kick })), { post: 'lean', pdy: -2, flash: 'post', fx: [rise(2), heave(2, RISE_AT[0]), bite(0, -6)], shake: [-1, 1] }),
  c(1, 'impact', K('punch', aim({ x: kick })), { post: 'lean', pdy: -1, pdx: -1, fx: [rise(2), bite(1, -6), dustAt(2, RISE_AT[0] + 4)] }),
  c(2, 'impact', K('punch', aim(smug)), { post: 'lean', pdy: -1, fx: [rise(2), bite(2, -6)] }),
  // it lets go and sinks back into the floor
  c(1, 'back', K('gather', smug), { post: 'stand', fx: [rise(1, 5), heave(1, RISE_AT[0])] }),
  c(1, 'back', K('gather', smug), { post: 'stand', fx: [rise(1, 11), heave(2, RISE_AT[0])] }),
  c(1, 'back', K('gather', smug), { post: 'stand', fx: [rise(1, 17), dustAt(0, RISE_AT[0])] }),
  ...ending('stand', { fx: [dustAt(1, RISE_AT[0])] }),
]
const quickMove = (t: Template): CelMove => celMove(t, { name: 'Hidden Shadow Snake Hands', shout: 'Snake Hands', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.5 s)

// The end of a turn, his way, creepy: the sleeve held out low, and a little
// snake slithers out of it and rears, its tongue flicking; he cocks his head
// and leans in at you a pixel as out comes his own long tongue, down past his
// chin, curling, and licked up over his lip toward the cheek (the two of them
// at it together); the snake slides home into the sleeve as the arms fold,
// and the lick goes on, licked up over his lip (the accent, the eyes
// squeezed in his low laugh: ku, ku, ku, his shoulders hunching with it);
// and he lets the arms fall.
const tongue = (f: number): FxUse => fx('lick', f, 'head', { d: [12, 16] })
const pet = (f: number): FxUse => fx('sleeveSnake', f, 'hand', { d: [0, -1] })
const cocked: Partial<NinjaCel> = { ...smug, hdx: -1 }
const leaning: Partial<NinjaCel> = { ...cocked, x: HOME - 1 }
const cheerCels: Cel[] = [
  c(1, 'cheer', K('gather', { ...smug, hdy: 1 }), { fx: [pet(0)] }),
  c(1, 'cheer', K('gather', smug), { fx: [pet(1)] }),
  c(1, 'cheer', K('gather', { ...cocked, held: 2 }), { fx: [pet(2)] }),
  c(1, 'cheer', K('gather', { ...leaning, held: 3 }), { fx: [pet(3), tongue(0)] }),
  c(2, 'cheer', K('gather', { ...leaning, held: 4 }), { fx: [pet(2), tongue(1)] }),
  // the snake slides home as the arms fold (the roster's cheer) and the lick goes on
  c(1, 'cheer', K('crossed', { ...leaning, hdy: 1 }), { fx: [tongue(1)] }),
  c(1, 'cheer', K('crossed', { ...leaning, held: 2 }), { fx: [tongue(2)] }),
  c(1, 'cheer', K('crossed', { ...leaning, eyes: 'happy', hdy: 1, dy: 1, held: 3 }), { fx: [tongue(2)] }),
  c(1, 'cheer', K('crossed', { ...cocked, held: 4 }), { fx: [tongue(0)] }),
  c(1, 'cheer', K('crossed', { ...smug, held: 5 })),
  c(1, 'recover', K('ease', smug)),
  c(1, 'recover', K('idle1', { ...smug, hdy: 1 })),
  c(2, 'recover', K('idle0', smug)),
]
const cheerMove = (t: Template): CelMove => celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)

// His moves in his own copy of the robe.
export const orochimaruMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [snakesMove(t), mandaMove(t), kusanagiMove(t)],
  quick: quickMove(t),
  cheer: cheerMove(t),
})
