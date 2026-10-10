// Naruto's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them): the Rasengan driven into the post at a run, Shadow Clones
// taking turns to drive it into the ground, the Rasenshuriken thrown in Sage
// Mode, the Uzumaki Barrage for an edit, and his cheer.
//
// His blows are struck with his head turned toward the post (ninja/naruto.ts's
// 'turn' head, 'turnSage' in Sage Mode); his holds stir (the template's
// `<pose>Wind` drawings, his headband's tails flapping); every move ends on
// the breath out (idle1, the head a pixel down) and two frames standing as
// the post poofs away.

import { celMove } from '../cels.ts'
import { wear } from '../dress.ts'
import { GROUND, HOME, POST_X, STRIKE } from '../stage.ts'
import { JACKET } from '../templates/jacket.ts'
import type { Cel, CloneCel, FxUse, NinjaCel, PoseGrid, PostFrame } from '../types.ts'
import { K, awake, c, dustAt, fx, hold, hopHome, leap, postIn, postOut, runIn, smokeAt } from './kit.ts'

// ------------------------------------------------------------------ his own poses

// "Go!": the near arm flung up and out at the arena, the finger pointing the
// clones in, the far fist at his side, the feet planted wide, the chin up a
// pixel. Worn into the jacket for his moves (ninja/naruto.ts wears them too);
// the stirring drawing flicks the hem out, as the template's do.
const POINT_ROWS = [
  '.oo.......................',
  'oSSoo.....................',
  '.oSKKo....................',
  '..oKKCo...................',
  '...ooCBo..................',
  '....onmooooooooooooo......',
  '....onmffjjhhghhjjjjjo....',
  '.....oomfjjhhghhjjxolo....',
  '.......ovvvhhghhwxxobo....',
  '.......ovvvwhghwwxxoko....',
  '.......oiiiiiiiiiieoko....',
  '......oppqqqqqqqqqrooo....',
  '.....oppppoooqqqqro.......',
  '....ouuutto...ouuutto.....',
]
// the hand held up, the knees buckling under what it holds: the body a
// pixel lower, the feet planted wide (the Rasenshuriken's weight)
const RAISE_LOW_ROWS = [
  '..........................',
  ...JACKET.poses.raise!.rows.slice(0, 21),
  '......oppppooqqqqro.......',
  '.....ouuutto..ouuutto.....',
]
export const NARUTO_POSES: Readonly<Record<string, PoseGrid>> = {
  raiseLow: { as: 'raise', head: [1, 1], eyes: 'focus', hand: [2, 6], rows: RAISE_LOW_ROWS },
  point: { as: 'raise', head: [1, 0], eyes: 'focus', hand: [1, 1], rows: POINT_ROWS },
  pointWind: { as: 'raise', head: [1, 0], eyes: 'focus', hand: [1, 1], rows: POINT_ROWS.map((r, y) => (y === 11 ? '......oppqqqqqqqqqroiieo..' : r)) },
}
// the jacket with them, for the moves' beats
const T = wear(JACKET, NARUTO_POSES)

// the head turned to the post, for a blow
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: o.awake ? 'turnSage' : 'turn', eyes: 'focus', ...o })

// the end of every move: the breath out, then standing as the post poofs away
const ending = (post: PostFrame = 'stand', o: { pdy?: number; more?: (i: number) => readonly FxUse[] } = {}): Cel[] =>
  postOut('recover', [K('idle1', { hdy: 1 }), K('idle0'), K('idle0')], post, o.more).map(cel => (o.pdy ? { ...cel, pdy: o.pdy } : cel))

// a run of cels whose first in the beat `tag` starts the shout
const shoutAt = (cels: Cel[], tag: string): Cel[] => {
  const i = cels.findIndex(cel => cel.tag === tag)
  return cels.map((cel, j) => (j === i ? { ...cel, shout: true as const } : cel))
}

// the post poofing in over the first two cels of a run (a quick strike
// launched from its first frame)
const poofIn = (cels: Cel[]): Cel[] =>
  cels.map((cel, i) => (i === 0 ? { ...cel, post: null, poof: 'in' as const, fx: [smokeAt(1), ...(cel.fx ?? [])] } : i === 1 ? { ...cel, post: 'stand' as const, poof: 'in' as const, fx: [smokeAt(3), ...(cel.fx ?? [])] } : cel))

// ------------------------------------------------------------------ Rasengan (4.6 s)

// Chakra cupped at his chest as the post poofs in; the palm thrust out, the
// other hand clamped on the wrist, and the ball spun up in it, GROWING (a
// knot, a bead, a ball; the hold stirs, the headband's tails flapping), the
// ball tugging him a pixel forward; pulled in between both palms and
// squashed down into his knees as it overcharges and churns, flinging arms
// of wind; driven out again in his lean, the head trembling; rocked back,
// two strides of smear across the ground, and the ball rammed in: frozen two
// frames (the post white). Ground in as it swells, a step in, and it BURSTS:
// a disc of white through the wood, then torn wind, the post knocked back
// and tilted, scorched, the camera jolted three frames, his arm blown back
// off it; a grin to us, the skip home, a thumbs-up.
// the ball growing in the palm (0-4), then overcharged and churning (5, 6 by turns)
const grow = (f: number, d: readonly [number, number] = [0, 0]): FxUse => fx('rasenCharge', f, 'hand', { d })
const churn = (i: number, d: readonly [number, number] = [0, 0]): FxUse => grow(5 + (i % 2), d)
const blue = (name: string, f: number | 'cycle', at: FxUse['at'], o: Partial<FxUse> = {}): FxUse => fx(name, f, at, { pal: 'rasen', ...o })
// a frame of a stirring hold whose look changes under it (a lean, a strain)
const stir = (pose: string, i: number, o: Partial<NinjaCel> = {}): NinjaCel => ({ ...K(pose, o), held: i })
// the burst: a disc of white through the wood, torn into wind (firewall.ts),
// over everything as it tears open, then behind him and the post, so the
// post shows knocked back and tilted in the wind's arcs
const burst = (f: number): FxUse => fx('rasenBurst', f, 'post', { d: [-1, 0], ...(f >= 2 ? { back: true } : {}) })
// where the blast leaves him, blown back off the post
const BLOWN = STRIKE + 1
const rasenganCels: Cel[] = [
  // the post poofs in as he brings his hands together at his chest, sunk a
  // pixel and drawn back, chakra specks gathering in them
  ...postIn('ready', [K('sign2', { x: HOME + 1, dy: 1, hdy: 1 }), K('sign2', { x: HOME + 1, dy: 1 }), K('sign2', { x: HOME + 1, dy: 1 })], i => [blue('sparks', 2 - i, 'hand')]),
  // the palm thrust out, up out of the sink, and the ball grows in it: a
  // knot, a bead turning, a ball turning; he strains at it, and the full
  // ball tugs him a pixel forward
  c(1, 'charge', stir('charge', 0, { hdy: 1 }), { post: 'stand', fx: [grow(0)] }),
  c(1, 'charge', stir('charge', 1), { post: 'stand', fx: [grow(1)] }),
  c(1, 'charge', stir('charge', 2), { post: 'stand', fx: [grow(2), blue('sparks', 1, 'hand')] }),
  c(1, 'charge', stir('charge', 3, { hdx: -1, eyes: 'focus' }), { post: 'stand', fx: [grow(3)] }),
  c(1, 'charge', stir('charge', 4, { eyes: 'focus' }), { post: 'stand', fx: [grow(4), blue('sparks', 0, 'hand')] }),
  c(1, 'charge', stir('charge', 5, { x: HOME - 1, eyes: 'focus' }), { post: 'stand', fx: [churn(0)] }),
  // the squash: pulled in between both palms, sunk into his knees, the head
  // driven down into his shoulders, the ball overcharging, churning, throwing
  // off wind; a flare of chakra round him as it peaks
  c(1, 'charge', stir('gather', 0, { dy: 1, hdy: 1, eyes: 'focus' }), { post: 'stand', fx: [churn(1), blue('sparks', 0, 'hand')] }),
  c(1, 'charge', stir('gather', 1, { dy: 1, hdy: 1, eyes: 'focus' }), { post: 'stand', fx: [churn(0)] }),
  c(1, 'charge', stir('gather', 2, { dy: 1, eyes: 'focus' }), { post: 'stand', fx: [churn(1), blue('sparks', 2, 'hand', { d: [-4, -3] })] }),
  c(1, 'charge', stir('gather', 3, { dy: 1, hdx: -1, eyes: 'focus' }), { post: 'stand', fx: [churn(0), blue('sparks', 1, 'hand', { d: [4, -2] })] }),
  c(1, 'charge', stir('gather', 4, { dy: 1, eyes: 'shut' }), { post: 'stand', flash: 'rim', fx: [churn(1), blue('sparks', 0, 'hand', { d: [-4, 2] })] }),
  c(1, 'charge', stir('gather', 5, { dy: 1, hdy: 1, eyes: 'focus' }), { post: 'stand', fx: [churn(0)] }),
  // ...and drives it out again (his own key: the lean), the far fist cocked
  // at his chest, the head trembling with the strain
  ...[
    [0, 1],
    [-1, 0],
    [0, 0],
    [-1, 1],
  ].map(([hdx, hdy], i) => c(1, 'charge', K('punch', turn({ x: HOME - 1, hdx, hdy })), { post: 'stand', fx: [churn(i)] })),
  // rocked back on his heel...
  c(1, 'charge', K('windup', turn({ x: HOME + 1, hdy: 1 })), { post: 'stand', fx: [churn(0)] }),
  c(1, 'charge', K('windup', turn({ x: HOME + 1 })), { post: 'stand', fx: [churn(1)] }),
  // ...and two strides of smear across the ground, the ball streaking ahead
  c(1, 'dash', K('dash', turn({ x: HOME - 4 })), { post: 'stand', shout: true, fx: [dustAt(0, HOME + 2), blue('streak', 0, 'hand', { d: [1, 0] }), churn(0)] }),
  c(1, 'dash', K('smear', turn({ x: STRIKE + 2 })), { post: 'stand', fx: [dustAt(1, HOME + 2), dustAt(0, HOME - 3), blue('streak', 1, 'hand', { d: [1, 0] }), churn(1)] }),
  // RAMMED IN: frozen two frames, the ball ground against the post, sparks
  // spat off the wood above and below it
  c(1, 'impact', K('strike', turn({ x: STRIKE })), { post: 'lean', pdx: -1, flash: 'post', fx: [dustAt(2, HOME - 3), fx('giantRasengan', 0, 'hand', { d: [-1, 0] }), blue('sparks', 0, 'post', { d: [1, -4] })] }),
  c(1, 'impact', K('strike', turn({ x: STRIKE })), { post: 'lean', pdx: -1, fx: [fx('giantRasengan', 0, 'hand', { d: [-1, 0] }), blue('sparks', 1, 'post', { d: [1, 4] })] }),
  // ground into the wood, swelling; he drives in after it a step
  c(1, 'impact', K('strike', turn({ x: STRIKE - 1 })), { post: 'lean', pdx: -2, fx: [fx('giantRasengan', 1, 'hand', { d: [-1, 0] }), blue('sparks', 0, 'post', { d: [0, -5] })] }),
  c(1, 'impact', K('strike', turn({ x: STRIKE - 1, hdy: 1 })), { post: 'lean', pdx: -2, fx: [fx('giantRasengan', 2, 'hand', { d: [-1, 0] }), blue('sparks', 1, 'post', { d: [0, 5] })] }),
  // THE BURST: white through the wood, the post knocked back and tilted,
  // the stage jolted three frames; his arm blown back off it
  c(1, 'impact', K('strike', turn({ x: STRIKE - 1, eyes: 'shut' })), { post: 'scorchLean', pdx: -3, flash: 'post', shake: [-2, 0], fx: [burst(0)] }),
  c(1, 'impact', K('follow', turn({ x: BLOWN - 1, hdx: 1 })), { post: 'scorchLean', pdx: -3, shake: [2, 0], fx: [burst(1), fx('rasenganHit', 1, 'post')] }),
  c(1, 'impact', K('follow', turn({ x: BLOWN })), { post: 'scorchLean', pdx: -2, shake: [-1, 0], fx: [burst(2), blue('breakup', 0, 'post', { d: [3, -2] })] }),
  c(1, 'impact', K('follow', turn({ x: BLOWN, hdy: 1 })), { post: 'scarred', pdx: -1, fx: [burst(3), blue('breakup', 1, 'post', { d: [3, -2] })] }),
  // the post rocks home past upright; the head turned from the wreck to us on a grin
  c(1, 'impact', K('follow', { x: BLOWN, eyes: 'grin', hdx: 1 }), { post: 'scarred', pdx: 1, fx: [fx('rasenganHit', 2, 'post'), blue('breakup', 1, 'post', { d: [5, -4] })] }),
  c(1, 'impact', K('follow', { x: BLOWN, eyes: 'grin', hdx: 1, hdy: 1 }), { post: 'scarred', fx: [fx('rasenganHit', 3, 'post')] }),
  c(2, 'impact', K('follow', { x: BLOWN, eyes: 'grin', hdx: 1 }), { post: 'scarred' }),
  // a light skip home, and the landing
  ...hopHome('back', BLOWN, 'scarred', {}, 2, 'jump', { style: 'skip' }),
  // home: a thumbs-up and a grin, the breath out, the post poofs away
  c(1, 'recover', K('thumbs', { eyes: 'grin', hdy: 1 }), { post: 'scarred' }),
  c(2, 'recover', K('thumbs', { eyes: 'grin' }), { post: 'scarred' }),
  ...ending('scarred'),
]
export const RASENGAN = celMove(JACKET, { name: 'Rasengan', shout: 'Rasengan', dojutsu: false, on: ['shell'] }, rasenganCels)

// ------------------------------------------------------------------ Shadow Clone Jutsu (4.2 s)

// The clone seal held as the post poofs in; "Shadow Clone Jutsu!", the seal
// flung open, and a bank of smoke bursts across the arena. A clone crouches
// low in it grinning, Naruto's arms folded; he throws his arm out at the
// post ("Go!") and stands back to let them through, and three clones go at
// it one after another, never two at once, each a blow of its own: a flying
// kick into the post's head, a slide that sweeps its foot out of the ground
// (the post knocked up off it and dropping back), and a punch dropped on it
// out of the air, the big one (the post white, the stage jolted three
// frames). Each blow's star sits on the wood where the foot or the fist
// meets it, never on a clone's face. Each clone pops in out of a puff
// behind it and goes up in one where it stopped, the smoke kept behind it
// and low on the ground, thinning over two frames. They run in in front of
// him, behind him in depth (his head over the backs of theirs, never their
// faces); he pumps a fist after each blow, points the next one in, and
// throws both fists up as the last lands.
// where the clones come out of the smoke, on the ground before the post (the
// quick strike's clone drops in near it too)
const GATE = HOME - 22
const cloud = (f: number, at: readonly [number, number]): FxUse => fx('smoke', f, at)
// the bank of smoke: a cloud at the gate and another over the post's far
// side (behind the clone once one crouches in it)
const bank = (f: number, g = f, back = false): FxUse[] => [fx('smoke', g, [GATE - 8, GROUND], { back }), fx('smoke', f, [GATE + 1, GROUND], { back })]
// Naruto in the seal, stirring: frame i of the hold
const seal = (i: number, o: Partial<NinjaCel> = {}): NinjaCel => ({ ...K('sign3', o), held: i })
// where a clone's blow lands from: its foot or fist on the post's near face
const AT = POST_X + 15
// Naruto stood back out of their way through the rush (his head over the
// backs of theirs, their faces clear of it)
const BACK = HOME + 1
// a clone, behind him in depth, its head turned to the post
const clone = (x: number, pose: string, o: Partial<CloneCel> = {}): CloneCel => ({ x, pose, head: 'turn', eyes: 'focus', z: -1, ...o })
// the star on the wood where a blow lands, at the blow's height (its white
// heart on the post, its rays short of the clone's face)
const star = (f: number, y: number): FxUse => fx('impact', f, [POST_X, y], { pal: 'hit' })
// a clone's puff, behind it (and behind him): on the ground at column x,
// or in the air, its foot at [x, y]; frame 1 the cloud the clone pops in or
// out of, 2 its ring, 3 and 4 thinning away
const puff = (f: number, x: number, y: number = GROUND): FxUse => fx('smoke', f, [x, y], { back: true })
// the blows' heights: the kick in the post's head, the slide at its foot,
// the punch at its rope
const HIGH = 15
const LOW = 21
const MID = 16
// Naruto through the rush, from frame t on: a pose, a look
const boss = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => K(pose, { x: BACK, ...o })
const clonesCels: Cel[] = [
  // the seal as the post poofs in, stirring
  ...postIn('signs', [seal(0, { hdy: 1 }), seal(1), seal(2), seal(3)]),
  c(1, 'signs', seal(4), { post: 'stand' }),
  c(1, 'signs', seal(5), { post: 'stand' }),
  c(1, 'signs', seal(6), { post: 'stand' }),
  // POOF: the seal flung open, a bank of smoke across the arena
  c(1, 'poof', { ...K('spread', { hdy: 1, eyes: 'go' }), held: 0 }, { post: 'stand', fx: bank(0), shout: true }),
  c(1, 'poof', { ...K('spread', { eyes: 'go' }), held: 1 }, { post: 'stand', fx: bank(1, 0) }),
  c(1, 'poof', { ...K('spread', { eyes: 'go' }), held: 2 }, { post: 'stand', fx: bank(1) }),
  // a clone crouched low in it, grinning (its head under his); he folds his arms, pleased
  c(1, 'poof', K('crossed', { eyes: 'happy', hdy: 1 }), { post: 'stand', clones: [clone(GATE + 10, 'crouch', { head: undefined, dy: 3, eyes: 'grin' })], fx: bank(2) }),
  c(1, 'poof', K('crossed', { eyes: 'happy' }), { post: 'stand', clones: [clone(GATE + 10, 'crouch', { head: undefined, dy: 3, eyes: 'grin' })], fx: bank(3) }),
  // "Go!": the arm thrown out at the post, a step in; the clone springs up
  // and back off the ground, tucked
  c(1, 'rush', K('point', { x: HOME - 1, eyes: 'go', hdy: 1 }), { post: 'stand', clones: [clone(GATE + 10, 'tuck', { lift: 4, clip: 3, eyes: 'shut' })], fx: [dustAt(0, GATE + 10), ...bank(4, 3)] }),
  c(1, 'rush', K('point', { x: HOME - 1, eyes: 'go' }), { post: 'stand', clones: [clone(AT - 1, 'tuck', { lift: 6, clip: 3, eyes: 'shut' })], fx: [dustAt(1, GATE + 10), ...bank(4)] }),
  // the flying kick: the foot driven into the post's head, frozen two
  // frames (the post white, rocked, the stage jolted); he stands back
  c(1, 'hit', boss('point', { eyes: 'go', hdy: 1 }), { post: 'lean', pdx: -1, flash: 'post', clones: [clone(AT, 'kick', { lift: 4, clip: 3 })], fx: [star(0, HIGH)], shake: [0, 1] }),
  c(1, 'hit', boss('point', { eyes: 'go' }), { post: 'lean', pdx: -1, clones: [clone(AT, 'kick', { lift: 4, clip: 3 })], fx: [star(1, HIGH)] }),
  // it bounces back off the wood, tucked, and goes up in its puff; he pumps a fist
  c(1, 'rush', boss('raise', { eyes: 'happy', hdy: 1 }), { post: 'stand', pdx: 1, clones: [clone(AT - 1, 'tuck', { lift: 6, clip: 3, eyes: 'shut' })], fx: [star(2, HIGH)] }),
  c(1, 'rush', boss('raise', { eyes: 'happy' }), { post: 'stand', clones: [clone(AT - 3, 'tuck', { lift: 3, eyes: 'grin' })], fx: [puff(1, AT - 3), star(3, HIGH)] }),
  c(1, 'rush', boss('raise', { eyes: 'happy' }), { post: 'stand', fx: [puff(2, AT - 3)] }),
  c(1, 'rush', boss('raise', { eyes: 'happy' }), { post: 'stand', fx: [puff(3, AT - 3)] }),
  // the next pops out of a puff behind his legs, crouched low; he points it in
  c(1, 'rush', boss('wave', { eyes: 'go', hdy: 1 }), { post: 'stand', clones: [clone(AT + 3, 'crouch', { head: undefined, dy: 2, eyes: 'grin' })], fx: [puff(1, AT + 1)] }),
  c(1, 'rush', boss('wave', { eyes: 'go' }), { post: 'stand', clones: [clone(AT + 3, 'crouch', { dy: 2 })], fx: [puff(3, AT + 1)] }),
  // the slide, feet first along the ground (grit thrown up behind it)...
  c(1, 'rush', boss('wave', { eyes: 'go' }), { post: 'stand', clones: [clone(AT + 2, 'kick', { dy: 3 })], fx: [dustAt(0, AT + 6)] }),
  // ...the foot into the post's foot: knocked up out of the ground, the stage jolted
  c(1, 'hit2', boss('alert', { eyes: 'wide', hdy: 1 }), { post: 'lean', pdx: -1, pdy: -2, flash: 'post', clones: [clone(AT, 'kick', { dy: 3 })], fx: [star(0, LOW), dustAt(1, AT + 6)], shake: [-1, 0] }),
  c(1, 'hit2', boss('alert', { eyes: 'wide' }), { post: 'lean', pdx: -1, pdy: -3, clones: [clone(AT, 'kick', { dy: 3 })], fx: [star(1, LOW - 1), dustAt(0, AT)] }),
  // slid to a stop, grinning, as the post drops back into its hole; he pumps a fist
  c(1, 'rush', boss('scratch', { eyes: 'grin', hdy: 1 }), { post: 'stand', pdy: -1, clones: [clone(AT + 1, 'crouch', { head: undefined, dy: 1, eyes: 'grin' })], fx: [star(2, LOW - 2), dustAt(1, AT)] }),
  c(1, 'rush', boss('scratch', { eyes: 'grin' }), { post: 'stand', clones: [clone(AT + 1, 'crouch', { head: undefined, dy: 1, eyes: 'grin' })], fx: [puff(1, AT), dustAt(0, POST_X + 1)] }),
  c(1, 'rush', boss('scratch', { eyes: 'grin' }), { post: 'stand', fx: [puff(2, AT), dustAt(1, POST_X + 1)] }),
  // the last pops out of a puff in the air over the arena, a fist up; he points it in
  c(1, 'rush', boss('point', { eyes: 'go', hdy: 1 }), { post: 'stand', fx: [puff(3, AT), dustAt(2, POST_X + 1)] }),
  c(1, 'rush', boss('point', { eyes: 'go' }), { post: 'stand', clones: [clone(AT - 2, 'jump', { head: undefined, lift: 5, clip: 3, eyes: 'grin' })], fx: [puff(4, AT), puff(1, AT - 2, 12)] }),
  c(1, 'rush', boss('point', { eyes: 'go' }), { post: 'stand', clones: [clone(AT + 1, 'tuck', { lift: 6, clip: 3, eyes: 'shut' })], fx: [puff(3, AT - 2, 12)] }),
  // dropping on the post, the fist cocked...
  c(1, 'rush', boss('point', { eyes: 'go' }), { post: 'stand', clones: [clone(AT + 2, 'follow', { lift: 5, clip: 3 })] }),
  c(1, 'rush', boss('point', { eyes: 'go' }), { post: 'stand', clones: [clone(AT + 2, 'follow', { lift: 3 })] }),
  // ...and driven into it: frozen two frames, the post white, the stage
  // jolted three; both his fists thrown up
  c(1, 'hit3', boss('cheer', { eyes: 'grin', hdy: 1 }), { post: 'lean', pdx: -2, flash: 'post', clones: [clone(AT, 'punch', { lift: 1 })], fx: [star(0, MID)], shake: [-1, 0] }),
  c(1, 'hit3', boss('cheer', { eyes: 'grin' }), { post: 'lean', pdx: -2, clones: [clone(AT, 'punch', { lift: 1 })], fx: [star(1, MID)], shake: [-1, 0] }),
  // the follow-through, landing; the post rocking back
  c(1, 'rush', boss('cheer', { eyes: 'grin' }), { post: 'lean', pdx: -1, clones: [clone(AT + 1, 'strike')], fx: [star(2, MID), dustAt(0, AT + 1)], shake: [1, 0] }),
  c(1, 'rush', boss('cheer2', { eyes: 'grin', hdy: 1 }), { post: 'stand', pdx: 1, clones: [clone(AT + 2, 'crouch', { head: undefined, eyes: 'grin' })], fx: [star(3, MID), dustAt(1, AT + 1)] }),
  // and up in its puff
  c(1, 'rush', boss('cheer', { eyes: 'grin' }), { post: 'stand', clones: [clone(AT + 2, 'crouch', { head: undefined, eyes: 'grin' })], fx: [puff(1, AT + 2)] }),
  c(1, 'rush', boss('cheer2', { eyes: 'grin' }), { post: 'stand', fx: [puff(2, AT + 2)] }),
  // the smoke clears off; his fists come down to a thumbs-up, home
  c(1, 'recover', K('thumbs', { x: HOME + 1, eyes: 'grin', hdy: 1 }), { post: 'stand', fx: [puff(3, AT + 2)] }),
  c(2, 'recover', K('thumbs', { eyes: 'grin' }), { post: 'stand' }),
  ...ending('stand'),
]
export const CLONES = celMove(T, { name: 'Shadow Clone Jutsu', shout: 'Shadow Clone Jutsu', dojutsu: false, on: ['agent'] }, clonesCels)

// ------------------------------------------------------------------ Wind Style: Rasenshuriken (4.3 s)

// The seals as the post poofs in; still, eyes shut, gathering nature's
// chakra, until Sage Mode wakes in a flare (the toad's pigment, the gold
// eyes); a hand thrown up and the Rasenshuriken spun up over it, screaming,
// the flare pulsing (two frames a beat) and the hold stirring; the shuriken
// carried down behind him (cocked, rocked back two pixels), the arm a blur,
// the strike and its follow-through as the blades carve down onto the post,
// and the sphere of wind needles blooming over it while he braces against
// its wind; the mode fades.
const flare = (f: number): FxUse => fx('sageAura', f, 'feet', { back: true })
// the Rasenshuriken held up and out over the arena, at the raised hand
const ALOFT: [number, number] = [-6, 5]
const held = (f: number | 'cycle' = 'cycle'): FxUse => fx('rasenshuriken', f, 'hand', { d: ALOFT })
// swung up over his head on its way behind it, and cocked behind it (drawn
// behind him: its blades show round his hair and past his far shoulder)
const OVER: [number, number] = [27, 2]
const BEHIND: [number, number] = [43, 1]
// where the post's middle is, the sphere's centre (its foot on the ground)
const DOME: [number, number] = [POST_X + 1, GROUND - 6]
const dome = (f: number): FxUse => fx('rasenshurikenDome', f, DOME)
const rasenshurikenCels: Cel[] = [
  // the seals as the post poofs in
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2')]),
  // still, eyes shut, gathering nature's chakra
  ...hold(5, 'sage', K('gather', { eyes: 'shut' }), { post: 'stand' }),
  // Sage Mode wakes: the pigment and the toad eyes, in a flare
  c(1, 'sage', K('gather', awake({ hdy: 1, eyes: 'focus' })), { post: 'stand', fx: [flare(0)] }),
  c(2, 'sage', K('gather', awake({ eyes: 'focus' })), { post: 'stand', fx: [flare(1)] }),
  // the hand thrown up: a Rasengan, a bigger ball, the blades
  c(1, 'charge', K('raise', awake({ hdy: 1 })), { post: 'stand', fx: [flare(2), fx('rasengan', 0, 'hand', { d: ALOFT })] }),
  c(1, 'charge', K('raise', awake()), { post: 'stand', fx: [flare(3), fx('giantRasengan', 0, 'hand', { d: ALOFT })] }),
  // it screams over him: the flare pulsing, two frames a beat, the hold
  // stirring, its weight sinking him a pixel on the last
  ...hold(4, 'charge', K('raise', awake()), i => ({ post: 'stand', fx: [flare(2 + (Math.floor(i / 2) % 2)), held()] })),
  c(1, 'charge', K('raise', awake({ x: HOME + 1, dy: 1, hdx: -1, eyes: 'focus' })), { post: 'stand', fx: [flare(2), held()] }),
  // swung up over his head and on behind it (its blades round his hair)...
  c(1, 'charge', K('raise', awake({ x: HOME + 1, eyes: 'focus' })), { post: 'stand', fx: [flare(3), fx('rasenshuriken', 'cycle', OVER, { back: true })] }),
  // ...and carried down behind him, rocked back on the back foot (the head
  // kept a pixel in, on the stage)
  c(1, 'charge', K('windup', awake({ x: HOME + 2, hdx: -1, head: 'turnSage' })), { post: 'stand', fx: [flare(1), fx('rasenshuriken', 'cycle', BEHIND, { back: true })] }),
  c(1, 'charge', K('windup', awake({ x: HOME + 2, hdx: -1, head: 'turnSage' })), { post: 'stand', fx: [flare(0), fx('rasenshuriken', 'cycle', BEHIND, { back: true })] }),
  // the arm a blur: it leaves the hand, low and ahead of him (never over his face)
  c(1, 'release', K('whip', turn(awake({ x: STRIKE + 6 }))), { post: 'stand', fx: [fx('rasenshuriken', 'cycle', [POST_X + 4, 16]), fx('streak', 1, 'hand', { pal: 'wind', d: [2, -1], back: true })], shout: true }),
  // the strike, the blades carving into the post, and the follow-through
  c(1, 'release', K('strike', turn(awake({ x: STRIKE + 6 }))), { post: 'stand', fx: [fx('rasenshuriken', 'cycle', [POST_X + 2, 16]), fx('windBlade', 1, [POST_X + 12, 15])] }),
  c(1, 'release', K('follow', turn(awake({ x: STRIKE + 5 }))), { post: 'stand', fx: [fx('rasenshuriken', 'cycle', [POST_X + 1, 16]), fx('windBlade', 2, [POST_X + 10, 15])] }),
  // it lands: a pinpoint, held (hit-stop), then the sphere swelling over the
  // post, the stage jolted as it bursts
  c(2, 'impact', K('follow', turn(awake({ x: STRIKE + 5 }))), { post: 'lean', flash: 'post', fx: [fx('rasenshuriken', 'cycle', [POST_X + 1, 16]), dome(0)] }),
  // braced against its wind, sunk on the back foot...
  c(1, 'impact', K('windup', turn(awake({ x: HOME - 3 }))), { post: 'lean', fx: [dome(1)], shake: [-1, 0] }),
  c(1, 'impact', K('windup', turn(awake({ x: HOME - 3 }))), { post: 'lean', fx: [dome(2)], shake: [-1, 0] }),
  // ...the sphere raging: an arm flung up against its wind, shoved back a step...
  c(1, 'impact', K('alert', awake({ x: HOME - 2, eyes: 'shut', hdy: 1 })), { post: 'lean', fx: [dome(3)], shake: [1, 0] }),
  c(1, 'impact', K('alert', awake({ x: HOME - 2, eyes: 'shut' })), { post: 'lean', fx: [dome(2)] }),
  c(1, 'impact', K('alert', awake({ x: HOME - 2, eyes: 'shut', hdx: 1 })), { post: 'lean', fx: [dome(3)] }),
  // ...dug in low as it peaks, and the shell cracks open and breaks up: the
  // post, battered, still standing
  c(1, 'impact', K('crouch', awake({ x: HOME - 1, eyes: 'focus' })), { post: 'lean', fx: [dome(2)] }),
  c(1, 'impact', K('crouch', awake({ x: HOME - 1, eyes: 'focus', hdy: 1 })), { post: 'lean', fx: [dome(3)] }),
  c(1, 'impact', K('crouch', awake({ x: HOME - 1, eyes: 'focus' })), { post: 'lean', fx: [dome(5)] }),
  c(1, 'impact', K('crouch', awake({ x: HOME - 1, eyes: 'focus', hdy: 1 })), { post: 'scarred', fx: [dome(6)] }),
  c(1, 'impact', K('windup', awake({ x: HOME - 1, eyes: 'focus' })), { post: 'scarred', fx: [dome(4)] }),
  // he straightens, catching his breath as the mode fades, and a thumbs-up
  c(1, 'impact', K('gather', awake({ hdy: 1, eyes: 'shut' })), { post: 'scarred', fx: [fx('sparks', 2, 'post', { pal: 'wind' })] }),
  c(1, 'impact', K('gather', awake({ eyes: 'shut' })), { post: 'scarred' }),
  c(1, 'recover', K('thumbs', { eyes: 'grin', hdy: 1 }), { post: 'scarred' }),
  c(2, 'recover', K('thumbs', { eyes: 'grin' }), { post: 'scarred' }),
  ...ending('scarred'),
]
export const RASENSHURIKEN = celMove(JACKET, { name: 'Wind Style: Rasenshuriken', shout: 'Rasenshuriken' }, rasenshurikenCels)

// ------------------------------------------------------------------ the quick strike: Uzumaki Barrage (1.8 s)

// For an edit: the post poofs in as he rocks back, a smear, a kick that
// knocks the post up out of the ground ("U-zu-ma-ki!"); he springs home as a
// clone pops out of a cloud at the post (in the arena, its head well clear
// of his and never off the stage) and slaps it back into the earth.
const SLAP = GATE - 2
// the clone stood on the post, stamping it in
const drop2 = (pose: string, o: Partial<CloneCel> = {}): CloneCel[] => [{ x: SLAP, pose, lift: 3, head: 'turn', eyes: 'focus', z: -1, ...o }]
const quickCels: Cel[] = [
  ...poofIn(
    runIn('dash', {
      look: turn(),
      strike: { pose: 'kick', post: 'lean', pdy: -2, fx: [fx('impact', 0, 'post', { pal: 'hit', d: [1, 2] })] },
    }),
  ),
  // knocked up out of the ground
  c(1, 'impact', K('kick', turn({ x: STRIKE })), { post: 'stand', pdy: -3, fx: [fx('impact', 1, 'post', { pal: 'hit', d: [1, 2] })], shake: [-1, 0] }),
  // he springs home; as he comes down a clone pops out of a cloud in the air
  // over the post and drops onto it, stamping it back into the earth (in the
  // arena, its head well clear of his)
  ...hopHome('back', STRIKE, 'stand', { eyes: 'happy' }, 2).map((cel, i) => {
    // (its own face to us in the air, while he is still hopping home: its
    // hair stays clear of his)
    const drop = (pose: string, lift: number, o: Partial<CloneCel> = {}): CloneCel[] => [{ x: SLAP - 2, pose, lift, clip: 3, eyes: 'focus', z: -1, ...o }]
    const more: Record<number, Partial<Cel>> = {
      0: { pdy: -3, fx: [...(cel.fx ?? []), fx('impact', 2, 'post', { pal: 'hit', d: [1, 2] })] },
      1: { pdy: -3, fx: [...(cel.fx ?? []), fx('impact', 3, 'post', { pal: 'hit', d: [1, 2] })] },
      2: { pdy: -3, fx: [...(cel.fx ?? []), cloud(0, [SLAP, GROUND - 7])] },
      3: { pdy: -3, fx: [...(cel.fx ?? []), cloud(1, [SLAP, GROUND - 7])], clones: drop('jump', 6, { eyes: 'grin', puff: 2 }) },
      4: { pdy: -3, clones: drop('tuck', 5, { eyes: 'shut' }), fx: [...(cel.fx ?? []), cloud(3, [SLAP, GROUND - 7])] },
      5: { tag: 'hit2', pdy: 1, clones: drop2('crouch'), fx: [...(cel.fx ?? []), fx('earth', 0, [POST_X + 1, GROUND]), fx('impact', 1, 'post', { pal: 'hit', d: [0, 3] })], shake: [0, 1] },
      6: { tag: 'hit2', pdy: 1, clones: drop2('crouch', { eyes: 'grin' }), fx: [...(cel.fx ?? []), fx('earth', 1, [POST_X + 1, GROUND]), fx('impact', 2, 'post', { pal: 'hit', d: [0, 3] })] },
    }
    return { ...cel, ...(more[i] ?? {}) }
  }),
  c(1, 'hit2', K('thumbs', { eyes: 'grin' }), { post: 'stand', pdy: 1, clones: drop2('crouch', { eyes: 'grin', puff: 2 }), fx: [fx('earth', 2, [POST_X + 1, GROUND])] }),
  // the clone gone in its last puff as he breathes out
  ...ending('stand', { pdy: 1 }).map((cel, i) =>
    i === 0 ? { ...cel, clones: drop2('crouch', { puff: 3 }) } : i === 1 ? { ...cel, fx: [...(cel.fx ?? []), cloud(4, [SLAP, GROUND - 3])] } : cel,
  ),
]
export const QUICK = celMove(JACKET, { name: 'Uzumaki Barrage', shout: 'Uzumaki Barrage', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.8 s)

// The end of a turn: a crouch, a leap with a fist pumped, landing straight
// into the thumbs-up with his big grin, held out with a nod (the hold
// stirring, the headband's tails flapping), and the breath out.
const cheerCels: Cel[] = [
  ...leap('hop', { eyes: 'happy' }, { squash: 0, hang: 1 }),
  c(1, 'cheer', K('thumbs', { hdy: 1 }), { fx: [dustAt(1, HOME)] }),
  ...hold(3, 'cheer', K('thumbs'), { accent: false }),
  c(1, 'cheer', K('thumbs', { hdy: 2 })),
  ...hold(3, 'cheer', K('thumbs'), { phase: 4, accent: false }),
  // the breath out, the face kept to the end
  c(1, 'cheer', K('idle1', { hdy: 1, eyes: 'happy' })),
  c(1, 'cheer', K('idle0', { eyes: 'happy' })),
]
export const CHEER = celMove(JACKET, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)
