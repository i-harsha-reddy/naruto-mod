// Hinata's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them): the Twin Lion Fists driven into the post, the Gentle Fist
// sealing its chakra points and the air palm that blows them open, the
// Eight Trigrams Sixty-Four Palms Protection turning away a volley of
// kunai, the Byakugan's palm for an edit, and her cheer. The Gentle Fist is
// soft and round where other taijutsu is spiky: rings and pops, not stars,
// in her lavender ('lion').
//
// She runs in low, in a glide with two afterimages in her chakra close
// behind (kit.ts's runIn 'glide'); her blows are struck with her head turned
// toward the post (ninja/hinata.ts's 'turn' head, 'turnByak' with the
// Byakugan's veins); her holds stir (her long hair lifting off her back);
// every move ends on the breath out (idle1, the head a pixel down) and two
// frames standing as the post poofs away.

import { celMove } from '../cels.ts'
import { wear } from '../dress.ts'
import { palmFan } from '../fx/wind.ts'
import { HOME, POST_HIT, STRIKE } from '../stage.ts'
import { JACKET } from '../templates/jacket.ts'
import type { Cel, CloneCel, FxUse, NinjaCel, PostFrame } from '../types.ts'
import { K, awake, c, dustAt, fx, hold, hopHome, postIn, postOut, runIn, smokeAt } from './kit.ts'

// ------------------------------------------------------------------ her own poses

// A little bow: the hands folded at the navel (the jacket's gather), the
// head dipped forward over them. Worn into the jacket for her cheer
// (ninja/hinata.ts wears it too).
export const HINATA_POSES = { bow: { base: 'gather', head: [-1, 4] as const, eyes: 'happy' } } as const
const T = wear(JACKET, HINATA_POSES)

// the head turned to the post, for a blow (the veins on it while the Byakugan is awake)
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: o.awake ? 'turnByak' : 'turn', eyes: 'focus', ...o })
// an effect in her chakra's lavender
const lav = (name: string, f: number | 'cycle', at: FxUse['at'], o: Partial<FxUse> = {}): FxUse => fx(name, f, at, { pal: 'lion', ...o })

// the end of every move: the breath out, then standing as the post poofs away
const ending = (post: PostFrame = 'stand'): Cel[] => postOut('recover', [K('idle1', { hdy: 1 }), K('idle0'), K('idle0')], post)

// a run of cels whose first in the beat `tag` starts the shout
const shoutAt = (cels: Cel[], tag: string): Cel[] => {
  const i = cels.findIndex(cel => cel.tag === tag)
  return cels.map((cel, j) => (j === i ? { ...cel, shout: true as const } : cel))
}

// the post poofing in over the first two cels of a run
const poofIn = (cels: Cel[]): Cel[] =>
  cels.map((cel, i) => (i === 0 ? { ...cel, post: null, poof: 'in' as const, fx: [smokeAt(1), ...(cel.fx ?? [])] } : i === 1 ? { ...cel, post: 'stand' as const, poof: 'in' as const, fx: [smokeAt(3), ...(cel.fx ?? [])] } : cel))

// her afterimage in her chakra at column x, behind her (a trail, never over her)
const after = (x: number, pose: string, o: Partial<CloneCel> = {}): CloneCel => ({ x, pose, head: 'turnByak', awake: true, ghost: 'chakra', noShadow: true, z: -1, ...o })

// ------------------------------------------------------------------ Gentle Step: Twin Lion Fists (4.6 s)

// The Byakugan wakes over the seals; she sinks and draws back, and a lion's
// head of chakra flares round the near fist (a knot, then a cub's head); she
// sinks lower and a second flares over it, a step dimmer, behind (the two
// stacked, one high and one low, never over her face: fx/lions.ts, solid
// two-tone heads); a step in, the lions roaring; the glide, the lions
// surging to their full size; the first bites the post, the second drives
// down after it with a roar, the post flashing white; they break up into
// flame tongues and wisps; the hop home.
// the lions on the near fist: the first in 'lions', the second in
// 'lionsDim', behind her and the post, stacked over the first by LION2
const LION2: readonly [number, number] = [-4, -8]
type D = readonly [number, number]
// (the low lion two pixels smaller than the high one: its full head is twinLionLow)
const lion1 = (name: string, f: number, d: D): FxUse => fx(name === 'twinLion' && f <= 2 ? 'twinLionLow' : name, f, 'hand', { d })
const lion2 = (name: string, f: number, d: D, up: D = LION2, back = true): FxUse => fx(name, f, 'hand', { d: [d[0] + up[0], d[1] + up[1]], pal: 'lionsDim', back })
// the cubs at home, their tufts flickering (two frames each); the full heads roaring
const cub = (i: number): number => 1 + (Math.floor(i / 2) % 2)
const roar = (i: number): number => Math.floor(i / 2) % 2
// at home the cubs sit just ahead of the fist; the full heads ride up and
// out ahead of it, the first over the post's head as it bites
const AHEAD: D = [-1, 0]
const SURGE: D = [-5, -4]
const BITE: D = [-1, -6]
// the second's bite, from the far punch's fist: its jaws on the post's head
const BITE2: D = [-1, -5]
// her coil: drawn back low onto the back foot, the fists at her side, the
// cubs riding ahead of them, clear of her face
const COIL: D = [-4, -2]
// the first breaking up behind the second, where it bit
const spent = (f: number): FxUse => fx('twinLion', f, 'hand', { d: [BITE[0], BITE[1] + 1], back: true })
const twinCels: Cel[] = [
  // the seals as the post poofs in; the Byakugan wakes on the third
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', awake({ hdy: 1 })), K('sign2', awake())]),
  c(3, 'signs', K('sign2', awake()), { post: 'stand' }),
  // sunk a pixel and drawn back, chakra gathered at the navel
  c(1, 'charge', K('gather', awake({ x: HOME + 1, dy: 1, hdy: 1 })), { post: 'stand', fx: [lav('sparks', 0, 'hand')] }),
  c(1, 'charge', K('gather', awake({ x: HOME + 1, dy: 1 })), { post: 'stand', fx: [lav('sparks', 1, 'hand')] }),
  // the near fist thrust out, rocked back: the first lion flares round it
  c(1, 'charge', K('charge', turn(awake({ x: HOME + 1, hdy: 1 }))), { post: 'stand', fx: [lion1('twinLionForm', 0, AHEAD)] }),
  ...hold(4, 'charge', K('charge', turn(awake({ x: HOME + 1 }))), i => ({ post: 'stand', fx: [lion1('twinLionForm', cub(i), AHEAD)] }), { accent: false }),
  // her coil (her own key): drawn back low onto the back foot, the fists
  // cocked at her side, and the second flares over the first, behind
  c(1, 'charge', K('windup', turn(awake({ x: HOME, dy: 1, hdy: 1 }))), { post: 'stand', fx: [lion2('twinLionForm', 0, COIL), lion1('twinLionForm', cub(0), COIL)] }),
  ...hold(4, 'charge', K('windup', turn(awake({ x: HOME, dy: 1 }))), i => ({ post: 'stand', fx: [lion2('twinLionForm', cub(i + 1), COIL), lion1('twinLionForm', cub(i), COIL)] }), { phase: 2, accent: false }),
  // a step in out of the coil, the near fist driven out, both roaring
  c(1, 'charge', K('punch', turn(awake({ x: HOME - 1, hdy: 1 }))), { post: 'stand', fx: [lion2('twinLionForm', 2, [-1, -2]), lion1('twinLionForm', 1, [-1, -2])] }),
  c(2, 'charge', K('punch', turn(awake({ x: HOME - 1 }))), { post: 'stand', fx: [lion2('twinLionForm', 1, AHEAD), lion1('twinLionForm', 2, AHEAD)] }),
  // the glide, low: the lions surge to their full size
  c(1, 'dash', K('dash', turn(awake({ x: HOME - 1, hdy: 1 }))), {
    post: 'stand',
    shout: true,
    fx: [dustAt(0, HOME + 2), lion2('twinLion', 0, SURGE), lav('streak', 0, 'hand', { d: [1, 0], back: true }), lion1('twinLion', 1, SURGE)],
  }),
  // the first bites the post's head: frozen two frames, the post rocked,
  // the second roaring over it
  c(1, 'hit', K('strike', turn(awake({ x: HOME - 3 }))), { post: 'lean', fx: [lion2('twinLion', 0, BITE, [-4, -6]), lion1('twinLion', 2, BITE), dustAt(1, HOME + 2)], shake: [-1, 0] }),
  c(1, 'hit', K('strike', turn(awake({ x: HOME - 3 }))), { post: 'lean', fx: [lion2('twinLion', 0, BITE, [-4, -6]), lion1('twinLion', 2, BITE), dustAt(2, HOME + 2)] }),
  c(1, 'hit', K('strike', turn(awake({ x: HOME - 3 }))), { post: 'lean', pdx: -1, fx: [lion2('twinLion', 1, BITE, [-4, -5]), lion1('twinLion', 2, BITE)] }),
  // the second drives down after it, roaring: frozen, the post white under
  // its jaws; the first breaks up behind it
  c(1, 'impact', K('punch', turn(awake({ x: HOME - 4 }))), { post: 'lean', pdx: -1, flash: 'post', fx: [spent(3), lion2('twinLion', 2, BITE2, [0, 0], false)], shake: [-1, 0] }),
  c(1, 'impact', K('punch', turn(awake({ x: HOME - 4 }))), { post: 'lean', pdx: -1, fx: [spent(3), lion2('twinLion', 2, BITE2, [0, 0], false)], shake: [-1, 0] }),
  c(1, 'impact', K('punch', turn(awake({ x: HOME - 4 }))), { post: 'lean', pdx: -2, fx: [spent(4), lion2('twinLion', 2, BITE2, [0, 0], false)], shake: [1, 0] }),
  // recoiled a step, the lions spent: the second breaking into tongues and
  // wisps that pull back off the post, the pop of her chakra on the wood
  c(1, 'impact', K('follow', turn(awake({ x: HOME - 3 }))), { post: 'lean', pdx: -1, fx: [spent(5), lion2('twinLion', 3, [-2, -5], [0, 0], false), lav('palmFlash', 0, 'post', { d: [0, 2] })] }),
  c(1, 'impact', K('follow', turn(awake({ x: HOME - 3 }))), { post: 'stand', pdx: 1, fx: [lion2('twinLion', 4, [-1, -5], [0, 0], false), lav('palmFlash', 1, 'post', { d: [0, 2] })] }),
  c(1, 'impact', K('follow', turn(awake({ x: HOME - 3, hdy: 1 }))), { post: 'stand', fx: [lion2('twinLion', 5, [0, -6], [0, 0], false), lav('palmFlash', 2, 'post', { d: [0, 2] })] }),
  // the hop home
  ...hopHome('back', HOME - 3, 'stand', awake()),
  // home: the Byakugan fades, the hands folded at the navel, a small smile,
  // the post poofs away
  c(1, 'recover', K('gather', { eyes: 'happy', hdy: 1 }), { post: 'stand' }),
  c(2, 'recover', K('gather', { eyes: 'happy' }), { post: 'stand' }),
  ...ending(),
]
export const TWIN_LIONS = celMove(JACKET, { name: 'Gentle Step: Twin Lion Fists', shout: 'Twin Lion Fists', on: ['shell'] }, twinCels)

// ------------------------------------------------------------------ Gentle Fist (5.0 s)

// Four soft palm strikes at the post's chakra points, each a round pop that
// sends chakra out of its far side; a step back, and an air palm that blows
// them all open.
// the four points, from where the palm lands on the post's face
const POINTS: readonly (readonly [number, number])[] = [
  [0, -3],
  [0, 2],
  [0, -1],
  [0, 4],
]
// each palm its own drawing and its own place, so the four never loop: high
// and straight, low in a split, a thrust from the hip, the last driven in
const PALM: readonly (readonly [string, number])[] = [
  ['strike', STRIKE],
  ['dash', STRIKE - 1],
  ['charge', STRIKE],
  ['punch', STRIKE - 1],
]
const palm = (i: number, tag: string, hold = 1): Cel[] => {
  const [pose, x] = PALM[i]!
  const d = POINTS[i]!
  return [
    // (the first and the last palm's pop a 1 px jolt of the stage: on all
    // four the stage shudders)
    c(1, tag, K(pose, turn(awake({ x }))), { post: 'lean', fx: [lav('palmFlash', 0, 'post', { d })], ...(i === 0 || i === 3 ? { shake: [-1, 0] as const } : {}) }),
    ...(hold > 1 ? [c(hold - 1, tag, K(pose, turn(awake({ x }))), { post: 'lean', fx: [lav('palmFlash', 0, 'post', { d })] })] : []),
    c(1, tag, K(pose, turn(awake({ x }))), { post: 'stand', pdx: -1, fx: [lav('palmFlash', 1, 'post', { d })] }),
    c(1, tag, K(pose, turn(awake({ x: x + 1 }))), { post: 'stand', fx: [lav('palmFlash', 2, 'post', { d })] }),
  ]
}
// where she steps back to for the air palm
const AIR = STRIKE + 6
const gentleCels: Cel[] = [
  // the post poofs in; the Byakugan wakes as she settles into the stance
  ...postIn('ready', [K('gather', awake({ hdy: 1 })), K('gather', awake()), K('gather', awake())]),
  ...hold(3, 'ready', K('gather', awake()), { post: 'stand', phase: 3 }),
  c(1, 'ready', K('strike', turn(awake({ hdy: 1 }))), { post: 'stand' }),
  c(2, 'ready', K('strike', turn(awake())), { post: 'stand' }),
  // in, low, in a glide
  ...runIn('dash', { style: 'glide', ready: 'ready', look: turn(awake()) }),
  // the four palms, one point each, quick and soft
  ...palm(0, 'hit', 2),
  ...palm(1, 'hit2'),
  ...palm(2, 'hit3'),
  ...palm(3, 'hit4'),
  // a step back, the palm drawn in, chakra gathering in it
  c(1, 'windup', K('crouch', awake({ x: STRIKE + 3, eyes: 'focus' })), { post: 'stand' }),
  c(1, 'windup', K('charge', awake({ x: AIR, hdy: 1 })), { post: 'stand', fx: [fx('sparks', 0, 'hand', { pal: 'air' })] }),
  ...hold(3, 'windup', K('charge', awake({ x: AIR })), { post: 'stand', fx: [fx('sparks', 'cycle', 'hand', { pal: 'air' })] }),
  // the air palm: a knot of air, the crescent flying, slamming the post
  c(1, 'impact', K('strike', turn(awake({ x: AIR }))), { post: 'stand', fx: [fx('vacuum', 0, 'hand')] }),
  c(1, 'impact', K('strike', turn(awake({ x: AIR }))), { post: 'stand', fx: [fx('vacuum', 1, 'hand')] }),
  c(1, 'impact', K('strike', turn(awake({ x: AIR }))), { post: 'lean', pdx: -1, flash: 'post', fx: [fx('vacuum', 2, 'hand'), fx('palmFlash', 0, 'post', { pal: 'air' })], shake: [-1, 0] }),
  c(1, 'impact', K('strike', turn(awake({ x: AIR }))), { post: 'lean', pdx: -1, fx: [fx('vacuum', 2, 'hand'), fx('palmFlash', 0, 'post', { pal: 'air' })], shake: [-1, 0] }),
  c(1, 'impact', K('strike', turn(awake({ x: AIR }))), { post: 'lean', pdx: -2, fx: [fx('palmFlash', 1, 'post', { pal: 'air' }), ...POINTS.map(d => lav('sparks', 0, 'post', { d: [-5, d[1]] }))], shake: [1, 0] }),
  c(1, 'impact', K('punch', turn(awake({ x: AIR }))), { post: 'lean', pdx: -1, fx: [fx('palmFlash', 2, 'post', { pal: 'air' }), ...POINTS.map(d => lav('sparks', 1, 'post', { d: [-5, d[1]] }))] }),
  c(2, 'impact', K('punch', turn(awake({ x: AIR }))), { post: 'stand', pdx: 1, fx: POINTS.map(d => lav('sparks', 2, 'post', { d: [-5, d[1]] })) }),
  // a little hop home
  ...hopHome('back', AIR, 'stand', awake(), 2, 'tuck'),
  // home: the Byakugan fades, the hands folded at the navel, the post poofs away
  c(1, 'recover', K('gather', { eyes: 'happy' }), { post: 'stand' }),
  ...ending(),
]
export const GENTLE_FIST = celMove(JACKET, { name: 'Gentle Fist', shout: 'Gentle Fist', on: ['edit'] }, gentleCels)

// ------------------------------------------------------------------ Eight Trigrams Sixty-Four Palms Protection (4.7 s)

// The stance, the Byakugan awake; then the palms build: four strikes held
// two frames each, six a frame each, then too fast to see (the arm a blur,
// streaks where the hands were) as she steps in behind them; they throw up a
// wall of palm strikes round her front, each a crescent of her lavender
// chakra (fx/wind.ts's palmFan, hers alone: not Neji's closed Rotation),
// that turns away a volley of kunai thrown in from the left; the wall is
// flung out at the post in a blade of chakra, the palm thrust after it and
// held there (the stage jolted), and the guard settles.
// the palms as they build: [pose, frames, the root's step in, a streak at the hand]
const BUILD: readonly (readonly [string, number, number, boolean])[] = [
  // two frames each, planted
  ['charge', 2, 0, false],
  ['alert', 2, 0, false],
  ['spread', 2, 0, false],
  ['raise', 2, 0, false],
  // a frame each
  ['windup', 1, 0, false],
  ['punch', 1, 0, false],
  ['alert', 1, -1, false],
  ['charge', 1, -1, false],
  ['spread', 1, -1, false],
  ['raise', 1, -1, false],
  // too fast to see: the blur, stepping in behind it
  ['whip', 1, -1, true],
  ['alert', 1, -2, true],
  ['whip', 1, -2, true],
  ['spread', 1, -2, true],
  ['whip', 1, -3, true],
  ['punch', 1, -3, true],
]
// the palms' frames, one a frame
const SPIN: readonly (readonly [string, number, boolean])[] = BUILD.flatMap(([pose, n, dx, blur]) => Array.from({ length: n }, () => [pose, dx, blur] as const))
const PALMS_N = SPIN.length
// the wall of palms: five crescents fanned out one strike a frame, then a
// strike lighting each in turn (fx/wind.ts's palmFan)
const wall = (i: number): FxUse => lav('palmFan', i < 5 ? i : 5 + ((i - 5) % 5), 'feet')
// the whole fan, for where its rim is
const FAN = palmFan.frames[9] as readonly string[]
// where a kunai at height y meets the wall's outer rim (the fan stands at
// her feet, its anchor's column 17)
const rimAt = (y: number, dx = 0): number => HOME + dx - 17 + Math.max(0, FAN[y]?.search(/[^.]/) ?? 0)
// where the blade of chakra is flung from
const RIM = HOME - 13
// kunai thrown in from the left: [the palms' frame it is thrown on, its height]
const THROWN: readonly (readonly [number, number])[] = [
  [1, 9],
  [5, 16],
  [8, 5],
  [11, 19],
  [13, 12],
]
// what of the volley shows on the palms' frame i: a kunai in flight (flying
// right, point first), the spark where it is turned away, and it falling
const volley = (i: number): FxUse[] => {
  const out: FxUse[] = []
  const dx = SPIN[Math.min(i, PALMS_N - 1)]![1]
  for (const [t0, y] of THROWN) {
    const k = i - t0
    const rim = rimAt(y, dx)
    if (k >= 0 && k < 3) out.push(fx('kunai', 0, [3 + k * 5, y], { flip: true }))
    else if (k === 3) out.push(lav('sparks', 0, [rim, y]))
    else if (k === 4) out.push(lav('sparks', 1, [rim, y]), fx('kunai', 0, [rim - 5, y + 3]))
    else if (k === 5) out.push(lav('sparks', 2, [rim, y]), fx('kunai', 0, [rim - 8, y + 7]))
  }
  return out
}
const palmsCels: Cel[] = [
  // the post poofs in; the stance, arms spread, the Byakugan waking
  ...postIn('stance', [K('spread', awake({ hdy: 1 })), K('spread', awake()), K('spread', awake())]),
  c(1, 'stance', K('gather', awake({ hdy: 1 })), { post: 'stand', fx: [lav('sparks', 0, 'hand')] }),
  c(3, 'stance', K('gather', awake()), { post: 'stand', fx: [lav('sparks', 1, 'hand')] }),
  // the palms build: the wall thrown up round her (moving with her as she
  // steps in), the kunai turned away
  ...SPIN.map(([pose, dx, blur], i) =>
    c(1, 'palms', K(pose, awake({ x: HOME + dx, eyes: 'focus', ...(i === 0 ? { hdy: 1 } : {}) })), {
      post: 'stand',
      fx: [{ ...wall(i), d: [dx, 0] }, ...volley(i), ...(blur ? [lav('streak', i % 2, 'hand', { d: [1, 0], back: true })] : [])],
      ...(i === 0 ? { shout: true as const } : {}),
    }),
  ),
  // the wall flung out at the post in a blade of chakra, the crescents
  // peeling off it one after another: her weight thrown after it, a step in
  c(1, 'release', K('spread', awake({ x: HOME - 3, hdy: 1 })), { post: 'stand', fx: [lav('palmFan', 3, 'feet'), lav('windBlade', 0, [RIM - 5, 15])] }),
  c(1, 'release', K('strike', turn(awake({ x: HOME - 4 }))), { post: 'stand', fx: [lav('palmFan', 1, 'feet'), lav('windBlade', 1, [RIM - 8, 15])] }),
  // it hits: the post white, the pop and the ring, the stage jolted; the
  // palm held out after it (the finish), then she rocks back off it
  c(1, 'impact', K('strike', turn(awake({ x: HOME - 4 }))), { post: 'lean', flash: 'post', fx: [lav('palmFan', 0, 'feet'), lav('windBlade', 2, [RIM - 9, 16]), lav('palmFlash', 0, 'post')], shake: [-1, 0] }),
  c(1, 'impact', K('strike', turn(awake({ x: HOME - 4 }))), { post: 'lean', pdx: -1, fx: [lav('palmFlash', 0, 'post')], shake: [-1, 0] }),
  c(1, 'impact', K('strike', turn(awake({ x: HOME - 4 }))), { post: 'lean', pdx: -1, fx: [lav('palmFlash', 1, 'post')], shake: [1, 0] }),
  c(3, 'impact', K('strike', turn(awake({ x: HOME - 4, hdy: 1 }))), { post: 'stand', fx: [lav('palmFlash', 2, 'post')] }),
  c(1, 'impact', K('punch', turn(awake({ x: HOME - 2 }))), { post: 'stand' }),
  // the guard settles home (stirring)
  c(1, 'impact', K('gather', awake({ x: HOME - 1, hdy: 1 })), { post: 'stand' }),
  ...hold(3, 'impact', K('gather', awake()), { post: 'stand' }),
  // the Byakugan fades on a small smile, the post poofs away
  c(1, 'recover', K('gather', { eyes: 'happy', hdy: 1 }), { post: 'stand' }),
  c(1, 'recover', K('gather', { eyes: 'happy' }), { post: 'stand' }),
  ...ending(),
]
export const PALMS = celMove(JACKET, { name: 'Eight Trigrams Sixty-Four Palms Protection', shout: '64 Palms Guard' }, palmsCels)

// ------------------------------------------------------------------ the quick strike: the Byakugan Palm (2.0 s)

// For an edit: the Byakugan wakes with a start over the seal at her collar
// ("Byakugan!") as the post poofs in; no glide this time (the Gentle Fist
// glides in): she springs, tucked, up and over the arena and drops on the
// post palm first, one palm as she lands and a second, quicker, a step in
// (a round pop, a ring); and the hop home.
const quickCels: Cel[] = [
  ...poofIn([
    c(1, 'stare', K('sign2', awake({ eyes: 'wide', hdy: 1 })), {}),
    c(1, 'stare', K('sign2', awake({ eyes: 'wide' })), {}),
    // sunk to spring, and up at the post, tucked, the head turned to it
    c(1, 'leap', K('crouch', awake({ eyes: 'focus' })), { post: 'stand' }),
    c(1, 'leap', K('tuck', turn(awake({ x: HOME - 3, lift: 3, clip: 3 }))), { post: 'stand', fx: [dustAt(0, HOME)] }),
    c(1, 'leap', K('tuck', turn(awake({ x: HOME - 6, lift: 6, clip: 3 }))), { post: 'stand', fx: [dustAt(1, HOME)] }),
    c(1, 'leap', K('tuck', turn(awake({ x: STRIKE + 1, lift: 4, clip: 3 }))), { post: 'stand' }),
  ]),
  // landing palm first on the post: frozen two frames, a pop
  c(1, 'impact', K('punch', turn(awake({ x: STRIKE }))), { post: 'lean', fx: [lav('palmFlash', 0, 'post'), dustAt(0, STRIKE)], shake: [-1, 0] }),
  c(1, 'impact', K('punch', turn(awake({ x: STRIKE }))), { post: 'lean', fx: [lav('palmFlash', 0, 'post'), dustAt(1, STRIKE)] }),
  c(1, 'impact', K('punch', turn(awake({ x: STRIKE }))), { post: 'lean', pdx: -1, fx: [lav('palmFlash', 1, 'post'), dustAt(1, STRIKE)] }),
  // the second palm, a step in, quicker, lower on the same point
  c(1, 'impact', K('strike', turn(awake({ x: STRIKE - 1 }))), { post: 'lean', pdx: -1, fx: [lav('palmFlash', 0, 'post', { d: [0, 2] })], shake: [-1, 0] }),
  c(1, 'impact', K('strike', turn(awake({ x: STRIKE - 1 }))), { post: 'stand', pdx: 1, fx: [lav('palmFlash', 2, 'post', { d: [0, 2] })] }),
  // a light skip home
  ...hopHome('back', STRIKE - 1, 'stand', awake({ eyes: 'happy' }), 1, 'tuck', { style: 'skip' }),
  ...ending(),
]
export const QUICK = celMove(JACKET, { name: 'Byakugan Palm', shout: 'Byakugan', on: ['edit'], quick: true, dojutsu: true }, quickCels)

// ------------------------------------------------------------------ the cheer (1.8 s)

// The end of a turn, no hop: the hands brought together at the navel and a
// little bow, then the fingertips poked together under her chin, shy,
// swaying once (her hair lifting), and the breath out.
const cheerCels: Cel[] = [
  c(1, 'cheer', K('gather', { eyes: 'happy', hdy: 1 })),
  c(2, 'cheer', K('bow', { eyes: 'happy' })),
  c(1, 'cheer', K('gather', { eyes: 'happy' })),
  c(1, 'cheer', K('poke', { hdy: 1 })),
  ...hold(2, 'cheer', K('poke'), { phase: 2 }),
  c(2, 'cheer', K('poke', { hdx: -1, hdy: 1 })),
  ...hold(2, 'cheer', K('poke'), { phase: 4 }),
  // the breath out, the face kept to the end
  c(1, 'cheer', K('idle1', { hdy: 1, eyes: 'happy' })),
  c(1, 'cheer', K('idle0', { eyes: 'happy' })),
]
export const CHEER = celMove(T, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)
