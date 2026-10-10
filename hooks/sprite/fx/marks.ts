// Manga marks: the sleeper's z, and the gloom lines hanging over a
// crestfallen head. Anchor = top-left; placed at 'head' with a nudge.

import type { FxFamily } from '../types.ts'

export const zzz: FxFamily = {
  palette: 'ink',
  anchor: [0, 3],
  frames: [
    ['ccc.', '..c.', '.c..', 'ccc.'],
    ['wwww', '..w.', '.w..', 'wwww'],
    ['dddd', '..d.', '.d..', 'dddd'],
  ],
}

export const gloom: FxFamily = {
  palette: 'gloom',
  anchor: [0, 0],
  frames: [
    ['d.d.d.d', 'd.d.d.d', 'n.d.n.d', '..n...n'],
    ['d.d.d.d', 'd.d.d.d', 'd.d.d.d', 'n.n.d.n', '....n..'],
  ],
}

// The sweat drop of a failure, sliding down beside the head as the badge's
// does (pixel.ts's error badge: the same drop, outlined, in the same place),
// so the fizzle's slump hands over to the badge without a jump. Placed at
// 'brow' (the head's leftmost column near its top, the hair's top row): the
// drop slides from 3 rows down to 5, where the badge's sits.
export const sweat: FxFamily = {
  palette: { o: 0x16121e, b: 0x5aa8f0, w: 0xe0f2ff },
  anchor: [2, -5],
  frames: [
    { anchor: [2, -3], rows: ['.oo.', 'obbo', 'obbo', 'owbo', '.oo.'] },
    { anchor: [2, -4], rows: ['..o.', '.obo', 'obbo', 'owbo', '.oo.'] },
    ['..o.', '.obo', 'obbo', 'owbo', '.oo.'],
  ],
}
