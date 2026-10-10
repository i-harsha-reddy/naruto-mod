// Rock Lee's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to
// write one). Guy-sensei's taijutsu, younger and wilder: more spin, more
// air, a springier run. Two poses of the jumpsuit's own carry them
// (templates/jumpsuit.ts): the flying side kick ('flykick', a level side
// kick in the air, the leg shot straight out from the hip, sole first, the
// suit and belt showing between it and the head thrown back behind it) and
// the rising kick ('upkick', the leg snapped up past his face); mid-spin his
// back to the post wears his own low 'spinkick'. The post gets thrown
// about: kicked up into the air (its shadow left on the floor), bound in his
// bandages and driven down into the ground (sunk past the stage's bottom
// edge), hopped by a rising kick. His chakra is green (the 'leafChakra'
// palette), seen only as the Gates open: his blows are plain taijutsu (gold
// stars and rings, no ninjutsu); his head turns to the post in every
// blow (the turned head, its far eye foreshortened: the eyes' 'T' states),
// dropped a pixel in a strike or a kick. He goes home in a backward tuck
// roll along the floor (ninja/lee.ts's rollA, rollB, rollC: the head never
// turned, only sunk, the legs going round it, front, over the top, behind),
// never Guy-sensei's cannonball.
//
// leeMoves(t, eyes) is called with his template as his moves see it
// (ninja/lee.ts: the jumpsuit with his own poses) and his eyes (the moods of
// his own eye states), so the beats name his poses and faces.

import { celMove } from '../cels.ts'
import type { MoveEyes } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { GROUND, HOME, STRIKE } from '../stage.ts'
import type { Cel, CelMove, CloneCel, FxUse, NinjaCel, PostFrame, Template, XY } from '../types.ts'
import type { CelOptions } from './kit.ts'
import { K, c, dustAt, fx, hold, hopHome, postIn, postOut, runIn } from './kit.ts'

// the root column his rising and standing kicks land on the post from
const KICK_X = STRIKE - 1
// the flying kick's root (its hip; the head rides 14 px behind it): the sole
// on the post's face, and driven on through it
const FLY_HIT = 21
// the eyes on the head turned to the post: the far eye foreshortened
const TURNED: Readonly<Record<string, string>> = { focus: 'focusT', smug: 'smugT', wide: 'wideT' }
const T = (eyes = 'focus'): string => TURNED[eyes] ?? eyes
// a blow with his head turned to the post, dropped a pixel in a strike or a
// kick so more of the body's line shows
const LOW = new Set(['strike', 'punch', 'punchWind', 'follow', 'kick'])
const turn = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => K(pose, { head: 'turn', ...o, hdy: (o.hdy ?? 0) + (LOW.has(pose) ? 1 : 0), eyes: T(o.eyes) })
const fly = (x: number, lift: number, o: Partial<NinjaCel> = {}): NinjaCel => K('flykick', { x, lift, clip: 3, head: 'turn', ...o, eyes: T(o.eyes) })
const up = (x: number, o: Partial<NinjaCel> = {}): NinjaCel => K('upkick', { x, head: 'turn', ...o, eyes: T(o.eyes) })
// tucked in the air, spinning
const spin = (x: number, lift: number): NinjaCel => K('tuck', { x, lift, eyes: 'shut', clip: 3 })
// his back to the post mid-spin: the kick swung round behind him (a copy of
// him facing away, in the low diagonal 'spinkick', the ninja himself out of
// the cel for the frame)
const back = (x: number, lift: number): CloneCel => ({ pose: 'spinkick', x, lift, flip: true, head: 'turn', eyes: 'focusT' })
// a blow's star: plain gold, or his green chakra
const star = (f: number, d: XY = [0, 0], pal = 'hit', at: FxUse['at'] = 'post'): FxUse => fx('impact', f, at, { pal, d })
// the whirlwind of leaves (two crescent swooshes): round his legs as he
// spins (at his feet, or a stage point when he is out of the cel), or round the post
const whirlOn = (f: number | 'cycle'): FxUse => fx('leafWhirl', f, 'feet', { d: [0, 1] })
const whirlAt = (f: number, x: number, lift: number): FxUse => fx('leafWhirl', f, [x, GROUND - lift], { d: [0, 1] })
const whirlPost = (f: number | 'cycle', back = false): FxUse => fx('leafWhirl', f, AT.postMid, { d: [1, 0], back })
const steam = (): FxUse => fx('gateSteam', 'cycle', 'feet')
// his bandages unwound round the post, frame f, the post lifted dy
const bandages = (f: number, dy: number): FxUse => fx('bandageWrap', f, [AT.postMid[0], AT.postMid[1] + dy])
// the middle of the post's foot, where the ground breaks under it
const BASE = AT.postBase
// the post's foot's column, for the dust it throws up when it lands
const POST_FOOT_X = AT.postBase[0]

// The tuck roll home from column `from`: the crouch, tucked and rocked back
// onto his back (rollA: the knees hugged in front of his chin, the soles
// kicked up front), over the top (rollB: the head sunk to the floor, the
// soles to the sky), over onto his feet behind (rollC), a column or more a
// frame toward home, and the landing squash. `quick`: the roll alone, from
// the crouch (no rocking tuck first).
const rollHome = (tag: string, from: number, post: PostFrame | null, o: Partial<NinjaCel> = {}, quick = false): Cel[] => {
  const span = HOME - from
  const at = (u: number): number => from + Math.round(span * u)
  const roll = (pose: string, u: number, more: readonly FxUse[] = []): Cel => c(1, tag, K(pose, { x: at(u), eyes: 'shut' }), { post, fx: [...more] })
  return [
    c(1, tag, K('crouch', { ...o, x: from, eyes: 'focus' }), { post }),
    ...(quick ? [] : [c(1, tag, K('tuck', { x: at(0.1), eyes: 'shut' }), { post, fx: [dustAt(0, from)] })]),
    roll('rollA', 0.3, quick ? [dustAt(0, from)] : []),
    roll('rollB', 0.55, [dustAt(quick ? 1 : 2, from)]),
    roll('rollC', 0.8),
    c(1, tag, K('crouch', { ...o, x: HOME, dy: 1 }), { post, fx: [dustAt(0, HOME)] }),
    c(1, tag, K('crouch', { ...o, x: HOME }), { post, fx: [dustAt(1, HOME)] }),
  ]
}

// Every move ends up out of the landing's squash (rise, a frame all but at
// rest), on idle1 with the head dipped for a frame, then idle0 for two as
// the post poofs away.
const ending = (more: (i: number) => readonly FxUse[] = () => [], o: CelOptions = {}): Cel[] => [
  c(1, 'recover', K('rise', { eyes: 'happy' }), { post: 'stand', ...o, fx: [...more(0)] }),
  c(1, 'recover', K('idle1', { hdy: 1, eyes: 'happy' }), { post: 'stand', fx: [...more(1)] }),
  ...postOut('recover', [K('idle0', { eyes: 'happy' }), K('idle0', { eyes: 'happy' })], 'stand', i => more(i + 2)),
]

export const leeMoves = (t: Template, eyes?: MoveEyes): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => {
  // ---------------------------------------------------------------- Leaf Hurricane (4.8 s)

  // The post poofs in; his stance, one hand out, beckoning; the sink, the
  // springy run, and up into a whirlwind of leaves: spinning round, his back
  // to the post one frame and the flying kick into it the next, twice (the
  // star bursting off his sole, a pixel's jolt, the post rocked: never the
  // post washed white), and the finisher, the rising kick that pops the
  // post off the ground. Down in a crouch, the tuck roll home.
  const hurricane: Cel[] = [
    ...postIn('ready', [turn('strike', { eyes: 'smug', hdy: 1 }), turn('strike', { eyes: 'smug' }), turn('strike', { eyes: 'smug' })]),
    ...hold(4, 'ready', turn('strike', { eyes: 'smug' }), { post: 'stand' }),
    c(3, 'ready', K('gather', { eyes: 'focus', hdy: 1, x: HOME + 1, dy: 1 }), { post: 'stand' }),
    ...runIn('dash', { ready: 'ready', look: { eyes: T(), head: 'turn' }, to: 28 }),
    // up into the whirlwind
    c(1, 'spin', spin(28, 3), { post: 'stand', fx: [whirlOn(0), dustAt(0, 30)] }),
    c(1, 'spin', undefined, { post: 'stand', clones: [back(30, 5)], fx: [whirlAt(1, 30, 5), dustAt(1, 30)] }),
    // a kick each time round, shot out level as he comes round onto the post
    c(2, 'hit', fly(FLY_HIT, 6), { post: 'lean', fx: [whirlOn(2), star(0, [0, 0], 'hit', 'hand')], shake: [-1, 0] }),
    c(1, 'hit', fly(FLY_HIT - 1, 5), { post: 'stand', pdx: -1, fx: [whirlOn(3), star(1, [0, 0], 'hit', 'hand')] }),
    c(1, 'spin', undefined, { post: 'stand', clones: [back(30, 4)], fx: [whirlAt(0, 30, 4), star(2, [0, -5])] }),
    c(1, 'spin', spin(28, 5), { post: 'stand', fx: [whirlOn(1)] }),
    c(2, 'hit2', fly(FLY_HIT, 6), { post: 'lean', fx: [whirlOn(2), star(0, [0, 0], 'hit', 'hand')], shake: [-1, 0] }),
    c(1, 'hit2', fly(FLY_HIT - 1, 4), { post: 'stand', pdx: -1, fx: [whirlOn(3), star(1, [0, 0], 'hit', 'hand')] }),
    c(1, 'spin', undefined, { post: 'stand', clones: [back(30, 2)], fx: [whirlAt(0, 30, 2), star(2, [0, -5])] }),
    c(1, 'spin', K('crouch', { x: 27, eyes: 'focus' }), { post: 'stand', fx: [whirlOn(1), dustAt(0, 27)] }),
    // the finisher: the rising kick pops the post off the ground (hit-stop)
    c(1, 'impact', up(KICK_X + 2), { post: 'lean', pdy: -2, flash: 'post', fx: [whirlPost(0), star(0, [0, -3])], shake: [0, -1] }),
    c(1, 'impact', up(KICK_X + 2), { post: 'lean', pdy: -3, fx: [whirlPost(0), star(0, [0, -4])], shake: [0, -1] }),
    c(1, 'impact', up(KICK_X + 2), { post: 'stand', pdy: -4, fx: [whirlPost(1), star(1, [0, -5])], shake: [0, 1] }),
    c(1, 'impact', up(KICK_X + 2), { post: 'stand', pdy: -5, fx: [whirlPost(2, true), star(2, [0, -5])] }),
    c(1, 'impact', turn('kick', { x: KICK_X + 2 }), { post: 'stand', pdy: -3, fx: [whirlPost(3, true)] }),
    c(1, 'impact', K('crouch', { x: KICK_X + 3 }), { post: 'lean', fx: [dustAt(0, POST_FOOT_X), fx('leafFall', 0, AT.postMid, { d: [1, 0] })] }),
    c(2, 'land', K('crouch', { x: KICK_X + 3, eyes: 'happy' }), { post: 'stand', pdx: -1, fx: [dustAt(1, POST_FOOT_X), fx('leafFall', 1, AT.postMid, { d: [1, 0] })] }),
    ...rollHome('back', KICK_X + 3, 'stand', { eyes: 'happy' }).map((cel, i) => (i < 2 ? { ...cel, fx: [...(cel.fx ?? []), fx('leafFall', 2 + i, AT.postMid, { d: [1, 0] })] } : cel)),
    ...ending(),
  ]
  const HURRICANE = celMove(t, { name: 'Leaf Hurricane', shout: 'Leaf Hurricane', dojutsu: false, on: ['shell'] }, hurricane, eyes)

  // ---------------------------------------------------------------- Primary Lotus (5.0 s)

  // The bandages loosened (his fists clenched, the eyes shut, a breath), the
  // run in, and the rising kick sends the post up into the air, its shadow
  // left on the floor; he leaps after it, binds it in his unwound bandages at
  // the top (the shout), and drives it head first back into the ground: it
  // sinks half out of sight past the stage's edge as the earth breaks and
  // rubble flies. He springs up out of the crater, the fist pumped (YOSH!);
  // the post climbs back out and poofs away.
  const lotus: Cel[] = [
    ...postIn('unwrap', [K('gather', { eyes: 'shut', hdy: 1 }), K('gather', { eyes: 'shut' }), K('gather', { eyes: 'shut' })]),
    ...hold(4, 'unwrap', K('gather', { eyes: 'shut' }), (i): CelOptions => ({ post: 'stand', fx: [fx('sigh', i < 2 ? 0 : 1, 'hand', { d: [-6, -2 - (i >> 1)], flip: true })] })),
    c(2, 'unwrap', K('spread', { eyes: 'wide' }), { post: 'stand', fx: [fx('sigh', 2, 'hand', { d: [-6, -4], flip: true })] }),
    ...runIn('dash', { ready: 'unwrap', look: { eyes: T(), head: 'turn' }, to: KICK_X }),
    // the kick sends it up (hit-stop on the contact)
    c(1, 'launch', turn('kick', { x: KICK_X }), { post: 'lean', flash: 'post', fx: [star(0, [0, 3])], shake: [-1, 0] }),
    c(1, 'launch', turn('kick', { x: KICK_X }), { post: 'lean', pdy: -1, fx: [star(0, [0, 2])] }),
    c(1, 'launch', up(KICK_X + 1), { post: 'stand', pdy: -4, fx: [star(1, [0, -1]), dustAt(0, POST_FOOT_X)] }),
    c(1, 'launch', up(KICK_X + 1), { post: 'stand', pdy: -8, fx: [star(2, [0, -6]), dustAt(1, POST_FOOT_X)] }),
    // after it: up off the floor
    c(1, 'leap', K('crouch', { x: KICK_X + 1, eyes: 'focus' }), { post: 'lean', pdy: -10, fx: [dustAt(0, KICK_X + 1)] }),
    c(1, 'leap', K('jump', { x: KICK_X - 1, lift: 4, eyes: 'focus', clip: 3 }), { post: 'stand', pdy: -11, fx: [dustAt(1, KICK_X + 1)] }),
    // caught at the top and bound in his bandages
    c(1, 'wrap', spin(KICK_X + 1, 5), { post: 'lean', pdy: -11, fx: [bandages(0, -11)], shout: true }),
    c(1, 'wrap', spin(KICK_X + 1, 6), { post: 'stand', pdy: -11, fx: [bandages(1, -11)] }),
    c(1, 'wrap', K('tuck', { x: KICK_X + 1, lift: 6, eyes: 'focus', clip: 3 }), { post: 'lean', pdy: -10, fx: [bandages(2, -10)] }),
    c(1, 'wrap', K('tuck', { x: KICK_X + 1, lift: 5, eyes: 'focus', clip: 3 }), { post: 'stand', pdy: -10, fx: [bandages(3, -10)] }),
    c(1, 'wrap', spin(KICK_X, 4), { post: 'lean', pdy: -9, fx: [bandages(2, -9)] }),
    // driven down, spinning: the knees rolled over his head (the head upright, never turned)
    c(1, 'drop', K('rollA', { x: KICK_X - 1, lift: 2, eyes: 'shut' }), { post: 'stand', pdy: -5, fx: [bandages(3, -5)] }),
    c(1, 'drop', turn('slam', { x: KICK_X - 1 }), { post: 'stand', pdy: 1, fx: [bandages(2, 1)] }),
    // into the ground: the earth breaks (hit-stop, the camera jolted down a pixel), the post sinks out of sight
    c(2, 'impact', turn('slam', { x: KICK_X - 1 }), { post: 'stand', pdy: 3, fx: [fx('quake', 1, BASE), fx('shockRing', 0, BASE, { pal: 'hit', d: [1, -2] })], shake: [0, 1] }),
    c(1, 'impact', turn('slam', { x: KICK_X - 1 }), { post: 'stand', pdy: 5, fx: [bandages(3, 5), fx('quake', 2, BASE), fx('rubble', 0, BASE), fx('shockRing', 1, BASE, { pal: 'hit', d: [1, -2] })] }),
    c(1, 'impact', turn('slamWind', { x: KICK_X - 1 }), { post: 'stand', pdy: 6, fx: [fx('quake', 3, BASE), fx('rubble', 1, BASE), fx('shockRing', 2, BASE, { pal: 'hit', d: [1, -2] }), fx('dustWave', 0, BASE)] }),
    c(1, 'impact', turn('slamWind', { x: KICK_X - 1, hdy: 1 }), { post: 'stand', pdy: 6, fx: [fx('quake', 3, BASE), fx('rubble', 2, BASE), fx('shockRing', 3, BASE, { pal: 'hit', d: [1, -2] }), fx('dustWave', 1, BASE)] }),
    c(2, 'impact', K('charge', { x: KICK_X - 1, eyes: 'focus' }), { post: 'stand', pdy: 6, fx: [fx('quake', 3, BASE), fx('rubble', 3, BASE), fx('dustWave', 2, BASE)] }),
    ...hold(3, 'impact', K('gather', { x: KICK_X - 1, eyes: 'happy' }), { post: 'stand', pdy: 6, fx: [fx('quake', 3, BASE), fx('dustWave', 3, BASE)] }),
    // up out of the crater, the fist pumped: YOSH!
    ...hopHome('back', KICK_X - 1, 'stand', { eyes: 'happy' }, 2, { air: ['jump'], lifts: [3, 5, 2] }, { style: 'skip' }).map(cel => ({ ...cel, pdy: 6, fx: [...(cel.fx ?? []), fx('quake', 3, BASE)] })),
    // the post climbs back out of the crater
    ...ending(i => (i < 3 ? [fx('quake', 3, BASE), ...(i < 2 ? [dustAt(i, POST_FOOT_X)] : [])] : []), { pdy: 3 }),
  ]
  const LOTUS = celMove(t, { name: 'Primary Lotus', shout: 'Primary Lotus', dojutsu: false }, lotus, eyes)

  // ---------------------------------------------------------------- Eight Inner Gates (5.0 s)

  // Arms folded, eyes shut, bracing; the Gates burst open (the shout): flung
  // wide in a white rim of light, the camera jolted, a roar with both arms
  // up, the steam boiling off him and a ring of his green chakra blown out
  // behind him from his middle; the power sunk into a crouch, then the
  // springy run in and the flurry, the star and a pixel's jolt at each, a new blow every time (punch, kick, the
  // rising kick, the flying kick), a pace in or out with every blow, and
  // the last punch, plain taijutsu (a gold star, a gold ring: Lee has no
  // ninjutsu), that sends it reeling. A quick tuck roll home in steam.
  const PX = KICK_X + 1
  // the Gate's chakra blown out round him: centred on his middle, behind him
  const gate = (f: number): FxUse => fx('shockRing', f, 'feet', { pal: 'leafChakra', d: [0, -3], back: true })
  // the last punch's ring on the post, gold
  const ring = (f: number): FxUse => fx('shockRing', f, 'post', { pal: 'hit' })
  const gates: Cel[] = [
    ...postIn('brace', [K('crossed', { eyes: 'shut', hdy: 1 }), K('crossed', { eyes: 'shut' }), K('crossed', { eyes: 'shut' })]),
    ...hold(3, 'brace', K('crossed', { eyes: 'shut', x: HOME + 1, dy: 1 }), { post: 'stand' }),
    // the Gates burst open
    c(1, 'open', K('spread', { eyes: 'wide' }), { post: 'lean', flash: 'rim', fx: [steam(), gate(0)], shake: [-1, 0], shout: true }),
    c(1, 'open', K('spread', { eyes: 'wide' }), { post: 'stand', pdx: -1, fx: [steam(), gate(1)], shake: [-1, 0] }),
    c(1, 'open', K('alert', { eyes: 'wide', hdy: 1 }), { post: 'stand', fx: [steam(), gate(2), fx('dustWave', 0, 'feet', { back: true })] }),
    ...hold(3, 'open', K('alert', { eyes: 'wide' }), (i): CelOptions => ({ post: 'stand', fx: [steam(), ...(i < 2 ? [gate(3 + i)] : []), fx('dustWave', 1 + Math.min(i, 2), 'feet', { back: true })] })),
    // the power sunk into a crouch, drawn back
    c(1, 'ready', K('gather', { eyes: 'focus', hdy: 1, x: HOME + 1, dy: 1 }), { post: 'stand', fx: [steam()] }),
    ...hold(3, 'ready', K('gather', { eyes: 'smug', x: HOME + 1, dy: 1 }), { post: 'stand', fx: [steam()] }),
    ...runIn('dash', { ready: 'ready', look: { eyes: T(), head: 'turn' }, to: PX, fx: (i, part) => (part === 'windup' ? [steam()] : []) }),
    // the flurry, a pace in or out with each blow
    c(2, 'hit', turn('punch', { x: PX }), { post: 'lean', fx: [star(0, [0, -1])], shake: [-1, 0] }),
    c(1, 'hit', turn('punch', { x: PX }), { post: 'stand', pdx: -1, fx: [star(1, [0, -1])] }),
    c(2, 'hit2', turn('kick', { x: PX + 1 }), { post: 'lean', fx: [star(0, [0, 3])], shake: [-1, 0] }),
    c(1, 'hit2', turn('kick', { x: PX + 1 }), { post: 'stand', pdx: -1, fx: [star(1, [0, 3])] }),
    c(1, 'hit3', up(PX), { post: 'lean', pdy: -1, fx: [star(0, [0, -3])], shake: [0, -1] }),
    c(1, 'hit3', up(PX), { post: 'stand', pdx: -1, fx: [star(1, [0, -3])] }),
    c(1, 'hit4', K('jump', { x: PX + 2, lift: 4, clip: 3, eyes: 'focus' }), { post: 'stand', fx: [dustAt(0, PX + 1)] }),
    c(1, 'hit4', fly(FLY_HIT, 6), { post: 'lean', fx: [star(0, [0, 0], 'hit', 'hand')], shake: [-1, 0] }),
    c(1, 'hit4', fly(FLY_HIT, 6), { post: 'lean', fx: [star(1, [0, 0], 'hit', 'hand')] }),
    c(1, 'hit4', fly(FLY_HIT - 1, 4), { post: 'stand', pdx: -1, fx: [star(2, [-1, 0], 'hit', 'hand')] }),
    c(1, 'hit4', K('crouch', { x: PX + 1 }), { post: 'stand', fx: [star(2, [0, 0], 'hit', [13, 13]), dustAt(0, PX + 1)] }),
    // the last punch: the post's flash, a gold ring, sent reeling
    c(1, 'finish', turn('windup', { x: PX + 2 }), { post: 'stand', fx: [dustAt(1, PX + 1)] }),
    c(1, 'impact', turn('strike', { x: PX }), { post: 'lean', pdx: -1, flash: 'post', fx: [star(0, [0, 1])], shake: [-1, 0] }),
    c(1, 'impact', turn('strike', { x: PX - 1 }), { post: 'lean', pdx: -1, fx: [star(0, [0, 1])], shake: [-1, 0] }),
    c(1, 'impact', turn('strike', { x: PX - 1 }), { post: 'lean', pdx: -2, fx: [star(1, [0, 1]), ring(2)], shake: [1, 0] }),
    c(1, 'impact', turn('follow', { x: PX + 1 }), { post: 'stand', pdx: -1, fx: [star(2, [0, 1]), ring(3)] }),
    c(2, 'impact', K('gather', { x: PX + 1, eyes: 'smug' }), { post: 'stand', fx: [steam(), ring(4)] }),
    ...rollHome('back', PX + 1, 'stand', { eyes: 'happy' }, true).map(cel => ({ ...cel, fx: [...(cel.fx ?? []), steam()] })),
    ...ending(i => (i < 2 ? [steam()] : [])),
  ]
  const GATES = celMove(t, { name: 'Eight Inner Gates', shout: 'Eight Gates', dojutsu: false, on: ['edit'] }, gates, eyes)

  // ---------------------------------------------------------------- Leaf Rising Wind (2.0 s)

  // For an edit: sunk into a low crouch as the post poofs in, the run kept
  // low (a glide, his afterimages at his heels: his speed, not Guy-sensei's
  // heavy strides), and the rising kick under it: the star, a pixel's jolt, it hops into the
  // air (hit-stop on the contact); he drops back to the ground in a flurry
  // of leaves, the whirl round his legs breaking into falling leaves as he
  // springs home, the fist pumped.
  const quick: Cel[] = [
    ...postIn('ready', [K('crouch', { eyes: 'focus' }), K('crouch', { eyes: 'focus', dy: 1 })]),
    ...runIn('dash', { style: 'glide', ready: 'ready', look: { eyes: T(), head: 'turn' }, to: KICK_X, windup: 'crouch' }),
    c(2, 'impact', turn('kick', { x: KICK_X }), { post: 'lean', fx: [star(0, [0, 3])], shake: [-1, 0] }),
    c(1, 'impact', up(KICK_X + 1), { post: 'stand', pdy: -2, fx: [star(1, [0, 1]), whirlPost(0, true)] }),
    c(1, 'impact', up(KICK_X + 1), { post: 'stand', pdy: -4, fx: [star(2, [0, -1]), whirlPost(1, true)] }),
    // down in a flurry of leaves, and the spring home
    ...hopHome('back', KICK_X + 1, 'stand', { eyes: 'happy' }, 1, { air: ['jump'] }, { style: 'skip' }).map((cel, i) =>
      i === 0
        ? { ...cel, post: 'lean' as const, pdy: -2, fx: [...(cel.fx ?? []), whirlOn(2), dustAt(0, POST_FOOT_X)] }
        : { ...cel, ...(i === 1 ? { pdx: -1 } : {}), fx: [...(cel.fx ?? []), ...(i < 5 ? [fx('leafFall', i - 1, [KICK_X + 1, GROUND], { d: [0, -5] })] : [])] },
    ),
    ...ending(),
  ]
  const QUICK = celMove(t, { name: 'Leaf Rising Wind', shout: 'Leaf Rising Wind', on: ['edit'], quick: true, dojutsu: false }, quick, eyes)

  // ---------------------------------------------------------------- the cheer (1.3 s)

  // His own, not Guy-sensei's: up in a leap with the fist pumped (YOSH!),
  // landing straight into the Nice Guy thumbs-up, the ting off his teeth,
  // and at rest: quicker and bouncier than his sensei's.
  const cheer: Cel[] = [
    c(1, 'pump', K('crouch', { eyes: 'smug' })),
    c(1, 'pump', K('jump', { eyes: 'happy', lift: 3, clip: 3 }), { fx: [dustAt(0, HOME)] }),
    c(2, 'pump', K('jump', { eyes: 'happy', lift: 5, clip: 3 }), { fx: [dustAt(1, HOME)] }),
    c(1, 'pump', K('jump', { eyes: 'happy', lift: 2, clip: 3 })),
    c(1, 'cheer', K('thumbs', { eyes: 'happy', hdy: 1 }), { fx: [dustAt(0, HOME)] }),
    ...hold(3, 'cheer', K('thumbs', { eyes: 'happy' })),
    c(1, 'cheer', K('thumbs', { eyes: 'sparkle' })),
    c(1, 'cheer', K('thumbs', { eyes: 'happy' })),
    c(1, 'cheer', K('idle1', { hdy: 1, eyes: 'happy' })),
    c(1, 'cheer', K('idle0', { eyes: 'happy' })),
  ]
  const CHEER = celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheer, eyes)

  return { moves: [HURRICANE, LOTUS, GATES], quick: QUICK, cheer: CHEER }
}
