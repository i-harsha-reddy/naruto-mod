// Might Guy as a native sprite, on the shared 'vest' template
// (templates/vest.ts): the vest over his green jumpsuit, orange leg warmers on
// both shins (a rule over every pose), the bowl cut and the square jaw, the
// grin (teeth) only when he is happy, his cheer the Nice Guy thumbs-up with a
// glint off the teeth, and his moves (anims/guy.ts).

import { pal } from '../grid.ts'
import { wear } from '../dress.ts'
import { register } from '../registry.ts'
import { VEST } from '../templates/vest.ts'
import type { Grid, HandEyes, HeadGrid, NinjaSprite, Overlay, PoseGrid, Template } from '../types.ts'
import { guyMoves } from '../anims/guy.ts'

// ------------------------------------------------------------------ head

// The bowl cut (a gloss across its crown), the thick brows (they do the
// acting), the square jaw. Older and heavier than Lee's (ninja/lee.ts): the
// head two pixels wider, the brows bushier (a third row of tufts), the ears
// showing under the bowl's edge, the jaw broad and squared.
//   a b c  hair: mid, shadow (and the brows), gloss
//   d e    skin, its shadow
//   f      the mouth
//   o      outline
const HEAD: HeadGrid = {
  palette: pal(`
    a:#40486e b:#2a2e48 c:#5a68a4 d:#ecb88e e:#c48a64 f:#6a2420 o:#0e1019
  `),
  eyes: [
    [8, 12],
    [13, 12],
  ],
  neck: [11, 17],
  rows: [
    '......ooooooooooo......',
    '....ooaaaaaaaaaaaoo....',
    '...oaaaaaaaaaaaaaaao...',
    '..oaaccccaaaaaaaaaabo..',
    '.oaacaaaaaaaaaaaaaabbo.',
    '.oaaaaaaaaaaaaaaaaabbo.',
    '.oaaaaaaaaaaaaaaaaabbo.',
    '.oaaaddddddddddddeabbo.',
    '.oaabbbbbdddddbbbbbbbo.',
    '.oaabbbbbbbdbbbbbbbbbo.',
    '.ooabbdbbbbdbbbbdbbaoo.',
    'odoaddddddddddddddeaodo',
    'ododddddddddddddddeoeo.',
    '.ooddddddddddddddddeoo.',
    '..oddddddddddddddddeo..',
    '..oddddddddfdddddddeo..',
    '..oeddddddddddddddeeo..',
    '...oeeeeeeeeeeeeeeeo...',
    '....ooooooooooooooo....',
  ],
}

// The head turned three-quarters toward the post, for the blows (a cel's
// head: 'turn'): a head in profile, not a box of hair: the bowl a dome
// rounded on top, its back bulging and curving in to the nape; the face at
// the front edge, the brow ridge and the tip of the nose standing out of the
// outline; the ear under the bowl's edge (the cheek running into it, a
// shadow in its bowl, outlined only at its back against the hair); the heavy
// jaw from the ear to the chin (the eyes' 'T' states draw the far eye
// narrower).
const HEAD_TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '........oooooooo.......',
    '......ooaaaaaaaaooo....',
    '....ooaaaaaaaaaaaaaoo..',
    '...occcaaaaaaaaaaaaaao.',
    '..occaaaaaaaaaaaaaaaabo',
    '.ocaaaaaaaaaaaaaaaaabbo',
    '.oaaaaaaaaaaaaaaaaaabbo',
    '.oaaaaaaaaaaaaaaaaaabbo',
    '.oddddddddddaaaaaaaabbo',
    'obbbbbdbbbbbeaaaaaabbo.',
    'obbbbbdbbbbdeoooaaabbo.',
    '.oddbddbdddddddeoabbo..',
    '.oddddddddddddeoabbo...',
    'odddddddddddedoobbo....',
    '.oddddddddddeeoooo.....',
    '.odddddfddddeeeo.......',
    '.oeddddddddddeeo.......',
    '..oeeeeeeeeeeeo........',
    '...oooooooooooo........',
  ],
}

// NIGHT GUY: the Eighth Gate open, his skin flushed blood red and his hair
// thrown up off his brow by the chakra (anims/guy.ts's Night Guy): the bowl
// cut's dome torn into five flame-points standing straight up, the fringe
// lifted off a bare forehead, the sideburns kept; the skin's two tones
// (d, e) in red. The same footprint, eyes and neck as the head at rest, so
// the switch is the hair and the colour alone.
const NIGHT_SKIN = pal(`d:#d64a3a e:#982824`)
const HEAD_NIGHT: HeadGrid = {
  palette: { ...HEAD.palette, ...NIGHT_SKIN },
  eyes: HEAD.eyes,
  neck: HEAD.neck,
  rows: [
    '..o...o...ooo...o...o..',
    '.oao.oao.oaaao.oao.oao.',
    '.oacoaaaoaaaaaoaaaobbo.',
    '.oacaaaaaaaaaaaaaaabbo.',
    '.oacaaaaaaaaaaaaaaabbo.',
    '.oaaaddddddddddddeabbo.',
    '.oaaaddddddddddddeabbo.',
    '.oaaaddddddddddddeabbo.',
    '.oaabbbbbdddddbbbbbbbo.',
    '.oaabbbbbbbdbbbbbbbbbo.',
    '.ooabbdbbbbdbbbbdbbaoo.',
    'odoaddddddddddddddeaodo',
    'ododddddddddddddddeoeo.',
    '.ooddddddddddddddddeoo.',
    '..oddddddddddddddddeo..',
    '..oddddddddfdddddddeo..',
    '..oeddddddddddddddeeo..',
    '...oeeeeeeeeeeeeeeeo...',
    '....ooooooooooooooo....',
  ],
}

// and turned to the post for the kick: the same crest as the night head's,
// each point a flame two rows tall, one more over the back, the forehead bare
// (the kick flies low enough that the stage's top never cuts it off)
const HEAD_NIGHT_TURN: HeadGrid = {
  palette: HEAD_NIGHT.palette,
  eyes: HEAD_TURN.eyes,
  neck: HEAD_TURN.neck,
  rows: [
    '.....o...o...o...o.....',
    '....oao.oao.oao.oaoo...',
    '...oacaoaaaoaaaoaaaao..',
    '..occaaaaaaaaaaaaaaabo.',
    '.ocaaaaaaaaaaaaaaaaabbo',
    '.oddddddddddeaaaaaaabbo',
    '.oddddddddddeaaaaaaabbo',
    '.oddddddddddeaaaaaaabbo',
    ...HEAD_TURN.rows.slice(8),
  ],
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid, its column 0 on the left eye ([8, 12]): small dark
// dashes under the brows; the big square grin only when he is happy (one grid
// reaches the mouth), and in the cheer a glint off the teeth.
//   l lid, p pupil, w white, s e skin and its shadow, m mouth, t teeth,
//   g h the glint: white, pale gold
const EYES: HandEyes = {
  palette: pal(`l:#2a2e48 p:#141418 w:#ffffff s:#ecb88e e:#c48a64 m:#6a2420 t:#e8e0cc g:#ffffff h:#fff2a8 r:#982824`),
  states: {
    open: { at: [0, 0], rows: ['pp...pp'] },
    left: { at: [-1, 0], rows: ['pp...pp'] },
    half: { at: [0, 0], rows: ['ee...ee', 'pp...pp'] },
    shut: { at: [0, 1], rows: ['ll...ll'] },
    focus: { at: [0, 0], rows: ['pp...pp', 'pl...pl'] },
    happy: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l', '.........', 'mtttttttm', '.mmmmmmm.'] },
    // the ting: one tooth flashes pure white and a four-point glint pops off the jaw
    sparkle: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l...h', '...........hgh', 'mtttttgtm...h', '.mmmmmmm.'] },
    // the grin with the eyes open, set on the post: youth, burning
    smug: { at: [-1, 0], rows: ['.pp...pp.', '.........', '.........', 'mtttttttm', '.mmmmmmm.'] },
    sad: { at: [0, 0], rows: ['.......', 'pp...pp', '.......', '..mmm..'] },
    // startled: the eyes thrown open round pinpricks, the jaw dropped
    wide: { at: [0, 0], rows: ['ww...ww', 'wp...pw', '.......', '..mmm..', '..mmm..'] },
    // on the head turned to the post (HEAD_TURN): the far eye foreshortened to
    // a pixel, a pixel nearer, the mouth narrower
    focusT: { at: [0, 0], rows: ['pp..p', 'pl..p'] },
    smugT: { at: [-1, 0], rows: ['.pp..p..', '........', '........', 'mttttttm', '.mmmmmm.'] },
    wideT: { at: [0, 0], rows: ['ww..w', 'wp..p', '.....', '..mm.', '..mm.'] },
    // Night Guy's: the lids half down on the flushed face (its skin's shadow)
    halfN: { at: [0, 0], rows: ['rr...rr', 'pp...pp'] },
  },
  moods: { focusT: 'focus', smugT: 'smug', wideT: 'surprised', sparkle: 'happy', halfN: 'calm' },
}

// ------------------------------------------------------------------ body

// The vest's letters in his colours: the green flak vest over the green
// jumpsuit (shirt and trousers one green), the orange warmers (b, with j
// their shadow: see `warmers`), the red swirl in the suit's green.
const BODY = pal(`
  o:#0e1019
  s:#ecb88e k:#c48a64
  f:#d64a3a i:#982824
  v:#a6b86a w:#76893f x:#4b5a29
  n:#3c9a4a m:#287a38 l:#18522a
  p:#3c9a4a q:#287a38 r:#18522a
  t:#2a3048 u:#4a5478
  b:#f59a2c j:#c0601a
  c:#3c9a4a g:#ffffff h:#c8ccd8
  a:#f48a24 e:#a84e12 d:#f6ecd0
  y:#5a68a4 z:#2a2e48
`)

// ------------------------------------------------------------------ the leg warmers

// The vest wraps one shin (b); Guy wears his warmers on both. Every trouser
// pixel standing on a sandal (t, u directly below it) becomes warmer, and each
// run of warmer is shaded left to right, its last pixel in shadow (j).
const warmers = (rows: Grid): Grid => {
  const g = rows.map(r => [...r])
  for (let y = 0; y < g.length; y++)
    for (let x = 0; x < g[y]!.length; x++) if ('pqr'.includes(g[y]![x]!) && 'tu'.includes(rows[y + 1]?.[x] ?? '.')) g[y]![x] = 'b'
  for (const line of g)
    for (let x = 0; x < line.length; x++) {
      if (line[x] !== 'b') continue
      let e = x
      while (line[e + 1] === 'b') e++
      if (e > x) line[e] = 'j'
      x = e
    }
  return g.map(r => r.join(''))
}

const OVERLAYS: Readonly<Record<string, readonly Overlay[]>> = {
  // no book: the fist propped under his chin, the near elbow down at his side
  think: [
    {
      at: [2, 7],
      rows: ['__onm...', '__onmo..', '__onmONM', '__onmNMO', '__oooo..'],
    },
  ],
}

// ------------------------------------------------------------------ his own poses

// FLYKICK: the flying side kick (Dynamic Entry), a straight-leg kick, sole
// first: the near leg shot out straight and level from the hip, nine pixels,
// the sandal's sole on the post's crown (the hand point) and the warmer
// behind it; the body leant back above the hip, the vest and the near sleeve
// a band rising to the shoulder by the brow, so seven rows of torso show
// between the leg and the head; the head thrown back behind the shoulder and
// dropped (seated 15 right, 4 down), never on top of the body; the other
// knee tucked up under the hip, its warmer and sole behind. The grid's last
// row is the tucked sole's, so a kick's lift is its clearance: up 4 the head
// just clears the stage's top.
const FLYKICK: PoseGrid = {
  as: 'kick',
  head: [15, 4],
  hand: [6, 7],
  eyes: 'focus',
  rows: [
    '................ooo........',
    '...............onnmo.......',
    '...............onvwo.......',
    '..............onvvwo.......',
    '..............ovvwxo.......',
    '.......oo....ovwwxxo.......',
    '......outooooowwwxxo.......',
    '......ottbbbpppxxxxo.......',
    '......ottjjjqqqqqqro.......',
    '......ooooooooqqrooo.......',
    '.............oqqrooo.......',
    '.............oqrbjuo.......',
    '..............oojjto.......',
    '...............ooooo.......',
  ],
}

// CHAMBER: the take-off into the flying kick, a frame in the air: the
// kicking knee snapped up level in front of him, clear of the face (the head
// leant back over the hip), the shin folded back under it, the other leg
// hanging straight, the near fist up at the chest
const CHAMBER: PoseGrid = {
  as: 'kick',
  head: [5, 2],
  eyes: 'focus',
  rows: [
    '..........................',
    '..........oooooooooo......',
    '....ooo..onvvvwwwwxlo.....',
    '...osskoonmvvwwwwxxlo.....',
    '...okkkmmmmvvwwwwxxlo.....',
    '....ooooooxvwwwwxxxlo.....',
    '.ooooooooooxxxxxxxxoo.....',
    'opppppppppqqqqqqqro.......',
    'orrrrrrrrrqqqqqqrro.......',
    '.oqqrooooooooqqqro........',
    '..obbjo....oqqqro.........',
    '...ouuto...obbbjo.........',
    '....oooo..ouuutto.........',
  ],
}

// CANNON: the cannonball he hops home in, seen from the front: both knees
// hugged up to his mouth (drawn over the head, the eyes peeking over them),
// the arms wrapped round the shins and the fists clasped on them, the warmers
// and the soles tucked under: rounder and tighter than the template's
// side-on tuck, and his alone (Lee flips).
const CANNON: PoseGrid = {
  as: 'tuck',
  head: [0, 2],
  eyes: 'focus',
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '.......OOOOO..OOOOO.......',
    '......OQPPQQOOQPPQQO......',
    '......OQQQQROOQQQQRO......',
    '.....ONNMMSKKKKSMMNLO.....',
    '.....OOBBBBJOOBBBBJOO.....',
    '......OBBBJJOOBBBJJO......',
    '......ouuutto.ouuutto.....',
  ],
}

// RISE: up out of a landing's squash, the knees still bent and the feet
// planted wide: the frame before a move's ending (idle1, idle0), all but at
// rest above the knees, so the ending never pops
const RISE: PoseGrid = {
  as: 'idle',
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '......oooooooooooooo......',
    '....oncnvvvwwmmmwwwxlo....',
    '....onmovvwwwmwwwxxolo....',
    '....onmovwwwwwwwwxxolo....',
    '....oskovwwwwwwwwxxoko....',
    '....oskoxxxxxxxxxxxoko....',
    '.....ooopqqqqqqqqrooo.....',
    '.......obbbo..oqqro.......',
    '......ouutto..ouutto......',
  ],
}

// THUMBS STIRRING (the Nice Guy pose held): the thumb jabbed a pixel
// higher, the rest kept (kit.ts's hold() alternates them)
const THUMBS_WIND: PoseGrid = {
  as: 'thumbs',
  hand: [1, 5],
  eyes: 'happy',
  rows: [
    '..........................',
    '..........................',
    '..o.......................',
    '.oSo......................',
    '.oSo..oooooooooooooo......',
    '.oSooncnvvvwwmmmwwwxlo....',
    'oSKNNnmovvwwwmwwwxxolo....',
    'oKKMMmmovwwwwwwwwxxolo....',
    '.ooooooovwwwwwwwwxxoko....',
    '.......oxxxxxxxxxxxoko....',
    '.......opqqqqqqqqrooo.....',
    '........obbbooqqro........',
    '.......ouuttoouutto.......',
  ],
}

// MORNING PEACOCK'S FLURRY (anims/guy.ts): a new fist every time, so the
// punches build instead of rocking between twins. JAB_LOW: a body blow at
// the post's foot, sunk three pixels into a wide stance, the fist driven low
// and level, the far fist tucked at the hip.
const JAB_LOW: PoseGrid = {
  as: 'punch',
  head: [-3, 3],
  hand: [1, 11],
  eyes: 'focus',
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '...........ooooooooooo....',
    '..........onvvvwwmmmxloo..',
    '.oooooooo.onmvwwwwwxxlmlo.',
    'osskonnnnnnmvwwwwwwxxolko.',
    'okkkommmmmmmoxxxxxxxxoooo.',
    '.oooooooooobbbopqqqqqrro..',
    '........ouuuttoo..oouutto.',
  ],
}

// JAB_HIGH: up on his toes, the fist thrown up at the post's crown, the arm
// a diagonal up from the shoulder past his jaw (drawn over it).
const JAB_HIGH: PoseGrid = {
  as: 'punch',
  head: [1, 0],
  hand: [2, 3],
  eyes: 'focus',
  rows: [
    '..........................',
    '.ooo......................',
    'osskoo....................',
    'okkkNMO...................',
    '.oooONMO..................',
    '.....ONMO.................',
    '......ONMOoooooooooo......',
    '.......onmvvvwwmmmwxlo....',
    '.......omvwwwwwwwwxxlo....',
    '.......ovwwwwwwwwwxxoko...',
    '.......oxxxxxxxxxxxxoko...',
    '........oopqqqqqqqrroo....',
    '.......obbbbo..ooqqro.....',
    '......ouuutto...ouutto....',
  ],
}

// FLURRY: the smear, every fist at once, high, mid and low (A) and two
// between (B), the arms blurred into streaks of sleeve, drawn over the jaw.
const FLURRY_A: PoseGrid = {
  as: 'punch',
  head: [0, 1],
  hand: [1, 8],
  eyes: 'focus',
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '.OOO......................',
    'OSSKOLL...................',
    'OKKKO.....................',
    '.OOO....ooooooooooo.......',
    'OOOOOLLLNmvvvwwmmmxlo.....',
    'OSSKMMMMNMvwwwwwwxxlo.....',
    'OKKKOOOOMvwwwwwwwxxoko....',
    '.OOOOLLLLxxxxxxxxxxoko....',
    'osskmlll.opqqqqqqqrroo....',
    'okkko...obbbbo..oqqqro....',
    '.ooo...ouuutto..oouutto...',
  ],
}

const FLURRY_B: PoseGrid = {
  as: 'punch',
  head: [0, 1],
  hand: [1, 10],
  eyes: 'focus',
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '.OOO......................',
    'OSSKOLLL..ooooooooooo.....',
    'OKKKOO...onvvvwwmmmxlo....',
    '.OOOOO..ONmvwwwwwwxxlo....',
    'OOOOOLLLNMvwwwwwwwxxoko...',
    'OSSKMMMMMMoxxxxxxxxxoko...',
    'OKKKOOOOOOoqqqqqqqrroo....',
    '.OOOO...obbbbo..oqqqro....',
    '.......ouuutto..oouutto...',
  ],
}

// LUNGE: the Peacock's finish, the deepest stance he has: the fist driven
// straight out from the shoulder, the front knee bent over the toes, the
// back leg long behind, the head carried low and forward (seated 4 in, 2
// down).
const LUNGE: PoseGrid = {
  as: 'strike',
  head: [-4, 2],
  hand: [0, 9],
  eyes: 'focus',
  rows: [
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '.........ooooooooooo........',
    '........onvvvwwmmmxlo.......',
    'ooooooo.onmvwwwwwxxlo.......',
    'sskonnnnnnmvwwwwwxxloo......',
    'kkkommmmmmmovwwwwxxolko.....',
    'ooooooooooooopxxxxxooooo....',
    '......oobbbbppqqqqqqqqrroo..',
    '.....ouuuttoo......ooqqrrrro',
    '....ooooooo..........oouutto',
  ],
}

// NIGHT GUY'S BODY: the poses the Eighth Gate is played in, his skin flushed
// red as his head's is (HEAD_NIGHT): every skin pixel (s k, S K over the
// head) turned to the flushed red (f i, F I), on the template's own drawings
// (and their Wind), so a redrawn pose is flushed with it. Named <pose>N.
const FLUSH: Readonly<Record<string, string>> = { s: 'f', k: 'i', S: 'F', K: 'I' }
const flush = (p: PoseGrid): PoseGrid => ({ ...p, rows: p.rows.map(r => r.replace(/[skSK]/g, ch => FLUSH[ch]!)) })
const NIGHT_POSES: Readonly<Record<string, PoseGrid>> = Object.fromEntries([
  ...['spread', 'alert', 'charge', 'gather', 'crouch'].flatMap(n => [
    [`${n}N`, flush(VEST.poses[n]!)],
    ...(VEST.poses[`${n}Wind`] ? [[`${n}NWind`, flush(VEST.poses[`${n}Wind`]!)]] : []),
  ]),
  ['chamberN', flush(CHAMBER)],
  ['flykickN', flush(FLYKICK)],
  ['cannonN', flush(CANNON)],
])

// his poses: the Nice Guy pose for a cheer (the thumbs-up and the grin, then
// the ting), the flying kick, and Morning Peacock's flurry and lunge
const POSES = {
  cheer: { base: 'thumbs', eyes: 'happy' },
  cheer2: { base: 'thumbs', eyes: 'sparkle' },
  flykick: FLYKICK,
  chamber: CHAMBER,
  cannon: CANNON,
  rise: RISE,
  thumbsWind: THUMBS_WIND,
  jabLow: JAB_LOW,
  jabHigh: JAB_HIGH,
  flurryA: FLURRY_A,
  flurryB: FLURRY_B,
  lunge: LUNGE,
  ...NIGHT_POSES,
} as const

// the vest as his moves see it, his own poses in it (their beats' poses and faces)
const WORN: Template = wear(VEST, POSES)

export const GUY: NinjaSprite = {
  id: 'guy',
  template: VEST,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  heads: { turn: HEAD_TURN, night: HEAD_NIGHT, nightTurn: HEAD_NIGHT_TURN },
  poses: POSES,
  rules: [warmers],
  overlays: OVERLAYS,
  ...guyMoves(WORN, EYES),
}

register(GUY)
