// Hinata's Twin Lion Fists, the jacket team's own (gentle.ts's lionFist is
// the robe team's): a lion's head of chakra on each fist, seen side on,
// facing left at the post, drawn as one solid shape in three tones and an
// outline: n the outline (a near-black violet, far darker than her indigo
// hair, so the two never run together), c the pale face and fangs, b the
// mane, d its darker edge. What makes it a lion and no fish: a ring of mane
// all round the face (tufts over the brow, a two-row ruff under the jaw, the
// mass of it behind), a 2 x 2 ear standing up out of it, a short muzzle with
// the nose at its tip under a heavy brow slanting down to it, and the jaw
// thrown open in a wedge on a pale fang above and one below (shut on the
// bite). The mane's edge is solid, its darker band inside the outline, never
// a dithered fringe. The second lion is the same drawing in 'lionsDim'
// (fx/palettes.ts), a step darker, so the two read as two.
//
// twinLion (17 x 13, anchored at [14, 7], the back of the head where the
// fist drives it: placed at 'hand', the head out ahead of the fist toward
// the post): 0 1 roaring (the tufts flickering), 2 the bite (the jaw
// snapped shut), 3 4 5 the head breaking up into tongues and wisps that pull
// back and thin away (never gone in one frame).
// twinLionLow (15 x 11, anchored at [12, 6]): the low lion, two pixels
// smaller than the high one, so the pair read near and far: 0 1 roaring, 2
// the bite.
// twinLionForm (anchored as twinLion): 0 a knot of chakra at the fist, 1 2
// a cub's head, half grown (its tufts flickering), held at home where a full
// head would hide the post; then the full heads as the lions surge.

import type { FxFamily } from '../types.ts'

export const twinLion: FxFamily = {
  palette: 'lions',
  anchor: [14, 7],
  frames: [
    // roaring: the jaw open on its fangs
    [
      '....nn......nn...',
      '...ndbn..nn.ndbn.',
      '..ndbbbbnccnbdbbn',
      '..nbbbbbnccnbbdn.',
      '..nbbnnnnnnnbbbdn',
      '..nnnccncccnbdbbn',
      '.nnncccccccnbbdn.',
      '.ncccccccccnbbbdn',
      '.nc..cnccnbbdbbbn',
      '..n.c.nccnbbbdn..',
      '..nnccccnbbdbbdn.',
      '..ndbbbbbbdbbdn..',
      '...nnbnnbnnbnn...',
    ],
    // and the tufts flickering
    [
      '...nn......nn....',
      '..ndbn..nn.ndbnn.',
      '..ndbbbbnccnbdbn.',
      '..nbbbbbnccnbbdbn',
      '..nbbnnnnnnnbbbdn',
      '..nnnccncccnbdbn.',
      '.nnncccccccnbbdbn',
      '.ncccccccccnbbbdn',
      '.nc..cnccnbbdbbn.',
      '..n.c.nccnbbbdbn.',
      '..nnccccnbbdbbdn.',
      '..ndbbbbbbdbbdn..',
      '..nnbnnbnnbnnn...',
    ],
    // the bite: the jaw snapped shut, the fangs crossed
    [
      '....nn......nn...',
      '...ndbn..nn.ndbn.',
      '..ndbbbbnccnbdbbn',
      '..nbbbbbnccnbbdn.',
      '..nbbnnnnnnnbbbdn',
      '..nnnccncccnbdbbn',
      '.nnncccccccnbbdn.',
      '.ncccccccccnbbbdn',
      '.ncncnnccnbbdbbbn',
      '..nnccccnbbbbdn..',
      '...nnnnnbbdbbdn..',
      '..ndbbbbbbdbbdn..',
      '...nnbnnbnnbnn...',
    ],
    // breaking: the jaw gone, the mane torn into tongues pulling back
    [
      '.................',
      '......nn..nn.....',
      '....nndbnndbnn...',
      '...nccnbbbbbbdn..',
      '..ncccnnbbbdbbdn.',
      '.nccccccnbbbbbbdn',
      '..nnnccccnbbbbdn.',
      '....nnnccccnbbbdn',
      '.......nnnnbbbdn.',
      '........ndbbdnn..',
      '.........nnnn....',
      '.................',
      '.................',
    ],
    // two tongues of it, streaming back
    [
      '.................',
      '.................',
      '........nnnn.....',
      '......nnbbbbnn...',
      '....nnbccbbbddn..',
      '...nbccccbbnnn...',
      '....nnnnnnn......',
      '.................',
      '.......nnnnn.....',
      '.....nnbccbbnn...',
      '......nnnbbddn...',
      '.........nnnn....',
      '.................',
    ],
    // two wisps, thinning
    [
      '.................',
      '.................',
      '.................',
      '.........nnn.....',
      '.......nnbbdn....',
      '......nbbdnn.....',
      '.......nnn.......',
      '.................',
      '.................',
      '..........nnn....',
      '........nnbdn....',
      '.........nnn.....',
      '.................',
    ],
  ],
}

export const twinLionLow: FxFamily = {
  palette: 'lions',
  anchor: [12, 6],
  frames: [
    // roaring
    [
      '...nn.....nn...',
      '..ndbn.nn.nbbn.',
      '.ndbbbnccnbdbbn',
      '.nbbnnnnnnbbdn.',
      '.nnnccncccnbbdn',
      'nnnccccccnbdbbn',
      'ncccccccccnbdn.',
      'nc..cnccnbbdbbn',
      '.n.c.nccnbbbdn.',
      '.nnccccnbbdbdn.',
      '..nnbnnbnbnn...',
    ],
    // the tufts flickering
    [
      '..nn.....nn....',
      '.ndbn.nn.nbbnn.',
      '.ndbbbnccnbdbbn',
      '.nbbnnnnnnbbdn.',
      '.nnnccncccnbbdn',
      'nnnccccccnbdbbn',
      'ncccccccccnbdn.',
      'nc..cnccnbbdbbn',
      '.n.c.nccnbbbdn.',
      '.nnccccnbbdbdn.',
      '..nnnbnnbnbnn..',
    ],
    // the bite
    [
      '...nn.....nn...',
      '..ndbn.nn.nbbn.',
      '.ndbbbnccnbdbbn',
      '.nbbnnnnnnbbdn.',
      '.nnnccncccnbbdn',
      'nnnccccccnbdbbn',
      'ncccccccccnbdn.',
      'ncncnnccnbbdbbn',
      '.nnccccnbbbdn..',
      '..nnnnnnbbdbdn.',
      '..nnbnnbnbnn...',
    ],
  ],
}

export const twinLionForm: FxFamily = {
  palette: 'lions',
  anchor: [14, 7],
  frames: [
    // a knot of chakra at the fist
    [
      '.................',
      '.................',
      '.................',
      '.................',
      '..........nn.n...',
      '.........nbbnbn..',
      '........nbccbdn..',
      '.......nbcccbbdn.',
      '........nbccbdn..',
      '.........nbbnbn..',
      '..........nn.n...',
      '.................',
      '.................',
    ],
    // a cub's head, half grown: the ear, the brow, the jaw open, a small ring of mane
    [
      '.................',
      '.................',
      '......nn....nn...',
      '.....ndbn.nnnbbn.',
      '.....nbbbnccnbbdn',
      '.....nbnnnnnnbbdn',
      '.....nnccnccnbbdn',
      '....nnccccccnbbdn',
      '....nc.c.ccnbbdn.',
      '.....nnccccnbbdn.',
      '......nnbnnbnnn..',
      '.................',
      '.................',
    ],
    // and its tufts flickering
    [
      '.................',
      '.................',
      '.....nn....nn....',
      '....ndbn.nnnbbnn.',
      '.....nbbbnccnbbdn',
      '.....nbnnnnnnbbdn',
      '.....nnccnccnbbdn',
      '....nnccccccnbbdn',
      '....nc.c.ccnbbdn.',
      '.....nnccccnbbdn.',
      '......nbnnbnbnn..',
      '.................',
      '.................',
    ],
  ],
}

export const LION_FX: Readonly<Record<string, FxFamily>> = { twinLion, twinLionLow, twinLionForm }
