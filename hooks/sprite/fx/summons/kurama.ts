// The Nine-Tails, looming in head and shoulders over the arena, whole on the
// stage (his ears clear its top, his nose its left edge): a three-quarter
// head turned to the post, the snout thrust out over it, its black nose at
// the tip and the fanged maw open under it (the Tailed Beast Ball gathers
// there), the slit red eyes in thick black rims slanting down to the snout,
// three whisker marks on the light cheek, the fur two-toned (orange, its
// light on the brow and snout, its shade down the back of the head and the
// neck), two tails curling up behind the near ear, cream-tipped, and the
// forepaws planted on the floor either side of the post. His jaw ends at
// the post's top, so the post stands under his chin, never on his face.
// 25 x 24; the foot (5, 23) placed at [5, GROUND] puts his left edge on the
// stage's.
import type { PixelSprite } from '../summons.ts'

export const sprite: PixelSprite = {
  // a fur, b shade, c light (brow, snout, cheek, chest), d black (rims,
  // nose, lips, whisker marks), e eye red, f slit, g teeth and claws, h
  // mouth and ears' insides, i tail tips
  palette: [0xe8622a, 0xa83a1e, 0xf8a256, 0x1c0c10, 0xff2a2a, 0x140808, 0xfaf4ee, 0x5a1c1c, 0xfbe6c0],
  foot: [5, 23],
  rows: [
    '.........................',
    '......b.........b........',
    '.....bhb.......bhb..i....',
    '.....bhhb.....bhhhbiii.i.',
    '....bahhab...bahhhbiaiiii',
    '....bacaaabbbaacaabaabiai',
    '...bacccaaaaaaccaabbabaab',
    '..bddddaaaaadddddabbabaab',
    '.bcadefdaaaadeeefdabbbbab',
    'bcccaddaaaaaaddddabbbbab.',
    'ddccccaaaacccddcccbbbab..',
    'dhghgghgdccccccccbbbb....',
    '.dhhhhhhhdcddccccb.......',
    '..dghhghdcccccddcb.......',
    '...ddddddbcccccbb........',
    '.......bbcccccabb........',
    '.....bbcccccaaaabb.......',
    '..baabcccccaaaaabab......',
    '.baaaabcccaaaaaabab......',
    'baaaaaabcaaaaaabbab......',
    'baaaabbaaaaaaaabbab......',
    'aaaabbbaaaaaaaabbbb......',
    'adadabbaaadadadabbb......',
    'gagagbbagagagagabbb......',
  ],
}
