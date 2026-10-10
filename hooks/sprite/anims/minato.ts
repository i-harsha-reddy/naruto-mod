// Minato's moves as cels, hand-keyed at 10 fps (anims/kit.ts says how to
// write one). The Yellow Flash is never seen travelling: a marked kunai
// thrown, the wind-up, then he is simply there: where he stood, a 1 px
// yellow outline of him in the pose he left, breaking up over three frames,
// and a short streak of light toward where he went (fx/flash.ts). No
// smears: the speed is in what is missing. His head turns to the post in
// every blow. Each jutsu lands its own way: the Flying Thunder God a
// kunai's cut through the post, the Rasengan a crater, the Three-Pronged
// Kunai the light of three flashes burning from the post at once.
//
// minatoMoves(t) is called with his template as his moves see it
// (ninja/minato.ts: the vest with his own poses), so the beats name his
// poses and faces.

import { celMove } from '../cels.ts'
import { AT } from '../fx/index.ts'
import { GROUND, HOME, STRIKE } from '../stage.ts'
import type { Cel, CelMove, FxUse, NinjaCel, PoseGrid, Template } from '../types.ts'
import { K, c, cast, dustAt, fx, leap, postIn, postOut } from './kit.ts'

// ------------------------------------------------------------------ his own drawings

// DRIVE: the Rasengan driven down into the ground before the post, one clean
// line from under the jaw down the arm to the ball on the ground (the hand
// point), clear of the head, the front knee bent, the back leg braced long
// behind; the haori's back panel flung up behind him (ninja/minato.ts).
const DRIVE: readonly string[] = [
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '.........oooooooooooo.....',
  '........onvvvwwmmmxxlo....',
  '.......onmvwwwwwwxxxlo....',
  '......onmovwwwwwwxxolo....',
  '.....onmo.oxxxxxxxxoko....',
  '....onmo..opqqqqqqqrroo...',
  '...onmo..obbbbo...oqqqro..',
  '..onmo..obbbbo.....oqqqro.',
  'osskko..ouuutto.....ouutto',
]
// GRIP: his cheer, the kunai caught in a reverse grip: the near fist held
// out at the chest (the vest's thumbs-up arm), the kunai's ring standing
// above the fist (over the hair: UPPERCASE) and its blade running down below
// it, point to the floor; the far arm easy at his side.
const GRIP: readonly string[] = [
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '.OOO..oooooooooooooo......',
  '.O.Ooncnvvvwwmmmwwwxlo....',
  'oSKNNnmovvwwwmwwwxxolo....',
  'oKKMMmmovwwwwwwwwxxolo....',
  '.ogooooovwwwwwwwwxxoko....',
  '.ogo...oxxxxxxxxxxxoko....',
  '.oho...opqqqqqqqqrooo.....',
  '..o.....obbbooqqro........',
  '.......ouuttoouutto.......',
]
export const MINATO_POSES = {
  drive: { as: 'slam', rows: DRIVE, head: [0, 2], hand: [2, 11], eyes: 'focus' },
  grip: { as: 'thumbs', rows: GRIP, hand: [1, 6], eyes: 'smug' },
} as const satisfies Record<string, PoseGrid>

// his three-pronged kunai: in his hand (the grip at the hand, the point to
// the left), or stuck in the post's face at height y, its seal tag hanging
const held = (f = 0): FxUse => fx('ftgKunai', f, 'hand', { d: [-9, -2] })
const stuck = (y: number, f: number | 'cycle' = 'cycle', phase = 0): FxUse => fx('ftgKunai', f, [AT.postHit[0] + 1, y], { phase })
const flying = (x: number, y: number): FxUse => fx('ftgKunai', 0, [x, y])
// The Yellow Flash (fx/flash.ts): where he was, the outline of him in the
// pose he left (frame 0 whole, 1 broken, 2 motes), and the streak of light
// toward where he went (at his middle where he lands: `home` for the way back)
// (both behind him and the post: the light he left, not over him)
const outline = (pose: string, x: number, f: number, lift = 0): FxUse => fx(`yf${pose[0]!.toUpperCase()}${pose.slice(1)}`, f, [x, GROUND - lift], { back: true })
const streak = (f: number, x: number, home = false, y = 14): FxUse => fx('yfStreak', f, [x, y], { back: true, ...(home ? { flip: true } : {}) })
// his kunai's stroke through the post (rising to the left, as the post's cut does)
const slash = (f: number): FxUse => fx('yfSlash', f, 'post', { flip: true, d: [-1, 0] })
const rasengan = (o: Partial<FxUse> = {}): FxUse => fx('rasengan', 'cycle', 'hand', o)
// a blow with his head turned to the post
const turn = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => K(pose, { eyes: 'focus', head: 'turn', ...o })
const KUNAI_Y = AT.postHit[1] - 2
// the root column his kick lands on the post's face from
const KICK_X = STRIKE - 1
// a kunai's thud in the post: a spark, not a star
const thud = (f: number, y = KUNAI_Y): FxUse => fx('sparks', f, [AT.postHit[0] + 1, y], { pal: 'hit' })

// Every move ends on idle1 (the head dipped) for a frame, then idle0 for two
// as the post poofs away.
const ending = (more: readonly FxUse[] = [], post: 'stand' | 'split' = 'stand'): Cel[] => [
  c(1, 'recover', K('idle1', { hdy: 1, eyes: 'happy' }), { post, fx: [...more] }),
  ...postOut('recover', [K('idle0', { eyes: 'happy' }), K('idle0', { eyes: 'happy' })], post, i => (i === 0 ? [...more] : [])),
]

export const minatoMoves = (t: Template): { moves: CelMove[]; quick: CelMove; cheer: CelMove } => {
  // ---------------------------------------------------------------- Flying Thunder God (4.5 s)

  // The marked kunai drawn as the post poofs in, cocked and thrown (cast()'s
  // light weight, the recoil at the release: up on his toes, a long step
  // past his mark, planted as it lands 15 px off): it thuds into the post,
  // its tag fluttering. The seal made one-handed, the formula alight; his own
  // kunai flipped up off his finger and caught, sunk to spring. Then he is
  // simply gone: the outline of him where he stood, a streak of light, and
  // he is at the post with the kunai through it, one clean diagonal cut (its
  // flash, the camera jolted twice and back), the top sliding on the cut;
  // gone again (his outline at the cut) and over it, tucked high, the heel
  // arcing down on its crown (the camera jolted down), landing in a crouch, up with the
  // kunai in a reverse grip and the knowing smile; and home in a flash.
  const ftg: Cel[] = [
    ...postIn('ready', [K('gather', { eyes: 'focus', hdy: 1 }), K('gather', { eyes: 'focus' }), K('windup', { x: HOME + 1, eyes: 'focus' })], i => [held(i % 2)]),
    ...cast({
      weight: 'light',
      recoil: 'release',
      k: { eyes: 'focus' },
      // cocked back on it, sunk to throw
      gather: { tag: 'ready', pose: 'windup', k: i => (i === 0 ? { hdy: 1 } : {}), fx: () => [held()] },
      // thrown, a long step into it: the arm whipped through, the kunai spinning in, the thud
      release: { tag: 'throw', pose: ['strike', 'follow', 'follow'], k: { head: 'turn' }, o: i => ({ post: i === 1 ? 'lean' : 'stand' }), fx: i => (i === 0 ? [flying(20, KUNAI_Y + 1)] : [stuck(KUNAI_Y, i - 1), thud(i - 1)]) },
      // planted as it quivers in the wood, his eye on it
      impact: { tag: 'throw', pose: 'follow', k: { head: 'turn', eyes: 'left' }, o: i => (i === 0 ? { pdx: -1 } : {}), fx: () => [stuck(KUNAI_Y, 2), thud(2)] },
      settle: false,
    }),
    // marked: back up straight, the seal made one-handed, the tag's formula alight
    c(1, 'mark', K('sign3', { eyes: 'left', hdy: 1 }), { post: 'stand', fx: [stuck(KUNAI_Y)] }),
    c(1, 'mark', K('sign3', { eyes: 'left' }), { post: 'stand', fx: [stuck(KUNAI_Y)] }),
    c(1, 'mark', K('sign3Wind', { eyes: 'focus' }), { post: 'stand', fx: [stuck(KUNAI_Y, 2)] }),
    c(1, 'mark', K('sign3Wind', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [stuck(KUNAI_Y, 2)] }),
    // his own kunai flipped up off his raised finger, turning over, and caught
    c(1, 'mark', K('raise', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [stuck(KUNAI_Y), fx('ftgKunai', 1, 'hand', { d: [-6, -4] })] }),
    c(1, 'mark', K('raiseWind', { eyes: 'focus' }), { post: 'stand', fx: [stuck(KUNAI_Y), fx('ftgKunai', 2, 'hand', { d: [-6, -7] })] }),
    c(2, 'mark', K('raise', { eyes: 'focus' }), { post: 'stand', fx: [stuck(KUNAI_Y), fx('ftgKunai', 0, 'hand', { d: [-6, -3] })] }),
    // coiled back and sunk to spring
    c(1, 'charge', K('gather', { x: HOME + 1, dy: 1, eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [stuck(KUNAI_Y), held(1)] }),
    c(2, 'charge', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus' }), { post: 'stand', fx: [stuck(KUNAI_Y, 2), held()] }),
    c(1, 'charge', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [stuck(KUNAI_Y, 2), held(1)] }),
    // gone: his outline where he stood, a streak of light
    c(1, 'flash', undefined, { post: 'stand', fx: [stuck(KUNAI_Y, 2), outline('windup', HOME + 1, 0), streak(0, STRIKE - 2)] }),
    // there, the kunai through the post: one diagonal cut (its flash, hit-stop, the camera jolted twice and back)
    c(2, 'impact', turn('strike', { x: STRIKE }), { post: 'cut', flash: 'post', fx: [slash(0), outline('windup', HOME + 1, 1), streak(1, STRIKE - 2)], shake: [-1, 0] }),
    c(1, 'impact', turn('follow', { x: STRIKE - 1 }), { post: 'cut', pdx: -1, shake: [1, 0], fx: [slash(1), outline('windup', HOME + 1, 2), streak(2, STRIKE - 2)] }),
    c(1, 'impact', turn('follow', { x: STRIKE - 1, hdy: 1 }), { post: 'split', fx: [slash(2)] }),
    // gone again, his outline at the cut; over the post, the heel raised
    // high and arcing down on its crown (the camera jolted down), the landing
    c(1, 'flash2', undefined, { post: 'split', fx: [outline('follow', STRIKE - 1, 0)] }),
    c(1, 'impact', K('tuck', { x: STRIKE + 1, lift: 4, clip: 3, eyes: 'focus', head: 'turn' }), { post: 'split', fx: [outline('follow', STRIKE - 1, 1)] }),
    c(1, 'impact', K('tuck', { x: STRIKE + 1, lift: 6, clip: 3, eyes: 'focus', head: 'turn' }), { post: 'split', fx: [outline('follow', STRIKE - 1, 2), fx('sparks', 0, AT.postTop, { pal: 'hit', d: [0, -1] })] }),
    c(1, 'impact', turn('kick', { x: STRIKE + 1, lift: 3, clip: 3 }), { post: 'split', fx: [fx('sparks', 0, AT.postTop, { pal: 'hit', d: [0, -1] })] }),
    c(1, 'impact', turn('kick', { x: STRIKE + 1, lift: 1, clip: 3 }), { post: 'split', pdy: 2, flash: 'post', shake: [0, 1], fx: [fx('sparks', 1, AT.postTop, { pal: 'hit', d: [0, -1] })] }),
    c(1, 'impact', turn('crouch', { x: STRIKE + 1, eyes: 'smug' }), { post: 'split', pdy: 1, fx: [fx('sparks', 2, AT.postTop, { pal: 'hit' }), dustAt(0, STRIKE + 1)] }),
    c(1, 'impact', turn('crouch', { x: STRIKE + 1, eyes: 'smug', hdy: 1 }), { post: 'split', fx: [dustAt(1, STRIKE + 1)] }),
    // up with the kunai in a reverse grip, the knowing smile
    c(1, 'impact', K('grip', { x: STRIKE + 1, eyes: 'smug', hdy: 1 }), { post: 'split' }),
    c(2, 'impact', K('grip', { x: STRIKE + 1, eyes: 'smug' }), { post: 'split' }),
    // and home in a flash: his outline over the post, the streak back
    c(1, 'flash2', undefined, { post: 'split', fx: [outline('grip', STRIKE + 1, 0), streak(0, HOME - 8, true)] }),
    c(1, 'flash2', K('crouch', { eyes: 'smug' }), { post: 'split', fx: [outline('grip', STRIKE + 1, 1), streak(1, HOME - 8, true)] }),
    c(1, 'recover', K('crouch', { eyes: 'smug', hdy: -1 }), { post: 'split', fx: [outline('grip', STRIKE + 1, 2), streak(2, HOME - 8, true)] }),
    c(1, 'recover', K('idle1', { eyes: 'smug' }), { post: 'split' }),
    c(1, 'recover', K('idle1', { eyes: 'smug', hdx: -1 }), { post: 'split' }),
    ...ending([], 'split'),
  ]
  const FLYING_THUNDER_GOD = celMove(t, { name: 'Flying Thunder God', shout: 'Flying Thunder God', dojutsu: false, on: ['shell'] }, ftg)

  // ---------------------------------------------------------------- Rasengan (4.6 s)

  // The hand raised and the Rasengan spun up over the palm (the arm
  // stretching with it), brought down and shaped between both hands; the
  // spring, the leap with it held out ahead, and the dive: driven down into
  // the ground before the post in one line from the jaw to the ball (it
  // grinds into the earth), and the ground blows out into a crater, rock
  // flung up, the post hopping on the shock (the camera jolted down twice and
  // back up). He is thrown back a pixel by it, flashes home, and the crater
  // crumbles away.
  const DIVE_X = STRIKE - 4
  // where the ball meets the ground, under the drive's palm
  const GROUNDED: readonly [number, number] = [DIVE_X - 10, GROUND - 2]
  const ground = (f: number, d: readonly [number, number] = [0, 2]): FxUse => fx('quake', f, GROUNDED, { d })
  const crumble = (f: number): FxUse => fx('quakeFade', f, GROUNDED, { d: [0, 2] })
  const ras: Cel[] = [
    ...postIn('ready', [K('raise', { eyes: 'focus', hdy: 1 }), K('raise', { eyes: 'focus' }), K('raiseWind', { eyes: 'focus' })], i =>
      i === 0 ? [fx('sparks', 0, 'hand', { pal: 'rasen', d: [0, -2] })] : i === 1 ? [fx('sparks', 1, 'hand', { pal: 'rasen', d: [0, -2] })] : [rasengan({ d: [0, -3] })],
    ),
    // spun up over the raised palm, the arm stretching with it
    c(3, 'charge', K('raiseWind', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [rasengan({ d: [0, -3] })] }),
    c(2, 'charge', K('raise', { eyes: 'focus' }), { post: 'stand', fx: [rasengan({ d: [0, -3] })] }),
    // brought down and shaped between both hands, the shoulders heaving
    c(1, 'charge', K('gather', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [rasengan()] }),
    c(2, 'charge', K('gather', { eyes: 'focus' }), { post: 'stand', fx: [rasengan()] }),
    c(3, 'charge', K('gatherWind', { eyes: 'focus' }), { post: 'stand', fx: [rasengan()] }),
    // the spring: sunk low
    c(3, 'charge', K('windup', { eyes: 'focus' }), { post: 'stand', fx: [rasengan()] }),
    // the leap, the ball held out ahead
    ...leap('leap', { pose: 'dash', eyes: 'focus', head: 'turn' }, { to: DIVE_X + 4, lift: 5, hang: 1, squash: 0, crouch: false, post: 'stand', more: () => [rasengan()] }),
    // the dive: driven down into the ground before the post, grinding
    c(1, 'dive', turn('drive', { x: DIVE_X }), { post: 'stand', fx: [rasengan(), fx('dust', 0, GROUNDED, { d: [0, 2] })] }),
    c(1, 'grind', turn('drive', { x: DIVE_X, hdy: 1 }), { post: 'stand', fx: [rasengan(), fx('dust', 1, GROUNDED, { d: [0, 2] })] }),
    c(2, 'grind', turn('drive', { x: DIVE_X }), { post: 'stand', pdx: -1, fx: [rasengan({ d: [0, 1] }), fx('dust', 2, GROUNDED, { d: [0, 2] })] }),
    c(1, 'grind', turn('drive', { x: DIVE_X, eyes: 'shut' }), { post: 'stand', fx: [rasengan(), fx('dust', 1, GROUNDED, { d: [0, 2] })] }),
    // the ground blows: the post's flash, hit-stop, the camera jolted, the crater, the rubble, the post hopping
    c(2, 'impact', turn('drive', { x: DIVE_X, eyes: 'shut' }), { post: 'lean', pdy: -2, flash: 'post', fx: [ground(1), fx('rasenganHit', 0, GROUNDED)], shake: [0, 1] }),
    c(1, 'impact', turn('drive', { x: DIVE_X, eyes: 'shut', hdy: 1 }), { post: 'stand', pdy: -3, shake: [0, -1], fx: [ground(2), fx('rasenganHit', 1, GROUNDED), fx('rubble', 0, GROUNDED, { d: [0, 2] })] }),
    // thrown back a pixel by it, the rock falling, the dust rolling out
    c(1, 'impact', K('crouch', { x: DIVE_X + 1 }), { post: 'lean', pdy: -1, fx: [ground(3), fx('rasenganHit', 2, GROUNDED), fx('rubble', 1, GROUNDED, { d: [0, 2] }), fx('dustWave', 0, GROUNDED, { d: [0, 2] })] }),
    c(1, 'impact', K('crouch', { x: DIVE_X + 1, eyes: 'focus' }), { post: 'stand', pdx: -1, fx: [ground(3), fx('rasenganHit', 3, GROUNDED), fx('rubble', 2, GROUNDED, { d: [0, 2] }), fx('dustWave', 1, GROUNDED, { d: [0, 2] })] }),
    c(1, 'impact', K('gather', { x: DIVE_X + 1, eyes: 'smug' }), { post: 'stand', fx: [ground(3), fx('rubble', 3, GROUNDED, { d: [0, 2] }), fx('dustWave', 2, GROUNDED, { d: [0, 2] })] }),
    c(1, 'impact', K('gather', { x: DIVE_X + 1, eyes: 'smug' }), { post: 'stand', fx: [ground(3), fx('dustWave', 3, GROUNDED, { d: [0, 2] })] }),
    c(1, 'impact', K('gatherWind', { x: DIVE_X + 1, eyes: 'smug' }), { post: 'stand', fx: [ground(3)] }),
    // home not in a hop but in a flash: sunk to spring, gone (his outline
    // by the crater, the streak), there, the crater crumbling away behind
    // him; the kunai produced in a reverse grip with the knowing smile
    c(1, 'back', K('windup', { x: DIVE_X + 1, dy: 1, eyes: 'smug' }), { post: 'stand', fx: [ground(3)] }),
    c(1, 'back', undefined, { post: 'stand', fx: [ground(3), outline('windup', DIVE_X + 1, 0), streak(0, HOME - 8, true)] }),
    c(1, 'back', K('crouch', { eyes: 'smug' }), { post: 'stand', fx: [crumble(0), outline('windup', DIVE_X + 1, 1), streak(1, HOME - 8, true)] }),
    c(1, 'back', K('crouch', { eyes: 'smug', hdy: -1 }), { post: 'stand', fx: [crumble(1), outline('windup', DIVE_X + 1, 2), streak(2, HOME - 8, true)] }),
    c(1, 'back', K('grip', { eyes: 'smug', hdy: 1 }), { post: 'stand', fx: [crumble(2)] }),
    c(2, 'back', K('grip', { eyes: 'smug' }), { post: 'stand' }),
    c(2, 'recover', K('idle1', { eyes: 'happy' }), { post: 'stand' }),
    ...ending(),
  ]
  const RASENGAN = celMove(t, { name: 'Rasengan', shout: 'Rasengan', dojutsu: false }, ras)

  // ---------------------------------------------------------------- Three-Pronged Kunai (4.6 s)

  // Three marked kunai fanned between the fingers, held up high and thrown
  // all at once in one sweep, stepping into it: they fly apart and thud
  // into the post high, middle and low together. The seal made (the shout as
  // the formula links them all), and the Flying Thunder God's second step:
  // he is at each kunai in turn, a kick at the high one, a palm at the
  // middle, the low one slammed, and home before the post stops reeling, the
  // light of all three flashes still burning from the kunai as every tag
  // flares.
  const AT_Y = [KUNAI_Y - 3, KUNAI_Y + 1, KUNAI_Y + 5] as const
  const plain = (y: number): FxUse => fx('kunai', 0, [AT.postHit[0] + 6, y])
  const stuckAll = (n: number, f: number | 'cycle' = 'cycle'): FxUse[] => AT_Y.slice(0, n).map((y, i) => (i === 1 ? stuck(y, f) : plain(y)))
  const flare = (f: number): FxUse[] => AT_Y.map(y => fx('sparks', f, [AT.postHit[0] + 2, y], { pal: 'hit' }))
  const thuds = (f: number): FxUse[] => AT_Y.map(y => thud(f, y))
  // the fan in his hand: three kunai a few pixels apart, points out
  const fan = (spread = 3): FxUse[] => [fx('kunai', 0, 'hand', { d: [-1, -spread] }), fx('kunai', 0, 'hand', { d: [0, 0] }), fx('kunai', 0, 'hand', { d: [-1, spread] })]
  // in flight, flying apart toward their heights
  const flyingFan = (x: number): FxUse[] => [fx('kunai', 0, [x + 2, AT_Y[0] - 1]), flying(x, AT_Y[1]! + 1), fx('kunai', 0, [x + 2, AT_Y[2] + 1])]
  // the light of his three flashes, one streak from each kunai back toward
  // home, frame f (0 whole, 1 broken, 2 motes)
  const trails = (f: number): FxUse[] => AT_Y.map(y => streak(f, AT.postHit[0] + 3, false, y))
  const volley: Cel[] = [
    // the fan held up high as the post poofs in
    ...postIn('ready', [K('raise', { eyes: 'focus', hdy: 1 }), K('raise', { eyes: 'focus' }), K('raiseWind', { eyes: 'focus' })], i => fan(i === 0 ? 2 : 3)),
    c(2, 'ready', K('raise', { eyes: 'focus', hdx: -1 }), { post: 'stand', fx: fan() }),
    // drawn back, sunk, the fan cocked behind him
    c(3, 'throw', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus' }), { post: 'stand', fx: fan(2) }),
    // the sweep, a long light step into it (two pixels past his mark, as
    // cast()'s light weight steps): the three fly apart
    c(1, 'throw', turn('strike', { x: HOME - 3 }), { post: 'stand', fx: flyingFan(20) }),
    // all three thud home at once: the post rocked, the camera jolted
    c(2, 'hit', turn('follow', { x: HOME - 1 }), { post: 'lean', shake: [-1, 0], fx: [...stuckAll(3, 0), ...thuds(0)] }),
    c(3, 'hit', turn('follow', { x: HOME - 1, eyes: 'left', hdy: 1 }), { post: 'stand', pdx: -1, fx: [...stuckAll(3, 1), ...thuds(1)] }),
    c(3, 'hit', K('gather', { eyes: 'left' }), { post: 'stand', fx: [...stuckAll(3), ...thuds(2)] }),
    // the seal: the shout as the formula links every kunai
    c(1, 'seal', K('sign1', { hdy: 1 }), { post: 'stand', fx: stuckAll(3), shout: true }),
    c(1, 'seal', K('sign3', { hdy: 1 }), { post: 'stand', fx: stuckAll(3) }),
    c(4, 'seal', K('sign2', { hdy: 1 }), { post: 'stand', fx: [...stuckAll(3, 2), ...flare(0)] }),
    c(1, 'seal', K('sign2Wind'), { post: 'stand', fx: [...stuckAll(3, 2), ...flare(1)] }),
    // the second step: gone (his outline at home), at the high kunai with a kick
    c(1, 'flash', undefined, { post: 'stand', fx: [...stuckAll(3, 2), outline('sign2', HOME, 0), streak(0, KICK_X - 2, false, AT_Y[0])] }),
    c(1, 'impact', turn('kick', { x: KICK_X }), { post: 'lean', pdx: -1, flash: 'post', fx: [...stuckAll(3, 2), outline('sign2', HOME, 1), streak(1, KICK_X - 2, false, AT_Y[0]), thud(0, AT_Y[0])], shake: [-1, 0] }),
    c(1, 'impact', turn('kick', { x: KICK_X }), { post: 'lean', pdx: -1, fx: [...stuckAll(3, 2), outline('sign2', HOME, 1), streak(1, KICK_X - 2, false, AT_Y[0]), thud(1, AT_Y[0])] }),
    // at the middle one, the palm driven in
    c(3, 'impact', turn('strike', { x: STRIKE }), { post: 'lean', pdx: -2, fx: [...stuckAll(3, 2), outline('sign2', HOME, 2), streak(2, KICK_X - 2, false, AT_Y[0]), thud(0, AT_Y[1])] }),
    // at the low one, slammed
    c(1, 'impact', turn('slam', { x: STRIKE - 4 }), { post: 'lean', pdx: -1, flash: 'post', fx: [...stuckAll(3, 2), thud(0, AT_Y[2]), dustAt(0, STRIKE - 10)], shake: [0, 1] }),
    c(2, 'impact', turn('slam', { x: STRIKE - 4 }), { post: 'lean', pdx: -1, fx: [...stuckAll(3, 2), thud(1, AT_Y[2]), dustAt(1, STRIKE - 10)] }),
    // and home before the post stops reeling: the light of all three flashes
    // still burning from the kunai, his outline at the last, every tag flaring
    c(1, 'flare', K('crouch', { eyes: 'smug' }), { post: 'stand', pdx: -2, flash: 'post', fx: [...stuckAll(3, 2), outline('slam', STRIKE - 4, 0), ...trails(0), ...flare(0)] }),
    c(3, 'flare', K('crouch', { eyes: 'smug', hdy: -1 }), { post: 'lean', pdx: -1, fx: [...stuckAll(3, 2), outline('slam', STRIKE - 4, 1), ...trails(1), ...flare(1)] }),
    c(1, 'flare', K('idle1', { eyes: 'smug' }), { post: 'stand', pdx: 1, fx: [...stuckAll(3, 2), outline('slam', STRIKE - 4, 2), ...trails(2), ...flare(2)] }),
    c(2, 'flare', K('idle1', { eyes: 'smug', hdx: -1 }), { post: 'stand', fx: [...stuckAll(3)] }),
    // the kunai called home one by one, each in a glint
    c(1, 'recover', K('idle1', { eyes: 'happy' }), { post: 'stand', fx: [...stuckAll(2, 0), thud(2, AT_Y[2])] }),
    c(1, 'recover', K('idle1', { eyes: 'happy' }), { post: 'stand', fx: [...stuckAll(1, 0), thud(2, AT_Y[1])] }),
    ...ending([thud(2, AT_Y[0])]),
  ]
  const THREE_PRONGED = celMove(t, { name: 'Three-Pronged Kunai', shout: 'Three-Prong Kunai', dojutsu: false, on: ['edit'] }, volley)

  // ---------------------------------------------------------------- Yellow Flash (1.7 s)

  // For an edit: his kunai caught in a reverse grip as the post poofs in,
  // and he goes for it low, the blade trailing along his forearm: the
  // crouch, one dashing step, and he is simply there (his outline left
  // mid-stride, the streak) with a kick in the post (its flash, the camera
  // jolted a pixel), and simply home again, his outline on the post breaking
  // up.
  const blade = (): FxUse => fx('kunaiRev', 0, 'hand')
  const quick: Cel[] = [
    ...postIn('ready', [K('grip', { eyes: 'focus', hdy: 1 }), K('grip', { eyes: 'focus' })]),
    // sunk low on the reverse grip, and the first long step of the dash
    c(1, 'ready', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus' }), { post: 'stand', fx: [blade()] }),
    c(1, 'ready', K('windup', { x: HOME + 1, dy: 1, eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [blade()] }),
    c(1, 'dash', turn('dash', { x: HOME - 3 }), { post: 'stand', fx: [blade(), dustAt(0, HOME + 1)] }),
    // gone mid-stride: his outline there, a streak of light
    c(1, 'flash', undefined, { post: 'stand', fx: [outline('dash', HOME - 3, 0), streak(0, KICK_X - 2), dustAt(1, HOME + 1)], shout: true }),
    c(2, 'impact', turn('kick', { x: KICK_X }), { post: 'lean', flash: 'post', shake: [-1, 0], fx: [outline('dash', HOME - 3, 0), streak(1, KICK_X - 2), fx('impact', 1, 'post', { pal: 'hit', d: [0, 3] })] }),
    c(1, 'impact', turn('kick', { x: KICK_X }), { post: 'stand', pdx: -2, fx: [outline('dash', HOME - 3, 1), streak(2, KICK_X - 2), fx('impact', 2, 'post', { pal: 'hit', d: [0, 3] })] }),
    c(1, 'impact', turn('kick', { x: KICK_X, eyes: 'smug' }), { post: 'stand', pdx: -1, fx: [outline('dash', HOME - 3, 2), fx('impact', 3, 'post', { pal: 'hit', d: [0, 3] })] }),
    // and home: his outline on the post breaking up
    c(1, 'home', K('crouch', { eyes: 'smug' }), { post: 'stand', pdx: 1, fx: [outline('kick', KICK_X, 0), streak(0, HOME - 8, true)] }),
    c(1, 'home', K('crouch', { eyes: 'smug', hdy: -1 }), { post: 'stand', fx: [outline('kick', KICK_X, 1), streak(1, HOME - 8, true)] }),
    c(2, 'recover', K('idle1', { eyes: 'smug' }), { post: 'stand', fx: [outline('kick', KICK_X, 2)] }),
    ...ending(),
  ]
  const QUICK = celMove(t, { name: 'Yellow Flash', shout: 'Yellow Flash', on: ['edit'], quick: true, dojutsu: false }, quick)

  // ---------------------------------------------------------------- the cheer (1.5 s)

  // His own: a kunai flipped up off his raised hand, and the Flash for fun:
  // he is gone (his outline where he stood) and there, four columns over,
  // under the falling kunai, catching it in a reverse grip with the knowing
  // smile, then the wink and a tip of the head; and he flashes home.
  const tossed = (x: number, y: number): FxUse => fx('kunai', 0, [x, y])
  const cheer: Cel[] = [
    c(1, 'twirl', K('raise', { eyes: 'happy', hdy: 1 }), { fx: [fx('ftgKunai', 1, 'hand', { d: [-6, -4] })] }),
    c(1, 'twirl', K('raiseWind', { eyes: 'happy' }), { fx: [fx('ftgKunai', 2, 'hand', { d: [-6, -7] })] }),
    // gone, the kunai still turning over in the air
    c(1, 'flash', undefined, { fx: [outline('raise', HOME, 0), tossed(HOME - 15, 9), streak(0, HOME - 8, false, 16)] }),
    c(1, 'flash', undefined, { fx: [outline('raise', HOME, 1), tossed(HOME - 16, 13), streak(1, HOME - 8, false, 16)] }),
    // there, four columns over: caught, the grip
    c(1, 'cheer', K('grip', { x: HOME - 4, eyes: 'happy', hdy: 1 }), { fx: [outline('raise', HOME, 1)] }),
    c(1, 'cheer', K('grip', { x: HOME - 4, eyes: 'happy' }), { fx: [outline('raise', HOME, 2)] }),
    c(1, 'cheer', K('grip', { x: HOME - 4, eyes: 'happy' })),
    c(2, 'cheer', K('grip', { x: HOME - 4, eyes: 'wink', hdx: 1 })),
    // and simply home (his outline left where he caught it, the streak)
    c(1, 'cheer', K('idle1', { eyes: 'happy' }), { fx: [outline('grip', HOME - 4, 0), streak(0, HOME + 2, true, 16)] }),
    c(1, 'cheer', K('idle1', { eyes: 'happy' }), { fx: [outline('grip', HOME - 4, 0), streak(1, HOME + 2, true, 16)] }),
    c(1, 'cheer', K('idle1', { eyes: 'happy', hdx: -1 }), { fx: [outline('grip', HOME - 4, 1), streak(1, HOME + 2, true, 16)] }),
    c(1, 'cheer', K('idle1', { eyes: 'happy', hdy: 1 }), { fx: [outline('grip', HOME - 4, 1), streak(2, HOME + 2, true, 16)] }),
    c(1, 'cheer', K('idle0', { eyes: 'happy' }), { fx: [outline('grip', HOME - 4, 2)] }),
    c(1, 'cheer', K('idle0', { eyes: 'happy' })),
  ]
  const CHEER = celMove(t, { name: 'Cheer', shout: '', dojutsu: false }, cheer)

  return { moves: [FLYING_THUNDER_GOD, RASENGAN, THREE_PRONGED], quick: QUICK, cheer: CHEER }
}
