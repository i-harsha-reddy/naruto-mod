// Obito's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them). The masked man, cold and still, with the Mangekyō in the
// mask's one eye hole in his jutsu (the eyes 'mk'; the plain Sharingan when
// he only reads); and Tobi, who is a good boy. His long holds stir (the
// cloak's `<pose>Wind` drawings, a spike of hair bent back), his blows turn
// his head on the post. His cloak is the template's, his raise its wave
// (ninja/obito.ts). His weight is LIGHT (kit.ts's cast weights): a quick dip,
// a step 2 px past its mark, a hop where another would settle. Each jutsu
// has a key pose of its own: Kamui the fist clenched as he leans in to wring
// the post away, the Nine-Tails the palm slapped to the ground, Wood Style
// the palms hauled up off the floor with the stakes.
//   Kamui            a swirl winds up in the eye hole, space twists open on the
//                    post and wrings it into nothing, and it is drawn back
//                    into his eye
//   Nine-Tails       the summoning slapped to the ground, and the Nine-Tails
//                    rises out of smoke over the arena, huge, his jaws over
//                    the post, and a Tailed Beast Ball gathers in its maw
//                    and is fired down into the post
//   Wood Style       a palm to the floor, a crack racing to the post, and
//                    stakes bursting up through it
//   Tobi is a good   (the quick strike) a wave, a goofy hop and a flying
//   boy              kick into the post, and a hop home

import { celMove } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { GROUND, HOME, POST_HIT, POST_X } from '../stage.ts'
import type { Cel, CelMove, FxUse, NinjaCel, Template, XY } from '../types.ts'
import { K, awake, c, dustAt, fx, hold, hopHome, leap, postIn, postOut } from './kit.ts'

// the dojutsu awake in a jutsu: the Mangekyō in the eye hole
const sh = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => awake({ eyes: 'mk', ...o })
// the head turned three-quarters to the post, for a blow
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', ...o })
// the moods of his own eye states, for the companion
const EYES = { moods: { mk: 'focus' } } as const
// the eye hole, from the head's top-left (the middle of its 2 x 2)
const EYE: XY = [8, 13]
const atEye = (f: number): FxUse => fx('vortex', f, 'head', { d: EYE })
// the last of every move: the breath let out, and standing
const settle = (last: readonly NinjaCel[] = []): NinjaCel[] => [...last, K('idle1', { hdy: 1 }), K('idle0'), K('idle0')]

// ------------------------------------------------------------------ Kamui (4.8 s)

// space twisted open on the post, turning a quarter a frame, and shrinking
// as it wrings the post away: big (17 across), then tighter (13), small (9),
// closing on nothing (fx/kamui.ts's kamuiWring)
const warp = (): FxUse => fx('kamui', 'cycle', AT.postMid)
const wring = (f: number): FxUse => fx('kamuiWring', f, AT.postMid)
const shut = (f: number): FxUse => fx('vortex', f, AT.postMid)
const twinkle = (f: number, at: XY): FxUse => fx('sparks', f, at, { pal: 'kamui' })
const GONE: XY = [POST_X + 1, 17]

// His body through it, never the same drawing twice running: still; a hand
// to the mask, the weight dipped back (a swirl winds up in the eye hole); the
// arm thrown out at the post 2 px past its mark (space twists open on it,
// the camera shaken); THE KEY POSE, leaned in with the fist clenched,
// wringing it (shaken again); the other arm flung up, drawing it in as the
// swirl closes small; and a light hop back as the last of it goes into his eye.
const kamuiCels: Cel[] = [
  ...postIn('stare', [K('crossed', sh()), K('crossed', sh({ hdy: 1 }))]),
  c(1, 'stare', K('crossed', sh()), { post: 'stand' }),
  c(1, 'stare', K('crossedWind', sh()), { post: 'stand' }),
  // a hand to the mask, his weight dipped back: a swirl winds up round the eye hole
  c(1, 'focus', K('think', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand', shout: true, fx: [atEye(0)] }),
  c(1, 'focus', K('think', sh({ x: HOME + 1, dy: 1 })), { post: 'stand', fx: [atEye(1)] }),
  c(3, 'focus', K('thinkWind', sh({ x: HOME + 1, dy: 1 })), { post: 'stand', fx: [atEye(2)] }),
  c(1, 'focus', K('think', sh({ x: HOME + 1 })), { post: 'stand', fx: [atEye(6)] }),
  // the arm thrown out at the post, 2 px past its mark, the head after it:
  // space twists open on it, big, the camera shaken
  c(1, 'release', K('strike', sh(turn({ x: HOME - 3, hdy: 1 }))), { post: 'stand', fx: [atEye(7)] }),
  c(2, 'impact', K('strike', sh(turn({ x: HOME - 1, hdy: 1 }))), { post: 'stand', fx: [shut(0)], shake: [-1, 0], flash: 'post' }),
  c(1, 'impact', K('strike', sh(turn({ x: HOME - 1 }))), { post: 'stand', fx: [shut(1)], shake: [1, 0] }),
  c(2, 'impact', K('strikeWind', sh(turn({ x: HOME - 1 }))), { post: 'twist1', fx: [warp()] }),
  // the key pose: leaned in, the fist clenched on it, wringing the post
  c(1, 'hit2', K('punch', sh(turn({ x: HOME - 2, hdx: -1, hdy: 1 }))), { post: 'twist2', fx: [wring(0)], shake: [-1, 0] }),
  c(1, 'hit2', K('punch', sh(turn({ x: HOME - 2, hdx: -1 }))), { post: 'twist2', fx: [wring(1)], shake: [1, 0] }),
  c(1, 'hit2', K('punchWind', sh(turn({ x: HOME - 2, hdx: -1 }))), { post: 'twist2', fx: [wring(2)] }),
  c(1, 'hit2', K('punch', sh(turn({ x: HOME - 2, hdx: -1, hdy: 1 }))), { post: 'twist2', fx: [wring(3)] }),
  c(1, 'hit2', K('punch', sh(turn({ x: HOME - 2 }))), { post: 'twist3', fx: [wring(2)] }),
  c(1, 'hit2', K('punchWind', sh(turn({ x: HOME - 2, hdy: 1 }))), { post: 'twist3', fx: [wring(3)] }),
  // the other arm flung up, drawing it in: the swirl small, the post wrung into it
  c(1, 'hit3', K('alert', sh({ x: HOME - 1, hdy: 1 })), { post: 'twist3', fx: [wring(3)] }),
  c(2, 'hit3', K('alert', sh({ x: HOME - 1 })), { post: 'twist3', fx: [wring(4)] }),
  c(1, 'hit3', K('alert', sh({ x: HOME - 1, hdx: 1 })), { fx: [wring(4)] }),
  // it shuts on nothing; a light hop back, a hand to the mask, and the last
  // of it is drawn into his eye
  c(1, 'close', K('think', sh({ x: HOME, lift: 2 })), { fx: [wring(5)] }),
  c(1, 'close', K('think', sh({ x: HOME + 1, lift: 1 })), { fx: [wring(6)] }),
  c(1, 'close', K('think', sh({ x: HOME + 1, dy: 1, hdy: 1 })), { fx: [twinkle(0, GONE), atEye(7)] }),
  c(3, 'close', K('think', sh({ x: HOME + 1 })), { fx: [twinkle(1, GONE), atEye(0)] }),
  c(1, 'recover', K('thinkWind', sh()), { fx: [twinkle(2, GONE)] }),
  c(1, 'recover', K('crossed', sh({ hdy: 1 })), { fx: [twinkle(2, GONE)] }),
  c(1, 'recover', K('crossed', sh()), {}),
  c(1, 'recover', K('crossedWind', sh()), {}),
  ...settle([K('crossed', { eyes: 'left' })]).map((k, i) => c(1, 'recover', k, { fx: [fx('wisp', Math.min(2, i), [POST_X + 1, GROUND - 2])] })),
]

// ------------------------------------------------------------------ Summoning: Nine-Tails (5.0 s)

// the fox (the summon sprite, a head-and-shoulders bust 25 x 24 filling the
// arena from floor to sky, whole on the stage: the ears, the red slit eyes in
// their black rims, the snout and the maw open over the post, both forepaws
// planted) looming over the arena, rising out of the ground (`sink`) and
// breathing (a pixel down and up). Behind Obito and the post.
const FOX: XY = [5, GROUND]
const fox = (sink = 0): FxUse => fx('kurama', 0, FOX, { back: true, ...(sink ? { sink } : {}) })
// his maw, where the Tailed Beast Ball gathers (under the snout, clear of
// the near eye): red and blue streaks drawn in, packed into a black-purple
// sphere, held pulsing, then fired down into the post, where it goes off
const MAW: XY = [4, 13]
const ball = (f: number): FxUse => fx('bijuudama', f, MAW)
const blast = (f: number): FxUse => fx('bijuuBlast', f, AT.postBase)
const cloud = (f: number): FxUse[] => [fx('smoke', f, [2, GROUND]), fx('smoke', f, [12, GROUND - 4]), fx('smoke', f, [6, GROUND - 13])]

const nineTailsCels: Cel[] = [
  ...postIn('signs', [K('sign1', sh({ hdy: 1 })), K('sign1', sh()), K('sign2', sh({ hdy: 1 })), K('sign2', sh())]),
  c(1, 'signs', K('sign3', sh({ hdy: 1 })), { post: 'stand' }),
  c(1, 'signs', K('sign3', sh()), { post: 'stand' }),
  // the palm slapped to the ground, sunk into it, the head turned on the
  // arena: the seal's ring, its script racing out
  c(1, 'slam', K('slam', sh(turn({ dy: 1, hdy: 1 }))), { post: 'stand', shout: true, fx: [fx('sealRing', 0, 'hand', { back: true }), fx('dust', 0, 'hand')], shake: [0, 1] }),
  c(1, 'slam', K('slam', sh(turn({ dy: 1 }))), { post: 'stand', fx: [fx('sealRing', 1, 'hand', { back: true }), fx('dust', 1, 'hand')] }),
  ...[0, 1, 2, 3].map(f => c(1, 'slam', K('slam', sh(turn(f < 2 ? { dy: 1 } : {}))), { post: 'stand', fx: [fx('sealRing', 3, 'hand', { back: true }), fx('sealLine', f, 'hand', { back: true, d: [-1, 0] })] })),
  // a burst of smoke on the arena, and the Nine-Tails rises out of it, huge;
  // he straightens off the floor, drawn back a pixel at the sight
  c(1, 'peek', K('slam', sh(turn())), { post: 'stand', fx: [fx('sealLine', 4, 'hand', { back: true, d: [-1, 0] }), ...cloud(1)], shake: 1 }),
  c(1, 'peek', K('gather', sh({ x: HOME + 1 })), { post: 'stand', fx: [fox(16), ...cloud(2)] }),
  c(1, 'peek', K('gather', sh({ x: HOME + 1 })), { post: 'stand', fx: [fox(10), ...cloud(3)] }),
  c(1, 'peek', K('gather', sh({ x: HOME + 1 })), { post: 'stand', fx: [fox(4), ...cloud(4)] }),
  c(2, 'peek', K('crossed', sh({ eyes: 'smug' })), { post: 'stand', fx: [fox()] }),
  // the Tailed Beast Ball: two fingers raised, he has it gather at the maw,
  // red and blue drawn in and packed black, held pulsing; he leans in on it,
  // then winds back low to fire it
  c(1, 'charge', K('seal', sh({ hdy: 1 })), { post: 'stand', fx: [fox(), ball(0)] }),
  c(1, 'charge', K('seal', sh()), { post: 'stand', fx: [fox(), ball(1)] }),
  c(1, 'charge', K('seal', sh({ x: HOME - 1, hdx: -1 })), { post: 'stand', fx: [fox(), ball(2)] }),
  ...hold(2, 'charge', K('seal', sh({ x: HOME - 1, hdx: -1 })), i => ({ post: 'stand', fx: [fox(), ball(i % 2 ? 3 : 4)] })),
  ...hold(3, 'charge', K('windup', sh({ dy: 1 })), i => ({ post: 'stand', fx: [fox(i === 2 ? 1 : 0), ball(i % 2 ? 4 : 3)] })),
  // fired down into the post at his pointing, a light step 2 px past its
  // mark, and the kick of it back onto his heels (it lands far off: the
  // recoil comes on the release); it goes off (held two frames, the blow's
  // hit-stop, the camera shaken; no flash: the post stands in his jaws)
  c(1, 'release', K('strike', sh(turn({ x: HOME - 3, hdy: 1 }))), { post: 'stand', fx: [fox(), ball(4)] }),
  c(1, 'release', K('strike', sh(turn({ x: HOME + 1 }))), { post: 'stand', fx: [fox(), ball(4)] }),
  c(2, 'impact', K('strikeWind', sh(turn({ x: HOME + 1, hdy: 1 }))), { post: 'lean', fx: [fox(), blast(0)], shake: [-1, 0] }),
  c(1, 'impact', K('strike', sh(turn({ x: HOME + 1 }))), { post: 'lean', pdx: -1, fx: [fox(1), blast(1)], shake: [1, 0] }),
  c(1, 'impact', K('strike', sh(turn({ x: HOME + 1 }))), { post: 'lean', pdx: -1, fx: [fox(1), blast(1)] }),
  // and the master flings his arms wide at it, with a little hop, as the smoke clears
  c(1, 'impact', K('spread', sh({ hdy: 1 })), { post: 'scorchLean', fx: [fox(1), blast(2)] }),
  c(1, 'impact', K('spread', sh({ lift: 2 })), { post: 'scorchLean', fx: [fox(1), blast(2)] }),
  c(1, 'impact', K('spreadWind', sh({ lift: 1 })), { post: 'scorch', fx: [fox(), blast(3)] }),
  c(1, 'impact', K('spread', sh({ dy: 1 })), { post: 'scorch', fx: [fox(), blast(4)] }),
  c(1, 'impact', K('spread', sh()), { post: 'scarred', fx: [fox(), blast(5)] }),
  c(2, 'impact', K('spreadWind', sh()), { post: 'scarred', fx: [fox(), blast(6)] }),
  // and the fox goes as it came, sinking into its smoke
  // (a step back to watch him go)
  ...[[5, 1], [10, 2], [16, 3]].map(([sink, f]) => c(1, 'fade', K('crossed', sh({ eyes: 'smug', x: HOME + 1 })), { post: 'scarred', fx: [fox(sink), ...cloud(f!)] })),
  c(1, 'fade', K('crossed', sh({ eyes: 'smug', x: HOME + 1 })), { post: 'scarred', fx: cloud(3) }),
  c(1, 'fade', K('crossed', sh({ eyes: 'smug', hdy: 1 })), { post: 'scarred', fx: [fx('smoke', 3, [6, GROUND - 13]), fx('smoke', 4, [2, GROUND]), fx('smoke', 4, [12, GROUND - 4])] }),
  c(1, 'fade', K('think', sh({ eyes: 'smug' })), { post: 'scarred', fx: cloud(4) }),
  ...postOut('recover', settle([K('crossed', { eyes: 'smug' })]), 'scarred'),
]

// ------------------------------------------------------------------ Wood Style (4.8 s)

// the stakes (16 x 16, standing on the ground): cracks, points, the burst,
// settling; a crack racing along the floor to the post first
const stakes = (f: number, at: XY = AT.postBase, sink = 0): FxUse => fx('woodSpikes', f, at, sink ? { sink } : {})
const RACE = [24, 20, 16]
const woodCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2')]),
  c(1, 'signs', K('sign3', { hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign3'), { post: 'stand' }),
  c(2, 'signs', K('sign1', { hdy: 1 }), { post: 'stand' }),
  // a palm slapped to the floor, sunk into it, the head turned on the post
  c(1, 'slam', K('slam', sh(turn({ dy: 1, hdy: 1 }))), { post: 'stand', fx: [fx('dust', 0, 'hand'), stakes(0, [RACE[0]!, GROUND])], shake: [0, 1] }),
  ...hold(3, 'slam', K('slam', sh(turn({ dy: 1 }))), { post: 'stand', fx: [fx('dust', 1, 'hand'), stakes(0, [RACE[0]!, GROUND])] }),
  // the crack races along the floor to the post, his weight pressed into it
  ...RACE.slice(1).map((x, i) => c(1, 'wave', K('slam', sh(turn({ x: HOME - 1, dy: 1, hdy: 1 }))), { post: 'stand', fx: [stakes(0, [x, GROUND]), dustAt(i, x + 3)] })),
  c(1, 'wave', K('slam', sh(turn({ x: HOME - 1, dy: 1, hdy: 1 }))), { post: 'stand', fx: [stakes(0)] }),
  // stakes burst up through it as he hauls his palms up off the floor, rising
  // back a pixel with them: the post knocked up and rocked
  c(2, 'impact', K('gather', sh({ x: HOME + 1 })), { post: 'lean', pdy: -2, fx: [stakes(1)], shake: [1, 1], flash: 'post' }),
  c(1, 'impact', K('gather', sh({ x: HOME + 1, hdy: 1 })), { post: 'lean', pdy: -3, fx: [stakes(1)] }),
  c(1, 'impact', K('gather', sh({ x: HOME + 1 })), { post: 'lean', pdy: -3, fx: [stakes(2)], shake: -1 }),
  c(1, 'impact', K('spread', sh({ hdy: 1 })), { post: 'stand', pdy: -2, fx: [stakes(2)] }),
  c(2, 'impact', K('spread', sh()), { post: 'stand', pdy: -1, fx: [stakes(2)] }),
  ...hold(3, 'impact', K('spread', sh()), { post: 'stand', fx: [stakes(3)] }),
  // a hand to the mask, the eye on his work, a step toward it
  c(1, 'impact', K('think', sh({ x: HOME - 1, hdy: 1 })), { post: 'stand', fx: [stakes(3)] }),
  ...hold(5, 'impact', K('think', sh({ x: HOME - 1 })), { post: 'stand', fx: [stakes(3)], phase: 2 }),
  // drawn back into the ground as he steps back from it
  c(1, 'retract', K('crossed', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand', fx: [stakes(3, AT.postBase, 4)] }),
  c(1, 'retract', K('crossed', sh({ x: HOME + 1 })), { post: 'stand', fx: [stakes(3, AT.postBase, 8)] }),
  c(1, 'retract', K('crossed', sh({ x: HOME + 1 })), { post: 'stand', fx: [stakes(3, AT.postBase, 12), dustAt(0, POST_X + 1)] }),
  ...hold(2, 'recover', K('crossed', { eyes: 'left' }), { post: 'stand', fx: [dustAt(1, POST_X + 1)] }),
  c(1, 'recover', K('crossed', { eyes: 'left', hdy: 1 }), { post: 'stand' }),
  ...postOut('recover', settle([K('crossed', { eyes: 'left' })]), 'stand', i => (i === 0 ? [dustAt(2, POST_X + 1)] : [])),
]

// ------------------------------------------------------------------ Tobi Is a Good Boy (1.9 s)

// a wave, a goofy hop toward the post with a fist pumped, a flying kick into
// it, and a hop home
const KICK_X = POST_HIT[0] + 13
const hopIn = leap('leap', { eyes: 'happy' }, { to: HOME - 5, lift: 4, hang: 1, squash: 1, post: 'stand' })
const tobiCels: Cel[] = [
  ...postIn('ready', [K('wave', { eyes: 'happy' }), K('waveWind', { eyes: 'happy' })]),
  // (the shout as he leaps)
  ...hopIn.map((cel, i) => (i === 1 ? { ...cel, shout: true as const } : cel)),
  c(1, 'leap', K('kick', turn({ x: KICK_X + 2, lift: 2, eyes: 'happy' })), { post: 'stand', fx: [dustAt(0, HOME - 5)] }),
  // the kick lands: held, the post lit and rocked, a gold star, a jolt
  c(2, 'impact', K('kick', turn({ x: KICK_X, eyes: 'happy' })), { post: 'lean', fx: [fx('impact', 0, 'post', { pal: 'hit' })], flash: 'post', shake: [1, 0] }),
  c(1, 'impact', K('kick', turn({ x: KICK_X, eyes: 'happy' })), { post: 'stand', pdx: -1, fx: [fx('impact', 1, 'post', { pal: 'hit' })] }),
  // and home in a flicker (Kamui's warp: gone in a puff, back home in one)
  ...hopHome('back', KICK_X, 'stand', { eyes: 'happy' }, 1, 'jump', { style: 'flicker' }).map((cel, i) => (i < 2 ? { ...cel, fx: [...(cel.fx ?? []), fx('impact', 2 + i, 'post', { pal: 'hit' })] } : cel)),
  // a wave from home through the last of the cloud, and settled
  ...postOut('recover', [K('wave', { eyes: 'happy' }), K('idle1', { eyes: 'happy', hdy: 1 }), K('idle0')], 'stand', i =>
    i === 0
      ? [fx('smoke', 4, [HOME - 4, GROUND]), fx('smoke', 4, [HOME + 5, GROUND]), fx('smoke', 4, [HOME, GROUND - 10]), fx('wisp', 0, [HOME - 6, GROUND - 3]), fx('wisp', 0, [HOME + 6, GROUND - 3])]
      : i === 1
        ? [fx('smoke', 4, [HOME, GROUND - 11]), fx('wisp', 1, [HOME - 6, GROUND - 4]), fx('wisp', 1, [HOME + 6, GROUND - 4])]
        : [fx('wisp', 2, [HOME - 6, GROUND - 5]), fx('wisp', 2, [HOME + 6, GROUND - 5])],
  ),
]

// ------------------------------------------------------------------ the cheer (1.7 s)

// Tobi: a hop with a fist pumped, then waving away, the glint in the eye
// hole; one goofy bounce on the wave, and he settles
const cheerCels: Cel[] = [
  ...leap('hop', { eyes: 'happy' }, { lift: 4, hang: 1, squash: 1 }),
  c(1, 'cheer', K('wave', { eyes: 'happy', hdy: 1 }), { fx: [dustAt(2, HOME)] }),
  ...hold(3, 'cheer', K('wave', { eyes: 'happy' }), { phase: 2 }),
  c(2, 'cheer', K('wave', { eyes: 'happy', dy: 1 })),
  c(1, 'cheer', K('wave', { eyes: 'happy' })),
  c(1, 'cheer', K('idle1', { eyes: 'happy', hdy: 1 })),
  c(2, 'cheer', K('idle0', { eyes: 'happy' })),
]

// ------------------------------------------------------------------ the builder

export const obitoMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [
    celMove(t, { name: 'Kamui', shout: 'Kamui', on: ['shell'] }, kamuiCels, EYES),
    celMove(t, { name: 'Summoning Jutsu: Nine-Tails', shout: 'Summon: Nine-Tails', dojutsu: true, on: ['agent'] }, nineTailsCels, EYES),
    celMove(t, { name: 'Wood Style: Cutting Technique', shout: 'Wood Style', on: ['edit'] }, woodCels, EYES),
  ],
  quick: celMove(t, { name: 'Tobi Is a Good Boy', shout: 'Tobi is a good boy', on: ['edit'], quick: true, dojutsu: false }, tobiCels),
  cheer: celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels),
})
