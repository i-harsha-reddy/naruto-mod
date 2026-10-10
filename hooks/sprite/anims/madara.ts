// Madara's moves as cels, hand-keyed at 10 fps: pose to pose, snaps not
// tweens, and never a dead drawing (anims/kit.ts says how to write a move:
// hold(), runIn(), hopHome() and leap() are the shared motion). Read each as
// a film strip: one line a held drawing. He stands at his own home (two
// columns nearer the arena, so the gunbai on his back fits the stage); in
// the action poses (the swing, the cut, the blow) his head turns
// three-quarters to the post.

import { celMove } from '../cels.ts'
import { wear } from '../dress.ts'
import { GROUND, POST_X } from '../stage.ts'
import { HAORI, wind } from '../templates/haori.ts'
import type { Cel, FxUse, NinjaCel, PoseGrid, PoseRef } from '../types.ts'
import { K as KH, awake, c, calls, cast, dustAt, fx, hold, postIn, postOut } from './kit.ts'

// his column at rest (ninja/madara.ts's home)
export const MADARA_HOME = 33
const HOME = MADARA_HOME
const K = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => KH(pose, { x: HOME, ...o })
// the head turned to the post; awake() is his Rinnegan (the Sharingan never sleeps)
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', ...o })

// His own poses (ninja/madara.ts lists them, and the props that show only in
// them): the gunbai in hand for Uchiha Return and the cheer, the Susanoo's
// sword over him. Each is another pose's drawing under its own name, so the
// companion still sees the pose it stands for.
// BREATHE: a fire breath, braced against its push: the feet planted in a
// long split (the front foot forward, the back leg driven out straight
// behind), the body leaned in at the arena, the near fist braced out low
// under the flame, the far hand flung back, both flaps streaming behind; the
// head thrust forward over the front foot
const BREATHE: PoseGrid = {
  as: 'charge',
  head: [-2, 1],
  hand: [3, 9],
  eyes: 'focus',
  points: { back: [17, 9] },
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........oooooooooooo....',
    '........oonvvvwwwnnmwxxoo.',
    '.......onnmvvwwwwnmlwwxoko',
    '.....oonnmovwwwwwwwwwxolko',
    '..oSKnmmoobbbbbbbbbbjoooo.',
    '..oKKmoopqqqqqqqrovvwwxxxo',
    '...oo.oppqqo..oqrrowwwxxo.',
    '.....ouuutto...oouuttooo..',
  ],
}

export const MADARA_POSES: Readonly<Record<string, string | PoseRef | PoseGrid>> = {
  // Great Fire Annihilation: braced in a long split, leaning into the fire
  // (the mane blown back, ninja/madara.ts), and the flaps streaming harder
  breathe: BREATHE,
  breatheWind: wind(BREATHE, { at: [20, 9], rows: ['.oxxo', 'xxxxo', 'xxxo.'] }),
  // the gunbai drawn off his back, held up by the handle
  fanUp: 'cheer2',
  // swept round flat at the post
  fanSwing: 'strike',
  fanFollow: 'follow',
  // arms folded, the gunbai rested on his shoulder (the cheer), stirring
  fanRest: 'crossed',
  fanRestWind: 'crossedWind',
  // the gunbai lifted off his shoulder and tapped down on it (the cheer's accent)
  fanTap: 'crossed',
  // the Susanoo: sunk into his stance under the giant, knees wide, arms out
  // (the crouch), his head drawn down into his shoulders two pixels, so the
  // giant's whole upper face (its crown, its brow and angry sockets, the
  // nasal notch) looms clear over his hair; the gunbai put away
  susCrouch: { base: 'crouch', head: [0, 5] },
  // the giant's sword (ninja/madara.ts): drawn up over the arena while he
  // holds the stance; drawn back as he sinks back on his heels (the wind-up);
  // swung and driven down through the post as he thrusts his hand at it (his
  // head kept as low under the skull)
  swordUp: { base: 'crouch', head: [0, 5] },
  swordBack: { base: 'windup', head: [1, 5] },
  swordSwing: { base: 'charge', head: [-1, 4] },
  swordDown: { base: 'charge', head: [-1, 4] },
  // drawn up out of the thrust back into the stance, the sword left standing in the post
  swordHold: { base: 'crouch', head: [0, 5] },
}
const T = wear(HAORI, MADARA_POSES)

// Every move ends on idle1 (the head dipped) for a frame, then idle0 for two
// as the post poofs away (`frame`: the post as the move left it).
const ending = (frame: 'stand' | 'scorch' = 'stand', more: readonly FxUse[] = []): Cel[] => [
  c(1, 'recover', K('idle1', { hdy: 1 }), { post: frame, fx: [...more] }),
  ...postOut('recover', [K('idle0'), K('idle0')], frame),
]

// ------------------------------------------------------------------ Great Fire Annihilation (4.7 s)

// The seals as the post poofs in; the breath drawn in (rocked back on his
// heels, the head back, a spark at the lips); snapped forward into a braced
// split, leaning in, the mane blown back: a ball of fire rolls out of his
// lips across the arena, stands up over the post and becomes a wall of flame
// the stage's height (fx/firewall.ts), the stage jolting, the biggest fire
// there is. It burns on behind him as he pours more into it: braced, then
// hunched lower over it a column nearer, pushing it on, then a surge kicks
// him back a column, the head jolted; braced again; it dies down over
// three frames to licks on the ground and the post burning, charred and
// smoking; arms folded on a smug look.
const MOUTH: [number, number] = [8, 16]
// where he breathes it from (braced, a column nearer the arena) and the lips
// there: the wall and the field stand on the stage, the jet rides the head
const BRACED = HOME - 1
const LIPS: [number, number] = [28, 17]
const jet = (f: FxUse['f'] = 'cycle'): FxUse => fx('fireJet', f, 'head', { d: MOUTH })
const wall = (f: number): FxUse => fx('fireWall', f, LIPS, { back: true })
const field = (f: FxUse['f'] = 'cycle', phase = 0): FxUse => fx('fireField', f, LIPS, { back: true, phase })
const dying = (f: number): FxUse => fx('fireDie', f, LIPS, { back: true })
const burning = (f: FxUse['f'] = 'cycle'): FxUse => fx('burnPost', f, [POST_X, GROUND])
const charred = (f: number): FxUse => fx('scorch', f, [POST_X, GROUND])
const embers = (phase = 0): FxUse => fx('embers', 'cycle', [POST_X + 1, GROUND - 9], { phase })
// the smoke off the dying fire, sooty (the poof's cloud in the earth's browns)
const smoke = (f: number, x: number): FxUse => fx('smoke', f, [x, GROUND - 9], { pal: 'earth' })
// braced in the split, the head turned to the arena
const braced = (o: Partial<NinjaCel> = {}): NinjaCel => K('breathe', turn({ eyes: 'focus', x: BRACED, ...o }))
// the pour, in three held drawings and a surge: braced, pouring it on;
// hunched lower over it a column nearer, pushing it on (the charge, his head
// down behind the jet); a surge kicking him back a column, the head jolted
// (the stage with it, one frame); braced again
const pouring = (): FxUse[] => [field(), burning(), jet()]
const fireCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign1'), K('sign3', { hdy: 1 }), K('sign3')]),
  c(1, 'signs', K('sign3'), { post: 'stand' }),
  c(1, 'signs', K('sign2', { hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign2'), { post: 'stand' }),
  // the breath drawn in: rocked back on his heels a column, chest up, the
  // head back; a spark at the lips
  c(1, 'inhale', K('thinkIn', { eyes: 'shut', x: HOME + 1, hdx: 1 }), { post: 'stand' }),
  c(1, 'inhale', K('thinkIn', { eyes: 'shut', x: HOME + 1, hdx: 1 }), { post: 'stand' }),
  c(1, 'inhale', K('thinkIn', { eyes: 'shut', x: HOME + 1, hdx: 1 }), { post: 'stand', fx: [fx('greatFireballForm', 0, 'head', { d: [MOUTH[0] + 1, MOUTH[1]] })] }),
  c(1, 'inhale', K('thinkIn', { eyes: 'shut', x: HOME + 1, hdx: 2 }), { post: 'stand', fx: [fx('greatFireballForm', 1, 'head', { d: [MOUTH[0] + 1, MOUTH[1]] })] }),
  // stepped into the breath: snapped forward into the split (no overshoot:
  // he is stoic, only the head thrust on), the fire rolling out over the arena
  c(1, 'release', braced({ hdx: -2 }), { post: 'stand', fx: [wall(0), jet(0)] }),
  c(1, 'release', braced(), { post: 'stand', fx: [wall(1), jet(1)] }),
  c(1, 'release', braced({ hdx: 1 }), { post: 'stand', fx: [wall(2), jet(2), burning(0)] }),
  // the wall: the stage's height, past the post, the post lit by it; the
  // stage jolts with it (two frames), its heat throwing him back a column
  c(2, 'impact', braced({ hdx: 1, hdy: -1 }), { post: 'stand', fx: [wall(3), fx('heatFlash', 0, [POST_X, GROUND]), jet(0)], shake: [-2, 1] }),
  c(1, 'impact', braced({ x: BRACED + 1 }), { post: 'stand', fx: [wall(3), burning(1), jet(1)] }),
  // it burns on behind him as he pours more into it: braced; then a step in
  // and a palm thrust at it, shoving the wall on (his own key: the arm out
  // straight through the fire's glare); a surge kicks him back a column, the
  // head jolted; hunched over it, pushing the last of it on
  ...hold(2, 'impact', braced(), { post: 'stand', fx: pouring() }),
  c(1, 'impact', K('strike', turn({ eyes: 'focus', x: BRACED - 1, hdy: 1 })), { post: 'stand', fx: pouring(), shake: [-1, 0] }),
  ...hold(4, 'impact', K('strike', turn({ eyes: 'focus', x: BRACED - 1 })), { post: 'stand', fx: pouring(), phase: 1 }),
  c(1, 'impact', K('windup', turn({ eyes: 'focus', x: BRACED + 1, hdx: 1 })), { post: 'stand', fx: pouring(), shake: [1, 0] }),
  ...hold(5, 'impact', K('charge', turn({ eyes: 'focus', x: BRACED })), { post: 'stand', fx: pouring(), phase: 2 }),
  // it dies down: half, a third, licks on the ground, the post still
  // burning on its own, the smoke rising off it all; he straightens out of
  // the split and folds his arms
  c(1, 'fade', braced({ hdy: 1 }), { post: 'stand', fx: [dying(0), burning(), fx('fireStream', 2, 'head', { d: [MOUTH[0] - 2, MOUTH[1]] })] }),
  c(1, 'fade', K('gather', turn({ eyes: 'half', x: BRACED })), { post: 'scorch', fx: [dying(1), burning(), smoke(1, 8)] }),
  c(1, 'fade', K('gather', turn({ eyes: 'smug', x: BRACED, hdy: 1 })), { post: 'scorch', fx: [dying(2), burning(), smoke(2, 6), smoke(1, 16)] }),
  c(1, 'fade', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'scorch', fx: [burning(0), embers(), smoke(3, 5), smoke(2, 15)] }),
  c(1, 'fade', K('crossed', { eyes: 'smug' }), { post: 'scorch', fx: [burning(1), charred(0), embers(), smoke(4, 6), smoke(3, 15)] }),
  // charred and smoking: the smug look, a glance at it
  c(1, 'recover', K('crossed', { eyes: 'left', held: 4 }), { post: 'scorch', fx: [dying(3), charred(0), embers(), smoke(4, 15)] }),
  ...hold(2, 'recover', K('crossed', { eyes: 'left' }), { post: 'scorch', fx: [charred(0), embers()], phase: 5 }),
  ...hold(2, 'recover', K('crossed', { eyes: 'smug' }), { post: 'scorch', fx: [charred(1), embers(2)], phase: 7 }),
  c(1, 'recover', K('crossed', { eyes: 'smug' }), { post: 'scorch', fx: [charred(2), embers(1)] }),
  ...ending('scorch', [charred(2)]),
]
export const FIRE_ANNIHILATION = celMove(T, { name: 'Fire Style: Great Fire Annihilation', shout: 'Fire Annihilation', on: ['shell'] }, fireCels)

// ------------------------------------------------------------------ Susanoo (4.6 s)

// Arms folded as the post poofs in, the chakra coming up round him; dropped
// into a wide stance, arms flung out and down, as the Susanoo's ribs grow up
// round him out of the ground in blue chakra (fx/summons/susanoo.ts: the
// bottom rib and the sternum, then up his sides, then the far halves over
// his shoulders) and its skull rises behind him till its brow and sockets
// loom over his crown; he holds the stance under it (the skull only clears
// his hair while he is sunk in it). The giant draws its sword up over the
// arena; he sinks back on his heels (the sword drawn back), then thrusts his
// hand at the post, a step in: the sword swung flat and driven down through
// the post (the post white, the stage jolting), the blow throwing him back a
// column; the giant sinks back into the ground the way it came as he
// straightens and folds his arms.
const SUS: [number, number] = [HOME, GROUND]
// the giant: the near ribs in front of him (frame 0-2: growing), the far
// halves and the skull behind (2: the ribs, 3: whole, 4 and 5: the skull
// rising to it)
const giant = (ribs = 2, cage = 3, sink = 0): FxUse[] => [fx('susanooCage', cage, SUS, { back: true, ...(sink ? { sink } : {}) }), fx('susanooRibs', ribs, SUS, sink ? { sink } : {})]
const glow = (): FxUse => fx('aura', 'cycle', 'feet', { back: true, pal: 'susanooBlue' })
const blue = (name: string, f: number): FxUse => fx(name, f, 'post', { pal: 'susanooBlue' })
// sunk in his stance, the giant over him
const low = (o: Partial<NinjaCel> = {}): NinjaCel => K('susCrouch', { eyes: 'focus', ...o })
// a run of cels with its first two blows the same drawing held as one (the hit-stop)
const held2 = (cels: Cel[]): Cel[] => {
  const i = cels.findIndex(x => x.tag === 'impact')
  if (i < 0 || JSON.stringify(cels[i]) !== JSON.stringify(cels[i + 1])) return cels
  return [...cels.slice(0, i), { ...cels[i]!, n: cels[i]!.n + cels[i + 1]!.n }, ...cels.slice(i + 2)]
}
const susCels: Cel[] = [
  ...postIn('ready', [K('crossed', { hdy: 1 }), K('crossed', { eyes: 'smug' }), K('crossed', { eyes: 'smug' }), K('crossed', { eyes: 'left' }), K('crossed', { eyes: 'focus' })]),
  // the chakra coming up round him, his head bowed to it
  c(2, 'ready', K('crossed', { eyes: 'shut', hdy: 1 }), { post: 'stand', fx: [glow()] }),
  // dropped into the stance, drawn back a column: the ribs grow up round him
  // out of the ground (a two-frame jolt as they break it)
  c(1, 'ribs', low({ eyes: 'wide', x: HOME + 1 }), { post: 'stand', fx: [glow(), ...giant(0, 0), dustAt(0, HOME - 11), dustAt(0, HOME + 11)], shake: [0, 1] }),
  c(1, 'ribs', low({ x: HOME + 1 }), { post: 'stand', fx: [glow(), ...giant(1, 0), dustAt(1, HOME - 11), dustAt(1, HOME + 11)], shake: [1, 0] }),
  c(1, 'ribs', low({ x: HOME + 1 }), { post: 'stand', fx: [glow(), ...giant(2, 2), dustAt(2, HOME - 11)] }),
  // the skull rising behind him to loom over his crown; he settles home in the stance
  c(1, 'ribs', low({ hdx: -1 }), { post: 'stand', fx: giant(2, 4) }),
  c(1, 'ribs', low(), { post: 'stand', fx: giant(2, 5) }),
  c(1, 'ribs', low({ eyes: 'smug' }), { post: 'stand', fx: giant(2, 3) }),
  c(2, 'ribs', low({ eyes: 'smug', hdx: 1 }), { post: 'stand', fx: giant(2, 3) }),
  // the sword: drawn up over the arena (he holds the stance, eyes on the
  // post), drawn back as his weight goes onto his back foot; swung flat as he
  // thrusts his hand at the post (a small step in: he is stoic, no
  // overshoot), driven down through it (the post white, the stage jolting,
  // his head nodding with the blow, no recoil); then, the sword left standing
  // in the wood, he draws himself up out of the thrust back into the stance
  ...held2(cast({
    at: HOME,
    weight: 'stoic',
    k: { eyes: 'focus' },
    gather: {
      n: 6,
      pose: ['swordUp', 'swordUp', 'swordUp', 'swordBack', 'swordBack', 'swordBack'],
      k: i => (i < 3 ? { x: HOME, eyes: 'left', ...(i === 1 ? { hdx: -1 } : {}) } : i === 3 ? { hdx: 1 } : {}),
      fx: () => giant(),
    },
    release: { n: 2, pose: ['swordSwing', 'swordDown'], k: { head: 'turn', dy: 1 }, fx: () => giant() },
    impact: {
      n: 6,
      pose: ['swordDown', 'swordDown', 'swordDown', 'swordDown', 'swordHold', 'swordHold'],
      k: i => (i < 4 ? { head: 'turn', dy: 1 } : { eyes: 'smug', ...(i === 4 ? { hdx: 1 } : {}) }),
      // (frames 0 and 1 the same: the hit-stop, the post white; the stage
      // knocked a pixel toward the arena and back)
      o: i => ({ post: i < 4 ? 'lean' : 'stand', ...(i < 2 ? { flash: 'post' as const, shake: [-1, 0] as [number, number] } : i === 2 ? { shake: [1, 0] as [number, number] } : {}), ...(i === 3 ? { pdx: -2 } : i === 4 ? { pdx: -1 } : i === 5 ? { pdx: 1 } : {}) }),
      fx: i => [...giant(), ...(i < 4 ? [blue('impact', Math.max(0, i - 1))] : []), ...(i >= 2 ? [blue('shockRing', Math.min(4, i - 1))] : [])],
    },
    settle: { n: 3, pose: 'swordHold', k: i => ({ eyes: i === 2 ? 'left' : 'smug' }), fx: () => giant() },
  })),
  // the giant sinks back into the ground the way it came, the skull's
  // sockets going down behind his hair while he still holds the stance;
  // then he straightens out of it and folds his arms as the ribs go under
  ...[3, 6, 9, 12, 15, 18, 22].map((sink, i) =>
    c(1, 'fade', i < 4 ? low({ eyes: 'smug', ...(i === 2 ? { hdx: -1 } : {}) }) : i === 4 ? K('gather', { eyes: 'smug', x: HOME + 1 }) : K('crossed', { eyes: i === 6 ? 'left' : 'smug', ...(i === 5 ? { hdy: 1 } : {}) }), {
      post: 'stand',
      fx: [...giant(2, 3, sink), ...(i >= 4 ? [dustAt(i - 4, HOME - 11)] : [])],
    }),
  ),
  ...hold(3, 'recover', K('crossed', { eyes: 'smug' }), { post: 'stand', fx: [fx('wisp', 2, 'head', { d: [10, 17] })], phase: 6 }),
  ...ending(),
]
export const SUSANOO = celMove(T, { name: 'Susanoo', shout: 'Susanoo' }, susCels)

// ------------------------------------------------------------------ Tengai Shinsei (4.4 s)

// The seals; the Rinnegan; a hand raised to the sky, calling it down (his
// key); out of the top-left, bigger than he is, a burning meteor (its
// leading edge on fire, smoke behind it) comes down on the post faster and
// faster (each frame's fall longer than the last); he points it home and
// braces as it lands, half buried; the ground breaks, rubble flies. It sits
// on the post cracking, a crack a frame (fx/summons/meteor.ts), never still;
// arms folded, a look up: a second one ("Second meteor!"), bigger still, too
// big for the stage, faster again; it lands on the first, braced again; a
// hand to his chin, appraising, as the rock sinks into the crater three
// pixels a frame and crumbles under the dust; the Rinnegan closes.
// the first meteor's foot (the bottom of the rock), frame by frame out of
// the top-left down onto the post, a longer fall each frame
const FALL: readonly [number, number][] = [
  [-8, -5],
  [-5, 0],
  [-1, 6],
  [4, 14],
]
// the second, bigger, the same way down, faster
const FALL2: readonly [number, number][] = [
  [-17, -10],
  [-14, -7],
  [-10, -1],
  [-3, 9],
]
const GROUNDED: [number, number] = [POST_X + 1, GROUND]
const BIG_AT: [number, number] = [POST_X - 2, GROUND]
// (in front as it falls, over the post; landed, behind him)
const meteor = ([x, y]: readonly [number, number], big = false, sink = 0, f = 0): FxUse => fx(big ? 'meteorBig' : 'meteorRoll', f, [x, y], sink ? { sink, back: true } : {})
// the first rock as it sits, crack frame f (0-3), half buried
const crack = (f: number, sink = 7): FxUse => fx('meteorCrack', f, GROUNDED, { sink, back: true })
// smoke left behind it, up and left of where it is
const trail = (p: readonly [number, number], big = false): FxUse => fx('sigh', 1, [p[0] - (big ? 20 : 14), p[1] - (big ? 26 : 20)], { pal: 'smoke' })
// tumbling as it falls (a turn a frame)
const falling = (i: number, big = false): FxUse[] => {
  const p = (big ? FALL2 : FALL)[i]!
  return [...(i >= 1 ? [trail(p, big)] : []), meteor(p, big, 0, i % 4)]
}
// smoke rising off the cracked rock's burnt face, a puff climbing a pixel a frame
const rising = (i: number, x: number, top: number): FxUse => fx('sigh', i % 6 < 3 ? 0 : i % 6 < 5 ? 1 : 2, [x - ((i % 6) >> 1), top - (i % 6)], { pal: 'smoke' })
const rubble = (): FxUse => fx('quake', 3, [POST_X + 1, GROUND])
// the chips still tumbling off it (the rubble's last frames, turning over)
const chips = (i: number): FxUse => fx('rubble', 2 + (i % 2), [POST_X + 1, GROUND], { sink: 4 })
const crash = (f: number, ring: string): FxUse[] => [
  fx('quake', Math.min(3, f), [POST_X + 1, GROUND]),
  fx('rubble', Math.min(3, f), [POST_X + 1, GROUND]),
  ...(f <= 4 ? [fx('shockRing', f, [POST_X + 1, GROUND - 4], { pal: ring })] : []),
  ...(f <= 3 ? [fx('dustWave', f, [POST_X + 1, GROUND])] : []),
]
// the dust over the rock as it crumbles: a cloud frame f (the poof's, in the
// dust's colours) either side of it, drifting up as it sinks
const settling = (f: number, i = 0): FxUse[] => [fx('smoke', f, [POST_X - 4, GROUND - 2 - i], { pal: 'dust' }), ...(f >= 2 ? [fx('smoke', Math.min(4, f + 1), [POST_X + 6, GROUND - 6 - i], { pal: 'dust' })] : [])]
// braced against the blast where he stands (he is stoic: no flinch, only the
// knees sunk and the arms out, a column back)
const brace = (o: Partial<NinjaCel> = {}): NinjaCel => K('spread', awake({ eyes: 'focus', dy: 1, hdy: 1, x: HOME + 1, ...o }))
const tengaiCels: Cel[] = [
  // his own seals (not the fire's): the monkey, the rabbit
  ...postIn('signs', [K('sign3', { hdy: 1 }), K('sign3'), K('sign3'), K('sign2', { hdy: 1 }), K('sign2')]),
  c(1, 'signs', K('sign2'), { post: 'stand' }),
  // the Rinnegan, a hand thrown up to the sky, rising a column back on it:
  // calling it down; a look up at what is coming
  c(1, 'call', K('raise', awake({ hdy: 1, eyes: 'wide', x: HOME + 1 })), { post: 'stand' }),
  c(2, 'call', K('raise', awake({ x: HOME + 1 })), { post: 'stand' }),
  c(1, 'call', K('raise', awake({ x: HOME + 1, hdx: -1 })), { post: 'stand' }),
  c(1, 'call', K('raise', awake({ eyes: 'left' })), { post: 'stand' }),
  // it comes, faster and faster out of the top-left, tumbling; he points it
  // down at the post, a step in
  ...FALL.map((_, i) => c(1, 'fall', K(i < 2 ? 'raise' : 'strike', awake({ eyes: 'left', ...(i >= 2 ? { head: 'turn', x: HOME - 1 } : {}) })), { post: 'stand', fx: falling(i), ...(i === 0 ? { shout: true as const } : {}) })),
  // it lands on the post, half buried; braced (the stage jolts with the blow,
  // a pixel toward the arena and down, then back)
  c(2, 'impact', brace(), { fx: [meteor(GROUNDED, false, 6), ...crash(0, 'earth')], shake: [-1, 1] }),
  c(1, 'impact', brace({ dy: 0 }), { fx: [meteor(GROUNDED, false, 7), ...crash(1, 'earth')], shake: [1, 0] }),
  c(1, 'impact', brace({ dy: 0, eyes: 'smug' }), { fx: [meteor(GROUNDED, false, 7, 1), ...crash(2, 'earth')] }),
  c(1, 'impact', K('gather', awake({ eyes: 'focus', x: HOME + 1 })), { fx: [crack(0), ...crash(2, 'earth'), rising(0, POST_X + 6, 12)] }),
  // it sits on the post cracking, a crack a frame; arms folded, a look up:
  // there is a second one
  c(1, 'second', K('crossed', awake({ eyes: 'smug', hdy: 1 })), { fx: [crack(1), ...crash(3, 'earth'), rising(1, POST_X + 6, 12)] }),
  c(1, 'second', K('crossed', awake({ eyes: 'smug' })), { fx: [crack(1), crash(4, 'earth')[0]!, chips(0), rising(2, POST_X + 6, 12)] }),
  c(1, 'second', K('crossed', awake({ eyes: 'smug', hdx: 1 })), { fx: [crack(2), rubble(), chips(1), rising(3, POST_X + 6, 12)] }),
  c(1, 'second', K('crossed', awake({ eyes: 'left', x: HOME + 1 })), { fx: [crack(2), rubble(), rising(4, POST_X + 6, 12), meteor([-20, -13], true)] }),
  c(1, 'second', K('crossed', awake({ eyes: 'wide', x: HOME + 1, hdx: -1 })), { fx: [crack(2), rubble(), rising(5, POST_X + 6, 12), meteor([-19, -12], true, 0, 1)] }),
  // and it comes down faster still
  ...FALL2.map((_, i) => c(1, 'second', K(i < 2 ? 'raise' : 'alert', awake({ eyes: i < 2 ? 'left' : 'wide', x: HOME + 1, ...(i === 0 ? { hdy: 1 } : {}) })), { fx: [crack(i < 2 ? 2 : 3), rubble(), rising(4 + i, POST_X + 6, 12), ...falling(i, true)] })),
  // it lands on the first, braced again
  c(2, 'impact', brace({ x: HOME + 2 }), { fx: [meteor(BIG_AT, true, 8), ...crash(0, 'fire')], shake: [-1, 1] }),
  c(1, 'impact', brace({ x: HOME + 2, dy: 0 }), { fx: [meteor(BIG_AT, true, 9), ...crash(1, 'fire')], shake: [1, 0] }),
  // a step back in, a hand to his chin, appraising it: the rock sinks into
  // the crater three pixels a frame, still turning, crumbling to rubble under
  // the dust; the Rinnegan closes
  c(1, 'recover', K('think', awake({ eyes: 'left', hdy: 1, x: HOME + 1 })), { fx: [meteor(BIG_AT, true, 10, 1), ...crash(2, 'fire')] }),
  ...[12, 15, 18, 21, 24, 27, 30].map((sink, i) =>
    c(1, 'recover', K('think', awake({ eyes: i < 2 ? 'left' : 'half', ...(i === 2 ? { hdx: -1 } : {}), ...(i < 2 ? { x: HOME + 1 } : {}) })), { fx: [meteor(BIG_AT, true, sink, [2, 3, 2, 1, 2, 3, 2][i]!), rubble(), ...(i === 0 ? [crash(3, 'fire')[0]!] : []), ...settling([1, 1, 2, 2, 2, 3, 3][i]!, i)] }),
  ),
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { fx: [rubble(), fx('smoke', 3, [POST_X - 4, GROUND - 6], { pal: 'dust' }), fx('smoke', 3, [POST_X + 6, GROUND - 10], { pal: 'dust' })] }),
  c(1, 'recover', K('crossed', { eyes: 'smug' }), { fx: [rubble(), fx('smoke', 3, [POST_X - 4, GROUND - 8], { pal: 'dust' }), fx('smoke', 4, [POST_X + 6, GROUND - 12], { pal: 'dust' })] }),
  c(1, 'recover', K('idle1', { hdy: 1 }), { fx: [fx('quake', 3, [POST_X + 1, GROUND]), fx('smoke', 4, [POST_X - 4, GROUND - 9], { pal: 'dust' })] }),
  c(1, 'recover', K('idle0'), { fx: [fx('dust', 1, [POST_X - 2, GROUND]), fx('dust', 1, [POST_X + 6, GROUND])] }),
  c(1, 'recover', K('idle0'), { fx: [fx('dust', 2, [POST_X - 2, GROUND])] }),
]
export const TENGAI_SHINSEI = calls(celMove(T, { name: 'Tengai Shinsei', shout: 'Tengai Shinsei', on: ['agent'] }, tengaiCels), { second: 'Second meteor' })

// ------------------------------------------------------------------ Uchiha Return (1.7 s)

// For an edit: the gunbai off his back as the post poofs in, held up by
// the handle over his head; swept round at the post, a gust of wind flung
// off it that slams into the post; the follow-through, the fan back on his
// back, the gust's ring thinning out.
const blade = (f: number, x: number): FxUse => fx('windBlade', f, [x, 17], { pal: 'air' })
const air = (f: number): FxUse => fx('shockRing', f, 'post', { pal: 'air' })
const quickCels: Cel[] = [
  ...postIn('ready', [K('fanUp', { eyes: 'focus', hdy: 1 }), K('fanUp', { eyes: 'focus' }), K('fanUp', { eyes: 'focus', hdx: 1, x: HOME + 1 })]),
  // swept round: a step in with it, then the lunge's full stretch as the gust leaves the face
  c(1, 'swing', K('fanSwing', turn({ eyes: 'focus', x: HOME - 1, hdy: 1 })), { post: 'stand', fx: [blade(0, 22)] }),
  c(1, 'swing', K('fanSwing', turn({ eyes: 'focus', x: HOME - 2, hdy: 1 })), { post: 'stand', fx: [blade(1, 17)] }),
  c(2, 'impact', K('fanFollow', turn({ eyes: 'focus', x: HOME - 2, hdy: 1 })), { post: 'lean', flash: 'post', shake: [-1, 0], fx: [blade(2, 13), air(0)] }),
  c(1, 'impact', K('fanFollow', turn({ eyes: 'focus', x: HOME - 2 })), { post: 'lean', pdx: -1, fx: [blade(3, 11), air(1)] }),
  c(1, 'impact', K('fanFollow', turn({ x: HOME - 1 })), { post: 'stand', pdx: 1, fx: [air(2)] }),
  c(1, 'impact', K('fanFollow', turn({ x: HOME - 1, hdy: 1 })), { post: 'stand', fx: [air(3)] }),
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'stand', fx: [air(4)] }),
  ...hold(2, 'recover', K('crossed', { eyes: 'smug' }), { post: 'stand' }),
  c(1, 'recover', K('crossed', { eyes: 'smug' }), { post: 'stand' }),
  ...ending(),
]
export const QUICK = celMove(T, { name: 'Uchiha Return', shout: 'Uchiha Return', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.4 s)

// The end of a turn: no hop for him, but a real gesture. A reach back for
// the gunbai, swung up off his back and over his head in one sweep, and
// brought down onto his shoulder with a thump, a step in (the stage jolting,
// dust off his feet); the smirk, and the Sharingan flares (a red
// glint in his eye); the paddle lifted once and tapped down on the shoulder;
// slung back, arms folded; the breath, standing.
const glint = (f: number): FxUse => fx('twinkle', f, 'head', { d: [15, 11], pal: 'steamRed' })
const cheerCels: Cel[] = [
  c(1, 'cheer', K('windup', { eyes: 'focus', x: HOME + 1, hdy: 1 })),
  c(1, 'cheer', K('fanUp', { eyes: 'focus', x: HOME + 1 })),
  c(1, 'cheer', K('fanUp', { eyes: 'smug', hdx: 1 })),
  c(1, 'cheer', K('fanRest', { eyes: 'shut', x: HOME - 1, hdy: 1 }), { shake: [0, 1], fx: [dustAt(0, HOME - 1), dustAt(0, HOME + 4)] }),
  c(1, 'cheer', K('fanRest', { eyes: 'smug', x: HOME - 1 }), { fx: [dustAt(1, HOME - 1), dustAt(1, HOME + 4)] }),
  // the Sharingan flares
  c(1, 'cheer', K('fanRest', { eyes: 'wide', x: HOME - 1 }), { fx: [glint(1)] }),
  c(1, 'cheer', K('fanRest', { eyes: 'smug', x: HOME - 1 }), { fx: [glint(2)] }),
  c(1, 'cheer', K('fanRest', { eyes: 'smug', x: HOME - 1 }), { fx: [glint(3)] }),
  // the tap: the paddle lifted off the shoulder and down on it again
  c(1, 'cheer', K('fanTap', { eyes: 'smug', x: HOME - 1, hdx: 1 })),
  c(1, 'cheer', K('fanRest', { eyes: 'smug', x: HOME - 1, hdy: 1 })),
  c(1, 'cheer', K('crossed', { eyes: 'smug' })),
  c(1, 'recover', K('idle1', { hdy: 1 })),
  c(2, 'recover', K('idle0', { eyes: 'smug' })),
]
export const CHEER = celMove(T, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)
