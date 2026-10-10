// Kisame's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them). Big, toothy and wet: everything he throws is water with a
// shark in it. Built on his cloak as he wears it (ninja/kisame.ts: the
// template with Samehada's heft and chop drawn in); his blows turn his head
// on the post, and his long holds stir (the cloak's `<pose>Wind` drawings, a
// spike of his fin bent back). His weight is HEAVY (kit.ts's cast weights):
// a deep sink held, a lean held past the mark, a big recoil sliding back in
// dust, home a column a frame. Each jutsu has its own key pose: the palm
// thrust with his shoulder behind it (Shark Bullet), the blade bitten down
// and levered in (Samehada), both arms raised as the sea swells (Shark Dance).
//   Shark Bullet     water spun up in the palm, loosed as a shark that
//                    leaps the arena and bites the post in a burst of spray
//   Samehada         the blade hauled off his back with a grin, a leap, and
//                    it comes down on the post and chews: two heavy grinds
//                    (bitten down, levered in), a drag back out of the wood
//                    in dust, and the blade hoisted with the post's chakra
//   Shark Dance      a prison of water swells round the post, little sharks
//                    circling inside it, and the great shark tears into it
//                    from three sides at his command until it bursts
//   Five Feeding     (the quick strike) five little water-sharks out of the
//   Sharks           palm one after another, biting the post in spray

import { celMove } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { HOME, POST_HIT, STRIKE } from '../stage.ts'
import type { Anchor, Cel, CelMove, FxUse, NinjaCel, Template, XY } from '../types.ts'
import { K, c, cast, dustAt, fx, hold, hopHome, postIn, postOut } from './kit.ts'

// water chakra round him (the aura in the sea's colours)
const sea = (low = false): FxUse => fx(low ? 'auraLow' : 'aura', 'cycle', 'feet', { back: true, pal: 'water' })
// the shark (the summon sprite, 18 x 12, facing left; its anchor its belly)
// and the wake curling off its tail
const shark = (x: number, y: number, flip = false): FxUse[] => [fx('sharkWake', 'cycle', [flip ? x - 8 : x + 8, y - 4], { back: true, ...(flip ? { flip: true } : {}) }), fx('shark', 0, [x, y], flip ? { flip: true } : {})]
const splash = (f: number, at: Anchor = 'post'): FxUse => fx('splash', f, at)
const foam = (f: number | 'cycle' = 'cycle'): FxUse => fx('foam', f, AT.postBase)
// the head turned three-quarters to the post, for a blow
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', eyes: 'focus', ...o })
// the last of every move: the breath let out, and standing
const settle = (last: readonly NinjaCel[] = []): NinjaCel[] => [...last, K('idle1', { hdy: 1, eyes: 'smug' }), K('idle0', { eyes: 'smug' }), K('idle0')]

// ------------------------------------------------------------------ Shark Bullet (4.9 s)

// the shark's leap out of the palm, frame by frame: clear of the hand, up
// over the arena, jaws first onto the post
const LEAP: readonly XY[] = [
  [19, 20],
  [16, 15],
  [13, 13],
]
const sharkBulletCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign1', { hdx: -1 }), K('sign2', { hdy: 1 }), K('sign2')]),
  c(1, 'signs', K('sign3', { hdy: 1 }), { post: 'stand' }),
  c(2, 'signs', K('sign3'), { post: 'stand' }),
  // heavy and ranged: the sea drawn into the palm, his weight sunk back and
  // down under it (held), wound back low with the grin; THE KEY POSE, the
  // palm thrust with his shoulder behind it, a lean past the mark, and the
  // shark bursts out of it, its kick throwing him back sliding in dust; then
  // planted while it leaps the arena and bites the post (camera shaken)
  ...cast({
    weight: 'heavy',
    recoil: 'release',
    // a column in from home, so the kick that throws him back keeps his head on the stage
    at: HOME - 1,
    k: { eyes: 'focus' },
    gather: {
      n: 7,
      pose: ['charge', 'charge', 'charge', 'chargeWind', 'charge', 'charge', 'chargeWind'],
      k: i => (i >= 5 ? { eyes: 'smug' } : {}),
      fx: i => [sea(i < 2), ...(i < 2 ? [splash(3 - i, 'hand')] : [fx('waterBullet', 'cycle', 'hand', { d: [-1, 0] })])],
    },
    release: { pose: ['strike', 'strike', 'strikeWind'], k: turn(), o: i => (i === 0 ? { shout: true } : {}), fx: i => [...(i < 2 ? [splash(i, 'hand')] : []), ...shark(...LEAP[i]!)] },
    impact: {
      n: 6,
      pose: ['strike', 'strike', 'strikeWind', 'follow', 'follow', 'follow'],
      // (held a column in after the jolt, so the shake never rocks him back and forth)
      k: i => turn(i === 2 ? { x: HOME + 1 } : i === 4 ? { hdy: 1 } : i === 5 ? { eyes: 'smug' } : {}),
      o: i => ({ post: i < 2 ? 'lean' : 'stand', ...(i === 0 ? { flash: 'post' as const, shake: [-1, 0] as XY } : i === 1 ? { pdx: -1, shake: [-1, 0] as XY } : i === 2 ? { pdx: 1 } : {}) }),
      fx: i => (i === 0 ? [...shark(11, 16), splash(0)] : [splash(Math.min(3, i)), foam(Math.min(3, i - 1))]),
    },
    settle: false,
  }),
  // a yank back, low, and both fists shoved out after it with a step: a
  // second shark out of the water bites again
  c(2, 'hit2', K('windup', { eyes: 'focus', dy: 1 }), { post: 'stand', fx: [foam(3), splash(3, 'hand')] }),
  c(1, 'hit2', K('punch', turn({ x: HOME - 1 })), { post: 'stand', fx: [foam(3), splash(0, 'hand'), ...shark(17, 20)] }),
  c(2, 'hit2', K('punch', turn({ x: HOME - 1, hdx: -1 })), { post: 'lean', fx: [foam(0), ...shark(12, 19), splash(0, [POST_HIT[0], POST_HIT[1] + 2])], shake: [-1, 0] }),
  c(1, 'hit2', K('punch', turn({ x: HOME })), { post: 'stand', pdx: -1, fx: [foam(1), splash(1, [POST_HIT[0], POST_HIT[1] + 2])], shake: [1, 0] }),
  c(2, 'hit2', K('strikeWind', turn({ x: HOME + 1, eyes: 'smug' })), { post: 'stand', fx: [foam(2), splash(2, [POST_HIT[0], POST_HIT[1] + 2])] }),
  // pleased with it: that grin, the arms folded
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'stand', fx: [foam(3)] }),
  ...hold(3, 'recover', K('crossed', { eyes: 'smug' }), { post: 'stand', phase: 2 }),
  ...postOut('recover', settle([K('crossed', { eyes: 'smug' })])),
]

// ------------------------------------------------------------------ Samehada (5.0 s)

// where he lands his chop: the blade's head on the post
const CHEW_X = STRIKE - 1
const chips = (f: number): FxUse => fx('dust', f, [POST_HIT[0] + 1, POST_HIT[1] + 3])
// the post's chakra drunk up the blade: sparks in the sea's colours at the
// bite, and a pull of light streaming back along it to his hands
const drink = (f: number): FxUse[] => [fx('sparks', f, [POST_HIT[0] + 2, POST_HIT[1] + 3], { pal: 'water' }), fx('bansho', 'cycle', [POST_HIT[0] + 3, POST_HIT[1] + 3], { back: true, pal: 'water', phase: f })]
// splinters torn off the post as the blade is dragged back out of it
const splinters = (f: number): FxUse => fx('dust', f, [POST_HIT[0] + 3, POST_HIT[1] + 1])
const chomp = (o: { pdx?: number } = {}): FxUse[] => [fx('impact', 0, [POST_HIT[0] + 1 + (o.pdx ?? 0), POST_HIT[1] + 3], { pal: 'water' })]

// Heavy: hauled off his back and sunk under its weight; the leap; it bites
// (held, the camera shaken); two heavy grinds, each a real change of pose
// (bitten down into the post's foot and leaned on, rocked back onto the
// chop, then levered in harder, deeper), the wood shaved off in chips and
// its chakra drunk up the blade; a drag back out of it, wrenched up and
// sliding back in dust with the splinters flying; and the held finish, the
// blade hoisted upright full of the post's chakra with a thump; a heavy hop home.
const samehadaCels: Cel[] = [
  // a hand back over the shoulder for the hilt as the post poofs in
  ...postIn('ready', [K('cheer', { eyes: 'smug', hdy: 1 }), K('cheer', { eyes: 'smug' })]),
  c(2, 'grip', K('cheer2', { eyes: 'smug' }), { post: 'stand' }),
  // hauled off his back and up at his side: its weight sinks him (a thump)
  c(1, 'grip', K('heft', { eyes: 'smug', x: HOME + 1, dy: 1, hdy: 1 }), { post: 'stand', fx: [dustAt(0, HOME - 3)], shake: [0, 1] }),
  c(1, 'grip', K('heft', { eyes: 'smug', x: HOME + 1, dy: 1 }), { post: 'stand', fx: [dustAt(1, HOME - 3), fx('sparks', 1, [HOME - 11, 4], { pal: 'water' })] }),
  c(1, 'grip', K('heftWind', { eyes: 'focus', x: HOME + 2, dy: 1, hdy: 1 }), { post: 'stand' }),
  // the leap, and down on the post with the blade
  c(1, 'leap', K('heft', { x: 32, lift: 3, eyes: 'focus' }), { post: 'stand', shout: true, fx: [dustAt(0, HOME)] }),
  c(1, 'leap', K('heft', { x: 29, lift: 5, eyes: 'focus', clip: 3 }), { post: 'stand', fx: [dustAt(1, HOME)] }),
  c(1, 'swing', K('heft', { x: 27, lift: 2, eyes: 'focus' }), { post: 'stand', fx: [fx('streak', 0, [16, 12], { pal: 'water' })] }),
  // it bites: held, the post lit, the camera shaken
  c(2, 'impact', K('chop', turn({ x: CHEW_X, hdy: 1 })), { post: 'lean', pdx: -1, fx: [...chomp({ pdx: -1 }), chips(0)], shake: [-1, 1], flash: 'post' }),
  // the first grind: bitten down into the post's foot and leaned on
  c(1, 'hit2', K('grind', turn({ x: CHEW_X - 1, hdy: 1 })), { post: 'scorchLean', pdx: -2, fx: [chips(1), ...drink(0)], shake: [1, 0] }),
  c(1, 'hit2', K('grind', turn({ x: CHEW_X - 1 })), { post: 'scorchLean', pdx: -1, fx: [chips(2), ...drink(1)] }),
  // rocked back onto the chop, the scales chewing
  c(1, 'hit2', K('chop', turn({ x: CHEW_X, hdx: 1 })), { post: 'scorch', pdx: -1, fx: drink(2) }),
  c(1, 'hit2', K('chopWind', turn({ x: CHEW_X, eyes: 'smug' })), { post: 'scorch', fx: [chips(0)] }),
  // the second: levered in harder, a pixel deeper (the camera shaken)
  c(1, 'hit3', K('grind', turn({ x: CHEW_X - 2, hdy: 1 })), { post: 'scorchLean', pdx: -3, fx: [...chomp({ pdx: -2 }), chips(0), ...drink(0)], shake: [-1, 0] }),
  c(1, 'hit3', K('grind', turn({ x: CHEW_X - 2 })), { post: 'scorchLean', pdx: -2, fx: [chips(1), ...drink(1)], shake: [1, 0] }),
  // the drag back: wrenched up and out of the wood, sliding back in dust
  c(1, 'drag', K('drag', turn({ x: CHEW_X + 1, hdy: 1 })), { post: 'scorchLean', pdx: -1, fx: [splinters(0), chips(2), dustAt(0, CHEW_X + 4)] }),
  c(1, 'drag', K('drag', turn({ x: CHEW_X + 3 })), { post: 'scorch', pdx: 1, fx: [splinters(1), dustAt(1, CHEW_X + 5)] }),
  c(1, 'drag', K('drag', turn({ x: CHEW_X + 5, eyes: 'smug' })), { post: 'scarred', fx: [splinters(2), dustAt(2, CHEW_X + 7)] }),
  // the held finish: hoisted upright full of the post's chakra, a thump
  c(2, 'finish', K('heft', { x: CHEW_X + 5, dy: 1, hdy: 1, eyes: 'smug' }), { post: 'scarred', fx: [fx('sparks', 0, [CHEW_X - 6, 6], { pal: 'water' })], shake: [0, 1] }),
  c(1, 'finish', K('heft', { x: CHEW_X + 5, eyes: 'happy' }), { post: 'scarred', fx: [fx('sparks', 1, [CHEW_X - 6, 5], { pal: 'water' })], shake: [1, 0] }),
  c(2, 'finish', K('heftWind', { x: CHEW_X + 5, eyes: 'happy' }), { post: 'scarred', fx: [fx('sparks', 2, [CHEW_X - 6, 4], { pal: 'water' })] }),
  c(1, 'finish', K('heft', { x: CHEW_X + 5, eyes: 'smug', hdy: 1 }), { post: 'scarred' }),
  // slung back on, and a heavy hop home
  ...hopHome('back', CHEW_X + 5, 'scarred', { eyes: 'smug' }, 2, 'jump', { style: 'heavy' }),
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'scarred' }),
  c(1, 'recover', K('crossedWind', { eyes: 'smug' }), { post: 'scarred' }),
  ...postOut('recover', settle([K('crossed', { eyes: 'smug' })]), 'scarred'),
]

// ------------------------------------------------------------------ Water Prison Shark Dance (5.6 s)

const prison = (f: number | 'cycle' = 'cycle'): FxUse => fx('waterPrison', f, AT.postBase)
const forming = (f: number): FxUse => fx('waterPrisonForm', f, AT.postBase)
// two little sharks circling inside the sphere, round and round
const RING: readonly XY[] = [
  [6, 15],
  [9, 13],
  [13, 15],
  [14, 18],
  [11, 21],
  [7, 20],
]
const circling = (t: number): FxUse[] =>
  [0, 3].map(o => {
    const [x, y] = RING[(t + o) % RING.length]!
    // facing the way it swims: left along the top, right along the bottom
    return fx('miniShark', (t + o) % 3, [x, y], (t + o) % RING.length >= 3 ? { flip: true } : {})
  })
// the great shark lunging in from a side (facing right when it comes from the left)
const lunge = (x: number, y: number, flip = false): FxUse[] => shark(x, y, flip)
const bite = (f: number, at: XY): FxUse[] => [splash(f, at), ...(f === 0 ? [fx('impact', 1, at, { pal: 'water' })] : [])]

// Heavy: THE KEY POSE, both arms thrown up as the sea swells round the
// post, a step in; drawn in, sunk back and down, as it shuts; the great shark
// sent in with his arms flung wide; and it bites at his command from three
// sides, a new blow each (a fist shoved out, a fist driven down, a palm
// thrust round the far side), each camera-shaken; a low sweep of the arm and
// the prison bursts.
const sharkDanceCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2')]),
  c(1, 'signs', K('sign3', { hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign3'), { post: 'stand' }),
  // the sea swells round the post into a sphere: both arms thrown up, a step in
  c(1, 'flood', K('raise', { eyes: 'smug', x: HOME - 1, hdy: 1 }), { post: 'stand', fx: [sea(true), foam(0)] }),
  c(2, 'flood', K('raise', { eyes: 'smug', x: HOME - 1 }), { post: 'stand', fx: [sea(true), foam(1), forming(0)] }),
  c(1, 'flood', K('raiseWind', { eyes: 'smug', x: HOME - 1 }), { post: 'stand', fx: [sea(), foam(2), forming(1)] }),
  // shut in it, little sharks circling inside: drawn in, sunk back and down
  c(1, 'flood', K('gather', { eyes: 'smug', x: HOME + 1, dy: 1 }), { post: 'stand', fx: [sea(), prison(), ...circling(0)] }),
  ...hold(4, 'flood', K('gather', { eyes: 'smug', x: HOME + 2, dy: 1, hdy: 1 }), i => ({ post: 'stand', pdx: i % 2, fx: [sea(), prison(), ...circling(i + 1)] })),
  // the great shark sent in, his arms flung wide: it circles the sphere
  c(2, 'release', K('spread', { eyes: 'smug', hdy: 1 }), { post: 'stand', fx: [sea(), ...lunge(4, 13, true), prison(), ...circling(5)] }),
  c(2, 'release', K('spreadWind', { eyes: 'smug' }), { post: 'stand', fx: [sea(), ...lunge(17, 10), prison(), ...circling(7)] }),
  // it bites from the right at a fist shoved out, a lean past the mark
  c(2, 'impact', K('punch', turn({ x: HOME - 2 })), { post: 'lean', pdx: -1, fx: [prison(), ...lunge(17, 19), ...bite(0, [14, 17])], shake: [-1, 0], flash: 'post' }),
  c(1, 'impact', K('punch', turn({ x: HOME - 2, hdx: -1 })), { post: 'stand', pdx: 1, fx: [prison(), ...circling(8), ...bite(1, [14, 17])], shake: [1, 0] }),
  c(1, 'impact', K('punch', turn({ x: HOME - 1 })), { post: 'stand', fx: [prison(), ...circling(9), splash(2, [14, 17]), ...lunge(5, 9, true)] }),
  // from above, at a fist driven down to the ground, sunk into it
  c(2, 'hit2', K('slam', turn({ dy: 1 })), { post: 'lean', pdy: 1, fx: [prison(), ...lunge(11, 12), ...bite(0, [10, 12])], shake: [0, 1] }),
  c(1, 'hit2', K('slam', turn({ dy: 1, hdy: 1 })), { post: 'stand', pdx: 1, fx: [prison(), ...circling(11), ...bite(1, [10, 12])], shake: [1, 0] }),
  c(1, 'hit2', K('slam', turn()), { post: 'stand', fx: [prison(), ...circling(12), splash(2, [10, 12]), ...lunge(19, 13)] }),
  // from the left, round the far side: a palm thrust after it, a step in
  c(2, 'hit3', K('strike', turn({ x: HOME - 1 })), { post: 'lean', pdx: 1, fx: [prison(), ...lunge(2, 19, true), ...bite(0, [5, 17])], shake: [-1, 0] }),
  c(1, 'hit3', K('strikeWind', turn({ x: HOME - 1 })), { post: 'stand', pdx: -1, fx: [prison(), ...circling(14), ...bite(1, [5, 17])], shake: [1, 0] }),
  c(1, 'hit3', K('strike', turn({ x: HOME + 1, hdy: 1 })), { post: 'stand', fx: [prison(), ...circling(15), splash(2, [5, 17])] }),
  // a low sweep of the arm with a lunge, and the prison bursts in a sheet of spray
  c(1, 'burst', K('follow', turn({ x: HOME - 2, hdy: 1 })), { post: 'lean', fx: [splash(0, [10, 16]), foam(0)], shake: [-1, 1], flash: 'post' }),
  c(1, 'burst', K('follow', turn({ x: HOME - 2 })), { post: 'lean', fx: [splash(1, [10, 16]), splash(0, [5, 20]), splash(0, [15, 20]), foam(1)], shake: [-1, 0] }),
  c(1, 'burst', K('follow', turn({ x: HOME - 1 })), { post: 'stand', fx: [splash(2, [10, 16]), splash(1, [5, 20]), splash(1, [15, 20]), foam(2)], shake: [1, 0] }),
  c(2, 'burst', K('follow', turn({ x: HOME - 1 })), { post: 'stand', fx: [splash(3, [10, 16]), splash(2, [5, 20]), splash(2, [15, 20]), foam(3)] }),
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'stand', fx: [splash(3, [5, 20]), splash(3, [15, 20]), foam(3)] }),
  ...hold(2, 'recover', K('crossed', { eyes: 'smug' }), i => ({ post: 'stand', fx: i < 1 ? [foam(3), splash(3, [10, 21])] : [splash(3, [10, 21])] }), { phase: 2 }),
  ...postOut('recover', settle([K('crossed', { eyes: 'smug' })])),
]

// ------------------------------------------------------------------ Five Feeding Sharks (1.9 s)

// five little water-sharks out of the palm, a frame apart, high and low in
// turn, each two frames across the arena and bitten into the post in spray
const LANE = [-3, 1, -1, 3, -2]
const FLY = [19, 14]
const sharks = (frame: number): FxUse[] => {
  const out: FxUse[] = []
  for (let i = 0; i < 5; i++) {
    const at = frame - i
    const y = POST_HIT[1] + LANE[i]!
    const x = FLY[at]
    if (x !== undefined) out.push(fx('miniShark', (frame + i) % 3, [x, y]))
    if (at >= 2 && at <= 4) out.push(splash(at - 2, [POST_HIT[0] + 1, y]))
  }
  return out
}
// Heavy and ranged: wound back low and sunk, the palm flung out with his
// weight behind it, the kick of the first shark throwing him back sliding,
// then planted as they bite one after another (the first bite a single
// jolt), and home a column a frame.
const feedingCels: Cel[] = [
  ...postIn('ready', [K('sign1', { hdy: 1 }), K('sign1')]),
  ...cast({
    weight: 'heavy',
    recoil: 'release',
    at: HOME - 2,
    k: { eyes: 'smug' },
    gather: { n: 2, pose: 'charge' },
    release: { tag: 'flick', pose: ['strike', 'strike', 'strikeWind'], k: turn(), o: i => (i === 0 ? { shout: true } : {}), fx: i => [...(i === 0 ? [splash(0, 'hand')] : []), ...sharks(i)] },
    impact: {
      n: 4,
      pose: ['strike', 'strike', 'strikeWind', 'follow'],
      k: turn(),
      o: i => ({ post: i % 2 ? 'stand' : 'lean', ...(i === 0 ? { flash: 'post' as const, shake: [1, 0] as XY } : {}), ...(i % 2 ? { pdx: -1 } : {}) }),
      fx: i => [...sharks(3 + i), ...(i === 3 ? [foam(0)] : [])],
    },
    settle: { n: 3, pose: 'follow', k: i => turn(i === 0 ? { hdy: 1 } : {}), fx: i => [...sharks(7 + i), foam(1 + i)] },
  }),
  ...postOut('recover', settle([K('crossed', { eyes: 'smug' })]), 'stand', i => (i === 0 ? [foam(3)] : [])),
]

// ------------------------------------------------------------------ the cheer (1.7 s)

// Toothy and heavy, a sword heft: a hand up for the hilt, Samehada hauled off
// his back and planted beside him with a thump (sunk under it) and a grin;
// the one accent, a heft of it up and down on his grip with a glint off the
// teeth; then slung back on. (Slower and heavier than Deidara's flicky cheer;
// no folded arms.)
const GRIN: XY = [HOME + 2, 14]
const cheerCels: Cel[] = [
  c(1, 'heft', K('raise', { eyes: 'smug', hdy: 1 })),
  // hauled off and planted beside him with a step in and a thump
  c(1, 'heft', K('heft', { eyes: 'smug', x: HOME - 1, dy: 1, hdy: 1 }), { fx: [dustAt(0, HOME - 10)], shake: [0, 1] }),
  c(1, 'heft', K('heft', { eyes: 'smug', x: HOME - 1, dy: 1 }), { fx: [dustAt(1, HOME - 10)] }),
  c(1, 'heft', K('heft', { eyes: 'happy', x: HOME - 1, dy: 1 }), { fx: [fx('sparks', 0, GRIN, { pal: 'hit' })] }),
  // the heft: up on his grip, and down with a bounce, the teeth glinting
  c(1, 'cheer', K('heftWind', { eyes: 'happy', x: HOME - 1 }), { fx: [fx('sparks', 1, GRIN, { pal: 'hit' })] }),
  c(1, 'cheer', K('heft', { eyes: 'smug', x: HOME - 1, dy: 1, hdy: 1 }), { fx: [fx('sparks', 2, GRIN, { pal: 'hit' })] }),
  c(1, 'cheer', K('heft', { eyes: 'smug', x: HOME - 1, dy: 1 }), { fx: [fx('sparks', 0, GRIN, { pal: 'hit' })] }),
  // slung back on over the shoulder
  c(1, 'cheer', K('cheer2', { eyes: 'smug', hdy: 1 }), { fx: [fx('sparks', 2, GRIN, { pal: 'hit' })] }),
  c(2, 'cheer', K('cheer2', { eyes: 'smug' })),
  c(1, 'cheer', K('idle1', { eyes: 'smug', hdy: 1 })),
  c(2, 'cheer', K('idle0', { eyes: 'smug' })),
]

// ------------------------------------------------------------------ the builder

// His moves in his cloak as he wears it (the template with his own drawings).
export const kisameMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [
    celMove(t, { name: 'Water Style: Shark Bullet', shout: 'Shark Bullet', dojutsu: false, on: ['shell'] }, sharkBulletCels),
    celMove(t, { name: 'Samehada', shout: 'Samehada', dojutsu: false, on: ['edit'] }, samehadaCels),
    celMove(t, { name: 'Water Prison Shark Dance', shout: 'Shark Dance', dojutsu: false }, sharkDanceCels),
  ],
  quick: celMove(t, { name: 'Water Style: Five Feeding Sharks', shout: 'Five Feeding Sharks', on: ['edit'], quick: true, dojutsu: false }, feedingCels),
  cheer: celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels),
})
