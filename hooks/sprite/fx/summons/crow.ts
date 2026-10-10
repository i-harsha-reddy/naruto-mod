// One of Itachi's crows: black with a blue sheen, a grey beak and a red
// Sharingan eye. Facing left.
import type { PixelSprite } from '../summons.ts'

export const sprite: PixelSprite = {
  // a black, b sheen, c beak and legs, d eye
  palette: [0x3c3c5a, 0x6e6e9c, 0xa8a8b8, 0xf02a36],
  foot: [3, 5],
  rows: [
    '.ab....',
    'cdda...',
    '.aaabb.',
    '..abbab',
    '..aaa..',
    '..c.c..',
  ],
}
