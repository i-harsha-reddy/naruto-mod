// Jiraiya's moves as cels, hand-keyed at 10 fps: pose to pose, snaps not
// tweens, and never a dead drawing (anims/kit.ts says how to write a move:
// hold(), runIn(), hopHome() and leap() are the shared motion). Read each as
// a film strip: one line a held drawing. He stands at his own home (two
// columns nearer the arena, so the long mane down his back fits the stage).
// In the action poses (the run, the blow, the slam) his head turns
// three-quarters to the post ('turn', or 'sageTurn' in Sage Mode).

import { celMove } from '../cels.ts'
import { wear } from '../dress.ts'
import { GROUND, POST_X, STRIKE } from '../stage.ts'
import { HAORI } from '../templates/haori.ts'
import type { Cel, FxUse, HandEyes, NinjaCel, PoseGrid } from '../types.ts'
import { K as KH, awake, c, dustAt, fx, hold, hopHome, leap, postIn, postOut, runIn } from './kit.ts'

// his column at rest (ninja/jiraiya.ts's home)
export const JIRAIYA_HOME = 33
const HOME = JIRAIYA_HOME
const K = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => KH(pose, { x: HOME, ...o })
// Sage Mode awake (the pigment and the toad's eyes), the head turned to the post
const sageT = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => awake({ head: 'sageTurn', ...o })
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', ...o })

// His own poses (ninja/jiraiya.ts lists them): the Needle Jizō drawn over
// template poses, the hair ball a prop that shows only in these; and his
// thumbs-up drawn as his kabuki (the roster's cheer, the Toad Sage's mie).
// Each is another pose's drawing under its own name, so the companion still
// sees the pose it stands for.
// The seal the Jizō is worked in: the rabbit at mid-chest, its hands
// (UPPERCASE) drawn over the hair ball that swells round him, not under it
const RABBIT = HAORI.poses['sign2']!
const SEAL: PoseGrid = {
  ...RABBIT,
  breath: undefined,
  rows: RABBIT.rows.map((r, y) => (y >= 8 && y <= 10 ? [...r].map((ch, x) => (x >= 8 && x <= 13 && 'osk'.includes(ch) ? ch.toUpperCase() : ch)).join('') : r)),
}
export const JIRAIYA_POSES: Readonly<Record<string, string | PoseGrid>> = {
  // the mane swelling round him as he works the seal
  jizoGrow: SEAL,
  // the ball of spikes, whole; and rolling (a turn on, then back)
  jizoBall: SEAL,
  jizoRollA: SEAL,
  jizoRollB: SEAL,
  // bristling, every spike out
  jizoBristle: SEAL,
  // the arena side fired, its needles in flight
  jizoShotA: SEAL,
  jizoShotB: SEAL,
  // the needles stuck in the post, quivering
  jizoFired: SEAL,
  jizoQuiver: SEAL,
  // the ball falling open
  jizoFall: 'idle1',
  // standing again, scratching his head at the pincushion, the needles still
  // in the post; and the breath and the stance he ends on, needles and all
  jizoScratch: 'scratch',
  jizoAfter0: 'idle0',
  jizoAfter1: 'idle1',
  // the cheer: the kabuki, stirring and breathing like the drawing it is
  thumbs: 'kabuki',
  thumbsWind: 'kabukiWind',
}
// the template his moves are labelled in (his own poses and all)
const T = wear(HAORI, JIRAIYA_POSES)
// (the moods of his own faces, for the beats: the wink is a grin)
const MOODS: Pick<HandEyes, 'moods'> = { moods: { wink: 'happy' } }

// Every move ends on idle1 (the head dipped) for a frame, then idle0 for two
// as the post poofs away.
const ending = (o: Partial<Cel> = {}): Cel[] => [
  c(1, 'recover', K('idle1', { hdy: 1 }), { post: 'stand', ...o }),
  ...postOut('recover', [K('idle0'), K('idle0')], 'stand').map(cel => ({ ...cel, ...(o.pdy ? { pdy: o.pdy } : {}) })),
]

// the beat a run starts shouts the jutsu's name
const shouted = (cels: Cel[], tag: string): Cel[] => {
  const i = cels.findIndex(x => x.tag === tag)
  return cels.map((x, j) => (j === i ? { ...x, shout: true as const } : x))
}

// ------------------------------------------------------------------ Giant Rasengan (4.9 s)

// His own seals as the post poofs in (the monkey, the ox: not the Jizō's);
// Sage Mode: the pigment comes up round his eyes and the two old toads,
// Fukasaku and Shima, pop onto his shoulders; a Rasengan spun up in the palm
// held out low in front of him (one key), then fed with both hands round it
// until it is as big as his head (another: sunk into a wide stance, drawn
// back a column under its weight), never over his face; rocked back over it,
// two heavy steps at the post and the lunge, driven into the wood a column
// past where it lands (19 px, the biggest it has been: the wood juddering,
// the hit-stop, the wind tearing off it); then it bursts, a disc of torn
// wind wider than the ball, two shock rings one after the other, the blast
// throwing him back in a slide of dust; the heavy hop home, arms out, done.
// The toads ride his shoulders all the way (by his turned head in the run).
const TOAD_BEAT = [0, 0, 0, 0, 1, 0, 0, 0, 0, 2] as const
const toads = (i: number, turned = false): FxUse => fx('sageToads', (turned ? 3 : 0) + TOAD_BEAT[i % TOAD_BEAT.length]!, 'head', { d: turned ? [-6, 14] : [-4, 14] })
// (popping onto his shoulders, and off them: a puff of smoke at each)
const pop = (f: number): FxUse[] => [fx('sigh', f, 'head', { d: [-1, 13], pal: 'smoke' }), fx('sigh', f, 'head', { d: [22, 13], pal: 'smoke' })]
const poof = (f: number): FxUse[] => [fx('smoke', f, 'head', { d: [-1, 17] }), fx('smoke', f, 'head', { d: [22, 17] })]
// the ball held out in front of the thrust hand, clear of his face (the
// charge's hand is low at the front: the ball sits up and out from it; fed
// in both hands at his side, it sits out in front of them)
const BALL: [number, number] = [-6, -4]
const FED: [number, number] = [-8, -5]
const ball = (f: FxUse['f'] = 'cycle', d: [number, number] = BALL): FxUse => fx('giantRasengan', f, 'hand', { d })
const small = (f: FxUse['f'] = 'cycle'): FxUse => fx('rasengan', f, 'hand', { d: [-3, -3] })
// ground into the post (fx/firewall.ts), and its burst, with two rings
// (centred a little into the post from its struck face, so the ball and the
// burst stay clear of his face behind his fist)
const grind = (f: number): FxUse => fx('rasenGrind', f, 'post', { d: [-2, 0] })
const ring = (f: number): FxUse => fx('shockRing', f, 'post', { pal: 'wind', d: [-2, 0] })
const burst = (f: number, rings: readonly number[]): FxUse[] => [fx('rasenBurst', f, 'post', { d: [-3, 0] }), ...rings.map(ring)]
// the lunge lands with his fist in the ball's edge (the ball in front of
// it, a column further off than a punch), a column past the mark; the blast
// throws him back four
const AT = STRIKE
const BLOWN = STRIKE + 5
const t = (i: number): FxUse => toads(i, true)
const rasenganCels: Cel[] = [
  ...postIn('signs', [K('sign3', { hdy: 1 }), K('sign3'), K('sign3'), K('sign1', { hdy: 1 }), K('sign1')]),
  // Sage Mode: the pigment round the eyes; the old toads pop onto his shoulders
  c(1, 'sage', K('sign1', awake({ hdy: 1, eyes: 'shut' })), { post: 'stand', fx: pop(0) }),
  c(1, 'sage', K('sign1', awake({ eyes: 'wide' })), { post: 'stand', fx: [toads(0), ...pop(1)] }),
  c(1, 'sage', K('sign1', awake({ eyes: 'smug' })), { post: 'stand', fx: [toads(1), ...pop(2)] }),
  // the Rasengan spun up in the palm held out low in front
  c(1, 'charge', K('charge', awake({ hdy: 1 })), { post: 'stand', fx: [toads(2), small(0)] }),
  c(2, 'charge', K('charge', awake()), { post: 'stand', fx: [toads(3), small()] }),
  c(1, 'charge', K('charge', awake({ hdx: -1 })), { post: 'stand', fx: [toads(4), small()] }),
  // fed with both hands round it till it is as big as his head: sunk into a
  // wide stance under it, drawn back a column (the ground jolted once)
  c(1, 'charge', K('gather', awake({ x: HOME + 1, dy: 1, hdy: 1 })), { post: 'stand', fx: [toads(4), ball(0, FED)], shake: [0, 1] }),
  ...hold(4, 'charge', K('gather', awake({ x: HOME + 1, dy: 1 })), i => ({ post: 'stand', fx: [toads(5 + i), ball('cycle', FED)] })),
  // rocked back over it, two heavy steps at the post, the ball carried low
  // out in front; the lunge, a column past the mark: the blow, ground in
  ...shouted(
    runIn('dash', {
      style: 'heavy',
      from: HOME + 1,
      to: AT - 1,
      look: sageT(),
      ready: 'charge',
      fx: (i, part) => (part === 'windup' ? [toads(8 + i, true), ball('cycle', [-9, -6])] : part === 'travel' ? [t(i), ball('cycle', [-7, -5])] : []),
      strike: { n: 1, post: 'lean', flash: 'post', shake: [-1, 0], fx: [t(3), grind(0)] },
    }),
    'dash',
  ),
  // the hit-stop, the head nodding into it; ground into the wood, fed past
  // its charge: the post juddering, the wind tearing off it
  c(1, 'impact', K('strike', sageT({ x: AT - 1, hdy: 1 })), { post: 'lean', pdx: -1, shake: [-1, 0], fx: [t(4), grind(1)] }),
  c(1, 'impact', K('follow', sageT({ x: AT })), { post: 'lean', pdx: -2, shake: [1, 0], fx: [t(5), grind(2)] }),
  c(1, 'impact', K('follow', sageT({ x: AT, hdx: -1 })), { post: 'lean', pdx: -1, fx: [t(6), grind(0)] }),
  // the burst: white through the wood, then a disc of torn wind wider than
  // the ball, two rings after each other; the blast throws him back in a
  // slide of dust (a two-frame jolt)
  c(1, 'impact', K('follow', sageT({ x: AT, hdx: 1 })), { post: 'lean', pdx: -2, fx: [t(7), ...burst(0, [0])], shake: [-2, 0] }),
  c(1, 'impact', K('slump', sageT({ x: AT + 2, hdx: 1 })), { post: 'lean', pdx: -1, fx: [t(8), ...burst(1, [1]), dustAt(0, AT + 3)], shake: [1, 0] }),
  c(1, 'impact', K('slump', sageT({ x: BLOWN - 1 })), { post: 'stand', pdx: 1, fx: [t(9), ...burst(2, [2, 0]), dustAt(1, AT + 3), dustAt(0, BLOWN)] }),
  c(2, 'impact', K('gather', awake({ x: BLOWN, dy: 1, hdy: 1 })), { post: 'stand', fx: [toads(0), ...burst(3, [3, 1]), dustAt(1, BLOWN)] }),
  // the heavy hop home: spring, up over the arena, the landing squash; the
  // two rings thinning out behind him
  ...hopHome('back', BLOWN, 'stand', awake({ x: HOME }), 1, 'jump', { style: 'heavy' }).map((cel, i) => ({ ...cel, fx: [...(cel.fx ?? []), toads(1 + i), ...(i < 3 ? [[ring(4), ring(2)], [ring(3)], [ring(4)]][i]! : [])] })),
  // home: arms out, done, the pigment fading, the toads gone in a puff; the post poofs away
  c(1, 'recover', K('spread', { eyes: 'happy', hdy: 1 }), { post: 'stand', fx: [toads(4)] }),
  c(1, 'recover', K('spread', { eyes: 'happy' }), { post: 'stand', fx: [toads(5), ...poof(1)] }),
  c(1, 'recover', K('spread', { eyes: 'happy' }), { post: 'stand', fx: poof(2) }),
  c(1, 'recover', K('spread', { eyes: 'happy' }), { post: 'stand', fx: poof(3) }),
  c(1, 'recover', K('idle1', { hdy: 1 }), { post: 'stand', fx: [fx('smoke', 3, 'head', { d: [-1, 17] }), fx('smoke', 4, 'head', { d: [22, 17] })] }),
  ...postOut('recover', [K('idle0'), K('idle0')], 'stand', i => (i === 0 ? [...poof(4), ...pop(1)] : [])),
]
export const GIANT_RASENGAN = celMove(T, { name: 'Giant Rasengan', shout: 'Giant Rasengan', dojutsu: true, on: ['shell'] }, rasenganCels, MOODS)

// ------------------------------------------------------------------ Gamabunta (5.2 s)

// The palm slapped to the ground, the seal's script racing to the post, and
// Gamabunta rises out of a great cloud, the sage springing up onto his head
// as he comes (up out of the shot: the stage holds the toad's face, not the
// man on top of it, and a puff of dust off his crown where he lands). Then
// the climax: the chief toad's face whole across the stage, eye bumps to
// chin (fx/summons/toad.ts): the scar down his left eye, the pipe up across
// his cheek, puffing it, a slow blink. "Go!": he crouches and leaps at the
// post (cut wide), comes down on it, the stage jumping; he goes as he came,
// Jiraiya drops home out of the smoke and lands in his kabuki, the Toad
// Sage, with a wink; the post is left driven into the earth.
// (the toad on the ground at the stage's left edge, `up` px in the air; its
// face whole in the middle of the stage, `sink` px lower; its frame f)
const toad = (up = 0, x = 6): FxUse => fx('toad', 0, [x, GROUND + 2 - up], { back: true })
const FACE_X = 25
const face = (f = 0, sink = 0): FxUse => fx('toadFace', f, [FACE_X, GROUND + 2], { back: true, ...(sink ? { sink } : {}) })
// a puff off his pipe's bowl (k: 0-4, its rise), over his face whole
const puff = (k: number): FxUse => fx('sigh', [0, 0, 1, 1, 2][k % 5]!, [FACE_X + 19, 7 - (k % 5)], { pal: 'smoke' })
const PUFFS: readonly [number, number][] = [[0, 0], [7, -6], [-4, -10], [3, -15]]
const cloud = (f: number, x = 22): FxUse[] => PUFFS.map(([dx, dy]) => fx('smoke', f, [x + dx, GROUND + dy]))
// (its puffs thinning one by one: a frame each)
const clouds = (fs: readonly number[], x = 10): FxUse[] => PUFFS.map(([dx, dy], i) => fx('smoke', fs[i]!, [x + dx, GROUND + dy]))
const SUNK = 5
// where he stands while the toad comes up, a step back from him
const BY = HOME + 1
// (the toad's blink and draws on the pipe through the climax, a frame each)
const LOOK = [0, 0, 2, 2, 0, 0, 1, 0, 0, 2] as const
const gamaCels: Cel[] = [
  ...postIn('signs', [K('sign2', { hdy: 1 }), K('sign2'), K('sign2'), K('sign3', { hdy: 1 }), K('sign3')]),
  c(1, 'signs', K('sign1', { hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign1'), { post: 'stand' }),
  // the palm to the ground: the seal's ring opens round it (the shout)
  c(1, 'slam', K('slam', turn({ eyes: 'focus', hdy: 1 })), { post: 'stand', shout: true, shake: [0, 1], fx: [fx('sealRing', 0, 'hand', { back: true }), fx('dust', 0, 'hand', { d: [1, 0] })] }),
  c(1, 'slam', K('slam', turn({ eyes: 'focus' })), { post: 'stand', fx: [fx('sealRing', 1, 'hand', { back: true }), fx('dust', 1, 'hand', { d: [1, 0] })] }),
  // the script races along the floor to the post
  ...[0, 1, 2, 3].map(f => c(1, 'slam', { ...K('slam', turn({ eyes: 'left' })), held: f }, { post: 'stand', fx: [fx('sealRing', Math.min(3, f + 2), 'hand', { back: true }), fx('sealLine', f, 'hand', { back: true, d: [-1, 0] })] })),
  // a great cloud, the chief toad rising out of it, the ground shaking; the
  // sage crouches and springs up onto him as he comes, up out of the shot
  c(1, 'appear', K('crouch', { eyes: 'wide', x: BY }), { post: 'stand', fx: [...cloud(1), dustAt(0, BY)], shake: [0, 1] }),
  c(1, 'appear', K('jump', { eyes: 'focus', x: BY - 2, lift: 4 }), { post: 'stand', fx: [face(0, 14), ...cloud(2), dustAt(1, BY)], shake: [1, 0] }),
  c(1, 'appear', K('jump', { eyes: 'focus', x: BY - 3, lift: 7, clip: 3 }), { post: 'stand', fx: [face(0, 7), ...cloud(3)] }),
  // the climax: his face whole, puffing his pipe, a slow blink; a puff of
  // dust off his crown as the sage lands up there, the toad blinking at it
  c(1, 'hero', undefined, { post: 'stand', fx: [face(0, 2), ...clouds([3, 4, 4, 3], 22)] }),
  c(1, 'hero', undefined, { post: 'stand', fx: [face(1), fx('dust', 0, [FACE_X + 3, 3]), ...clouds([4, 4, 4, 4], 22)], shake: [0, 1] }),
  c(1, 'hero', undefined, { post: 'stand', fx: [face(0), fx('dust', 1, [FACE_X + 3, 3]), fx('dust', 2, [FACE_X + 3, 3])] }),
  ...LOOK.slice(0, 5).map((f, i) => c(1, 'hero', undefined, { post: 'stand', fx: [face(f), puff(i)] })),
  // "go!": the sage drops off his head in front of him, lands, and flings a
  // hand at the post; the toad crouches (the stage jolting) and leaps at it,
  // cut wide
  c(1, 'hero', K('tuck', { x: 38, lift: 6, clip: 3, eyes: 'focus' }), { post: 'stand', fx: [face(1), puff(5)] }),
  c(1, 'hero', K('crouch', { x: 36, eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [face(0, 2), puff(6), dustAt(0, 36)] }),
  c(1, 'hero', K('strike', turn({ x: 35, eyes: 'focus' })), { post: 'stand', fx: [face(2, 3), dustAt(1, 36)], shake: [0, 1] }),
  c(1, 'drop', K('strike', turn({ x: 34, eyes: 'focus', hdy: 1 })), { post: 'stand', fx: [toad(7, 14)] }),
  // down on the post: the toad's face over it, the stage jumping; the sage
  // rocked back by it, a hand up against the wind
  c(2, 'impact', K('follow', turn({ x: 35, eyes: 'wide' })), { post: 'lean', pdy: 3, flash: 'post', fx: [toad(0, 10), fx('dustWave', 0, [POST_X + 1, GROUND]), fx('earth', 0, [POST_X + 14, GROUND])], shake: [-1, 1] }),
  c(1, 'impact', K('gather', { x: 37, eyes: 'wide', dy: 1 }), { post: 'stand', pdy: SUNK, fx: [toad(-1, 10), fx('dustWave', 1, [POST_X + 1, GROUND]), fx('earth', 1, [POST_X + 14, GROUND]), dustAt(0, 37)], shake: [1, 0] }),
  c(1, 'impact', K('gather', { x: 37, eyes: 'happy', hdy: 1 }), { post: 'stand', pdy: SUNK, fx: [toad(0, 10), fx('dustWave', 2, [POST_X + 1, GROUND]), fx('earth', 2, [POST_X + 14, GROUND]), dustAt(1, 37)] }),
  c(1, 'impact', K('gather', { x: 36, eyes: 'happy' }), { post: 'stand', pdy: SUNK, fx: [toad(0, 10), fx('dustWave', 3, [POST_X + 1, GROUND])] }),
  // he goes as he came, in a cloud; the sage hops home and lands in his
  // kabuki, stamped down (the ground jumping, dust off it): the Toad Sage,
  // a wink; the post left driven into the earth
  c(1, 'vanish', K('crouch', { x: 36, eyes: 'happy' }), { post: 'stand', pdy: SUNK, fx: [toad(0, 10), ...cloud(1, 14)] }),
  c(1, 'vanish', K('tuck', { x: 35, lift: 3 }), { post: 'stand', pdy: SUNK, fx: cloud(2, 14) }),
  c(1, 'vanish', K('tuck', { x: 34, lift: 4 }), { post: 'stand', pdy: SUNK, fx: cloud(3, 14) }),
  c(1, 'vanish', K('tuck', { x: 33, lift: 2 }), { post: 'stand', pdy: SUNK, fx: clouds([3, 3, 4, 4], 14) }),
  c(1, 'recover', K('thumbs', { eyes: 'happy', hdy: 1, dy: 1 }), { post: 'stand', pdy: SUNK, shake: [0, 1], fx: [...clouds([3, 4, 4, 4], 14), dustAt(0, HOME - 1), dustAt(0, HOME + 4)] }),
  c(1, 'recover', K('thumbs', { eyes: 'wink' }), { post: 'stand', pdy: SUNK, fx: [...clouds([4, 4, 4, 4], 14), dustAt(1, HOME - 1), dustAt(1, HOME + 4)] }),
  c(1, 'recover', K('thumbs', { eyes: 'wink', hdx: 1 }), { post: 'stand', pdy: SUNK, fx: [fx('smoke', 4, [14, GROUND - 2]), fx('smoke', 4, [21, GROUND - 6]), fx('sigh', 1, [14, GROUND - 6], { pal: 'smoke' })] }),
  c(1, 'recover', K('thumbs', { eyes: 'wink' }), { post: 'stand', pdy: SUNK, fx: [fx('sigh', 2, [15, GROUND - 7], { pal: 'smoke' })] }),
  c(1, 'recover', K('spread', { eyes: 'happy' }), { post: 'stand', pdy: SUNK }),
  ...ending({ pdy: SUNK }),
]
export const GAMABUNTA = celMove(T, { name: 'Summoning Jutsu: Gamabunta', shout: 'Summon: Gamabunta', dojutsu: false, on: ['agent'] }, gamaCels, MOODS)

// ------------------------------------------------------------------ Needle Jizō (4.5 s)

// His mane swells round him into a ball of white hair as he works the seal
// (the ball is a prop of his, ninja/jiraiya.ts, shown in his own poses
// above); it rolls at the post, a turn a frame, gathering speed, and bumps
// into it (the post knocked, the ball squashed, his head jolted down in it);
// it rocks back off it and bristles, every spike out (the stage jolting with
// it); the arena side fires its needles point-blank (fx/firewall.ts: dark-
// outlined spikes), they bite (the post rocked, the hit-stop), stuck in the
// wood and quivering; the ball falls open and he hops home, and scratches
// his head at his pincushion, grinning.
const bite = (f: number): FxUse => fx('impact', f, 'post', { pal: 'smoke' })
const needles = (f: number): FxUse => fx('jizoNeedles', f, 'post')
// (rolling, a pixel's bob of his head in the ball each turn)
const ROLL: readonly [string, number, number][] = [['jizoRollB', HOME, 0], ['jizoRollA', HOME - 1, 1], ['jizoRollB', HOME - 3, 0]]
const jizoCels: Cel[] = [
  // his own seals (not the Rasengan's): the ox, then the rabbit the Jizō is worked in
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2'), K('sign2')]),
  c(1, 'signs', K('sign2', { eyes: 'focus' }), { post: 'stand' }),
  // the mane swelling round him; he settles into it, a column back
  c(1, 'wrap', K('jizoGrow', { eyes: 'focus', hdy: 1 }), { post: 'stand' }),
  c(2, 'wrap', K('jizoGrow', { eyes: 'focus', x: HOME + 1 }), { post: 'stand' }),
  c(1, 'wrap', K('jizoBall', { eyes: 'focus', x: HOME + 1, hdy: 1 }), { post: 'stand', shake: [0, 1] }),
  c(2, 'wrap', K('jizoBall', { eyes: 'smug', x: HOME + 1 }), { post: 'stand' }),
  // it rolls at the post, a turn a frame, gathering speed, dust off it
  ...ROLL.map(([pose, x, hdy], i) => c(1, 'roll', K(pose, { eyes: 'focus', x, hdy }), { post: 'stand', fx: [dustAt(i % 2, x + 6)] })),
  // and bumps into it: the post knocked, the ball squashed a pixel, his head jolted down
  c(1, 'roll', K('jizoRollA', { eyes: 'wide', x: HOME - 4, dy: 1, hdy: 1 }), { post: 'lean', pdx: -1, shake: [-1, 0], fx: [dustAt(0, HOME - 2), bite(0)] }),
  // rocked back off it a column; bristling, every spike out (the stage jolting)
  c(1, 'hold', K('jizoBall', { eyes: 'focus', x: HOME - 2 }), { post: 'stand', fx: [dustAt(1, HOME - 2), bite(2)] }),
  c(1, 'hold', K('jizoBristle', { eyes: 'smug', x: HOME - 2, hdy: 1 }), { post: 'stand', shake: [1, 0], fx: [bite(3)] }),
  c(3, 'hold', K('jizoBristle', { eyes: 'smug', x: HOME - 2 }), { post: 'stand' }),
  c(1, 'hold', K('jizoBristle', { eyes: 'focus', x: HOME - 1, dy: 1, hdx: 1 }), { post: 'stand' }),
  // the volley, point-blank: lurched forward with it
  c(1, 'release', K('jizoShotA', { eyes: 'focus', x: HOME - 3, hdy: 1 }), { post: 'stand', fx: [needles(0)] }),
  c(1, 'release', K('jizoShotB', { eyes: 'focus', x: HOME - 3 }), { post: 'stand', fx: [needles(1)] }),
  // they bite: the post rocked, the needles quivering in the wood (the hit-stop)
  c(2, 'impact', K('jizoFired', { eyes: 'focus', x: HOME - 3 }), { post: 'lean', flash: 'post', shake: [-1, 0], fx: [bite(0), needles(2)] }),
  c(1, 'impact', K('jizoQuiver', { eyes: 'focus', x: HOME - 2 }), { post: 'stand', shake: [1, 0], fx: [bite(1), needles(3)] }),
  c(1, 'impact', K('jizoFired', { x: HOME - 2 }), { post: 'lean', fx: [bite(2), needles(2)] }),
  c(1, 'impact', K('jizoQuiver', { eyes: 'smug', x: HOME - 2 }), { post: 'stand', fx: [bite(3), needles(3)] }),
  // the ball falls open; a hop home, the needles left in the post
  c(2, 'impact', K('jizoFall', { eyes: 'happy', x: HOME - 2 }), { post: 'stand', fx: [needles(2)] }),
  ...hopHome('back', HOME - 2, 'stand', { x: HOME, eyes: 'happy' }, 1, 'jump', { style: 'skip' }).map(cel => ({ ...cel, fx: [...(cel.fx ?? []), needles(2)] })),
  // a scratch of the head at the pincushion, grinning
  c(1, 'recover', K('jizoScratch', { eyes: 'happy', hdy: 1 }), { post: 'stand', fx: [needles(2)] }),
  c(3, 'recover', K('jizoScratch', { eyes: 'happy' }), { post: 'stand', fx: [needles(2)] }),
  c(1, 'recover', K('jizoScratch', { eyes: 'happy', hdx: -1 }), { post: 'stand', fx: [needles(3)] }),
  c(1, 'recover', K('jizoScratch', { eyes: 'happy' }), { post: 'stand', fx: [needles(2)] }),
  c(1, 'recover', K('idle1', { hdy: 1 }), { post: 'stand', fx: [needles(2)] }),
  ...postOut('recover', [K('idle0'), K('idle0')]),
]
export const NEEDLE_JIZO = celMove(T, { name: 'Needle Jizō', shout: 'Needle Jizo', dojutsu: false }, jizoCels, MOODS)

// ------------------------------------------------------------------ Frog Kumite (1.8 s)

// For an edit: the toad's taijutsu, its reach longer than the fist. Down into
// the toad's stance as the post poofs in (a frog's squat, the palm flat on
// the ground), a spring off it, and the frog's straight punch, the head
// held back behind the shoulder so the whole arm shows straight out under
// his chin, stopping a hand short of the post, and still it lands: the
// reach beyond the fist (the gold star on the wood and its ring, the post
// rocked, a jolt); drawn up out of it; the hop home, a cannonball.
const hit = (f: number): FxUse[] => [fx('impact', f, 'post', { pal: 'hit' }), fx('shockRing', f, 'post', { pal: 'hit' })]
const quickCels: Cel[] = [
  ...postIn('ready', [K('slam', turn({ eyes: 'focus', hdy: 1 })), K('slam', turn({ eyes: 'focus' })), K('slam', turn({ eyes: 'focus', dy: 1 }))], i => (i === 0 ? [fx('dust', 0, 'hand', { d: [1, 0] })] : [])),
  // the spring off the squat, low and long
  c(1, 'dash', K('tuck', turn({ x: 30, lift: 3, eyes: 'focus' })), { post: 'stand', fx: [dustAt(0, HOME)] }),
  // the punch, a hand short: the reach lands on the wood
  c(2, 'impact', K('strike', turn({ x: STRIKE + 1, hdx: 3, hdy: 1 })), { post: 'lean', flash: 'post', shake: [-1, 0], fx: [...hit(0), dustAt(1, HOME), dustAt(0, STRIKE + 3)] }),
  c(1, 'impact', K('strike', turn({ x: STRIKE + 1, hdx: 3 })), { post: 'stand', pdx: -1, fx: [...hit(1), dustAt(1, STRIKE + 3)] }),
  c(1, 'impact', K('punch', turn({ x: STRIKE + 2, hdx: 1 })), { post: 'stand', pdx: 1, fx: hit(2) }),
  ...hopHome('back', STRIKE + 2, 'stand', { x: HOME }, 1, ['tuck']).map((cel, i) => (i < 2 ? { ...cel, fx: [...(cel.fx ?? []), fx('shockRing', 3 + i, 'post', { pal: 'hit' })] } : cel)),
  c(1, 'recover', K('gather', { eyes: 'happy' }), { post: 'stand' }),
  ...ending(),
]
export const QUICK = celMove(T, { name: 'Frog Kumite', shout: 'Frog Kumite', on: ['edit'], quick: true, dojutsu: false }, quickCels, MOODS)

// ------------------------------------------------------------------ the cheer (1.5 s)

// The end of a turn: the Toad Sage's own entrance, not anybody's thumbs-up.
// A crouch, a real leap (up five), landing straight into the kabuki stamped
// down on the one foot (the ground jumping, dust off it); the wink and the
// grin, the head tossed back once; the breath, standing.
const cheerCels: Cel[] = [
  ...leap('hop', { x: HOME, eyes: 'happy' }, { lift: 5, squash: 1 }),
  c(1, 'cheer', K('thumbs', { eyes: 'happy', hdy: 1 }), { shake: [0, 1], fx: [dustAt(0, HOME - 1), dustAt(0, HOME + 4)] }),
  c(1, 'cheer', K('thumbs', { eyes: 'wink' }), { fx: [dustAt(1, HOME - 1), dustAt(1, HOME + 4)] }),
  ...hold(2, 'cheer', K('thumbs', { eyes: 'wink' })),
  c(1, 'cheer', K('thumbs', { eyes: 'wink', hdx: 2 })),
  // the knee down, the fist still up
  c(1, 'cheer', K('cheer2', { eyes: 'happy' })),
  c(1, 'recover', K('idle1', { hdy: 1 })),
  c(2, 'recover', K('idle0', { eyes: 'happy' })),
]
export const CHEER = celMove(T, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels, MOODS)
