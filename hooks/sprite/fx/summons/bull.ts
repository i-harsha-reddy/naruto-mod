// Bull, Kakashi's biggest ninken: a heavy white-and-grey bulldog, seen face
// on: folded grey ears, a grey patch over one eye, a broad black nose, the
// heavy jowls of the mouth and a pink tongue.
import type { PixelSprite } from '../summons.ts'

export const sprite: PixelSprite = {
  // a white, b grey, c grey shade, d nose and eyes, e tongue
  palette: [0xeeecf2, 0xb2b0c2, 0x7e7c92, 0x1c1a24, 0xf08ca0],
  foot: [5, 7],
  rows: [
    '.cb....bc.',
    'cbbaaaaabc',
    'abdbaaadaa',
    'abdbaaadaa',
    'aabaddaaab',
    'bacccccacb',
    'bbaaeeaabb',
    '.cc.aa.cc.',
  ],
}
