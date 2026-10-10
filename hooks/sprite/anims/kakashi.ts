// Kakashi's moves as cels, hand-keyed at 10 fps: pose to pose, snaps not
// tweens, and never a dead drawing (anims/kit.ts says how to write a move:
// its helpers hold(), runIn(), hopHome() and leap() are the shared motion).
// Read each as a film strip: one line a held drawing. In the action poses
// (the run, the blow, the slam, Kamui's aim) his head turns three-quarters
// to the post ('turn', or 'turnSharingan' with the headband up).

import { celMove } from '../cels.ts'
import { GROUND, HOME, POST_X, STRIKE } from '../stage.ts'
import { VEST } from '../templates/vest.ts'
import { wear } from '../dress.ts'
import type { Cel, FxUse, NinjaCel, PoseGrid } from '../types.ts'
import type { CelOptions } from './kit.ts'
import { K, awake, c, dustAt, fx, hold, hopHome, leap, postIn, postOut, runIn } from './kit.ts'

// ------------------------------------------------------------------ his own drawings

// The charge's second key (anims/kakashi.ts's Raikiri alternates it with the
// vest's charge): sunk a pixel deeper and leant a pixel further in, the
// shoulders hunched up round the neck, the lightning arm drawn back in, its
// elbow cocked, the hand low at the front knee, the other hand still clamped
// on the forearm. The ball rides back and down with the hand, so the
// alternation reads as the arm straining against it.
const CHARGE2: readonly string[] = [
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '.....oooooooooooooo.......',
  '...oncnvvvwwmmmwwwxlo.....',
  '.oonmmovwwwwwwwwxxolo.....',
  'onnmoOOOOOOOwwwxxoko......',
  'onmoSKMMMMMMOwxxooo.......',
  'oSKooOOOOOOOOqqqrro.......',
  'oKKouuuto...ouuuutto......',
]

// The summoning's push (Ninken): the palms driven down into the seal as
// the pack bursts out, the body thrown forward and down over the arm, the
// elbow bent with the weight, the fingers splayed flat on the ground.
const SLAM_PUSH: readonly string[] = [
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '...................oooo...',
  '..................ovvxo...',
  '.......oo.........ovwxo...',
  '......onmo.......ovwwxo...',
  '.....onmlo......oxxxxxo...',
  '....onmlo..ooooopqqqqro...',
  'osskssskko.obbbbo.oqqro...',
  'okkkkokkko.ouutto.ouutto..',
]

// The Mangekyo's reveal (Kamui): the far hand up at his brow, fingers hooked
// under the headband where it slants over his eye (REVEAL), then shoved up
// with it, the red eye bared under the palm (REVEAL_UP: worn with the
// Sharingan's head). Drawn over the head (UPPERCASE), the elbow down at the
// shoulder, the forearm up across the cheek.
const BODY_LOW: readonly string[] = [
  '......oooooooooooooMMlo...',
  '....oncnvvvwwmmmwwwxlo....',
  '....onmovvwwwwwwwxxolo....',
  '....onmovwwwwwwwwxxolo....',
  '....oskovwwwwwwwwxxoo.....',
  '....oskoxxxxxxxxxxxo......',
  '.....ooopqqqqqqqqrro......',
  '........obbbooqqro........',
  '.......ouuttoouutto.......',
]
const REVEAL: readonly string[] = [
  ...Array.from({ length: 9 }, () => '..........................'),
  '...............OOOO.......',
  '..............OSSKKO......',
  '..............OSKKKO......',
  '...............OOKMMO.....',
  '.................OMMMO....',
  '..................OMMlo...',
  ...BODY_LOW,
]
const REVEAL_UP: readonly string[] = [
  ...Array.from({ length: 7 }, () => '..........................'),
  '...............OOOO.......',
  '..............OSSKKO......',
  '..............OSKKKO......',
  '...............OOKMO......',
  '.................OMMO.....',
  '..................OMMO....',
  '...................OMMO...',
  '...................OMMlo..',
  ...BODY_LOW,
]

// Kamui's strain (the pull at its worst): the aiming arm still thrown out
// at the post, the free hand clamped to the side of his face by the
// Sharingan, fingers over the brow (UPPERCASE, over the head; the red eye
// bared under them), its elbow jutting up and out behind the head; the body
// twisted back off the aim two columns, the weight on the back foot, the
// front leg braced long. Worn with the head turned (turnSharingan).
const STRAIN: readonly string[] = [
  ...Array.from({ length: 10 }, () => '..........................'),
  '..............OOOO........',
  '.............OSSSKO.......',
  '..............OSKKOOO.....',
  '..............OKKKMMMOO...',
  '...............OOOMMMMMO..',
  '............ooooooOOMMMlo.',
  '...........onvvvwwmmmOMlo.',
  '.ooooooooo.onmvwwwwwxxlo..',
  'osskonnnnnnnnmvwwwwwxxlo..',
  'okkkommmmmmmmmovwwwwxxlo..',
  '.ooooooooooooooxxxxxxxo...',
  '.........oopqqqqqqqqrro...',
  '.......obbbbboo...oqqqro..',
  '......ouuuuttto..ouuutto..',
]

// A Thousand Years of Death: crouched low at the post's back, the TIGER held
// out low, the hands clasped and both index fingers up (UPPERCASE, clear of
// the face); and the poke, up out of the crouch, the clasped hands jabbed in
// level, fingers first.
const TIGER: readonly string[] = [
  ...Array.from({ length: 6 }, () => '..........................'),
  '.oo.......................',
  'oSKo......................',
  'oSKo..oooooooooooooo......',
  'oSKoooncvvvwwmmmwwwxlo....',
  'oSSKKmmmvwwwwwwwwxxolo....',
  'oKKKKommovwwwwwwwwxolo....',
  '.oooooooooxxxxxxxxxooo....',
  '....oobbboqqqqqqqqqroo....',
  '...ouutttoo......ouuttto..',
]
const JAB: readonly string[] = [
  ...Array.from({ length: 5 }, () => '..........................'),
  '.........oooooooooooo.....',
  '........onvvvwwmmmwxlo....',
  '...oooo.onmvwwwwwwxxlo....',
  '.ooSSKoonnmvwwwwwwxxlo....',
  'oSSSKKommmmovwwwwwxxlo....',
  '.ooooooooooooxxxxxxxoo....',
  '.........oopqqqqqqrro.....',
  '.......obbbboo.oqqqro.....',
  '......ouuuttto.ouutto.....',
]

// his own poses for his moves (ninja/kakashi.ts wears them too), and the vest
// with them, for the beats (the companion's pose and face for each)
export const KAKASHI_POSES = {
  charge2: { as: 'charge', rows: CHARGE2, head: [-2, 3], hand: [2, 10], eyes: 'focus' },
  slamPush: { as: 'slam', rows: SLAM_PUSH, head: [-1, 2], hand: [4, 13], eyes: 'focus' },
  reveal: { as: 'alert', rows: REVEAL, hand: [16, 10], eyes: 'focus' },
  revealUp: { as: 'alert', rows: REVEAL_UP, hand: [16, 8], eyes: 'focus' },
  strain: { as: 'charge', rows: STRAIN, head: [1, 0], hand: [1, 18], eyes: 'focus' },
  tiger: { as: 'gather', rows: TIGER, head: [1, 3], hand: [1, 7], eyes: 'focus' },
  jab: { as: 'strike', rows: JAB, head: [-2, 1], hand: [0, 9], eyes: 'focus' },
} as const satisfies Record<string, PoseGrid>
const T = wear(VEST, KAKASHI_POSES)

// the head turned to the post, the Sharingan bared
const shT = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => awake({ head: 'turnSharingan', ...o })

// Every move ends on idle1 (the head dipped) for a frame, then idle0 for two
// as the post poofs away.
const ending = (frame: 'stand' | 'scarred' = 'stand', more: readonly FxUse[] = []): Cel[] => [
  c(1, 'recover', K('idle1', { hdy: 1 }), { post: frame, fx: [...more] }),
  ...postOut('recover', [K('idle0'), K('idle0')], frame),
]

// ------------------------------------------------------------------ Raikiri (4.4 s)

// The fast seals as the post poofs in, the Chidori gathered in the palm as
// the Sharingan opens; the charge in three keys, each its own drawing: the
// arm thrust down at the front (the vest's charge, its shoulders heaving),
// then drawn back in low at the front knee as he sinks a pixel deeper
// (charge2), the Raikiri flaring bigger at each change, then lifted up
// beside his head, crackling, as he rises into it (the stretch before the
// sink); the run too fast to see, one smear with the lightning torn out
// behind; THE BLOW, the biggest frame of the move: the ball bursts through
// the post (its flash, hit-stop) as the camera jolts twice and back, the post
// kicked two columns back, his weight pushed a pixel on through it, the head
// settling a beat behind; the hand torn back out in sparks, drifting off it,
// a backflip home.
const charging = (f: number | 'cycle' = 'cycle'): FxUse[] => [fx('aura', 'cycle', 'feet', { back: true }), fx('chidori', f, 'hand')]
// the flare: the ball swollen for a frame, easing back the next
const flaring = (f: number): FxUse[] => [fx('aura', 'cycle', 'feet', { back: true }), fx('raikiriFlare', f, 'hand')]
// the blow's burst through the post (fx/lightning.ts), frame f
const burst = (f: number): FxUse => fx('raikiriBurst', f, 'hand')
// the charge's beat: frame i of ten, the three keys and their accents
// (pose, head dip, effects, the root's [dx, dy] from home: the second key
// sunk a pixel and drawn back a column)
const CHARGE: readonly (readonly [string, number, FxUse[], (readonly [number, number])?])[] = [
  // the first key: the arm thrust down at the front, the shoulders heaving
  ['charge', 0, charging()],
  ['chargeWind', 0, charging()],
  // it flares; he sinks into it, the arm drawn back in low, the ball
  // grinding the floor (grit kicked up off it)
  ['charge2', 1, [...flaring(0), fx('dust', 0, 'hand', { d: [0, 2] })], [1, 1]],
  ['charge2', 0, [...flaring(1), fx('dust', 1, 'hand', { d: [0, 2] })], [1, 1]],
  ['charge2', 0, [...charging(), fx('dust', 2, 'hand', { d: [0, 2] }), fx('sparks', 0, 'hand', { d: [1, 1] })], [1, 1]],
  ['charge2', 1, [...charging(), fx('sparks', 1, 'hand', { d: [2, 1] })], [1, 1]],
  // and up: the Raikiri lifted beside his head, flaring, the weight rising
  // off the back foot (the stretch before the run's crouch)
  ['raise', 1, [fx('aura', 'cycle', 'feet', { back: true }), fx('chidori', 0, 'hand'), fx('sparks', 0, 'hand', { d: [-2, -2] })]],
  ['raise', 0, [fx('aura', 'cycle', 'feet', { back: true }), fx('chidori', 1, 'hand'), fx('sparks', 1, 'hand', { d: [2, -3] })]],
  ['raiseWind', 0, charging()],
  ['raise', 0, charging()],
]
const raikiriCels: Cel[] = [
  // the seals, fast (the Sharingan's speed): OX, RAT, MONKEY, each
  // snapping in with the head dipped a pixel (the accent)
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2'), K('sign3', { hdy: 1 })]),
  c(1, 'signs', K('sign3'), { post: 'stand' }),
  // the Chidori: sparks in the palm, then the ball; the Sharingan opens
  c(1, 'charge', K('charge', awake({ hdy: 1 })), { post: 'stand', fx: [fx('chidoriBuild', 0, 'hand')] }),
  c(1, 'charge', K('charge', awake()), { post: 'stand', fx: [fx('chidoriBuild', 1, 'hand')] }),
  ...CHARGE.map(([pose, hdy, more, [dx, dy] = [0, 0]]) => c(1, 'charge', K(pose, awake({ x: HOME + dx, ...(dy ? { dy } : {}), ...(hdy ? { hdy } : {}) })), { post: 'stand', fx: more })),
  // the run: one smear across the arena, the lightning torn out behind him
  ...runIn('dash', {
    look: shT(),
    ready: 'charge',
    fx: (_, part) => (part === 'windup' ? [fx('auraLow', 'cycle', 'feet', { back: true }), fx('chidori', 'cycle', 'hand')] : part === 'travel' ? [fx('streak', 0, 'hand', { d: [1, 0] }), fx('chidori', 'cycle', 'hand')] : []),
    // (the launch from the last frame of the wind-up: the shout's start)
  }).map((cel, i) => (i === 2 ? { ...cel, tag: 'dash' } : cel)),
  // THE BLOW: the ball bursts through the post (its flash, hit-stop), the
  // camera jolted left twice and back, the post kicked back a column, then two
  c(2, 'impact', K('strike', shT({ x: STRIKE })), { post: 'lean', pdx: -1, flash: 'post', shake: [-1, 0], fx: [burst(0)] }),
  // pushed a pixel on through it as the camera swings back, the burst breaking
  c(1, 'impact', K('strike', shT({ x: STRIKE - 1, hdx: -1 })), { post: 'scorchLean', pdx: -2, shake: [1, 0], fx: [burst(1), fx('streak', 1, 'hand', { d: [6, 0] })] }),
  // carried into it, sunk, the head settling a beat behind the body
  c(1, 'impact', K('follow', shT({ x: STRIKE - 1, hdy: 1 })), { post: 'scorchLean', pdx: -1, fx: [burst(2), fx('streak', 2, 'hand', { d: [7, 0] })] }),
  c(1, 'impact', K('follow', shT({ x: STRIKE - 1 })), { post: 'scorchLean', pdx: -1, fx: [fx('impact', 3, 'post'), fx('chidori', 2, 'hand')] }),
  // the hand torn back out of the wood, sparks off it, drifting back off the post
  c(1, 'impact', K('punch', shT({ x: STRIKE - 1 })), { post: 'scorch', pdx: 1, fx: [fx('sparks', 0, 'hand')] }),
  c(1, 'impact', K('punch', shT({ x: STRIKE, hdy: 1 })), { post: 'scorch', fx: [fx('sparks', 1, 'hand')] }),
  c(2, 'impact', K('punchWind', shT({ x: STRIKE + 1, eyes: 'focus' })), { post: 'scorch', fx: [fx('sparks', 2, 'hand')] }),
  // the backflip home, light on his feet: spring, tucked high and quick over
  // the arena (his own arc, up 4, 7, then dropping 5, 2), the landing squash
  ...hopHome('back', STRIKE + 1, 'scarred', awake(), 2, { air: ['tuck'], lifts: [4, 7, 5, 2] }),
  // home, up out of the squash, his eye on the post; the headband comes down
  c(2, 'recover', K('idle1', awake({ eyes: 'left' })), { post: 'scarred', fx: [fx('sparks', 2, 'post', { d: [-1, 1] })] }),
  c(1, 'recover', K('idle1', { eyes: 'left' }), { post: 'scarred' }),
  ...ending('scarred'),
]
export const RAIKIRI = celMove(T, { name: 'Raikiri', shout: 'Raikiri', on: ['shell'] }, raikiriCels)

// ------------------------------------------------------------------ the ninken (4.7 s)

// The summoning seal slapped to the ground (the slam: its hand point is the
// ground between the palms), its script racing along the floor to the post;
// Bull bursts up out of the earth beside it, his jaws on its side (behind
// the post and Kakashi, so both stay whole), a small ninken springs out of
// the ground at Kakashi's side and bounds over the post and away, and Pakkun
// pops up on top of it. With the pack holding the post he gets his book
// out; the pack goes as it came, in smoke.
const BULL_AT: [number, number] = [POST_X + 8, GROUND]
const PAKKUN_AT: [number, number] = [POST_X + 1, GROUND - 11]
const bull = (sink = 0): FxUse => fx('bull', 0, BULL_AT, { back: true, ...(sink ? { sink } : {}) })
const pakkun = (): FxUse => fx('pakkun', 0, PAKKUN_AT)
// the small one's bound, frame by frame: out of the ground, over the post, off the arena
const BOUND: readonly (readonly [number, number, number])[] = [
  [21, GROUND, 4],
  [19, GROUND - 3, 0],
  [15, GROUND - 8, 0],
  [11, GROUND - 12, 0],
  [6, GROUND - 11, 0],
  [1, GROUND - 7, 0],
  [-4, GROUND - 2, 0],
]
const dog = (i: number): FxUse[] => {
  const b = BOUND[i]
  return b ? [fx('ninken', 0, [b[0], b[1]], b[2] ? { sink: b[2] } : {})] : []
}
const poofOnPost = (f: number): FxUse => fx('smoke', f, [PAKKUN_AT[0], PAKKUN_AT[1] + 1])
const slam = (o: Partial<NinjaCel> = {}): NinjaCel => K('slam', { eyes: 'focus', ...o })
// the script racing to the post, frame f (0-3 running, 4 fading behind its tip)
const line = (f: number): FxUse => fx('sealLine', f, 'hand', { back: true, d: [-1, 0] })
const ring = (f: number): FxUse => fx('sealRing', f, 'hand', { back: true })
// looking at Pakkun up on the post: the head turned to him, the eye-smile
const atPakkun = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => K(pose, { eyes: 'happy', head: 'turn', ...o })
const ninkenCels: Cel[] = [
  // the seals as the post poofs in: BOAR, DOG, then the RAM
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2'), K('sign3', { hdy: 1 })]),
  c(1, 'signs', K('sign3'), { post: 'stand' }),
  // the palm to the ground: the seal's ring opens round it
  c(1, 'slam', slam({ hdy: 1 }), { post: 'stand', fx: [ring(0), fx('dust', 0, 'hand', { d: [1, 0] })] }),
  c(1, 'slam', slam(), { post: 'stand', fx: [ring(1), fx('dust', 1, 'hand', { d: [1, 0] })] }),
  c(1, 'slam', K('slamWind', { eyes: 'focus' }), { post: 'stand', fx: [ring(2)] }),
  // the script races along the floor to the post, and his head goes after
  // it: the eye down the line, the head turning, leaning out over the arm
  c(1, 'track', slam({ eyes: 'left' }), { post: 'stand', fx: [ring(2), line(0)] }),
  c(1, 'track', slam({ eyes: 'left', hdx: -1 }), { post: 'stand', fx: [ring(3), line(1)] }),
  c(1, 'track', K('slamWind', { eyes: 'left', head: 'turn', hdx: -1 }), { post: 'stand', fx: [ring(3), line(2)] }),
  c(1, 'track', K('slamWind', { eyes: 'focus', head: 'turn', hdx: -2 }), { post: 'stand', fx: [ring(3), line(3)] }),
  c(1, 'track', slam({ head: 'turn', hdx: -2, hdy: 1 }), { post: 'stand', fx: [ring(3), line(3)] }),
  // the pack bursts out as he drives the palms down: Bull up through the
  // earth onto the post (it rocks)
  c(2, 'impact', K('slamPush', { x: HOME - 3, eyes: 'focus', head: 'turn' }), { post: 'lean', flash: 'post', fx: [line(4), bull(7), fx('earth', 0, BULL_AT)], shake: [0, 1] }),
  c(1, 'impact', K('slamPush', { x: HOME - 2, eyes: 'focus', head: 'turn' }), { post: 'lean', pdx: -1, fx: [bull(4), fx('earth', 1, BULL_AT), ...dog(0)] }),
  c(1, 'impact', K('slamPush', { x: HOME - 2, eyes: 'focus', head: 'turn', hdy: -1 }), { post: 'stand', fx: [bull(2), fx('earth', 2, BULL_AT), ...dog(1)] }),
  c(1, 'impact', K('crouch', { x: HOME - 1, eyes: 'focus', head: 'turn' }), { post: 'stand', fx: [bull(), fx('earth', 2, BULL_AT, { sink: 2 }), ...dog(2)] }),
  // up, pointing them on as the small one bounds over the post
  c(2, 'impact', K('punch', { x: HOME - 1, eyes: 'focus', head: 'turn' }), { post: 'stand', fx: [bull(), ...dog(3)] }),
  c(1, 'impact', K('punchWind', { x: HOME - 1, eyes: 'focus', head: 'turn' }), { post: 'stand', fx: [bull(), ...dog(4), poofOnPost(0)] }),
  // Pakkun pops up on top of the post: the head turns up to him, "Yo"
  c(1, 'impact', atPakkun('wave', { hdy: 1 }), { post: 'stand', fx: [bull(), ...dog(5), poofOnPost(1)] }),
  c(1, 'impact', atPakkun('wave'), { post: 'stand', fx: [bull(), pakkun(), ...dog(6), poofOnPost(2)] }),
  c(2, 'impact', atPakkun('wave'), { post: 'stand', fx: [bull(), pakkun(), poofOnPost(3)] }),
  c(2, 'impact', atPakkun('wave', { hdy: 1 }), { post: 'stand', fx: [bull(), pakkun(), poofOnPost(4)] }),
  // a step back and, the pack holding the post, out comes the book: he
  // reads (a page turned), the job as good as done
  // (a moving hold: his reading pose breathes into its page-turn, think2)
  c(1, 'impact', K('think', { x: HOME + 1, hdy: 1 }), { post: 'stand', fx: [bull(), pakkun()] }),
  ...hold(5, 'impact', K('think', { x: HOME + 1 }), { post: 'stand', fx: [bull(), pakkun()] }),
  // and it goes as it came, still reading: Bull sinks back into the
  // earth, Pakkun in a puff; the book put away with the eye-smile
  c(1, 'vanish', K('think', { x: HOME + 1 }), { post: 'stand', fx: [bull(3), pakkun(), poofOnPost(1)] }),
  c(1, 'vanish', K('think', { x: HOME + 1, hdy: 1 }), { post: 'stand', fx: [bull(5), fx('smoke', 1, BULL_AT), poofOnPost(2)] }),
  c(1, 'vanish', K('idle1', { eyes: 'happy' }), { post: 'stand', fx: [bull(8), fx('smoke', 2, BULL_AT), poofOnPost(3)] }),
  c(1, 'vanish', K('idle1', { eyes: 'happy', hdy: 1 }), { post: 'stand', fx: [fx('smoke', 3, BULL_AT), poofOnPost(4)] }),
  c(1, 'vanish', K('idle1', { eyes: 'happy' }), { post: 'stand', fx: [fx('smoke', 3, BULL_AT, { sink: 6 })] }),
  c(1, 'recover', K('idle1', { eyes: 'open' }), { post: 'stand', fx: [fx('smoke', 4, BULL_AT)] }),
  ...ending('stand', [fx('smoke', 4, BULL_AT, { sink: 4 })]),
]
// (no Sharingan needed to call the pack)
export const NINKEN = celMove(T, { name: 'Summoning Jutsu: Ninken', shout: 'Summon: Ninken', dojutsu: false, on: ['agent'] }, ninkenCels)

// ------------------------------------------------------------------ Kamui (4.1 s)

// The Mangekyo turned on the post at a distance: his hand up to the
// headband and shoving it up off the red eye as the post poofs in; the air
// round the post ripples; he leans in a step, palm aimed, as a warp opens on
// it and spins faster and faster, GROWING as it wrings the wood into its eye
// (13 px across, then 15, then 17: fx/lightning.ts's kamuiWarp). Three key
// poses through the spin, each its own drawing at its own place: leant in on
// the aim (the head trembling a pixel now and then, never the whole figure);
// then the pull at its worst, the shout as it takes the post: the free hand
// clamped to his eye, twisted back off the aim two columns and sinking, the
// elbow jutting up behind his head; then the last wrench drags him a
// stumbling step forward as the spin swallows it. It snaps shut on the post
// and the release throws him back on his heels (the camera jolted twice and
// back; light on his feet, a skip back off it); he straightens, and the same
// hand pulls the headband back down.
const EYE: [number, number] = [POST_X + 1, GROUND - 6]
// the first pinprick and the small swirl opening (the shared vortex), then his own warp
const opening = (f: number): FxUse => fx('vortex', f, [EYE[0], EYE[1] + 1])
const warp = (f: number): FxUse => fx('kamuiWarp', f, EYE)
const ripple = (f: number): FxUse => fx('impact', f, [EYE[0], EYE[1] + 1], { pal: 'warp' })
// the aim through the spin, a frame each: pose, root [dx, dy] from home, the
// head's tremble (hdx, hdy), the warp's frame, the post's
type Aim = readonly [string, number, number, number, number, number, 'stand' | 'twist1' | 'twist2' | 'twist3' | null]
const AIM: readonly Aim[] = [
  // leant in on the aim; the warp 13 across, an eighth of a turn a frame
  ['strike', -1, 0, 0, 0, 0, 'stand'],
  ['strikeWind', -1, 0, 0, 1, 1, 'stand'],
  ['strike', -1, 0, -1, 0, 2, 'twist1'],
  ['strike', -1, 0, 0, 0, 3, 'twist1'],
  // the pull bites (the shout): the hand clamped to the eye, twisted back
  // against it and sinking; the warp 15 across, the post wrung thin
  ['strain', 1, 0, 0, 1, 4, 'twist1'],
  ['strain', 1, 0, 0, 0, 5, 'twist2'],
  ['strain', 1, 0, -1, 0, 6, 'twist2'],
  ['strain', 1, 1, 0, 0, 7, 'twist2'],
  ['strain', 1, 1, 0, 1, 4, 'twist2'],
  ['strain', 1, 1, -1, 1, 5, 'twist3'],
  ['strain', 1, 1, 0, 0, 6, 'twist3'],
  // the last wrench: dragged a stumbling step forward (a frame's
  // overshoot); the warp 17 across, spinning a quarter-turn a frame, the
  // post swallowed
  ['follow', -3, 0, 0, 0, 8, 'twist3'],
  ['follow', -2, 0, 0, 1, 10, 'twist3'],
  ['follow', -2, 0, 0, 0, 8, null],
  ['follow', -2, 0, -1, 0, 10, null],
]
const kamuiCels: Cel[] = [
  // the post poofs in as his hand goes up to the headband, and shoves it up
  ...postIn('focus', [K('reveal', { hdy: 1 }), K('reveal'), K('revealUp', awake({ hdy: 1 })), K('revealUp', awake())]),
  // the red eye on the post: the air round it ripples, drawing in; the palm comes up
  c(1, 'focus', K('revealUp', awake()), { post: 'stand', fx: [ripple(3)] }),
  c(1, 'focus', K('punch', awake({ hdy: 1 })), { post: 'stand', fx: [ripple(2)] }),
  c(1, 'focus', K('punch', awake()), { post: 'stand', fx: [ripple(3)] }),
  // the palm aimed, leant in a step: a pinprick, a swirl
  c(1, 'warp', K('strike', shT({ x: HOME - 1, hdy: 1 })), { post: 'stand', fx: [opening(0)] }),
  c(1, 'warp', K('strike', shT({ x: HOME - 1 })), { post: 'stand', fx: [opening(1)] }),
  // the warp spinning on the post, growing, wringing it in; the shout as it takes the post
  ...AIM.map(([pose, dx, dy, hdx, hdy, f, post], i) =>
    c(1, i < 4 ? 'warp' : 'pull', K(pose, shT({ x: HOME + dx, ...(dy ? { dy } : {}), ...(hdx ? { hdx } : {}), ...(hdy ? { hdy } : {}) })), { ...(post ? { post } : {}), fx: [warp(f)], ...(i === 4 ? { shout: true as const } : {}) }),
  ),
  // it shuts on it: tight, then the last spark
  c(1, 'impact', K('follow', shT({ x: HOME - 2 })), { fx: [warp(12)] }),
  c(1, 'impact', K('follow', shT({ x: HOME - 2, hdy: 1 })), { fx: [warp(13)] }),
  // the violet snap, and the release throws him back on his heels: the
  // camera jolted back twice and forward, a light skip back off it
  c(2, 'impact', K('crouch', awake({ x: HOME + 1, eyes: 'focus' })), { fx: [ripple(0)], shake: [1, 0] }),
  c(1, 'impact', K('idle1', awake({ x: HOME + 2, lift: 2, eyes: 'focus' })), { fx: [ripple(1)], shake: [-1, 0] }),
  c(1, 'impact', K('crouch', awake({ x: HOME + 1, eyes: 'focus', hdy: 1 })), { fx: [ripple(2), dustAt(0, HOME + 1)] }),
  c(1, 'impact', K('idle1', awake({ eyes: 'left' })), { fx: [ripple(3), dustAt(1, HOME + 1)] }),
  // nothing left on the arena but a last spark; the headband pulled back down
  c(2, 'recover', K('revealUp', awake({ eyes: 'left' })), { fx: [fx('sparks', 2, EYE, { pal: 'warp' })] }),
  c(1, 'recover', K('revealUp', awake({ hdy: 1, eyes: 'left' })), { fx: [fx('sparks', 1, EYE, { pal: 'warp' })] }),
  c(2, 'recover', K('reveal', { eyes: 'happy' })),
  c(1, 'recover', K('idle1', { eyes: 'happy' })),
  c(1, 'recover', K('idle1', { eyes: 'happy', hdy: 1 })),
  c(2, 'recover', K('idle0', { eyes: 'happy' })),
]
export const KAMUI = celMove(T, { name: 'Kamui', shout: 'Kamui' }, kamuiCels)

// ------------------------------------------------------------------ the quick strike (1.9 s)

// For an edit, the Leaf's most secret taijutsu: A Thousand Years of Death,
// every beat its own clear picture:
//   1. the one-handed seal as the post poofs in, and he is gone in a puff,
//      back in another crouched low at the post's back, close in at it
//   2. the TIGER held out at it, both index fingers up: a beat, the eye
//      narrowing
//   3. THE POKE, up out of the crouch, fingers first (hit-stop two frames,
//      the post jolted up off its foot, a gold star)
//   4. the post shoots STRAIGHT UP off the top of the stage (the camera
//      jolted a pixel) as he drops back out from under it; a twinkle in the
//      sky; it falls straight back down onto its spot and thuds home, rocking
//   5. he flickers home: gone in a puff, back at home in another
// His head stays to the right of the post's column all through (the tiger
// and the duck seat it 5 px and more clear of it): the post never crosses it.
const TIGER_X = STRIKE + 2
const JAB_X = STRIKE
// where he drops to as the post goes up, out from under it
const DUCK_X = STRIKE + 3
const puffAt = (f: number, x: number = HOME, back = false): FxUse => fx('smoke', f, [x, GROUND], back ? { back } : {})
// the post's flight: pdy a frame, up and gone (24 up: wholly off the top), then straight back down
const UP = [-10, -24] as const
const DOWN = [-15, -6] as const
const glint = (f: number): FxUse => fx('twinkle', f, [POST_X + 1, 2])
const star = (f: number): FxUse => fx('impact', f, [POST_X + 3, GROUND - 4], { pal: 'hit' })
const quickCels: Cel[] = [
  ...postIn('ready', [K('sign2', { hdy: 1 }), K('sign2')]),
  // 1. gone: a puff where he stood
  c(1, 'poof', undefined, { post: 'stand', fx: [puffAt(1)] }),
  // and back in a puff at the post, crouched low; 2. the Tiger held out at
  // it, a beat, the eye narrowing
  c(1, 'ready', K('tiger', { x: TIGER_X, eyes: 'focus', head: 'turn' }), { post: 'stand', fx: [puffAt(2, HOME + 2, true), puffAt(1, TIGER_X + 2, true)] }),
  c(1, 'ready', K('tiger', { x: TIGER_X, eyes: 'focus', head: 'turn', hdy: 1 }), { post: 'stand', fx: [puffAt(3, HOME + 2, true), puffAt(3, TIGER_X + 2, true)] }),
  c(1, 'ready', K('tiger', { x: TIGER_X, eyes: 'half', head: 'turn' }), { post: 'stand', fx: [puffAt(4, TIGER_X + 2, true)] }),
  // 3. THE POKE: up out of the crouch, the fingers in; the post jolted up off
  // its foot, a gold star (hit-stop, two frames)
  c(2, 'impact', K('jab', { x: JAB_X, eyes: 'focus', head: 'turn' }), { post: 'lean', pdy: -2, shout: true, fx: [star(0)] }),
  // 4. straight up it shoots and off the top, grit kicked up off the floor;
  // he drops back out from under it, watching it go
  c(1, 'impact', K('crouch', { x: DUCK_X, eyes: 'wide' }), { post: 'stand', pdy: UP[0], shake: [0, -1], fx: [fx('dust', 0, [POST_X + 1, GROUND]), star(1)] }),
  c(1, 'impact', K('crouch', { x: DUCK_X, eyes: 'happy', hdy: 1 }), { post: 'stand', pdy: UP[1], fx: [fx('dust', 1, [POST_X + 1, GROUND]), star(2), glint(0)] }),
  // a twinkle in the sky where it went; he straightens, the eye-smile
  c(1, 'impact', K('punch', { x: DUCK_X, eyes: 'happy' }), { fx: [glint(1)] }),
  // straight back down it comes onto its spot, and thuds home on its foot, rocking
  ...DOWN.map((pdy, i) => c(1, 'fall', K('alert', { x: DUCK_X, eyes: i ? 'wide' : 'happy', ...(i ? {} : { hdy: 1 }) }), { post: 'stand', pdy, fx: i ? [] : [glint(2)] })),
  c(1, 'fall', K('crouch', { x: DUCK_X, eyes: 'shut' }), { post: 'lean', shake: [0, 1], fx: [fx('dust', 0, [POST_X + 1, GROUND]), fx('dust', 0, [POST_X + 4, GROUND])] }),
  // 5. home in a flicker: gone in a puff, back at home in another
  c(1, 'home', undefined, { post: 'stand', pdy: -1, fx: [puffAt(1, DUCK_X), fx('dust', 1, [POST_X + 1, GROUND])] }),
  c(1, 'home', K('crouch', { eyes: 'happy' }), { post: 'stand', fx: [puffAt(1, HOME, true), puffAt(2, DUCK_X)] }),
  c(1, 'recover', K('idle1', { eyes: 'happy', hdy: 1 }), { post: 'stand', fx: [puffAt(2, HOME), puffAt(4, DUCK_X)] }),
  ...postOut('recover', [K('idle0', { eyes: 'happy' }), K('idle0', { eyes: 'happy' })], 'stand', i => [puffAt(3 + i, HOME)]),
]
export const QUICK = celMove(T, { name: 'A Thousand Years of Death', shout: 'Thousand Years of Death', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.5 s)

// The end of a turn: a quick happy hop, the landing, then the sheepish
// head-scratch with the eye-smile, rubbing it twice (cheer2 is the hand a
// pixel lower), the head tipped into it on the last rub; and he lets the
// hand drop. (The scratch is the companion's 'scratch': its soft cue a
// minute later holds it.)
const cheerCels: Cel[] = [
  ...leap('hop', { eyes: 'happy' }, { lift: 4, hang: 1, squash: 1 }),
  c(1, 'cheer', K('cheer', { hdy: 1 }), { fx: [dustAt(2, HOME)] }),
  c(1, 'cheer', K('cheer')),
  c(2, 'cheer', K('cheer2')),
  c(1, 'cheer', K('cheer')),
  c(2, 'cheer', K('cheer2', { hdx: 1, hdy: 1 })),
  c(1, 'cheer', K('idle1', { eyes: 'happy', hdy: 1 })),
  c(2, 'cheer', K('idle0', { eyes: 'happy' })),
]
export const CHEER = celMove(T, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)

