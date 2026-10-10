// Itachi's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them). He barely moves: a look, two fingers raised, and the world
// does the rest; but he is never a dead drawing: his long holds stir (the
// cloak's `<pose>Wind` drawings, a lock of his hair blown out). Built on his
// cloak as he wears it (ninja/itachi.ts: his raise is the one-handed seal).
// The Sharingan shows while he reads; the Mangekyō (the eyes 'mk', and the
// bleeding) only in his jutsu. His weight is STOIC (kit.ts's cast weights):
// no sink, a small step and no overshoot, and no recoil: the head nods with a
// blow instead. Each jutsu has a key pose of its own: Tsukuyomi the step into
// the point, the crows the arms flung wide, Amaterasu the lean in over the
// flames, low; the Phoenix Flower the sidearm fling.
//   Tsukuyomi        the eyes shut, a dip, and the Mangekyō snaps open: the
//                    red world wipes out of his eyes, the post bound to a
//                    cross before a red moon, three swords while his cloak
//                    stirs, and the world closes back into his eyes
//   Crow Clone       crows pour off his cloak, mob the post, and gather into
//                    a copy of him beside it that strikes, then bursts back
//                    into crows
//   Amaterasu        the Mangekyō, a tear of blood, black flames erupting
//                    up the post and burning until he shuts the eye
//   Phoenix Flower   (the quick strike) the tiger seal, three shuriken of
//                    fire flung high, middle and low into the post

import { celMove } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { HOME, POST_HIT } from '../stage.ts'
import type { Cel, CelMove, CloneCel, FxUse, NinjaCel, Template, XY } from '../types.ts'
import { K, awake, c, cast, fx, hold, postIn, postOut } from './kit.ts'

// the dojutsu awake in a jutsu: the Mangekyō
const sh = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => awake({ eyes: 'mk', ...o })
// the head turned three-quarters to the post, for a blow
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', ...o })
// the moods of his own eye states, for the companion
const EYES = { moods: { mk: 'focus', bleed1: 'focus', bleed2: 'focus', bleed3: 'focus' } } as const

// the last of every move: the breath let out, and standing
const settle = (last: readonly NinjaCel[] = []): NinjaCel[] => [...last, K('idle1', { hdy: 1 }), K('idle0'), K('idle0')]

// ------------------------------------------------------------------ Tsukuyomi (4.9 s)

// The world of the genjutsu: a 48 x 24 sky drawn over the whole stage (it
// opens out of his eyes as he stands at home), the red moon behind the
// post, and the post as it is in there, bound to a cross (it replaces the
// post). A blow jolts the world up a pixel (its ground is black, so no seam
// shows), the bound post flinches on its cross for a frame (a pixel toward
// the edge) and the moon pulses: its dark halo out, then fading.
const wipe = (f: number): FxUse => fx('tsukuyomiWipe', f, AT.stage, { back: true })
const MOON_AT: XY = [9, 6]
const moon = (f = 0): FxUse => fx('redMoon', f, MOON_AT, { back: true })
const bound = (f: number, flinch = false): FxUse => fx('boundPost', f, AT.postBase, { back: true, ...(flinch ? { d: [-1, 0] as XY } : {}) })
// the world with the post on sword f; a blow (pulse 2) and the frame after it (pulse 1)
const world = (f: number, pulse = 0): FxUse[] => [wipe(4), moon(pulse), bound(f, pulse === 2)]
const JOLT: XY = [0, -1]

// His body through it, quick to the stare (0.7 s of folded arms, not 2):
// the eyes shut and his weight drawn back a pixel; the Mangekyō snaps open,
// and the world with it; then THE KEY POSE, the step into the point: the
// arm thrown out at the post, the head turned on it and thrust forward (the
// bound post, the world jolted); the fingers back to the eye for the first
// sword; a fist closed on it a step further in for the second; the point
// again, leaning in harder, for the third; and the world closes back into
// his eyes. Every sword lands with a jolt of the world (a short shake), the
// post flinching and the moon pulsing; no drawing held over 0.6 s.
const tsukuyomiCels: Cel[] = [
  // the post poofs in; arms folded, he lowers his eyes and shuts them
  ...postIn('focus', [K('crossed', { eyes: 'half' }), K('crossed', { eyes: 'shut', hdy: 1 })]),
  // drawn into himself: the weight back a pixel (no sink), the head bowed
  c(1, 'focus', K('crossed', { eyes: 'shut', x: HOME + 1, hdy: 1 }), { post: 'stand' }),
  c(1, 'focus', K('crossedWind', { eyes: 'shut', x: HOME + 1 }), { post: 'stand' }),
  // the Mangekyō snaps open behind two raised fingers, and the world opens
  // out of his eyes: a red halo, then the wipe across the stage (the post
  // bound as the edge passes it), his cloak stirring in it
  c(1, 'stare', K('crossed', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand', shout: true, fx: [wipe(0)] }),
  c(1, 'stare', K('crossed', sh({ x: HOME + 1 })), { post: 'stand', fx: [wipe(1)] }),
  c(1, 'stare', K('crossedWind', sh({ x: HOME + 1 })), { post: 'stand', fx: [wipe(2)] }),
  c(1, 'stare', K('crossedWind', sh({ x: HOME + 1, eyes: 'wide' })), { fx: [wipe(3), bound(0)] }),
  // in his world, the post lashed to the cross before the red moon. The key
  // pose: the step into the point, the arm out, the head thrust at it; the
  // world jolts
  c(2, 'impact', K('strike', sh(turn({ x: HOME - 1, hdx: -1, hdy: 1 }))), { fx: world(0, 2), shake: [-1, -1] }),
  c(1, 'impact', K('strike', sh(turn({ x: HOME - 1, hdx: -1 }))), { fx: world(0, 1), shake: [1, 0] }),
  ...hold(3, 'impact', K('strike', sh(turn({ x: HOME - 1 }))), { fx: world(0), phase: 2 }),
  // the first sword: the fingers drawn back to the eye, the step given back
  c(1, 'hit', K('seal', sh({ hdy: 1 })), { fx: world(1, 2), shake: JOLT }),
  c(1, 'hit', K('seal', sh()), { fx: world(1, 1) }),
  ...hold(4, 'hit', K('seal', sh()), { fx: world(1), phase: 2 }),
  // the second: a fist closed on it, a step further in than the point
  c(1, 'hit2', K('punch', sh(turn({ x: HOME - 2, hdy: 1 }))), { fx: world(2, 2), shake: [-1, -1] }),
  c(1, 'hit2', K('punch', sh(turn({ x: HOME - 2 }))), { fx: world(2, 1), shake: [1, 0] }),
  ...hold(4, 'hit2', K('punch', sh(turn({ x: HOME - 2 }))), { fx: world(2) }),
  // the third: the point again, leaning in harder on it
  c(1, 'hit3', K('strike', sh(turn({ x: HOME - 2, hdx: -1, hdy: 1 }))), { fx: world(3, 2), shake: JOLT }),
  c(1, 'hit3', K('strike', sh(turn({ x: HOME - 2, hdx: -1 }))), { fx: world(3, 1) }),
  c(2, 'hit3', K('strikeWind', sh(turn({ x: HOME - 2 }))), { fx: world(3) }),
  c(1, 'hit3', K('strike', sh(turn({ x: HOME - 1, hdy: 1 }))), { fx: world(3) }),
  // the world closes back into his eyes; the post stands as it was (it was
  // only ever in his eyes), the fingers back at the eye, the hand to the chin
  // as the eyes shut, then the arms fold
  c(1, 'fade', K('seal', sh({ hdy: 1 })), { fx: [wipe(3), bound(3)] }),
  c(1, 'fade', K('sealWind', sh()), { post: 'stand', fx: [wipe(2)] }),
  c(1, 'fade', K('think', sh()), { post: 'stand', fx: [wipe(1)] }),
  c(1, 'fade', K('think', sh()), { post: 'stand', fx: [wipe(5)] }),
  c(1, 'fade', K('think', { eyes: 'shut' }), { post: 'stand', fx: [wipe(6)] }),
  c(1, 'fade', K('crossed', { eyes: 'shut', hdy: 1 }), { post: 'stand', fx: [wipe(0)] }),
  ...postOut('recover', settle([K('crossed', { eyes: 'left' })])),
]

// ------------------------------------------------------------------ Crow Clone (4.9 s)

// The crows: the summon sprite (9 x 8, its foot the anchor), facing left;
// `flip` turns one back toward him. A flock is a list of [x, y, flip?].
type Crow = readonly [number, number, boolean?]
const crows = (list: readonly Crow[], back = false): FxUse[] => list.map(([x, y, f]) => fx('crow', 0, [x, y], { ...(f ? { flip: true } : {}), ...(back ? { back: true } : {}) }))
const feathers = (f: number, at: XY): FxUse => fx('feathers', f, at)
// the flock off his cloak, across the arena, and round the post
const SCATTER: readonly (readonly Crow[])[] = [
  [[24, 16], [26, 9], [23, 22]],
  [[21, 13], [22, 6], [20, 21]],
  [[18, 11], [19, 5], [17, 19]],
  [[15, 10], [15, 5], [14, 18]],
]
const MOB: readonly (readonly Crow[])[] = [
  [[4, 12], [17, 9, true], [15, 19]],
  [[5, 19], [12, 8], [18, 14, true]],
  [[16, 11, true], [4, 14], [8, 21]],
  [[14, 20, true], [6, 9], [17, 12]],
]
// where they gather into him: a copy of him at the post, out of the crows
// that mob it, clear of him (its head never reaches his): crouched where
// they settle, then lunging its fist through the post, low, its head
// carried forward off his. Half made of crows as it forms and as it goes
// (a ghost in the crows' sheen).
const CLONE_X = 15
const LUNGE_X = 17
const CLONE_CHEST: XY = [CLONE_X - 3, 16]
const SHEEN = 0x6e6e9c
const GATHER: readonly (readonly Crow[])[] = [
  [[8, 9, true], [16, 18, true], [5, 15, true]],
  [[11, 11, true], [17, 15, true], [9, 17, true]],
]
const clone = (pose: string, o: Partial<CloneCel> = {}): CloneCel[] => [{ pose, x: CLONE_X, awake: true, eyes: 'mk', ...o }]
// the flock off into the sky
const AWAY: readonly (readonly Crow[])[] = [
  [[13, 11], [20, 9, true], [9, 16]],
  [[8, 5], [24, 3, true], [4, 10]],
  [[3, 0], [29, -3, true], [-1, 4]],
]
const hitStar = (f: number): FxUse => fx('impact', f, 'post', { pal: 'hit' })
// the feathers burst off his cloak behind him, at his side (never over his face)
const OFF_CLOAK: XY = [25, 17]

// His body through it: the seals quick; THE KEY POSE, the arms flung wide
// as the crows burst off his cloak, his weight back; a step in after them,
// an arm thrown out to drive them on (the camera jolted as they break on the
// post); a seal as they settle into his shape; and he steps back to watch
// the copy strike, a hand at his chin (the blow jolted too), then the arms
// fold as it comes apart.
const crowCloneCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign3', { hdy: 1 }), K('sign3')]),
  // arms flung wide, the crows burst off his cloak and stream at the post:
  // the burst rocks him back a pixel (no sink: stoic)
  c(1, 'scatter', K('spread', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand', fx: [fx('feathers', 0, OFF_CLOAK, { back: true }), ...crows(SCATTER[0]!)] }),
  c(1, 'scatter', K('spread', sh({ x: HOME + 1 })), { post: 'stand', fx: [fx('feathers', 1, OFF_CLOAK, { back: true }), ...crows(SCATTER[1]!)] }),
  c(1, 'scatter', K('spreadWind', sh({ x: HOME + 1 })), { post: 'stand', fx: [fx('feathers', 2, OFF_CLOAK, { back: true }), ...crows(SCATTER[2]!)] }),
  c(1, 'scatter', K('spreadWind', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand', fx: crows(SCATTER[3]!) }),
  c(1, 'scatter', K('spread', sh({ x: HOME + 1 })), { post: 'stand', fx: crows(SCATTER[3]!.map(([x, y, f]) => [x - 3, y, f] as const)) }),
  // the murder breaks over the post (its first beat held two frames, as a
  // blow's is, the camera jolted), wheeling round it; he steps in after
  // them, an arm thrown out to drive them on
  c(2, 'impact', K('strike', sh(turn({ x: HOME - 1, hdy: 1 }))), { post: 'lean', pdx: -1, fx: [feathers(0, [10, 16]), ...crows(MOB[0]!)], shake: [-1, 0] }),
  c(1, 'impact', K('strike', sh(turn({ x: HOME - 1 }))), { post: 'stand', pdx: 1, fx: [feathers(1, [10, 16]), ...crows(MOB[1]!)], shake: [1, 0] }),
  c(2, 'impact', K('strikeWind', sh(turn({ x: HOME - 1 }))), { post: 'lean', fx: crows(MOB[2]!) }),
  c(1, 'impact', K('strike', sh(turn({ x: HOME - 1, hdy: 1 }))), { post: 'stand', fx: crows(MOB[3]!) }),
  c(1, 'impact', K('strikeWind', sh(turn({ x: HOME - 1 }))), { post: 'lean', fx: crows(MOB[0]!) }),
  // a seal, and they settle into his shape at the post: crows, then a copy
  // of him half made of them, then whole
  c(1, 'gather', K('sign2', sh({ hdy: 1 })), { post: 'stand', fx: crows(GATHER[0]!) }),
  c(1, 'gather', K('sign2', sh()), { post: 'stand', fx: [...crows(GATHER[1]!), feathers(0, CLONE_CHEST)] }),
  c(1, 'gather', K('sign2Wind', sh()), { post: 'stand', clones: clone('crouch', { ghost: SHEEN }), fx: [feathers(1, CLONE_CHEST), ...crows([[CLONE_X - 6, 12, true], [CLONE_X + 3, 17, true]])] }),
  c(3, 'gather', K('sign2Wind', sh()), { post: 'stand', clones: clone('crouch'), fx: [feathers(2, CLONE_CHEST), ...crows([[CLONE_X - 9, 9, true]])] }),
  // the copy drives its fist through the post, low (the camera jolted); he
  // steps back from it to watch, a hand at his chin
  c(1, 'hit', K('think', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand', clones: clone('dash', { x: LUNGE_X + 2 }), fx: [fx('streak', 0, [LUNGE_X - 8, 19], { pal: 'hit' })] }),
  c(2, 'hit', K('think', sh({ x: HOME + 1 })), { post: 'lean', clones: clone('follow', { x: LUNGE_X }), fx: [hitStar(0)], flash: 'post', shake: [-1, 0] }),
  c(1, 'hit', K('think', sh({ x: HOME + 1 })), { post: 'stand', pdx: -1, clones: clone('follow', { x: LUNGE_X }), fx: [hitStar(1)], shake: [1, 0] }),
  c(1, 'hit', K('thinkWind', sh({ x: HOME + 1 })), { post: 'stand', pdx: 1, clones: clone('follow', { x: LUNGE_X }), fx: [hitStar(2)] }),
  c(1, 'hit', K('think', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand', clones: clone('follow', { x: LUNGE_X }), fx: [hitStar(3)] }),
  c(1, 'hit', K('think', sh({ x: HOME + 1 })), { post: 'stand', clones: clone('follow', { x: LUNGE_X }) }),
  // and comes apart into crows that flap away into the sky
  c(1, 'vanish', K('thinkWind', sh({ x: HOME + 1 })), { post: 'stand', clones: clone('follow', { x: LUNGE_X, ghost: SHEEN }), fx: [feathers(0, CLONE_CHEST), ...crows(AWAY[0]!)] }),
  c(1, 'vanish', K('crossed', sh()), { post: 'stand', fx: [feathers(1, CLONE_CHEST), ...crows(AWAY[1]!)] }),
  c(1, 'vanish', K('crossedWind', sh()), { post: 'stand', fx: [feathers(2, CLONE_CHEST), ...crows(AWAY[2]!)] }),
  c(1, 'vanish', K('crossed'), { post: 'stand', fx: [feathers(3, CLONE_CHEST)] }),
  c(1, 'vanish', K('crossed', { hdy: 1 }), { post: 'stand', fx: [feathers(3, [CLONE_CHEST[0], CLONE_CHEST[1] + 2])] }),
  c(1, 'recover', K('crossed', { eyes: 'left', hdy: 1 }), { post: 'stand' }),
  c(1, 'recover', K('crossedWind', { eyes: 'left' }), { post: 'stand' }),
  ...postOut('recover', settle([K('crossed', { eyes: 'left' })])),
]

// ------------------------------------------------------------------ Amaterasu (4.8 s)

// Black flames up the post (anchor its foot): they erupt out of the ground
// (`sink` lifting them up), burn, and sink back when he shuts the eye.
const flames = (sink = 0, f: number | 'cycle' = 'cycle'): FxUse => fx('amaterasu', f, AT.postBase, sink ? { sink } : {})

// His body through it: the stare quick, two fingers to the bleeding eye
// and his weight drawn back; THE KEY POSE as the black fire erupts: leaned
// in over it, low, the head thrust at it and the hand swept down at the
// flames (the post lit, the camera jolted; no recoil, the head nods); a fist
// closed on it a step further in as it burns higher; the fingers back to the
// eye as he gives it a pixel; and the fire goes out as the eye shuts.
const amaterasuCels: Cel[] = [
  ...postIn('focus', [K('crossed', { eyes: 'left' }), K('crossed', { eyes: 'shut', hdy: 1 })]),
  // the Mangekyō snaps open on the post; two fingers to the eye as it
  // bleeds, the weight drawn back a pixel
  c(1, 'stare', K('seal', sh({ x: HOME + 1, hdy: 1 })), { post: 'stand' }),
  c(2, 'stare', K('seal', sh({ x: HOME + 1, eyes: 'bleed1' })), { post: 'stand' }),
  c(2, 'stare', K('sealWind', sh({ x: HOME + 1, eyes: 'bleed2' })), { post: 'stand' }),
  c(1, 'stare', K('seal', sh({ x: HOME + 1, eyes: 'bleed3', hdy: 1 })), { post: 'stand' }),
  // the black fire erupts up the post, the post lit white a frame, the
  // camera jolted: leaned in over it, low, the hand swept down at it
  c(2, 'impact', K('follow', sh({ eyes: 'bleed3', head: 'turn', x: HOME - 1, hdy: 1 })), { post: 'scorch', fx: [flames(9, 0)], shake: [-1, 0], flash: 'post' }),
  c(1, 'impact', K('follow', sh({ eyes: 'bleed3', head: 'turn', x: HOME - 1 })), { post: 'scorch', fx: [flames(5, 1)], shake: [1, 0] }),
  c(1, 'impact', K('follow', sh({ eyes: 'bleed3', head: 'turn', x: HOME - 1 })), { post: 'scorch', fx: [flames(2, 2)] }),
  ...hold(4, 'impact', K('follow', sh({ eyes: 'bleed3', head: 'turn', x: HOME - 1 })), { post: 'scorch', fx: [flames()] }),
  // and burns higher: a fist closed on it, a step further in, the camera jolted
  c(1, 'hit2', K('punch', sh({ eyes: 'bleed3', head: 'turn', x: HOME - 2, hdy: 1 })), { post: 'scorchLean', fx: [flames()], shake: [-1, 0] }),
  ...hold(6, 'hit2', K('punch', sh({ eyes: 'bleed3', head: 'turn', x: HOME - 2 })), { post: 'scorch', fx: [flames()] }),
  // the heat off it: he gives it the step back, the fingers to the eye again
  c(1, 'hit2', K('seal', sh({ eyes: 'bleed3', hdy: 1 })), { post: 'scorchLean', fx: [flames()] }),
  ...hold(5, 'hit2', K('seal', sh({ eyes: 'bleed3' })), { post: 'scorch', fx: [flames()], phase: 2 }),
  // the eye shuts, and the fire goes out with it, sinking into the ground
  c(1, 'fade', K('crossed', { eyes: 'shut', hdy: 1 }), { post: 'scorch', fx: [flames(3)] }),
  c(1, 'fade', K('crossed', { eyes: 'shut' }), { post: 'scarred', fx: [flames(7)] }),
  c(1, 'fade', K('crossedWind', { eyes: 'shut' }), { post: 'scarred', fx: [flames(11)] }),
  c(1, 'fade', K('crossed', { eyes: 'shut' }), { post: 'scarred', fx: [fx('embers', 1, AT.postFoot)] }),
  c(1, 'fade', K('crossed', { eyes: 'shut', hdy: 1 }), { post: 'scarred', fx: [fx('embers', 2, AT.postFoot)] }),
  c(1, 'recover', K('crossed', { eyes: 'left' }), { post: 'scarred', fx: [fx('embers', 3, AT.postFoot)] }),
  c(1, 'recover', K('crossedWind', { eyes: 'left' }), { post: 'scarred', fx: [fx('embers', 3, AT.postFoot)] }),
  ...postOut('recover', settle([K('crossed', { eyes: 'left' })]), 'scarred'),
]

// ------------------------------------------------------------------ Phoenix Flower (1.8 s)

// Three shuriken of fire flung from the hand, high, middle and low, each a
// frame behind the last, spinning (the family's frames in turn), into the post.
const LANES: readonly XY[] = [
  [-3, -5],
  [-2, -1],
  [-1, 3],
]
// a shuriken's place on its flight: 0 at the hand, 3 in the post
const FLIGHT = [20, 16, 12]
const shuriken = (lane: number, step: number): FxUse[] => {
  const x = FLIGHT[step]
  if (x === undefined) return []
  const [, dy] = LANES[lane]!
  return [fx('phoenix', (step + lane) % 4, [x, POST_HIT[1] + dy + (step === 0 ? 1 : 0)])]
}
// the fan: shuriken i leaves at frame i
const fan = (frame: number): FxUse[] => [0, 1, 2].flatMap(i => shuriken(i, frame - i))
const burst = (lane: number, f: number): FxUse => fx('impact', f, [POST_HIT[0], POST_HIT[1] + LANES[lane]![1]], { pal: 'fire' })

// Stoic and ranged (the recoil on the release: the kick of the throw, never
// the shuriken landing 13 px off): the tiger seal, the weight onto the back
// foot, the arm drawn back low, the sidearm fling with a small step, the head turned after
// it, then planted, the arm following through, as they burst on the post
// (its hit a single jolt).
const phoenixCels: Cel[] = [
  ...postIn('ready', [K('sign1', { hdy: 1 }), K('sign1')]),
  ...cast({
    weight: 'stoic',
    recoil: 'release',
    k: { eyes: 'focus' },
    gather: { pose: 'charge' },
    release: { tag: 'throw', pose: ['strike', 'strike', 'strikeWind'], k: turn(), o: i => (i === 0 ? { shout: true } : {}), fx: i => fan(i) },
    impact: {
      n: 4,
      pose: 'follow',
      k: i => turn(i === 3 ? { hdy: 1 } : {}),
      o: i => ({ post: i === 2 ? 'stand' : i === 3 ? 'scorch' : 'lean', ...(i === 0 ? { flash: 'post' as const, shake: [-1, 0] as XY } : {}), ...(i === 1 ? { pdx: -1 } : i === 2 ? { pdx: 1 } : {}) }),
      fx: i => (i === 0 ? [...fan(3), burst(0, 0)] : i === 1 ? [...fan(4), burst(0, 1), burst(1, 0)] : i === 2 ? [burst(1, 1), burst(2, 0)] : [fx('burnPost', 0, AT.postFoot), burst(2, 2)]),
    },
    settle: false,
  }),
  c(1, 'recover', K('crossed', { eyes: 'left' }), { post: 'scorch', fx: [fx('burnPost', 1, AT.postFoot)] }),
  ...postOut('recover', settle([K('crossed', { eyes: 'left' })]), 'scarred', i => (i === 0 ? [fx('burnPost', 2, AT.postFoot)] : i === 1 ? [fx('scorch', 0, AT.postFoot), fx('embers', 2, AT.postFoot)] : [fx('embers', 3, AT.postFoot)])),
]

// ------------------------------------------------------------------ the cheer (1.6 s)

// Calm: a breath in with the eyes shut, the seal snapped up before his face,
// and a crow that bursts up off his far shoulder in a few feathers, over
// his hair (never over his face); he points it away across the arena, a
// step after it, the head turned to watch it go; the Sharingan glints once
// as it goes, and the arms fold as he lets the breath out.
const CHEER_CROW: readonly XY[] = [
  [43, 3],
  [39, 1],
  [33, 0],
  [27, 1],
  [21, 2],
  [15, 3],
  [9, 3],
]
const cheerCrow = (i: number): FxUse[] => {
  const at = CHEER_CROW[i]
  return at ? [fx('crow', 0, at)] : []
}
// the burst over his far shoulder, its feathers above his hair
const SHOULDER: XY = [42, 1]
const cheerCels: Cel[] = [
  c(1, 'nod', K('idle1', { eyes: 'shut', hdy: 1 })),
  c(1, 'cheer', K('seal', { eyes: 'shut', hdy: 1 })),
  c(1, 'cheer', K('seal', { eyes: 'half' }), { fx: [fx('feathers', 0, SHOULDER), ...cheerCrow(0)] }),
  c(1, 'cheer', K('seal'), { fx: [fx('feathers', 1, SHOULDER), ...cheerCrow(1)] }),
  c(2, 'cheer', K('sealWind'), { fx: [fx('feathers', 2, SHOULDER), ...cheerCrow(2)] }),
  c(1, 'cheer', K('seal'), { fx: [fx('feathers', 3, SHOULDER), ...cheerCrow(3)] }),
  // the seal opened into a point after it, a step in, the head turned; the
  // one accent: the Sharingan glints as the crow goes
  c(1, 'cheer', K('strike', turn({ x: HOME - 1, hdy: 1 })), { fx: cheerCrow(4) }),
  c(1, 'cheer', K('strikeWind', turn({ x: HOME - 1, awake: true })), { fx: cheerCrow(5) }),
  c(1, 'cheer', K('strike', turn({ x: HOME - 1, awake: true })), { fx: cheerCrow(6) }),
  c(1, 'cheer', K('crossed', { eyes: 'half', hdy: 1 })),
  c(1, 'cheer', K('crossed', { eyes: 'half' })),
  c(1, 'cheer', K('idle1', { hdy: 1 })),
  c(2, 'cheer', K('idle0')),
]

// ------------------------------------------------------------------ the builder

// His moves in his cloak as he wears it (the template with his own drawings).
export const itachiMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [
    celMove(t, { name: 'Tsukuyomi', shout: 'Tsukuyomi', on: ['shell'] }, tsukuyomiCels, EYES),
    celMove(t, { name: 'Crow Clone Jutsu', shout: 'Crow Clone', on: ['agent'] }, crowCloneCels, EYES),
    celMove(t, { name: 'Amaterasu', shout: 'Amaterasu' }, amaterasuCels, EYES),
  ],
  quick: celMove(t, { name: 'Fire Style: Phoenix Flower Jutsu', shout: 'Phoenix Flower', on: ['edit'], quick: true, dojutsu: false }, phoenixCels),
  cheer: celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels),
})
