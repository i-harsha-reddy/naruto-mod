// Sasuke as a native sprite (Shippuden): the 'jacket' template
// (templates/jacket.ts) as his open white shirt over a mesh undershirt (the
// template's neck opening and zip, in mesh), the purple rope belt (its hem
// band), navy arm guards (its cuffs) and dark trousers; his hand-drawn head,
// his eyes drawn over both eyes at once, both of them the Sharingan when it
// wakes, and his moves (anims/sasuke.ts).

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { JACKET } from '../templates/jacket.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite, Overlay, Prop } from '../types.ts'
import { CHEER, CHIDORI, FIREBALL, KATANA, KUSANAGI_POSES, QUICK } from '../anims/sasuke.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head, a 1 px dark
// outline traced round it (one column wider on the right).
//   a b c  hair: highlight, mid, shadow
//   d e f  skin, its shadow, the nose and mouth
//   o      outline
const PALETTE = pal(`
  a:#7484cc b:#424a88 c:#2c3264 d:#f6dcc4 e:#d9b39a f:#c08a78 o:#0e1019
`)

const HEAD: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.o....o.......o...o..',
    'oao..oao.....obo.oco.',
    'oaboooaboo.oobboocco.',
    '.oabboabbbobbbbobcco.',
    '.ooaabbaaabbbbbbbcco.',
    'oaabaabbbbbbbbbbbbcco',
    'oaabbbbbbbbbbbbbbbbco',
    '.oabbbbbbbbbbbbbbbco.',
    '.oabbbbbbbbbbbbbbbco.',
    '.oabbbbcbbbbbcbbbcco.',
    '.oabbceeebbbeeecbbco.',
    '.oabcddddddddddebbco.',
    '.oabcddddddddddebbco.',
    '.oabcddddddddddebbco.',
    '..oabddddddddddebco..',
    '...oabddddfdddebco...',
    '....ooodddddeeooo....',
    '.......ooddeoo.......',
    '.........ooo.........',
  ],
}

// The head turned three-quarters toward the post, for the blows (the strike,
// punch, dash, kick and slam cels ask for it: { head: 'turn' }): the face
// three pixels nearer the post, the far bang a sliver at its edge, the near
// bangs and the side of the head widened under the spikes swept back, the
// nose and chin carried forward. The eyes are at [4, 12] and [9, 12].
const TURN: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '..o....o.......o...o...',
    '.oao..oao.....obo.oco..',
    '.oaboooaboo.oobboocco..',
    '..oabboabbbobbbbobbccoo',
    '..ooaabbaaabbbbbbbbbcco',
    'oaabaabbbbbbbbbbbbbbcco',
    'oaabbbbbbbbbbbbbbbbbbco',
    '.oabbbbbbbbbbbbbbbbbcco',
    '.oabbbbbbbbbbbbbbbbbco.',
    '.oabbcbbbbbcbbbbbbbcco.',
    '.obeeebbbeeecbbbbbbbco.',
    '.obdddddddddecbbbbbbco.',
    '.obdddddddddecbbbbbbco.',
    '.obdddddddddecbbbbbco..',
    '..odddddddddecbbbco....',
    '...oddfddddeobco.......',
    '....oodddddeoo.........',
    '.....ooddeoo...........',
    '.......ooo.............',
  ],
}

// The head turned away (his cheer's "Hn."): the turned head mirrored to
// face off the stage's edge, its light kept on the top left (the hair's
// highlight and shadow swapped back).
const AWAY: HeadGrid = {
  ...TURN,
  eyes: [
    [12, 12],
    [17, 12],
  ],
  neck: [12, 17],
  rows: TURN.rows.map(r => [...r.padEnd(23, '.')].reverse().map(ch => (ch === 'a' ? 'c' : ch === 'c' ? 'a' : ch)).join('')),
}

// His head turned a quarter with him at the top of his backflip (the
// template's 'flip', a side-on tuck roll): his own head's pixels turned so
// the crown points right and the chin left at the shirt, the eyes squeezed
// shut along the turned face (drawn in: the eye state 'none' draws nothing).
const ROLL_EYES = HEAD.rows.map((r, y) => [...r].map((ch, x) => (HEAD.eyes.some(([ex, ey]) => y === ey + 1 && (x === ex || x === ex + 1)) ? 'l' : ch)))
const ROLL: HeadGrid = {
  ...HEAD,
  palette: { ...PALETTE, ...pal('l:#22202e') },
  eyes: [
    [5, 7],
    [5, 12],
  ],
  neck: [HEAD.rows.length - 1 - HEAD.neck[1], HEAD.neck[0]],
  rows: Array.from({ length: Math.max(...HEAD.rows.map(r => r.length)) }, (_, y) => Array.from({ length: HEAD.rows.length }, (_, x) => ROLL_EYES[HEAD.rows.length - 1 - x]?.[y] ?? '.').join('')),
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid, stamped at the left eye [7, 12] plus `at`.
// l lid, p pupil, w white, s skin, m the mouth; r k x the Sharingan's red,
// its dark heart, its glint.
const EYES: HandEyes = {
  palette: pal(`
    l:#22202e p:#1a1a28 w:#eef0f6 s:#f6dcc4 e:#d9b39a m:#8a5248
    r:#e0222c k:#3a060a x:#ff6a5a
  `),
  states: {
    open: { at: [0, 0], rows: ['ll...ll', 'wp...pw'] },
    left: { at: [0, 0], rows: ['ll...ll', 'pw...pw'] },
    half: { at: [0, 0], rows: ['ss...ss', 'lp...pl'] },
    shut: { at: [0, 0], rows: ['ss...ss', 'll...ll'] },
    focus: { at: [-1, -1], rows: ['l.......l', '.ll...ll.', '.wp...pw.'] },
    happy: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l'] },
    // worried brows rising to the nose over eyes cast down
    sad: { at: [0, -1], rows: ['.l...l.', 'l.....l', 'wp...pw'] },
    wide: { at: [0, 0], rows: ['wp...pw', 'ww...ww'] },
    // his cheer: smug, the lids lowered, the mouth pulled up at one corner
    smug: { at: [0, 0], rows: ['ss...ss', 'lp...pl', '....m..'] },
    // no eyes to stamp (his backflip's turned head has them drawn in)
    none: { at: [0, 0], rows: ['.'] },
  },
}

// ------------------------------------------------------------------ Sharingan

// Both eyes red with the dark heart toward the nose and a bright glint,
// stamped over whatever eye state shows (a focus brow stays above it); under
// lowered lids when he reads or smirks, and at rest a blink or a smile shuts
// them.
const LIDDED = { at: [-5, 1], rows: ['lr...rl'] } as const
const SHARINGAN: Dojutsu = {
  eyes: { at: [-5, 0], rows: ['xk...kx', 'rr...rr'] },
  states: { half: LIDDED, smug: LIDDED, shut: null, happy: null },
}

// ------------------------------------------------------------------ body

// The jacket's letters in his colours: the white shirt (its opening and zip
// the mesh undershirt), the purple rope belt, the navy arm guards, the dark
// trousers.
const BODY = pal(`
  o:#0e1019
  s:#f6dcc4 k:#d9b39a
  v:#eef1f8 w:#c9cfdd x:#8b94ad
  n:#eef1f8 m:#c9cfdd l:#8b94ad
  f:#eef1f8 j:#aab3c8
  c:#3e4674 b:#272d52
  h:#8a8ea0 g:#4a4e60
  i:#a274dc e:#6c40a0
  p:#3c4270 q:#2a2f52 r:#1b1f3a
  t:#26305a u:#46569a
  y:#424a88 z:#2c3264
  a:#7484cc
`)

// The Kusanagi, in the fist in the Chidori Katana's poses only (their own
// names, anims/sasuke.ts's KUSANAGI_POSES): a straight blade two pixels
// thick, lit along its top edge, pointed, a dark guard at the fist; its tip
// to the post. `at` is its top-left from each pose's held hand, the guard
// against the fist.
const KUSANAGI: Prop = {
  on: 'hand',
  at: [-13, 4],
  only: Object.keys(KUSANAGI_POSES),
  palette: pal(`w:#eef2fa b:#a9b3c8 g:#2a2636`),
  rows: ['.wwwwwwwwwwwg', 'wbbbbbbbbbbbg'],
  // from each pose's held hand (so a stirring drawing's grid, grown by an
  // overlay, keeps it in the fist)
  poses: {
    kStrike: { at: [-13, 4] },
    kPunch: { at: [-14, 0] },
    kFollow: { at: [-13, 0] },
    kCharge: { at: [-14, 1] },
    kWindup: { at: [-15, 1] },
    kDash: { at: [-13, 0] },
    kSmear: { at: [-13, 0] },
  },
}

// In a moving hold's stirring drawings (the template's `<pose>Wind`), the
// spikes at the back of his head flick out behind it, under the head and the
// body.
const SPIKES: Overlay = {
  on: 'head',
  at: [18, 0],
  under: true,
  rows: ['..o.', '.oyo', 'oayo', 'ozo.', '.o..'],
}
const STIRRING = Object.fromEntries(['charge', 'sign3', 'sign2', 'sign1', 'raise', 'gather', 'thumbs', 'poke', 'think', 'crossed', 'windup', 'spread'].map(p => [`${p}Wind`, [SPIKES]]))

export const SASUKE: NinjaSprite = {
  id: 'sasuke',
  template: JACKET,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  dojutsu: SHARINGAN,
  heads: { turn: TURN, away: AWAY, roll: ROLL },
  overlays: STIRRING,
  // the Chidori Katana's poses, each a jacket pose with the sword in the fist
  poses: Object.fromEntries(Object.entries(KUSANAGI_POSES).map(([own, base]) => [own, { base }])),
  props: [KUSANAGI],
  // arms folded, the smirk
  poseEyes: { crossed: 'smug' },
  moves: [CHIDORI, FIREBALL, KATANA],
  quick: QUICK,
  cheer: CHEER,
}

register(SASUKE)
