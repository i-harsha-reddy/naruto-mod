// Sasuke's Chidori, its own (Kakashi's Raikiri is lightning.ts's chidori):
// the "thousand birds" chirping in his hand. A white-hot knot in the palm,
// short bolts forking out of it, and at the end of each a spark the shape of
// a bird in flight (gull wings arched over a white body, a smaller one, a
// V), flitting to new places every frame. 21 x 13, anchored on the knot;
// palette 'volt'. Placed at 'hand' (cycle it): nothing else in the library
// looks like it, so it never reads as the Raikiri.

import type { FxFamily } from '../types.ts'
import { rasenCharge } from './wind.ts'

export const chidoriBirds: FxFamily = {
  palette: 'volt',
  anchor: [10, 6],
  frames: [
    [
      '.cc...cc.............',
      'c..c.c..c............',
      '....w..........cc.cc.',
      '.......d.......d.w...',
      '........d....dd......',
      '.........bcbd........',
      '........bcwcb........',
      '........dbcb.........',
      '......dd....d........',
      '.....d.......d.......',
      '.cc.cc.......c.c.....',
      '...w..........w......',
      '.....................',
    ],
    [
      '.............cc...cc.',
      '...cc.cc....c..c.c..c',
      '.....w..........w....',
      '......d.......d......',
      '.......d.....d.......',
      '........dcwcd........',
      '........cwwwc........',
      '......dddcwcd........',
      'c.cddd.......d.......',
      '.w............d......',
      '............cc...cc..',
      '...........c..c.c..c.',
      '...............w.....',
    ],
    [
      '....c.c..............',
      '.....w...............',
      '......d..............',
      '.......d.............',
      '........d............',
      '.........bcb....cc.cc',
      '........bcwcbdddd.w..',
      '.......ddbcb.........',
      '..cc.ddcc...d........',
      '.c..c.c..c..d........',
      '.....w.......d.......',
      '............cc.cc....',
      '..............w......',
    ],
    [
      '.............c.c.....',
      '..cc...cc.....w......',
      '.c..c.c..c...d.......',
      '.....w......d........',
      '......dd....d........',
      '........dcwc.........',
      '........cwwwc........',
      '.........cwcdd.......',
      '........d.....dcc.cc.',
      '.......d.........w...',
      '....c.c..............',
      '.....w...............',
      '.....................',
    ],
  ],
}

// The Kusanagi's cut (the Chidori Katana's): a straight slash of light
// across the post, rising to the left (flipped, the cut back, falling), a
// white edge in a pale-blue glow, never an arc (an arc beside the drawn
// blade read as a bow and arrow): 0 the stroke, 1 thinning to its glow, 2
// two short dashes of it left. 15 x 5, anchored on its middle; palette
// 'volt'; placed at 'post'.
export const kusanagiCut: FxFamily = {
  palette: 'volt',
  anchor: [7, 2],
  frames: [
    [
      'wwc............',
      'cwwwcc.........',
      '...cwwwcc......',
      '......cwwwcc...',
      '.........ccwwc.',
    ],
    [
      'cc.............',
      '.ccbb..........',
      '....cccbb......',
      '.......ccbb....',
      '..........bcc..',
    ],
    [
      '...............',
      '.bb............',
      '...............',
      '........bb.....',
      '...............',
    ],
  ],
}

// The birds being born (Sasuke's Chidori charge, between chidoriBuild and
// the birds): the white knot, short forks crackling out of it, and the first
// two chirps, small V's at their tips, in new places each frame (alternate
// them). 11 x 9, anchored on the knot; palette 'volt'.
export const chidoriChirp: FxFamily = {
  palette: 'volt',
  anchor: [6, 4],
  frames: [
    [
      '...........',
      '.c.c....d..',
      '..w....d...',
      '...d.bcd...',
      '....bcwcb..',
      '.....bcbd..',
      '....d....d.',
      '...d....c.c',
      '.........w.',
    ],
    [
      '......c.c..',
      '.......w...',
      '.d....d....',
      '..d..bcd...',
      '...dbcwcb..',
      '.....bcb...',
      '.c.c..d.d..',
      '..w......d.',
      '...........',
    ],
  ],
}

// the jacket team's own effects, besides the birds, registered in fx/index.ts
// (Naruto's Rasengan charge, drawn in wind.ts, rides here too)
export const SASUKE_FX: Readonly<Record<string, FxFamily>> = { kusanagiCut, chidoriChirp, rasenCharge }
