// One of Kakashi's ninja hounds: a little slate-grey dog with a white muzzle,
// chest and paws, a red scarf and a tail up. Facing left.
import type { PixelSprite } from '../summons.ts'

export const sprite: PixelSprite = {
  // a fur, b shade, c white, d nose and eye, e scarf
  palette: [0x7c86a2, 0x4e566e, 0xf0f2f6, 0x16141c, 0xd8343c],
  foot: [3, 5],
  rows: [
    '.ab.....',
    'adaa...b',
    'adaa...a',
    'ccaaaaaa',
    '.eeaaaab',
    '.c.c..c.',
  ],
}
