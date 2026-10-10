// Manda, Orochimaru's giant snake, rearing up over the arena from the left:
// his coils heaped on the floor and his neck rising out of them off the
// stage's left edge, the top of his head off its top (28 px of him on the
// stage, more than it can hold, so he looms). The head faces the post and
// Orochimaru: a heavy brow over a yellow slit eye, the jaws open on white
// fangs, the forked red tongue, the pale belly down the front of the neck.
// Lit from the top left, outlined like every summon.
//   sprite     the summon ('manda'): his looming drawing, as a summon is drawn
//              (summons.ts), its foot the floor at the stage's left edge
//   mandaRear  the same, his head moving, frame by frame, anchored on the
//              floor at the stage's left edge ([0, GROUND]); `sink` brings him
//              up out of the ground:
//                0  risen, the jaws shut          1  the jaws open, the tongue out
//                2  the head swayed a pixel down  3  struck down onto the post
// Drawn in stage coordinates from (-8, -8): column 8, row 31 is the stage's
// (0, 23).
import { outlined } from '../../grid.ts'
import type { FxFamily, Palette } from '../../types.ts'
import type { PixelSprite } from '../summons.ts'

// the summons' outline (summons.ts's OUTLINE: not imported, as summons.ts imports this file)
const OUTLINE = 0x0e1019

// a body, b shade, c belly, d eye, e slit and nostril, f tongue, g light, h fang, i deep shade, j mouth
const PALETTE = [0x8c50c4, 0x5a2e8a, 0xdcc4ec, 0xf8d848, 0x1c1418, 0xe03848, 0xb682e6, 0xf8f4f0, 0x3a1c5e, 0x6a1440]

const FRAMES: readonly (readonly string[])[] = [
  [
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '............gggggggg..............',
    '..........gggggggggggggg..........',
    '.........ggaaaaaaaiiiiigg.........',
    '........gaaaaaaaaiidddiaaa........',
    '.......gaaaaaaaaaaddedaaaaa.......',
    '......gaaaaaaaaaaaaddaaaaaae......',
    '.....ggabbbbbbbbbbbbbbbbbbbb......',
    '.....ggbbhbbbbhbbbbbbhbbbbb.......',
    '....gggacccccccccccccccbb.........',
    '....ggaaaccccccccccbbb............',
    '...gggaaabbbbbbbbbb...............',
    '...ggaaaabcbb.....................',
    '...ggaaaacbc......................',
    '...ggaaaabbc......................',
    '...ggaaaaccc......................',
    '..gggaaaaccc......................',
    '..gggaaaabbbb.....................',
    '..gggaaaacccb.....................',
    'gggggaaaacbcc.....................',
    'gggggaaaaabbbggg..................',
    'aaaggaaaaabbbaaaa.................',
    'aaaggaaaabbbbaaaagggggg...........',
    'aaagggaaabbbbaaaaaaaaaaaa.........',
    'bbbbgggggbbbbbaaaaaaaaaaaa........',
    'bbbbbggggbbbbbbbbbbbbbbbbb........',
  ],
  [
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '............gggggggg..............',
    '..........gggggggggggggg..........',
    '.........ggaaaaaaaiiiiigg.........',
    '........gaaaaaaaaiidddiaaa........',
    '.......gaaaaaaaaaaddedaaaaa.......',
    '......gaaaaaaaaaaaaddaaaaaae......',
    '.....ggabbbbbbbbbbbbbbbbbbbb......',
    '.....ggbbbjjjhjjjjjjhjjjjj........',
    '....gggbbjjjjhjjjjjjhjjjffff......',
    '....ggaabjjjjjjjjjjjjjjf...f......',
    '...gggaachjjjjhjjjjjjjj...........',
    '...ggaaacccccccccccbbbb...........',
    '...ggaaaaccccccccbbb..............',
    '...ggaaaabbbbbbbb.................',
    '...ggaaaaccc......................',
    '..gggaaaaccc......................',
    '..gggaaaabbbb.....................',
    '..gggaaaacccb.....................',
    'gggggaaaacbcc.....................',
    'gggggaaaaabbbggg..................',
    'aaaggaaaaabbbaaaa.................',
    'aaaggaaaabbbbaaaagggggg...........',
    'aaagggaaabbbbaaaaaaaaaaaa.........',
    'bbbbgggggbbbbbaaaaaaaaaaaa........',
    'bbbbbggggbbbbbbbbbbbbbbbbb........',
  ],
  [
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '............gggggggg..............',
    '..........gggggggggggggg..........',
    '.........ggaaaaaaaiiiiigg.........',
    '........gaaaaaaaaiidddiaaa........',
    '.......gaaaaaaaaaaddedaaaaa.......',
    '......gaaaaaaaaaaaaddaaaaaae......',
    '.....ggabbbbbbbbbbbbbbbbbbbb......',
    '.....ggbbbjjjhjjjjjjhjjjjj........',
    '....ggabbjjjjhjjjjjjhjjjffff......',
    '....ggaabjjjjjjjjjjjjjjf...f......',
    '...ggaaachjjjjhjjjjjjjj...........',
    '...ggaaacccccccccccbbbb...........',
    '...ggaaaaccccccccbbb..............',
    '...ggaaaabbbbbbbb.................',
    '..gggaaaabbb......................',
    '..gggaaaacbbb.....................',
    '..gggaaaacccb.....................',
    'gggggaaaacbcc.....................',
    'gggggaaaaabbbggg..................',
    'aaaggaaaaabbbaaaa.................',
    'aaaggaaaabbbbaaaagggggg...........',
    'aaagggaaabbbbaaaaaaaaaaaa.........',
    'bbbbgggggbbbbbaaaaaaaaaaaa........',
    'bbbbbggggbbbbbbbbbbbbbbbbb........',
  ],
  [
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '..................................',
    '.............gggggggg.............',
    '...........gggggggggggggg.........',
    '.........gggaaaaaaaiiiiigg........',
    '.......gggaaaaaaaaiidddiaaa.......',
    '.....ggggaaaaaaaaaaddedaaaaa......',
    '.....ggaaaaaaaaaaaaaddaaaaaae.....',
    '....ggaaabbbbbbbbbbbbbbbbbbbb.....',
    '...gggaabbbjjjhjjjjjjhjjjjjj......',
    '...ggaaabbjjjjhjjjjjjhjjjjfff.....',
    '...ggaaaabjjjjjjjjjjjjjjjf..f.....',
    '...ggaaaabjjjjjjjjjjjjjjj.........',
    '..gggaaaachjjjjhjjjjjjjjj.........',
    '..gggaaaacccccccccccccbbb.........',
    'gggggaaaaacccccccccbbbb...........',
    'gggggaaaaabbbbbbbbbb..............',
    'aaaggaaaaabbbaaaa.................',
    'aaaggaaaabbbbaaaagggggg...........',
    'aaagggaaabbbbaaaaaaaaaaaa.........',
    'bbbbgggggbbbbbaaaaaaaaaaaa........',
    'bbbbbggggbbbbbbbbbbbbbbbbb........',
  ],
]

export const sprite: PixelSprite = { palette: PALETTE, foot: [8, 31], rows: FRAMES[0]! }

const LETTERS = 'abcdefghij'
export const mandaRear: FxFamily = {
  palette: { ...Object.fromEntries(PALETTE.map((c, i) => [LETTERS[i]!, c])), k: OUTLINE } as Palette,
  anchor: [9, 32],
  frames: FRAMES.map(f => outlined(f, 'k')),
}
