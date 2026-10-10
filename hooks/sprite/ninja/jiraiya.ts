// Jiraiya as a native sprite: everything that is his own over the shared
// 'haori' template (templates/haori.ts): his head (and its Sage Mode
// pigment, and both turned three-quarters to the post), his hand-drawn
// faces, the red haori over the green kimono, the mane down his back, the
// two old toads on his shoulders in Sage Mode, his kabuki for a cheer, and
// his moves (anims/jiraiya.ts).

import { pal } from '../grid.ts'
import { GROUND_SHADOW_ROWS, HAORI, standingPoses } from '../templates/haori.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite, Prop, PropPlace } from '../types.ts'
import { register } from '../registry.ts'
import { CHEER, GAMABUNTA, GIANT_RASENGAN, JIRAIYA_HOME, JIRAIYA_POSES, NEEDLE_JIZO, QUICK } from '../anims/jiraiya.ts'

// ------------------------------------------------------------------ head

// His hand-drawn 26 x 21 head, traced with a 1 px outline. Not a helmet and
// not a crown: his white hair swept up and back, four spikes each leaning
// away from the post (lit on the top-left edge, shaded down the back of
// each, a dark crease under each notch between them), and at the back a
// spike thrust out behind; the horned forehead protector across his brow, a
// light metal plate in a dark frame with the oil kanji on it, its two horns
// grey points curving up and out of its top corners through the hair; under
// it the face open from temple to temple, the red lines running down from
// the eyes, a nose shadow. On the post's side one short bang frames the
// face to the chin, ending in a point; on the far side the hair falls back
// past the jaw in three locks thrust out behind him, in shadow, with dark
// strands between them, and on down his back (the mane prop). The eyes are
// drawn by EYES.
//   n a b c  hair: deepest, shadow, lit, highlight
//   d e    skin, its shadow
//   f      the protector's frame and kanji (dark)
//   g h    its plate and horns: lit, shaded
//   i      the red lines from the eyes
//   j      the nose's shadow
//   o      outline
const PALETTE = pal(`
  a:#a6acc0 b:#e0e3ec c:#ffffff d:#f2c8a0 e:#d6a07c f:#2a2a36 n:#7c8298
  g:#c8cedc h:#868ea6 i:#d8283a j:#a86050 o:#0e1019
`)

export const HEAD: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [8, 12],
    [13, 12],
  ],
  neck: [11, 17],
  rows: [
    '..........o.....o.........',
    '.........oao...oao...oo...',
    '...o....ocao..ocao..obao..',
    '..oaoo.ocaao.ocbao.obaao..',
    '.ocbogocbbaaocbbogocbaaoo.',
    '.ocbbohobbbbnbbohobbbbbbao',
    'ocbbbohhobbbnbohhobbbbaao.',
    'ocbbbbfffffffffffbbaaaao..',
    'ocbbbbfgggfgfgggfbaaaano..',
    'oabbbbfhhhhhhhhhfbaaaano..',
    '.ocbbdddddddddddddannoo...',
    '.ocbbddddddddddddeabaaao..',
    '.ocbbddddddddddddebaaaano.',
    '.ocbbddddddddddddeaaaaoo..',
    '.ocbbdddidddddiddeannoo...',
    '.ocbaoddiddjddideoaabaao..',
    '.ocao.oddddddeeeooabaaano.',
    '.oao...oodddeeoo.obaaaoo..',
    '..o......ooooo...onnoo....',
    '.................oaano....',
    '..................ooo.....',
  ],
}

// The head turned three-quarters toward the post (a cel's `head: 'turn'`):
// the face, the plate and its horns slid three pixels toward the arena, the
// far eye kept by the far cheek, which ends in a dark cheek line against the
// hair; the near bang a strand to the chin; the spikes swept back with it
// and the back of the head a mass of locks thrust out behind (in shadow,
// strands between them), so the outline turns but the face never goes blank.
export const TURN: HeadGrid = {
  ...HEAD,
  eyes: [
    [5, 12],
    [10, 12],
  ],
  neck: [10, 17],
  rows: [
    '......oo....oo....oo......',
    '.....ocao..ocao..obao.....',
    '....ocaao.ocaao.obaao.oo..',
    '..oocbaaoocbbaoocbaaoobao.',
    '.ogobbbbccbbbogobbbbbbaao.',
    '.oohobbbbbbbohobbbbbbbaao.',
    'ocohhobbbbbohhobbbbbbbaao.',
    'ocbfffffffffffbaaabaaaano.',
    'ocbfgggfgfgggfbaabaaaabno.',
    'ocbfhhhhhhhhhfbabaaaaaao..',
    'obddddddddddddobaaannoo...',
    'obdddddddddddeoaaaabaaao..',
    'obdddddddddeeeoaaabaaaano.',
    'obdddddddddeeeoaabaaaooo..',
    'obdddidddddieeoabannoo....',
    'oboddiddjddieeobaaaabao...',
    'oaoddddddeeeo.oaaaabaano..',
    'oo.oodddeeoo..oaaabaooo...',
    '.o...ooooo....oaanno......',
    '..............oaaaano.....',
    '...............ooooo......',
  ],
}

// Sage Mode: the toad's pigment gathered round the eyes, a band of orange
// over each brow running out to the temples (the yellow toad eyes are
// DOJUTSU.eyes), and a wart on the nose: k painted over the skin at these
// pixels of a head (dx: where its face sits against the first head this was
// drawn for: a pixel right on the head, two left on the turned one).
const pigment = (h: HeadGrid, dx: number): HeadGrid => {
  const at = [
    [5, 11], [6, 11], [7, 11], [8, 11], [11, 11], [12, 11], [13, 11], [14, 11],
    [5, 12], [14, 12],
    [10, 13],
  ].map(([x, y]) => [x! + dx, y!] as const)
  return {
    ...h,
    palette: { ...h.palette, k: 0xe0602c },
    rows: h.rows.map((r, y) => [...r].map((ch, x) => (ch === 'd' && at.some(([X, Y]) => X === x && Y === y) ? 'k' : ch)).join('')),
  }
}
const SAGE_HEAD = pigment(HEAD, 1)
const SAGE_TURN = pigment(TURN, -2)

// ------------------------------------------------------------------ eyes

// Hand-drawn faces, each one grid over both eyes (and, for a grin or a gasp,
// the mouth), stamped with its top-left at the left eye plus `at`; '.' keeps
// the head's own pixel (so the red lines stay).
//   l lid and lash, p pupil, w white, i iris, s e skin and its shadow,
//   m mouth, t tongue, y the toad's yellow eye (Sage Mode)
export const EYES: HandEyes = {
  palette: pal(`
    l:#3a2420 p:#2a1c18 w:#f4f1ee i:#7a5640 s:#f2c8a0 e:#d6a07c
    m:#6a2028 t:#d84a50 y:#f2c63a
  `),
  states: {
    // a bright, cheeky look: the pupil toward the nose, a glint at the outer top
    open: { at: [0, 0], rows: ['wp...pw', 'ip...pi'] },
    // looking at the post (left)
    left: { at: [0, 0], rows: ['pw...pw', 'pi...pi'] },
    // half shut (a blink's in-between, drowsy)
    half: { at: [0, 0], rows: ['ll...ll', 'ip...pi'] },
    // shut: a lash line low in the eye
    shut: { at: [0, 0], rows: ['ss...ss', 'll...ll'] },
    // focus: brows pulled down to the nose, the lids narrowed
    focus: { at: [0, -1], rows: ['.l...l.', 'll...ll', 'ip...pi'] },
    // the big grin: eyes squeezed into arches, the mouth open, the tongue
    happy: { at: [-1, 0], rows: ['lll...lll', 'lsl...lsl', '.........', '...mmm...', '....t....'] },
    // the lecher's wink (his cheer): one eye open, one arched, the grin
    wink: { at: [-1, 0], rows: ['.wp...lll', '.ip...lsl', '.........', '...mmm...', '....t....'] },
    // sad: brows up at the nose, the lids drooping to the outer corners
    sad: { at: [0, -1], rows: ['l.....l', '.l...l.', 'ip...pi'] },
    // wide: startled, whites all round a pinprick, the mouth an O
    wide: { at: [0, 0], rows: ['ww...ww', 'wp...pw', '.......', '...m...', '...m...'] },
    // smug: the lids lowered, a sly smirk up at one corner
    smug: { at: [0, 0], rows: ['ll...ll', 'ip...pi', '.....m.', '...mm..'] },
  },
}

// Sage Mode awake: the pigmented head, and the toad's eyes, yellow over a
// dark bar (a both-eye grid, at the right eye less the 5 columns to the
// left one). A blink or the grin shuts them at rest; in a move they stay open.
const SAGE: Dojutsu = {
  head: SAGE_HEAD,
  eyes: { at: [-5, 0], rows: ['yy...yy', 'pp...pp'] },
  states: {
    focus: { at: [-5, -1], rows: ['.l...l.', 'yy...yy', 'pp...pp'] },
    half: { at: [-5, 0], rows: ['ll...ll', 'yp...py'] },
    smug: { at: [-5, 0], rows: ['ll...ll', 'yp...py'] },
    shut: null,
    happy: null,
    wink: null,
  },
}

// ------------------------------------------------------------------ body

// The haori's letters (templates/haori.ts) in his colours, in few, calm
// blocks: the red haori a deep, quiet red (its mark c drawn in the haori's
// own red: at this size the yellow circles were confetti), the kimono and
// the trousers one muted olive (a saturated green beside the red was busy),
// the belt a dark brown that sits with the coat, the geta a quiet wood.
const BODY = pal(`
  o:#0e1019
  s:#f2c8a0 k:#d6a07c
  v:#c8483c w:#a03030 x:#6a1e26 c:#a03030
  n:#7e8a6a m:#5f714a l:#3f4c32
  b:#3e2820 j:#2a1c1a
  p:#5f714a q:#3f4c32 r:#2f3a26
  t:#5e3c24 u:#9a6c40
  y:#e0e3ec z:#a6acc0
`)

// ------------------------------------------------------------------ props

// His mane: the long white hair falling down his back to his waist, behind
// everything, and only on the far side (on the post's side his bang stops at
// the chin, so his arm and his outline stay clear): from behind the locks at
// the back of his head it falls on past his far shoulder beside the coat, a
// shade darker than the crown (it is behind him), lit strands down its outer
// edge and deep strands in it, breaking at his waist into two points. It
// hangs from the head, so it bobs with it.
const MANE_PALETTE = pal(`o:#0e1019 c:#ffffff b:#e0e3ec a:#a6acc0 n:#7c8298`)
const MANE: Prop = {
  on: 'head',
  at: [18, 12],
  behind: true,
  palette: MANE_PALETTE,
  rows: [
    '.....oo.',
    '....obao',
    '...obbao',
    '..obbano',
    '..obanao',
    '.obbanao',
    '.obanaao',
    '.obanao.',
    'obanaao.',
    'obanaao.',
    'oanaoao.',
    '.oao.o..',
  ],
}
// streaming back in a dash or a lunge: three locks blown out behind the
// back of his head at the shoulder
const MANE_BLOWN: PropPlace = {
  on: 'head',
  at: [17, 9],
  rows: [
    '......ooo.',
    '....oobbbo',
    '..oobbaano',
    '.obbaanao.',
    'obaanaaoo.',
    '.oaanao...',
    '..oaao....',
    '...oo.....',
  ],
}
const blown = Object.fromEntries(['dash', 'smear', 'strike', 'follow', 'punch', 'slump'].map(p => [p, MANE_BLOWN]))

// Needle Jizō: his mane swollen round him into a dome of white hair on the
// ground, drawn over his body and under his head (his face peeks out of the
// top, his hands in the seal over it), only in the move's own poses
// (anims/jiraiya.ts). A solid dome, not a halo: lit in a cap on its upper
// left, shaded on its right and underneath, strands combed down it from the
// crown in the deepest tone, hair tips round its edge. It swells (a mound
// round his legs), grows whole, bristles (needles three pixels long all
// round its edge), the arena side fires them (that side gone flat), and it
// falls open into a low mound.
const JIZO_GROW: PropPlace = {
  on: 'feet',
  at: [-13, -13],
  rows: [
    '.........o...o............',
    '........ocooocoooo........',
    '....o..ooccccccccbo.......',
    '...ocoocccccccccbbboo.o...',
    '....occccccaaannbbbbbobo..',
    '...occccccnncnbnnbbbbbo...',
    '..occcccnnnnbnbnnnnbbbbo..',
    '.ooccccnnnnbbnbbnnnnbbbo..',
    'occcccnannbbbnbbbnnnnbbbo.',
    '.occcnabnbbbbnbbbbnbnnbbao',
    'occanbbnbbbbbnbbbbbnbbnnao',
    'ocanbbnnbbbbbnbbbbbnnaanno',
    'ocabbbnbbbbbbnbbbbbbnaaano',
    '.oooooooooooooooooooooooo.',
  ],
}
const JIZO_BALL: PropPlace = {
  on: 'feet',
  at: [-17, -23],
  rows: [
    '................o...............',
    '............o.oocoooo...........',
    '...........ococccccccoo.........',
    '..........occccccccccbboo.......',
    '........ooccccccccccbbbbbo......',
    '.......occcccccccccbbbbbbo......',
    '.......occccccnnncnnnbbbbbo.....',
    '......occccccancnbnbnnbbbbboo...',
    '....ooccccccaancnbnbnnnbbbbbbo..',
    '...ococcccccnncbnbnbbnnbbbbbo...',
    '....occccccncnbnbbbnbnbnbbbbbo..',
    '...occccccaanbbnbbbnbbnnnbbbbbo.',
    '..ooccccccnanbbnbbbnbbnnnbbbbbbo',
    '.ococccccncnbbbnbbbnbbbnbnbbbbo.',
    '..occcccncanbbbnbbbnbbbnnbnbbbbo',
    '..occccaacnbbbnbbbbbnbbbnbnnbbbo',
    '..occccncnnbbbnbbbbbnbbbnnbnbbao',
    '.oocccncbnbbbbnbbbbbnbbbbnbbnaaa',
    'occccaabnnbbbbnbbbbbnbbbbnnbnnaa',
    '.occcnbbnbbbbbnbbbbbnbbbbbnbanaa',
    '.occnbbnnbbbbnnbbbbbnnbbbbnnaana',
    '.ocanbbnbbbbbnbbbbbbbnbbbbanaann',
    '.ocbbbbbbbbbbbbbbbbbbbbbbaaaaaaa',
    '..oooooooooooooooooooooooooooooo',
  ],
}
// rolling at the post: the same ball, its strands a turn on (two pixels
// toward the post), so ball and roll alternate as it tumbles
const JIZO_ROLL: PropPlace = {
  on: 'feet',
  at: [-17, -23],
  rows: [
    '................o...............',
    '............o.oocoooo...........',
    '...........ococccccccoo.........',
    '..........occccccccccbboo.......',
    '........ooccccccccccbbbbbo......',
    '.......occcccccccccbbbbbbo......',
    '.......occccnnnbnnnbbbbbbbo.....',
    '......occcccnancnbnnbbbbbbboo...',
    '....ooccccccnancnbnnnbbbbbbbbo..',
    '...ococcccnnccnbnbbnnbbbbbbbo...',
    '....occccncncnbbbnbnbnbbbbbbbo..',
    '...occccccnabnbbbnbbnnnbbbbbbbo.',
    '..ooccccncnabnbbbnbbnnnbbbbbbbbo',
    '.ococccncncbbnbbbnbbbnbnbbbbbbo.',
    '..occcnccnabbnbbbnbbbnnbnbbbbbbo',
    '..occccancbbnbbbbbnbbbnbnnbbbbbo',
    '..occncnncbbnbbbbbnbbbnnbnbbbbao',
    '.oocnccnbbbbnbbbbbnbbbbnbbnbaaaa',
    'occccannbbbbnbbbbbnbbbbnnbnnbaaa',
    '.ocncbnbbbbbnbbbbbnbbbbbnbbnaaaa',
    '.oncbnnbbbbnnbbbbbnnbbbbnnbanaaa',
    '.onabnbbbbbnbbbbbbbnbbbbbnaannab',
    '.ocbbbbbbbbbbbbbbbbbbbbbbaaaaaaa',
    '..oooooooooooooooooooooooooooooo',
  ],
}
const JIZO_BRISTLE: PropPlace = {
  on: 'feet',
  at: [-19, -23],
  rows: [
    '...................o..............',
    '..............o...oco...o.........',
    '.............oco..occo.oco........',
    '..........o...ocoooccoocco..o.....',
    '.........oco.oocccccccocbo.obo....',
    '.........occoccccccccccbbo.obo....',
    '..........occcccccccccbbbbobobo...',
    '......oo.occcccccccccbbbbbbbbo....',
    '.....occocccccccnnncnnnbbbbbbo..o.',
    '......occccccccnncnbnbnnbbbbbboobo',
    '.......occccccnaacnbnbnnnbbbbbobbo',
    '....oooccccccaancnnbnnbnnnbbbbbbo.',
    '...occccccccannabnbbbnbnnnnbbbbbo.',
    '...occccccccnaabbnbbbnbbnnnbbbbboo',
    '....oocccccncnbbbnbbbnbbbnbnbbbbob',
    '....occcccncnnbbnnbbbnnbbnnbnbbbbb',
    '.ooooccccncbnbbbnbbbbbnbbbnbbnbbbo',
    'occcocccaabnbbbbnbbbbbnbbbbnbnnbao',
    '.oocccccnbbnbbbbnbbbbbnbbbbnbbnaaa',
    '...occcnbbnbbbbbnbbbbbnbbbbbnbanaa',
    '...occnbbnnbbbbnnbbbbbnnbbbbnnaana',
    '...ocanbbnbbbbbnbbbbbbbnbbbbanaann',
    '...ocbbbbbbbbbbbbbbbbbbbbbbaaaaaaa',
    '....oooooooooooooooooooooooooooooo',
  ],
}
const JIZO_FIRED: PropPlace = {
  on: 'feet',
  at: [-15, -23],
  rows: [
    '..............o...............',
    '.........o...oco..o...........',
    '........oco..occooco..........',
    '........occoooccoocco..o......',
    '.........occcccccccco.obo.....',
    '.........occcccccccbooobo.....',
    '........occcccccccbbbbbbbo....',
    '........occccccccbbbbbboo.....',
    '........occcnnncnnnbbbbbo.oo..',
    '........occnncnbnbnnbbbbbobbo.',
    '........ocaancnbnbnnnbbbbbbbo.',
    '........ocnncbnbnbbnnbbbbbbo..',
    '........onanbnbbbnbnnnbbbbbo.o',
    '........ocnbbnbbbnbbnbnbbbboob',
    '........oanbbnbbbnbbnnnnbbbbbb',
    '........onbbbnbbbnbbbnbnnbbbba',
    '........obbbnnbbbnnbbbnbnbbboo',
    '........obbbnbbbbbnbbbnbbnbao.',
    '........obbbnbbbbbnbbbbnbnnaao',
    '.oooooooobbbnbbbbbnbbbbnbanaaa',
    'occnbbnbbbbbnbbbbbnbbbbbnaanaa',
    'ocanbbnbbbbbnbbbbbnbbbbanaanno',
    'ocbbbbbbbbbbbbbbbbbbbbaaaaaaao',
    '.oooooooooooooooooooooooooooo.',
  ],
}
const JIZO_FALL: PropPlace = {
  on: 'feet',
  at: [-18, -8],
  rows: [
    '............o....o...o...........',
    '...........ocoooocooocooo.o......',
    '.......oooocccccccccccccboboo....',
    '....ooocccccccccccccbbbbbbbbbooo.',
    '...occccccccnnnnnnbnnnnnnbbbbbbbo',
    '..occcccnnnnnnbnnbbbnnbnnnnnnbbbb',
    '.occnnnnnnnbbbnnbbbbbnnbbbnnnnnnn',
    'occncbbnbbbbbbnbbbbbbbnbbbbbbnaaa',
    '.oooooooooooooooooooooooooooooooo',
  ],
}
const JIZO_POSES = ['jizoGrow', 'jizoBall', 'jizoRollA', 'jizoRollB', 'jizoBristle', 'jizoShotA', 'jizoShotB', 'jizoFired', 'jizoQuiver', 'jizoFall'] as const
const JIZO: Prop = {
  ...JIZO_BALL,
  palette: MANE_PALETTE,
  only: JIZO_POSES,
  poses: { jizoGrow: JIZO_GROW, jizoRollB: JIZO_ROLL, jizoBristle: JIZO_BRISTLE, jizoShotA: JIZO_FIRED, jizoShotB: JIZO_FIRED, jizoFired: JIZO_FIRED, jizoQuiver: JIZO_FIRED, jizoFall: JIZO_FALL },
}

// (the needles it fires, and stuck in the post, are effects on the post:
// fx/firewall.ts's jizoNeedles)

// the floor's shadow past the coat's hem (templates/haori.ts), in the poses he stands in
const SHADOW: Prop = { on: 'feet', at: [-12, 0], behind: true, palette: pal(`s:#09090c`), rows: GROUND_SHADOW_ROWS, only: standingPoses(JIRAIYA_POSES) }

export const JIRAIYA: NinjaSprite = {
  id: 'jiraiya',
  template: HAORI,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  dojutsu: SAGE,
  // the Needle Jizō's poses (anims/jiraiya.ts), the hair ball a prop in them
  poses: JIRAIYA_POSES,
  props: [
    { ...MANE, poses: blown },
    JIZO,
    SHADOW,
  ],
  // his cheer (the roster's thumbs-up): with a wink
  poseEyes: { thumbs: 'wink' },
  heads: { turn: TURN, sageTurn: SAGE_TURN },
  // two columns nearer the arena than the others, so the mane down his back
  // fits on the stage beside his hair
  home: JIRAIYA_HOME,
  moves: [GIANT_RASENGAN, GAMABUNTA, NEEDLE_JIZO],
  quick: QUICK,
  cheer: CHEER,
}

register(JIRAIYA)
