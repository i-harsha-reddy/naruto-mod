// Might Guy's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to
// write one). Taijutsu, all of it, and heavy: he sinks low and lands hard
// (two frames down into a crouch before he springs; a landing a pixel deep
// with the stage jolted under it, grit thrown out both sides: hopHome's
// 'heavy'), big anticipation (he points at the post first), then everything
// at once: a spring off the ground, the knee snapped up in the air
// ('chamber', his own pose), and the straight-leg flying kick at the top of
// the arc ('flykick', his own: the leg shot out straight and level from the
// hip, sole first, the body leant back above it so the vest shows, the head
// thrown back behind the shoulder). Every blow that matters lands with the
// post's one-frame flash, a hit-stop and the camera shaken (-1, -1, +1);
// the Nice Guy pose with the ting off his teeth signs it. His head turns to
// the post in every blow (the turned head, its far eye foreshortened: the
// eyes' 'T' states), dropped a pixel in a strike or a kick. He hops home as
// a cannonball ('cannon', his own: the knees hugged up to his mouth), never
// the template's tuck and jump. The Eighth Gate flushes him red and throws
// his hair up (ninja/guy.ts's night heads and <pose>N poses) until it shuts.
// Morning Peacock's flurry is his own drawings, mid, low and high and a
// smear of fists (jabLow, jabHigh, flurryA/B), closing on his own lunge.
//
// guyMoves(t, eyes) is called with his template as his moves see it
// (ninja/guy.ts: the vest with his own poses) and his eyes (the moods of his
// own eye states), so the beats name his poses and faces.

import { celMove } from '../cels.ts'
import type { MoveEyes } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { GROUND, HOME, POST_X, STRIKE } from '../stage.ts'
import type { Cel, CelMove, FxUse, NinjaCel, PostFrame, Template, XY } from '../types.ts'
import type { CelOptions } from './kit.ts'
import { K, c, dustAt, fx, hold, hopHome, postIn, postOut, runIn } from './kit.ts'

// the flying kick's root (its hip; the head rides 15 px behind it): the top
// of the arc, and the sole on the post's crown, driven on through it
const KICK_TOP = 22
const KICK_HIT = 20
// the root column the whirlwind's kick lands on the post from
const KICK_X = STRIKE - 1
// the eyes on the head turned to the post: the far eye foreshortened
const TURNED: Readonly<Record<string, string>> = { focus: 'focusT', smug: 'smugT', wide: 'wideT' }
const T = (eyes = 'focus'): string => TURNED[eyes] ?? eyes
// a blow with his head turned to the post, dropped a pixel in a strike or a
// kick so more of the body's line shows
const LOW = new Set(['strike', 'punch', 'punchWind', 'follow', 'kick'])
const turn = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => K(pose, { head: 'turn', ...o, hdy: (o.hdy ?? 0) + (LOW.has(pose) ? 1 : 0), eyes: T(o.eyes) })
// the flying kick `lift` px up (its grid's last row is the tucked sole, so
// the lift is his clearance: up 4 the head just clears the stage's top)
const fly = (x: number, lift: number, o: Partial<NinjaCel> = {}): NinjaCel => K('flykick', { x, lift, clip: 2, head: 'turn', ...o, eyes: T(o.eyes) })
// a blow's star in plain gold (hit), on the post or on his sole
const star = (f: number, at: FxUse['at'] = 'post', d: XY = [0, 0], pal = 'hit'): FxUse => fx('impact', f, at, { pal, d })
// the Gates' steam boiling off him, white, or red for the Eighth
const steam = (pal?: string): FxUse => fx('gateSteam', 'cycle', 'feet', pal ? { pal } : {})
// the ting off his teeth: a four-point glint by the jaw
const ting = (f = 1): FxUse => fx('sparks', f, 'head', { pal: 'hit', d: [17, 14] })
// the air torn behind the flying kick, under him (his hip at column x, `lift` up)
const wake = (f: number, x: number, lift: number, pal?: string): FxUse => fx('speedLines', f, [x + 3, GROUND - lift - 2], { back: true, ...(pal ? { pal } : {}) })
// the post's foot (its anchor: the fire drawn over its wood lands here), and
// the middle of its foot (where the ground breaks under it)
const FOOT = AT.postFoot
const BASE = AT.postBase
// Morning Peacock's fan of fist-comets, behind the post (the post its body),
// converging on its crown
const PEACOCK_AT: XY = [POST_X + 1, 16]
const comet = (f: number): FxUse => fx('peacock', f, PEACOCK_AT, { back: true })
// a blow's camera shake: jolted toward the post for the hit-stop's two
// frames, kicked back on the third
const SHAKE: readonly XY[] = [
  [-1, 0],
  [-1, 0],
  [1, 0],
]

// Home from column `from` as a cannonball, landing heavy (hopHome's
// 'heavy': the squash a pixel deep, the stage jolted, grit both sides): the
// crouch, the ball (up 3, 6, 6, 3, or `lifts`).
const cannonHome = (tag: string, from: number, post: PostFrame | null, o: Partial<NinjaCel> = {}, settle = 2, lifts: readonly number[] = [3, 6, 6, 3]): Cel[] =>
  hopHome(tag, from, post, o, settle, { air: ['cannon'], lifts }, { style: 'heavy' })

// Every move ends up out of the landing's squash (rise, a frame all but at
// rest), on idle1 with the head dipped for a frame, then idle0 for two as
// the post poofs away.
const ending = (frame: PostFrame = 'stand', eyes = 'happy', more: readonly FxUse[] = []): Cel[] => [
  c(1, 'recover', K('rise', { eyes }), { post: frame, fx: [...more] }),
  c(1, 'recover', K('idle1', { hdy: 1, eyes }), { post: frame, fx: [...more] }),
  ...postOut('recover', [K('idle0', { eyes }), K('idle0', { eyes })], frame),
]

export const guyMoves = (t: Template, eyes?: MoveEyes): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => {
  // ---------------------------------------------------------------- Dynamic Entry (4.5 s)

  // Arms folded at the post as it poofs in, then a heavy step in and the
  // finger pointed at it (you!); rocked back onto his heels, two heavy
  // bounding strides at it, sunk a pixel deep, and sprung off the ground: the knee snapped up in the air, the leg
  // shot out straight at the top of the arc, the air torn behind him, and the
  // sole driven into the post's crown as he comes down on it (its flash,
  // hit-stop, the camera shaken, knocked back); the rebound tumbles him up
  // and back off it as a cannonball, he lands hard, and the Nice Guy pose
  // (ting); home in a heavy cannonball.
  const entry: Cel[] = [
    ...postIn('ready', [K('crossed', { eyes: 'smug', hdy: 1 }), K('crossed', { eyes: 'smug' }), K('crossed', { eyes: 'smug' })]),
    ...hold(4, 'ready', K('crossed', { eyes: 'smug' }), { post: 'stand', phase: 1 }),
    // you!: a heavy step in, the finger levelled at the post
    c(1, 'ready', turn('punch', { eyes: 'smug', hdy: 1, x: HOME - 2, dy: 1 }), { post: 'stand', fx: [dustAt(0, HOME)] }),
    ...hold(5, 'ready', turn('punch', { eyes: 'smug', x: HOME - 2 }), { post: 'stand' }),
    // rocked back onto his heels, sunk, then two heavy bounding strides at it
    // (the ground jumping under each) into the take-off, sunk a pixel deep
    c(1, 'ready', turn('windup', { x: HOME + 1 }), { post: 'stand' }),
    c(1, 'ready', turn('windup', { x: HOME + 1, hdy: 1, dy: 1 }), { post: 'stand' }),
    c(1, 'dash', turn('dash', { x: 31 }), { post: 'stand', pdy: -1, fx: [dustAt(0, HOME + 2)] }),
    c(1, 'dash', turn('dash', { x: 28 }), { post: 'stand', pdy: -1, fx: [dustAt(0, 31), dustAt(1, HOME + 2)] }),
    c(2, 'leap', K('crouch', { x: 27, dy: 1, eyes: 'focus' }), { post: 'stand', fx: [dustAt(1, 31), dustAt(0, 27)] }),
    // sprung: the knee snapped up, the air torn behind him
    c(1, 'launch', K('chamber', { x: 26, lift: 4, clip: 3, head: 'turn', eyes: 'focusT' }), { post: 'stand', fx: [dustAt(1, 27), wake(0, 26, 4)] }),
    // the leg shot out straight at the top of the arc
    c(1, 'fly', fly(KICK_TOP, 6), { post: 'stand', fx: [dustAt(2, 27), wake(1, KICK_TOP, 6)] }),
    // DYNAMIC ENTRY: the sole in the post's crown as he comes down on it: the
    // star bursting off it, hit-stop, the camera shaken, the post knocked back
    c(2, 'impact', fly(KICK_HIT, 4), { post: 'lean', fx: [star(0, 'hand')], shake: SHAKE[0] }),
    c(1, 'impact', fly(KICK_HIT - 1, 3), { post: 'lean', pdx: -2, fx: [star(1, 'hand')], shake: SHAKE[2] }),
    c(1, 'impact', fly(KICK_HIT - 1, 2), { post: 'lean', pdx: -2, fx: [star(2, 'hand')] }),
    // the rebound: tumbled up and back off it as a cannonball, and down
    c(1, 'flip', K('cannon', { x: 27, lift: 6, clip: 3, eyes: 'shut' }), { post: 'lean', pdx: -1, fx: [star(3, 'post', [0, -4])] }),
    c(1, 'flip', K('cannon', { x: 30, lift: 4, eyes: 'shut' }), { post: 'stand' }),
    c(1, 'flip', K('cannon', { x: 32, lift: 2, eyes: 'focus' }), { post: 'stand' }),
    // landing hard: a pixel deep, the stage jolted down, grit both sides, slid a pixel on
    c(1, 'land', K('crouch', { x: 33, dy: 1 }), { post: 'stand', shake: [0, 1], fx: [dustAt(0, 30), dustAt(0, 36)] }),
    c(1, 'land', K('crouch', { x: 34, eyes: 'happy' }), { post: 'stand', fx: [dustAt(1, 30), dustAt(1, 36)] }),
    // NICE GUY: a step in at you, the thumb jabbed out, the ting
    c(1, 'pose', K('thumbs', { eyes: 'happy', x: 32, hdy: 1 }), { post: 'stand', fx: [dustAt(2, 33)] }),
    c(1, 'pose', K('thumbs', { eyes: 'happy', x: 32 }), { post: 'stand' }),
    c(1, 'pose', K('thumbsWind', { eyes: 'happy', x: 32 }), { post: 'stand' }),
    c(2, 'pose', K('thumbs', { x: 32, eyes: 'sparkle' }), { post: 'stand', fx: [ting()] }),
    // home, the heavy cannonball
    ...cannonHome('back', 32, 'stand', { eyes: 'happy' }, 2, [3, 5, 4]),
    ...ending(),
  ]
  const ENTRY = celMove(t, { name: 'Dynamic Entry', shout: 'Dynamic Entry', dojutsu: false, on: ['edit'] }, entry, eyes)

  // ---------------------------------------------------------------- Morning Peacock (4.6 s)

  // The Sixth Gate: arms folded, eyes shut; the Gate bursts (a white rim
  // round him) and the steam boils up off him; the power sunk into a fist;
  // the stance; the run in to a few paces off the post; then the punches,
  // building, a new fist every time (mid, low, high): one every other frame
  // at first, each lighting a fist-comet that streaks in at the post's crown
  // out of a fan above it; then a pace in and a fist a frame, more comets
  // each frame, the post rocking; then the fists smeared, every one at once;
  // and another pace in on his lunge: the PEACOCK, every comet in at once,
  // the whole fan of flaming feathers spread behind the post as it glows
  // white-hot, held on the lunge (hit-stop) with the camera shaken; carried
  // through, the fan breaks into embers over three frames; the post
  // scorched. Home in a heavy cannonball, steaming.
  const PX = 31
  const look = { eyes: T(), head: 'turn' }
  const peacock: Cel[] = [
    ...postIn('gate', [K('crossed', { eyes: 'shut', hdy: 1 }), K('crossed', { eyes: 'shut' }), K('crossed', { eyes: 'shut' })]),
    // the Gate: a rim of light round him, the steam bursts out, the camera jolted
    c(1, 'gate', K('gather', { eyes: 'wide' }), { post: 'stand', flash: 'rim', fx: [steam()], shake: [1, 0] }),
    ...hold(2, 'gate', K('gather', { eyes: 'focus' }), { post: 'stand', fx: [steam()] }),
    // the power driven down into a fist: sunk and drawn back, heavy
    c(1, 'gate', K('charge', { eyes: 'focus', hdy: 1, x: HOME + 1, dy: 1 }), { post: 'stand', fx: [steam(), dustAt(0, HOME - 2)] }),
    c(2, 'gate', K('charge', { eyes: 'smug', x: HOME + 2, dy: 1 }), { post: 'stand', fx: [steam(), dustAt(1, HOME - 2)] }),
    // the stance: a step in, the fist levelled at the post
    c(2, 'stance', turn('punch', { eyes: 'smug', x: HOME - 1 }), { post: 'stand', fx: [steam()] }),
    // the run, to a few paces off it
    ...runIn('dash', { ready: 'stance', look, to: PX, fx: (i, part) => (part === 'windup' ? [steam()] : []) }),
    // the flurry, building: a fist every other frame, mid, low, high, a comet each...
    c(2, 'jab', turn('punch', { x: PX }), { post: 'stand', fx: [comet(0)] }),
    c(2, 'jab', turn('jabLow', { x: PX }), { post: 'stand', fx: [comet(1)] }),
    c(2, 'jab', turn('jabHigh', { x: PX - 1 }), { post: 'stand', fx: [comet(2)] }),
    // ...then a pace in and a fist a frame, low, mid, high, low, the post rocking...
    c(1, 'jab', turn('jabLow', { x: PX - 2 }), { post: 'lean', fx: [comet(3)] }),
    c(1, 'jab', turn('punch', { x: PX - 2 }), { post: 'stand', fx: [comet(4)] }),
    c(1, 'jab', turn('jabHigh', { x: PX - 2 }), { post: 'lean', pdx: -1, fx: [comet(5)] }),
    c(1, 'jab', turn('jabLow', { x: PX - 3 }), { post: 'stand', fx: [comet(6)] }),
    // ...then every fist at once, smeared
    c(1, 'jab', turn('flurryA', { x: PX - 3 }), { post: 'lean', pdx: -1, fx: [comet(7)] }),
    c(1, 'pull', turn('flurryB', { x: PX - 3 }), { post: 'lean', fx: [comet(8)] }),
    // MORNING PEACOCK: another pace in on the lunge, the fan on the post, the
    // post white-hot, held (hit-stop), the camera shaken
    c(2, 'impact', turn('lunge', { x: PX - 4, eyes: 'smug' }), { post: 'scorchLean', fx: [comet(9), fx('heatFlash', 0, FOOT)], shake: SHAKE[0] }),
    c(1, 'impact', turn('lunge', { x: PX - 4, eyes: 'smug', hdy: 1 }), { post: 'scorchLean', pdx: -1, fx: [comet(10), fx('burnPost', 0, FOOT)], shake: SHAKE[2] }),
    // carried through, the fan breaking up into embers
    c(1, 'impact', turn('follow', { x: PX - 3, eyes: 'smug' }), { post: 'scorch', fx: [comet(9), fx('burnPost', 1, FOOT)] }),
    c(1, 'impact', turn('follow', { x: PX - 2, eyes: 'smug' }), { post: 'scorch', fx: [comet(11), fx('burnPost', 2, FOOT)] }),
    c(1, 'impact', K('gather', { x: PX - 1, eyes: 'smug' }), { post: 'scorch', fx: [comet(12), steam()] }),
    c(2, 'impact', K('gather', { x: PX - 1, eyes: 'happy', hdy: 1 }), { post: 'scarred', fx: [comet(13), steam()] }),
    // home as a cannonball, landing heavy, still steaming
    ...cannonHome('back', PX - 1, 'scarred').map(cel => ({ ...cel, fx: [...(cel.fx ?? []), steam()] })),
    ...ending('scarred', 'happy', [steam()]),
  ]
  const PEACOCK = celMove(t, { name: 'Morning Peacock', shout: 'Morning Peacock', dojutsu: false, on: ['shell'] }, peacock, eyes)

  // ---------------------------------------------------------------- Eighth Gate: Night Guy (4.5 s)

  // The last Gate: arms folded, sunk, then flung wide with a roar (a white
  // rim round him, the camera jolted) as he flushes blood red, his hair
  // thrown up off his brow, the dragon of red chakra rearing up beside him,
  // its body coiled behind, and red steam boiling off; the roar, both arms
  // up; the power drawn down into his fists; the crouch; launched low and
  // flat (his crest never cut by the stage's top), the knee snapped up, the
  // leg shot out straight across the arena as the dragon streams along with
  // him; it lands on the post's crown: its flash, the camera shaken, a ring
  // blows out behind him, the ground under the post breaks and rubble
  // flies, the post charred; tumbled up and back off it, landing hard. The
  // Gate shuts, the red drains out of him, and spent, he goes home in a low,
  // heavy cannonball.
  const aura = (o: Partial<FxUse> = {}): FxUse => fx('dragonAura', 'cycle', 'feet', { back: true, ...o })
  // in the air the dragon flies with him, its head over his leg, its body
  // trailing back over his shoulders (fx/peacock.ts's dragonFly)
  const auraFly = (): FxUse => fx('dragonFly', 'cycle', 'feet', { back: true })
  const red = steam('steamRed')
  const ring = (f: number): FxUse => fx('shockRing', f, 'feet', { d: [0, -3], pal: 'fire', back: true })
  // flushed, the hair up (his night head, or turned to the post for the kick)
  const nk = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => K(pose, { head: 'night', ...o })
  const flyN = (x: number, lift: number): NinjaCel => K('flykickN', { x, lift, head: 'nightTurn', eyes: 'focusT' })
  const night: Cel[] = [
    ...postIn('gate', [K('crossed', { eyes: 'shut', hdy: 1 }), K('crossed', { eyes: 'shut' }), K('crossed', { eyes: 'shut' })]),
    ...hold(3, 'gate', K('crossed', { eyes: 'shut', x: HOME + 1, dy: 1 }), { post: 'stand', fx: [fx('auraLow', 'cycle', 'feet', { back: true, pal: 'fire' })] }),
    // the Eighth Gate bursts: flushed, the hair thrown up, flung wide, the camera jolted
    c(1, 'open', nk('spreadN', { eyes: 'wide' }), { post: 'lean', flash: 'rim', fx: [aura(), ring(0)], shake: [-1, 0] }),
    c(1, 'open', nk('spreadN', { eyes: 'wide' }), { post: 'stand', pdx: -1, fx: [aura(), red, ring(1)], shake: [-1, 0] }),
    // the roar, both arms up, the dust blown out round him
    c(1, 'open', nk('alertN', { eyes: 'wide', hdy: 1 }), { post: 'stand', fx: [aura(), red, ring(2), fx('dustWave', 0, 'feet', { back: true })] }),
    ...hold(5, 'open', nk('alertN', { eyes: 'wide' }), (i): CelOptions => ({ post: 'stand', fx: [aura(), red, ...(i < 2 ? [ring(3 + i)] : []), fx('dustWave', Math.min(3, 1 + i), 'feet', { back: true })] })),
    // the power drawn down into his fists: sunk and drawn back, heavy
    c(1, 'power', nk('chargeN', { eyes: 'smug', x: HOME + 1, dy: 1 }), { post: 'stand', fx: [aura(), red] }),
    ...hold(3, 'power', nk('chargeN', { eyes: 'smug', x: HOME + 2, dy: 1 }), { post: 'stand', fx: [aura(), red] }),
    // the crouch to spring, two frames down
    c(1, 'crouch', nk('crouchN', { eyes: 'focus', x: HOME + 1, dy: 1 }), { post: 'stand', fx: [aura(), red] }),
    c(1, 'crouch', nk('crouchN', { eyes: 'focus', x: HOME, dy: 2 }), { post: 'stand', fx: [aura(), red, dustAt(0, HOME)] }),
    // launched low: the knee snapped up, the ground cracked where he stood
    c(1, 'launch', nk('chamberN', { x: 31, lift: 2, head: 'nightTurn', eyes: 'focusT' }), { post: 'stand', fx: [auraFly(), wake(0, 31, 2, 'steamRed'), fx('dustWave', 0, [HOME, GROUND]), fx('quake', 0, [HOME, GROUND])] }),
    // the leg shot out straight across the arena, the dragon streaming with him
    c(1, 'kick', flyN(KICK_TOP, 4), { post: 'stand', fx: [auraFly(), wake(1, KICK_TOP, 4, 'steamRed'), fx('dustWave', 1, [HOME, GROUND])] }),
    // NIGHT GUY: the camera shaken, the ring behind him, the ground broken
    c(2, 'impact', flyN(KICK_HIT, 3), { post: 'scorchLean', fx: [auraFly(), fx('shockRing', 0, 'hand', { pal: 'fire', back: true }), fx('dustWave', 2, [HOME, GROUND])], shake: SHAKE[0] }),
    c(1, 'impact', flyN(KICK_HIT - 1, 2), { post: 'scorchLean', pdx: -2, fx: [auraFly(), fx('quake', 2, BASE), fx('rubble', 0, BASE), fx('shockRing', 2, 'hand', { pal: 'fire', back: true })], shake: SHAKE[2] }),
    // tumbled up and back off it, and down in a squash, landing hard
    c(1, 'impact', nk('cannonN', { x: 28, lift: 5, clip: 3, eyes: 'shut' }), { post: 'scorch', pdx: -1, fx: [aura(), fx('quake', 3, BASE), fx('rubble', 1, BASE), fx('shockRing', 3, 'post', { pal: 'fire', d: [0, -3], back: true }), fx('dustWave', 0, BASE)] }),
    c(1, 'impact', nk('cannonN', { x: 31, lift: 3, eyes: 'shut' }), { post: 'scorch', fx: [aura(), fx('quake', 3, BASE), fx('rubble', 2, BASE), fx('shockRing', 4, 'post', { pal: 'fire', d: [0, -3], back: true }), fx('dustWave', 1, BASE)] }),
    c(1, 'impact', nk('crouchN', { x: 32, dy: 1, eyes: 'focus' }), { post: 'scorch', shake: [0, 1], fx: [red, fx('quake', 3, BASE), fx('rubble', 3, BASE), fx('dustWave', 2, BASE), dustAt(0, 29), dustAt(0, 35)] }),
    c(1, 'impact', nk('crouchN', { x: 32, eyes: 'focus' }), { post: 'scorch', fx: [red, fx('quake', 3, BASE), fx('dustWave', 3, BASE), dustAt(1, 29), dustAt(1, 35)] }),
    // the Gate shut: the red drained out of him, the hair fallen, spent
    c(1, 'impact', K('gather', { x: 32, eyes: 'half', dy: 1 }), { post: 'scarred', fx: [red, fx('quake', 3, BASE)] }),
    ...hold(3, 'impact', K('gather', { x: 33, eyes: 'half' }), (i): CelOptions => ({ post: 'scarred', fx: [...(i < 1 ? [red] : []), fx('quake', 3, BASE)] })),
    // home in a low, heavy cannonball, the steam gone
    ...cannonHome('back', 33, 'scarred', { eyes: 'half' }, 2, [2, 4, 3, 1]).map(cel => ({ ...cel, fx: [...(cel.fx ?? []), fx('quake', 3, BASE)] })),
    c(1, 'recover', K('crouch', { eyes: 'half', hdy: -1 }), { post: 'scarred', fx: [fx('quake', 3, BASE), fx('sigh', 0, 'head', { d: [6, 15], flip: true })] }),
    ...ending('scarred', 'half', [fx('quake', 3, BASE), fx('sigh', 1, 'head', { d: [6, 15], flip: true })]),
  ]
  const NIGHT_GUY = celMove(t, { name: 'Eighth Gate: Night Guy', shout: 'Night Guy', dojutsu: false }, night, eyes)

  // ---------------------------------------------------------------- Leaf Great Whirlwind (2.0 s)

  // For an edit: Konoha Senpu. The post poofs in as he sinks, two heavy
  // bounding strides at it (the ground jumping under each: his run, not
  // Lee's low glide), then the whirlwind: spun round on his standing foot,
  // his back to the post for a frame with the leg swung out behind, leaves
  // whipped up round his legs, and the leg sweeps on round into the post
  // (its flash, a pixel's jolt, hit-stop, knocked back) as the leaves wheel
  // round it. Home as a heavy cannonball.
  const SPIN_X = KICK_X + 2
  const whirlAt = (f: number, x: number, lift = 0): FxUse => fx('leafWhirl', f, [x, GROUND - lift], { d: [0, -3] })
  const whirlPost = (f: number): FxUse => fx('leafWhirl', f, AT.postMid, { d: [1, 0], back: f > 1 })
  const quick: Cel[] = [
    ...postIn('ready', [K('gather', { eyes: 'focus', hdy: 1 }), K('gather', { eyes: 'focus', dy: 1 })]),
    ...runIn('dash', { style: 'heavy', ready: 'ready', look, to: SPIN_X }),
    // the whirlwind: his back to the post, the leg swung round behind
    c(1, 'spin', undefined, { post: 'stand', clones: [{ pose: 'kick', x: SPIN_X, flip: true, eyes: 'focus', hdy: 1 }], fx: [whirlAt(0, SPIN_X), dustAt(1, SPIN_X + 3)] }),
    // ...and on round into the post: the star, a pixel's jolt, hit-stop, the leaves round it
    c(2, 'impact', turn('kick', { x: KICK_X + 1 }), { post: 'lean', fx: [whirlAt(1, KICK_X + 1), star(0)], shake: [-1, 0] }),
    // home as a cannonball, the post knocked back, the whirl round it breaking into falling leaves
    ...cannonHome('back', KICK_X + 1, 'stand', {}, 2, [3, 6, 3]).map((cel, i) => ({ ...cel, ...(i === 0 ? { pdx: -2 } : i === 1 ? { pdx: -1 } : {}), fx: [...(cel.fx ?? []), ...(i === 0 ? [whirlPost(2), star(1)] : i === 1 ? [whirlPost(3), star(2)] : i === 2 ? [whirlPost(0)] : i < 6 ? [fx('leafFall', i - 3, AT.postMid, { d: [1, 0] })] : [])] })),
    ...ending('stand', 'happy', [fx('leafFall', 3, AT.postMid, { d: [1, 0] })]),
  ]
  const QUICK = celMove(t, { name: 'Leaf Great Whirlwind', shout: 'Leaf Great Whirlwind', on: ['edit'], quick: true, dojutsu: false }, quick, eyes)

  // ---------------------------------------------------------------- the cheer (1.1 s)

  // The Nice Guy pose, deliberate: a dip, a heavy step in at you with the
  // thumbs-up thrust out and the grin (the thumb jabbing), the ting off his
  // teeth, a half step back, and at rest. (Lee's is his own: a leap with
  // the fist pumped, landing straight into the thumbs-up.)
  const cheer: Cel[] = [
    c(1, 'hop', K('crouch', { eyes: 'happy', dy: 1 })),
    c(1, 'cheer', K('thumbs', { eyes: 'happy', hdy: 1, x: HOME - 2 }), { fx: [dustAt(0, HOME)] }),
    c(1, 'cheer', K('thumbs', { eyes: 'happy', x: HOME - 2 })),
    c(1, 'cheer', K('thumbsWind', { eyes: 'happy', x: HOME - 2 })),
    c(2, 'cheer', K('thumbs', { eyes: 'sparkle', x: HOME - 1 }), { fx: [ting(0)] }),
    c(1, 'cheer', K('thumbs', { eyes: 'happy', x: HOME - 1 })),
    c(1, 'cheer', K('rise', { eyes: 'happy' })),
    c(1, 'cheer', K('idle1', { hdy: 1, eyes: 'happy' })),
    c(1, 'cheer', K('idle0', { eyes: 'happy' })),
    c(1, 'cheer', K('idle0', { eyes: 'happy' })),
  ]
  const CHEER = celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheer, eyes)

  return { moves: [ENTRY, PEACOCK, NIGHT_GUY], quick: QUICK, cheer: CHEER }
}
