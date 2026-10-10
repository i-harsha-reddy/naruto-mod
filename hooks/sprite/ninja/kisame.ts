// Kisame as a native sprite: everything that is his own over the shared
// 'cloak' template (templates/cloak.ts): the shark's head, his beady eyes,
// Samehada worn on his back (and in his hands for its own jutsu), his cheer,
// and his moves (anims/kisame.ts).

import { wear } from '../dress.ts'
import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { CLOAK, CLOAK_COLOURS } from '../templates/cloak.ts'
import type { HandEyes, HeadGrid, NinjaSprite, PoseGrid, Prop } from '../types.ts'
import { kisameMoves } from '../anims/kisame.ts'

// ------------------------------------------------------------------ head

// The mod's 20 x 19 head with a 1 px outline traced round it: the blue
// fin-like hair, the grey-blue skin with the gill slits under the eyes, the
// shark grin (white teeth with dark gaps). Touched up: the Mist plate slashed
// through and its lower edge shaded instead of white; the skin lifted pale
// and the gills and hair pushed deep, so the face parts from the blue hair.
// Eyes are drawn by EYES.
//   a b c  hair: lit, mid, shadow
//   d e    skin, its shadow
//   f      the headband's cloth
//   g k j  its plate: lit, the slash, shaded
//   h      teeth; i the gills
//   o      outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#5a8ad6 b:#2c4f96 c:#15255a d:#a9c2d4 e:#6a86a6 f:#262c46
    g:#c8ccd8 h:#ffffff i:#3d5676 j:#868c9c k:#3a4058 o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.......o.....o.......',
    '......oao...obo......',
    '...o..oaboooabo..o...',
    '..oaooabbccabbcoobo..',
    '..oabcabbbbabbbcbco..',
    '..oabbabbbbbabbbbco..',
    '.oaabbbbbbbbbbbbbcco.',
    '..oabbbbbbbbbbbbbco..',
    '..offfgkkggjgjgfffo..',
    '..offfgjgkkkgggfffo..',
    '..offfjjjjjjkkjfffo..',
    '...ooeeeeeeeeeeeoo...',
    '....oddddddddddeo....',
    '....oddddddddddeo....',
    '....oiidddddddiio....',
    '....oichhchchhcio....',
    '.....oddcccccdeo.....',
    '......ooeeeeeoo......',
    '........ooooo........',
  ],
}

// The head turned three-quarters to the post, for his blows (a cel's head:
// 'turn'): the face, the plate and the grin a pixel toward the arena, the
// gills of the far cheek all but gone and the near ones showing, the fin of
// hair swept back a pixel.
export const TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '.........o.....o.......',
    '........oao...obo......',
    '.....o..oaboooabo..o...',
    '....oaooabbccabbcoobo..',
    '....oabcabbbbabbbcbbco.',
    '...oabbabbbbbabbbbbbco.',
    '..oaabbbbbbbbbbbbbbbcco',
    '.oabbbbbbbbbbbbbbbbbco.',
    '.ofgkkggjgjgfffffffo...',
    '.ofgjgkkkgggfffffffo...',
    '.ofjjjjjjkkjfffffffo...',
    '.ooeeeeeeeeeeeeeoo.....',
    '.oddddddddddeeiio......',
    '.oddddddddddeeiio......',
    '.oiddddddddeiiio.......',
    '.oichhchchhceiio.......',
    '..oddcccccdeeeo........',
    '...ooeeeeeooo..........',
    '.....ooooo.............',
  ],
}

// ------------------------------------------------------------------ eyes

// Small round shark's eyes, white under a dark brow, a dark pupil toward the nose: both drawn
// in one grid (the left eye at its column 0, the right five along), so a
// glance turns both the same way.
//   l lid, p pupil, w white, s skin (a lid lifted off it)
export const EYES: HandEyes = {
  palette: pal(`l:#101830 p:#0e1019 w:#ffffff s:#a9c2d4`),
  states: {
    // a hard dark brow over each white (the shark's scowl, and the eyes'
    // edge against the pale skin)
    open: { at: [0, -1], rows: ['ll...ll', 'wp...pw', 'ww...ww'] },
    left: { at: [0, -1], rows: ['ll...ll', 'pw...pw', 'ww...ww'] },
    half: { at: [0, 0], rows: ['ll...ll', 'wp...pw'] },
    shut: { at: [0, 0], rows: ['ss...ss', 'll...ll'] },
    // a brow pixel slanting down over each outer corner, the pupils pinned
    focus: { at: [-1, -1], rows: ['l.......l', '.lp...pl.', '.ww...ww.'] },
    happy: { at: [0, 0], rows: ['.l...l.', 'l.l.l.l'] },
    sad: { at: [-1, -1], rows: ['..l...l..', '.wp...pw.', '.ww...ww.'] },
    // startled: the brows shot up a row, the pupils shrunk to the bottom
    wide: { at: [0, -1], rows: ['ll...ll', 'ww...ww', 'wp...pw'] },
    // the shark's sidelong look: one eye narrowed
    smug: { at: [0, 0], rows: ['wp...ll', 'ww...pw'] },
  },
}

// ------------------------------------------------------------------ body

// blue-grey hands; Samehada: a its bandages, e their shadow, d the guard's
// blue, f the scales showing through the wraps, r the grip's dark binding,
// g the pommel's steel
export const BODY = pal(
  CLOAK_COLOURS +
    `
  s:#a9c2d4 k:#6a86a6
  y:#5a8ad6 z:#2c4f96
  a:#e2dcc8 e:#a09682 d:#3a6aa8 f:#2a4672 r:#1e2234 g:#9fb4d4
`,
)

// Samehada on his back, hilt up: the steel pommel and the dark-bound grip
// standing over his right shoulder, the blue guard, and the great bandaged
// blade widening down behind him, its wraps in diagonal bands and the
// scales' teeth showing through at the edges; placed from the head, so it
// rides with every pose, nods and all (and hides behind the head and body
// where they cover it). Not there while it is in his hands (his own poses
// below, and their wind-ups).
const SAMEHADA_ROWS = [
  '....oo..',
  '...ogo..',
  '...oro..',
  '...ogo..',
  '...oro..',
  '..odddo.',
  '.oaaaeo.',
  'faaaeef.',
  'oaaeeao.',
  'oaeeaao.',
  'feeaaaf.',
  'oeaaaeo.',
  'oaaaeeo.',
  'faaeeaf.',
  'oaeeaao.',
  'oooooooo',
]

// His own drawings, Samehada in his hands (so not on his back). Its letters
// are UPPERCASE here: held in front, it is drawn over his hair.
//   HEFT   hauled off his back and held upright at his side in both fists
//          on the grip, the wide bandaged head of the blade standing past
//          his ear (the swing's wind-up)
//   CHOP   brought down level at the post in a lunge, the wide head where it
//          bites (`hand`), the scales' teeth through the wraps
const HEFT: PoseGrid = {
  as: 'raise',
  eyes: 'focus',
  hand: [3, 13],
  rows: [
    '..OOO.....................',
    '.OAAAO....................',
    'OAAAAEO...................',
    'FAAAEEF...................',
    'OAAEEAO...................',
    'OAEEAAO...................',
    'FEEAAAF...................',
    '.OAAAEO...................',
    '.FAAEEF...................',
    '.OAEEAO...................',
    '.OEEAAO...................',
    'ODDDDDDO..................',
    '.OSKSKO...................',
    '.OKRRKOOO..........OO.....',
    '..OGGOVNO.........ONXO....',
    '..OVWOVNNO.......ONNXOo...',
    '...OVOVWNNO.....ONNXXOxo..',
    '..ovvwOWWNNnnnnnNNXXOxxxo.',
    '..ovwwowwwwwnmnxbbbxoxxxo.',
    '.ovvwwowwbbbwmxbcccboxxxxo',
    '.oowwwowbcccbmxxcccxoosko.',
    '..ooooooooooooooooooookko.',
    '.......ouuttoouutto.......',
  ],
}
const CHOP: PoseGrid = {
  as: 'strike',
  head: [-1, 1],
  eyes: 'focus',
  hand: [1, 11],
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '......OO...........OO.....',
    '.....OVNO.........ONXO....',
    '.F..FOVNNO.......ONNXOo...',
    'OOOOOOO.........ONNXXOxo..',
    'OAAAAEOOOOOO..nnNNXXOxxxo.',
    'FAAAEEAAAEAAODRRSKOmnbbbxo',
    'OAAEEAAAEEAAODRRKKVmbcccbo',
    'FAEEAAOOOOOOOwwwwwmxxcccxo',
    'OOOOOOuuttoooooooooouutto.',
  ],
}

// The grind and the drag (Samehada's own jutsu), two more drawings with the
// blade in his hands, so the chew is real pose changes, never one chop
// repeated:
//   GRIND  leaned in over it, the hilt hauled up to his chest and the blade
//          bitten down into the post's foot, its wide head on the ground
//   DRAG   leaned back, the hilt dropped to his hip and the blade wrenched up
//          and back out of the wood, its wide head raised at the post
const GRIND: PoseGrid = {
  as: 'strike',
  head: [-2, 1],
  eyes: 'focus',
  hand: [1, 11],
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '......OO...........OO.....',
    '.....OVNO.........ONXO....',
    '.....OVNNOOOOOOO.ONNXOo...',
    'OOOOOOOOOEADRRSKONNXXOxo..',
    'FAAEAAOEAAADRRKKNNXXOxxxo.',
    'OAEAAEAAAOOOowwwwwOmnbbbxo',
    'FEAAEAAOO..owwwwwwVmbcccbo',
    'OAAEAAO..owwwwwwwwmxxcccxo',
    'OOOOOOuuttoooooooooouutto.',
  ],
}
const DRAG: PoseGrid = {
  as: 'strike',
  head: [1, 1],
  eyes: 'focus',
  hand: [2, 8],
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    'OOOOO.OO...........OO.....',
    'OAAEAOVNO.........ONXO....',
    'FAEAAAVNNO.......ONNXOo...',
    'OEAAEAAAOO......ONNXXOxo..',
    'FAAEAOAEAAOOOOnnNNXXOxxxo.',
    'OOOOO.OOAAEAADRRSKOmnbbbxo',
    '........OOAAADRRKKVmbcccbo',
    '.........owwwwwwwwmxxcccxo',
    '......uuttoooooooooouutto.',
  ],
}

// and each held, stirring (a moving hold's `<pose>Wind`): hefted, a loose
// end of the wraps lifting off the blade and the hem's corners blown out;
// biting, the scales' teeth working through the wraps a row along (the
// blade chewing) and the hem's tail lifted
const HEFT_WIND: PoseGrid = {
  ...HEFT,
  rows: HEFT.rows.map((r, i) =>
    i === 1 ? '.OAAAO.O..................' : i === 2 ? 'OAAAAEOAO.................' : i === 19 ? 'ovvvwwowwbbbwmxbcccboxxxxo' : i === 20 ? 'owwwwwowbcccbmxxcccxoosko.' : i === 21 ? 'oooooooooooooooooooookko..' : r,
  ),
}
const CHOP_WIND: PoseGrid = {
  ...CHOP,
  rows: CHOP.rows.map((r, i) =>
    i === 7 ? '..F..OVNNO.......ONNXOo...' : i === 9 ? 'FAAAAEOOOOOO..nnNNXXOxxxo.' : i === 10 ? 'OAAAEEAAAEAAODRRSKOmnbbbxo' : i === 11 ? 'FAAEEAAAEEAAODRRKKVmbcccbo' : i === 12 ? 'OAEEAAOOOOOOOwwwwwmxxcccoo' : i === 13 ? 'OOOOOOuuttooooooooouutto..' : r,
  ),
}

// the poses Samehada is in his hands in
export const ARMED = ['heft', 'chop', 'heftWind', 'chopWind', 'grind', 'drag']
const SAMEHADA: Prop = { rows: SAMEHADA_ROWS, on: 'head', at: [16, -1], behind: true, skip: ARMED }

// A spike of the hair's fin bent back while a hold stirs (the template's
// `<pose>Wind` drawings), under the head (only what shows past it is seen)
const FIN = { on: 'head' as const, at: [17, 0] as const, rows: ['.oo', 'ozzo', '.oo.'] }
const OVERLAYS = Object.fromEntries(['crossedWind', 'sign2Wind', 'spreadWind', 'thinkWind', 'strikeWind', 'raiseWind', 'heftWind', 'chopWind', 'chargeWind', 'gatherWind', 'punchWind'].map(p => [p, [FIN]]))

// his own drawings
const OWN = { heft: HEFT, chop: CHOP, heftWind: HEFT_WIND, chopWind: CHOP_WIND, grind: GRIND, drag: DRAG }

export const KISAME: NinjaSprite = {
  id: 'kisame',
  template: CLOAK,
  body: BODY,
  poses: OWN,
  overlays: OVERLAYS,
  props: [SAMEHADA],
  head: HEAD,
  heads: { turn: TURN },
  eyes: EYES,
  ...kisameMoves(wear(CLOAK, OWN)),
}

register(KISAME)
