// Sasuke's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them): the Chidori run through the post, the Great Fireball breathed
// over it, the Chidori Katana (the Kusanagi drawn, two cuts, the lightning
// sent down the blade and run through the wood), the Lion Combo for an edit,
// and his cheer.
//
// He covers the ground in one smear, speed lines and grit left where he
// stood (never a full afterimage: a ghost of him read as a pane of glass);
// he leaves the post three ways: the Chidori in a backflip (tucked tight,
// up and over in a real arc), the Katana in a Body Flicker (gone in a puff,
// back home in another), the Lion Combo in a low skip. His blows are struck
// with his head turned toward the post (ninja/sasuke.ts's 'turn' head); his
// holds stir; every move ends on the breath out (idle1, the head a pixel
// down) and two frames standing as the post poofs away. His Chidori is his
// own: the thousand birds (fx/chidori2.ts), never Kakashi's Raikiri; his
// sword's cuts are straight slashes of light (chidori2.ts's kusanagiCut).

import { celMove } from '../cels.ts'
import { wear } from '../dress.ts'
import { GROUND, HOME, POST_X, STRIKE } from '../stage.ts'
import { JACKET } from '../templates/jacket.ts'
import type { Cel, FxUse, NinjaCel, PostFrame } from '../types.ts'
import { K, awake, c, dustAt, fx, hold, hopHome, postIn, postOut, runIn, smokeAt } from './kit.ts'

// the head turned to the post, for a blow
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', eyes: 'focus', ...o })

// the end of every move: the breath out, then standing as the post poofs away
const ending = (post: PostFrame = 'stand', more: (i: number) => readonly FxUse[] = () => []): Cel[] => postOut('recover', [K('idle1', { hdy: 1 }), K('idle0'), K('idle0')], post, more)

// the post poofing in over the first two cels of a run
const poofIn = (cels: Cel[]): Cel[] =>
  cels.map((cel, i) => (i === 0 ? { ...cel, post: null, poof: 'in' as const, fx: [smokeAt(1), ...(cel.fx ?? [])] } : i === 1 ? { ...cel, post: 'stand' as const, poof: 'in' as const, fx: [smokeAt(3), ...(cel.fx ?? [])] } : cel))

// The backflip home from column `from` (the Chidori's alone): the crouch to
// spring, up and over backward in one arc (up 3, 6, 7, down 5, 2: never a
// dip at the top), tucked tight with his head upright on the knees, its
// eyes shut over the top, and the landing squash at home; `o` on the frames
// he faces out (the Sharingan awake), the post held at `post`.
const backflip = (tag: string, from: number, post: PostFrame, o: Partial<NinjaCel> = {}): Cel[] => {
  const at = (u: number): number => from + Math.round((HOME - from) * u)
  return [
    c(1, tag, K('crouch', { x: from, eyes: 'focus', ...o }), { post }),
    c(1, tag, K('tuck', { x: at(0.15), lift: 3, clip: 3, ...o, eyes: 'focus' }), { post, fx: [dustAt(0, from)] }),
    c(1, tag, K('tuck', { x: at(0.35), lift: 6, clip: 3, ...o, eyes: 'shut' }), { post, fx: [dustAt(1, from)] }),
    c(1, tag, K('tuck', { x: at(0.55), lift: 7, clip: 3, ...o, eyes: 'shut', hdy: 1 }), { post }),
    c(1, tag, K('tuck', { x: at(0.75), lift: 5, clip: 3, ...o, eyes: 'shut' }), { post }),
    c(1, tag, K('tuck', { x: at(0.9), lift: 2, clip: 3, ...o, eyes: 'focus' }), { post }),
    c(1, tag, K('crouch', { ...o, dy: 1 }), { post, fx: [dustAt(0, HOME)] }),
    c(1, tag, K('crouch', { ...o }), { post, fx: [dustAt(1, HOME)] }),
  ]
}
// Home from column `from` in a Body Flicker (the Chidori Katana's): gone in
// a puff and back home in another (kit.ts's hopHome 'flicker').
const flicker = (tag: string, from: number, post: PostFrame, o: Partial<NinjaCel> = {}): Cel[] => hopHome(tag, from, post, o, 1, 'jump', { style: 'flicker' })
// and its clouds at home thinning over the frames after it, at his sides
// only (none left over his face): frame i
const thinning = (i: number): FxUse[] =>
  [
    [fx('smoke', 3, [HOME - 4, GROUND]), fx('smoke', 3, [HOME + 5, GROUND])],
    [fx('smoke', 3, [HOME + 5, GROUND]), fx('smoke', 4, [HOME - 4, GROUND])],
    [fx('smoke', 4, [HOME - 4, GROUND]), fx('smoke', 4, [HOME + 5, GROUND])],
  ][i] ?? []
// speed lines where he left from, streaking after him (his run's smear, no ghost)
const speed = (f: number, x: number, y = GROUND - 5): FxUse => fx('streak', f, [x, y], { pal: 'volt' })

// ------------------------------------------------------------------ the Kusanagi

// His sword, drawn only in the Chidori Katana: each of these poses is a
// jacket pose with the blade in the fist (ninja/sasuke.ts draws it as a prop
// on them), named apart so the sword shows in no other move.
export const KUSANAGI_POSES = {
  kWindup: 'windup',
  kSmear: 'smear',
  kDash: 'dash',
  kStrike: 'strike',
  kPunch: 'punch',
  kFollow: 'follow',
  kCharge: 'charge',
  // the charge held: its stirring drawing (the hold finds it by name)
  kChargeWind: 'chargeWind',
} as const
// the jacket with them, for the moves' beats (the companion's pose and face for each)
const ARMED = wear(JACKET, KUSANAGI_POSES)

// ------------------------------------------------------------------ Chidori (4.6 s)

// The seals (ox, hare, monkey) as the post poofs in; the Sharingan wakes in
// the palm thrust out, and he sinks into his own stance, low and rocked
// back, the hand down at the ground in front, as the thousand birds chirp
// in his palm, biting the ground under it (the hold stirring in their
// crackle; not Kakashi's upright charge); gone from his
// stance so fast its afterimage stays there in blue, the hand dragging a
// trail of sparks along the ground; rammed through the post (the post
// white, scorched through), the birds bursting out of its far side; the
// backflip home, a smirk.
const birds = (f: number | 'cycle' = 'cycle', phase = 0): FxUse => fx('chidoriBirds', f, 'hand', { phase })
// bolts biting the ground under the hand
const bite = (phase = 0): FxUse => fx('sparks', 'cycle', 'hand', { d: [1, 4], phase })
// the birds being born: the knot, its forks and first chirps
const chirp = (f: number): FxUse => fx('chidoriChirp', f, 'hand')
// the static in his hair: a crackle off its spikes, by turns at either side
const hair = (f: number): FxUse => fx('sparks', f % 3, 'head', { d: f % 2 ? [15, 1] : [5, 2] })
// the birds screaming louder: a second flock over the first, mirrored, out of step
const scream = (i: number): FxUse[] => [fx('chidoriBirds', 'cycle', 'hand', { d: [0, -1] }), fx('chidoriBirds', (i + 2) % 4, 'hand', { d: [-2, 1], flip: true })]
// a frame of a stirring hold whose look changes under it (the arm kicked back)
const stir = (pose: string, i: number, o: Partial<NinjaCel> = {}): NinjaCel => ({ ...K(pose, o), held: i })
// the trail the hand drags along the ground, from the post back to where he left
const trail = (phase: number, from = 28): FxUse[] => [from, from + 4, from + 8].map((x, i) => fx('sparks', (i + phase) % 3, [x, GROUND - 2]))
const chidoriCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2')]),
  c(1, 'signs', K('sign3', { hdy: 1 }), { post: 'stand' }),
  c(2, 'signs', K('sign3'), { post: 'stand' }),
  // the Sharingan wakes in the palm thrust out, and the crackle GROWS: a
  // spark, a knot, forks with the first chirps; it kicks his arm back a
  // pixel, the static lifting his hair, and the birds break out
  c(1, 'charge', stir('charge', 0, awake({ hdy: 1 })), { post: 'stand', fx: [fx('chidoriBuild', 0, 'hand')] }),
  c(1, 'charge', stir('charge', 1, awake()), { post: 'stand', fx: [fx('chidoriBuild', 1, 'hand')] }),
  c(1, 'charge', stir('charge', 2, awake()), { post: 'stand', fx: [chirp(0)] }),
  c(1, 'charge', stir('charge', 3, awake({ x: HOME + 1, hdx: 1, eyes: 'focus' })), { post: 'stand', fx: [chirp(1), hair(0)] }),
  c(1, 'charge', stir('charge', 4, awake({ x: HOME + 1, eyes: 'focus' })), { post: 'stand', fx: [chirp(0), fx('sparks', 1, 'hand', { d: [-3, 2] })] }),
  c(1, 'charge', stir('charge', 5, awake({ x: HOME + 1, hdy: 1, eyes: 'focus' })), { post: 'stand', fx: [birds(0), hair(1)] }),
  // down into his stance, rocked back on the back foot, lit white by the
  // birds as they swell, biting the ground; the static stands his hair up
  c(1, 'charge', K('windup', awake({ x: HOME + 1, hdy: 1 })), { post: 'stand', flash: 'rim', fx: [birds(), bite()] }),
  ...hold(4, 'charge', K('windup', awake({ x: HOME + 1 })), i => ({ post: 'stand', fx: [birds(), bite(), ...(i % 2 ? [] : [hair(i / 2)])] }), { phase: 1 }),
  // the birds scream louder, the crackle doubled: the hand slammed down at
  // the ground (his own key), sunk into his knees, the head trembling with
  // it; and he goes from there
  ...[
    [0, 1],
    [-1, 0],
    [0, 0],
  ].map(([hdx, hdy], i) => c(1, 'charge', K('slam', awake({ dy: 1, hdx, hdy, eyes: 'focus' })), { post: 'stand', fx: [...scream(i), bite(1), ...(i === 0 ? [dustAt(0, HOME - 4)] : []), ...(i === 1 ? [hair(1)] : [])] })),
  // gone: one smear, speed lines where he stood, the trail of sparks, through the post
  ...runIn('dash', {
    ready: 'charge',
    windup: 'slam',
    look: turn(awake()),
    fx: (i, part) => (part === 'windup' ? [...scream(i + 3), bite(), ...(i === 1 ? [hair(0)] : [])] : part === 'travel' ? [birds(), speed(0, 31), ...trail(0, 30)] : []),
    strike: { post: 'lean', flash: 'post', fx: [birds(1), speed(1, 31), fx('impact', 0, 'post'), ...trail(1)], shake: [-1, 0] },
  }),
  // the birds burst out of the far side of the wood
  c(1, 'impact', K('strike', turn(awake({ x: STRIKE }))), { post: 'scorchLean', pdx: -1, fx: [fx('impact', 1, 'post'), fx('chidoriBirds', 2, [POST_X - 4, 16]), speed(2, 31), ...trail(2)], shake: [1, 0] }),
  c(1, 'impact', K('follow', turn(awake({ x: STRIKE - 1 }))), { post: 'scorch', pdx: 1, fx: [fx('impact', 2, 'post'), fx('chidoriBirds', 3, [POST_X - 7, 15]), fx('sparks', 0, 'hand')] }),
  c(1, 'impact', K('follow', turn(awake({ x: STRIKE - 1 }))), { post: 'scorch', fx: [fx('impact', 3, 'post'), fx('sparks', 1, 'hand'), fx('sparks', 2, [POST_X - 8, 14])] }),
  c(2, 'impact', K('follow', turn(awake({ x: STRIKE - 1 }))), { post: 'scorch', fx: [fx('sparks', 2, 'hand')] }),
  // the backflip home
  ...backflip('back', STRIKE - 1, 'scarred', awake()),
  // home: the Sharingan fades, the arms folded on a smirk, the post poofs away
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'scarred' }),
  c(2, 'recover', K('crossed', { eyes: 'smug' }), { post: 'scarred' }),
  ...ending('scarred'),
]
export const CHIDORI = celMove(JACKET, { name: 'Chidori', shout: 'Chidori', on: ['shell'] }, chidoriCels)

// ------------------------------------------------------------------ Fire Style: Great Fireball Jutsu (4.1 s)

// The seals (snake, ram, monkey, boar, horse, tiger) as the post poofs in;
// the Sharingan wakes, the tiger seal brought to his lips, and the breath
// in: the chest heaved, the head thrown back, three frames; the head snaps
// forward, a spark at the lips, and the fire is breathed out in a cone, the
// body jolted back a pixel with each pulse of it; a ball of it rolls off the
// end, swells to its fullest (taller than the post, wider than his head)
// as it breaks over the post, the wood lit orange; the post burns (the seal
// held, stirring in the heat), the fire dies to glowing char and embers,
// and he lowers the seal with a smirk.
// the lips, where the fire leaves them (the head's mouth, a step forward)
const LIPS: [number, number] = [HOME - 6, 15]
// the post burning: flames over the wood (anchored on the post's foot)
const FOOT: [number, number] = [POST_X, GROUND]
const burning = (f: number | 'cycle' = 'cycle'): FxUse => fx('burnPost', f, FOOT)
const form = (f: number): FxUse => fx('greatFireballForm', f, LIPS)
const stream = (f: number): FxUse => fx('fireStream', f, LIPS, { d: [-1, 0] })
const fireball = (f: number, at: readonly [number, number]): FxUse => fx('greatFireball', f, at)
const embers = (f: number): FxUse => fx('embers', f % 4, [POST_X + 1, GROUND - 9])
// the cone's frames as it rolls out and roars, and him through it: the seal
// at the lips leaning into it, then braced against its push, sunk on the
// back foot, and the arms thrown wide, the head knocked back, as it roars at
// its fullest:
// [the cone's frame, pose, x, dy, the head's nudge]
const PULSES: readonly (readonly [number, string, number, number, number, number])[] = [
  [1, 'think', HOME - 1, 0, -1, 0],
  [2, 'think', HOME - 1, 0, -1, 1],
  [3, 'windup', HOME + 1, 1, 0, 0],
  [4, 'windup', HOME + 1, 1, 0, 1],
  [3, 'windup', HOME + 1, 1, -1, 0],
  [4, 'windup', HOME + 1, 1, 0, 0],
  [3, 'spread', HOME + 1, 0, 1, 0],
  [4, 'spread', HOME + 1, 0, 1, 1],
  [3, 'spread', HOME + 1, 0, 0, 0],
  [4, 'spread', HOME + 1, 0, 1, 0],
]
// the seal at the lips, the head snapped forward
const breathe = (o: Partial<NinjaCel> = {}): NinjaCel => K('think', awake({ eyes: 'focus', hdx: -1, ...o }))
// where the ball breaks: the post's middle
const BALL: [number, number] = [POST_X + 2, 13]
const fireballCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign2', { hdy: 1 }), K('sign2')]),
  c(1, 'signs', K('sign3', { hdy: 1 }), { post: 'stand' }),
  // the last seals snapped in lower, sunk a pixel into them
  c(1, 'signs', K('sign1', { dy: 1, hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign1', { dy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign2', { dy: 1, hdy: 1 }), { post: 'stand' }),
  c(1, 'signs', K('sign3', { dy: 1, hdy: 1 }), { post: 'stand' }),
  // the Sharingan wakes, the seal to the lips; the breath in: chest up, the
  // head back
  c(1, 'inhale', K('gather', awake({ eyes: 'focus', hdy: 1 })), { post: 'stand' }),
  c(1, 'inhale', K('gather', awake({ eyes: 'focus' })), { post: 'stand' }),
  c(3, 'inhale', K('inhale', awake()), { post: 'stand' }),
  // the head snaps forward and the weight with it, a step in: a spark at
  // the lips, a ball of it
  c(1, 'release', breathe({ x: HOME - 1, hdy: 1 }), { post: 'stand', fx: [form(0)] }),
  c(1, 'release', breathe({ x: HOME - 1 }), { post: 'stand', fx: [form(1)] }),
  // the cone of fire, rolling out to the post and roaring there, the head
  // knocked back by it: the fire only ever goes forward
  ...PULSES.map(([f, pose, x, dy, hdx, hdy]) => c(1, 'release', K(pose, awake({ eyes: 'focus', x, ...(dy ? { dy } : {}), hdx, hdy })), { post: 'stand', fx: [stream(f)] })),
  // a ball of it rolls off the cone and swells, and engulfs the post at its
  // fullest, frozen two frames (the seal dropped, rocked back off it); it
  // breaks, the wood lit orange
  c(1, 'release', K('sign2', awake({ x: HOME + 1, hdy: 1 })), { post: 'stand', fx: [fireball(4, [POST_X + 2, 14])] }),
  c(1, 'release', K('sign2', awake({ x: HOME + 1 })), { post: 'stand', fx: [fireball(4, [POST_X + 2, 15])] }),
  c(1, 'release', K('sign2', awake({ x: HOME + 1 })), { post: 'stand', fx: [fireball(4, [POST_X + 2, 14])] }),
  c(1, 'release', K('sign2', awake({ x: HOME + 1 })), { post: 'stand', fx: [fireball(4, [POST_X + 2, 13])] }),
  c(1, 'impact', K('sign2', awake({ x: HOME + 2 })), { post: 'scorch', fx: [fireball(5, BALL)], shake: [-1, 0] }),
  c(1, 'impact', K('sign2', awake({ x: HOME + 2 })), { post: 'scorch', fx: [fireball(5, BALL)], shake: [-1, 0] }),
  c(1, 'impact', K('sign2', awake({ x: HOME + 1 })), { post: 'scorch', fx: [fireball(4, [POST_X + 2, 15]), fx('heatFlash', 0, FOOT)], shake: [1, 0] }),
  // the seal lowered as he settles, watching it break up
  c(1, 'impact', K('gather', awake({ x: HOME, hdy: 1 })), { post: 'scorch', fx: [burning(1), fireball(2, [POST_X + 1, 16])] }),
  c(1, 'impact', K('gather', awake({ x: HOME })), { post: 'scorch', fx: [burning(2), fireball(3, [POST_X + 1, 17])] }),
  // it burns: the seal brought back to the lips ("Hn."), then the hair
  // flicked off his brow as he turns from the fire
  c(1, 'impact', K('think', awake({ eyes: 'half', hdy: 1 })), { post: 'scorch', fx: [burning(0), embers(0)] }),
  c(1, 'impact', K('think', awake({ eyes: 'half' })), { post: 'scorch', fx: [burning(1), embers(1)] }),
  c(1, 'impact', K('flick', { eyes: 'half' }), { post: 'scorch', fx: [burning(2), embers(2)] }),
  c(1, 'impact', K('flick', { eyes: 'shut', hdy: 1 }), { post: 'scorch', fx: [burning(0), embers(3)] }),
  // the fire dies to glowing char, embers rising off it, and he turns his
  // head from it on a smirk
  ...[0, 1].map(f => c(1, 'recover', K('crossed', { head: 'away', eyes: 'smug', ...(f === 0 ? { hdy: 1 } : {}) }), { post: 'scarred', fx: [fx('scorch', f, FOOT), embers(f + 4)] })),
  ...ending('scarred', i => (i === 0 ? [fx('scorch', 2, FOOT)] : [])),
]
export const FIREBALL = celMove(JACKET, { name: 'Fire Style: Great Fireball Jutsu', shout: 'Great Fireball' }, fireballCels)

// ------------------------------------------------------------------ Chidori Katana (4.6 s)

// The Kusanagi drawn as the post poofs in; gone in his blue afterimage, a
// cut across the post and a cut back (each a crescent of cut air, the wood
// rocked); a step back, the Chidori poured down the blade (the shout), the
// lunge that runs it through the wood, the lightning crackling out of it;
// home in a flicker, the sword gone.
// the blade's cut: a straight slash of light across the post, rising to the
// left (flipped: the cut back, falling)
const cut = (f: number, d: readonly [number, number], flip = false): FxUse => fx('kusanagiCut', f, 'post', { d, flip })
// where he steps back to, to pour the Chidori into the blade
const FLOW = STRIKE + 5
// the light running off the drawn blade's tip
const glint = (f: number): FxUse => fx('sparks', f, 'hand', { pal: 'smoke', d: [-14, 0] })
const katanaCels: Cel[] = [
  // the sword drawn as the post poofs in
  ...postIn('draw', [K('gather', { hdy: 1, eyes: 'focus' }), K('gather', { eyes: 'focus' }), K('kWindup', awake({ hdy: 1 })), K('kWindup', awake())], i => (i >= 2 ? [glint(i - 2)] : [])),
  c(2, 'draw', K('kWindup', awake()), { post: 'stand', fx: [glint(2)] }),
  // in one smear, the blade first, speed lines where he stood: the first
  // cut, high across the post
  ...runIn('dash', { ready: 'draw', windup: 'kWindup', look: turn(awake()), to: STRIKE + 3, fx: (_, part) => (part === 'travel' ? [speed(0, 31)] : part === 'strike' ? [speed(1, 31)] : []) }).map(cel => (cel.k?.pose === 'smear' ? { ...cel, k: { ...cel.k, pose: 'kSmear' } } : cel)),
  c(1, 'hit', K('kStrike', turn(awake({ x: STRIKE + 3 }))), { post: 'lean', fx: [cut(0, [-3, -2]), dustAt(2, HOME + 2)], shake: [-1, 0] }),
  c(1, 'hit', K('kStrike', turn(awake({ x: STRIKE + 3 }))), { post: 'lean', fx: [cut(0, [-3, -2])] }),
  c(1, 'hit', K('kStrike', turn(awake({ x: STRIKE + 3 }))), { post: 'lean', pdx: -1, fx: [cut(1, [-3, -2])] }),
  c(1, 'hit', K('kPunch', turn(awake({ x: STRIKE + 3 }))), { post: 'stand', fx: [cut(2, [-3, -2])] }),
  // and back, low
  c(1, 'hit2', K('kFollow', turn(awake({ x: STRIKE + 2 }))), { post: 'lean', pdx: 1, fx: [cut(0, [-2, 2], true)], shake: [1, 0] }),
  c(1, 'hit2', K('kFollow', turn(awake({ x: STRIKE + 2 }))), { post: 'lean', pdx: 1, fx: [cut(0, [-2, 2], true)] }),
  c(1, 'hit2', K('kFollow', turn(awake({ x: STRIKE + 2 }))), { post: 'stand', fx: [cut(1, [-2, 2], true)] }),
  c(1, 'hit2', K('kFollow', turn(awake({ x: STRIKE + 2 }))), { post: 'stand', fx: [cut(2, [-2, 2], true)] }),
  // a step back; the Chidori poured down the blade, its birds along it
  c(1, 'flow', K('crouch', awake({ x: STRIKE + 3, eyes: 'focus' })), { post: 'stand', shout: true }),
  c(1, 'flow', K('kCharge', awake({ x: FLOW, hdy: 1 })), { post: 'stand', fx: [fx('chidoriBuild', 0, 'hand')] }),
  c(1, 'flow', K('kCharge', awake({ x: FLOW })), { post: 'stand', fx: [fx('chidoriBuild', 1, 'hand'), fx('streak', 2, 'hand', { flip: true, d: [-1, 1] })] }),
  ...hold(5, 'flow', K('kCharge', awake({ x: FLOW })), i => ({ post: 'stand', fx: [birds(), fx('streak', i % 2, 'hand', { flip: true, d: [-1, 1] })] })),
  // the lunge: run through the wood, frozen, the post white, jolted and scorched
  c(1, 'impact', K('kSmear', turn(awake({ x: STRIKE + 3 }))), { post: 'stand', fx: [birds(), dustAt(0, FLOW)] }),
  c(1, 'impact', K('kStrike', turn(awake({ x: STRIKE }))), { post: 'scorchLean', pdx: -1, flash: 'post', fx: [fx('impact', 0, 'post'), birds(1)], shake: [-1, 0] }),
  c(1, 'impact', K('kStrike', turn(awake({ x: STRIKE }))), { post: 'scorchLean', pdx: -1, fx: [fx('impact', 0, 'post'), birds(1)], shake: [-1, 0] }),
  // the lightning crackling out of the wood along the blade: he drives it
  // deeper, leaning on it, the blade twisting, and wrenches it back
  c(1, 'crackle', K('kStrike', turn(awake({ x: STRIKE - 2 }))), { post: 'scorchLean', fx: [fx('impact', 1, 'post'), fx('chidoriBirds', 2, [POST_X - 4, 16])], shake: [1, 0] }),
  c(1, 'crackle', K('kPunch', turn(awake({ x: STRIKE - 2, hdy: 1 }))), { post: 'scorchLean', pdx: -1, fx: [fx('chidoriBirds', 3, [POST_X - 6, 15]), fx('sparks', 1, [POST_X - 2, 16]), fx('sparks', 2, 'post', { d: [2, -2] })] }),
  c(1, 'crackle', K('kPunch', turn(awake({ x: STRIKE - 2 }))), { post: 'scorch', fx: [fx('sparks', 2, [POST_X - 3, 17]), fx('sparks', 0, 'post', { d: [2, -2] })] }),
  c(1, 'crackle', K('kCharge', turn(awake({ x: STRIKE + 1 }))), { post: 'scorchLean', fx: [fx('sparks', 0, [POST_X - 4, 16]), fx('sparks', 1, 'post', { d: [2, -2] })] }),
  // pulled free
  c(1, 'crackle', K('kFollow', turn(awake({ x: STRIKE + 2 }))), { post: 'scorch', fx: [fx('sparks', 2, 'post')] }),
  // home in a flicker, the sword put away
  ...flicker('back', STRIKE + 2, 'scarred', awake()),
  c(1, 'recover', K('crouch', { eyes: 'focus' }), { post: 'scarred', fx: thinning(0) }),
  c(1, 'recover', K('crossed', { head: 'away', eyes: 'smug', hdy: 1 }), { post: 'scarred', fx: thinning(1) }),
  c(1, 'recover', K('crossed', { head: 'away', eyes: 'smug' }), { post: 'scarred', fx: thinning(2) }),
  ...ending('scarred'),
]
export const KATANA = celMove(ARMED, { name: 'Chidori Katana', shout: 'Chidori Katana', on: ['edit'] }, katanaCels)

// ------------------------------------------------------------------ the quick strike: Lion Combo (2.0 s)

// For an edit: in one smear, a rising kick that knocks the post up out of
// the ground, up after it tucked and the heel brought round and down on it
// as it drops (slammed back in, dust thrown up), and a low skip home.
const quickCels: Cel[] = [
  ...poofIn(
    runIn('dash', {
      look: turn(),
      fx: (_, part) => (part === 'travel' ? [speed(0, 31)] : part === 'strike' ? [speed(1, 31)] : []),
      strike: { pose: 'kick', post: 'lean', pdy: -2, fx: [fx('impact', 0, 'post', { pal: 'hit', d: [1, 2] })] },
    }),
  ),
  // the post knocked up; up after it, tucked
  c(1, 'impact', K('kick', turn({ x: STRIKE })), { post: 'stand', pdy: -3, fx: [fx('impact', 1, 'post', { pal: 'hit', d: [1, 2] })], shake: [-1, 0] }),
  c(1, 'hit2', K('tuck', turn({ x: STRIKE - 1, lift: 3, clip: 3 })), { post: 'stand', pdy: -3, fx: [fx('impact', 2, 'post', { pal: 'hit', d: [1, 2] })] }),
  // the heel brought down on it: slammed back into the ground
  c(1, 'hit2', K('follow', turn({ x: STRIKE - 1 })), { post: 'lean', pdy: 0, fx: [fx('impact', 0, 'post', { pal: 'hit', d: [0, -3] }), fx('earth', 0, [POST_X + 1, GROUND])], shake: [0, 1] }),
  c(1, 'hit2', K('follow', turn({ x: STRIKE - 1 })), { post: 'lean', pdy: 0, fx: [fx('impact', 0, 'post', { pal: 'hit', d: [0, -3] }), fx('earth', 0, [POST_X + 1, GROUND])] }),
  // the hop home, tucked in a ball
  ...hopHome('back', STRIKE - 1, 'stand', {}, 2, ['tuck'], { style: 'skip' }).map((cel, i) => (i === 0 ? { ...cel, fx: [fx('impact', 2, 'post', { pal: 'hit', d: [0, -3] }), fx('earth', 1, [POST_X + 1, GROUND])] } : cel)),
  ...ending('stand', i => (i === 0 ? [dustAt(1, HOME)] : [])),
]
export const QUICK = celMove(JACKET, { name: 'Lion Combo', shout: 'Lion Combo', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.2 s)

// The end of a turn, no hop: a hand brought up to flick the hair off his
// brow, then flicked out low at his side, a few of the Chidori's birds
// crackling off the fingers and dying, the arms folded as the head turns
// away with a smug look ("Hn."), a glance back on the smirk, and the
// breath out.
const cheerCels: Cel[] = [
  c(1, 'cheer', K('flick', { eyes: 'half' })),
  c(1, 'cheer', K('flick', { eyes: 'shut', hdy: 1 })),
  c(1, 'cheer', K('charge', { eyes: 'smug', hdy: 1 }), { fx: [fx('chidoriBuild', 0, 'hand')] }),
  c(1, 'cheer', K('charge', { eyes: 'smug' }), { fx: [fx('chidoriBuild', 1, 'hand')] }),
  c(1, 'cheer', K('charge', { eyes: 'smug' }), { fx: [fx('sparks', 2, 'hand')] }),
  c(1, 'cheer', K('charge', { eyes: 'smug', hdx: 1 }), { fx: [fx('sparks', 0, 'hand', { d: [-1, 1] })] }),
  c(1, 'cheer', K('crossed', { head: 'away', eyes: 'smug', hdy: 1 })),
  c(1, 'cheer', K('crossed', { head: 'away', eyes: 'smug' })),
  c(1, 'cheer', K('crossed', { eyes: 'smug', hdy: 1 })),
  // the breath out, the face kept to the end
  c(1, 'cheer', K('idle1', { hdy: 1, eyes: 'smug' })),
  c(1, 'cheer', K('idle0', { eyes: 'smug' })),
]
export const CHEER = celMove(JACKET, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)
