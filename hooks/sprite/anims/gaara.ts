// Gaara's moves as cels, hand-keyed at 10 fps (see anims/kakashi.ts for how
// to write a move). He barely moves: arms folded, a hand out, a fist closed;
// the sand does the work, but his weight goes into every release (kit.ts's
// cast(): sunk back on his heels, a step into it, rocked back by the blow). It runs along the floor as a ridge, climbs the post
// into a coffin and crushes it, heaves up into a shield, packs into shuriken
// and shoots out as a spear. Every frame of a jutsu shows the post, the sand
// or both, so none is ever mistaken for him just standing.
//
// The moves are made for his own copy of the robe (ninja/gaara.ts's
// GAARA_ROBE: the gourd and strap baked in, his own sleep), so the beats name
// his poses as the companion knows them.

import { celMove } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { GROUND, HOME, POST_X } from '../stage.ts'
import type { Cel, CelMove, FxUse, NinjaCel, PostFrame, Template, XY } from '../types.ts'
import type { CelOptions } from './kit.ts'
import { CAST_WEIGHT, K, c, calls, cast, fx, hold, postIn, postOut } from './kit.ts'

// the sand: a ridge of it running along the floor (its foot's middle at x),
// behind his feet when it is at them
const ridge = (x: number, back = false): FxUse => fx('sandWall', 0, [x, GROUND], back ? { back: true } : {})
// grit of sand kicked up off the floor
const grit = (f: number, x: number): FxUse => fx('dust', f, [x, GROUND], { pal: 'sand' })
// the coffin round the post (sand.ts's sandCoffin: running in, climbing, the
// claws, shut, squeezed), stamped on the post's foot
const coffin = (f: number): FxUse => fx('sandCoffin', f, AT.postFoot)
// a burst of sand where something strikes
const burst = (f: number, at: XY | 'post' = 'post', d: XY = [0, 0]): FxUse => fx('impact', f, at, { pal: 'sand', d })
// grains trickling off the top of the post
const trickle = (f: number): FxUse => fx('grains', f, AT.postTop)
// sand climbing round him (sand.ts's sandClimb, frame f of 0-3): the half
// behind him, or with `back` false the half in front
const climb = (f: number, back = false, x = HOME): FxUse => fx('sandClimb', back ? f : f + 4, [x, GROUND], back ? { back: true } : {})
// both halves at once, round him: up the frames to climb
const round = (f: number): FxUse[] => [climb(f, true), climb(f)]
// and pouring back down into the floor, `n` pixels sunk (never gone in a frame)
const pour = (n: number): FxUse[] => [fx('sandClimb', 3, [HOME, GROUND], { back: true, sink: n }), fx('sandClimb', 7, [HOME, GROUND], { sink: n })]
const POUR = [5, 9, 13, 17] as const

const eyesLeft: Partial<NinjaCel> = { eyes: 'left' }
// a cast's gather in the windup: sunk, not stepped back (the drawing rocks
// back on its own, its head two pixels behind; a column more and the head
// leaves the stage)
const BACK = (w: 'stoic' | 'light' | 'heavy') => (i: number): XY => [-CAST_WEIGHT[w].gather(i).x, 0]
const focus: Partial<NinjaCel> = { eyes: 'focus' }
// the head turned to the post, for the blows
const aim = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ eyes: 'focus', head: 'turn', ...o })

// One frame of his folded arms as a moving hold (the sleeves and hem
// stirring in the sand's wind: the robe's crossedWind), its place in the hold
// `i`, so a run of them written frame by frame keeps stirring.
const guard = (i: number, tag: string, look: Partial<NinjaCel> = {}, o: CelOptions = {}): Cel => c(1, tag, K('crossed', { ...look, held: i }), o)

// Every move ends unfolding: the arms swinging down to the sides (the
// robe's ease, a frame from rest), idle1 (the head dipped) for a frame, then
// idle0 for two as the post poofs away (or, with no post, the sand settling).
const ending = (post: PostFrame | null, more: (i: number) => readonly FxUse[] = () => []): Cel[] =>
  post
    ? [c(1, 'recover', K('ease'), { post, fx: [...more(0)] }), c(1, 'recover', K('idle1', { hdy: 1 }), { post, fx: [...more(1)] }), ...postOut('recover', [K('idle0'), K('idle0')], post, i => more(i + 2))]
    : [c(1, 'recover', K('ease'), { fx: [...more(0)] }), c(1, 'recover', K('idle1', { hdy: 1 }), { fx: [...more(1)] }), c(1, 'recover', K('idle0'), { fx: [...more(2)] }), c(1, 'recover', K('idle0'), { fx: [...more(3)] })]

// ------------------------------------------------------------------ Sand Coffin (4.5 s)

// Arms folded as the post poofs in, the sleeves stirring as the sand stirs
// at his feet. A hand out, open, his weight leaning out over it: a ridge of
// sand runs along the floor to the post and climbs it, two claws reaching
// past its top, and shuts over it as he straightens and the hand rises
// ("Sand Coffin!"). Stoic (kit.ts's 'stoic' weight: no sink, a tiny step,
// never a flinch; the sand is twenty pixels off): the open hand drawn in
// over it, the fist clenched (squeezed once); the hand lifted, open, the
// coffin lifted with it; and the fist driven down and in, the whole arm
// behind it, a step in (his key pose: "Sand Burial!"), and it bursts, the
// post wrung thin inside it, the stage jolted. The fist held as the sand
// runs home along the floor; the arms fold, unfold, and the post poofs away.
const stoic = CAST_WEIGHT.stoic
const coffinCels: Cel[] = [
  ...postIn('stir', [K('crossed', { hdy: 1 }), K('crossed'), K('crossed', eyesLeft), K('crossed', eyesLeft)], i => (i >= 2 ? [ridge(30, true), grit(i - 2, 26)] : [])),
  ...[4, 5].map(i => guard(i, 'stir', i < 5 ? eyesLeft : focus, { post: 'stand', fx: [ridge(30, true), grit(i - 4, 26)] })),
  // the hand out, open, then leaning out over it: the ridge runs to the post
  c(1, 'pour', K('gather', { ...focus, hdy: 1 }), { post: 'stand', fx: [ridge(30), grit(2, 26)] }),
  c(1, 'pour', K('gather', focus), { post: 'stand', fx: [ridge(26)] }),
  c(1, 'pour', K('gather', { ...focus, x: HOME - 1 }), { post: 'stand', fx: [ridge(22), grit(0, 27)] }),
  c(1, 'pour', K('gather', { ...focus, x: HOME - 1 }), { post: 'stand', fx: [ridge(18), grit(1, 23)] }),
  c(1, 'pour', K('gather', { ...focus, x: HOME - 1, hdy: 1 }), { post: 'stand', fx: [coffin(0), grit(2, 19)] }),
  c(1, 'pour', K('gather', { ...eyesLeft, x: HOME - 1 }), { post: 'stand', fx: [coffin(0)] }),
  // he straightens, the hand rises and the sand climbs the post; it shuts over it
  c(1, 'coffin', K('raise', { ...focus, hdy: 1 }), { post: 'stand', fx: [coffin(1)], shout: true }),
  ...hold(4, 'coffin', K('raise', focus), i => ({ post: 'stand', fx: [coffin(i < 2 ? 1 : 2)] })),
  c(1, 'coffin', K('raise', focus), { post: 'stand', fx: [coffin(3)], shake: [0, 1] }),
  // held shut: the open palm pressed out flat at it, the weight onto the back foot (stoic: no sink)
  ...[0, 1, 2, 2].map((g, i) => c(1, 'coffin', K('palm', aim({ x: HOME + stoic.gather(g).x, ...(i === 0 ? { hdy: 1 } : {}) })), { post: 'stand', fx: [coffin(3)] })),
  // the fist clenched (a tiny step, no overshoot): squeezed once, a nod with it
  c(1, 'crush', K('punch', aim({ x: HOME + stoic.release(0).x, hdy: 1 })), { post: 'twist1', shake: [-1, 0], fx: [coffin(4)] }),
  c(2, 'crush', K('punch', aim({ x: HOME + stoic.release(1).x })), { post: 'twist1', fx: [coffin(4)] }),
  // the hand lifted, open: the coffin lifted with it, sand streaming off it
  c(1, 'crush', K('raise', aim({ x: HOME, hdy: 1 })), { post: 'twist1', pdy: -1, fx: [coffin(3), trickle(0)] }),
  c(2, 'crush', K('raise', aim({ x: HOME })), { post: 'twist1', pdy: -1, fx: [coffin(3), trickle(1)] }),
  // and the fist driven down, the other hand clamped on its wrist, a step in
  // behind it (his key pose): it bursts, a flash of sand, clods flung off,
  // the post left wrung thin, the stage jolted
  c(1, 'impact', K('charge', aim({ x: HOME - 2, hdy: 1 })), { post: 'twist1', flash: 'post', shake: [-1, 0], fx: [coffin(4), burst(0)] }),
  c(1, 'impact', K('charge', aim({ x: HOME - 2, hdy: 1 })), { post: 'twist1', shake: [-1, 0], pdx: -1, fx: [fx('rubble', 0, AT.postBase, { pal: 'sand' }), coffin(1), burst(1)] }),
  c(1, 'impact', K('charge', aim({ x: HOME - 2 })), { post: 'twist1', shake: [1, 0], pdx: 1, fx: [fx('rubble', 1, AT.postBase, { pal: 'sand' }), coffin(0), burst(2)] }),
  // the fist held as it settles (a nod, never a flinch), grains trickling off the post
  c(1, 'impact', K('charge', aim({ x: HOME - 1 })), { post: 'twist1', fx: [fx('rubble', 2, AT.postBase, { pal: 'sand' }), burst(3), trickle(0)] }),
  c(3, 'impact', K('charge', aim({ x: HOME - 1 })), { post: 'twist1', fx: [fx('rubble', 3, AT.postBase, { pal: 'sand' }), trickle(1)] }),
  // the sand runs home along the floor and climbs back round him; the arms fold again
  c(1, 'lower', K('crossed', { ...focus, hdy: 1 }), { post: 'twist1', fx: [ridge(16), trickle(2)] }),
  guard(1, 'lower', focus, { post: 'twist1', fx: [ridge(21), grit(0, 16), trickle(3)] }),
  guard(2, 'lower', eyesLeft, { post: 'twist1', fx: [ridge(26), grit(1, 21), trickle(0)] }),
  ...[3, 4, 5].map(i => guard(i, 'recover', i < 5 ? eyesLeft : focus, { post: 'twist1', fx: [...round(Math.min(2, i - 3)), trickle((i + 1) % 4)] })),
  ...ending('twist1', i => [...(i < 4 ? pour(POUR[i]!) : []), ...(i < 2 ? [grit(i, HOME - 4)] : [])]),
]
const coffinMove = (t: Template): CelMove => calls(celMove(t, { name: 'Sand Coffin', shout: 'Sand Coffin', dojutsu: false, on: ['shell'] }, coffinCels), { crush: 'Sand Burial', impact: 'Sand Burial' })

// ------------------------------------------------------------------ Sand Shield (4.5 s)

// No post: three kunai come flying in from the left. He feels them coming,
// arms folded, the sand stirring, his eyes sliding left; the near hand out of
// the fold, low, and flung up (stoic: the weight onto the back foot, a tiny
// step, no flinch): the sand heaves up out of the floor into a wall before
// him ("Sand Shield!"). He GUIDES it: the open palm out at the first kunai,
// the wall thickening where it will strike; it thuds in, the wall rippling
// out from it, the palm pushed into it. Arms folded again, he leans out past
// the wall's edge to PEEK at the second (the wall hides half his face); it
// thuds in by his face and he pulls back a step, eyes shut a beat. The third
// comes low: the palm swept down after it, the sand gathering low; thud,
// ripple; and the fist closes: the wall swallows all three as it sinks back
// into the floor, and the sand climbs back up round him.
const WALL: XY = [21, GROUND]
const wall = (f: number, dx = 0): FxUse => fx('sandWall', f, [WALL[0] + dx, WALL[1]])
// the wall sinking back into the floor, `n` pixels down
const sinking = (n: number): FxUse => fx('sandWall', 3, WALL, { sink: n })
// a thrown kunai, turned to fly right, its grip at (x, y) (the tip five pixels on)
const kunai = (x: number, y: number): FxUse => fx('kunai', 0, [x, y], { flip: true })
// where each kunai flies in (its grip's x a frame), and stops, the tip in the sand
const FLY = [-7, 0, 7] as const
const STUCK = 11
const HEIGHTS = [9, 14, 19] as const
const thud = (f: number, y: number): FxUse => fx('sparks', f, [STUCK + 6, y], { pal: 'sand' })
// the wall rippling out from where a kunai's tip sank in
const ripple = (f: number, y: number): FxUse => fx('sandRipple', f, [STUCK + 5, y])
const stuck = (n: number, drop = 0): FxUse[] => HEIGHTS.slice(0, n).map(y => kunai(STUCK, Math.min(GROUND - 1, y + drop)))
// kunai `k` flying in (`k` already in the sand), him in `look` (a frame each), three frames of flight
const flight = (k: number, tag: string, look: (f: number) => NinjaCel): Cel[] =>
  FLY.map((x, f) => c(1, tag, look(f), { fx: [...stuck(k), kunai(x, HEIGHTS[k]!), wall(f === 1 ? 2 : 3), ...(f === 0 && k > 0 ? [ripple(2, HEIGHTS[k - 1]!)] : [])] }))
// its thud: the wall shoved back a pixel and rippling out from it, him in `hit`
// then `after`, the stage jolted on the first
const thudOf = (k: number, tag: string, hit: NinjaCel, after: NinjaCel): Cel[] => [
  c(1, tag, hit, { fx: [...stuck(k + 1), wall(2, 1), thud(0, HEIGHTS[k]!), ripple(0, HEIGHTS[k]!)], shake: [-1, 0] }),
  c(1, tag, hit, { fx: [...stuck(k + 1), wall(3, 1), thud(1, HEIGHTS[k]!), ripple(1, HEIGHTS[k]!)] }),
  c(1, tag, after, { fx: [...stuck(k + 1), wall(3), thud(2, HEIGHTS[k]!), ripple(2, HEIGHTS[k]!)] }),
]
const shieldCels: Cel[] = [
  // he feels them coming: the sand stirs, his eyes slide left
  ...[0, 1].map(i => guard(i, 'stir', {}, { fx: [grit(i, 27)] })),
  ...[2, 3].map(i => guard(i, 'stir', eyesLeft, { fx: [ridge(27, true), grit(i - 2, 27)] })),
  // the cast: the near hand out of the fold, low and open, the weight onto
  // the back foot as the sand gathers before him; then the hand flung up, a
  // tiny step into it, and the wall heaves up out of the floor
  ...cast({
    k: eyesLeft,
    weight: 'stoic',
    recoil: false,
    gather: { tag: 'stir', fx: i => [wall(0), grit(i, 22), climb(Math.min(1, i), true)] },
    release: {
      tag: 'rise',
      pose: 'raise',
      k: i => ({ eyes: 'focus', ...(i === 0 ? { hdy: 1 } : {}) }),
      o: i => (i === 0 ? { shout: true, shake: [0, 1] as XY } : {}),
      fx: i => [wall(i < 2 ? 1 : 2), grit(i, 20), grit(i, 29)],
    },
    impact: false,
    settle: false,
    post: null,
  }),
  // the first: the open palm out at it, guiding the sand; thud, the palm
  // pushed into the ripple
  c(1, 'guard', K('gather', { ...focus, hdy: 1 }), { fx: [wall(3)] }),
  ...flight(0, 'guard', f => K('palm', aim({ x: HOME, held: f, ...(f === 0 ? { hdy: 1 } : {}) }))),
  ...thudOf(0, 'hit', K('palm', aim({ x: HOME - 1, hdy: 1 })), K('palm', aim({ x: HOME - 1 }))),
  // arms folded again, he leans out past the wall's edge to peek at the second
  c(1, 'hit', K('crossed', { ...eyesLeft, hdy: 1 }), { fx: [...stuck(1), wall(3)] }),
  c(1, 'hit', K('crossed', { ...eyesLeft, x: HOME - 2, held: 1 }), { fx: [...stuck(1), wall(3)] }),
  ...flight(1, 'hit2', f => K('crossed', { ...eyesLeft, x: HOME - 4, hdx: -1, held: f + 1 })),
  // it thuds in by his face: he pulls back a step, eyes shut a beat
  ...thudOf(1, 'hit2', K('crossed', { eyes: 'shut', hdy: 1, x: HOME + 1 }), K('crossed', { eyes: 'half', x: HOME + 1, held: 3 })),
  // the third comes low: the palm swept down after it, the sand gathering low; thud
  c(1, 'hit2', K('palmLow', aim({ hdy: 1 })), { fx: [...stuck(2), wall(3)] }),
  ...flight(2, 'hit3', f => K('palmLow', aim({ x: HOME - (f > 0 ? 1 : 0), held: f }))),
  ...thudOf(2, 'hit3', K('palmLow', aim({ x: HOME - 2, hdy: 1 })), K('palmLow', aim({ x: HOME - 2 }))),
  // the fist closes: the wall swallows the kunai as it sinks into the floor
  c(1, 'fall', K('punch', aim({ hdy: 1 })), { fx: [...stuck(3, 1), sinking(3), grit(0, 20)] }),
  c(1, 'fall', K('punch', aim()), { fx: [...stuck(3, 4), sinking(7), grit(1, 20)] }),
  c(1, 'fall', K('punch', aim()), { fx: [sinking(11), grit(2, 20)] }),
  c(1, 'fall', K('punch', focus), { fx: [sinking(15), wall(0)] }),
  // and the sand runs home and climbs back up round him
  guard(0, 'recover', eyesLeft, { fx: [ridge(18)] }),
  guard(1, 'recover', eyesLeft, { fx: [ridge(24), grit(0, 18)] }),
  guard(2, 'recover', {}, { fx: [...round(0), grit(1, 22)] }),
  guard(3, 'recover', {}, { fx: [...round(1), grit(2, 26)] }),
  guard(4, 'recover', {}, { fx: [...round(2), fx('grains', 0, [HOME - 6, GROUND - 6])] }),
  ...ending(null, i => [fx('grains', i, [HOME - 6, GROUND - 4]), ...(i < 4 ? pour(POUR[i]!) : []), ...(i < 2 ? [grit(i, HOME + 5)] : [])]),
]
const shieldMove = (t: Template): CelMove => celMove(t, { name: 'Sand Shield', shout: 'Sand Shield', dojutsu: false }, shieldCels)

// ------------------------------------------------------------------ Sand Shuriken (4.8 s)

// The post poofs in; sand rises off the floor at his feet, up past his
// raised fist into three shuriken of packed sand, one after another, spinning
// over the arena. Drawn back on his back foot, then the arm thrown out at the
// post as he steps into it: they shoot down onto it a beat apart, each
// bursting on it in a spray of sand (the last the hardest, the stage jolted),
// the post rocking, his weight rocked back; grains trickle off it, and the
// arms fold again.
type Star = { at: XY; hit: XY; from: number }
const STARS: readonly Star[] = [
  { at: [16, 4], hit: [12, 15], from: 0 },
  { at: [7, 6], hit: [11, 17], from: 3 },
  { at: [15, 12], hit: [12, 20], from: 6 },
]
const spin = (i: number, at: XY = STARS[i]!.at): FxUse => fx('sandShuriken', 'cycle', at, { phase: i })
// sand rising to where a star packs together (grains falling, run backwards)
const rising = (s: Star, f: number): FxUse => fx('grains', 3 - (f % 4), [s.at[0], s.at[1] - 1])
// the stars as they form, frame by frame: rising sand, then the star spinning in it
const forming = (f: number): FxUse[] =>
  STARS.flatMap((s, i) => {
    const k = f - s.from
    if (k < 0) return []
    if (k < 3) return [rising(s, k), ...(k >= 2 ? [spin(i)] : [])]
    return [spin(i)]
  })
// the volley, frame by frame from the throw: each star two frames in the air
// (a third and two thirds of the way), the next two frames behind, then its
// burst on the post (sparks; the last a full burst)
const VOLLEY = 2
const volley = (f: number): FxUse[] =>
  STARS.flatMap((s, i) => {
    const k = f - i * VOLLEY
    const along = (u: number): XY => [Math.round(s.at[0] + (s.hit[0] - s.at[0]) * u), Math.round(s.at[1] + (s.hit[1] - s.at[1]) * u)]
    if (k < 0) return [spin(i)]
    if (k < 2) return [spin(i, along((k + 1) / 3))]
    if (k < 5) return [fx('sparks', k - 2, s.hit, { pal: 'sand' }), ...(i === STARS.length - 1 ? [burst(k - 2, s.hit)] : [])]
    return i === STARS.length - 1 && k < 6 ? [burst(3, s.hit)] : []
  })
// the post as each star lands: rocked away, back past where it stood
const ROCK: readonly [PostFrame, number][] = [['lean', 0], ['lean', -1], ['stand', 1], ['lean', 0], ['lean', -1], ['stand', 1], ['lean', -1], ['lean', -2], ['stand', 1], ['stand', 0]]
const shurikenCels: Cel[] = [
  ...postIn('stir', [K('crossed', { hdy: 1 }), K('crossed', eyesLeft), K('crossed', eyesLeft), K('crossed', eyesLeft)], i => (i >= 1 ? [ridge(30, true), grit(i - 1, 27)] : [])),
  ...[4, 5].map(i => guard(i, 'stir', i < 5 ? eyesLeft : focus, { post: 'stand', fx: [ridge(30, true), grit((i - 1) % 3, 27)] })),
  // the fist raised: the sand rises into the first stars, the sleeve
  // stirring; the hand opens out low over the third as it packs, his weight
  // leaning out over it
  c(1, 'form', K('raise', { ...focus, hdy: 1 }), { post: 'stand', fx: [ridge(30, true), ...forming(0)] }),
  ...hold(5, 'form', K('raise', focus), i => ({ post: 'stand', fx: [ridge(30, true), ...forming(i + 1)] })),
  c(1, 'form', K('gather', { ...focus, hdy: 1, x: HOME - 1 }), { post: 'stand', fx: forming(6) }),
  ...hold(5, 'form', K('gather', { ...focus, x: HOME - 1 }), i => ({ post: 'stand', fx: forming(Math.min(9, i + 7)) })),
  // the cast: the arm drawn back to throw, sunk on the back foot, the stars
  // spinning; thrown out at the post, stepping into it, the first goes; one,
  // two, three on the post, rocking him back; he settles as they burst
  // (stoic, the recoil on the throw: the stars land fifteen pixels off, and
  // he never flinches at them)
  ...cast({
    k: aim(),
    weight: 'stoic',
    recoil: 'release',
    gather: { n: 6, tag: 'form', pose: 'windup', hold: true, d: BACK('stoic'), k: i => (i === 0 ? { hdy: 1 } : {}), o: { post: 'stand', fx: forming(9) } },
    // (the throw, his key pose: the arm flung out at the post, a full step into it)
    release: { n: 2, d: () => [-1, 0], k: i => (i === 0 ? { hdy: 1 } : {}), o: i => ({ post: 'stand', fx: volley(i) }) },
    impact: {
      n: 6,
      pose: 'strike',
      hold: true,
      o: i => ({ post: ROCK[i]![0], pdx: ROCK[i]![1], fx: volley(i + 2), ...(i === 0 ? { flash: 'post' as const } : i === 4 ? { flash: 'post' as const, shake: [-1, 0] as XY } : i === 5 ? { shake: [1, 0] as XY } : {}) }),
    },
    settle: { n: 4, tag: 'impact', pose: 'follow', o: i => ({ post: ROCK[i + 6]![0], pdx: ROCK[i + 6]![1], fx: [...volley(i + 8), ...(i >= 1 ? [trickle(i - 1)] : [])] }) },
  }),
  // arms folded again, the sand trickling off the post
  c(1, 'recover', K('crossed', { hdy: 1 }), { post: 'stand', fx: [trickle(3), fx('dust', 0, [POST_X + 1, GROUND], { pal: 'sand' })] }),
  ...[1, 2, 3, 4, 5].map(i => guard(i, 'recover', i < 4 ? eyesLeft : {}, { post: 'stand', fx: [trickle((i - 1) % 4), ...(i < 3 ? [fx('dust', i, [POST_X + 1, GROUND], { pal: 'sand' })] : [])] })),
  ...ending('stand', i => (i === 0 ? [trickle(3)] : [])),
]
const shurikenMove = (t: Template): CelMove => celMove(t, { name: 'Sand Shuriken', shout: 'Sand Shuriken', dojutsu: false, on: ['edit'] }, shurikenCels)

// ------------------------------------------------------------------ Sand Spear (1.8 s)

// For an edit: arms folded as the post poofs in, sand heaving up at his feet;
// the near hand out of the fold, low (sunk back a beat as the sand packs);
// thrust out at the post as he steps into it, and a spear of sand shoots out
// of that hand along the floor into the post's foot ("Sand Spear!"), rocking
// him back; it holds, and crumbles, and the arms fold again.
const SPEAR: XY = [24, GROUND - 3]
const spear = (f: number): FxUse => fx('sandSpear', f, SPEAR)
const quickCels: Cel[] = [
  ...postIn('ready', [K('crossed', { ...eyesLeft, hdy: 1 }), K('crossed', eyesLeft), K('crossed', focus)], i => (i >= 1 ? [ridge(28, true), grit(i - 1, 25)] : [])),
  guard(3, 'ready', focus, { post: 'stand', fx: [ridge(28, true), grit(1, 25)] }),
  ...cast({
    k: aim(),
    weight: 'stoic',
    recoil: 'release',
    // the hand out of the fold, low and open, the weight onto the back foot: the sand packs
    gather: { n: 2, tag: 'ready', k: i => (i === 0 ? { hdy: 1 } : {}), fx: i => [ridge(28, true), ...(i === 0 ? [grit(2, 25)] : [])] },
    // thrust out at the post, one line from his eyes down the arm: the spear leaves the hand
    release: { n: 3, fx: i => [ridge(28, true), spear(i)] },
    // it slams into the post's foot, rocking him back
    impact: { n: 2, o: i => ({ post: i === 0 ? 'lean' : 'stand', ...(i === 0 ? { flash: 'post' as const, shake: [-1, 0] as XY } : { pdx: -1 }), fx: [ridge(28, true), spear(2), burst(i, [POST_X + 3, SPEAR[1]])] }) },
    // the arms fold again as it crumbles
    settle: { n: 2, pose: 'crossed', k: { eyes: 'focus', head: undefined }, o: i => ({ post: 'stand', ...(i === 0 ? { pdx: 1 } : {}), fx: i === 0 ? [ridge(28, true), spear(3), burst(2, [POST_X + 3, SPEAR[1]])] : [fx('grains', 0, [POST_X + 8, SPEAR[1] - 2]), grit(0, 18)] }) },
  }),
  guard(13, 'recover', eyesLeft, { post: 'stand', fx: [grit(1, 28), fx('grains', 1, [POST_X + 8, SPEAR[1] - 2])] }),
  ...ending('stand', i => (i < 1 ? [grit(2, 28)] : [])),
]
const quickMove = (t: Template): CelMove => celMove(t, { name: 'Sand Spear', shout: 'Sand Spear', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.5 s)

// The end of a turn, his way, calm: a hand lifted, and sand rises off the
// floor past it and packs into his Third Eye floating at his shoulder, shut;
// the hand lowered open under it as it opens and looks at you; the arms fold
// with the faint smile he keeps for friends as it glances at the arena, back
// at you, and slowly blinks (the accent: a wink); then it crumbles into
// grains and he lets the arms fall.
const smile: Partial<NinjaCel> = { eyes: 'smile' }
// the eye floats up and left of his head, over the arena side of his shoulder
const EYE: XY = [HOME - 18, 6]
const eye = (f: number, dy = 0): FxUse => fx('sandEye', f, [EYE[0], EYE[1] + dy])
const packing = (f: number, dy: number): FxUse => fx('grains', 3 - (f % 4), [EYE[0] + 1, EYE[1] + dy])
const cheerCels: Cel[] = [
  c(1, 'lift', K('raise', { ...smile, hdy: 1 }), { fx: [grit(0, HOME - 8), packing(0, 8)] }),
  c(1, 'lift', K('raise', smile), { fx: [grit(1, HOME - 8), packing(1, 4)] }),
  c(1, 'lift', K('raiseWind', smile), { fx: [packing(2, 1), eye(0, 1)] }),
  // the hand lowered open under it: it opens and looks at you
  c(1, 'cheer', K('gather', { ...smile, hdy: 1 }), { fx: [eye(1)] }),
  c(2, 'cheer', K('gather', { ...smile, held: 1 }), { fx: [eye(1)] }),
  // the arms fold (the roster's cheer) as it glances at the arena and back
  c(1, 'cheer', K('crossed', { ...smile, hdy: 1 }), { fx: [eye(2)] }),
  c(1, 'cheer', K('crossed', { ...smile, held: 2 }), { fx: [eye(1)] }),
  // (the accent: a slow wink, his head tipped with it)
  c(1, 'cheer', K('crossed', { ...smile, held: 3, hdy: 1 }), { fx: [eye(3)] }),
  c(1, 'cheer', K('crossed', { ...smile, held: 4 }), { fx: [eye(1)] }),
  // it crumbles into grains
  c(1, 'cheer', K('crossed', { ...smile, held: 5 }), { fx: [eye(4), fx('grains', 0, [EYE[0] + 1, EYE[1] + 2])] }),
  c(1, 'recover', K('ease', smile), { fx: [fx('grains', 1, [EYE[0] + 1, EYE[1] + 6]), grit(0, HOME - 12)] }),
  c(1, 'recover', K('idle1', { ...smile, hdy: 1 }), { fx: [grit(1, HOME - 12)] }),
  c(2, 'recover', K('idle0', smile)),
]
const cheerMove = (t: Template): CelMove => celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)

// His moves in his own copy of the robe.
export const gaaraMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [coffinMove(t), shieldMove(t), shurikenMove(t)],
  quick: quickMove(t),
  cheer: cheerMove(t),
})
