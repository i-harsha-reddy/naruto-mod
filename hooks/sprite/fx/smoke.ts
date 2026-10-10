// Smoke: the poof a post (or a ninja, or a summoned animal) appears and
// vanishes in, the little sigh of a fizzled jutsu, and the wisps left
// drifting up after an arrival. Palette 'smoke' ('ink' for the sigh).

import type { FxFamily } from '../types.ts'

// The poof: a puff, the full cloud, the cloud parting into a ring, puffs,
// wisps. 15 x 13, anchor = bottom centre (it sits on the ground).
export const smoke: FxFamily = {
  palette: 'smoke',
  anchor: [7, 12],
  frames: [
    [
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '......ccb......',
      '.....cwwcb.....',
      '....cwwwccb....',
      '....bccccbd....',
      '.....dbbbd.....',
    ],
    [
      '...............',
      '...............',
      '...............',
      '.....ccb.......',
      '....cwwcb.cc...',
      '..cccwwccbwwcb.',
      '.cwwcwwccbwccbd',
      '.cwwwccbbbccbbd',
      'cwwwccbbcwwcbd.',
      'bccccbbbcwccbbd',
      '.bbbbddbbbbbdd.',
      '..ddd.ndddddn..',
      '...............',
    ],
    [
      '....ccb...cc...',
      '...cwwcb.cwwc..',
      '.cccwccbbcwcbd.',
      'cwwccbbdbbccbbd',
      'cwcbb.....bbbd.',
      'bcbd.......dbd.',
      '.bd.........bd.',
      'cwcb.......cwcb',
      'cwccb.....cwcbd',
      'bcccbbd.dbbccbd',
      '.bbbddn.ndbbdd.',
      '..ddn.....nddn.',
      '...............',
    ],
    [
      '...cc......cc..',
      '..cwcb....cwcb.',
      '..bcbd....bcbd.',
      '...dd......dd..',
      '...............',
      'cc...........cc',
      'wcb.........cwc',
      'cbd.........bcb',
      '.d...........d.',
      '...............',
      '.cc.........cc.',
      'cwcb.......cwcb',
      '.bdd.......bdd.',
    ],
    [
      '..cb.......bc..',
      '...d.......d...',
      '...............',
      '...............',
      'cb...........bc',
      '.d...........d.',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
    ],
  ],
}

// A sorry little puff out of the hands (a fizzle), and a sigh. 5 x 3,
// anchor = its left middle.
export const sigh: FxFamily = {
  palette: 'ink',
  anchor: [0, 2],
  frames: [
    ['.cc..', 'cwwc.', '.cc..'],
    ['..cc.', '.cwwc', '..cd.'],
    ['...d.', '..d.d', '.....'],
  ],
}

// The last of an arrival's cloud: two wisps curling up past the shoulders,
// either side of the head, thinning out as they rise. 27 x 8, anchor =
// bottom centre (placed at the head's neck).
export const wisp: FxFamily = {
  palette: 'smoke',
  anchor: [13, 7],
  frames: [
    [
      '...........................',
      '...........................',
      '...........................',
      '...........................',
      '.cb.....................bc.',
      'cwcb...................bcwc',
      'bccd...................dccb',
      '.dd.....................dd.',
    ],
    [
      '...........................',
      '...........................',
      '.cb.....................bc.',
      'cwcb...................bcwc',
      '.bd.....................db.',
      '...........................',
      '...........................',
      '...........................',
    ],
    [
      '.c.......................c.',
      'cbd.....................dbc',
      '.d.......................d.',
      '...........................',
      '...........................',
      '...........................',
      '...........................',
      '...........................',
    ],
  ],
}

// A fizzled charge breaking apart (the shared fizzle's first two frames, at
// the hand where the chakra was gathered): the ball split in four chunks
// round a last spark, then the chunks flung apart, smaller, with a speck of
// smoke where it was. Drawn in 'volt''s letters, for `pal: 'chakra'` to turn
// it the ninja's own chakra (a Rasengan's blue, a Chidori's white, Guy's red).
// 9 x 9 and 11 x 11, anchor = the middle.
export const breakup: FxFamily = {
  palette: 'volt',
  anchor: [4, 4],
  frames: [
    ['.........', '..cc.bc..', '.cwc.cwb.', '.cc...cb.', '....w....', '.bc...cc.', '.bwc.cwc.', '..cb.cc..', '.........'],
    {
      anchor: [5, 5],
      rows: ['.c.........', '..wb.....c.', '..bd....wb.', '.........d.', '...........', '.....n.....', '...........', '.d.........', '.bw.....d..', '..c....bwc.', '.........c.'],
    },
  ],
}
