// Kisame's water shark (about 18 x 12 outlined): blue, a tall dorsal fin and
// a forked tail, the white belly, gill slits down its flank, and the jaws
// gaping on a row of white fangs over the dark maw. Facing left; its foot
// is the bottom of its belly.
import type { PixelSprite } from '../summons.ts'

export const sprite: PixelSprite = {
  // a body, b shade, c belly, d fangs, e maw, f eye
  palette: [0x4a86cc, 0x2c5294, 0xc4dcf2, 0xffffff, 0x701822, 0x141420],
  foot: [7, 8],
  rows: [
    '........b.......',
    '.......bb......b',
    '...aaaabbaaa..bb',
    '..afaaaaaaaaabb.',
    '.aaaaaaababab...',
    'aadadaaaaaaaab..',
    '.eeeeeeccaaab.bb',
    '..dcdcccccaab..b',
    '...ccccccbb.....',
    '......bb........',
  ],
}
