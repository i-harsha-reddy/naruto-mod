// A summoning seal: the palm slapped to the ground opens a ring of chakra
// there, and its script races along the floor to where the summons will come.
// Palette 'seal': w c b d the chakra (white-hot to deep), k the ink of the
// script.

import type { FxFamily } from '../types.ts'

// The ring round the palm, flat on the floor, widening. Anchor = its centre
// on the ground row: placed at the palm's column on the ground, behind the feet.
export const sealRing: FxFamily = {
  palette: 'seal',
  anchor: [2, 2],
  frames: [
    { anchor: [2, 2], rows: ['.bcb.', 'c.w.c', '.bcb.'] },
    { anchor: [4, 2], rows: ['..bcwcb..', 'bc..k..cb', '..bcwcb..'] },
    { anchor: [6, 2], rows: ['...bccwccb...', 'bcc..k.k..ccb', '...bccwccb...'] },
    { anchor: [6, 2], rows: ['...d.bcb.d...', 'bd...k.k...db', '...d.bcb.d...'] },
  ],
}

// The script along the floor, run out from the palm (its right end, the
// anchor, on the ground) toward the post, longer each frame, its leading tip
// white-hot; the last frame fading behind the tip.
export const sealLine: FxFamily = {
  palette: 'seal',
  anchor: [0, 1],
  frames: [
    { anchor: [4, 1], rows: ['.k.k.', 'wcccb'] },
    { anchor: [9, 1], rows: ['.k.k.k.k.k', 'wcccbcccbb'] },
    { anchor: [14, 1], rows: ['.k.k.k.k.k.k.k.', 'wcccbcccbcccbcb'] },
    { anchor: [17, 1], rows: ['.k.k.k.k.k.k.k.k.k', 'wwccbcccbcccbcccbb'] },
    { anchor: [17, 1], rows: ['...k...k...k...k..', 'c.bd.dd.d.dd.d.dd.'] },
  ],
}
