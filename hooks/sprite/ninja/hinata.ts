// Hinata as a native sprite (Shippuden): the 'jacket' template
// (templates/jacket.ts) as her lavender-and-cream hooded jacket over navy
// trousers; her hand-drawn head (the side locks taper in at the jaw, so her
// shoulders and arms show under them), the pale Byakugan eyes drawn over both
// eyes at once, the veins standing out at her temples when it wakes, and her
// moves (anims/hinata.ts).

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { JACKET } from '../templates/jacket.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite, Overlay } from '../types.ts'
import { CHEER, GENTLE_FIST, HINATA_POSES, PALMS, QUICK, TWIN_LIONS } from '../anims/hinata.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head, a 1 px dark
// outline traced round it (one column wider on the right), and her long
// hair falling past her shoulders: the side locks flaring out a pixel at the
// cheeks and two at the jaw, and on down three rows past it either side (her
// silhouette's break: never a rounded tombstone in black fill).
//   a b c d  hair: mid, shadow, light, its sheen
//   e f      skin, its shadow
//   g h      the blush, the mouth
//   o        outline
const PALETTE = pal(`
  a:#463e92 b:#30287a c:#5e54b4 d:#9a8ee6 e:#f9dfcc
  f:#e6b8a2 g:#f2a0a8 h:#c87878 o:#0e1019
`)

const HEAD: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [8, 12],
    [13, 12],
  ],
  neck: [11, 17],
  rows: [
    '........ooooooo........',
    '......ooaaaaaaaoo......',
    '.....oaaaaaaaaaaao.....',
    '....oaacddddcaaaabo....',
    '...oacdcaaaaaaaaabbo...',
    '..oaacaaaaaaaaaaaabbo..',
    '..oacaaaaaaaaaaaaabbo..',
    '..oaaaaaaabaaaaaaabbo..',
    '..oaaaaaabaaaabaaabbo..',
    '..oacaaabaaaaabaaabbo..',
    '..obcafffffffffffabbo..',
    '..obcaeeeeeeeeeeeabbo..',
    '..obcaeeeeeeeeeeeabbo..',
    '..obaaeeeeeeeeeeeabbo..',
    '.obbaaeggeeeeeggeabbbo.',
    '.obbaaeeeeeheeeefabbbo.',
    'obbbbaoeeeeeeeffoabbbbo',
    'obbbooooofffffooooobbbo',
    'obbo.....ooooo.....obbo',
    'obbo...............obbo',
    '.oo.................oo.',
  ],
}

// The head turned toward the post, for the blows (the strike, punch, dash,
// kick and slam cels ask for it: { head: 'turn' }): the face at the front
// edge in profile, the nose a pixel's bump on it, the chin carried forward,
// the bangs down to the brow; behind it, past a gap at the jaw where the
// neck shows, her long hair swept back off the face and falling down her
// back, past the shoulders, tapering to its ends (never a box of hair with
// the face squeezed into a corner). The eyes are at [4, 12] and [9, 12].
const TURN: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '........oooooooo.......',
    '......ooaaaaaaaaoo.....',
    '....ooaaaaaaaaaaaaoo...',
    '...oacddddcaaaaaaaabo..',
    '..ocdcaaaaaaaaaaaaaabo.',
    '.oacaaaaaaaaaaaaaaabbo.',
    '.ocaaaaaaaaaaaaaaaabbo.',
    '.oaaaaaabaaaaaaaaaabbo.',
    '.oaaaabaaaabaaaaaaabbo.',
    '.oaaabaaaabaaaaaaaabbo.',
    '.oafffffffffaaaaaaabbo.',
    '.oeeeeeeeeeeeaaaaaabbo.',
    'oeeeeeeeeeeeeaabaaabbo.',
    'oeeeeeeeeeeeeaabaaabbo.',
    '.ogeeeeeeggeeaabaaabbo.',
    '.oeeeheeeeeefoabaaabbo.',
    '..oeeeeeeefo.oabaaabbo.',
    '...offffffo..oabaaaabo.',
    '....oooooo...oabaaaabo.',
    '.............oabaaabo..',
    '..............obaabo...',
    '...............oooo....',
  ],
}

// ------------------------------------------------------------------ eyes

// The Byakugan: pale, no pupil. A dark lash line over a two-row eye (so it
// reads wide open, never lidded), the lower row a deeper lavender. Both eyes
// in one grid, stamped at the left eye [7, 12] plus `at`.
// l lash, w white, v d lavender, s f skin, m the mouth, g the blush.
const EYES: HandEyes = {
  palette: pal(`
    l:#3a2a52 w:#f6f2fe v:#c4b8ec d:#9484cc s:#f9dfcc f:#e6b8a2
    m:#a85a62 g:#f2a0a8
  `),
  states: {
    open: { at: [-1, -1], rows: ['.ll...ll.', '.wv...vw.', 'lvd...dvl'] },
    left: { at: [-1, -1], rows: ['.ll...ll.', '.vw...vw.', 'ldv...dvl'] },
    half: { at: [-1, -1], rows: ['.ss...ss.', '.ll...ll.', 'lvd...dvl'] },
    shut: { at: [-1, 0], rows: ['.ss...ss.', 'lll...lll'] },
    focus: { at: [-1, -1], rows: ['.ll...ll.', '.ll...ll.', 'lvd...dvl'] },
    happy: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l'] },
    sad: { at: [-1, -1], rows: ['..l...l..', '.lw...wl.', 'lvd...dvl'] },
    wide: { at: [-1, -2], rows: ['.ll...ll.', '.........', '.ww...ww.', 'lvv...vvl'] },
    // her cheer: shy, the eyes lowered under heavy lashes, the blush
    // deepened, a small flat smile two pixels wide on her mouth's own row
    // (a wobbly one under it read as a goatee over the poked fingertips)
    shy: { at: [-2, 0], rows: ['..ll...ll..', '.lwv...vwl.', '.ggg...ggg.', '.....mm....'] },
  },
}

// ------------------------------------------------------------------ Byakugan

// The veins standing out at her temples; the eyes stay her own.
const BYAKUGAN: Dojutsu = {
  head: {
    ...HEAD,
    palette: { ...PALETTE, ...pal('i:#b98ac8') },
    rows: HEAD.rows.map(
      (r, y) =>
        ({
          11: '..obcaieeeeeeeeeiabbo..',
          12: '..obcaieeeeeeeeeiabbo..',
          13: '..obaaieeeeeeeeeiabbo..',
        })[y] ?? r,
    ),
  },
}
// and the turned head with the veins at its temples ({ head: 'turnByak' })
const TURN_BYAK: HeadGrid = {
  ...TURN,
  palette: BYAKUGAN.head!.palette,
  rows: TURN.rows.map(
    (r, y) =>
      ({
        11: '.oeeeeeeeeeiiaaaaaabbo.',
        12: 'oeeeeeeeeeeiiaabaaabbo.',
        13: 'oeeeeeeeeeeieaabaaabbo.',
      })[y] ?? r,
  ),
}

// ------------------------------------------------------------------ body

// The jacket's letters in her colours: the cream jacket, lavender sleeves,
// yoke and hood, the navy trousers.
const BODY = pal(`
  o:#0e1019
  s:#f9dfcc k:#e6b8a2
  v:#f6f0e6 w:#dcd2d6 x:#a89cb4
  n:#c8b6ee m:#a38fd6 l:#7462ae
  f:#bca8e8 j:#8270bc
  c:#f6f0e6 b:#c4b8c8
  h:#dcd2d6 g:#8270bc
  i:#c4b8c8 e:#988aac
  p:#3e4680 q:#2c3264 r:#1c2046
  t:#26305a u:#46569a
  y:#463e92 z:#30287a
  a:#5e54b4
`)

// In a moving hold's stirring drawings (the template's `<pose>Wind`), her
// long hair lifts off her back and flares out past her far shoulder, a sheen
// (a) along it, under the head and the body.
const STREAM: Overlay = {
  on: 'head',
  at: [17, 13],
  under: true,
  rows: ['..oo', '.oyo', 'oyyo', 'ozay', 'ozyo', 'ozo.', '.o..'],
}
const STIRRING = Object.fromEntries(['charge', 'sign3', 'sign2', 'sign1', 'raise', 'gather', 'thumbs', 'poke', 'think', 'crossed', 'windup', 'spread'].map(p => [`${p}Wind`, [STREAM]]))

export const HINATA: NinjaSprite = {
  id: 'hinata',
  template: JACKET,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  dojutsu: BYAKUGAN,
  heads: { turn: TURN, turnByak: TURN_BYAK },
  // her own poses (anims/hinata.ts): the bow of her cheer
  poses: HINATA_POSES,
  overlays: STIRRING,
  // the fingertips poked together of her cheer, shy
  poseEyes: { poke: 'shy' },
  moves: [TWIN_LIONS, GENTLE_FIST, PALMS],
  quick: QUICK,
  cheer: CHEER,
}

register(HINATA)
