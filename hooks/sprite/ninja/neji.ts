// Neji as a native sprite: everything that is his own over the shared 'robe'
// template (templates/robe.ts): his colours for its letters (the white robe,
// dark shorts), his hand-drawn heads (facing us, turned to the post, and the
// back of his head for the Rotation's turn) and eyes, the Byakugan, and his
// moves (anims/neji.ts).

import { nejiMoves } from '../anims/neji.ts'
import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { ROBE } from '../templates/robe.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite, Prop } from '../types.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head with a 1 px dark outline traced round it
// (one column wider on the right), touched up: the jaw tapered to a chin, and
// the locks either side of the face cut off at the jaw with their own
// outline (the rest of the long hair falls behind the robe's sleeves, which
// the template draws over it). Eyes are drawn by EYES.
//   a b c  hair: mid, shadow, lit
//   d e    skin, its shadow
//   f      the headband's cloth
//   g h    its plate: lit, shaded
//   i      the mouth
//   o      outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#704a34 b:#523828 c:#8a5c40 d:#f6d8be e:#dcb498
    f:#283050 g:#dfe5ee h:#9aa4b4 i:#c08a78 o:#140e14
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.......ooooooo.......',
    '.....ooaaabaaaoo.....',
    '....oaacccbcaaaao....',
    '...oaccaaaaacaaabo...',
    '..oacaaaaaaaaaaabbo..',
    '..oaaaaaaaaaaaaabbo..',
    '..offffgggfgghffffo..',
    '..offffhhhhhhhffffo..',
    '.obcaeeeeeeeeeeeabbo.',
    '.obcadbdddddddbeabbo.',
    '.obcaddbbdddbbdeabbo.',
    '.obcaddddddddddeabbo.',
    '.obcaddddddddddeabbo.',
    '.obaaddddddddddeabbo.',
    '.obaadddddddddeeabbo.',
    '.obaaoddddidddeoabbo.',
    '.obaaboddddddeobabbo.',
    '.obbbo.oodddoo.obbbo.',
    '..ooo....ooo....ooo..',
  ],
}

// The head turned three-quarters toward the post (strikes, the glide in): the
// face, the headband's plate and the brows three pixels nearer the post, the
// near lock thinned to a sliver at the edge, the far eye close to the far
// cheek, the far lock and the hair swung back into one mass down to the jaw,
// so the outline turns with it.
export const TURN: HeadGrid = {
  ...HEAD,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  rows: [
    '........ooooooo......',
    '......ooaabaaaaoo....',
    '.....oaaccbccaaaao...',
    '....oaccaaaacaaaabo..',
    '...oacaaaaaaaaaaabbo.',
    '..oaaaaaaaaaaaaaabbo.',
    '..ofgggfgghfffffffbo.',
    '..ofhhhhhhhfffffffbo.',
    '.obeeeeeeeeeeeaabbbo.',
    '.ocbdddddddbeaabbbbo.',
    '.ocdbbdddbbdeaabbbbo.',
    '.ocdddddddddeaabbbbo.',
    '.ocdddddddddeaabbbbo.',
    '.ocdddddddddeaabbbbo.',
    '.ocddddddddeeaabbbbo.',
    '.ooddddidddeoaabbbbo.',
    '.ocoddddddeobaabbbbo.',
    '.oo.oodddoo.obbbbbbo.',
    '..o...ooo....oooooo..',
  ],
}

// In profile, facing the post (the Rotation's side-on frames): the brow, the
// nose's bump and the chin on the near edge, one eye (the 'side' eyes), the
// headband's plate seen edge-on at the front and its knot at the back, the
// far half all hair down to the long tail at the nape.
export const SIDE: HeadGrid = {
  ...HEAD,
  eyes: [
    [3, 12],
    [8, 12],
  ],
  rows: [
    '.......ooooooo.......',
    '.....ooaaabaaaoo.....',
    '....oaacccbcaaaabo...',
    '...oaccaaaaacaaaabo..',
    '..oacaaaaaaaaaaaabbo.',
    '..oaaaaaaaaaaaaaabbo.',
    '.offgggffffffffffbbo.',
    '.ofhhhfffffffffoffbo.',
    '.oeeeeeeeaaaaaaaabbo.',
    '.odbbdddeaacaaaaabbo.',
    '.oddddddeaaacaaaabbo.',
    'oddddddeaaaaaaaaabbo.',
    'oddddddeaaacaaaaabbo.',
    '.odddddeaaaaaaaaabbo.',
    '.oddddeeaaacaaaaabbo.',
    '.oidddeoaaaaaaaaabbo.',
    '..oddeoaaaaaaaaabbbo.',
    '...ooo.oaaaaaaabbbo..',
    '........ooooooooo....',
  ],
}

// The back of his head, for the Rotation's turn: all hair, the headband's
// cloth knotted at the back, its tails hanging; no face (the cel asks for
// the 'away' eyes, which draw nothing).
export const BACK: HeadGrid = {
  ...HEAD,
  // (the hair, the headband's cloth, the outline: no skin, plate or mouth)
  palette: Object.fromEntries(Object.entries(HEAD.palette).filter(([k]) => 'abcfo'.includes(k))),
  rows: [
    '.......ooooooo.......',
    '.....ooaaaaaaaoo.....',
    '....oaacccaaaaaao....',
    '...oaccaaaaaaaaabo...',
    '..oacaaaaaaaaaaabbo..',
    '..oaaaaaaaaaaaaabbo..',
    '..offfffffffffffffo..',
    '..offfffoffoffffffo..',
    '.obcaaaaoffoaaaaabbo.',
    '.obcaaaaafofaaaaabbo.',
    '.obcaaacaaaacaaaabbo.',
    '.obcaaacaaaacaaaabbo.',
    '.obcaaaaaaaaaaaaabbo.',
    '.obaaacaaaaaacaaabbo.',
    '.obaaacaaaaaacaaabbo.',
    '.obaaaaaaaaaaaaaabbo.',
    '.obbaaaaaaaaaaaaabbo.',
    '.obbbaaaaaaaaaaabbbo.',
    '..ooooooooooooooooo..',
  ],
}

// In the Rotation's flat-out spin: the long hair flung out wide at its ends
// (a pixel past the head each side, two at the tips), so the head flares
// like the robe's hem below it: a spinning top, never a head turning. Facing
// us (WHIRL) and from behind (WHIRL_BACK).
export const WHIRL: HeadGrid = {
  ...HEAD,
  eyes: [
    [8, 12],
    [13, 12],
  ],
  neck: [11, 17],
  rows: [
    '........ooooooo........',
    '......ooaaabaaaoo......',
    '.....oaacccbcaaaao.....',
    '....oaccaaaaacaaabo....',
    '...oacaaaaaaaaaaabbo...',
    '...oaaaaaaaaaaaaabbo...',
    '...offffgggfgghffffo...',
    '...offffhhhhhhhffffo...',
    '..obcaeeeeeeeeeeeabbo..',
    '..obcadbdddddddbeabbo..',
    '..obcaddbbdddbbdeabbo..',
    '.obbcaddddddddddeabbbo.',
    '.obcaaddddddddddeaabbo.',
    '.obcaaddddddddddeaabbo.',
    'obcaaadddddddddeeaaabbo',
    'obaaaaoddddidddeoaaabbo',
    'obbaabooddddddeoobaabbo',
    '.oooooo.oodddoo.oooooo.',
    '.......................',
  ],
}
export const WHIRL_BACK: HeadGrid = {
  ...BACK,
  neck: [11, 17],
  rows: [
    '........ooooooo........',
    '......ooaaaaaaaoo......',
    '.....oaacccaaaaaao.....',
    '....oaccaaaaaaaaabo....',
    '...oacaaaaaaaaaaabbo...',
    '...oaaaaaaaaaaaaabbo...',
    '...offfffffffffffffo...',
    '...offfffoffoffffffo...',
    '..obcaaaaoffoaaaaabbo..',
    '..obcaaaaafofaaaaabbo..',
    '..obcaaacaaaacaaaabbo..',
    '.obbcaaacaaaacaaaabbbo.',
    '.obcaaaaaaaaaaaaaaabbo.',
    '.obcaaacaaaaaacaaaabbo.',
    'obcaaaacaaaaaacaaaaabbo',
    'obaaaaaaaaaaaaaaaaaabbo',
    'obbaaaaaaaaaaaaaaaaabbo',
    '.ooooooooooooooooooooo.',
    '.......................',
  ],
}

// ------------------------------------------------------------------ the tail

// His long hair tied low behind: the tail hanging down his back past the
// right lock and swinging a pixel clear of it, a pale tie a little above its
// end, its tip at the hip, drawn behind his head and body (so only the hair past them shows: a
// strip down his far side, the silhouette broken where it hangs free of the
// robe). Riding the head (it nods with it); left off where his back is to us
// (the body draws the tail down his back there) and in the spin.
export const TAIL: Prop = {
  on: 'head',
  at: [16, 13],
  behind: true,
  palette: pal(`o:#140e14 a:#704a34 b:#523828 t:#e8e4dc u:#b8b2a8`),
  rows: [
    '...oo..',
    '..obbo.',
    '..oabo.',
    '..oabo.',
    '..oabbo',
    '...oabo',
    '...oabo',
    '..ottuo',
    '...oabo',
    '...obbo',
    '....oo.',
  ],
  skip: ['back', 'side', 'whirl', 'whirlB', 'sleep', 'slump'],
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid (stamped at the viewer's left eye plus `at`). The
// Hyuga eyes are pale and pupil-less, so they are drawn three pixels tall to
// stay awake: a dark lash line over the white, the lower row a deeper
// lavender, a lash at each outer corner.
//   l lash, w the white, v u lavender and deeper, s e skin and its shade,
//   b brow, m mouth, r the Byakugan's veins
export const EYES: HandEyes = {
  palette: pal(`l:#3a2630 p:#2a2030 w:#f4f2fa v:#c8bce0 u:#9a8cc0 s:#f6d8be e:#dcb498 m:#8a4e48 b:#523828 r:#c48a9e`),
  states: {
    open: { at: [-1, -1], rows: ['.ll...ll.', '.ww...ww.', 'lvv...vvl'] },
    // no pupil to turn: the deeper lavender slides toward the post instead
    left: { at: [-1, -1], rows: ['.ll...ll.', '.ww...ww.', 'luv...uvl'] },
    half: { at: [-1, -1], rows: ['.ss...ss.', '.ll...ll.', 'lvv...vvl'] },
    shut: { at: [-1, -1], rows: ['.ss...ss.', '.ss...ss.', '.ll...ll.'] },
    // his brows' inner ends pulled down a pixel into the lash line, a hard V
    // (the head draws the brows; this moves their inner pixels)
    focus: { at: [-1, -2], rows: ['..s...s..', '.lb...bl.', '.ww...ww.', 'lvv...vvl'] },
    happy: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l'] },
    // the brows tipped up at the inner ends (their outer ends dropped), the lids half down
    sad: { at: [-2, -3], rows: ['.s.b...b.s.', '.b.s...s.b.', '..ss...ss..', '..ll...ll..', '.lvv...vvl.'] },
    // startled: the lids flung open off the whites
    wide: { at: [-1, -1], rows: ['.ww...ww.', '.ww...ww.', 'lvv...vvl'] },
    // his cheer's face: one eye lidded, the smirk of a genius
    smug: { at: [-1, -1], rows: ['.ll......', '.ww...ll.', 'lvv...vvl', '......m..', '....mm...'] },
    // turned away (the back of his head): no face at all
    away: { at: [0, 0], rows: ['.'] },
    // in profile (the SIDE head): the near eye alone, hard on the post
    side: { at: [-1, -2], rows: ['..s', '.lb', '.ww', 'lvv'] },
  },
}

// The Byakugan woken: the veins standing out at both temples, over whatever
// the eyes are doing (stamped from the viewer's right eye; [-7, -2] reaches
// the left temple).
export const BYAKUGAN: Dojutsu = {
  eyes: { at: [-7, -2], rows: ['r.........r', '.r.......r.'] },
  // (turned away, no veins: there is no face to show them on)
  states: { away: { at: [0, 0], rows: ['.'] }, side: { at: [-3, -2], rows: ['r.', '.r'] } },
}

// ------------------------------------------------------------------ body

// The robe's letters in his colours: a white robe with cool grey shading, a
// dark sash, dark shorts in the robe's open front and on the shins, a white
// bandage on the near shin, blue sandals.
export const BODY = pal(`
  o:#140e14
  s:#f6d8be k:#dcb498
  v:#f4f2ee w:#d6d2cc x:#a8a29e
  n:#f4f2ee m:#d6d2cc l:#a8a29e
  g:#5a4a5a h:#3c3040
  p:#4a4a62 q:#383850 r:#26263a
  t:#2c3458 u:#4a5a90 b:#e8e4dc
  y:#8a5c40 z:#523828
`)

export const NEJI: NinjaSprite = {
  id: 'neji',
  template: ROBE,
  body: BODY,
  head: HEAD,
  heads: { turn: TURN, back: BACK, side: SIDE, whirl: WHIRL, whirlBack: WHIRL_BACK },
  eyes: EYES,
  dojutsu: BYAKUGAN,
  props: [TAIL],
  ...nejiMoves(ROBE),
}

register(NEJI)
