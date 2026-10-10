// The robe team's effects: Orochimaru's shadow snakes (serpent, serpentCoil,
// serpentRise), registered together as ROBE_FX (fx/index.ts) with the sand
// that climbs round Gaara, his shield's ripple and his Third Eye (sand.ts's
// sandClimb, sandRipple, sandEye).
//
// The snakes are drawn as snakes, not sausages: an S-curved body three
// pixels thick (scales on the back in two violets, dark diamonds along it, a
// pale belly, a dark rim), a diamond head with a gold eye, the jaws opening
// on white fangs, and a forked red tongue flicking out of them.

import { pal } from '../grid.ts'
import type { FxFamily } from '../types.ts'
import { sandClimb, sandEye, sandRipple } from './sand.ts'

// n rim, d the dark scales, b the back, c the belly, w the fangs, y the eye, r the tongue
const SNAKE = pal(`n:#1c0f2e d:#4e3482 b:#8a66c8 c:#dccdf2 w:#ffffff y:#f2c23a r:#ff4c5a`)

// ------------------------------------------------------------------ the striking snake
// A shadow snake out of his sleeve at the post, its head at the left (the
// anchor: the tip of its jaws, where it bites), its body trailing back to the
// right behind him in an S (drawn behind him, so it comes out of his sleeve).
//   0  lunging, jaws wide, the tongue flicked out forked
//   1  the S rolled the other way, the tongue drawn in (frames 0-1 by turns:
//      the body writhing as it flies)
//   2  clamped on, jaws shut, the teeth along them
//   3  clamped, the S rolled (frames 2-3 by turns: squeezing)
// 27x13.
export const serpent: FxFamily = {
  palette: SNAKE,
  anchor: [3, 6],
  frames: [
    // 0
    [
      '...........................',
      '...........................',
      '...nn................nnnn..',
      '...nbnnnn..........nndbbdnn',
      '...nwbbybnnn......nbbddbbbb',
      'r...wnnnbbbnnn..nndbbbcccdb',
      '.rrrrrrrnbbndbnnbbddccnnccc',
      'r...wnnnccbnbdbdbbbcnn..nnc',
      '...nwccccnncccbbdccn......n',
      '...nnnnnn..nnccccnn........',
      '.............nnnn..........',
      '...........................',
      '...........................',
    ],
    // 1
    [
      '...........................',
      '...........................',
      '...nn........nnnnn.........',
      '...nbnnnn...nbbdbbnn.......',
      '...nwbbybnnndbbbdbdbn......',
      '..r.wnnnbbbnddccccbdbn...nn',
      '...rrrrrnbbnbcnnncccbdnnnbb',
      '....wnnnccbncn...nnccbbbdbb',
      '...nwccccnncn......nccdbbdc',
      '...nnnnnn..n........ncccccn',
      '.....................nnnnn.',
      '...........................',
      '...........................',
    ],
    // 2
    [
      '...........................',
      '...........................',
      '...................nnnnn...',
      '.....nnnnn........nbbdbbnn.',
      '....nbbybbn......ndbbbdbdbn',
      '...nbbbbbbbn...nnbddccccbdb',
      '...nwnwnnbbnnnndbbbcnnncccb',
      '...ncccccccndbbddbcn...nncc',
      '....nnnnnnncbdbbccn......nc',
      '..........ncccccnn........n',
      '...........nnnnn...........',
      '...........................',
      '...........................',
    ],
    // 3
    [
      '...........................',
      '...........................',
      '..............nnnn.........',
      '.....nnnnn..nnbdbbnn.......',
      '....nbbybbnndbbbdbdbn......',
      '...nbbbbbbbnddbcccbdbnn..nn',
      '...nwnwnnbbnbccnncccbdbnnbb',
      '...ncccccccncnn..nnccbdbdbb',
      '....nnnnnnncn......ncccbbdc',
      '...........n........nnccccn',
      '......................nnnn.',
      '...........................',
      '...........................',
    ],
  ],
}

// ------------------------------------------------------------------ reared in the sleeve
// A snake reared up out of his sleeve, waiting (the anchor: where it comes
// out of the sleeve, at its foot): an S standing on end, the head up and
// facing the post, the mouth shut on its fangs; 0 the tongue flicking out,
// 1 swayed a pixel back, the tongue in (by turns: it sways). 12x12.
export const serpentCoil: FxFamily = {
  palette: SNAKE,
  anchor: [7, 11],
  frames: [
    [
      '...nnnnn....',
      '..nbbybbn...',
      '.nbbbbbbbn..',
      'rrrwnwnbbn..',
      '..ncccccbn..',
      '...nnnnbbn..',
      '....nncbdn..',
      '...ncbddbn..',
      '...ncbbnn...',
      '...ncbdnn...',
      '...ncbddbn..',
      '....nncbbn..',
    ],
    [
      '....nnnnn...',
      '...nbbybbn..',
      '..nbbbbbbbn.',
      '...rwnwnbbn.',
      '...ncccccbn.',
      '....nnnnbbn.',
      '.....ncbbdn.',
      '....ncbdbn..',
      '...ncbbbn...',
      '...ncbbdn...',
      '....ncbdbn..',
      '.....ncbbbn.',
    ],
  ],
}

// ------------------------------------------------------------------ out of the ground
// The great snake bursting up out of the floor (the anchor: its foot, on the
// ground; drawn with `sink` it rises out of the floor): an S of a body five
// pixels thick, the head big over it.
//   0  reared, jaws wide on the fangs, the forked tongue out at the post
//   1  the S coiled tighter, the head drawn back to strike, the tongue in
//   2  struck down, jaws shut (on the post's top)
// 18x24.
export const serpentRise: FxFamily = {
  palette: SNAKE,
  anchor: [11, 23],
  frames: [
    [
      '...nn.............',
      '...nbnnnn.........',
      '...nwbbbbnnn......',
      '....wnnbbbybn.....',
      'r......nnbbbbn....',
      '.rrrrrrrrrbbbn....',
      'r........nbbbn....',
      '.......nnccbbnnn..',
      '....wnnccccbnbbbn.',
      '...nwcccccnncbbdn.',
      '...nnnnnnnnccddbn.',
      '..........nccbbbn.',
      '..........nccbbdn.',
      '..........nccddbn.',
      '.........nccbbbbn.',
      '.........nccbbdn..',
      '........nccdddbn..',
      '........nccbbbn...',
      '........nccbbdn...',
      '........nccddbn...',
      '........nccbbbn...',
      '........nccbbdn...',
      '........nccdddbn..',
      '.........nccbbbbn.',
    ],
    [
      '..nn..............',
      '..nbnnnn..........',
      '..nwbbbbnnn.......',
      '...wnnbbbybn......',
      '......nnbbbbn.....',
      '........nbbbn.....',
      '........nbbbn.....',
      '......nnccbbnnn...',
      '...wnnccccbnbbbn..',
      '..nwcccccnncbbdn..',
      '..nnnnnnnccdddbn..',
      '.......nccbbbbn...',
      '.......nccbbdn....',
      '.......nccddbn....',
      '.......nccbbbn....',
      '.......nccbbdn....',
      '.......nccddbn....',
      '.......nccbbbbn...',
      '........nccbbdn...',
      '........nccdddbn..',
      '.........nccbbbn..',
      '.........nccbbdn..',
      '.........nccddbn..',
      '.........nccbbbn..',
    ],
    [
      '..................',
      '..................',
      '..................',
      '..................',
      '.....nnnnnn.......',
      '....nbbbbbbn......',
      '...nbbbyybbbn.....',
      '..nbbbbbbbbbnnn...',
      '..nwnwnwnnbbnbbn..',
      '..ncccccccccnbdn..',
      '...nnnnnnnnnddbn..',
      '.........nccbbbn..',
      '........nccbbbdn..',
      '........nccddbn...',
      '.......nccbbbbn...',
      '.......nccbbdn....',
      '.......nccddbn....',
      '.......nccbbbn....',
      '.......nccbbdn....',
      '.......nccdddbn...',
      '........nccbbbn...',
      '........nccbbbdn..',
      '.........nccddbn..',
      '.........nccbbbn..',
    ],
  ],
}

// ------------------------------------------------------------------ the long tongue
// Orochimaru's tongue, the long creepy lick (his cheer): out of the smile (the
// anchor: its root, on the mouth; placed on the 'head' with d [10, 16]) and
// down past the chin, curling (4-6 px long), outlined so it reads over his
// pale face and the cream robe.
//   0  out and down, the tip turning
//   1  all the way out, curling back up at the tip
//   2  licked along the lower lip to its corner, the tip curling up there
export const lick: FxFamily = {
  palette: pal(`r:#d8407c s:#ff9ac0`),
  anchor: [1, 0],
  outline: 0x2a0e22,
  frames: [
    ['.r.', '.rs', '.rr', '..r'],
    ['.r....', '.rs...', '.rr..r', '..rr.r', '...rr.'],
    { anchor: [1, 1], rows: ['.....r', 'rrsr.r', '.r.rr.'] },
  ],
}

// ------------------------------------------------------------------ the sleeve snake
// A little snake slithering out of his sleeve (his cheer), facing the arena:
// its diamond head and gold eye, the pale belly up its neck, a dark rim, the
// forked tongue flicking. The anchor: the cuff it comes out of (the 'hand').
//   0  the head peeping out of the cuff
//   1  half out, the neck rising off the wrist
//   2  reared up out of it in an S, the tongue flicked out
//   3  reared, swayed back a pixel, the tongue in
// (run 1, 0 backwards to slide it home). 7x6.
export const sleeveSnake: FxFamily = {
  palette: SNAKE,
  anchor: [5, 5],
  frames: [
    ['.......', '.......', '.......', '..nnn..', '.nbbyn.', 'rnccnn.'],
    ['.......', '.......', 'nnn....', 'bbyn...', 'ccnbn..', '.nnbbn.'],
    ['.nnn...', 'nbbyn..', 'rncnn..', '.nbbn..', '..ncbn.', '...nbn.'],
    ['..nnn..', '.nbbyn.', '..ncnn.', '..nbn..', '..ncbn.', '...nbn.'],
  ],
}

// ------------------------------------------------------------------ the vacuum breaking up
// The Vacuum Palm's cone of air (gentle.ts's vacuum, frame 2) breaking up
// after it lands, so it never vanishes in a frame: 0 the crescent split into
// arcs, the jet gone to a few streaks; 1 wisps where its tips were. In the
// air palette, anchored like the cone (the palm, on its axis). 11x14.
export const vacuumFade: FxFamily = {
  palette: 'air',
  anchor: [10, 7],
  frames: [
    [
      '..nb.......',
      '.nbc.......',
      'nbc........',
      'bc.....d...',
      'b..........',
      'w....c.....',
      'c.......d..',
      'c....bb....',
      'w..........',
      'b..........',
      'bc.....d...',
      'nbc........',
      '.nbc.......',
      '..nb.......',
    ],
    [
      '...........',
      '.n.........',
      'nb.........',
      '...........',
      'b..........',
      '...........',
      'c......d...',
      '...........',
      '...........',
      'b..........',
      '...........',
      'nb.........',
      '.n.........',
      '...........',
    ],
  ],
}

export const ROBE_FX: Readonly<Record<string, FxFamily>> = { serpent, serpentCoil, serpentRise, sandClimb, lick, vacuumFade, sandRipple, sandEye, sleeveSnake }
