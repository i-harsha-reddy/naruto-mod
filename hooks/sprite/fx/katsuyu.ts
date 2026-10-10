// Katsuyu as Sakura summons her (the healer's summoning, the war arc): the
// great slug rising out of the smoke beside the post as a bust taller than
// the post, who then divides, as she does in canon, into a swarm of little
// slugs; one of them rides on Sakura's shoulder to heal (summons/slug.ts's
// katsuyuMini). Tsunade's giant is summons/slug.ts's `slug`.
//
// Drawn facing left, toward the arena, lit from the top left: a white-mint
// body, its shade, two blue stripes running from between the eye stalks down
// her back, the stalks up on top with dark round eyes glinting at their tips,
// a gloss on her brow, a small mouth at the front of her head, the broad foot.
//   a body  b shade  h deep shade under the chin  c stripe  k its light
//   d eye   e white (the eyes' glint, the brow's gloss)  g mouth  t tongue
//   f foot
import { outlined } from '../grid.ts'
import type { FxFamily, Palette } from '../types.ts'

const PALETTE: Palette = {
  a: 0xeefaf5,
  j: 0xc8e6dc,
  b: 0x9ccabd,
  h: 0x6e9c8e,
  c: 0x3a6cc8,
  k: 0x8cb4f4,
  l: 0x24489a,
  d: 0x24243e,
  e: 0xffffff,
  g: 0x3a4a6a,
  t: 0xf08aa8,
  f: 0x78b4a4,
  o: 0x0e1019,
}

// The bust (22 x 24 inside her outline), the foot on the last row: rising
// out of the smoke (placed with `sink`), she stands a head taller than the
// post. 0: up, eyes on the arena; 1: speaking ("Sakura-san"), the mouth open
// in a smile; 2: dividing, little slugs budding out of her sides and back,
// the stripes breaking; 3: divided, a heap of little slugs where she stood,
// each with its two stalks; 4: the heap thinned as they scatter
// (katsuyuBits). Anchor: the foot's middle on the ground row.
const BUST: string[] = [
  '..edd...edd...........',
  '..ddd...ddd...........',
  '...aj....aj...........',
  '...aj....aj...........',
  '...aj....aj...........',
  '...aaakcaakjb.........',
  '..aeeaaakcajkjb.......',
  '.aeaaaaakcajkcjb......',
  'aaaaaaaaakcjjkcjb.....',
  'aaaaaaaaakcajkcjjb....',
  'agaaagaaaakcjjkcjb....',
  'aagggaaaaakcjjkcjbj...',
  'haaaaaaaaakcjjkcjbj...',
  '.haaaaaaaaakcjjkcjbj..',
  '.bbaaaaaaaakcjjkcjbj..',
  '.bbbbaaaaaakcjjkcbbj..',
  '.bbbbbaaaajjkcjjkcbbj.',
  '.hhbbbaajjjjkcjjklbbj.',
  'hhhbbbjjjjjjkcjjclbbj.',
  'hhhhbbjjjjjjkcjjclbbbj',
  'hhhhbbbjjjjjjkcbbclbbh',
  'hhhhhbbjjjjjjklbbclbbh',
  'hhhbbbbbbbbbbclbbclbhh',
  'hffffffhffffffhffffffh',
]
// speaking: the mouth open in a smile, a tongue in it
const TALK: string[] = [
  '..edd...edd...........',
  '..ddd...ddd...........',
  '...aj....aj...........',
  '...aj....aj...........',
  '...aj....aj...........',
  '...aaakcaakjb.........',
  '..aeeaaakcajkjb.......',
  '.aeaaaaakcajkcjb......',
  'aaaaaaaaakcjjkcjb.....',
  'aaaaaaaaakcajkcjjb....',
  'agggggaaaakcjjkcjb....',
  'agttgaaaaakcjjkcjbj...',
  'haggaaaaaakcjjkcjbj...',
  '.haaaaaaaaakcjjkcjbj..',
  '.bbaaaaaaaakcjjkcjbj..',
  '.bbbbaaaaaakcjjkcbbj..',
  '.bbbbbaaaajjkcjjkcbbj.',
  '.hhbbbaajjjjkcjjklbbj.',
  'hhhbbbjjjjjjkcjjclbbj.',
  'hhhhbbjjjjjjkcjjclbbbj',
  'hhhhbbbjjjjjjkcbbclbbh',
  'hhhhhbbjjjjjjklbbclbbh',
  'hhhbbbbbbbbbbclbbclbhh',
  'hffffffhffffffhffffffh',
]
// dividing: little slugs bulging out of her back, her chin and her flank,
// each a lump with two stalks; the stripes breaking up
const BUD: string[] = [
  '..edd...edd...........',
  '..ddd...ddd...a.a.....',
  '...aj....aj..aaaaj....',
  '...aj....aj..ajjjb....',
  '...aj....aj...bbb.....',
  '...aaakcaakjb.........',
  '..aeeaaakcajkjb...a.a.',
  '.aeaaaaaaaajaajb.aaaaj',
  'aaaaaaaaakcjjkcjbajjjb',
  'aaaaaaaaakcajkcjjbbbb.',
  'agaaagaaaaaajjaajb....',
  'aagggaaaaakcjjkcjbj...',
  'haaaaaaaaakcjjkcjbj...',
  '.haaaaaaaaaaajjaajbj..',
  '.bbaaaaaaaakcjjkcjbj..',
  '.ababaaaaaakcjjkcbaja.',
  'aaaajbaaaajjaajjaaaaaj',
  'ajjjbbaajjjjkcjjkajjjb',
  'hbbbbbjjjjjjkcjjclbbb.',
  'hhhhbbjjjjjjaajjabbbbj',
  'hhhhbbbjjjjjjkcbbclbbh',
  'hhhhhbbjjjjjjklbbclbbh',
  'hhhbbbbbbbbbbabbbabbhh',
  'hffffffhffffffhffffffh',
]
// divided: a heap of little slugs where she stood, stalks up, the top one
// still looking at the arena
const HEAP: string[] = [
  ...Array.from({ length: 8 }, () => '......................'),
  '........a.a...........',
  '.......aaaab..........',
  '......gaaaab.a.a......',
  '.......ffff.aaaab.....',
  '....a.a....gaaaab.....',
  '...aaaab....ffff.a.a..',
  '..gaaaab..a.a...aaaab.',
  '...ffff..aaaab.gaaaab.',
  '..a.a...gaaaab..ffff..',
  '.aaaab...ffff.a.a.....',
  'gaaaab...a.a.aaaab.a.a',
  '.ffff...aaaabgaaaabaaa',
  '...a.a.gaaaab.ffffgaaa',
  '..aaaab.ffff..a.a..fff',
  '.gaaaab......aaaab....',
  '..ffff......gaaaab....',
]
// and thinned, the rest scattering
const THIN: string[] = [
  ...Array.from({ length: 14 }, () => '......................'),
  '..........a.a.........',
  '.........aaaab........',
  '........gaaaab........',
  '.........ffff..a.a....',
  '...a.a........aaaab...',
  '..aaaab......gaaaab...',
  '.gaaaab.......ffff....',
  '..ffff...a.a..........',
  '........aaaab.........',
  '.......gaaaab.........',
]
export const katsuyu: FxFamily = { palette: PALETTE, anchor: [12, 24], frames: [BUST, TALK, BUD, HEAP, THIN].map(f => outlined(f)) }

// The little slugs she divides into, popping off the heap on arcs, up and
// out to either side and down again, tumbling (a slug flips over in the
// air), landing in a skid and gone in a pop of white: 0 just off the heap,
// 1 at the top of their arcs, 2 coming down, 3 landed, 4 the pops. 30 x 18,
// anchor: the heap's foot (the katsuyu bust's anchor), on the ground row.
const BITS: string[][] = [
  [
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '.............a.a..............',
    '............aaaab.............',
    '...a.a.....gaaaab....a.a......',
    '..aaaab.....ffff....aaaab.....',
    '.gaaaab.............gaaaab....',
    '..ffff...............ffff.....',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
  ],
  [
    '............a.a...............',
    '...........aaaab..............',
    '..a.a.....gaaaab.......a.a....',
    '.aaaab.....ffff.......aaaab...',
    'gaaaab...............gaaaab...',
    '.ffff.................ffff....',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
  ],
  [
    '..............................',
    '..............................',
    '..............................',
    '..............ffff............',
    '.............baaaag...........',
    '..............baaaa...........',
    '...............a.a........ffff',
    '.........................baaag',
    '..ffff....................baaa',
    '.baaaag....................a.a',
    '..baaaa.......................',
    '...a.a........................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
  ],
  [
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............a.a.............',
    '.............aaaab............',
    'a.a.........gaaaab.........a.a',
    'aaab.........ffff.........aaaa',
    'aaaab.....................gaaa',
  ],
  [
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '...............e..............',
    '.............e...e............',
    '..e...........e.e.........e...',
    '.e.e.....................e.e..',
    '..e........................e..',
    '..............................',
  ],
]
export const katsuyuBits: FxFamily = { palette: PALETTE, anchor: [16, 18], frames: BITS.map(f => outlined(f)) }

// ------------------------------------------------------------------ the heal and the acid

// The medical chakra settling over the post as Sakura heals it (not a shot:
// a glow): a soft light gathers over the post's crown, sinks over it and
// wraps it in a halo, settles down it to a pool of light at its foot and
// fades there. Solid shapes in three tones (the 'heal' palette's edge b, its
// mid c, its white core w), drawn behind the post (back: true) so the wood
// shows inside the halo. 13 x 16, anchor: the post's foot, its middle
// ([POST_X + 1, GROUND]); the post fills its columns 3-9, rows 5-15.
//   0 gathering over the crown  1 sinking over it  2 wrapped round it
//   3 settled down its foot     4 the pool of light fading
export const healGlow: FxFamily = {
  palette: 'heal',
  anchor: [6, 15],
  frames: [
    [
      '.............',
      '....bbbbb....',
      '...bccwccb...',
      '....bbbbb....',
    ],
    [
      '.............',
      '.............',
      '....bbbbb....',
      '..bbcccccbb..',
      '.bccwwwwwccb.',
      '.bccwwwwwccb.',
      '..bbcccccbb..',
      '....bbbbb....',
    ],
    [
      '.............',
      '.............',
      '.............',
      '....bbbbb....',
      '...bcccccb...',
      '..bcwwwwwcb..',
      '..bcwwwwwcb..',
      '..bcwwwwwcb..',
      '..bcwwwwwcb..',
      '..bcwwwwwcb..',
      '..bcwwwwwcb..',
      '..bcwwwwwcb..',
      '..bcwwwwwcb..',
      '.bccwwwwwccb.',
      'bcccwwwwwcccb',
      '.bbbbbbbbbbb.',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '...b.....b...',
      '..bc.....cb..',
      '..bc.....cb..',
      '..bcc...ccb..',
      '.bccwwwwwccb.',
      'bcccwwwwwcccb',
      '.bbbbbbbbbbb.',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '..bcccccccb..',
      '...bbbbbbb...',
    ],
  ],
}

// The sparkles rising off the healed post: little four-point stars (a white
// heart, mid-tone arms), never a lone pixel, drifting up round it and going
// out. In front of the post. 13 x 16, anchored as healGlow.
//   0 low round its foot  1 halfway up  2 round its crown  3 the last two, dimmed
export const healSparkle: FxFamily = {
  palette: 'heal',
  anchor: [6, 15],
  frames: [
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '..........c..',
      '.........cwc.',
      '..........c..',
      '.............',
      '..c..........',
      '.cwc.........',
      '..c..........',
      '.............',
      '.............',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '...........c.',
      '..........cwc',
      '...........c.',
      '.............',
      '.c...........',
      'cwc..........',
      '.c....c......',
      '.....cwc.....',
      '......c......',
      '.............',
      '.............',
      '.............',
    ],
    [
      '.............',
      '..........c..',
      '.........cwc.',
      '..c.......c..',
      '.cwc.........',
      '..c..........',
      '.............',
      '......c......',
      '.....cwc.....',
      '......c......',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
    ],
    [
      '...b.........',
      '..bcb........',
      '...b.........',
      '.............',
      '.............',
      '..........b..',
      '.........bcb.',
      '..........b..',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
    ],
  ],
}

// Katsuyu's acid out of the giant's mouth (summons/slug.ts's open mouth, at
// [14, 9] on the stage), as a solid stream, not spray: a glob at the lips,
// the jet thrown out to the left, then arcing over and down onto the post's
// crown, and pouring there (3 and 4 alternate, the stream's edge
// rippling). Three tones (the 'acid' palette's light c, body b, shade d).
// 14 x 8, anchor: the mouth (its right end).
export const acidJet: FxFamily = {
  palette: 'acid',
  anchor: [13, 2],
  frames: [
    ['..............', '..........ccb.', '.........cbbbd', '..........bdd.'],
    ['..............', '....ccccccc...', '..ccbbbbbbbbbd', '...bbddddddd..', '...bd.........'],
    ['..............', '.......cccc...', '......cbbbbbbd', '.....cbbdddd..', '.....cbd......', '.....cbd......', '......bd......'],
    ['..............', '.......cccc...', '......cbbbbbbd', '.....cbbdddd..', '.....cbd......', '....cbbd......', '....cbbd......', '.....bd.......'],
    ['..............', '......ccccc...', '.....cbbbbbbbd', '.....cbddddd..', '.....cbd......', '.....cbd......', '....cbbd......', '....bbdd......'],
  ],
}

// The acid on the post: it splashes over the crown, runs down both sides,
// pools round its foot and bubbles there as it eats the wood, then shrinks.
// Solid, three tones as the jet. In front of the post. 13 x 16, anchored as
// healGlow (the post's columns 3-9, rows 5-15).
//   0 the splash on the crown  1 running down  2 pooled  3 bubbling  4 shrinking
export const acidPool: FxFamily = {
  palette: 'acid',
  anchor: [6, 15],
  frames: [
    [
      '.............',
      '.............',
      '..cc.....cc..',
      '..bcc...ccb..',
      '...bbcccbb...',
      '...bbbbbbbd..',
      '....bbbbbd...',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '....ccccc....',
      '...cbbbbbd...',
      '...bbddddd...',
      '...bd...bd...',
      '...bd...bd...',
      '...bd....d...',
      '....d........',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '...cbbbbbd...',
      '...bd...bd...',
      '...bd...bd...',
      '...bd....d...',
      '...bd........',
      '...bd........',
      '...d.........',
      '.............',
      '..cc.....cc..',
      '.cbbbbbbbbbd.',
      'cbbbbbbbbbbbd',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '...cbbbbbd...',
      '...bd....d...',
      '...bd........',
      '...d.........',
      '.............',
      '.............',
      '.............',
      '.cc......cc..',
      'cbbc....cbbc.',
      '.cbbbbbbbbbd.',
      'cbbbbbbbbbbbd',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      '..cbbbbbbbd..',
      '.cbbbbbbbbbd.',
    ],
  ],
}

// The medical chakra cupped in Sakura's palm as she gathers it: a soft round
// glow, solid (the 'heal' palette's edge, mid and white core), swelling and
// easing as it pulses. 5 x 5, anchor: its middle (on the hand).
//   0 small  1 swollen  2 easing back
export const healOrb: FxFamily = {
  palette: 'heal',
  anchor: [2, 2],
  frames: [
    ['.....', '..b..', '.bcb.', '..b..', '.....'],
    ['.bbb.', 'bcwcb', 'bwwwb', 'bcwcb', '.bbb.'],
    ['.....', '.bcb.', '.cwc.', '.bcb.', '.....'],
  ],
}
