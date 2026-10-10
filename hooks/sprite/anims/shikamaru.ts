// Shikamaru's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to
// write one). Every jutsu is the Nara clan's: the Rat seal (sign2, the
// hands pressed together at the collar) while his shadow does the work, so
// the acting is in the shadow, in his strain (the shoulders heaving against
// the seal, sign2Wind; the fist hauling at a distance) and in his face:
// focus as it creeps, the smirk when it takes hold, the bored half-lids when
// he lets go. But never planted: he sinks into the seal as the shadow runs,
// steps in as it takes the post and rocks back with the catch, and when he
// moves the bound post moves with him. The shadow is a solid indigo band
// with a violet rim, run out from under his feet along the floor
// (shadowLine, behind everything) and pooling under the post; what rises out
// of it at the post (shadowBind's tendrils, shadowHands, shadowStitch's
// spikes) is drawn in front of the post, and climbs it, so a short stage
// that hides the floor still shows the bind. No stage tint: the bind lands
// as the post's flash.

import { celMove } from '../cels.ts'
import { wear } from '../dress.ts'
import { AT } from '../fx/index.ts'
import { HOME } from '../stage.ts'
import { VEST } from '../templates/vest.ts'
import type { Cel, FxUse, NinjaCel, PoseGrid } from '../types.ts'
import type { CelOptions } from './kit.ts'
import { K, c, cast, fx, postIn, postOut } from './kit.ts'

// ------------------------------------------------------------------ his own drawings

// The Rat seal leant from the waist, the head tipped three pixels over and
// one down with it (the mimic: the bound post leans as he leans): the vest's
// sign2 with its shoulders and arms sheared a pixel over above the hips.
const lean = (dx: number): PoseGrid => {
  const base = VEST.poses['sign2']!
  const rows = base.rows.map((r, y) => (y >= 10 ? r : dx < 0 ? r.slice(1) + '.' : '.' + r.slice(0, -1)))
  // (two pixels the far way: the head stays whole on the stage)
  return { ...base, rows, head: [dx < 0 ? -3 : 2, 1] }
}
// The catch (Shadow Possession): dropped into a crouch on his heels, the Rat
// seal held under the chin, the knees out wide: two pixels lower and a lot
// wider than standing in the seal.
const KNEEL: readonly string[] = [
  ...Array.from({ length: 6 }, () => '..........................'),
  '......oooooooooooooo......',
  '....oncnvvvwwmmmwwwxlo....',
  '....onmovvwwwmwwwxxolo....',
  '....onmovvwoskowwxxolo....',
  '....onmovwwoskowxxxolo....',
  '..ooonmnnnosskkommmoloo...',
  '.ouuuoooooooooooooooouuto.',
]
export const SHIKAMARU_POSES = {
  // leaning toward the post, and away from it
  sign2L: lean(-1),
  sign2R: lean(1),
  // crouched in the seal
  kneel: { as: 'signs2', rows: KNEEL, head: [0, 2], eyes: 'focus' },
} as const satisfies Record<string, PoseGrid>
const T = wear(VEST, SHIKAMARU_POSES)

// his shadow along the floor, its frame (0 a pool at his feet, 3 at the
// post's foot, 4 pooled under the post, 5-7 the bound loop)
const line = (f: number): FxUse => fx('shadowLine', f, [HOME, AT.postFoot[1]], { back: true })
// the bound loop, frame i of a hold
const bound = (i: number): FxUse => line(5 + (i % 3))
// the post bound: the tendrils up it (0 rising, 1 the lower half, 2 up to
// the crown, 3 squeezed: hold 2 and 3 alternately; 4 the lower half
// squeezed: hold 1 and 4 while the post's top is free, the mimic), riding the
// post's shove [pdx, pdy]; dark tongues rising off the pool
const coil = (f: number, d: readonly [number, number] = [0, 0]): FxUse => fx('shadowBind', f, AT.postBase, d[0] || d[1] ? { d } : {})
const coiled = (i: number): FxUse => coil(2 + (i % 2))
const low = (i: number, d: readonly [number, number] = [0, 0]): FxUse => coil(i % 2 ? 4 : 1, d)
const wisps = (i: number): FxUse => fx('shadowWisp', i % 4, AT.postBase)
// what grows out of it at the post, in front of the post
const hands = (f: number): FxUse => fx('shadowHands', f, AT.postBase)
const stitch = (f: number): FxUse => fx('shadowStitch', f, AT.postBase)
// the white-hot flash where the shadow takes hold (the impact star's first
// frame alone: no violet sparks scattered after it)
const spark = (at: FxUse['at'] = AT.postFoot, d: readonly [number, number] = [1, -3]): FxUse => fx('impact', 0, at, { pal: 'shock', d })
// the Rat seal, his eyes on the post
const rat = (o: Partial<NinjaCel> = {}): NinjaCel => K('sign2', { eyes: 'focus', ...o })
// the fist clenched at a distance, his head turned to the post
const fist = (o: Partial<NinjaCel> = {}): NinjaCel => K('punch', { eyes: 'smug', head: 'turn', ...o })

// The shadow let go: it slides back under him, a frame a step, as the seal
// drops and the bored look comes back.
const letGo = (tag: string, more: (i: number) => readonly FxUse[] = () => []): Cel[] => [
  c(1, tag, K('sign2', { eyes: 'half' }), { post: 'stand', fx: [line(3), ...more(0)] }),
  c(1, tag, K('idle1', { eyes: 'half', hdy: 1 }), { post: 'stand', fx: [line(2), ...more(1)] }),
  c(1, tag, K('idle1', { eyes: 'half' }), { post: 'stand', fx: [line(1), ...more(2)] }),
  c(1, tag, K('idle1', { eyes: 'shut' }), { post: 'stand', fx: [line(0)] }),
]

// a cast's blow held two frames (the hit-stop): its first 'impact' cel doubled
const hitStop = (cels: Cel[]): Cel[] => {
  let done = false
  return cels.map(cel => (!done && cel.tag === 'impact' ? ((done = true), { ...cel, n: 2 }) : cel))
}

// Every move ends on idle1 (the head dipped) for a frame, then idle0 for two
// as the post poofs away.
const ending = (): Cel[] => [c(1, 'recover', K('idle1', { eyes: 'half', hdy: 1 }), { post: 'stand' }), ...postOut('recover', [K('idle0', { eyes: 'half' }), K('idle0', { eyes: 'half' })])]

// ------------------------------------------------------------------ Shadow Possession (4.5 s)

// OX, MONKEY, the Rat as the post poofs in; he sinks into the seal, drawn
// back a column, as his shadow creeps along the floor, then leans in a step
// as it surges onto the post (the name called): it pools, the tendrils rise,
// the post flashes and the camera jolts as he drops into a crouch in the
// seal, caught. Then the joke of the
// jutsu: it is bound to copy him, and he plays with it, three moves, each
// its own drawing, the post answering a frame after each. He steps in with
// his arm thrown out at it: the post lurches toward him. He rocks back on
// his heel, sunk: it rocks back after him. He throws a hand up: it hops; he
// comes down leaning away in the seal, the smirk wider, and it lands a
// frame behind him, leaning with him. (The tendrils stay on its lower half
// while it copies him, so its top is seen to move.) He cinches it to the
// crown, lets go: the shadow slides home, the arms folded, a long bored
// blink, the post poofs away.
// the mimic: his move, the post's answer a frame after it (a shove [pdx,
// pdy] a frame), his face
type Mimic = { k: NinjaCel; shove: readonly (readonly [number, number])[]; post?: 'stand' | 'lean' }
const MIMIC: readonly Mimic[] = [
  // he steps in, the arm thrown out at it, for four frames: it lurches after him
  { k: K('strike', { x: HOME - 2, eyes: 'focus', head: 'turn', hdy: 1 }), shove: [[0, 0]] },
  { k: K('strike', { x: HOME - 2, eyes: 'focus', head: 'turn' }), shove: [[2, 0]] },
  { k: K('strike', { x: HOME - 2, eyes: 'smug', head: 'turn' }), shove: [[3, 0]] },
  { k: K('strikeWind', { x: HOME - 2, eyes: 'smug', head: 'turn' }), shove: [[3, 0]] },
  // he rocks back on his heel, sunk: it rocks back after him
  { k: K('windup', { x: HOME + 1, dy: 1, eyes: 'smug', hdy: 1 }), shove: [[3, 0]] },
  { k: K('windup', { x: HOME + 1, dy: 1, eyes: 'smug' }), shove: [[1, 0]] },
  { k: K('windup', { x: HOME + 1, dy: 1, eyes: 'happy' }), shove: [[-1, 0]], post: 'lean' },
  { k: K('windup', { x: HOME + 1, dy: 1, eyes: 'happy', hdx: -1 }), shove: [[0, 0]] },
  // he throws a hand up: it hops
  { k: K('raise', { x: HOME + 1, eyes: 'focus', hdy: 1 }), shove: [[0, 0]] },
  { k: K('raise', { x: HOME + 1, eyes: 'focus' }), shove: [[0, -2]] },
  { k: K('raiseWind', { x: HOME + 1, eyes: 'happy' }), shove: [[-1, -3]] },
  { k: K('raise', { x: HOME + 1, eyes: 'happy' }), shove: [[-1, -2]] },
  // down, leaning away in the seal, the smirk wider: it lands a frame behind, leaning with him
  { k: K('sign2R', { eyes: 'happy', hdy: 1 }), shove: [[0, -1]], post: 'lean' },
  { k: K('sign2R', { eyes: 'smug' }), shove: [[1, 0]], post: 'lean' },
]
const mimicCels = (): Cel[] =>
  MIMIC.map(({ k, shove, post }, t) => {
    const [pdx, pdy] = shove[0]!
    return c(1, 'hold', k, { post: post ?? 'stand', ...(pdx ? { pdx } : {}), ...(pdy ? { pdy } : {}), fx: [bound(t), low(t, [pdx, pdy])] })
  })
const possessionCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1'), K('sign3', { hdy: 1 }), K('sign3'), rat({ hdy: 1 })]),
  c(1, 'stretch', rat({ eyes: 'left' }), { post: 'stand', fx: [line(0)] }),
  // sunk into the seal, drawn back a column, the shadow creeping out
  c(1, 'stretch', rat({ x: HOME + 1, dy: 1, eyes: 'left', hdy: 1 }), { post: 'stand', fx: [line(1)] }),
  c(1, 'stretch', K('sign2Wind', { x: HOME + 1, dy: 1, eyes: 'focus' }), { post: 'stand', fx: [line(2)] }),
  // the surge onto the post, leant into it a small step (stoic: no
  // overshoot, the lean does the work): the shout as it touches
  c(1, 'bind', K('sign2L', { x: HOME - 1, eyes: 'focus' }), { post: 'stand', fx: [line(3)], shout: true }),
  c(1, 'bind', K('sign2L', { x: HOME - 1, eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [line(4), coil(0)] }),
  // caught: dropped into a crouch in the seal as the post flashes, the
  // camera jolted twice and back (hit-stop), the tendrils climbing it
  c(2, 'impact', K('kneel', { x: HOME - 1, eyes: 'smug', hdy: 1 }), { post: 'stand', pdx: -1, flash: 'post', shake: [-1, 0], fx: [line(4), coil(1), spark()] }),
  c(1, 'impact', K('kneel', { x: HOME - 1, eyes: 'smug' }), { post: 'stand', pdx: 1, shake: [1, 0], fx: [line(4), coil(2)] }),
  c(1, 'impact', K('kneel', { x: HOME, eyes: 'smug' }), { post: 'stand', fx: [bound(0), coil(3)] }),
  // it slackens to its lower half: now it has to copy him
  c(1, 'impact', K('kneel', { x: HOME, eyes: 'focus', hdx: -1 }), { post: 'stand', fx: [bound(1), low(0)] }),
  ...mimicCels(),
  // he cinches it up to the crown, straining, sunk a pixel
  c(1, 'hold', K('sign2', { x: HOME + 1, dy: 1, eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [bound(0), coil(2)] }),
  c(2, 'hold', K('sign2Wind', { x: HOME + 1, dy: 1, eyes: 'focus' }), { post: 'stand', fx: [bound(1), coil(3)] }),
  // let go: the tendrils sink, the shadow slides home
  ...letGo('release', i => (i === 0 ? [coil(1)] : i === 1 ? [coil(0)] : [])),
  // what a drag: the arms folded, the long blink
  c(1, 'recover', K('crossed', { eyes: 'half', hdy: 1 }), { post: 'stand' }),
  c(3, 'recover', K('crossed', { eyes: 'shut' }), { post: 'stand' }),
  c(1, 'recover', K('crossedWind', { eyes: 'half' }), { post: 'stand' }),
  c(1, 'recover', K('idle1', { eyes: 'shut' }), { post: 'stand' }),
  ...ending(),
]
export const POSSESSION = celMove(T, { name: 'Shadow Possession Jutsu', shout: 'Shadow Possession', dojutsu: false, on: ['shell'] }, possessionCels)

// ------------------------------------------------------------------ Shadow Neck Bind (4.5 s)

// The MONKEY and the Rat (no OX: he knows it will hold), sunk into it as the
// shadow runs to the post (faster now); a hand of shadow climbs out of it up
// the post's near side as his own hand rises with it, a puppeteer's; it
// hooks its fingers over the crown and, as he snaps
// his fist out at it (a step in), closes round its neck: the post flashes,
// the camera jolts. The squeeze BUILDS, each haul its own drawing and
// harder than the last (the beat 'crush', so the peek's camera stays on
// the post through it): the fist clenched, trembling; yanked back with the
// one arm, the post creaking toward him; hauled with both hands, rocked
// back and sunk, the post dragged further; and the finish, the fist
// snapped out again in a step (the camera jolted), held as the hand digs in.
// He lets it sink back, flexes the fingers out and slumps: what a drag.
// the post hauled toward him a frame (pdx), and the hand riding it
const hauled = (f: number, pdx: number, more: readonly FxUse[] = []): CelOptions => ({ post: pdx ? 'lean' : 'stand', ...(pdx ? { pdx } : {}), fx: [bound(f), fx('shadowHands', f % 2 ? 4 : 3, AT.postBase, pdx ? { d: [pdx, 0] } : {}), ...more] })
const neckCels: Cel[] = [
  ...postIn('signs', [K('sign3', { hdy: 1 }), K('sign3'), K('sign3Wind'), rat({ hdy: 1 }), rat()]),
  c(1, 'stretch', rat({ x: HOME + 1, dy: 1, eyes: 'left', hdy: 1 }), { post: 'stand', fx: [line(1)] }),
  c(1, 'stretch', K('sign2Wind', { x: HOME + 1, dy: 1, eyes: 'left' }), { post: 'stand', fx: [line(2)] }),
  c(1, 'stretch', K('sign2Wind', { x: HOME + 1, dy: 1, eyes: 'focus' }), { post: 'stand', fx: [line(3)] }),
  c(1, 'stretch', rat({ eyes: 'focus' }), { post: 'stand', fx: [line(4)] }),
  // the hand climbs out of the shadow, and his own goes up with it, the
  // puppeteer's: it climbs as his hand rises
  c(1, 'climb', K('raise', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [bound(0), hands(0)] }),
  c(1, 'climb', K('raise', { eyes: 'focus' }), { post: 'stand', fx: [bound(1), hands(0)] }),
  c(1, 'climb', K('raiseWind', { eyes: 'focus' }), { post: 'stand', fx: [bound(2), hands(1)] }),
  c(1, 'climb', K('raiseWind', { eyes: 'focus', head: 'turn' }), { post: 'stand', fx: [bound(0), hands(1)] }),
  c(1, 'climb', K('raise', { eyes: 'focus', head: 'turn' }), { post: 'stand', fx: [bound(1), hands(2)] }),
  // its fingers hooked over the crown, his hand high, drawn back for it
  c(2, 'swing', K('raiseWind', { x: HOME + 1, eyes: 'focus', head: 'turn', hdy: 1 }), { post: 'stand', fx: [bound(2), hands(2)] }),
  // it closes round the neck as his fist snaps out (a step in): the post
  // flashes, rocked, the camera jolted twice and back (hit-stop)
  c(2, 'impact', fist({ x: HOME - 3 }), { post: 'lean', flash: 'post', shake: [-1, 0], fx: [bound(0), hands(3), spark(AT.postTop, [0, 2])] }),
  c(1, 'impact', fist({ x: HOME - 1 }), { post: 'lean', pdx: -1, shake: [1, 0], fx: [bound(1), hands(4)] }),
  c(1, 'impact', fist({ x: HOME - 1, hdy: 1 }), { post: 'stand', pdx: 1, fx: [bound(2), hands(3)] }),
  // the squeeze: the fist clenched, trembling (the hand tightening on it)
  c(1, 'crush', K('punchWind', { x: HOME - 1, eyes: 'focus', head: 'turn' }), hauled(0, 0)),
  c(1, 'crush', fist({ x: HOME - 1, hdx: -1 }), hauled(1, 0)),
  c(1, 'crush', K('punchWind', { x: HOME - 1, eyes: 'focus', head: 'turn', hdy: 1 }), hauled(2, 0)),
  // yanked back with the one arm, sunk: the post creaks toward him
  c(1, 'crush', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn', hdy: 1 }), hauled(0, 1, [wisps(0)])),
  c(2, 'crush', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn' }), hauled(1, 2, [wisps(1)])),
  c(1, 'crush', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn', hdx: -1 }), hauled(2, 1, [wisps(2)])),
  // hauled with both hands, rocked back and sunk: dragged further
  c(1, 'crush', K('gather', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn', hdy: 1 }), hauled(0, 2, [wisps(3)])),
  c(3, 'crush', K('gather', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn' }), hauled(1, 3, [wisps(0)])),
  // THE FINISH: the fist snapped out again in a step, the camera jolted,
  // held as the hand digs in round its neck
  c(1, 'impact', K('strike', { x: HOME - 2, eyes: 'smug', head: 'turn' }), { post: 'lean', pdx: -1, flash: 'post', shake: [-1, 0], fx: [bound(2), hands(4), spark(AT.postTop, [0, 2])] }),
  c(1, 'impact', K('strike', { x: HOME - 2, eyes: 'smug', head: 'turn', hdy: 1 }), { post: 'stand', fx: [bound(0), hands(4)] }),
  c(2, 'impact', K('strikeWind', { x: HOME - 2, eyes: 'smug', head: 'turn' }), { post: 'stand', fx: [bound(1), hands(3)] }),
  // it sinks back into the shadow, and he lets the fist open
  c(1, 'release', K('punchWind', { x: HOME - 1, eyes: 'half', head: 'turn' }), { post: 'stand', fx: [bound(1), hands(2)] }),
  c(1, 'release', K('punch', { eyes: 'half' }), { post: 'stand', fx: [line(4), hands(1)] }),
  c(1, 'release', K('idle1', { eyes: 'half', hdy: 1 }), { post: 'stand', fx: [line(3), hands(0)] }),
  c(1, 'release', K('slump', { eyes: 'half' }), { post: 'stand', fx: [line(2)] }),
  c(2, 'release', K('slump', { eyes: 'shut' }), { post: 'stand', fx: [line(1)] }),
  c(1, 'release', K('idle1', { eyes: 'half' }), { post: 'stand', fx: [line(0)] }),
  ...ending(),
]
export const NECK_BIND = celMove(T, { name: 'Shadow Neck Bind Jutsu', shout: 'Neck Bind', dojutsu: false }, neckCels)

// ------------------------------------------------------------------ Shadow-Sewing (4.6 s)

// No seals to start: the hand thrust at the post as it poofs in, the Rat
// snapped after it, and the shadow spills out to the post; he sinks into the
// seal, drawn back, and throws his arm out at it (cast()'s stoic weight: no
// sink, a small step, no recoil, his head nodding with the blow): three
// spikes stab up out of the pool, the middle one up through the post and out
// over its crown (its flash, the camera jolted twice and back). Then he
// hauls on them, harder each time, a drawing each: rocked back on the one
// arm, the post dragged toward him; both hands, rocked back and sunk,
// dragged further; and the finish, the arms flung wide as the threads go
// taut (the camera jolted), held. They slide out; he folds his arms and
// rolls his neck, the head tipped one way and the other, done.
// the stitch riding the post as it is hauled (pdx)
const sewn = (f: number, pdx = 0): FxUse => fx('shadowStitch', f, AT.postBase, pdx ? { d: [pdx, 0] } : {})
const sewingCels: Cel[] = [
  ...postIn('ready', [K('windup', { eyes: 'focus', hdy: 1 }), K('windup', { eyes: 'focus' }), K('charge', { eyes: 'focus', head: 'turn' }), rat({ hdy: 1 }), rat()]),
  c(1, 'spill', rat({ eyes: 'left' }), { post: 'stand', fx: [line(0)] }),
  c(1, 'spill', rat(), { post: 'stand', fx: [line(1)] }),
  c(1, 'spill', K('sign2Wind', { eyes: 'left' }), { post: 'stand', fx: [line(2)] }),
  ...hitStop(cast({
    weight: 'stoic',
    k: { eyes: 'focus' },
    // drawn back into the seal (no sink: he barely moves), the shadow reaching the post, its pool knotting
    gather: { pose: ['sign2', 'sign2Wind', 'sign2'], tag: 'spill', fx: i => [line(3 + Math.min(i, 1)), ...(i === 2 ? [stitch(0)] : [])] },
    // the arm thrown out at it: the spikes burst up
    release: { n: 2, pose: 'strike', k: { head: 'turn' }, fx: () => [bound(1), stitch(1)] },
    // run through: the post's flash, hit-stop, the camera jolted twice and back; the head nods with it
    impact: { n: 3, pose: ['strike', 'strike', 'follow'], k: i => ({ head: 'turn', ...(i === 2 ? { hdy: 1 } : {}) }), o: i => ({ post: i < 2 ? 'lean' : 'stand', ...(i === 0 ? { flash: 'post' as const, shake: [-1, 0] as const } : i === 1 ? { shake: [1, 0] as const } : {}), ...(i === 2 ? { pdx: -1 } : {}) }), fx: i => [bound(i + 2), stitch(2), ...(i < 2 ? [spark(AT.postMid, [1, -2])] : [])] },
    settle: false,
  })),
  // the first haul: rocked back on the one arm, the post dragged toward him
  c(1, 'haul', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn', hdy: 1 }), { post: 'lean', pdx: 1, fx: [bound(0), sewn(3, 1), wisps(0)] }),
  c(2, 'haul', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn' }), { post: 'lean', pdx: 2, fx: [bound(1), sewn(3, 2), wisps(1)] }),
  c(1, 'haul', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn', hdx: -1 }), { post: 'stand', pdx: 1, fx: [bound(2), sewn(2, 1), wisps(2)] }),
  // the second, harder: both hands, rocked back and sunk, dragged further
  c(1, 'haul', K('gather', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn', hdy: 1 }), { post: 'lean', pdx: 2, fx: [bound(0), sewn(3, 2), wisps(3)] }),
  c(3, 'haul', K('gather', { x: HOME + 1, dy: 1, eyes: 'focus', head: 'turn' }), { post: 'lean', pdx: 3, fx: [bound(1), sewn(3, 3)] }),
  // THE FINISH: the arms flung wide, the threads drawn taut (the camera jolted), held
  c(1, 'impact', K('spread', { x: HOME, eyes: 'smug' }), { post: 'lean', pdx: -1, shake: [1, 0], fx: [bound(2), sewn(3, -1), spark(AT.postMid, [1, -2])] }),
  c(1, 'impact', K('spread', { x: HOME, eyes: 'smug', hdy: 1 }), { post: 'stand', fx: [bound(0), sewn(2)] }),
  c(2, 'impact', K('spreadWind', { x: HOME, eyes: 'smug' }), { post: 'stand', fx: [bound(1), sewn(3)] }),
  c(2, 'impact', K('spread', { x: HOME, eyes: 'half' }), { post: 'stand', fx: [bound(2), sewn(2)] }),
  // they slide back out of it
  c(1, 'retract', rat({ eyes: 'half' }), { post: 'stand', fx: [bound(2), stitch(1)] }),
  c(1, 'retract', K('idle1', { eyes: 'half', hdy: 1 }), { post: 'stand', fx: [line(4), stitch(0)] }),
  // the arms folded, the neck rolled: tipped one way, then the other
  c(1, 'retract', K('crossed', { eyes: 'half', hdy: 1 }), { post: 'stand', fx: [line(3)] }),
  c(2, 'retract', K('crossed', { eyes: 'shut', hdx: -1, hdy: 1 }), { post: 'stand', fx: [line(2)] }),
  c(2, 'retract', K('crossedWind', { eyes: 'shut', hdx: 1, hdy: 1 }), { post: 'stand', fx: [line(1)] }),
  c(2, 'retract', K('crossed', { eyes: 'half', hdy: 1 }), { post: 'stand', fx: [line(0)] }),
  c(1, 'retract', K('crossed', { eyes: 'half' }), { post: 'stand' }),
  c(1, 'retract', K('idle1', { eyes: 'half' }), { post: 'stand' }),
  ...ending(),
]
export const SEWING = celMove(T, { name: 'Shadow-Sewing Technique', shout: 'Shadow Sewing', dojutsu: false, on: ['edit'] }, sewingCels)

// ------------------------------------------------------------------ Flying Swallow (1.7 s)

// For an edit: Asuma's trench knife drawn as the post poofs in; he rocks
// back on it while wind chakra hums on its edge, then throws, a small step
// into it (cast()'s stoic weight, the recoil at the release: he barely
// moves, a thrown blade doesn't knock its thrower back): it thuds into the
// post (hit-stop, the post's flash, the camera jolted a pixel), the wind
// blade cuts on through it, and the knife stays stuck till the post poofs
// away.
const knife = (at: FxUse['at'], d: readonly [number, number] = [0, 0]): FxUse => fx('kunai', 0, at, { d })
// stuck in the post's face, the blade sunk into the wood
const STUCK: readonly [number, number] = [AT.postHit[0] + 3, AT.postHit[1]]
const quickCels: Cel[] = [
  ...postIn('ready', [K('gather', { hdy: 1 }), K('gather', { eyes: 'focus' })], () => [knife('hand', [-2, -1])]),
  ...hitStop(cast({
    weight: 'stoic',
    recoil: 'release',
    k: { eyes: 'focus' },
    // rocked back on it, the wind humming on the blade
    gather: { pose: 'windup', fx: i => [knife('hand'), fx('sparks', Math.min(i, 2), 'hand', { pal: 'wind', d: [-4, 0] })] },
    // thrown: the arm whipped through, the knife smeared along its flight
    release: { n: 2, tag: 'throw', pose: 'strike', k: { head: 'turn' }, o: i => (i === 0 ? { shout: true } : {}), fx: i => (i === 0 ? [knife([STUCK[0] + 12, STUCK[1]]), knife([STUCK[0] + 8, STUCK[1]])] : [knife([STUCK[0] + 3, STUCK[1]]), knife([STUCK[0] + 1, STUCK[1]])]) },
    // the thud: hit-stop, the post's flash; the blade of wind flies on through it
    impact: { n: 3, pose: ['follow', 'follow', 'punch'], k: { head: 'turn' }, o: i => ({ post: i === 0 ? 'lean' : 'stand', ...(i === 0 ? { flash: 'post' as const, shake: [-1, 0] as const } : {}), ...(i === 1 ? { pdx: -1 } : i === 2 ? { pdx: 1 } : {}) }), fx: i => [knife(STUCK, [i === 1 ? -1 : 0, 0]), ...(i < 2 ? [fx('impact', i, 'post', { pal: 'wind' })] : []), ...(i > 0 ? [fx('windBlade', i, 'post', { d: [-2 - 4 * (i - 1), 0] })] : [])] },
    settle: { n: 2, pose: ['punchWind', 'punch'], k: { head: undefined }, fx: i => [knife(STUCK), ...(i === 0 ? [fx('windBlade', 3, 'post', { d: [-10, 0] })] : [])] },
  })),
  c(1, 'recover', K('idle1', { eyes: 'half' }), { post: 'stand', fx: [knife(STUCK)] }),
  c(1, 'recover', K('idle1', { eyes: 'shut' }), { post: 'stand', fx: [knife(STUCK)] }),
  c(1, 'recover', K('idle1', { eyes: 'half', hdy: 1 }), { post: 'stand', fx: [knife(STUCK)] }),
  ...postOut('recover', [K('idle0', { eyes: 'half' }), K('idle0', { eyes: 'half' })], 'stand', i => (i === 0 ? [knife(STUCK)] : [])),
]
export const QUICK = celMove(T, { name: 'Flying Swallow', shout: 'Flying Swallow', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.2 s)

// No hop: too much of a drag. A sigh with the eyes shut, then the hand comes
// up to the side of his head and scratches, bored and calm (scratchWind is
// the rub, a pixel down), the head tipped into it once, a slow blink, and
// the hand drops. The scratch is the companion's 'scratch', his roster
// cheer: its soft cue a minute later holds it.
const sigh = (f: number): FxUse => fx('sigh', f, 'head', { d: [6, 15], flip: true })
const cheerCels: Cel[] = [
  c(1, 'sigh', K('idle1', { eyes: 'shut', hdy: 1 }), { fx: [sigh(0)] }),
  c(1, 'sigh', K('idle1', { eyes: 'shut' }), { fx: [sigh(1)] }),
  c(1, 'cheer', K('scratch', { eyes: 'calm', hdy: 1 }), { fx: [sigh(2)] }),
  c(1, 'cheer', K('scratch', { eyes: 'calm' })),
  c(1, 'cheer', K('scratchWind', { eyes: 'calm' })),
  c(1, 'cheer', K('scratch', { eyes: 'calm' })),
  c(1, 'cheer', K('scratchWind', { eyes: 'calm', hdx: 1, hdy: 1 })),
  c(1, 'cheer', K('scratch', { eyes: 'shut' })),
  c(1, 'cheer', K('scratch', { eyes: 'calm' })),
  c(1, 'cheer', K('idle1', { eyes: 'half', hdy: 1 })),
  c(2, 'cheer', K('idle0', { eyes: 'half' })),
]
export const CHEER = celMove(T, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)
