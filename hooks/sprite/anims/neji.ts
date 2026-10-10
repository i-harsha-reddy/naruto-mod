// Neji's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to write a
// move: its helpers hold(), runIn(), hopHome() and leap() are the shared
// motion). The Hyuga style is soft and round: rings, not stars; the Byakugan
// (the cel's `awake`: the veins at his temples) wakes for every jutsu,
// and the Gentle Fist's chakra is a cool white-blue (fx/gentle.ts). In the
// blows and the glide his head turns three-quarters to the post ('turn').
// Every frame of a jutsu shows the post or his chakra, so none is ever
// mistaken for him just standing.

import { celMove } from '../cels.ts'
import { GROUND, HOME, STRIKE } from '../stage.ts'
import type { Cel, CelMove, CloneCel, FxUse, NinjaCel, PostFrame, Template, XY } from '../types.ts'
import type { CelOptions } from './kit.ts'
import type { CastWeight } from './kit.ts'
import { CAST_WEIGHT, K, awake, c, calls, cast, dustAt, fx, hold, hopHome, postIn, postOut, runIn } from './kit.ts'

// the Byakugan awake, with these
const by = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => awake({ eyes: 'focus', ...o })
// and the head turned to the post
const byT = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => by({ head: 'turn', ...o })
const smug: Partial<NinjaCel> = { eyes: 'smug' }
// where he stands to land a palm on the post's face: at a palm's length (the
// robe's 'palm' reaches four pixels past his head), the palm's tip on the
// post's face and his face well clear of it
const PALM_AT = STRIKE + 1

// the Byakugan waking: a glint of chakra at each temple, as the veins stand out
const wake = (f: number): FxUse[] => [fx('sparks', f, 'head', { d: [3, 11], pal: 'gentle' }), fx('sparks', f, 'head', { d: [18, 11], pal: 'gentle' })]
// a palm landing on the post: the pop, the ring, the ring breaking up
const palm = (f: number, pal = 'gentle', d: XY = [0, 0]): FxUse => fx('palmFlash', f, 'post', { pal, d })

// Every move ends settling (the robe's ease, a frame from rest), on idle1
// (the head dipped) for a frame, then idle0 for two as the post poofs away,
// the smirk on.
const ending = (frame: PostFrame = 'stand', more: readonly FxUse[] = []): Cel[] => [
  c(1, 'recover', K('ease', smug), { post: frame, fx: [...more] }),
  c(1, 'recover', K('idle1', { ...smug, hdy: 1 }), { post: frame }),
  ...postOut('recover', [K('idle0', smug), K('idle0', smug)], frame),
]

// ------------------------------------------------------------------ Eight Trigrams Palm Rotation (5.2 s)

// The Byakugan wakes over a seal as the post poofs in; the glide in to the
// post, low, and the stance; then he spins ("Palm Rotation!"), accelerating:
// the first turn winding up, two frames a facing (facing the post, side on,
// his back to it, side on the other way), the dome of chakra winding up round
// him; then two turns flat out, a frame a facing, as he drives it a step into
// the post, which rocks and rocks; then the last turn slowing (two frames a
// facing, three on the last) as he eases back off it; the spin stops facing
// the post, the dome bursts outward in a ring, and he hops home with the smirk.
const SPIN_AT = STRIKE + 1
// where the glide leaves him winding up, and where he drives the dome in
const WIND_AT = SPIN_AT + 1
const GRIND_AT = SPIN_AT - 1
// the dome round him at column x: its body and far bands behind him, its near bands in front
const dome = (f: number, x: number): FxUse[] => [fx('rotation', f % 4, [x, GROUND], { back: true }), fx('rotation', 4 + (f % 4), [x, GROUND])]
// winding up: the bands alone
const windUp = (x: number): FxUse => fx('rotation', 8, [x, GROUND], { back: true })
// the dome let go: a ring bursting outward from his middle
const RING: XY = [SPIN_AT, 14]
// the turn, a facing at a time: arms flung wide facing us, in profile facing
// the post (the profile head, one eye), his back to us (the back of his head,
// no face), in profile the other way (a copy of him turned to face right: for
// that facing he is that copy)
const TURN: readonly (Partial<NinjaCel> & { pose: string; flip?: boolean })[] = [
  { pose: 'spread' },
  { pose: 'side', head: 'side', eyes: 'side' },
  { pose: 'back', head: 'back', eyes: 'away' },
  { pose: 'side', head: 'side', eyes: 'side', flip: true },
]
const turn = (f: number, x: number): Pick<Cel, 'k' | 'clones'> => {
  const { flip, pose, ...look } = TURN[f % 4]!
  return flip ? { clones: [{ ...by(look), pose, x, flip: true } satisfies CloneCel] } : { k: K(pose, by({ ...look, x })) }
}
// the dome against the post: a pop where it grinds
const grind = (f: number): FxUse => fx('sparks', f % 3, 'post', { pal: 'gentle', d: [1, (f % 3) - 1] })
const ROCK: readonly [PostFrame, number][] = [['lean', -1], ['lean', -2], ['stand', 0], ['lean', -1]]
// the spin: the first turn winding up at two frames a facing (facing the
// post, side on, his back to it, side on the other way); then FLAT OUT, no
// longer a head turning but a blur (the robe's whirl: the hem flared into a
// bell, the hair flung wide, his face and the back of his head by turns, at
// an uneven beat), driven a step into the post and sunk into it (the blow);
// then the last turn slowing as he eases off it.
// (accelerating: 2, 2, 1, 1 frames a facing; and slowing, 1, 2, 2, 3)
const WIND: readonly (readonly [number, number])[] = [
  [2, WIND_AT],
  [2, WIND_AT],
  [1, WIND_AT],
  [1, WIND_AT],
]
const SLOW: readonly (readonly [number, number])[] = [
  [1, SPIN_AT],
  [2, SPIN_AT],
  [2, SPIN_AT],
  [3, SPIN_AT],
]
// the blur's beats: its drawing (A facing us, B from behind), frames, sunk
const BLUR: readonly (readonly ['A' | 'B', number, number])[] = [
  ['A', 1, 0],
  ['B', 1, 0],
  ['A', 2, 1],
  ['B', 1, 1],
  ['A', 1, 1],
  ['B', 2, 0],
]
const whirl = (w: 'A' | 'B', x: number, dy: number): NinjaCel =>
  w === 'A' ? K('whirl', by({ head: 'whirl', x, ...(dy ? { dy } : {}) })) : K('whirlB', by({ head: 'whirlBack', eyes: 'away', x, ...(dy ? { dy } : {}) }))
const spinCels = (): Cel[] => {
  const out: Cel[] = []
  // winding up
  WIND.forEach(([n, x], s) => {
    for (let i = 0; i < n; i++) {
      const f = out.length
      out.push(c(1, 'spin', undefined, { ...turn(s, x), post: 'stand', fx: [...(s === 0 ? [windUp(x)] : dome(s, x)), ...(f < 3 ? [dustAt(f, x)] : [])], ...(f === 0 ? { shout: true as const } : {}) }))
    }
  })
  // flat out, ground into the post
  let g = 0
  BLUR.forEach(([w, n, dy]) => {
    for (let i = 0; i < n; i++) {
      const [post, pdx] = ROCK[g % 4]!
      out.push(c(1, 'impact', whirl(w, GRIND_AT, dy), { post, pdx, fx: [...dome(g, GRIND_AT), g < 2 ? fx('impact', g, 'post', { pal: 'gentle' }) : grind(g), ...(g % 3 === 0 ? [dustAt(g % 2, GRIND_AT + 6)] : [])], ...(g === 0 ? { shake: [-1, 0] as XY, flash: 'post' as const } : g === 1 ? { shake: [-1, 0] as XY } : g === 2 ? { shake: [1, 0] as XY } : {}) }))
      g++
    }
  })
  // slowing, easing off it
  SLOW.forEach(([n, x], s) => {
    for (let i = 0; i < n; i++) out.push(c(1, 'spin', undefined, { ...turn(s + 1, x), post: 'stand', fx: dome(s + g, x) }))
  })
  return out
}
const rotationCels: Cel[] = [
  ...postIn('byakugan', [K('sign1', { hdy: 1 }), K('sign1'), K('sign1', by({ hdy: 1 })), K('sign1', by())], i => (i >= 2 ? wake(i - 2) : [])),
  c(1, 'byakugan', K('sign1', by()), { post: 'stand', fx: wake(2) }),
  c(2, 'byakugan', K('sign2', by({ hdy: 1 })), { post: 'stand' }),
  // the glide in, low, and the stance
  ...runIn('step', { style: 'glide', look: byT(), ready: 'byakugan', from: HOME - 1, to: WIND_AT + 1 }),
  c(1, 'ready', K('gather', byT({ x: WIND_AT, hdy: 1 })), { post: 'stand', fx: [dustAt(2, WIND_AT + 2)] }),
  c(1, 'ready', K('gather', byT({ x: WIND_AT })), { post: 'stand', fx: [windUp(WIND_AT)] }),
  // the spin: winding up, flat out into the post, slowing
  ...spinCels(),
  // the spin stops facing the post, and the dome bursts outward in a ring
  c(1, 'settle', K('spread', by({ x: SPIN_AT, hdy: 1 })), { post: 'stand', pdx: 1, fx: [fx('shockRing', 2, RING, { pal: 'gentle' })], shake: [1, 0] }),
  c(1, 'settle', K('gather', byT({ x: SPIN_AT })), { post: 'lean', fx: [fx('shockRing', 3, RING, { pal: 'gentle' })] }),
  c(1, 'settle', K('gather', byT({ x: SPIN_AT })), { post: 'stand', fx: [fx('shockRing', 4, RING, { pal: 'gentle' })] }),
  // home tucked tight, still turning on the way (a cannonball, not the shared hop)
  ...hopHome('back', SPIN_AT, 'stand', { awake: true }, 2, { air: ['tuck'], lifts: [4, 6, 5, 2] }),
  ...ending('stand', [dustAt(2, HOME)]),
]
const rotationMove = (t: Template): CelMove => celMove(t, { name: 'Eight Trigrams Palm Rotation', shout: 'Palm Rotation', on: ['shell'] }, rotationCels)

// ------------------------------------------------------------------ Eight Trigrams Sixty-Four Palms (4.9 s)

// The stance as the post poofs in, the field of the Eight Trigrams marked on
// the floor round him; the glide in, and the count, which BUILDS: two palms
// held two frames each ("Two Palms!"), four with the holds giving way to a
// frame a palm as he steps in, eight a frame each sunk into the stance, then
// the arms a blur (the robe's palmSmear: a wedge of palms) through sixteen
// and thirty-two, the post peppered and driven back; the last palm driven
// home from the deepest lunge, a step in ("Sixty-Four Palms!"), the stage
// jolted, held as the chakra bursts through the post, and he eases back off
// it. The hop home, the smirk.
const field = (x: number, f = 0): FxUse => fx('trigram', f, [x, GROUND], { back: true })
const at = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => K(pose, byT({ x: PALM_AT, ...o }))
// the palm that struck a frame ago, left behind as an afterimage beside the
// next: a copy of him in the chakra's colour, behind him (only its arm shows
// past his body)
// (sunk or raised to keep its head behind his: only the arm shows, never a halo)
const HEAD_DY: Readonly<Record<string, number>> = { palmLow: 1 }
const blur = (pose: string, x: number, under: string, dy = 0): CloneCel[] => {
  const d = (HEAD_DY[under] ?? 0) + dy - (HEAD_DY[pose] ?? 0)
  return [{ pose, x, ghost: 'chakra', noShadow: true, awake: true, head: 'turn', ...(d ? { dy: d } : {}) }]
}
// where each palm's pop lands on the post's face, by turns
const POPS: readonly XY[] = [
  [0, -2],
  [0, 2],
  [-1, 0],
  [0, -4],
  [0, 4],
]
// One blow of the count: its pose, frames, root (dx from PALM_AT, dy), its
// pop (POPS[pop]), `more` extra pops up and down the post at once, an
// afterimage of the pose before, and the post's rock (pdx) under it.
type Blow = { pose: string; n: number; dx?: number; dy?: number; pop: number; more?: number; ghost?: string; pdx?: number; hdy?: number; flash?: boolean; shake?: XY }
const blow = (tag: string, b: Blow, f: number): Cel[] => {
  const x = PALM_AT + (b.dx ?? 0)
  const look = { x, ...(b.dy ? { dy: b.dy } : {}), ...(b.hdy ? { hdy: b.hdy } : {}) }
  const sparks = (j: number): FxUse[] => POPS.slice(0, b.more ?? 0).map((d, i) => fx('sparks', (f + i + j) % 3, 'post', { pal: 'gentle', d: [d[0] + 1, d[1] * 2 + (i % 2 ? 3 : -3)] }))
  return Array.from({ length: b.n }, (_, j) =>
    c(1, tag, at(b.pose, j === 0 ? look : { ...look, hdy: undefined }), {
      post: j === 0 ? 'lean' : 'stand',
      pdx: (b.pdx ?? 0) + (j === 0 ? -1 : 0),
      ...(b.ghost ? { clones: blur(b.ghost, x, b.pose, (b.dy ?? 0) + (j === 0 ? (b.hdy ?? 0) : 0)) } : {}),
      ...(j === 0 && b.flash ? { flash: 'post' as const } : {}),
      ...(j === 0 && b.shake ? { shake: b.shake } : {}),
      // (the pop's white disc on a held palm; a ring on the quick ones and the blur, so the palms show through it)
      fx: [field(x, (f + j) % 2), palm(b.n > 1 ? Math.min(2, j) : 1, 'gentle', POPS[b.pop % POPS.length]!), ...sparks(j)],
    }),
  )
}
// the count: two-frame holds, then a frame a palm, then the blur. Each count
// opens on the hand snapped back to the hip (the robe's 'gather', a frame) as
// he steps in after the post, so the counts read as a march, never one loop;
// and at eight the barrage breaks: he spins the palms out into a short
// Rotation, the dome grinding the post back, and comes out of it a blur.
type Count = { tag: string; step?: { dx: number; dy?: number }; blows: readonly Blow[]; spin?: boolean }
const COUNT: readonly Count[] = [
  // two, held (hit-stop on the first; a jolt as it lands)
  { tag: 'hit', blows: [
    { pose: 'palm', n: 2, dx: 1, pop: 0, flash: true, shake: [-1, 0] },
    { pose: 'palmLow', n: 2, dx: 1, pop: 1, hdy: 1 },
  ] },
  // four, stepping in: the holds giving way to a frame a palm
  { tag: 'hit2', step: { dx: 0 }, blows: [
    { pose: 'palm', n: 1, pop: 2, hdy: 1 },
    { pose: 'palmLow', n: 1, pop: 1, ghost: 'palm' },
  ] },
  // eight, sunk into the stance, and spun out into the dome
  { tag: 'hit3', spin: true, blows: [
    { pose: 'palmLow', n: 1, dy: 1, pop: 4, more: 1, ghost: 'palm' },
    { pose: 'palm', n: 1, dy: 1, pop: 0, more: 1, ghost: 'palmLow', hdy: 1 },
  ] },
  // sixteen and thirty-two: out of the spin, the arms a blur, stepping in
  // after the post as it is driven back, peppered top to foot
  { tag: 'hit4', blows: [
    { pose: 'palmSmear', n: 1, dx: -1, pop: 3, more: 2, ghost: 'palmLow', pdx: -1 },
    { pose: 'palmSmearB', n: 1, dx: -1, pop: 0, more: 2, ghost: 'palm', pdx: -1, hdy: 1 },
  ] },
  { tag: 'hit5', blows: [
    { pose: 'palmSmearB', n: 1, dx: -1, dy: 1, pop: 1, more: 3, ghost: 'palm', pdx: -2 },
    { pose: 'palmSmear', n: 1, dx: -1, dy: 1, pop: 2, more: 3, ghost: 'palmLow', pdx: -2, hdy: 1 },
  ] },
]
// the break: four frames of the Rotation's blur (facing us, from behind, by
// turns), the dome round him grinding into the post and rocking it back
const SPIN: readonly (readonly ['A' | 'B', number, PostFrame, number])[] = [
  ['A', 0, 'lean', -1],
  ['B', 0, 'lean', -2],
  ['A', 1, 'lean', -2],
  ['B', 0, 'stand', -1],
]
const breakCels = (tag: string): Cel[] =>
  SPIN.map(([w, dy, post, pdx], g) =>
    c(1, tag, whirl(w, PALM_AT + 1, dy), { post, pdx, fx: [field(PALM_AT + 1, g % 2), ...dome(g, PALM_AT + 1), g === 0 ? fx('impact', 1, 'post', { pal: 'gentle' }) : grind(g), ...(g % 2 ? [] : [dustAt(g / 2, PALM_AT + 7)])], ...(g === 1 ? { shake: [-1, 0] as XY } : {}) }),
  )
const countCels = (): Cel[] => {
  const out: Cel[] = []
  for (const { tag, step, blows, spin } of COUNT) {
    // the hand snapped back as he steps in (the field turning under him, the last pop fading)
    if (step) out.push(c(1, tag, at('gather', { x: PALM_AT + step.dx, ...(step.dy ? { dy: step.dy } : {}), hdy: 1 }), { post: 'stand', fx: [field(PALM_AT + step.dx, out.length % 2), palm(2, 'gentle', POPS[out.length % POPS.length]!), dustAt(0, PALM_AT + step.dx + 3)] }))
    for (const b of blows) out.push(...blow(tag, b, out.length))
    if (spin) out.push(...breakCels(tag))
  }
  return out
}
const LAST = PALM_AT - 1
const palmsCels: Cel[] = [
  ...postIn('stance', [K('sign1', { hdy: 1 }), K('sign1', by({ hdy: 1 })), K('sign1', by()), K('gather', by({ hdy: 1 })), K('gather', by())], i => [field(HOME, i >= 3 ? 1 : 0), ...(i >= 1 && i < 4 ? wake(i - 1) : [])]),
  // the glide in
  ...runIn('step', { style: 'glide', look: byT(), ready: 'stance', from: HOME - 1, to: PALM_AT + 1, fx: (i, part) => (part === 'windup' ? [field(HOME, (i + 1) % 2)] : [field(PALM_AT + 1)]) }),
  ...countCels(),
  // drawn back for the last one, calling it ("Sixty-Four Palms!"): sunk on
  // the back foot, the palm cocked at the hip
  c(2, 'hit6', at('windup', { x: PALM_AT, hdy: 1 }), { post: 'lean', pdx: -1, fx: [field(PALM_AT, 1), palm(2, 'gentle', [0, 1]), fx('sparks', 1, 'post', { pal: 'gentle', d: [1, -3] })] }),
  // sixty-four: the last palm driven home from the deepest lunge, a step in,
  // the post driven back, the stage jolted (hit-stop, two frames)
  c(1, 'finish', at('palmDrive', { x: LAST - 1, hdy: 1 }), { post: 'lean', pdx: -3, flash: 'post', shake: [-1, 0], fx: [field(LAST), fx('impact', 0, 'post', { pal: 'gentle' }), palm(0, 'gentle', [0, 0])] }),
  c(1, 'finish', at('palmDrive', { x: LAST - 1, hdy: 1 }), { post: 'lean', pdx: -3, shake: [-1, 0], fx: [field(LAST), fx('impact', 0, 'post', { pal: 'gentle' }), palm(0, 'gentle', [0, 0])] }),
  c(1, 'finish', at('palmDrive', { x: LAST - 1 }), { post: 'lean', pdx: -2, shake: [1, 0], fx: [field(LAST, 1), fx('impact', 1, 'post', { pal: 'gentle' }), palm(1, 'gentle')] }),
  // held as the chakra bursts through it, the arm out, his weight easing back
  // off the lunge a column (never a frozen frame: the head settles, the post rocks home)
  c(2, 'finish', at('palmDrive', { x: LAST }), { post: 'lean', pdx: -1, fx: [field(LAST), fx('impact', 2, 'post', { pal: 'gentle' }), palm(2, 'gentle'), fx('sparks', 0, 'post', { pal: 'gentle', d: [1, -4] })] }),
  c(1, 'finish', at('palm', { x: PALM_AT, hdy: 1 }), { post: 'stand', pdx: 1, fx: [field(PALM_AT, 1), fx('impact', 3, 'post', { pal: 'gentle' }), fx('sparks', 1, 'post', { pal: 'gentle', d: [1, 3] })] }),
  c(1, 'finish', at('palm', { x: PALM_AT }), { post: 'stand', fx: [field(PALM_AT), fx('sparks', 2, 'post', { pal: 'gentle', d: [1, 3] })] }),
  c(2, 'finish', at('gather', { x: PALM_AT + 1 }), { post: 'stand', fx: [field(PALM_AT + 1, 1)] }),
  // home in a low skip back, the stance kept: no showy leap after the count
  ...hopHome('back', PALM_AT + 1, 'stand', { awake: true }, 2, { air: ['dash', 'tuck'], lifts: [2, 4, 3, 1] }),
  ...ending(),
]
const PALMS = ['Two Palms', 'Four Palms', 'Eight Palms', 'Sixteen Palms', 'Thirty-Two Palms', 'Sixty-Four Palms'] as const
const palmsMove = (t: Template): CelMove =>
  calls(celMove(t, { name: 'Eight Trigrams Sixty-Four Palms', shout: 'Eight Trigrams', on: ['edit'] }, palmsCels), {
    hit: PALMS[0],
    hit2: PALMS[1],
    hit3: PALMS[2],
    hit4: PALMS[3],
    hit5: PALMS[4],
    hit6: PALMS[5],
    finish: PALMS[5],
  })

// ------------------------------------------------------------------ Eight Trigrams Vacuum Palm (4.5 s)

// From where he stands: the Byakugan wakes over a seal; the air packed into
// his open palm; sunk back on the back foot, the palm drawn in to the hip;
// the palm thrust out as he steps into it (a frame's overshoot), the arm its
// own length, and the air flies off it ("Vacuum Palm!"): a knot on the palm,
// a crescent of it growing as it goes, and it slams the post's face, rocking
// him back, the biggest frame of the move; again, harder, sunk back further,
// and the post is knocked back in a burst of air and dust.
// the air off the palm, on the palm's face and the cone's axis
const air = (f: number): FxUse => fx('vacuum', f, 'hand', { d: [-2, -2] })
// the cone where it slams the post's face: it stays there as the blow rocks him back
const AIR: XY = [HOME - 1 - 10 - 2, GROUND - 4 - 2]
const airAt = (f: number): FxUse => fx('vacuum', f, AIR)
const auraAir = (): FxUse => fx('auraLow', 'cycle', 'feet', { back: true, pal: 'air' })
const knot = (): FxUse => fx('vacuum', 0, 'hand', { d: [-1, -2] })
// a cast's gather in the windup: sunk, not stepped back (the drawing rocks
// back on its own, its head two pixels behind; a column more and the head
// leaves the stage)
const BACK = (w: CastWeight) => (i: number): XY => [-CAST_WEIGHT[w].gather(i).x, 0]
// the cone breaking up after it lands
const fade = (f: number): FxUse => fx('vacuumFade', f, AIR)
// the second thrust's four frames on the post: it slams, the post knocked
// back in a burst of air and dust, the stage jolted, and it rocks home
const KNOCK: readonly CelOptions[] = [
  { post: 'lean', pdx: -2, flash: 'post', shake: [-1, 0], fx: [airAt(2), fx('impact', 0, 'post', { pal: 'air' }), palm(0, 'air')] },
  { post: 'lean', pdx: -2, shake: [1, 0], fx: [airAt(2), fx('impact', 1, 'post', { pal: 'air' }), palm(1, 'air'), fx('dust', 0, [9, GROUND], { pal: 'air' })] },
  { post: 'lean', pdx: -1, fx: [airAt(2), fx('impact', 2, 'post', { pal: 'air' }), palm(2, 'air'), fx('dust', 1, [9, GROUND], { pal: 'air' })] },
  { pdx: 1, fx: [fade(0), fx('impact', 3, 'post', { pal: 'air' }), palm(2, 'air'), fx('dust', 2, [9, GROUND], { pal: 'air' })] },
]
const vacuumCels: Cel[] = [
  ...postIn('byakugan', [K('sign1', { hdy: 1 }), K('sign1'), K('sign1', by({ hdy: 1 })), K('sign1', by())], i => (i >= 2 ? wake(i - 2) : [])),
  c(1, 'byakugan', K('sign1', by()), { post: 'stand', fx: wake(2) }),
  c(2, 'byakugan', K('sign2', by({ hdy: 1 })), { post: 'stand' }),
  // the air packed in: the hand out and open
  c(1, 'charge', K('gather', byT({ hdy: 1 })), { post: 'stand', fx: [auraAir()] }),
  ...hold(4, 'charge', K('gather', byT()), i => ({ post: 'stand', fx: [auraAir(), ...(i >= 1 ? [fx('sparks', i % 3, 'hand', { pal: 'air' })] : [])] })),
  // sunk back, the palm drawn in to the hip; thrust: it flies, growing, and
  // slams the post (the biggest frame), rocking him back; he settles
  // (light: the snap of the first, two pixels past the mark, the air's kick
  // on the release, not when it lands fifteen pixels off)
  ...cast({
    k: byT(),
    weight: 'light',
    recoil: 'release',
    gather: { n: 6, pose: 'windup', hold: true, d: BACK('light'), k: i => (i === 0 ? { hdy: 1 } : {}), o: { fx: [auraAir(), knot()] } },
    release: { n: 2, pose: 'palm', k: i => (i === 0 ? { hdy: 1 } : {}), o: i => (i === 0 ? { shout: true, fx: [auraAir(), air(0)] } : { fx: [air(1)] }) },
    impact: {
      n: 3,
      tag: 'hit',
      o: i => (i === 0 ? { post: 'lean', pdx: -1, flash: 'post', shake: [-1, 0] as XY, fx: [airAt(2), palm(0, 'air')] } : i === 1 ? { post: 'lean', pdx: -1, fx: [airAt(2), palm(1, 'air')] } : { fx: [fade(0), palm(1, 'air'), fx('sparks', 1, 'post', { pal: 'air' })] }),
    },
    settle: { n: 3, tag: 'hit', pose: 'gather', o: i => ({ fx: i === 0 ? [fade(1), palm(2, 'air')] : [palm(2, 'air')] }) },
  }),
  // again, harder: a longer step in, and the second thrust knocks the post back
  // (heavy: sunk deeper, the last palm's deep lunge held as a lean, thrown
  // back sliding in the dust as the air leaves the palm)
  ...cast({
    k: byT(),
    weight: 'heavy',
    recoil: 'release',
    // (from two columns in, so the slide back keeps his hair on the stage
    // through the jolt; the settle carries him the rest of the way home)
    at: HOME - 2,
    gather: { n: 6, tag: 'charge2', pose: 'windup', hold: true, d: BACK('heavy'), k: i => (i === 0 ? { dy: 0, hdy: 1 } : { dy: 0 }), o: { fx: [auraAir(), knot()] } },
    release: { n: 2, tag: 'release2', pose: 'palmDrive', k: i => (i === 0 ? { hdy: 1 } : {}), o: i => ({ fx: i === 0 ? [auraAir(), air(0)] : [air(1)] }) },
    impact: { n: 4, o: i => KNOCK[i]! },
    settle: { n: 3, pose: 'gather', d: i => [i === 0 ? 1 : 2, 0], k: i => (i === 0 ? {} : { head: undefined }), o: i => ({ fx: i === 0 ? [fade(1), fx('impact', 3, 'post', { pal: 'air' }), fx('sparks', 2, 'post', { pal: 'air' })] : [fx('sparks', 2, 'post', { pal: 'air' })] }) },
  }),
  ...ending(),
]
const vacuumMove = (t: Template): CelMove => celMove(t, { name: 'Eight Trigrams Vacuum Palm', shout: 'Vacuum Palm' }, vacuumCels)

// ------------------------------------------------------------------ Gentle Fist (1.8 s)

// For an edit: the post poofs in, the glide in low, one palm (its pop and
// ring on the post), the hop home, the smirk.
const quickCels: Cel[] = [
  ...postIn('ready', [K('gather', { hdy: 1, eyes: 'focus' }), K('gather', { eyes: 'focus' })]),
  // (the palm lands with a single jolt, then the hit-stop's second frame)
  ...runIn('dash', { style: 'glide', look: { eyes: 'focus', head: 'turn' }, ready: 'ready', from: HOME - 1, to: PALM_AT, strike: { pose: 'palm', n: 1, post: 'lean', flash: 'post', shake: [-1, 0], fx: [palm(0)] } }),
  c(1, 'impact', K('palm', { x: PALM_AT, eyes: 'focus', head: 'turn' }), { post: 'lean', fx: [palm(0)] }),
  c(1, 'impact', K('palm', { x: PALM_AT, eyes: 'focus', head: 'turn' }), { post: 'stand', pdx: -1, fx: [palm(1)] }),
  ...hopHome('back', PALM_AT, 'stand', {}, 1),
  ...ending(),
]
const quickMove = (t: Template): CelMove => celMove(t, { name: 'Gentle Fist', shout: 'Gentle Fist', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.5 s)

// The end of a turn, his way, sharp and smug: the ram seal, the Byakugan
// flaring (the veins, a glint at each temple); a step into the Gentle Fist's
// stance and the palm snapped out at the arena, a pop of chakra bursting off
// it (the gesture, ringing out); then he straightens and folds his arms,
// one eye open on you, the smirk of a genius, the Byakugan glinting once
// more, and lets them fall.
const cheerCels: Cel[] = [
  c(1, 'flare', K('sign1', by({ hdy: 1 })), { fx: wake(0) }),
  c(1, 'flare', K('sign1', by()), { fx: wake(1) }),
  c(1, 'flare', K('gather', by({ x: HOME - 1, hdy: 1 })), { fx: wake(2) }),
  c(1, 'stance', K('palm', by({ head: 'turn', x: HOME - 2 })), { fx: [fx('palmFlash', 0, 'hand', { pal: 'gentle', d: [-1, 0] })] }),
  c(1, 'stance', K('palm', by({ head: 'turn', x: HOME - 2 })), { fx: [fx('palmFlash', 1, 'hand', { pal: 'gentle', d: [-1, 0] })] }),
  c(1, 'stance', K('palm', { ...smug, head: 'turn', x: HOME - 2, hdy: 1 }), { fx: [fx('palmFlash', 2, 'hand', { pal: 'gentle', d: [-1, 0] })] }),
  // the fold (the roster's cheer), the head tipped; the Byakugan's glint once more (the accent)
  c(1, 'cheer', K('crossed', { ...smug, hdy: 1 })),
  c(2, 'cheer', K('crossed', { ...smug, hdx: 1, held: 2 })),
  c(1, 'cheer', K('crossed', { ...smug, hdx: 1, held: 4, hdy: 1 }), { fx: wake(1) }),
  c(1, 'cheer', K('crossed', { ...smug, hdx: 1, held: 5 })),
  c(1, 'recover', K('ease', smug)),
  c(1, 'recover', K('idle1', { ...smug, hdy: 1 })),
  c(2, 'recover', K('idle0', smug)),
]
const cheerMove = (t: Template): CelMove => celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)

// His moves, in the robe.
export const nejiMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [rotationMove(t), palmsMove(t), vacuumMove(t)],
  quick: quickMove(t),
  cheer: cheerMove(t),
})
