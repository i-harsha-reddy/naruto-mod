// Pain's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them). He hardly moves: a palm raised, and gravity does the rest, in
// lilac (the 'push' palette). But he is never a dead drawing: his long holds
// stir (the cloak's `<pose>Wind` drawings, a spike of his hair bent back) or
// strain, and his blows turn his head on the post. His cloak is the
// template's own. His weight is STOIC (kit.ts's cast weights): no sink, a
// small step, no recoil but a nod; except where his own force throws him:
// each jutsu has a key pose of its own, Shinra Tensei the push that throws
// him back sliding 4 px in dust, Bansho Ten'in the haul (leant back, the arm
// drawn in), Chibaku Tensei the core thrown up and hauled down out of the sky.
//   Shinra Tensei    a beat of stillness, the push gathered in the palm, and
//                    a filled ring of force bursting out of him across the
//                    whole stage that hurls the post off the arena
//   Bansho Ten'in    the post pulled across the arena into his reach and run
//                    through with a chakra rod
//   Chibaku Tensei   a black sphere thrown up over the arena pulls rocks, then
//                    the post, up into a moon of stone that rises away
//   Chakra Rod       (the quick strike) a black receiver drawn and thrown flat
//                    into the post, where it sticks, humming

import { celMove } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { GROUND, HOME, POST_HIT, POST_X } from '../stage.ts'
import type { Cel, CelMove, FxUse, NinjaCel, PostFrame, Template, XY } from '../types.ts'
import { K, c, cast, dustAt, fx, hold, postIn, postOut } from './kit.ts'
import type { CelOptions } from './kit.ts'

// the pull of his gravity round him: a dark ring on the floor under his feet,
// grit lifting off it (fx/pain.ts's gravityWell, his own, not the chakra aura
// the others share); and letting go, the ring breaking up (two frames)
const gravity = (): FxUse => fx('gravityWell', 'cycle', 'feet', { back: true })
const letGo = (f: number): FxUse => fx('gravityFade', f, 'feet', { back: true })
const star = (f: number, at: XY | 'post' = 'post'): FxUse => fx('impact', f, at, { pal: 'push' })
// the post's poof where it stands, `dx` off its place
const poofAt = (f: number, dx = 0, dy = 0): FxUse => fx('smoke', f, [POST_X + 1 + dx, GROUND + dy])
// the head turned three-quarters to the post, for a blow
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', eyes: 'focus', ...o })
// the last of every move: the breath let out, and standing
const settle = (last: readonly NinjaCel[] = []): NinjaCel[] => [...last, K('idle1', { hdy: 1 }), K('idle0'), K('idle0')]
// where the post stood, the ground it left settling (so a frame without it is never his rest)
const settling = (f: number): FxUse[] => [fx('wisp', Math.min(2, f), [POST_X + 1, GROUND - 2]), dustAt(Math.min(2, f), POST_X + 3)]

// ------------------------------------------------------------------ Shinra Tensei (4.8 s)

// the ring of force (48 x 24, over the whole stage), drawn round him: its
// far half behind him, its near half in front; each of its frames held two
const pushes = (f: number): FxUse[] => [fx('shinra', f, AT.stage, { back: true }), fx('shinraFront', f, AT.stage)]
// the post blown off the arena: knocked, tipped, and gone over the edge
const FLUNG: readonly [PostFrame, number, number][] = [
  ['lean', -2, 0],
  ['lean', -5, -1],
  ['lean', -9, -1],
  ['lean', -14, 0],
]
const shinraCels: Cel[] = [
  // still, arms folded, the Rinnegan on the post as it poofs in
  ...postIn('still', [K('crossed', { eyes: 'focus' }), K('crossed', { eyes: 'focus', hdy: 1 })]),
  c(2, 'still', K('crossed', { eyes: 'focus' }), { post: 'stand' }),
  // the palm held out low, the push gathering in it, his weight onto the back foot
  c(1, 'charge', K('charge', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [gravity()] }),
  ...hold(5, 'charge', K('charge', { eyes: 'focus', x: HOME + 1 }), { post: 'stand', fx: [gravity()] }),
  // wound back, the last breath before it
  c(2, 'charge', K('windup', { eyes: 'focus' }), { post: 'stand', fx: [gravity()] }),
  // "Shinra Tensei": the palm thrust out with a small step (no overshoot), he
  // flares white, and the ring bursts out of his palm across the arena (the
  // camera jolted)
  c(1, 'release', K('strike', turn({ x: HOME - 1, eyes: 'wide' })), { post: 'stand', fx: [...pushes(0), letGo(0)], shake: [1, 0], flash: 'rim' }),
  c(1, 'release', K('strike', turn({ x: HOME - 1 })), { post: 'stand', fx: [...pushes(0), letGo(1)], shake: [-1, 0] }),
  c(3, 'release', K('strikeWind', turn({ x: HOME - 1 })), { post: 'stand', fx: [...pushes(1), dustAt(0, 19)] }),
  // THE KEY POSE: it strikes the post, lit white, and hurls it off the arena,
  // the dust shoved out along the floor ahead of it; and his own force throws
  // him back, the palm still out, sliding 4 px in dust, the camera shaken
  c(2, 'impact', K('strikeWind', turn({ x: HOME + 1 })), { post: FLUNG[0]![0], pdx: FLUNG[0]![1], fx: [...pushes(2), star(0), dustAt(0, 14), dustAt(0, HOME + 4)], shake: [-1, 0], flash: 'post' }),
  c(1, 'impact', K('strike', turn({ x: HOME + 1 })), { post: FLUNG[1]![0], pdx: FLUNG[1]![1], pdy: FLUNG[1]![2], fx: [...pushes(3), star(1), fx('dustWave', 0, AT.postBase), dustAt(1, 14), dustAt(1, HOME + 5)], shake: [1, 0] }),
  c(1, 'impact', K('strike', turn({ x: HOME + 2 })), { post: FLUNG[2]![0], pdx: FLUNG[2]![1], pdy: FLUNG[2]![2], fx: [...pushes(3), fx('dustWave', 1, AT.postBase), fx('rubble', 0, AT.postBase), dustAt(0, 5), dustAt(2, HOME + 6)] }),
  // his fist closing on it as the ring sweeps off the stage's edges
  c(1, 'impact', K('punch', turn({ x: HOME + 3, hdy: 1 })), { post: FLUNG[3]![0], pdx: FLUNG[3]![1], fx: [...pushes(4), fx('dustWave', 2, AT.postBase), fx('rubble', 1, AT.postBase), dustAt(1, 5)] }),
  c(1, 'impact', K('punch', turn({ x: HOME + 3 })), { fx: [...pushes(4), fx('dustWave', 3, AT.postBase), fx('rubble', 2, AT.postBase), dustAt(2, 5)] }),
  c(1, 'impact', K('punch', turn({ x: HOME + 3, hdy: 1 })), { fx: [...pushes(5), fx('rubble', 3, AT.postBase), dustAt(0, POST_X)] }),
  c(2, 'impact', K('punchWind', turn({ x: HOME + 2 })), { fx: [...pushes(5), fx('rubble', 3, AT.postBase), dustAt(0, POST_X - 2)] }),
  // a look along the empty arena where it stood, a step after it, home
  c(1, 'recover', K('think', { eyes: 'left', x: HOME + 1, hdy: 1 }), { fx: [fx('rubble', 3, AT.postBase), dustAt(1, POST_X - 2)] }),
  c(1, 'recover', K('think', { eyes: 'left' }), { fx: [dustAt(1, POST_X + 1), dustAt(2, POST_X - 2)] }),
  c(1, 'recover', K('thinkWind', { eyes: 'left', x: HOME - 1 }), { fx: [dustAt(2, POST_X + 1)] }),
  c(3, 'recover', K('think', { eyes: 'left', x: HOME - 1 }), { fx: [fx('wisp', 0, [POST_X + 1, GROUND - 2])] }),
  c(1, 'recover', K('think', { eyes: 'half', x: HOME - 1, hdy: 1 }), { fx: [fx('wisp', 0, [POST_X + 1, GROUND - 2])] }),
  c(1, 'recover', K('crossed', { eyes: 'left', hdy: 1 }), { fx: [fx('wisp', 1, [POST_X + 1, GROUND - 2])] }),
  c(1, 'recover', K('crossedWind', { eyes: 'left' }), { fx: [fx('wisp', 2, [POST_X + 1, GROUND - 2])] }),
  c(1, 'recover', K('crossed', { eyes: 'left', hdy: 1 }), { fx: [dustAt(2, POST_X + 1)] }),
  ...settle([K('crossed', { eyes: 'left' })]).map((k, i) => c(1, 'recover', k, { fx: settling(i) })),
]

// ------------------------------------------------------------------ Bansho Ten'in (4.9 s)

// the post hauled across the arena toward his palm, a few pixels a frame,
// the lines of force streaming off its face into his hand
const HAUL = [0, 0, 1, 1, 2, 3, 5, 7, 9, 10]
const pull = (dx: number): FxUse => fx('bansho', 'cycle', [POST_HIT[0] + dx, POST_HIT[1]], { back: true })
// the rod run through it (its point the anchor), at the post hauled `dx`
const rod = (f: number, dx: number): FxUse => fx('chakraRod', f, [POST_HIT[0] + dx - 2, POST_HIT[1]])
const NEAR = HAUL[HAUL.length - 1]!

// the haul, a frame each: the post's place (hauled toward him), his pose
// and root: the palm held out at it, then THE KEY POSE, the arm drawn back
// and his weight leant back on it, as it slides in, a step back as it comes
const HAULED: readonly [number, string, number, number][] = [
  [0, 'strike', HOME - 1, 0],
  [1, 'strikeWind', HOME - 1, 0],
  [1, 'windup', HOME, 0],
  [2, 'windup', HOME, 0],
  [3, 'windup', HOME, 0],
  [5, 'windup', HOME, 1],
  [7, 'windup', HOME, 1],
  [9, 'windup', HOME, 1],
  [10, 'windup', HOME, 0],
]
// shoved away: the post blown back off the rod's pull to where it stood
const SHOVED = [NEAR - 3, NEAR - 7, 2, 0]
const banshoCels: Cel[] = [
  ...postIn('still', [K('crossed', { eyes: 'focus' }), K('crossed', { eyes: 'focus', hdy: 1 })]),
  c(2, 'still', K('crossed', { eyes: 'focus' }), { post: 'stand' }),
  // the palm aimed at it, reaching, a small step in
  c(1, 'aim', K('strike', turn({ x: HOME - 1, hdy: 1 })), { post: 'stand', fx: [gravity()] }),
  ...hold(4, 'aim', K('strike', turn({ x: HOME - 1 })), { post: 'stand', fx: [gravity(), pull(0)] }),
  // the pull released (the launch: the shout comes with it), hauling it in
  ...HAULED.map(([dx, pose, x, dy], i) =>
    c(1, 'release', K(pose, pose.startsWith('windup') ? { eyes: 'focus', x, dy, ...(i === 2 || i === 6 ? { hdy: 1 } : i === 8 ? { hdy: 1 } : {}) } : turn({ x, dy })), { post: i % 2 ? 'lean' : 'stand', pdx: dx, fx: [gravity(), pull(dx), dustAt(i % 3, POST_X + dx + 2)] }),
  ),
  // in his reach: a lunge, and run through (the camera shaken, a nod)
  c(1, 'release', K('punch', turn({ x: HOME - 2, hdy: 1 })), { post: 'stand', pdx: NEAR, fx: [gravity(), dustAt(2, POST_X + NEAR + 2)] }),
  c(2, 'impact', K('punch', turn({ x: HOME - 1 })), { post: 'lean', pdx: NEAR, fx: [rod(1, NEAR), star(0, [POST_HIT[0] + NEAR, POST_HIT[1]]), letGo(0)], shake: [-1, 0], flash: 'post' }),
  c(1, 'impact', K('punch', turn({ x: HOME - 1, hdy: 1 })), { post: 'stand', pdx: NEAR - 1, fx: [rod(1, NEAR - 1), star(1, [POST_HIT[0] + NEAR - 1, POST_HIT[1]]), letGo(1)], shake: [1, 0] }),
  c(1, 'impact', K('punchWind', turn({ x: HOME - 1 })), { post: 'lean', pdx: NEAR, fx: [rod(2, NEAR), star(2, [POST_HIT[0] + NEAR, POST_HIT[1]])] }),
  c(3, 'impact', K('punch', turn({ x: HOME - 1 })), { post: 'stand', pdx: NEAR, fx: [rod(2, NEAR)] }),
  // and shoved away: both arms flung out at it, a push off the rod that blows
  // it back across the arena to where it stood (the camera shaken, the dust
  // shoved out after it)
  ...SHOVED.map((dx, i) => c(1, 'hit2', K(i < 3 ? 'spread' : 'spreadWind', { eyes: i === 0 ? 'wide' : 'focus', x: HOME, ...(i === 0 ? { hdy: 1 } : {}) }), { post: i < 2 ? 'lean' : 'stand', pdx: dx, fx: [rod(2, dx), ...pushes(i), dustAt(Math.min(2, i), POST_X + dx + 3)], ...(i === 0 ? { shake: [-1, 0] as XY } : i === 1 ? { shake: [1, 0] as XY } : {}) })),
  c(2, 'hit2', K('spread', { eyes: 'half' }), { post: 'stand', fx: [rod(2, 0), ...pushes(4), dustAt(2, POST_X + 3)] }),
  // he straightens, arms folding; the rod left in it, humming
  c(1, 'recover', K('crossed', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [rod(2, 0), ...pushes(5)] }),
  ...hold(3, 'recover', K('crossed'), i => ({ post: 'stand', fx: [rod(2, 0), ...(i === 0 ? [fx('wisp', 1, [6, GROUND - 3]), fx('wisp', 1, [28, GROUND - 3])] : [fx('wisp', 2, [6, GROUND - 4]), fx('wisp', 2, [28, GROUND - 4])])] })),
  // gone in a poof where it stands
  ...settle([K('crossed', { eyes: 'left' })]).map((k, f) => c(1, 'recover', k, { ...(f === 0 ? { post: 'stand' as const } : {}), fx: [...(f === 0 ? [rod(2, 0)] : []), poofAt(f, 0, 6)] })),
]

// ------------------------------------------------------------------ Chibaku Tensei (5.4 s)

// the black sphere (its heart the anchor), thrown up from his hand into the
// sky over the arena, gathering the ground into a moon 26 across that the
// stage's top crops, then rising away out of the sky (fx/pain.ts's chibaku)
const SPHERE: XY = [12, 7]
const sphere = (f: number, at: XY = SPHERE): FxUse => fx('chibaku', f, at)
const THROWN: readonly XY[] = [
  [22, 4],
  [17, 5],
]
// the haul, four steps, each its own key pose and root (never two alike
// running): the arms flung wide against the pull, a step back; hauled right
// down to the ground, sunk; the hand thrown up again, a step in; and a fist
// clenched on it a step further in, the head down; each held three frames
// and strained one (the head bowed, the eyes shut), the ground torn a little
// further up into it each time
const strain = (pose: string, tag: string, o: (i: number) => CelOptions, at: Partial<NinjaCel> = {}): Cel[] => [
  ...hold(3, tag, K(pose, { eyes: 'focus', ...at }), o, { accent: false }),
  c(1, tag, K(pose, { eyes: 'shut', ...at, hdy: (at.hdy ?? 0) + 1 }), o(3)),
]
// the moon never sits: packed shut it shudders a pixel and its last rubble
// keeps slamming in (frame 3 and 4 in turn), then it goes up out of the sky,
// a few pixels a frame, until the stage's top has it
const moon = (i: number, up = 0): FxUse => sphere(i % 2 ? 4 : 3, [SPHERE[0] + (i % 3 === 1 ? -1 : 0), SPHERE[1] - up + (i % 3 === 2 ? -1 : 0)])
const RISE = [1, 3, 6, 9, 12, 14, 16, 18, 20]
const chibakuCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2')]),
  // THE KEY POSE: wound back, then the core thrown up over the arena with a
  // small step into it (the shout; the camera jolted)
  c(1, 'launch', K('windup', { eyes: 'focus' }), { post: 'stand', shout: true, fx: [gravity()] }),
  c(1, 'launch', K('windup', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [gravity()] }),
  c(1, 'launch', K('raise', { eyes: 'focus', x: HOME - 1, hdy: 1 }), { post: 'stand', fx: [gravity(), sphere(0, THROWN[0])], shake: [-1, 0] }),
  c(1, 'launch', K('raise', { eyes: 'focus', x: HOME - 1 }), { post: 'stand', fx: [gravity(), sphere(0, THROWN[1])], shake: [1, 0] }),
  c(1, 'launch', K('raiseWind', { eyes: 'focus', x: HOME - 1 }), { post: 'stand', fx: [gravity(), sphere(0)] }),
  // hauling the ground up into it: the rubble streaming up, then the post torn up
  ...strain('spread', 'pull', i => ({ post: 'stand', fx: [gravity(), sphere(1), fx('rubble', 1, AT.postBase)], ...(i === 0 ? { shake: [0, 1] as XY } : {}) }), { x: HOME + 1 }),
  ...strain('slam', 'pull', i => ({ post: i < 2 ? 'stand' : 'lean', pdy: i < 2 ? 0 : -1, fx: [gravity(), sphere(2), fx('rubble', 2, AT.postBase)], ...(i === 0 ? { shake: [0, 1] as XY } : {}) }), { dy: 1 }),
  ...strain('raise', 'pull', i => ({ post: 'lean', pdy: -2 - i, fx: [gravity(), sphere(2), fx('dust', i % 3, AT.postBase)] }), { x: HOME - 1, hdx: -1 }),
  ...strain('punch', 'pull', i => ({ post: i % 2 ? 'lean' : 'stand', pdy: -7 - i * 2, fx: [gravity(), sphere(3), fx('dust', i % 3, AT.postBase)] }), { x: HOME - 2, hdy: 1 }),
  // it packs shut round it, a flash off him that throws him back a pixel, the
  // camera shaken: a moon of stone, shuddering; his arms flung wide
  c(1, 'pull', K('spread', { eyes: 'wide', x: HOME + 1, hdy: 1 }), { fx: [gravity(), moon(0)], flash: 'rim' }),
  c(2, 'impact', K('spread', { eyes: 'wide', x: HOME + 1 }), { fx: [letGo(0), moon(1)], shake: [-1, 1] }),
  c(1, 'impact', K('spreadWind', { eyes: 'focus', x: HOME + 1 }), { fx: [letGo(1), moon(2)], shake: [1, 0] }),
  c(1, 'impact', K('spread', { eyes: 'focus', hdy: 1 }), { fx: [moon(3), dustAt(0, POST_X + 1)] }),
  // and sent up out of the sky: the hand thrust up after it with a step in
  // under it, then a hand at the chin as he watches it go
  ...RISE.map((up, i) => c(1, 'impact', K(i < 2 ? 'raise' : i < 4 ? 'raiseWind' : 'think', { eyes: i < 4 ? 'focus' : 'half', ...(i < 4 ? { x: HOME - 1 } : {}), ...(i === 0 || i === 4 || i === 7 ? { hdy: 1 } : {}) }), { fx: [moon(4 + i, up), ...(i >= 1 ? [dustAt(Math.min(2, i - 1), POST_X + 1)] : [])], ...(i === 0 ? { shake: [0, -1] as XY } : {}) })),
  // the ground it tore up settling
  c(1, 'recover', K('crossed', { hdy: 1 }), { fx: [dustAt(0, POST_X + 1), dustAt(1, POST_X + 6)] }),
  ...hold(2, 'recover', K('crossed', { eyes: 'left' }), { fx: [dustAt(1, POST_X + 1), dustAt(2, POST_X + 6)] }),
  ...settle([K('crossed', { eyes: 'left' })]).map((k, i) => c(1, 'recover', k, { fx: settling(i) })),
]

// ------------------------------------------------------------------ Chakra Rod (1.7 s)

const rodFlight = (x: number): FxUse => fx('chakraRod', 0, [x, POST_HIT[1]], { back: true })
// in the post: its point `x` (driven on through the wood a frame at a time)
// (in front of the post: it runs through it, its butt short of his hand)
const rodIn = (f: number, x: number): FxUse => fx('chakraRod', f, [x, POST_HIT[1]])
const glint = (f: number): FxUse => fx('sparks', f, 'hand', { pal: 'push' })
// Stoic and ranged: a receiver drawn and raised, glinting, his weight onto
// the back foot; thrown flat with a small step and a nod (the recoil on the
// release, never the rod biting 13 px off); it bites the post (a single
// jolt) and is driven on through the wood while he follows through.
const rodCels: Cel[] = [
  ...postIn('ready', [K('gather', { eyes: 'focus' }), K('gather', { eyes: 'focus', hdy: 1 })]),
  ...cast({
    weight: 'stoic',
    recoil: 'release',
    k: { eyes: 'focus' },
    gather: { pose: 'raise', fx: i => [glint(i)] },
    release: { n: 2, tag: 'throw', pose: 'strike', k: turn(), o: i => (i === 0 ? { shout: true } : {}), fx: i => [rodFlight(18 - 4 * i)] },
    impact: {
      n: 4,
      pose: ['follow', 'follow', 'follow', 'follow'],
      k: i => turn(i === 2 ? { hdy: 1 } : {}),
      o: i => ({ post: i === 0 ? 'lean' : 'stand', ...(i === 0 ? { flash: 'post' as const, shake: [1, 0] as XY } : i === 1 ? { pdx: -1 } : i === 2 ? { pdx: 1 } : {}) }),
      fx: i => (i === 0 ? [rodIn(1, POST_HIT[0] - 3), star(0)] : i === 1 ? [rodIn(1, POST_HIT[0] - 5), star(2)] : i === 2 ? [rodIn(2, POST_HIT[0] - 7)] : [rodIn(2, POST_HIT[0] - 8)]),
    },
    settle: false,
  }),
  ...postOut('recover', settle([K('crossed', { eyes: 'left' })]), 'stand', i => (i < 2 ? [rodIn(2, POST_HIT[0] - 8)] : [])),
]

// ------------------------------------------------------------------ the cheer (1.6 s)

// A real gesture: a breath with the eyes shut, a palm raised high as the
// Rinnegan opens (his weight onto the back foot), then the push: the palm
// thrust down at the arena with a step in, a ring of force bursting out of it
// and the dust shoved out along the floor both ways (the camera jolted);
// the one accent, the arms spread under the rain, the lids lowered and the
// head bowed; and he lets them fall.
const cheerCels: Cel[] = [
  c(1, 'rise', K('idle1', { eyes: 'shut', hdy: 1 })),
  c(1, 'rise', K('raise', { eyes: 'half', x: HOME + 1, hdy: 1 })),
  c(1, 'rise', K('raiseWind', { eyes: 'focus', x: HOME + 1 })),
  // the push
  c(1, 'cheer', K('strike', turn({ x: HOME - 1, eyes: 'wide', hdy: 1 })), { fx: [...pushes(0), dustAt(0, HOME - 9), dustAt(0, HOME + 9)], shake: [-1, 0] }),
  c(1, 'cheer', K('strike', turn({ x: HOME - 1 })), { fx: [...pushes(1), dustAt(1, HOME - 10), dustAt(1, HOME + 10)] }),
  c(1, 'cheer', K('strikeWind', turn({ x: HOME - 1 })), { fx: [...pushes(2), dustAt(2, HOME - 11), dustAt(2, HOME + 11)] }),
  // the one accent: the arms spread under the rain as the ring sweeps off the
  // stage, then the lids lowered and the head bowed a pixel
  c(1, 'cheer', K('spread', { eyes: 'open' }), { fx: [...pushes(3), fx('wisp', 0, [HOME - 13, GROUND - 3]), fx('wisp', 0, [HOME + 11, GROUND - 3])] }),
  c(1, 'cheer', K('spread', { eyes: 'half', hdy: 1 }), { fx: [...pushes(4), fx('wisp', 1, [HOME - 13, GROUND - 4]), fx('wisp', 1, [HOME + 11, GROUND - 4])] }),
  c(1, 'cheer', K('spreadWind', { eyes: 'half' }), { fx: [...pushes(5), fx('wisp', 2, [HOME - 13, GROUND - 6]), fx('wisp', 2, [HOME + 11, GROUND - 6]), fx('wisp', 0, [HOME - 20, GROUND - 3]), fx('wisp', 0, [HOME - 26, GROUND - 2]), dustAt(1, HOME - 15)] }),
  // (the push's last breath settling as dust, never gone in a frame)
  c(1, 'cheer', K('spreadWind', { eyes: 'half', hdy: 1 }), { fx: [fx('dustWave', 3, [HOME - 14, GROUND]), dustAt(2, HOME - 22), fx('wisp', 2, [HOME - 20, GROUND - 4]), fx('wisp', 2, [HOME - 14, GROUND - 7]), fx('wisp', 1, [HOME - 26, GROUND - 3])] }),
  c(1, 'cheer', K('idle1', { hdy: 1 }), { fx: [fx('wisp', 2, [HOME - 20, GROUND - 5]), fx('wisp', 1, [HOME - 14, GROUND - 8])] }),
  c(2, 'cheer', K('idle0')),
]

// ------------------------------------------------------------------ the builder

export const painMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [
    celMove(t, { name: 'Shinra Tensei', shout: 'Shinra Tensei', on: ['shell'] }, shinraCels),
    celMove(t, { name: "Bansho Ten'in", shout: "Bansho Ten'in", on: ['edit'] }, banshoCels),
    celMove(t, { name: 'Chibaku Tensei', shout: 'Chibaku Tensei' }, chibakuCels),
  ],
  quick: celMove(t, { name: 'Chakra Rod', shout: 'Chakra Rod', on: ['edit'], quick: true, dojutsu: false }, rodCels),
  cheer: celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels),
})
