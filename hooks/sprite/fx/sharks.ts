// Kisame's little water-sharks (the Five Feeding Sharks): water shaped into a
// shark the size of a hand, flung across the arena jaws first. Facing left.
// A tall dorsal fin, an eye, the jaw open on white teeth, the tail beating:
// three frames (the tail up, level, the body flexed), loop while it flies.
// 8x6, anchor = the middle of its jaw (what bites the post).

import type { FxFamily } from '../types.ts'

export const miniShark: FxFamily = {
  palette: 'water',
  anchor: [0, 4],
  frames: [
    ['....n...', '..nnbn.n', '.nbnbbnb', 'nbbbbbbn', 'wwccbbn.', '.nnnnn..'],
    ['....n...', '..nnbn..', '.nbnbbnn', 'nbbbbbbb', 'wwccbbnn', '.nnnnn..'],
    ['...n....', '.nnbnn.n', 'nbnbbbnb', 'nbbbbbbn', 'wwccbbn.', '.nnnn...'],
  ],
}
