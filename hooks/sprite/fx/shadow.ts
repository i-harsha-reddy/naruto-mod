// Shadow (Shikamaru): his shadow run along the floor to the post and pooled
// under it, the post bound by it (two tapered tendrils crossing up its face),
// a shadow hand climbing it to throttle it, three shadow spikes run through
// it. Every shape is SOLID: a near-black indigo body with a 1 px violet rim
// along its lit edge (the top, and the left of an upright spike), two tones
// and nothing else: no lilac glints, no lone light pixels, no speckle. The
// rim is what reads on a dark stage, the dark body is what it means. And on
// a short stage (9-11 rows: the floor's bottom rows hidden) the bind still
// reads above row 18: the tendrils and spikes climb the post.

import { pal } from '../grid.ts'
import type { FxFamily } from '../types.ts'

// n the shadow on the floor (a deep indigo, not the terminal's own black,
// which would vanish on a dark stage), d what rises out of it (a tendril, a
// hand, a spike: a shade lighter, so it stands off the pool it grows from),
// r the rim along either's lit edge: a light lilac, a full step up from
// the indigo, so the 1 px top edge reads on a dark stage
const SHADOW = pal(`n:#2c2058 d:#3d2d7c r:#a68cf4`)

// ------------------------------------------------------------------ the shadow line
// His shadow run out from under his feet along the floor to the post and
// pooled under it. Anchor [34, 7] = his root on the ground (the anim places
// it at [HOME, GROUND], behind everything); the grid covers stage x 1-46,
// rows 16-23. The band is 4 px: a violet rim over three rows of indigo, its
// end sloped under his heels; while it travels it tapers to a point. At the
// post it swells into a solid pool 7 px deep (the post stands in it), its
// rim arched over the band's.
//   0      a pool at his feet, its lip pushing left
//   1 2 3  creeping: the point at x 20, 14, 9 (3: at the post's foot, the
//          pool starting to rise there, 5 px)
//   4      arrived: the pool under the post, 7 px deep, x 1-18
//   5 6 7  held, the bound loop: the pool breathing (6 swelled to 8 px, 7
//          easing back). Play them by index (5 + t % 3); 'cycle' would run
//          the creep too.
export const shadowLine: FxFamily = {
  palette: SHADOW,
  anchor: [34, 7],
  frames: [
    // 0 a pool at his feet, its lip pushing left
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................rrrrrrrrrr......',
      '.............................rnnnnnnnnnnr.....',
      '............................rnnnnnnnnnnnnr....',
      '...........................rnnnnnnnnnnnnnn....',
    ],
    // 1 creeping: the lit point out front
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '......................rrrrrrrrrrrrrrrrrr......',
      '.....................rnnnnnnnnnnnnnnnnnnr.....',
      '....................rnnnnnnnnnnnnnnnnnnnnr....',
      '...................rnnnnnnnnnnnnnnnnnnnnnn....',
    ],
    // 2
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '..............................................',
      '................rrrrrrrrrrrrrrrrrrrrrrrr......',
      '...............rnnnnnnnnnnnnnnnnnnnnnnnnr.....',
      '..............rnnnnnnnnnnnnnnnnnnnnnnnnnnr....',
      '.............rnnnnnnnnnnnnnnnnnnnnnnnnnnnn....',
    ],
    // 3 at the post's foot (the shout)
    [
      '..............................................',
      '..............................................',
      '..............................................',
      '.....rrrrrrrr.................................',
      '....rnnnnnnnnrrrrrrrrrrrrrrrrrrrrrrrrrrr......',
      '....nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr.....',
      '....nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr....',
      '....nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn....',
    ],
    // 4 arrived: pooled under the post, 7 px deep, a glint on its far lip
    [
      '..............................................',
      '....rrrrrrrrrr................................',
      '..rrnnnnnnnnnnrr..............................',
      '.rnnnnnnnnnnnnnnr.............................',
      'rnnnnnnnnnnnnnnnnrrrrrrrrrrrrrrrrrrrrrrr......',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr.....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn....',
    ],
    // 5 held: the bound loop (5 6 7), a glint riding the rim toward the post
    [
      '..............................................',
      '....rrrrrrrrrr................................',
      '..rrnnnnnnnnnnrr..............................',
      '.rnnnnnnnnnnnnnnr.............................',
      'rnnnnnnnnnnnnnnnnrrrrrrrrrrrrrrrrrrrrrrr......',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr.....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn....',
    ],
    // 6 the pool swelled a row
    [
      '.....rrrrrrrr.................................',
      '..rrrnnnnnnnnrrr..............................',
      '.rnnnnnnnnnnnnnnr.............................',
      '.nnnnnnnnnnnnnnnn.............................',
      'rnnnnnnnnnnnnnnnnrrrrrrrrrrrrrrrrrrrrrrr......',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr.....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn....',
    ],
    // 7 easing back
    [
      '..............................................',
      '....rrrrrrrrrr................................',
      '..rrnnnnnnnnnnrr..............................',
      '.rnnnnnnnnnnnnnnr.............................',
      'rnnnnnnnnnnnnnnnnrrrrrrrrrrrrrrrrrrrrrrr......',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr.....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnr....',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn....',
    ],
  ],
}

// ------------------------------------------------------------------ the bind
// The post possessed: two tendrils of shadow climbing up out of the pool at
// its foot, one from either side, 3 px thick where they leave the pool and
// tapering to a point, crossed over its face (the one from his side in
// front) and on up to the crown, where the tips curl over its corners; the
// rim along each one's top edge. 14 x 14, anchor = the post's foot
// (AT.postBase): stage x 3-16, rows 10-23. Drawn in front of the post.
//   0 rising out of the pool   1 the lower half, up to where they cross
//   2 up to the crown   3 squeezed (the tips curled a pixel further over):
//   hold on 2 and 3 alternately   4 the lower half squeezed (hold 1 and 4
//   while the post's top is free to move: the mimic)
export const shadowBind: FxFamily = {
  palette: SHADOW,
  anchor: [7, 13],
  frames: [
    // 0 rising out of the pool
    [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '....rr..rr....',
      '...rdd..ddr...',
      '..rdd....ddr..',
    ],
    // 1 the lower half: up to where they cross
    [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '......rr......',
      '.....rddr.....',
      '....rd..dr....',
      '...rdd..ddr...',
      '..rdd....ddr..',
    ],
    // 2 up to the crown, crossed over its face
    [
      '..............',
      '..............',
      '..............',
      '..............',
      '..r........r..',
      '..dr......rd..',
      '...dr....rd...',
      '....dr..rd....',
      '.....drrd.....',
      '......dr......',
      '.....rddr.....',
      '....rd..dr....',
      '...rdd..ddr...',
      '..rdd....ddr..',
    ],
    // 3 squeezed: the tips curled a pixel further over
    [
      '..............',
      '..............',
      '..............',
      '.r..........r.',
      '.d..........d.',
      '.drr......rrd.',
      '...dr....rd...',
      '....dr..rd....',
      '.....drrd.....',
      '......dr......',
      '.....rddr.....',
      '....rd..dr....',
      '...rdd..ddr...',
      '..rdd....ddr..',
    ],
    // 4 the lower half, squeezed
    [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '.....rrrr.....',
      '.....rddd.....',
      '....rd..dr....',
      '...rdd..ddr...',
      '..rdd....ddr..',
    ],
  ],
}

// Dark tongues rising off the pool either side of the post, two at a time:
// a solid 2 px flame of indigo with its rim, lifting off and thinning to a
// short dark dash as it goes. 20 x 10, anchor = the post's foot
// (AT.postBase): stage x 0-19, rows 14-23. Played by index (i % 4).
export const shadowWisp: FxFamily = {
  palette: SHADOW,
  anchor: [10, 9],
  frames: [
    [
      '....................',
      '....................',
      '...r............r...',
      '..rd............rd..',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '....................',
      '...r............r...',
      '..rd............rd..',
      '..rd............rd..',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '..r..............r..',
      '..rd............rd..',
      '...d............d...',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '..dd............dd..',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
  ],
}

// ------------------------------------------------------------------ neck bind
// A shadow hand climbing out of the pool up the post's near side, where the
// line arrived: the fingers first, then the open hand on its arm, three
// fingers hooked over the crown, and closing round the post's neck: two
// tapered fingers wrapped across its face, a pixel thick at the tips and
// two at the knuckles, the tips curled round the far edge, the wood showing
// between them and the crown free above them. Solid indigo with a lilac
// rim along the lit top and left edges.
//   0 the fingers out of the pool   1 the open hand climbing   2 hooked
//   over the crown   3 closed round the neck   4 the squeeze (dug a pixel
//   further round, the knuckles bulging)
// 14 x 14 from stage row 10 to the ground; anchor = the post's foot
// (AT.postBase). Drawn in front of the post.
export const shadowHands: FxFamily = {
  palette: SHADOW,
  anchor: [7, 13],
  frames: [
    [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..........r...',
      '.........rdr..',
      '.........rddr.',
      '........rddddr',
      '........rddddd',
    ],
    [
      '..............',
      '..............',
      '........r.r...',
      '.......rdrdr..',
      '.......rddddr.',
      '........rddd..',
      '.........rdd..',
      '..........rd..',
      '..........rd..',
      '..........rdd.',
      '.........rddd.',
      '.........rddd.',
      '........rddddd',
      '.......rdddddd',
    ],
    [
      '...r..r..r....',
      '..rd.rd.rdr...',
      '...d..d.rddr..',
      '.......rdddr..',
      '........rddr..',
      '.........rdd..',
      '..........rd..',
      '..........rd..',
      '..........rd..',
      '..........rdd.',
      '.........rddd.',
      '.........rddd.',
      '........rddddd',
      '.......rdddddd',
    ],
    [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '......rrrrr...',
      '...rrrdddddrr.',
      '...r......rddr',
      '.......rrrrddr',
      '....rrrddddddr',
      '....r.....rdd.',
      '.........rddd.',
      '........rddddd',
      '.......rdddddd',
    ],
    [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '.....rrrrrrr..',
      '..rrrddddddddr',
      '..r.......rddd',
      '..r...rrrrrddd',
      '...rrrdddddddr',
      '...r......rdd.',
      '.........rddd.',
      '........rddddd',
      '.......rdddddd',
    ],
  ],
}

// ------------------------------------------------------------------ shadow sewing
// Three spikes of shadow stabbing up out of the pool: the middle one up
// through the post (in at its foot, a dark seam up its face, unbroken to the
// needle out over its crown); the others either side of it, leaning out, 4 px
// thick at the pool and tapering to a point. Upright, so each is lit down
// its left edge as well as its top.
//   0 knots: the pool bulging where they will burst out   1 bursting up,
//   the points level with the rope   2 run through   3 stabbed a pixel
//   further: pulled taut (hold on 2 and 3)
// 18 x 16, anchor = the post's foot (AT.postBase): stage x 1-18, rows 8-23.
// Drawn in front of the post, with the shadowLine pooled under it; a cel
// that hauls the post (pdx) moves it with the post (d).
export const shadowStitch: FxFamily = {
  palette: SHADOW,
  anchor: [9, 15],
  frames: [
    // 0 knots: the pool bulging where they will burst out
    [
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..rrrr..rr..rrrr..',
      '..rddd.rddr.rddd..',
      '..rddd.rddd.rddd..',
    ],
    // 1 bursting up out of it, the points level with the rope
    [
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      'r................r',
      'rr......r.......rd',
      '.rr.....rd.....rd.',
      '.rd....rdd.....rd.',
      '.rdr...rddd...rdd.',
      '.rdd...rddd...rdd.',
      '..rdr..rddd..rdd..',
    ],
    // 2 run through: the middle one up through the wood (a dark seam up its
    // face, the wood either side of it) and out over the crown, the others
    // either side
    [
      '........r.........',
      '........r.........',
      '........rr........',
      '........rd........',
      '........rd........',
      'r........d.......r',
      'rr.......d......rd',
      '.rr......d.....rd.',
      '.rd......d.....rd.',
      '.rdr.....d....rdd.',
      '.rdd....rd....rdd.',
      '..rdr...rd...rdd..',
      '..rdd..rdd...rdd..',
      '..rddr.rddd.rddd..',
      '..rddd.rddd.rddd..',
      '..rddd.rddd.rddd..',
    ],
    // 3 stabbed a pixel further: pulled taut
    [
      '........r.........',
      '........rr........',
      '........rd........',
      '........rd........',
      'r........d.......r',
      'rr.......d......rd',
      '.rr......d.....rd.',
      '.rd......d.....rd.',
      '.rdr.....d....rdd.',
      '.rdd....rd....rdd.',
      '..rdr...rd...rdd..',
      '..rdd..rdd...rdd..',
      '..rddr.rddd.rddd..',
      '..rddd.rddd.rddd..',
      '..rddd.rddd.rddd..',
      '..rddd.rddd.rddd..',
    ],
  ],
}
