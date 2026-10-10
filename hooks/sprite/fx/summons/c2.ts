// C2, Deidara's white clay dragon, flying toward the arena (30 x 14,
// outlined): a wyvern's horned head raised on a 2 px neck, its jaws open in
// a V (white fangs over the red maw it spits the bombs from) and a dark eye
// under the brow; the near wing raised, a bat's: white finger spars fanned
// out of the wrist over the shaded membrane, its trailing edge cut in deep
// scallops between the finger tips; the far wing's tip peeking over it; a
// round chest and rump with the legs tucked; and the tail rising off the
// rump into a curl.
import type { PixelSprite } from '../summons.ts'

export const sprite: PixelSprite = {
  // a clay, b shade, c deep shade (the far wing, the claws, the curl), d the
  // eye, e the maw, f fangs
  palette: [0xf2eef6, 0xc4c0d6, 0x8a86a6, 0x2a2438, 0xaa2032, 0xf7eade],
  foot: [13, 12],
  rows: [
    '.......a.........aa..ccc.cc...',
    '......a..bb.....aaaaaaaaaaaa..',
    '.....aaab.......aaaabbbbbb....',
    '..aabaaab......aababaab.......',
    'aaaaadaab......abbabbbaa......',
    '.fefaaabb.....aabbbabbbbaa....',
    '..eeebbbba....abbbbaab........',
    '.afbbbbbaa...aabbbbbba....bbb.',
    '...bbbbbaaa..abbbbbbbba...c.b.',
    '.........aaaaaaaaa........bb..',
    '..........aaaaaaabbb....bbb...',
    '..........baaaabbbbbbbbbb.....',
    '...........bbbbbbbb...........',
    '............cc..cc............',
  ],
}
