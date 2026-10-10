// Orochimaru as a native sprite: everything that is his own over the shared
// 'robe' template (templates/robe.ts): his colours for its letters (the cream
// kimono and purple rope belt), his hand-drawn head with the snake's smile, his
// gold snake's eyes, the long black hair down his back and the belt's knot
// (baked into his own copy of the robe), and his moves (anims/orochimaru.ts).

import { orochimaruMoves } from '../anims/orochimaru.ts'
import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { ROBE, dress } from '../templates/robe.ts'
import type { Worn } from '../templates/robe.ts'
import type { Pose } from '../../art/chibi.ts'
import type { Grid, HandEyes, HeadGrid, NinjaSprite, PoseGrid, Prop, XY } from '../types.ts'

// ------------------------------------------------------------------ head

// The hand-drawn 21 x 19 head with a 1 px dark outline traced round it: the
// long black hair parted in the middle and falling either side of a broad
// forehead (a face, not a hood: the parting opens at once, the fringe's edge
// shaded on the skin), a sheen down its lit side, its ends ragged at the
// shoulder (the rest of its length hangs behind the body: HAIR below); a pale
// face shaded on its far side, the purple eyeshadow over each eye (the eyes
// themselves, gold slits under dark lids, are EYES'), the snake's smile, its
// corners turned up.
//   a b c  hair: shadow, mid, sheen
//   d e    skin (pale), its shadow
//   f k    the eyeshadow, deep and soft
//   g      the smile
//   o      outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#2a2a40 b:#3e3e5a c:#5e6086 d:#eee4e4 e:#c6b0c2
    f:#8a3cb4 k:#c48ad8 g:#6a4a72 o:#0e0c16
  `),
  eyes: [
    [9, 12],
    [14, 12],
  ],
  neck: [12, 17],
  rows: [
    '.........ooooooo.......',
    '.......oobcbabbbao.....',
    '......obccbbabbbbao....',
    '.....obcbbbbabbbbbao...',
    '....obcbbbbbabbbbbbao..',
    '....obcbbbbaaabbbbbao..',
    '....obcbbaeeeeeabbbao..',
    '...obbcbaeddddddabbaao.',
    '...obcbaedddddddeabbao.',
    '...obcbadddddddddabbao.',
    '...obcbdddddddddddbbao.',
    '...obcbdkffdddffkdbbao.',
    '...obcbdddddddddddbbao.',
    '..obbcbddddddddddebbao.',
    '..obbcbdddgddddgdebbao.',
    '.obbbcbbddddgggdeebbao.',
    'obbbbcbbbodddddeeobbaao',
    'obbbcbbbo.ooddeoo.obbao',
    '..oo.oo.o...ooo...o.oo.',
  ],
}

// The head turned three-quarters toward the post (strikes, throws): the
// face, its eyeshadow and the smile three pixels nearer the post, the near
// curtain of hair down to a sliver at the cheek, the parting with it, the far
// curtain swung back into one mass to the shoulder, so the outline turns.
export const TURN: HeadGrid = {
  ...HEAD,
  eyes: [
    [6, 12],
    [11, 12],
  ],
  rows: [
    '..........ooooooo......',
    '........oobcbabbbao....',
    '.......obccbbabbbbao...',
    '......obcbbbbabbbbbao..',
    '.....obcbbbbbabbbbbbao.',
    '....obcbbbaaabbbbbbbao.',
    '....obcaeeeeeabbbbbbao.',
    '...ocaeddddddabbbbbbao.',
    '...ocedddddddeabbbbbao.',
    '...ocdddddddddabbbbbao.',
    '...ocdddddddddebbbbbao.',
    '...ockffdddffkebbbbbao.',
    '...ocdddddddddebbbbbao.',
    '..occdddddddddebbbbbao.',
    '..occddgddddgdebbbbbao.',
    '.occcbdddgggdeebbbbbao.',
    'obbbcbbodddddeeobbbbbao',
    'obbbcbo.ooddeoo.obbbao.',
    '..oo.oo...ooo...o.ooo..',
  ],
}

// Both eyes in one grid (stamped at the viewer's left eye plus `at`, a pixel
// wider than the head's 2 x 2 each): gold snake's eyes under a dark lid, the
// slit of the pupil in the middle, under the purple eyeshadow of the head:
// lidded, sly, at rest.
//   y gold, w its glint, p the slit, l lid, s e skin and its shade, f g the
//   markings, k his mouth, t the tongue
export const EYES: HandEyes = {
  palette: pal(`l:#2a1838 p:#140c14 y:#f2c23a w:#fff2b0 s:#eee4e4 e:#c6b0c2 f:#8a3cb4 g:#6a4a72 k:#5a3868 t:#d0508a`),
  states: {
    // the sly half-lidded stare: a lid line over each gold eye, its slit in the middle
    open: { at: [-1, 0], rows: ['lll...lll', 'ypy...ypy'] },
    left: { at: [-1, 0], rows: ['lll...lll', 'pyy...pyy'] },
    half: { at: [-1, 0], rows: ['sss...sss', 'lll...lll'] },
    shut: { at: [-1, 0], rows: ['sss...sss', '.ll...ll.'] },
    // narrowed on the post: the lids down at the inner corners
    focus: { at: [-1, -1], rows: ['..l...l..', 'lll...lll', 'pyy...pyy'] },
    happy: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l'] },
    // the eyes dropped, the smile wiped off into a frown
    sad: { at: [-1, 0], rows: ['sss...sss', 'lll...lll', 'ypy...ypy', '..skkks..', '..ksssk..'] },
    // startled: wide gold, the slits narrowed to hairlines
    wide: { at: [-1, 0], rows: ['yyy...yyy', 'ypy...ypy'] },
    // his cheer's face: the gold eyes glinting, the smile split wide, the tongue
    smug: { at: [-1, 0], rows: ['lll...lll', 'wpy...ypw', '.k.....k.', '..kkkkk..', '....t....'] },
  },
}

// ------------------------------------------------------------------ body

// The robe's letters in his colours: a cream kimono, the purple rope belt
// (the robe's twisted sash reads as rope in two strong purples), dark
// grey-violet trousers, dark sandals; y z his hair.
export const BODY = pal(`
  o:#0e0c16
  s:#f1ecf2 k:#c8b8d8
  v:#ece2c8 w:#c8ba98 x:#968866
  n:#ece2c8 m:#c8ba98 l:#968866
  g:#a462d0 h:#6a3494
  p:#5e5a70 q:#46425a r:#302c40
  t:#2c2a3a u:#4a465e b:#46425a
  y:#66688c z:#4a4a68
  e:#8e7ca6
`)

// ------------------------------------------------------------------ what he wears

// The long black hair hanging down his back, at each pose's nape, into the
// clear pixels round the body only: it frames him behind the arms down to the
// waist. Shorter when he crouches or leaps, streaming out behind his head in
// a run or a lunge, and left to the head alone when he slumps or sits (it
// would hang to the floor). y its sheen, z its dark.
const SHORT: Worn = {
  anchor: [12, 1],
  rows: ['..ooooo...........ooooo..', '.ozzzzzo.........ozzzzzo.', 'oyzzzzzo.........ozzzzzzo', 'oyzzzzo...........ozzzzzo', 'ozzzzzo...........ozzzzzo', '.ooooo.............ooooo.'],
}
const STREAM: Worn = {
  anchor: [0, 1],
  rows: ['..ozzzzoo..', '.ozyyzzzzoo', '.ozzzzzzzzo', '..oozzzzoo.', '....oooo...'],
}
// the hair in the wind of a jutsu (a moving hold's flutter frame): the
// locks trailed a pixel away from the arena below the shoulders
const HAIR_WIND: Worn = {
  anchor: [12, 1],
  rows: [
    '..ooooo...........ooooo...',
    '.ozzzzzo.........ozzzzzo..',
    'oyzzzzzo.........ozzzzzzo.',
    'oyzzzzzo.........ozzzzzzo.',
    '.oyzzzzo.........ozzzzzzzo',
    '.oyzzzzo..........ozzzzzzo',
    '.oyzzzo...........ozzzzzzo',
    '.ozzzzo............ozzzzzo',
    '..oooo..............ooooo.',
  ],
}
const STREAM_WIND: Worn = {
  anchor: [0, 1],
  rows: ['..ozzzzooo.', '.ozyyzzzzzo', '.ozzzzzzzoo', '..oozzzoo..', '....ooo....'],
}
// the stream in the strike (and the lunges drawn on it), behind the turned
// head: it flows out from behind the head's far side
const STREAM_STRIKE: Worn = { ...STREAM, anchor: [-9, 1] }
const STREAM_STRIKE_WIND: Worn = { ...STREAM_WIND, anchor: [-9, 1] }
const HAIR = {
  anchor: [12, 1] as const,
  rows: [
    '..ooooo...........ooooo..',
    '.ozzzzzo.........ozzzzzo.',
    'oyzzzzzo.........ozzzzzzo',
    'oyzzzzzo.........ozzzzzzo',
    'oyyzzzzo.........ozzzzzzo',
    'oyzzzzo...........ozzzzzo',
    'oyzzzzo...........ozzzzzo',
    'ozzzzzo...........ozzzzzo',
    '.ooooo.............ooooo.',
  ],
  variants: {
    ...Object.fromEntries(['charge', 'windup', 'slam', 'crouch', 'kick', 'tuck', 'jump', 'gather'].map(p => [p, SHORT])),
    ...Object.fromEntries(['dash', 'smear', 'follow', 'punch'].map(p => [p, STREAM])),
    strike: STREAM_STRIKE,
    strikeBreath: STREAM_STRIKE,
    ...Object.fromEntries(['crossedWind', 'sign2Wind', 'spreadWind', 'raiseWind', 'thinkWind', 'side'].map(p => [p, HAIR_WIND])),
    gatherWind: SHORT,
    strikeWind: STREAM_STRIKE_WIND,
    slump: null,
    sleep: null,
  },
}

// The rope belt tied at the front, its two ends hanging over the robe; at each
// pose's waist, only on the robe and sash (an arm in front hides it).
const KNOT = { at: 'waist' as const, anchor: [3, 0] as const, on: 'vwxgh', rows: ['.gh..', 'gh.h.', 'h...h'] }

// ------------------------------------------------------------------ Kusanagi

// The Sword of Kusanagi, drawn out of his mouth: a snake's head comes up out
// of his throat (k its dark, p its purple, r the tongue), and the blade runs
// out of its jaws, a bright edge (s) between dark ones (d) so it reads over
// his pale face as well as the dark, its point a softer glint (m). Worn on the
// head (it rides every nod), UPPERCASE so it is drawn over the face, and only
// in the poses of his own the Kusanagi is drawn in (each a robe pose under
// its own name). `at` puts the snake's head on his mouth: the head's (10, 15).
const STEEL = pal(`k:#2a1440 p:#8a48b8 r:#e0507a d:#363e60 s:#f2f5ff m:#a8b6e0`)
// the snake's head peeping out, tongue flicking toward the post
const DRAW = ['.KK.', 'RPPK', '.KK.']
// the point coming out of its jaws
const TIP = ['..DDDDKK.', 'MSSSSSPPK', '..DDDDKK.']
// run out halfway, and all the way to the post's face
const LUNGE = ['..DDDDDDDDDDDKK.', 'MSSSSSSSSSSSSPPK', '..DDDDDDDDDDDKK.']
const THRUST = ['..DDDDDDDDDDDDDDDDDDDDKK.', 'MSSSSSSSSSSSSSSSSSSSSSPPK', '..DDDDDDDDDDDDDDDDDDDDKK.']
// swung up over the post, the head thrown back
const RAISE = [
  'MD....................',
  'DSD...................',
  '.DSDD.................',
  '..DSSDD...............',
  '...DDSSDD.............',
  '.....DDSSDD...........',
  '.......DDSSDD.........',
  '.........DDSSDD.......',
  '...........DDSSDD.....',
  '.............DDSSDKK..',
  '...............DDPPPK.',
  '.................KKK..',
]
// and brought down through it
const CUT = [
  '.................KKK.',
  '..........DDDDDDKPPPK',
  '.....DDDDDSSSSSSPPKK.',
  'DDDDDSSSSSDDDDDDKK...',
  'MSSSSDDDDD...........',
  'DDDD.................',
]
// each drawing, the pose it is worn in, and where its snake's head sits in it
const BLADES: readonly [string, Grid, XY][] = [
  ['kusaDraw', DRAW, [1, 1]],
  ['kusaTip', TIP, [7, 1]],
  ['kusaLunge', LUNGE, [14, 1]],
  ['kusaThrust', THRUST, [23, 1]],
  ['kusaRaise', RAISE, [18, 10]],
  ['kusaCut', CUT, [18, 2]],
]
const MOUTH: XY = [12, 15]
const KUSANAGI: readonly Prop[] = BLADES.map(([pose, rows, [x, y]]) => ({ rows, on: 'head', at: [MOUTH[0] - x, MOUTH[1] - y], palette: STEEL, only: [pose] }))

// the poses the Kusanagi is drawn in: the arms flung wide as it comes up,
// coiled back as its point comes out, lunging in behind it, the head and an
// arm thrown back to swing it up, dropped low to bring it down
const own = (base: string, as: Pose, o: Partial<PoseGrid> = {}): PoseGrid => ({ ...ROBE.poses[base]!, as, eyes: 'focus', ...o })
const KUSA_POSES: Readonly<Record<string, PoseGrid>> = {
  kusaDraw: own('spread', 'spread'),
  // coiled to strike as the point comes out: sunk and rocked back on the back foot
  kusaTip: own('windup', 'gather'),
  kusaLunge: own('strike', 'strike'),
  kusaThrust: own('strike', 'strike'),
  // the head thrown back to swing it up, the arm flung up with it
  kusaRaise: own('raise', 'raise', { head: [1, 0] }),
  kusaCut: own('slam', 'slam'),
}

// his copy of the robe: the hair (streaming in the lunge, short in the crouch), the knot, the Kusanagi's poses
// His hands in the seals shaded down (e, a deep violet-grey under the
// lavender), only the fingertips pale: his skin is as white as his face, and
// a white block of hands under his chin read as a bib.
const SEAL_HANDS = ['skek', 'kkee', 'eeee']
const sealHands = (y: number, rows = SEAL_HANDS) => [{ at: [14, y] as XY, rows }]
export const OROCHIMARU_ROBE = dress(ROBE, {
  poses: KUSA_POSES,
  overlays: { sign2: sealHands(9), sign2Wind: sealHands(9), sign2Breath: sealHands(10, SEAL_HANDS.slice(0, 2)) },
  back: { ...HAIR, variants: { ...HAIR.variants, kusaLunge: STREAM_STRIKE, kusaThrust: STREAM_STRIKE, kusaCut: SHORT } },
  marks: [KNOT],
})

export const OROCHIMARU: NinjaSprite = {
  id: 'orochimaru',
  template: OROCHIMARU_ROBE,
  body: BODY,
  head: HEAD,
  heads: { turn: TURN },
  eyes: EYES,
  props: KUSANAGI,
  ...orochimaruMoves(OROCHIMARU_ROBE),
}

register(OROCHIMARU)
