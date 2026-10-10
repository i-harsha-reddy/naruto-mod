// Tsunade's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to
// write one): the Heavenly Foot of Pain, a leap, the heel flung up over her
// head at the top of it and dropped on the post's foot along a violet arc,
// splitting the arena; the Strength of a Hundred, the seal spreading over her
// face and one punch that blows the post off the arena; and Katsuyu, rearing
// up huge out of the smoke behind her to melt the post with acid. Her chakra
// is violet: the effects' 'lion' palette (her seal's), 'lionHit' for the
// star of a blow, the shockwaves in 'shock'. The blows are drawn with her
// head turned to the post (the 'turn' head; 'turnSeal' with the seal on) and
// flash the post, never the stage.

import { celMove } from '../cels.ts'
import { GROUND, HOME, POST_X, STRIKE } from '../stage.ts'
import { TOP } from '../templates/top.ts'
import type { Cel, FxUse, NinjaCel, PostFrame } from '../types.ts'
import { K, LEAP_CLIP, awake, c, cast, dustAt, fx, hold, hopHome, postIn, postOut, runIn, wispsAt } from './kit.ts'

const VIOLET = 'lion'
const violet = (name: string, f: FxUse['f'], at: FxUse['at'], o: Partial<FxUse> = {}): FxUse => fx(name, f, at, { pal: VIOLET, ...o })
// the star of a blow, tinted through with her chakra
const star = (f: number, at: FxUse['at'], o: Partial<FxUse> = {}): FxUse => fx('impact', f, at, { pal: 'lionHit', ...o })
const aura = (): FxUse => violet('aura', 'cycle', 'feet', { back: true })
const auraLow = (): FxUse => violet('auraLow', 'cycle', 'feet', { back: true })
const glint = (f: FxUse['f'] = 'cycle'): FxUse => violet('sparks', f, 'hand')
// the head turned to the post, for the blows (the seal's own, with it on)
const T = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: o.awake ? 'turnSeal' : 'turn', ...o })
// the diamond on her brow, where the seal breaks out (from the head's top-left)
const brow = (f: number): FxUse => violet('sparks', f, 'head', { d: [10, 8] })
// the end of every move: the arms swinging back to the sides (ease, a frame
// from rest), the breath out (idle1, the head down a pixel) as the post goes
// up in smoke, then standing, the wisps drifting
const end = (post: PostFrame, eyes: string, more: (i: number) => readonly FxUse[] = () => []): Cel[] => [
  ...postOut('recover', [K('ease', { eyes }), K('idle1', { hdy: 1, eyes }), K('idle0', { eyes })], post, more),
  c(1, 'recover', K('idle0', { eyes }), { fx: [wispsAt()] }),
]
// effects carried through every cel of a run (the crater through the hop home)
const keep = (cels: Cel[], add: readonly FxUse[], o: Partial<Cel> = {}): Cel[] => cels.map(cl => ({ ...cl, ...o, fx: [...add, ...(cl.fx ?? [])] }))
// the wind-up rocked back at home keeps her own head (turned, it would run
// off the stage's edge there); the blows turn it
const plainWindup = (cels: Cel[]): Cel[] => cels.map(cl => (cl.k?.pose === 'windup' && cl.k.head ? { ...cl, k: withoutHead(cl.k) } : cl))
const withoutHead = (k: NinjaCel): NinjaCel => {
  const { head: _, ...rest } = k
  return rest
}

// ------------------------------------------------------------------ Heavenly Foot of Pain (4.8 s)

// No long charge: chakra flares in the heel, she sinks, and leaps; at the top
// of it the heel is flung straight up over her head, hung there a beat, and
// dropped on the post's foot along a violet arc: the arena splits (quake),
// rock and dust fly, the post is tossed up off the heaving ground and comes
// down leaning in the crater. The force throws her down onto one knee; she
// rises, smug, and hops home; the post and the crater go up in smoke.
const LAND = 22
// where the heel comes down (the stomp's hand point is its heel, on the ground)
const HEEL: [number, number] = [LAND - 11, GROUND]
// the apex: where she hangs with the heel up, and where the heel is (its hand point)
const APEX = 24
const TOP_HEEL: [number, number] = [APEX - 10, 1]
// the arena splitting under the heel: slabs of floor heaving up in a fan
// either side and falling back into a crater the arena wide (quake.ts's
// blossomQuake, in 'earth'), behind her and the post
const crater = (f: number): FxUse => fx('blossomQuake', f, HEEL, { back: true })
const arc = (f: number): FxUse => violet('heelArc', f, TOP_HEEL)
// the chakra she sprang from, breaking up behind her in the air
const breakup = (f: number): FxUse[] => [violet('breakup', f, [HOME - 3, GROUND - 4]), violet('breakup', f, [HOME + 4, GROUND - 3])]
const POST = { post: 'stand' as const }
const heavenCels: Cel[] = [
  // the post poofs in; chakra flares up round her and pools in the heel
  ...postIn('ready', [K('gather', { hdy: 1 }), K('gather')], () => [aura()]),
  ...hold(6, 'ready', K('gather'), { ...POST, fx: [aura()] }),
  // she sinks
  c(1, 'ready', K('windup', { hdy: 1 }), { ...POST, fx: [auraLow(), glint(0)] }),
  ...hold(4, 'ready', K('windup'), { ...POST, fx: [auraLow(), glint()] }),
  // the leap: off the ground toward the post, limbs flung out, rising every
  // frame (3, then 5: the head a pixel lower on the body so the hair clears
  // the stage's top), the chakra left behind breaking up in the air
  c(1, 'leap', K('crouch', { x: HOME, eyes: 'focus' }), { ...POST, fx: [auraLow()] }),
  c(1, 'leap', K('leap', { x: 31, lift: 3, clip: LEAP_CLIP, eyes: 'focus' }), { ...POST, fx: [dustAt(0, HOME), ...breakup(0)] }),
  c(1, 'leap', K('leap', { x: 28, lift: 5, hdy: 1, clip: LEAP_CLIP, eyes: 'focus' }), { ...POST, fx: [dustAt(1, HOME), ...breakup(1)] }),
  // the top of it: the heel flung straight up, the toe at the stage's top,
  // the body laid back under it and the head thrown back, turned to the heel
  // (the head a pixel high on the first frame); then the body sinks under
  // the raised heel a pixel a frame (lift 3, 2, 1) as she drifts on toward
  // the post: the torso, the sash and the haori in view all the way (beats
  // the peek's camera leads on: 'kick', and the drop's 'dive')
  c(1, 'kick', K('heel', T({ x: APEX + 1, lift: 3, hdy: -1, clip: LEAP_CLIP, eyes: 'shout' })), { ...POST, fx: [arc(0), glint(0)] }),
  c(1, 'kick', K('heel', T({ x: APEX, lift: 2, clip: LEAP_CLIP, eyes: 'shout' })), { ...POST, fx: [arc(0), glint('cycle')] }),
  c(1, 'kick', K('heel', T({ x: APEX - 1, lift: 1, clip: LEAP_CLIP, eyes: 'shout' })), { ...POST, fx: [arc(0), glint('cycle')] }),
  // dropped: the body come down to the ground under the head, still laid
  // back, the leg tipping forward over the post, the heel swinging out ahead
  // along the blazing arc (the drawing sits three columns right of its root)
  c(1, 'dive', K('drop', T({ x: LAND - 3, eyes: 'shout' })), { ...POST, fx: [arc(1), glint(0)] }),
  // the blow, the biggest frame: the body whipped forward over the leg as
  // the heel is driven into the ground, the arm flung after it; the post's
  // flash and, at once, the floor heaving up in slabs under the heel and a
  // violet star, held two frames
  // (the stage jolted down a pixel with it); then rock and dust fly, the post
  // is tossed up off the heaving ground
  c(1, 'impact', K('stomp', T({ x: LAND, eyes: 'shout' })), { ...POST, flash: 'post', fx: [crater(0), arc(2), star(1, HEEL, { d: [0, -3] }), fx('dustWave', 0, HEEL)], shake: [0, 1] }),
  c(1, 'impact', K('stomp', T({ x: LAND, eyes: 'shout' })), { post: 'lean', pdy: -2, fx: [crater(1), arc(2), star(2, HEEL, { d: [0, -3] }), fx('rubble', 0, HEEL, { back: true }), fx('dustWave', 1, HEEL)], shake: [0, 1] }),
  c(1, 'impact', K('stomp', T({ x: LAND, eyes: 'shout' })), { post: 'lean', pdy: -5, fx: [crater(2), fx('rubble', 1, HEEL, { back: true }), fx('earth', 1, HEEL), fx('dustWave', 2, HEEL), star(3, HEEL, { d: [0, -3] })], shake: [-1, 0] }),
  // the force throws her back a column, down onto one knee, as it all comes down
  c(1, 'impact', K('slam', T({ x: LAND + 1, eyes: 'focus' })), { post: 'lean', pdy: -4, fx: [crater(2), fx('rubble', 2, HEEL, { back: true }), fx('earth', 2, HEEL), fx('dustWave', 3, HEEL)] }),
  c(1, 'impact', K('slam', T({ x: LAND + 1, eyes: 'focus' })), { post: 'lean', pdy: -1, fx: [crater(3), fx('rubble', 3, HEEL, { back: true }), fx('dustWave', 3, HEEL), dustAt(0, POST_X)] }),
  c(1, 'impact', K('slam', T({ x: LAND + 1, eyes: 'focus' })), { post: 'lean', fx: [crater(3), dustAt(1, POST_X), dustAt(0, HEEL[0] + 7)] }),
  c(1, 'impact', K('slam', T({ x: LAND + 1, hdy: 1, eyes: 'focus' })), { post: 'lean', fx: [crater(3), dustAt(2, POST_X), dustAt(1, HEEL[0] + 7)] }),
  c(1, 'impact', K('slam', T({ x: LAND + 1, eyes: 'smug' })), { post: 'lean', fx: [crater(3), dustAt(2, HEEL[0] + 7)] }),
  // a push up off the knee, dusting the hands, then up, smug, the arms
  // folded a beat, and home in one big heavy bound (landing hard: the stage
  // jolted, grit thrown out)
  c(1, 'impact', K('crouch', { x: LAND + 1, eyes: 'smug' }), { post: 'lean', fx: [crater(3), dustAt(0, LAND - 4)] }),
  c(1, 'impact', K('crouch', { x: LAND + 1, hdy: 1, eyes: 'smug' }), { post: 'lean', fx: [crater(3), dustAt(1, LAND - 4)] }),
  c(1, 'impact', K('crossed', { x: LAND + 1, hdy: 1, eyes: 'smug' }), { post: 'lean', fx: [crater(3)] }),
  c(3, 'impact', K('crossed', { x: LAND + 1, eyes: 'smug' }), { post: 'lean', fx: [crater(3)] }),
  ...keep(hopHome('back', LAND + 1, 'lean', {}, 2, 'leap', { style: 'heavy' }), [crater(3)]),
  // the crater crumbling away as the post goes up in smoke
  ...end('lean', 'smug', i => (i <= 2 ? [crater(4 + i)] : [])),
]
export const HEAVENLY_FOOT = celMove(TOP, { name: 'Heavenly Foot of Pain', shout: 'Heavenly Foot', dojutsu: false, on: ['shell'] }, heavenCels)

// ------------------------------------------------------------------ Strength of a Hundred (5.0 s)

// The seals, and the Byakugo seal breaks out of the diamond on her brow,
// spreading over her face; chakra balls in her fist, she sinks back, and the
// run and one punch: the post's flash, a violet burst, a ring of force and a
// wall of dust, and the post is blown along the ground half off the arena.
// Home, the seal draws back into the diamond.
const PAST = POST_X - 6
const hundredCels: Cel[] = [
  ...postIn('seal', [K('sign1', { hdy: 1 }), K('sign1')]),
  c(1, 'seal', K('sign1Wind'), { post: 'stand' }),
  // the seal breaks out of the diamond and spreads in stages, the head
  // dipping as each one snaps in, the hair stirring between
  c(1, 'seal', K('sign2', { hdy: 1 }), { post: 'stand', fx: [brow(1)] }),
  c(1, 'seal', K('sign2', { hdy: 1, eyes: 'seal1' }), { post: 'stand', fx: [brow(2)] }),
  c(1, 'seal', K('sign2Wind', { eyes: 'seal1' }), { post: 'stand', fx: [brow(1)] }),
  c(1, 'seal', K('sign2', { hdy: 1, eyes: 'seal2' }), { post: 'stand', fx: [aura()] }),
  c(1, 'seal', K('sign2Wind', { eyes: 'seal2' }), { post: 'stand', fx: [aura()] }),
  c(1, 'seal', K('sign2', awake({ hdy: 1, eyes: 'focus' })), { post: 'stand', fx: [aura(), brow(0)] }),
  // chakra balled in the fist, then the fist driven down at her side, packed
  c(1, 'charge', K('gather', awake({ hdy: 1 })), { post: 'stand', fx: [aura(), glint(0)] }),
  ...hold(3, 'charge', K('gather', awake()), { post: 'stand', fx: [aura(), glint()] }),
  c(1, 'charge', K('charge', awake({ hdy: 1, eyes: 'focus' })), { post: 'stand', fx: [aura(), glint(2)] }),
  ...hold(3, 'charge', K('charge', awake({ eyes: 'focus' })), { post: 'stand', fx: [aura(), glint()] }),
  // sunk back, and the run
  // (the aura drawn in round her as she sinks, flaring off the top, and
  // left breaking up where she sprang from)
  ...plainWindup(runIn('dash', { look: T(awake()), ready: 'charge', style: 'heavy', fx: (i, part) => (part === 'windup' ? [auraLow(), glint(), ...(i === 0 ? [violet('breakup', 0, 'head', { d: [3, 2] }), violet('breakup', 0, 'head', { d: [17, 3] })] : i === 1 ? [violet('breakup', 1, 'head', { d: [10, -1] })] : [])] : part === 'travel' ? [auraLow(), violet('breakup', 1, [HOME + 1, GROUND - 5])] : []) })),
  // the punch: the post's flash, frozen two frames, the lion roars, the post is blown away
  c(1, 'impact', K('punch', T(awake({ x: STRIKE, eyes: 'shout' }))), { post: 'lean', flash: 'post', fx: [star(0, 'post'), fx('shockRing', 1, 'post', { back: true })], shake: [-2, 0] }),
  c(1, 'impact', K('punch', T(awake({ x: STRIKE, eyes: 'shout' }))), { post: 'lean', fx: [star(1, 'post'), fx('shockRing', 1, 'post', { back: true })], shake: [-2, 0] }),
  c(1, 'impact', K('punch', T(awake({ x: STRIKE, eyes: 'shout' }))), { post: 'lean', pdx: -3, fx: [star(2, 'post'), fx('shockRing', 2, 'post', { back: true }), fx('dustWave', 0, [POST_X + 1, GROUND])], shake: [1, 0] }),
  c(1, 'impact', K('punch', T(awake({ x: STRIKE, eyes: 'shout' }))), { post: 'lean', pdx: -6, pdy: -1, fx: [star(3, 'post'), fx('shockRing', 3, 'post', { back: true }), fx('dustWave', 1, [POST_X + 1, GROUND])] }),
  c(1, 'impact', K('follow', T(awake({ x: STRIKE - 1, eyes: 'focus' }))), { post: 'lean', pdx: -9, fx: [fx('shockRing', 4, 'post', { back: true }), fx('dustWave', 2, [POST_X + 1, GROUND]), dustAt(0, PAST)] }),
  // she holds the follow-through as the dust rolls out and settles
  ...hold(3, 'impact', K('follow', T(awake({ x: STRIKE - 1, eyes: 'focus' }))), i => ({ post: 'lean', pdx: -9, fx: [...(i < 2 ? [fx('dustWave', 3, [POST_X + 1, GROUND])] : []), ...(i < 3 ? [dustAt(Math.min(2, i + 1), PAST), dustAt(i, POST_X + 6)] : [])] })),
  // she straightens, folds her arms and looks after it, smug
  c(1, 'impact', K('crossed', awake({ x: STRIKE - 1, hdy: 1, eyes: 'smug' })), { post: 'lean', pdx: -9, fx: [dustAt(2, PAST)] }),
  c(3, 'impact', K('crossed', awake({ x: STRIKE - 1, eyes: 'smug' })), { post: 'lean', pdx: -9 }),
  // home in a heavy bound; the seal draws back into the diamond as she lands
  ...hopHome('back', STRIKE - 1, 'lean', awake(), 2, 'leap', { style: 'heavy' }).map((cl, i, all) => {
    const k = cl.k!
    const fading = i >= all.length - 2
    return { ...cl, pdx: -9, k: fading ? { ...k, awake: false, eyes: i === all.length - 2 ? 'seal2' : 'seal1' } : k }
  }),
  c(1, 'recover', K('ease', { eyes: 'smug' }), { post: 'lean', pdx: -9, fx: [brow(2)] }),
  c(1, 'recover', K('idle1', { hdy: 1, eyes: 'smug' }), { post: 'lean', pdx: -9, fx: [fx('smoke', 1, [POST_X + 3 - 9, GROUND]), brow(1)], poof: 'out' }),
  c(1, 'recover', K('idle0', { eyes: 'smug' }), { fx: [fx('smoke', 3, [POST_X + 3 - 9, GROUND]), brow(0)], poof: 'out' }),
  c(1, 'recover', K('idle0', { eyes: 'smug' }), { fx: [fx('smoke', 4, [POST_X + 3 - 9, GROUND - 1])] }),
]
export const HUNDRED = celMove(TOP, { name: 'Strength of a Hundred Seal', shout: 'Strength of a Hundred', dojutsu: false, on: ['edit'] }, hundredCels)

// ------------------------------------------------------------------ Katsuyu (4.5 s)

// The seals, the palm to the ground, and in a burst of smoke Katsuyu rears
// up huge, taller than the stage: the great slug's head looms between
// Tsunade and the post (clear of Tsunade's hair, which starts at column 27),
// her eyes on their stalks at the stage's very top, smiling. Tsunade throws
// a hand up to her ("Katsuyu!"), points, and the slug opens her mouth and
// hoses the post down with a jet of acid that eats it through, Tsunade's hand
// on her hip; then, as Tsunade folds her arms, the slug sinks away and bursts
// apart into a scatter of puffs and little slugs (splitting up).
// her foot (sunk below the floor: she stands in it), her mouth
const KAT: [number, number] = [22, GROUND]
const MOUTH: [number, number] = [14, 9]
const katsuyu = (f = 0, sink = 6): FxUse => fx('katsuyuGiant', f, KAT, { back: true, sink })
// the cloud she comes in: at her base, her middle and her head
const cloud = (f: number): FxUse[] => [fx('smoke', f, [KAT[0] - 4, GROUND]), fx('smoke', f, [KAT[0] - 5, GROUND - 9]), fx('smoke', Math.max(0, f - 1), [KAT[0] - 6, GROUND - 16])]
// the slug split up: little puffs bursting over where she stood, then
// thinning to wisps
const split = (f: number): FxUse[] => [
  ...(f <= 5 ? [fx('smoke', Math.min(4, f), [KAT[0] - 6, GROUND])] : []),
  ...(f >= 1 && f <= 5 ? [fx('smoke', f - 1, [KAT[0] - 2, GROUND - 7])] : []),
  ...(f <= 3 ? [fx('smoke', Math.min(4, f + 1), [KAT[0] - 5, GROUND - 14])] : []),
  ...(f >= 2 ? [fx('smoke', 4, [KAT[0] - 9, GROUND - 4 - f], { sink: 11 })] : []),
]
// the acid: a solid stream out of her mouth, shooting out (0-2) then
// pouring (3, 4), and the pool it makes over the post and round its foot
const jet = (f: number): FxUse => fx('acidJet', f, MOUTH)
const pool = (f: number): FxUse => fx('acidPool', f, [POST_X + 1, GROUND])
const katsuyuCels: Cel[] = [
  ...postIn('signs', [K('sign1', { hdy: 1 }), K('sign1')]),
  ...hold(2, 'signs', K('sign1'), { post: 'stand' }),
  c(1, 'signs', K('sign3', { hdy: 1 }), { post: 'stand' }),
  ...hold(3, 'signs', K('sign3'), { post: 'stand' }),
  c(1, 'slam', K('slam', T({ hdy: 1 })), { post: 'stand', shout: true, fx: [fx('sealRing', 0, 'hand', { back: true }), fx('dust', 0, 'hand')] }),
  c(1, 'slam', K('slam', T()), { post: 'stand', fx: [fx('sealRing', 1, 'hand', { back: true }), fx('dust', 1, 'hand'), fx('sealLine', 0, 'hand', { back: true })] }),
  c(1, 'slam', K('slam', T()), { post: 'stand', fx: [fx('sealRing', 2, 'hand', { back: true }), fx('sealLine', 1, 'hand', { back: true })] }),
  c(1, 'slam', K('slam', T()), { post: 'stand', fx: [fx('sealRing', 3, 'hand', { back: true }), fx('sealLine', 2, 'hand', { back: true })] }),
  // the cloud bursts, and Katsuyu rears up out of it as Tsunade rises
  c(1, 'appear', K('slam', T({ hdy: 1 })), { post: 'stand', fx: [fx('sealLine', 4, 'hand', { back: true }), ...cloud(0)] }),
  c(1, 'appear', K('gather', { hdy: 1, eyes: 'wide' }), { post: 'stand', fx: [katsuyu(0, 20), ...cloud(1)] }),
  c(1, 'appear', K('gather', { eyes: 'wide' }), { post: 'stand', fx: [katsuyu(0, 13), ...cloud(2)] }),
  c(1, 'appear', K('gather', { eyes: 'focus' }), { post: 'stand', fx: [katsuyu(0, 8), ...cloud(3)] }),
  // (she settles her full weight on the floor: the stage jolts a pixel)
  c(1, 'appear', K('gather', { hdy: 1, eyes: 'smug' }), { post: 'stand', fx: [katsuyu(), ...cloud(4)], shake: [0, 1] }),
  ...hold(3, 'appear', K('gather', { eyes: 'smug' }), { post: 'stand', fx: [katsuyu()] }),
  // a hand thrown up to her: "Katsuyu!"
  c(1, 'appear', K('raise', { hdy: 1, eyes: 'shout' }), { post: 'stand', fx: [katsuyu(), glint(0)] }),
  c(2, 'appear', K('raise', { eyes: 'focus' }), { post: 'stand', fx: [katsuyu(), glint(1)] }),
  // the command: she plants her feet and points the post out to her, a
  // column in, then leans into it as the mouth opens and the jet shoots
  // out...
  c(1, 'spit', K('strike', T({ x: HOME - 1, hdy: 1, eyes: 'shout' })), { post: 'stand', fx: [katsuyu()] }),
  c(1, 'spit', K('strike', T({ x: HOME - 1, eyes: 'focus' })), { post: 'stand', fx: [katsuyu(1), jet(0)] }),
  c(1, 'spit', K('strike', T({ x: HOME - 2, eyes: 'focus' })), { post: 'stand', fx: [katsuyu(1), jet(1)] }),
  // ...and it comes down over the post in a solid stream: the post's flash
  // and the stage jolted with the splash; it runs down it, pools and
  // bubbles round its foot and eats through the wood (Tsunade holding the
  // point, then a hand on her hip)
  c(1, 'impact', K('strike', T({ x: HOME - 2, eyes: 'focus' })), { post: 'lean', flash: 'post', fx: [katsuyu(1), jet(2), pool(0)], shake: [-1, 0] }),
  c(1, 'impact', K('strike', T({ x: HOME - 2, eyes: 'focus' })), { post: 'lean', fx: [katsuyu(1), jet(3), pool(1)], shake: [-1, 0] }),
  ...hold(4, 'impact', K('hip', { x: HOME - 1, eyes: 'smug' }), i => ({ post: i < 2 ? 'stand' : 'scorch', fx: [katsuyu(1), jet(3 + ((i + 1) % 2)), pool(Math.min(3, 1 + i))], ...(i === 0 ? { shake: [1, 0] as [number, number] } : {}) })),
  // the jet tails off, the wood smokes away; Tsunade folds her arms
  c(1, 'impact', K('crossed', { hdy: 1, eyes: 'smug' }), { post: 'scorch', fx: [katsuyu(), pool(3)] }),
  ...hold(2, 'impact', K('crossed', { eyes: 'smug' }), i => ({ post: 'scarred', fx: [katsuyu(), pool(4), fx('sigh', i, [POST_X + 2, 15 - i])] })),
  // she splits up: she sinks away under a burst of puffs as she breaks up,
  // little slugs popping off; Tsunade nods, then waves her off
  ...[0, 1, 2, 3, 4, 5].map(f =>
    c(1, 'split', K(f >= 3 ? 'wave' : 'crossed', { eyes: f >= 3 ? 'happy' : 'smug', ...(f === 1 || f === 4 ? { hdy: 1 } : {}) }), {
      post: 'scarred',
      fx: [...(f <= 2 ? [katsuyu(0, 6 + f * 6)] : []), ...(f >= 1 && f <= 5 ? [fx('katsuyuBits', f - 1, [KAT[0] - 4, GROUND], { back: true })] : []), ...split(f), ...(f < 2 ? [fx('sigh', 2, [POST_X + 2, 13])] : [])],
    }),
  ),
  ...end('scarred', 'smug', i => (i <= 1 ? [fx('smoke', 4, [KAT[0] - 6, GROUND - 2 - i * 3], i ? { sink: 11 } : {}), fx('smoke', 4, [KAT[0] - 2, GROUND - 9 - i * 3], i ? { sink: 11 } : {})] : [])),
]
export const KATSUYU = celMove(TOP, { name: 'Summoning Jutsu: Katsuyu', shout: 'Summon: Katsuyu', dojutsu: false, on: ['agent'] }, katsuyuCels)

// ------------------------------------------------------------------ the quick strike (1.8 s)

// Finger Flick: the post poofs in, a hand on her hip, the other up with a
// finger cocked, violet glinting in the tip; she rocks back onto her heels
// and draws the hand up high (sunk a pixel, a column back), then steps into
// one flick at the arena (past her mark on the first frame) and a wall of air
// races out and sends the post flying off it, a twinkle in the sky; the
// flick's kick rocks her back a column as it lands.
const SKY: [number, number] = [3, 3]
const air = (name: string, f: number, at: FxUse['at']): FxUse => fx(name, f, at, { pal: 'airHit' })
const quickCels: Cel[] = [
  ...postIn('ready', [K('hip', { hdy: 1, eyes: 'smug' }), K('hip', { eyes: 'smug' })], i => [glint(i)]),
  ...cast({
    k: { eyes: 'focus' },
    // effortless: no sink, no lunge, the flick and a nod (stoic)
    weight: 'stoic',
    // the hand drawn up high, the weight back
    gather: { tag: 'ready', pose: 'raise', k: i => (i === 2 ? { hdy: 1 } : {}), fx: i => [glint(i)] },
    // the step in and the flick: the wall of air off the fingertip
    release: { n: 2, tag: 'flick', pose: 'flick', k: T(), o: i => (i === 0 ? { shout: true, fx: [air('sparks', 0, 'hand'), air('windBlade', 0, [19, 16])] } : { fx: [air('windBlade', 1, [15, 16])] }) },
    // it lands: the post's flash, the burst, the post knocked off its feet
    impact: { n: 3, pose: 'flick', k: i => T({ eyes: i ? 'smug' : 'focus' }), o: i => ({ post: 'lean', ...(i === 0 ? { flash: 'post' as const, shake: [-1, 0] as [number, number] } : i === 2 ? { pdx: -4, pdy: -3 } : {}), fx: [air('impact', i, 'post'), ...(i === 2 ? [dustAt(0, POST_X + 1)] : [])] }) },
    // home a column, the hand back to the hip as it sails off
    settle: { n: 1, tag: 'impact', pose: 'thumbs', o: { post: 'lean', pdx: -10, pdy: -7, fx: [air('impact', 3, 'post'), dustAt(1, POST_X + 1)] } },
  }),
  ...hold(2, 'recover', K('thumbs'), i => ({ fx: [...(i === 0 ? [dustAt(2, POST_X + 1)] : []), air('sparks', 2 - i, SKY)] })),
  c(1, 'recover', K('ease', { eyes: 'smug' }), { fx: [air('sparks', 2, SKY)] }),
  c(1, 'recover', K('idle1', { hdy: 1, eyes: 'smug' }), { fx: [air('sparks', 1, SKY)] }),
  c(2, 'recover', K('idle0', { eyes: 'smug' }), { fx: [air('sparks', 0, SKY)] }),
]
export const QUICK = celMove(TOP, { name: 'Finger Flick', shout: 'Finger Flick', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.2 s)

// The end of a turn, her own: no hop, a breath, then a hand to the hip and a
// finger raised and flicked at you with a wink and a smirk ("leave it to
// me"), a violet glint off the fingertip; then, a step back, a hand tossing
// the pigtails back over her shoulder, smug, and eased back down (the
// roster's 'thumbs' cheer is her hand on the hip).
const cheerCels: Cel[] = [
  c(1, 'cheer', K('idle1', { hdy: 1, eyes: 'smug' })),
  c(1, 'cheer', K('thumbs', { hdy: 1 })),
  c(1, 'cheer', K('thumbs')),
  // the flick, leaning a column into it, and the hand back to the hip
  c(1, 'cheer', K('flick', { x: HOME - 1, eyes: 'wink' }), { fx: [glint(0)] }),
  c(1, 'cheer', K('flick', { x: HOME - 1, eyes: 'wink' }), { fx: [glint(1)] }),
  c(1, 'cheer', K('thumbs', { x: HOME - 1 }), { fx: [glint(2)] }),
  // the toss of the hair back over her shoulder, smug
  c(1, 'cheer', K('scratch', { hdy: 1, eyes: 'smug' })),
  c(2, 'cheer', K('scratch', { eyes: 'smug' })),
  c(1, 'recover', K('ease', { eyes: 'smug' })),
  c(1, 'recover', K('idle1', { hdy: 1, eyes: 'smug' })),
  c(1, 'recover', K('idle0', { eyes: 'smug' })),
]
export const CHEER = celMove(TOP, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)
