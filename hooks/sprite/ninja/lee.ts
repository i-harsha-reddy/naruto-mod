// Rock Lee as a native sprite, on the 'jumpsuit' template
// (templates/jumpsuit.ts): green spandex head to ankle, the red belt with its
// plate, orange leg warmers, bandaged hands; the glossy bowl cut, the brows,
// the big round eyes; Guy-sensei's Nice Guy thumbs-up for a cheer, and his
// moves (anims/lee.ts).

import { pal } from '../grid.ts'
import { wear } from '../dress.ts'
import { register } from '../registry.ts'
import { JUMPSUIT } from '../templates/jumpsuit.ts'
import type { HandEyes, HeadGrid, NinjaSprite, PoseGrid, Template } from '../types.ts'
import { leeMoves } from '../anims/lee.ts'

// ------------------------------------------------------------------ head

// The bowl cut with its gloss, the great brows, the lashes beside the eyes;
// the bowl's rim flared a pixel out over the ears (his helmet of hair, the
// break in his outline that no other head has), the round chin under it.
//   a b c  hair: mid, shadow (and the brows and lashes), gloss
//   d      the gloss's highlight
//   e f    skin, its shadow
//   g      the mouth
//   o      outline
const HEAD: HeadGrid = {
  palette: pal(`
    a:#40486e b:#2a2e48 c:#6070b0 d:#dde4ff e:#f6d0a8 f:#d9a27a g:#7a2e28
    o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '......ooooooooo......',
    '....ooaaaaaaaaaoo....',
    '...oaaaaaaaaaaaaao...',
    '..oaacccaaaaaaaaabo..',
    '.oacddcaaaaaaaaaabbo.',
    '.ocdcaaaaaaaaaaaabbo.',
    '.ocaaaaaaaaaaaaaabbo.',
    '.oaaaaaaaaaaaaaaabbo.',
    '.oaaafffffffffffabbo.',
    '.oaaaebbbbebbbbeabbo.',
    '.oaaaeebbbebbbeeabbo.',
    'oaaaaeeeeeeeeeefabbbo',
    'oaaabebeeeeeeebfbbbbo',
    '.ooobeeeeeeeeeefbooo.',
    '...obeeeeeeeeeefbo...',
    '....oeeeeegeeeefo....',
    '.....oeeeeeeeffo.....',
    '......ooeeeffoo......',
    '........ooooo........',
  ],
}

// The head turned three-quarters toward the post, for the blows (a cel's
// head: 'turn'): the bowl a rounded helmet over the back of the head, never
// a flat block of hair: a gloss arc along its crown, its back and the rim's
// underside falling into shadow, the rim flared out at the back over the ear
// and the nape under it; the face at the front edge, the brows, lashes and
// the tip of the nose (the eyes' 'T' states draw the far eye narrower).
const HEAD_TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '........ooooooooo.......',
    '......ooaaacccaaaoo.....',
    '.....oaaccaaaaccaaaoo...',
    '....occcaaaaaaaaacaaao..',
    '...ocddcaaaaaaaaaaaaabo.',
    '..ocdcaaaaaaaaaaaaaaabo.',
    '.ocaaaaaaaaaaaaaaaaaabbo',
    '.oaaaaaaaaaaaaaaaaaabbbo',
    '.offfffffffffaaaaaaabbbo',
    '.oebbbbebbbeaaaaaaabbbbo',
    '.oeebbbebbeefaaaaabbbbbo',
    '.oeeeeeeeeeefaaaabbbbbbo',
    'oeebeeeeeeebfbbbbbbbbbbo',
    '.oeeeeeeeeeeffooooooooo.',
    '.oeeeeeeeeeeeffoo.......',
    '..oeeeegeeeeefo.........',
    '...oeeeeeeeffo..........',
    '....ooeeeffoo...........',
    '......ooooo.............',
  ],
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid, its column 0 on the left eye ([7, 12]): big round
// black eyes, a white glint top-left (the lashes are the head's); his grin is
// rounder and smaller than Guy's (smiling, the lashes are painted out so the
// arcs read clean).
//   l lid, p pupil, w white, s e skin and its shadow, m mouth, t teeth,
//   g h the glint: white, pale gold
const EYES: HandEyes = {
  palette: pal(`l:#2a2e48 p:#141418 w:#ffffff s:#f6d0a8 e:#d9a27a m:#7a2e28 t:#e8e0cc g:#ffffff h:#fff2a8`),
  states: {
    open: { at: [0, 0], rows: ['wp...wp', 'pp...pp'] },
    left: { at: [0, 0], rows: ['pw...pw', 'pp...pp'] },
    half: { at: [0, 0], rows: ['ee...ee', 'wp...wp'] },
    shut: { at: [0, 1], rows: ['ll...ll'] },
    focus: { at: [0, 0], rows: ['pp...pp', 'pw...pw'] },
    happy: { at: [-1, 0], rows: ['sll...lls', 'l..l.l..l', '.........', '..mtttm..', '...mmm...'] },
    // the ting off his teeth
    sparkle: { at: [-1, 0], rows: ['sll...lls', 'l..l.l..l....h', '............hgh', '..mttgm......h', '...mmm...'] },
    // fired up: the eyes set on the post, the grin
    smug: { at: [0, 0], rows: ['pp...pp', 'pw...pw', '.......', '.mtttm.', '..mmm..'] },
    sad: { at: [0, 0], rows: ['ee...ee', 'wp...wp', '.......', '..mmm..'] },
    // startled: all white round pinpricks, the mouth an O
    wide: { at: [0, 0], rows: ['ww...ww', 'wp...pw', '.......', '...m...'] },
    // on the head turned to the post (HEAD_TURN): the far eye foreshortened to
    // a pixel, a pixel nearer, the mouth narrower
    focusT: { at: [0, 0], rows: ['pp..p', 'pw..p'] },
    smugT: { at: [0, 0], rows: ['pp..p', 'pw..p', '.....', '.mttm', '..mm.'] },
    wideT: { at: [0, 0], rows: ['ww..w', 'wp..p', '.....', '..m..'] },
  },
  moods: { focusT: 'focus', smugT: 'smug', wideT: 'surprised', sparkle: 'happy' },
}

// ------------------------------------------------------------------ body

// The jumpsuit's letters in his colours: the bright green suit, the red belt
// and its steel plate, the orange warmers, the cream bandages.
const BODY = pal(`
  o:#0e1019
  s:#f6d0a8 k:#d9a27a
  g:#f4f2ea h:#c4c0b4
  n:#62b24a m:#40903c l:#28642e
  p:#62b24a q:#40903c r:#28642e
  c:#d8343a f:#922420 i:#cfd4e0
  b:#f59a2c j:#c0601a
  t:#2a3048 u:#4a5478
  y:#6070b0 z:#2a2e48
  a:#f48a24 e:#a84e12 d:#f6ecd0
`)

// SPINKICK: the flying kick as it was, drawn to fly 3 px up: one diagonal
// from the suit up through the red belt and the shot-out leg, the head thrown
// back and dropped behind it; worn only by his copy turned away from the
// post mid-spin (anims/lee.ts's back()), where the low line reads as the leg
// swung round behind him
const SPINKICK: PoseGrid = {
  as: 'kick',
  head: [8, 6],
  hand: [1, 2],
  eyes: 'focus',
  rows: [
    '.ooo......................',
    'outo......................',
    'ottbbo....................',
    '.oobbjjoo.................',
    '...oojppqqoo..............',
    '.....oqqqqqro.oo..........',
    '......oqqqrronnmo.........',
    '.......orrrcfcmmlo........',
    '........ooiccfmllo........',
    '.........ooooolllo........',
  ],
}

// THE TUCK ROLL HOME (anims/lee.ts's rollHome): a backward roll along the
// floor, seen side on, the head never turned, only sunk: the tuck rocked
// back onto his back (A: the knees hugged up in front of his chin, the
// shins and soles kicked up front, drawn over the head), over the top (B:
// the head sunk to the floor, the legs bent up over his crown, both soles to
// the sky) and over onto his feet behind (C: the legs swung down behind
// him, the soles reaching for the floor, the back curled under the head).
// The legs going round the big head, front, top, back, are the roll.
const ROLL_A: PoseGrid = {
  as: 'tuck',
  head: [2, 2],
  eyes: 'shut',
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '...OO.....................',
    '..OUUO....................',
    '..OUTO....................',
    '..OTTBO...................',
    '...OBBJO..................',
    '....OBBJO.................',
    '.....OBJJO................',
    '......OQQOO...............',
    '.....OGHQQRO..............',
    '.....OSKQRRO..............',
    '......OOQRRO..............',
    '.......oqqrrrooooooo......',
    '.......oqqqqqqqqqqqro.....',
    '........onnnmmmmmllo......',
    '.........ooooooooooo......',
  ],
}

const ROLL_B: PoseGrid = {
  as: 'tuck',
  head: [1, 5],
  eyes: 'shut',
  rows: [
    '.......ooo...ooo..........',
    '......ouuto.ouuto.........',
    '......objjo.objjo.........',
    '.......obbo..obbo.........',
    '.......oqqqooqqqo.........',
    '........oqqqqqqo..........',
    '........orrrrrro..........',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '.......ooooooooooo........',
  ],
}

const ROLL_C: PoseGrid = {
  as: 'tuck',
  head: [-2, 3],
  eyes: 'shut',
  rows: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '...................oooo...',
    '...................oqqqo..',
    '...................orqqqo.',
    '....................orqqo.',
    '.....................obbo.',
    '.....................objo.',
    '.....................objo.',
    '.....................objjo',
    '....................ouutto',
    '.....................oooo.',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '........oonnmmmmmlloo.....',
    '.......onnmmmmmmmllloo....',
    '........ooooooooooooo.....',
  ],
}

// his cheer is Guy-sensei's Nice Guy pose: the thumbs-up and the grin, then
// the ting off his teeth
const POSES = {
  cheer: { base: 'thumbs', eyes: 'happy' },
  cheer2: { base: 'thumbs', eyes: 'sparkle' },
  spinkick: SPINKICK,
  rollA: ROLL_A,
  rollB: ROLL_B,
  rollC: ROLL_C,
} as const

// the jumpsuit as his moves see it, his own poses in it (their beats' poses and faces)
const WORN: Template = wear(JUMPSUIT, POSES)

export const LEE: NinjaSprite = {
  id: 'lee',
  template: JUMPSUIT,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  heads: { turn: HEAD_TURN },
  poses: POSES,
  ...leeMoves(WORN, EYES),
}

register(LEE)
