// Deidara's moves as cels, hand-keyed at 10 fps (kit.ts says how to read and
// write them). Clay chewed in the palms' mouths, moulded into birds, spiders
// and a dragon, and art is an explosion: every move ends on the one-handed
// seal and a bang, and he braces against each of his own blasts (a step
// back, the eyes screwed shut) before throwing his arms wide at it. His hands
// are never still: chewing, moulding, flicking, pointing his work at the
// post. (His cloak: the template; his pouch and the lump of clay in his hands
// are overlays in ninja/deidara.ts.) His weight is LIGHT (kit.ts's cast
// weights): a quick dip, a step 2 px past its mark, a hop of glee after a
// bang. Each jutsu has its own key pose: the birds flung up off the raised
// hand (C1), the palms slammed to the floor (the spiders), the clay tossed
// high for the dragon (C2); and his holds never sit still: the head and the
// hands follow through inside them.
//   C1               clay chewed and moulded into two birds that fly onto
//                    the post; "Katsu!" and it goes up in a fireball
//   Clay Spiders     dropped from the palms, they scuttle across the floor
//                    to the post at his pointing and go off one after another
//   C2 Dragon        the clay tossed up swells into a dragon over the arena
//                    that spits bombs at the post, then dives on it: the big one
//   Clay Bird        (the quick strike) one bird flicked off the palm onto the
//                    post, and a bang

import { celMove } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { GROUND, HOME, POST_HIT, POST_X } from '../stage.ts'
import type { Cel, CelMove, FxUse, NinjaCel, Template, XY } from '../types.ts'
import { K, c, cast, dustAt, fx, hold, postIn, postOut } from './kit.ts'

const bird = (x: number, y: number, f: number | 'cycle' = 'cycle', phase = 0, pal?: string): FxUse => fx('clayBird', f, [x, y], { phase, ...(pal ? { pal } : {}) })
// the big bang (22 x 22, standing on the ground under the post)
const katsu = (f: number): FxUse => fx('katsu', f, AT.postBase)
// a small one
const pop = (f: number, at: XY): FxUse => fx('impact', f, at, { pal: 'fire' })
// the head turned three-quarters to the post, for a flick or a pointing
const turn = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', ...o })
// braced against his own blast: a step back, the eyes screwed shut
const brace = (pose = 'seal', x = HOME + 1): NinjaCel => K(pose, { x, eyes: 'shut' })
// the clay chewed: the mouths in his palms biting down on it and letting go
// every two frames (his own 'chew' drawing), the body still; the head nods
// on a slower beat, a pixel held three frames
const chewing = (i: number, o: Partial<NinjaCel> = {}): NinjaCel => K(Math.floor(i / 2) % 2 ? 'chew' : 'gather', { eyes: 'smug', ...(Math.floor(i / 3) % 2 ? { hdy: 1 } : {}), ...o })
const chew = (n: number, o: Partial<NinjaCel> = {}, from = 0): Cel[] => Array.from({ length: n }, (_, i) => c(1, 'chew', chewing(from + i, o), { post: 'stand' }))
// the last of every move: the breath let out, and standing
const settle = (last: readonly NinjaCel[] = []): NinjaCel[] => [...last, K('idle1', { hdy: 1, eyes: 'smug' }), K('idle0', { eyes: 'smug' }), K('idle0')]

// ------------------------------------------------------------------ C1 (4.9 s)

// the birds' flight: off the hand, up over the arena, round onto the post
const FLIGHT_A: readonly XY[] = [
  [20, 6],
  [16, 4],
  [12, 4],
  [8, 6],
  [7, 9],
  [8, 11],
]
const FLIGHT_B: readonly XY[] = [
  [21, 12],
  [19, 15],
  [17, 17],
  [16, 18],
  [15, 17],
  [15, 17],
]
// where they cling: on the post's top, on its side
const PERCH_A: XY = [9, 11]
const PERCH_B: XY = [15, 17]

const c1Cels: Cel[] = [
  ...postIn('chew', [0, 1, 2, 3].map(i => chewing(i))),
  // working it in his palms, his weight drawn back a pixel
  ...chew(3, { x: HOME + 1 }, 4),
  // moulded: a bird held out on the fist, then a second, the head cocked at them
  c(1, 'mold', K('thumbs', { eyes: 'smug', hdy: 1 }), { post: 'stand', fx: [fx('sigh', 1, 'hand', { d: [-2, 0] })] }),
  c(1, 'mold', K('thumbs', { eyes: 'smug' }), { post: 'stand', fx: [bird(20, 15, 1)] }),
  c(1, 'mold', K('thumbs', { eyes: 'smug', hdx: -1 }), { post: 'stand', fx: [bird(20, 15, 1)] }),
  c(1, 'mold', K('thumbs', { eyes: 'happy', hdx: -1 }), { post: 'stand', fx: [bird(20, 15, 2), bird(23, 19, 0)] }),
  c(2, 'mold', K('thumbs', { eyes: 'happy', hdx: -1, hdy: 1 }), { post: 'stand', fx: [bird(20, 15, 'cycle'), bird(23, 19, 2)] }),
  // THE KEY POSE: flung up off the raised hand with a light step 2 px past
  // its mark; they fly over the arena and round onto the post while he
  // points them on
  ...FLIGHT_A.map((a, i) =>
    c(1, 'release', K(i < 2 ? 'raise' : i < 4 ? 'raiseWind' : 'strike', i < 4 ? { eyes: 'happy', x: i === 0 ? HOME - 3 : HOME - 1, ...(i === 1 ? { hdy: 1 } : {}) } : turn({ eyes: 'focus', x: HOME - 1, ...(i === 5 ? { hdx: -1 } : {}) })), { post: 'stand', fx: [bird(a[0], a[1], 'cycle'), bird(FLIGHT_B[i]![0], FLIGHT_B[i]![1], 'cycle', 1)] }),
  ),
  c(1, 'release', K('strike', turn({ eyes: 'smug', x: HOME - 1, hdy: 1 })), { post: 'stand', fx: [bird(...PERCH_A, 1), bird(...PERCH_B, 1)] }),
  // the seal: "Katsu!"
  c(1, 'katsu', K('seal', { eyes: 'happy', hdy: 1 }), { post: 'stand', shout: true, fx: [bird(...PERCH_A, 1), bird(...PERCH_B, 1)] }),
  c(1, 'katsu', K('seal', { eyes: 'happy' }), { post: 'stand', fx: [bird(...PERCH_A, 1), bird(...PERCH_B, 1)] }),
  // art is an explosion: braced against it (the camera shaken), then the
  // arms flung wide at it
  c(2, 'impact', brace(), { post: 'lean', fx: [katsu(0), bird(...PERCH_A, 1, 0, 'hit'), bird(...PERCH_B, 1, 0, 'hit')], shake: [-1, 0], flash: 'post' }),
  c(1, 'impact', K('spread', { eyes: 'happy', hdy: 1 }), { fx: [katsu(1)], shake: [1, 0] }),
  c(1, 'impact', K('spread', { eyes: 'happy' }), { fx: [katsu(2)] }),
  c(2, 'impact', K('spreadWind', { eyes: 'happy', hdx: 1 }), { post: 'scorch', fx: [katsu(3)] }),
  // a fist thrown up at it, a hop of glee off the floor: art!
  c(1, 'impact', K('raise', { eyes: 'happy', dy: 1 }), { post: 'scorch', fx: [katsu(4)] }),
  c(1, 'impact', K('raise', { eyes: 'happy', lift: 2 }), { post: 'scorch', fx: [katsu(4)] }),
  c(1, 'impact', K('raiseWind', { eyes: 'happy', lift: 3 }), { post: 'scorch', fx: [katsu(4)] }),
  c(1, 'impact', K('raise', { eyes: 'happy', lift: 1 }), { post: 'scorch', fx: [katsu(4), fx('smoke', 3, [POST_X + 1, GROUND - 6])] }),
  c(1, 'impact', K('raise', { eyes: 'happy', dy: 1, hdy: 1 }), { post: 'scorch', fx: [fx('smoke', 3, [POST_X + 1, GROUND - 6]), dustAt(0, HOME)] }),
  // the last of the smoke drifting off it
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'scarred', fx: [fx('smoke', 3, [POST_X + 1, GROUND - 7]), fx('embers', 2, AT.postFoot)] }),
  c(1, 'recover', K('crossed', { eyes: 'smug' }), { post: 'scarred', fx: [fx('smoke', 4, [POST_X + 1, GROUND - 8]), fx('embers', 3, AT.postFoot)] }),
  c(1, 'recover', K('crossedWind', { eyes: 'smug' }), { post: 'scarred', fx: [fx('wisp', 2, [POST_X + 1, GROUND - 9])] }),
  ...postOut('recover', settle([K('thumbs', { eyes: 'smug' })]), 'scarred'),
]

// ------------------------------------------------------------------ Clay Spiders (4.9 s)

// two spiders dropped at his feet, scuttling a pixel a frame: the first to
// the post's foot, the second (two frames behind) past it to the post and up
// onto its top, where they sit
const RUN_A = (t: number): XY => [Math.max(16, 24 - t), GROUND]
const RUN_B = (t: number): XY => {
  const u = t - 2
  if (u < 0) return [25, GROUND]
  if (u < 6) return [24 - u, GROUND]
  const climb: readonly XY[] = [
    [17, GROUND - 2],
    [15, GROUND - 5],
    [13, GROUND - 8],
    [11, 14],
    [10, 12],
  ]
  return climb[Math.min(climb.length - 1, u - 6)]!
}
// scuttling: the legs' three frames while it moves, its legs gathered when it sits
const crawling = (t: number): FxUse[] => {
  const a = RUN_A(t)
  const b = RUN_B(t)
  return [fx('claySpider', a[0] > 16 ? t % 3 : 1, a), ...(t >= 2 ? [fx('claySpider', b[0] > 10 ? (t + 1) % 3 : 1, b)] : [])]
}
const SAT_A: XY = [16, GROUND]
const SAT_B: XY = [10, 12]
// his body while they scuttle: never a held drawing, the head and the hand
// following through inside each pose (a pixel of the head, the sleeve's
// stir, the breath): rising off the floor; the point after them, a light step
// 2 px past its mark and back; then a thumb up at his work, the head cocked
// and bobbing as they climb
const SCUTTLE: readonly NinjaCel[] = [
  K('crouch', { eyes: 'focus', hdy: 1 }),
  K('strike', turn({ eyes: 'smug', x: HOME - 3, hdy: 1 })),
  K('strike', turn({ eyes: 'smug', x: HOME - 1 })),
  K('strikeWind', turn({ eyes: 'smug', x: HOME - 1, hdx: -1 })),
  K('strike', turn({ eyes: 'smug', x: HOME - 1, hdy: 1 })),
  K('strikeIn', turn({ eyes: 'smug', x: HOME - 1 })),
  K('strikeWind', turn({ eyes: 'happy', x: HOME - 1, hdx: -1 })),
  K('thumbs', { eyes: 'smug', hdy: 1 }),
  K('thumbs', { eyes: 'smug', hdx: -1 }),
  K('thumbs', { eyes: 'smug' }),
  K('thumbs', { eyes: 'smug', hdy: 1 }),
  K('thumbs', { eyes: 'happy', hdx: -1 }),
  K('thumbs', { eyes: 'happy', hdx: -1, hdy: 1 }),
  K('thumbs', { eyes: 'smug' }),
]
const spidersCels: Cel[] = [
  ...postIn('chew', [0, 1, 2].map(i => chewing(i))),
  ...chew(3, { x: HOME + 1 }, 3),
  // THE KEY POSE: the palms slammed to the floor, sunk into it (the stage
  // jolted): the spiders drop out of them
  c(1, 'drop', K('slam', turn({ eyes: 'focus', dy: 1, hdy: 1 })), { post: 'stand', fx: [dustAt(0, 25)], shake: [0, 1] }),
  c(1, 'drop', K('slam', turn({ eyes: 'focus', dy: 1, hdx: -1 })), { post: 'stand', fx: [dustAt(1, 25), fx('claySpider', 1, [25, GROUND])] }),
  // and off they go at his pointing, while he watches, pleased with himself
  ...SCUTTLE.map((k, t) => c(1, 'scuttle', k, { post: 'stand', fx: crawling(t) })),
  // the seal sets them off with a step in (the launch: the shout comes with
  // it): the one at its foot goes off, lit white, then the one on top
  c(1, 'release', K('seal', { eyes: 'happy', x: HOME - 1, hdy: 1 }), { post: 'stand', fx: [fx('claySpider', 3, SAT_A), fx('claySpider', 3, SAT_B)] }),
  c(1, 'release', K('seal', { eyes: 'happy', x: HOME - 1 }), { post: 'stand', fx: [fx('claySpider', 3, SAT_A), fx('claySpider', 1, SAT_B)] }),
  c(1, 'release', K('sealWind', { eyes: 'happy', x: HOME - 1, hdx: -1 }), { post: 'stand', fx: [fx('claySpider', 3, SAT_A), fx('claySpider', 1, SAT_B)] }),
  // braced against it (the camera shaken), then the arms flung wide at it
  c(2, 'impact', brace(), { post: 'lean', fx: [fx('claySpider', 3, SAT_B), pop(0, [16, 21])], shake: [-1, 0], flash: 'post' }),
  c(1, 'impact', K('seal', { x: HOME + 1, eyes: 'shut', hdy: 1 }), { post: 'stand', pdx: -1, fx: [fx('claySpider', 3, SAT_B), pop(1, [16, 21])], shake: [1, 0] }),
  c(1, 'impact', K('spread', { eyes: 'happy', hdy: 1 }), { post: 'scorch', fx: [pop(2, [16, 21]), pop(0, [10, 10])] }),
  c(1, 'impact', K('spread', { eyes: 'happy' }), { post: 'scorchLean', pdy: 1, fx: [pop(3, [16, 21]), pop(1, [10, 10])], shake: [-1, 0] }),
  c(1, 'impact', K('spreadWind', { eyes: 'happy', hdx: 1 }), { post: 'scorch', fx: [fx('smoke', 3, [16, GROUND]), pop(2, [10, 10])], shake: [1, 0] }),
  c(1, 'impact', K('spreadWind', { eyes: 'happy' }), { post: 'scorch', fx: [fx('smoke', 3, [16, GROUND]), pop(3, [10, 10])] }),
  // a fist thrown up at it, a little hop of glee
  c(1, 'impact', K('raise', { eyes: 'happy', lift: 1 }), { post: 'scorch', fx: [fx('smoke', 3, [16, GROUND - 1])] }),
  c(1, 'impact', K('raiseWind', { eyes: 'happy', lift: 2 }), { post: 'scorch', fx: [fx('smoke', 4, [16, GROUND - 2]), fx('wisp', 1, [16, GROUND - 3])] }),
  c(1, 'impact', K('raise', { eyes: 'happy', dy: 1, hdy: 1 }), { post: 'scorch', fx: [fx('wisp', 1, [16, GROUND - 4]), dustAt(0, HOME)] }),
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'scarred', fx: [fx('wisp', 2, [16, GROUND - 5]), fx('embers', 3, AT.postFoot)] }),
  c(1, 'recover', K('crossedWind', { eyes: 'smug' }), { post: 'scarred' }),
  ...postOut('recover', settle([K('thumbs', { eyes: 'smug' })]), 'scarred'),
]

// ------------------------------------------------------------------ C2 Dragon (5.5 s)

// the dragon (the summon sprite, 30 x 14, facing left; its anchor the belly
// over its tucked legs) over the arena, bobbing as it flies (its curled tail
// clear of his hair); its open jaws, raised on the neck, where the bombs leave
const SKY: XY = [13, 12]
const dragon = (dy = 0, at: XY = SKY): FxUse => fx('c2', 0, [at[0], at[1] + dy], { back: true })
const MOUTH: XY = [SKY[0] - 10, SKY[1] - 6]
// a bomb (a little clay spider lit white) dropping from the mouth onto the post
const bomb = (step: number): FxUse[] => {
  const path: readonly XY[] = [
    [MOUTH[0] + 1, MOUTH[1] + 4],
    [MOUTH[0] + 4, MOUTH[1] + 8],
    [POST_HIT[0] - 1, POST_HIT[1] + 1],
  ]
  const p = path[step]
  return p ? [fx('claySpider', 3, p)] : []
}
// lit, about to go off: a spider's white-hot frame
const lit = (at: XY): FxUse => fx('claySpider', 3, at)
// The carpet: it flies on over the arena, a pixel every two frames, and drops
// a string of bombs from its belly, from near him out to the far side, each
// falling two frames to the floor and lying there lit; at his seal they go
// off along the floor one after another, from the far side (by the post)
// back toward him (fx/akatsuki.ts's groundBurst), and the dragon after them.
const OVER = (t: number): XY => [SKY[0] - Math.floor(t / 2), SKY[1] - 1 + (t % 2)]
const LAND = [18, 13, 7, 2]
const falling = (t: number): FxUse[] =>
  LAND.flatMap((x, k) => {
    const u = t - k
    return u < 0 ? [] : u === 0 ? [lit([x, 15])] : u === 1 ? [lit([x, 19])] : [lit([x, GROUND])]
  })
// the chain along the floor, left to right: the one at x goes off at frame
// (its place from the left), a frame apart, each burst five frames
const CHAIN = [...LAND].reverse()
const chain = (t: number): FxUse[] =>
  CHAIN.flatMap((x, k) => {
    const u = t - k
    return u < 0 ? [lit([x, GROUND])] : u <= 4 ? [fx('groundBurst', u, [x, GROUND])] : []
  })
// and the dragon itself goes up at the seal: a cluster of bursts over its
// body, a frame apart, so it comes apart rather than vanishing
const LAST = OVER(12)
const BOOM: readonly [number, number, number][] = [
  [LAST[0] - 8, LAST[1] - 7, 0],
  [LAST[0] + 1, LAST[1] - 9, 0],
  [LAST[0] + 8, LAST[1] - 5, 1],
  [LAST[0] - 1, LAST[1] - 3, 2],
]
const boom = (t: number): FxUse[] => BOOM.flatMap(([x, y, d]) => (t - d >= 0 && t - d <= 4 ? [fx('airBurst', t - d, [x, y])] : []))
// his pointing the dragon on along the arena as it lays the carpet: the arm
// thrown up and out after it, the head following it a pixel at a time
const CARPET: readonly Partial<NinjaCel>[] = [{ hdy: 1 }, {}, { hdx: -1 }, { hdx: -1, hdy: 1 }, {}]
const c2Cels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1, eyes: 'smug' }), K('sign1', { eyes: 'smug' }), K('sign2', { hdy: 1 }), K('sign2')]),
  // a lump of clay chewed and, THE KEY POSE, tossed high off the raised hand
  // with a light step after it
  ...chew(3, {}, 1),
  c(1, 'mold', K('raise', { eyes: 'smug', x: HOME - 3, hdy: 1 }), { post: 'stand', fx: [fx('sigh', 1, 'hand')] }),
  c(1, 'mold', K('raise', { eyes: 'smug', x: HOME - 1 }), { post: 'stand', fx: [bird(24, 4, 0)] }),
  c(1, 'mold', K('raiseWind', { eyes: 'happy', x: HOME - 1, hdx: -1 }), { post: 'stand', fx: [bird(18, 4, 1)] }),
  // a seal, and it swells into the dragon over the arena in a puff
  c(1, 'appear', K('seal', { eyes: 'happy', hdy: 1 }), { post: 'stand', shout: true, fx: [fx('smoke', 1, [SKY[0] - 2, SKY[1] + 1]), fx('smoke', 1, [SKY[0] + 6, SKY[1] - 2])] }),
  c(1, 'appear', K('seal', { eyes: 'happy' }), { post: 'stand', fx: [fx('smoke', 2, [SKY[0] - 2, SKY[1] + 1]), fx('smoke', 2, [SKY[0] + 6, SKY[1] - 2])] }),
  c(1, 'appear', K('seal', { eyes: 'happy', hdx: -1 }), { post: 'stand', fx: [dragon(), fx('smoke', 3, [SKY[0] - 2, SKY[1] + 1]), fx('smoke', 3, [SKY[0] + 6, SKY[1] - 2])] }),
  c(2, 'appear', K('sealWind', { eyes: 'smug' }), { post: 'stand', fx: [dragon(), fx('smoke', 4, [SKY[0] - 2, SKY[1] + 1])] }),
  // it wheels over the arena, his arms flung wide at his work
  c(1, 'fly', K('spread', { eyes: 'happy', x: HOME + 1, hdy: 1 }), { post: 'stand', fx: [dragon(-1)] }),
  c(1, 'fly', K('spread', { eyes: 'happy', x: HOME + 1 }), { post: 'stand', fx: [dragon(-1)] }),
  c(2, 'fly', K('spreadWind', { eyes: 'happy', x: HOME + 1, hdx: 1 }), { post: 'stand', fx: [dragon()] }),
  // it spits a bomb onto the post at his pointing (a light step 2 px past)
  ...[0, 1, 2].map(s => c(1, 'spit', K('strike', turn({ eyes: 'happy', x: s === 0 ? HOME - 3 : HOME - 1, ...(s === 0 ? { hdy: 1 } : {}) })), { post: 'stand', fx: [dragon(s === 0 ? -1 : 0), ...bomb(s)] })),
  // braced low against it, the eyes screwed shut (the camera shaken)
  c(2, 'hit', K('windup', { eyes: 'shut' }), { post: 'lean', fx: [dragon(), pop(0, [POST_HIT[0] - 1, POST_HIT[1] + 1])], shake: [-1, 0], flash: 'post' }),
  c(1, 'hit', K('windup', { eyes: 'happy', hdy: 1, x: HOME - 1 }), { post: 'stand', pdx: -1, fx: [dragon(1), pop(1, [POST_HIT[0] - 1, POST_HIT[1] + 1])], shake: [1, 0] }),
  c(1, 'hit', K('windup', { eyes: 'happy' }), { post: 'scorch', fx: [dragon(1), pop(2, [POST_HIT[0] - 1, POST_HIT[1] + 1])] }),
  // it wheels on over the arena and lays its bombs along the floor as he
  // points it on, the arm thrown up after it
  ...CARPET.map((o, t) => c(1, 'carpet', K('alert', { eyes: 'focus', ...o }), { post: t % 3 === 2 ? 'scorchLean' : 'scorch', fx: [dragon(0, OVER(t)), ...falling(t)] })),
  // "Katsu!": they go off along the floor one after another, from the post
  // back toward him; braced as they reach him (the camera shaken), then his
  // arms flung wide
  ...Array.from({ length: 8 }, (_, t) =>
    c(1, t < 2 ? 'katsu' : 'impact', t < 2 ? K('seal', { eyes: 'happy', ...(t === 0 ? { hdy: 1 } : {}) }) : t < 4 ? K('seal', { eyes: 'happy', ...(t === 3 ? { hdx: -1 } : {}) }) : t < 6 ? brace() : K(t < 7 ? 'spread' : 'spreadWind', { eyes: 'happy', x: HOME + 1, ...(t === 6 ? { hdy: 1 } : {}) }), {
      post: t % 3 === 2 ? 'scorchLean' : 'scorch',
      fx: [dragon(0, OVER(5 + t)), ...(t < 2 ? falling(5) : chain(t - 2))],
      ...(t === 4 ? { shake: [-1, 0] as XY } : t === 5 ? { shake: [1, 0] as XY } : {}),
    }),
  ),
  // and the dragon itself goes up in a cluster of bursts, his arms still
  // flung wide at it (it comes apart as it falls, the bursts eating it from below)
  c(1, 'impact', K('spread', { eyes: 'happy', x: HOME + 1 }), { post: 'scorch', fx: [dragon(0, LAST), ...boom(0), ...chain(6)], shake: [-1, 0] }),
  c(1, 'impact', K('spreadWind', { eyes: 'shut', x: HOME + 1, hdy: 1 }), { post: 'scorchLean', fx: [fx('c2', 0, [LAST[0], LAST[1] - 4], { sink: 4 }), ...boom(1), ...chain(7)], shake: [1, 0] }),
  c(1, 'impact', K('spread', { eyes: 'happy' }), { post: 'scorchLean', fx: [fx('c2', 0, [LAST[0], LAST[1] - 4], { sink: 4 }), ...boom(1)] }),
  // and a fist thrown up at it with a little hop of glee: art!
  c(1, 'impact', K('raise', { eyes: 'happy', hdy: 1 }), { post: 'scarred', fx: [fx('c2', 0, [LAST[0], LAST[1] - 8], { sink: 8 }), ...boom(2)] }),
  c(1, 'impact', K('raise', { eyes: 'happy', lift: 2 }), { post: 'scarred', fx: boom(3) }),
  c(1, 'impact', K('raiseWind', { eyes: 'happy', lift: 1 }), { post: 'scarred', fx: [...boom(4), fx('embers', 2, AT.postFoot)] }),
  c(1, 'impact', K('raise', { eyes: 'happy', dy: 1 }), { post: 'scarred', fx: [...boom(5), fx('embers', 2, AT.postFoot), dustAt(0, HOME)] }),
  c(1, 'recover', K('crossed', { eyes: 'smug', hdy: 1 }), { post: 'scarred', fx: [...boom(6), fx('embers', 2, AT.postFoot), dustAt(1, HOME), fx('smoke', 2, [LAST[0] + 1, LAST[1] + 4])] }),
  ...postOut('recover', settle([K('thumbs', { eyes: 'smug' })]), 'scarred', i => (i === 0 ? [fx('embers', 3, AT.postFoot), fx('smoke', 3, [LAST[0] + 1, LAST[1] + 3]), dustAt(2, HOME)] : i === 1 ? [fx('smoke', 4, [LAST[0] + 1, LAST[1] + 2]), fx('wisp', 0, [LAST[0] + 1, LAST[1] + 1]), fx('embers', 3, AT.postFoot)] : i === 2 ? [fx('wisp', 1, [LAST[0] + 1, LAST[1]]), fx('embers', 3, AT.postFoot)] : [fx('wisp', 2, [LAST[0] + 1, LAST[1] - 1])])),
]

// ------------------------------------------------------------------ Clay Bird (1.8 s)

const QUICK_FLIGHT: readonly XY[] = [
  [20, 8],
  [15, 10],
]
// Light and ranged: a bite of clay, the bird on his fist, flicked off with a
// light step 2 px past its mark, the kick of it back onto his heels as it
// swoops; it pops on the post (a single jolt), braced, then a little hop.
const clayBirdCels: Cel[] = [
  ...postIn('ready', [K('gather', { eyes: 'smug' }), K('gather', { eyes: 'smug', hdy: 1 })]),
  ...cast({
    weight: 'light',
    recoil: 'release',
    k: { eyes: 'happy' },
    gather: { pose: 'thumbs', k: i => ({ eyes: 'smug', ...(i === 0 ? { hdy: 1 } : {}) }), fx: () => [bird(20, 15, 1)] },
    release: { tag: 'flick', pose: ['raise', 'strike', 'strike'], k: i => (i === 0 ? {} : turn()), o: i => (i === 0 ? { shout: true } : {}), fx: i => [i < 2 ? bird(...QUICK_FLIGHT[i]!, i === 0 ? 0 : 2) : bird(POST_HIT[0], POST_HIT[1] - 2, 1)] },
    impact: {
      n: 4,
      pose: ['seal', 'seal', 'spread', 'spread'],
      k: i => (i < 2 ? { eyes: 'shut' } : i === 2 ? { hdy: 1 } : {}),
      o: i => ({ post: i === 0 ? 'lean' : 'scorch', ...(i === 0 ? { flash: 'post' as const, shake: [1, 0] as XY } : {}) }),
      fx: i => [fx('clayPop', Math.max(0, i - 1), 'post')],
    },
    settle: { pose: ['spread', 'spreadWind', 'thumbs'], k: i => (i === 2 ? { eyes: 'smug' } : {}), fx: i => (i === 0 ? [fx('clayPop', 3, 'post')] : i === 1 ? [fx('embers', 2, AT.postFoot)] : [fx('embers', 3, AT.postFoot)]) },
  }),
  ...postOut('recover', settle([K('thumbs', { eyes: 'smug' })]), 'scarred'),
]

// ------------------------------------------------------------------ the cheer (1.7 s)

// The clay bird gesture: a bite of clay chewed in the palm, moulded into a
// bird held up on his fist, flicked off the raised hand into the air, the
// one-handed seal, and it pops over his head (a jolt); the one accent, a
// light hop of glee with the arms flung wide; landed, a thumb up at his art
// (quick and flicky where Kisame's is heavy; no folded arms).
const HELD: XY = [24, 4]
const cheerCels: Cel[] = [
  c(1, 'art', K('chew', { eyes: 'smug', hdy: 1 })),
  c(1, 'art', K('gather', { eyes: 'smug' })),
  c(1, 'art', K('thumbs', { eyes: 'happy', hdy: 1 }), { fx: [bird(20, 15, 1)] }),
  // held up on the raised hand, admired, and flicked off it into the air
  c(1, 'art', K('raise', { eyes: 'happy' }), { fx: [bird(...HELD, 0)] }),
  c(1, 'art', K('raiseWind', { eyes: 'happy', hdx: -1 }), { fx: [bird(...HELD, 1)] }),
  c(1, 'art', K('raise', { eyes: 'happy', hdy: 1 }), { fx: [bird(22, 3, 2)] }),
  c(1, 'art', K('raise', { eyes: 'happy' }), { fx: [bird(19, 3, 1)] }),
  // the seal: it pops over his head (a jolt)
  c(1, 'art', K('seal', { eyes: 'shut', hdy: 1 }), { fx: [pop(0, [17, 4])], shake: [1, 0] }),
  // the hop of glee, arms flung wide: art!
  c(1, 'cheer', K('spread', { eyes: 'happy', lift: 1 }), { fx: [pop(1, [17, 4])] }),
  c(1, 'cheer', K('spread', { eyes: 'happy', lift: 3 }), { fx: [pop(2, [17, 4])] }),
  c(1, 'cheer', K('spreadWind', { eyes: 'happy', lift: 1 }), { fx: [pop(3, [17, 4])] }),
  // landed, a thumb up at it
  c(1, 'cheer', K('thumbs', { eyes: 'smug', dy: 1, hdy: 1 }), { fx: [dustAt(0, HOME)] }),
  c(1, 'cheer', K('idle1', { eyes: 'smug', hdy: 1 })),
  c(2, 'cheer', K('idle0', { eyes: 'smug' })),
]

// ------------------------------------------------------------------ the builder

export const deidaraMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => ({
  moves: [
    celMove(t, { name: 'C1', shout: 'Katsu', dojutsu: false, on: ['shell'] }, c1Cels),
    celMove(t, { name: 'Clay Spiders', shout: 'Clay Spiders', dojutsu: false, on: ['edit'] }, spidersCels),
    celMove(t, { name: 'C2 Dragon', shout: 'C2 Dragon', dojutsu: false }, c2Cels),
  ],
  quick: celMove(t, { name: 'Clay Bird', shout: 'Clay Bird', on: ['edit'], quick: true, dojutsu: false }, clayBirdCels),
  cheer: celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels),
})
