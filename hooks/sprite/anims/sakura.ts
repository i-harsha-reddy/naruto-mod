// Sakura's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to
// write one): the Cherry Blossom Impact, a leap and a fist driven into the
// ground that heaves it up in slabs under the post and blows out a pink
// ring; Chakra Enhanced Strength, a one-two-three and the "Shannaro!"
// haymaker that splits the floor in a crack racing to the post and sends the
// post into the sky; and Katsuyu, a little one on her shoulder, the healing
// green poured over the battered post until it stands whole again. Her
// chakra is pink: the effects' 'blossom' palette ('blossomHit' for the star
// of a blow). The blows are drawn with her head turned to the post (the
// 'turn' head) and flash the post, never the stage.

import { celMove } from '../cels.ts'
import { GROUND, HOME, POST_X, STRIKE } from '../stage.ts'
import { TOP } from '../templates/top.ts'
import type { Cel, FxUse, NinjaCel } from '../types.ts'
import { K, LEAP_CLIP, c, dustAt, fx, hold, hopHome, leap, postIn, postOut, runIn, smokeAt, wispsAt } from './kit.ts'

const PINK = 'blossom'
const pink = (name: string, f: FxUse['f'], at: FxUse['at'], o: Partial<FxUse> = {}): FxUse => fx(name, f, at, { pal: PINK, ...o })
// the star of a blow, tinted through with her chakra
const star = (f: number, at: FxUse['at'], o: Partial<FxUse> = {}): FxUse => fx('impact', f, at, { pal: 'blossomHit', ...o })
// the pink chakra licking up round her, and the fist packed with it
const aura = (): FxUse => pink('aura', 'cycle', 'feet', { back: true })
const auraLow = (): FxUse => pink('auraLow', 'cycle', 'feet', { back: true })
const fist = (f: FxUse['f'] = 'cycle'): FxUse => pink('sparks', f, 'hand')
// the head turned to the post, for the blows
const T = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ head: 'turn', ...o })
// the end of every move: the arms swinging back to the sides (ease, a frame
// from rest), the breath out (idle1, the head down a pixel) as the post goes
// up in smoke, then standing
const end = (post: Parameters<typeof postOut>[2], eyes: string | undefined, more: (i: number) => readonly FxUse[] = () => []): Cel[] => {
  const e = eyes ? { eyes } : {}
  return [...postOut('recover', [K('ease', e), K('idle1', { hdy: 1, ...e }), K('idle0', e)], post, more), c(1, 'recover', K('idle0', e), { fx: [wispsAt()] })]
}
// effects carried through every cel of a run (the crater through the hop home)
const keep = (cels: Cel[], add: readonly FxUse[]): Cel[] => cels.map(cl => ({ ...cl, fx: [...add, ...(cl.fx ?? [])] }))
// the wind-up rocked back at home keeps her own head (turned, its hair swung
// back would run off the stage's edge there); the blows turn it
const plainWindup = (cels: Cel[]): Cel[] => cels.map(cl => (cl.k?.pose === 'windup' && cl.k.head ? { ...cl, k: withoutHead(cl.k) } : cl))
const withoutHead = (k: NinjaCel): NinjaCel => {
  const { head: _, ...rest } = k
  return rest
}

// ------------------------------------------------------------------ Cherry Blossom Impact (4.6 s)

// Chakra packed into the fist (the hair and skirt stirring in it, the fist
// clenched once with a dip of the head), a sink into the crouch, a real leap
// at the post, and the fist driven into the ground at its foot: the post's
// flash and a white-hot bloom out of the ground, then the whole arena
// broken: slabs of floor heaving up in a fan either side (blossomQuake), a
// dome of pink force blown out to the stage's edges (blossomDome), rock
// flying, dust rolling out both ways, and the post launched high into the
// air to come down leaning in a crater the arena wide. She stays down in it a beat, clenches the fist in
// the ground, then rises up out of it into the follow-through and hops
// home; the post and the crater go up in smoke.
const LAND = 28
// where the fist goes into the ground (the slam's hand point)
const PIT: [number, number] = [LAND - 11, GROUND]
// the arena-wide crater (fx/quake.ts's blossomQuake), behind her and the post
const bigCrater = (f: number): FxUse => fx('blossomQuake', f, PIT, { back: true })
// the dome of pink force out of the ground, blown out over the arena in
// front of everything (drawn without its half over her)
const dome = (f: number): FxUse => pink('blossomDome', f, PIT)
// the dust rolling out both ways along the floor, from either side of the crater
const dust = (f: number): FxUse[] => [fx('dustWave', f, [PIT[0] - 9, GROUND]), fx('dustWave', f, [PIT[0] + 11, GROUND], { back: true })]
const POST = { post: 'stand' as const }
const impactCels: Cel[] = [
  // the post poofs in as she balls her fist; the chakra gathers in it
  ...postIn('ready', [K('gather', { hdy: 1 }), K('gather')], () => [fist()]),
  ...hold(3, 'ready', K('gather'), { ...POST, fx: [aura(), fist()] }),
  // the fist clenched on it: the head dips, the chakra flares
  c(1, 'ready', K('gather', { hdy: 1, eyes: 'shout' }), { ...POST, fx: [aura(), fist(2), pink('sparks', 1, 'hand', { d: [-2, -2] })] }),
  ...hold(2, 'ready', K('gather'), { ...POST, phase: 2, fx: [aura(), fist()] }),
  // the fist driven down at her side, packed with it, the chakra boiling up
  c(1, 'ready', K('charge', { hdy: 1, eyes: 'shout' }), { ...POST, fx: [aura(), fist(0)] }),
  ...hold(2, 'ready', K('charge', { eyes: 'focus' }), { ...POST, fx: [aura(), fist()] }),
  // anticipation: down into the deepest crouch, the fist drawn in low
  c(1, 'ready', K('windup', { hdy: 1 }), { ...POST, fx: [auraLow(), fist()] }),
  ...hold(4, 'ready', K('windup'), { ...POST, fx: [auraLow(), fist()] }),
  // the spring and the leap at the post, limbs flung out, the fist ahead
  // (the chakra she sprang from left breaking up on the ground behind her)
  ...leap('leap', { x: HOME, pose: 'leap', eyes: 'focus' }, { to: LAND + 2, lift: 5, hang: 2, squash: 0, post: 'stand', more: i => [fist(), ...(i === 0 ? [auraLow()] : i <= 2 ? [pink('breakup', i - 1, [HOME, GROUND - 3])] : [])] }),
  // the dive: the fist brought down, the whole of her behind it (on down
  // from the leap's last frame, a pixel a frame)
  c(1, 'dive', K('slam', T({ x: LAND, lift: 2, clip: LEAP_CLIP, eyes: 'shout' })), { ...POST, fx: [fist(0)] }),
  c(1, 'dive', K('slam', T({ x: LAND, lift: 1, clip: LEAP_CLIP, eyes: 'shout' })), { ...POST, fx: [fist(1)] }),
  // the blow, the biggest frame of the mod's quick-tempered medic: the
  // post's flash and a white-hot bloom out of the ground at the fist as the
  // floor caves, cracks racing out across the whole arena (hit-stop, two
  // frames, the stage jolted); then three slabs a side heave up in a fan
  // under her and the post, a dome of pink force blows out to the stage's
  // edges behind them, rock flies and the post is launched high into the
  // air; the slabs crash back into a crater the arena wide, dust rolls out
  // both ways, and the post comes down leaning in it (an aftershock)
  c(1, 'impact', K('slam', T({ x: LAND, eyes: 'shout' })), { ...POST, flash: 'post', fx: [bigCrater(0), dome(0), star(1, PIT, { d: [0, -3] })], shake: [0, 1] }),
  c(1, 'impact', K('slam', T({ x: LAND, eyes: 'shout' })), { post: 'lean', pdy: -4, fx: [bigCrater(1), dome(1), star(2, PIT, { d: [0, -4] }), fx('rubble', 0, PIT, { back: true })], shake: [0, 1] }),
  c(1, 'impact', K('slam', T({ x: LAND, eyes: 'shout' })), { post: 'lean', pdy: -9, fx: [bigCrater(2), dome(2), fx('rubble', 1, PIT, { back: true }), fx('earth', 1, PIT), ...dust(0)], shake: [-1, 0] }),
  c(1, 'impact', K('slam', T({ x: LAND, eyes: 'focus' })), { post: 'lean', pdy: -12, fx: [bigCrater(2), dome(3), fx('rubble', 2, PIT, { back: true }), fx('earth', 2, PIT), ...dust(1)] }),
  c(1, 'impact', K('slam', T({ x: LAND, eyes: 'focus' })), { post: 'lean', pdy: -9, fx: [bigCrater(3), fx('rubble', 3, PIT, { back: true }), ...dust(2)] }),
  c(1, 'impact', K('slam', T({ x: LAND, hdy: 1, eyes: 'focus' })), { post: 'lean', pdy: -4, fx: [bigCrater(3), ...dust(3)] }),
  // the post comes down in the crater, the floor jolting with it; she
  // pulls the fist out of the ground with a shout
  c(1, 'impact', K('slam', T({ x: LAND, eyes: 'focus' })), { post: 'lean', fx: [bigCrater(3), dustAt(0, POST_X), ...dust(3)], shake: [1, 0] }),
  c(1, 'impact', K('crouch', T({ x: LAND, hdy: 1, eyes: 'shout' })), { post: 'lean', fx: [bigCrater(3), dustAt(1, POST_X), dustAt(0, PIT[0] + 7), pink('sparks', 2, 'hand')] }),
  // she rises up out of it into the follow-through, the fist carried up and on
  c(1, 'back', K('crouch', T({ x: LAND, eyes: 'focus' })), { post: 'lean', fx: [bigCrater(3), dustAt(0, LAND), dustAt(2, POST_X), dustAt(1, PIT[0] + 7)] }),
  c(1, 'back', K('follow', T({ x: LAND, hdy: 1, eyes: 'focus' })), { post: 'lean', fx: [bigCrater(3), dustAt(1, LAND)] }),
  c(2, 'back', K('follow', T({ x: LAND, eyes: 'happy' })), { post: 'lean', fx: [bigCrater(3)] }),
  // "Cha!": the fist yanked down to the hip
  c(1, 'back', K('pump2', { x: LAND, eyes: 'shout' }), { post: 'lean', fx: [bigCrater(3)] }),
  // and a light skip home over the broken floor
  ...keep(hopHome('back', LAND, 'lean', {}, 2, 'leap', { style: 'skip' }), [bigCrater(3)]),
  // the crater crumbling away as the post goes up in smoke
  ...end('lean', 'happy', i => (i <= 2 ? [bigCrater(4 + i)] : [])),
]
export const IMPACT = celMove(TOP, { name: 'Cherry Blossom Impact', shout: 'Cherry Blossom Impact', dojutsu: false, on: ['shell'] }, impactCels)

// ------------------------------------------------------------------ Chakra Enhanced Strength (4.9 s)

// The run in and a one-two-three on the post (fist, a rising kick, fist), a
// hop back and the fist drawn back boiling with pink chakra ("Shannaro!"),
// then the haymaker: her front foot stamps and the floor splits, a crack
// racing from under her along the ground to the post and past it, chips
// spitting up out of it, and the post is blasted off the arena into the sky,
// a twinkle where it went. Not the Cherry Blossom Impact's pit and ring: a
// line, the strength of the blow carried through the ground.
const SKY: [number, number] = [3, 3]
// where the crack starts: her front foot at the haymaker
const FOOT: [number, number] = [STRIKE - 8, GROUND]
const crack = (f: number): FxUse => fx('fissure', f, FOOT, { back: true })
const strengthCels: Cel[] = [
  // the post poofs in as she cracks her knuckles, looking at it
  ...postIn('ready', [K('windup', { hdy: 1 }), K('windup')]),
  // the run in, and the fist
  ...plainWindup(runIn('dash', { look: T(), ready: 'ready' })),
  c(1, 'hit', K('punch', T({ x: STRIKE, eyes: 'focus' })), { post: 'lean', flash: 'post', fx: [star(0, 'post'), dustAt(1, HOME + 2)] }),
  c(1, 'hit', K('punch', T({ x: STRIKE, eyes: 'focus' })), { post: 'lean', fx: [star(1, 'post'), dustAt(2, HOME + 2)] }),
  c(1, 'hit', K('punch', T({ x: STRIKE, eyes: 'focus' })), { post: 'stand', pdx: -1, fx: [star(2, 'post')] }),
  // the foot: a rising kick at its top
  c(1, 'hit2', K('kick', T({ x: STRIKE + 2, eyes: 'focus' })), { post: 'lean', fx: [pink('sparks', 0, 'hand')] }),
  c(1, 'hit2', K('kick', T({ x: STRIKE + 2, eyes: 'focus' })), { post: 'stand', pdx: -1, fx: [pink('sparks', 1, 'hand')] }),
  // the other fist
  c(1, 'hit3', K('strike', T({ x: STRIKE, eyes: 'focus' })), { post: 'lean', fx: [pink('sparks', 0, 'post')] }),
  c(1, 'hit3', K('strike', T({ x: STRIKE, eyes: 'focus' })), { post: 'stand', pdx: -1, fx: [pink('sparks', 2, 'post')] }),
  // a hop back, and the fist drawn back boiling with chakra: "Shannaro!"
  c(2, 'windup', K('crouch', { x: 29, eyes: 'focus' }), { post: 'stand', shout: true, fx: [dustAt(0, 29)] }),
  ...hold(8, 'windup', K('windup', T({ x: 30, eyes: 'shout' })), i => ({ post: 'stand', fx: [auraLow(), i < 2 ? fist(0) : pink('rasengan', 'cycle', 'hand'), ...(i < 2 ? [dustAt(1 + i, 29)] : [])] })),
  // the lunge
  c(1, 'dash', K('smear', T({ x: 28, eyes: 'shout' })), { post: 'stand', fx: [dustAt(0, 32), pink('rasengan', 'cycle', 'hand')] }),
  // the haymaker: the post's flash, frozen two frames as the front foot
  // stamps and the crack starts out from under it...
  c(1, 'impact', K('punch', T({ x: STRIKE, eyes: 'shout' })), { post: 'lean', flash: 'post', fx: [crack(0), star(0, 'post'), dustAt(0, FOOT[0])], shake: [-2, 0] }),
  c(1, 'impact', K('punch', T({ x: STRIKE, eyes: 'shout' })), { post: 'lean', fx: [crack(1), star(1, 'post'), dustAt(1, FOOT[0])], shake: [-2, 0] }),
  // ...races under the post, which jumps off the splitting floor and is blasted away...
  c(1, 'impact', K('punch', T({ x: STRIKE, eyes: 'shout' })), { post: 'lean', pdx: -4, pdy: -3, fx: [crack(2), star(2, 'post'), fx('rubble', 1, [POST_X + 1, GROUND], { back: true })], shake: [2, 0] }),
  c(1, 'impact', K('follow', T({ x: STRIKE - 1, eyes: 'shout' })), { post: 'lean', pdx: -9, pdy: -6, fx: [crack(3), fx('rubble', 2, [POST_X + 1, GROUND], { back: true }), dustAt(0, POST_X + 1)] }),
  c(1, 'impact', K('follow', T({ x: STRIKE - 1, eyes: 'focus' })), { post: 'lean', pdx: -14, pdy: -10, fx: [crack(3), fx('rubble', 3, [POST_X + 1, GROUND], { back: true }), dustAt(1, POST_X + 1)] }),
  // ...gone, the crack left in the floor; she holds the follow-through
  ...hold(5, 'impact', K('follow', T({ x: STRIKE - 1, eyes: 'focus' })), i => ({ fx: [crack(4), ...(i < 1 ? [dustAt(2, POST_X + 1)] : [])] })),
  // the hop home, watching it go
  ...keep(hopHome('back', STRIKE - 1, null, {}, 2, 'leap', { style: 'skip' }), [crack(4)]),
  // a twinkle far off in the sky where it went, and the fist pumped: "Cha!";
  // the crack in the floor crumbles away to grit and dust as she eases down
  c(1, 'recover', K('thumbs'), { fx: [crack(4), pink('sparks', 2, SKY)] }),
  c(1, 'recover', K('thumbs', { hdy: 1 }), { fx: [crack(4), pink('sparks', 1, SKY)] }),
  c(1, 'recover', K('pump2', { eyes: 'happy' }), { fx: [crack(5), pink('sparks', 0, SKY)] }),
  c(1, 'recover', K('ease', { eyes: 'happy' }), { fx: [crack(6), pink('sparks', 2, SKY)] }),
  c(1, 'recover', K('idle1', { hdy: 1, eyes: 'happy' }), { fx: [crack(7), pink('sparks', 1, SKY)] }),
  c(2, 'recover', K('idle0', { eyes: 'happy' }), { fx: [pink('sparks', 0, SKY)] }),
]
export const SHANNARO = celMove(TOP, { name: 'Chakra Enhanced Strength', shout: 'Shannaro', dojutsu: false, on: ['edit'] }, strengthCels)

// ------------------------------------------------------------------ Katsuyu (5.2 s)

// The healer's summoning (the war arc): the post stands battered (scarred)
// as the seals snap in, the palm to the ground and the script racing out,
// and in a burst of smoke beside the post the great Katsuyu rises, a dome
// taller than the post, eyes on their stalks, her face clear of it (the post
// stands before her flank). She greets Sakura, then divides as she does in
// canon: little slugs bud out of her (Sakura starts back a step) and she
// falls apart into a heap of them that pops away in all directions, and one
// of them sails over and lands on Sakura's shoulder. Sakura gathers the green
// medical chakra into a soft glow in her palm, the little slug lit with it,
// and turns the palm to the post: the light gathers over its crown, sinks
// over it and wraps it, and it stands whole again inside the light, which
// settles to a pool at its foot as sparkles rise off it (a heal, never a
// shot at it). The little slug poofs away.
// where the great slug stands: behind the post, her face out to its left
const KAT: [number, number] = [12, GROUND]
const katsuyu = (f: number, sink = 0): FxUse => fx('katsuyu', f, KAT, { back: true, ...(sink ? { sink } : {}) })
const bits = (f: number): FxUse => fx('katsuyuBits', f, KAT, { back: true })
// the cloud she comes in: at her base, her middle and her head
const cloud = (f: number): FxUse[] => [fx('smoke', f, [KAT[0] - 2, GROUND]), fx('smoke', f, [KAT[0] - 4, GROUND - 8]), fx('smoke', Math.max(0, f - 1), [KAT[0] - 6, GROUND - 15])]
// the little slug's foot on her near shoulder, out beside the hair (clear of
// her face), and her flight there from the heap
const SHOULDER: [number, number] = [HOME - 13, 17]
const FLIGHT: readonly [number, number][] = [
  [KAT[0] + 3, 10],
  [KAT[0] + 6, 7],
  [HOME - 16, 14],
]
const HEAL = 'heal'
const heal = (name: string, f: FxUse['f'], at: FxUse['at'], o: Partial<FxUse> = {}): FxUse => fx(name, f, at, { pal: HEAL, ...o })
const slug = (f = 0, at: FxUse['at'] = SHOULDER): FxUse => fx('katsuyuMini', f, at)
const puff = (f: number): FxUse => fx('smoke', f, [SHOULDER[0], SHOULDER[1] + 2], { sink: 3 })
// the little slug on her shoulder as she steps in (dx: her root's step)
const near = (dx: number): [number, number] => [SHOULDER[0] + dx, SHOULDER[1]]
// where the heal's light settles: the post's foot, its middle
const GLOW: [number, number] = [POST_X + 1, GROUND]
const SCARRED = { post: 'scarred' as const }
const katsuyuCels: Cel[] = [
  // the seals snapping in (the head dipping with each) as the battered post poofs in
  c(1, 'signs', K('sign1', { hdy: 1 }), { fx: [smokeAt(1)], poof: 'in' }),
  c(1, 'signs', K('sign1'), { ...SCARRED, fx: [smokeAt(3)], poof: 'in' }),
  ...hold(1, 'signs', K('sign1'), SCARRED),
  c(1, 'signs', K('sign2', { hdy: 1 }), SCARRED),
  ...hold(2, 'signs', K('sign2'), SCARRED),
  c(1, 'signs', K('sign3', { hdy: 1 }), SCARRED),
  c(1, 'signs', K('sign3'), SCARRED),
  // the palm to the ground: the ring opens, the script races out to the post
  c(1, 'slam', K('slam', T({ hdy: 1 })), { ...SCARRED, shout: true, fx: [fx('sealRing', 0, 'hand', { back: true }), fx('dust', 0, 'hand')] }),
  c(1, 'slam', K('slam', T()), { ...SCARRED, fx: [fx('sealRing', 1, 'hand', { back: true }), fx('dust', 1, 'hand'), fx('sealLine', 0, 'hand', { back: true })] }),
  c(1, 'slam', K('slam', T()), { ...SCARRED, fx: [fx('sealRing', 2, 'hand', { back: true }), fx('sealLine', 1, 'hand', { back: true })] }),
  c(1, 'slam', K('slam', T()), { ...SCARRED, fx: [fx('sealRing', 3, 'hand', { back: true }), fx('sealLine', 2, 'hand', { back: true })] }),
  // the smoke bursts beside the post, and the great slug rises out of it
  c(1, 'appear', K('slam', T({ hdy: 1 })), { ...SCARRED, fx: [fx('sealLine', 4, 'hand', { back: true }), ...cloud(0)] }),
  c(1, 'appear', K('gather', { hdy: 1, eyes: 'wide' }), { ...SCARRED, fx: [katsuyu(0, 14), ...cloud(1)] }),
  c(1, 'appear', K('gather', { eyes: 'wide' }), { ...SCARRED, fx: [katsuyu(0, 8), ...cloud(2)] }),
  c(1, 'appear', K('gather', { eyes: 'wide' }), { ...SCARRED, fx: [katsuyu(0, 3), ...cloud(3)] }),
  c(1, 'appear', K('gather', { eyes: 'happy' }), { ...SCARRED, fx: [katsuyu(0), ...cloud(4)], shake: [0, 1] }),
  // "Katsuyu-sama!": a step toward her and a wave up at her, and she answers ("Sakura-san")
  c(1, 'appear', K('wave', { x: HOME - 1, hdy: 1, eyes: 'happy' }), { ...SCARRED, fx: [katsuyu(1)] }),
  c(2, 'appear', K('wave', { x: HOME - 1, eyes: 'happy' }), { ...SCARRED, fx: [katsuyu(0)] }),
  c(1, 'appear', K('wave', { x: HOME - 1, hdy: 1, eyes: 'happy' }), { ...SCARRED, fx: [katsuyu(1)] }),
  c(1, 'appear', K('wave', { x: HOME - 1, eyes: 'focus' }), { ...SCARRED, fx: [katsuyu(1)] }),
  // she divides: little slugs bud out of her (Sakura's hands fly up as she
  // starts back a step), she falls apart into a heap of them, and they pop
  // off every way; one sails over to Sakura's shoulder
  c(1, 'split', K('alert', { x: HOME + 1, hdy: 1, eyes: 'wide' }), { ...SCARRED, fx: [katsuyu(2)] }),
  c(1, 'split', K('alert', { x: HOME + 1, eyes: 'wide' }), { ...SCARRED, fx: [katsuyu(2)] }),
  c(1, 'split', K('alert', { x: HOME + 1, eyes: 'wide' }), { ...SCARRED, fx: [katsuyu(3), bits(0)] }),
  c(1, 'split', K('gather', { x: HOME + 1, hdy: 1, eyes: 'wide' }), { ...SCARRED, fx: [katsuyu(4), bits(1), slug(3, FLIGHT[0])] }),
  c(1, 'split', K('gather', { x: HOME + 1, eyes: 'focus' }), { ...SCARRED, fx: [bits(2), slug(3, FLIGHT[1])] }),
  c(1, 'split', K('gather', { x: HOME + 1, eyes: 'focus' }), { ...SCARRED, fx: [bits(3), slug(3, FLIGHT[2])] }),
  // it lands: squashed flat on her shoulder, and she bobs under it, back home
  c(1, 'split', K('gather', { dy: 1, eyes: 'happy' }), { ...SCARRED, fx: [bits(4), slug(2, [SHOULDER[0], SHOULDER[1] + 1])] }),
  c(1, 'split', K('gather', { eyes: 'happy' }), { ...SCARRED, fx: [slug(0)] }),
  // the healing green gathered into her palm, low and out in front, a soft
  // glow swelling in it, the little slug lit with it (no aura round her)
  c(1, 'heal', K('charge', { hdy: 1, eyes: 'focus' }), { ...SCARRED, fx: [slug(1), heal('healOrb', 0, 'hand')] }),
  ...hold(5, 'heal', K('charge', { eyes: 'focus' }), i => ({ ...SCARRED, fx: [slug(i % 4 < 2 ? 1 : 0), fx('healOrb', i % 4 === 3 ? 2 : 1, 'hand')] })),
  // the palm turned to the post, a step in: the light gathers over the
  // post's crown and sinks over it...
  c(1, 'heal', K('strike', T({ x: HOME - 1, eyes: 'focus' })), { ...SCARRED, fx: [slug(1, near(-1)), fx('healOrb', 2, 'hand'), fx('healGlow', 0, GLOW, { back: true })] }),
  c(1, 'heal', K('strike', T({ x: HOME - 1, hdy: 1, eyes: 'focus' })), { ...SCARRED, fx: [slug(1, near(-1)), fx('healGlow', 1, GLOW, { back: true })] }),
  // ...wraps it, and it stands whole again inside the light (she leans the
  // palm on into it); the light settles down it to a pool at its foot as
  // the sparkles rise
  c(1, 'impact', K('strike', T({ x: HOME - 2, eyes: 'focus' })), { post: 'stand', fx: [slug(1, near(-2)), fx('healGlow', 2, GLOW, { back: true })] }),
  c(1, 'impact', K('strike', T({ x: HOME - 2, eyes: 'happy' })), { post: 'stand', fx: [slug(0, near(-2)), fx('healGlow', 2, GLOW, { back: true }), fx('healSparkle', 0, GLOW)] }),
  c(1, 'impact', K('gather', { hdy: 1, eyes: 'happy' }), { post: 'stand', fx: [slug(), fx('healGlow', 3, GLOW, { back: true }), fx('healSparkle', 1, GLOW)] }),
  ...hold(3, 'impact', K('gather', { eyes: 'happy' }), i => ({ post: 'stand', fx: [slug(), ...(i === 0 ? [fx('healGlow', 4, GLOW, { back: true })] : []), fx('healSparkle', 2 + Math.min(1, i), GLOW)] })),
  // a fist pumped for it ("Cha!"), and the little slug poofs away
  c(1, 'vanish', K('pump', { eyes: 'happy' }), { post: 'stand', fx: [puff(1)] }),
  c(1, 'vanish', K('pump', { hdy: 1, eyes: 'happy' }), { post: 'stand', fx: [puff(3)] }),
  c(1, 'vanish', K('pump2', { eyes: 'happy' }), { post: 'stand', fx: [puff(4)] }),
  ...end('stand', 'happy'),
]
export const KATSUYU = celMove(TOP, { name: 'Summoning Jutsu: Katsuyu', shout: 'Summon: Katsuyu', dojutsu: false, on: ['agent'] }, katsuyuCels)

// ------------------------------------------------------------------ the quick strike (2.0 s)

// For an edit: "Cha!", the uppercut (not Chakra Enhanced Strength's run and
// straight punch): she drops into a crouch with the fist cocked as the post
// poofs in, glides in low under it (her chakra breaking up behind), dips, and
// springs up through it with the fist: the post's flash, a pink star at its
// crown and the post popped up off the ground, she rising with the blow (up
// 2, held for the hit, 4, then 2 coming down); she lands under it as it
// drops back, and hops home.
const POP = { post: 'lean' as const }
// the fist lit pink as it lands, a solid glow round the glove
const glow = (f: number): FxUse => pink('healOrb', f, 'hand')
const quickCels: Cel[] = [
  // the crouch, the fist cocked low and packed with chakra, the post poofing in
  c(1, 'ready', K('crouch', { x: HOME + 1, eyes: 'shout' }), { fx: [smokeAt(1), fist()], poof: 'in' }),
  c(1, 'ready', K('crouch', { x: HOME + 1, hdy: 1, eyes: 'shout' }), { post: 'stand', fx: [smokeAt(3), fist()], poof: 'in' }),
  c(1, 'ready', K('crouch', { x: HOME + 1, eyes: 'shout' }), { post: 'stand', fx: [fist(), dustAt(0, HOME + 3)] }),
  // the glide in, low, a pink streak of chakra trailing off the fist
  c(1, 'dash', K('dash', T({ x: 30, hdy: 1, eyes: 'shout' })), { post: 'stand', fx: [fist(), pink('breakup', 0, [HOME, GROUND - 4]), dustAt(1, HOME + 3)] }),
  // under it: the dip
  c(1, 'dash', K('crouch', T({ x: STRIKE, dy: 1, eyes: 'shout' })), { post: 'stand', fx: [fist(0), dustAt(0, STRIKE)] }),
  // the uppercut: up through the post with the fist, held two frames
  // (hit-stop), the post popped up off the ground and a star at its crown
  c(1, 'impact', K('jump', T({ x: STRIKE, lift: 2, clip: LEAP_CLIP, eyes: 'shout' })), { ...POP, flash: 'post', pdy: -2, shake: [0, -1], fx: [star(0, 'post', { d: [-2, -2] }), glow(1), dustAt(1, STRIKE)] }),
  c(1, 'impact', K('jump', T({ x: STRIKE, lift: 2, clip: LEAP_CLIP, eyes: 'shout' })), { ...POP, pdy: -4, fx: [star(1, 'post', { d: [-2, -4] }), glow(1), dustAt(2, STRIKE)] }),
  // carried up with it, then down under it as it drops back
  c(1, 'impact', K('jump', T({ x: STRIKE, lift: 4, hdy: 1, clip: LEAP_CLIP, eyes: 'focus' })), { ...POP, pdy: -6, fx: [star(2, 'post', { d: [-2, -6] }), glow(1)] }),
  c(1, 'impact', K('tuck', T({ x: STRIKE + 1, lift: 2, clip: LEAP_CLIP, eyes: 'focus' })), { ...POP, pdy: -3, fx: [star(3, 'post', { d: [-2, -4] }), glow(2)] }),
  c(1, 'impact', K('crouch', T({ x: STRIKE + 1, eyes: 'happy' })), { post: 'stand', fx: [dustAt(0, POST_X + 1), dustAt(0, STRIKE + 1)] }),
  ...hopHome('back', STRIKE + 1, 'stand', {}, 1, 'leap', { style: 'skip' }).map((cl, i) => (i === 0 ? { ...cl, fx: [...(cl.fx ?? []), dustAt(1, POST_X + 1)] } : cl)),
  ...end('stand', 'happy'),
]
export const QUICK = celMove(TOP, { name: 'Cha', shout: 'Cha', on: ['edit'], quick: true, dojutsu: false }, quickCels)

// ------------------------------------------------------------------ the cheer (1.5 s)

// The end of a turn, Inner Sakura's "Cha!": a crouch and a hop with the fist
// pumped beside the face (the jump, its hair clear of the stage's top), the
// landing, then the fist pumped, yanked down to the hip and up beside the
// face again (her own cheer, the roster's 'thumbs': the pump), held a beat
// with one nod, and eased back down.
const cheerCels: Cel[] = [
  // (up 3, 5, 3: never two frames at one height; the head a pixel lower on
  // the body so the hair clears the stage's top at 5)
  ...leap('hop', { pose: 'jump', eyes: 'shout', hdy: 1 }, { lift: 5, hang: 1, squash: 2 }),
  c(1, 'cheer', K('pump2', { eyes: 'shout' }), { fx: [dustAt(2, HOME)] }),
  c(2, 'cheer', K('thumbs')),
  c(1, 'cheer', K('pump2', { eyes: 'shout' })),
  c(1, 'cheer', K('thumbs')),
  c(1, 'cheer', K('thumbs', { hdy: 1 })),
  c(1, 'cheer', K('pumpWind')),
  c(1, 'recover', K('ease', { eyes: 'happy' })),
  c(1, 'recover', K('idle1', { hdy: 1, eyes: 'happy' })),
  c(1, 'recover', K('idle0', { eyes: 'happy' })),
]
export const CHEER = celMove(TOP, { name: 'Cheer', shout: '', dojutsu: false }, cheerCels)
