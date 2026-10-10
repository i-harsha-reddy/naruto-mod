// Water (Kisame, Tobirama, Kakashi's copies): the water bullet and its splash,
// the jet from the hand, the Water Prison's sphere, foam on the ground, the
// wake behind a water shark. Palette 'water': foam white, pale aqua, teal,
// blue, a deep blue rim.

import type { FxFamily } from '../types.ts'

export const waterBullet: FxFamily = {
  palette: 'water',
  anchor: [3, 3],
  frames: [
    [
      '..nddn.......',
      '.dbbbbdd..d..',
      'dbwwcbbbddd.n',
      'dbwcbbbbbbbdd',
      'ndbbbbbdddd..',
      '.nddddnn..n..',
      '.............',
    ],
    [
      '..nddn....n..',
      '.dbbbbddd....',
      'dbwwcbbbbdd..',
      'dbwcbbbbbbddn',
      'ndbbbbbddd.d.',
      '.nddddn......',
      '.............',
    ],
    [
      '..nddn.......',
      '.dbbbbdd.d...',
      'dbwwcbbbdd.n.',
      'dbwcbbbbbbddd',
      'ndbbbbbbdd...',
      '.nddddnn.n...',
      '.............',
    ],
    [
      '..nddn..n....',
      '.dbbbbddd....',
      'dbwwcbbbddd..',
      'dbwcbbbbbbbbd',
      'ndbbbbbddd..n',
      '.nddddn..d...',
      '.............',
    ],
  ],
}

// The burst where water hits: a white plop, a ring of spray thrown out, then
// the drops fall (they arc down, which is what makes it water, not sparks).
// 15x13, anchor = the point of impact.
export const splash: FxFamily = {
  palette: 'water',
  anchor: [7, 6],
  frames: [
    [
      '...............',
      '.......c.......',
      '...c...b...c...',
      '....b.cwc.b....',
      '.....cwwwc.....',
      '...bcwwwwwcb...',
      '.cbcwwwwwwwcbc.',
      '...bcwwwwwcb...',
      '.....dbwbd.....',
      '....d.dbd.d....',
      '...n...d...n...',
      '.......n.......',
      '...............',
    ],
    [
      '..w.........w..',
      '..c...cwc...c..',
      '.....bcwcb.....',
      '....db...bd....',
      '...d.......d...',
      'w.db.......bd.w',
      'c.bc.......cb.c',
      '..db.......bd..',
      '...d.......d...',
      '....db...bd....',
      '.....dbbbd.....',
      '...n..nnn..n...',
      '...............',
    ],
    [
      '.w...........w.',
      '.c....w.w....c.',
      '...bb.c.c.bb...',
      '..b.........b..',
      '...............',
      '...............',
      'w.............w',
      'b.............b',
      '...............',
      '..d.........d..',
      '...dd.....dd...',
      '...............',
      '...............',
    ],
    [
      '...............',
      '...............',
      '...............',
      'w.............w',
      'c.............c',
      '......c.c......',
      '......b.b......',
      '...............',
      '...............',
      '...............',
      '.c...........c.',
      '.b...........b.',
      '..n.........n..',
    ],
  ],
}

// A jet of water from the hand to the post: it shoots out (0-2), then pours
// (3 and 4 alternate). Never a pipe: its top is a run of breaking crests,
// white-tipped and leaning the way it flows, its underside ragged and
// dripping, a flow line racing along its body, spray flung off above and
// drops falling below; 3 and 4 are the crests half a wave apart, so it
// rolls. 16x9, anchor = the root (right end), placed at 'hand'.
export const waterStream: FxFamily = {
  palette: 'water',
  anchor: [15, 4],
  frames: [
    ['................', '................', '...........w....', '...........cwwcc', '..........wbbbbw', '...........dbddc', '............n...', '................', '................'],
    ['................', '.......c........', '......wc...wc...', '......cwcbcbbwcc', '.....wbbcbbbbcbw', '......cbddbbdddc', '.......dnddn.d..', '.........n......', '................'],
    ['.c..............', '..w....c...w....', '.wcc..wcc..wc...', 'cwcbbcbbcwcbbwcc', 'wbbcbbbbbcbbbbbw', 'cbddbbbddbbddddc', '.dnddn.ddn.dd...', '..n.....n.......', '................'],
    ['.b....c.........', '..c.......w.....', '.ww..wcc.....c..', 'cwccbcbbcwcc.wcc', 'wbbbbcbbbbbcbbbw', 'cbbddbbbddbbdddc', '.ddnddn.ddndd...', '...n.....d......', '.d........n.....'],
    ['....c....b......', '.w.......c...c..', '..wcc.....wcc...', 'cwcbbcwcbbcbbwcc', 'wbcbbbbbcbbbbcbw', 'cbddbbbddbbbdddc', '.dnd.ddndd.ddn..', '.n.....d.....n..', '......n.........'],
  ],
}

// Water Prison: a sphere of water closed round the target, the post seen
// through it. A thick shadowed rim, a highlight on the lit side, bubbles
// rising inside, the surface wobbling a pixel. 15x14, anchor = bottom centre
// (it sits on the ground: round the post, at AT.postBase). waterPrisonForm:
// the water rising to close it.
export const waterPrisonForm: FxFamily = {
  palette: 'water',
  anchor: [7, 13],
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
      '...............',
      '.c...........c.',
      '.dw.........cd.',
      '..dc......ccbd.',
      '...nnddbbbdn...',
      '.....nnnnn.....',
    ],
    [
      '...............',
      '...............',
      '...............',
      '...c.......c...',
      '..wb.......bd..',
      '.dw.........bd.',
      '.dc..........d.',
      'dc............d',
      'dc............d',
      'd.............d',
      '.d..........bd.',
      '.d.........cbd.',
      '..ddd...ddbbd..',
      '...nnnnnnnnn...',
    ],
  ],
}
export const waterPrison: FxFamily = {
  palette: 'water',
  anchor: [7, 13],
  frames: [
    [
      '.....ddddd.....',
      '...ddbbbbbdd...',
      '..dcwwc....bd..',
      '.dww........bd.',
      '.dw..........d.',
      'dc............d',
      'dc............d',
      'd.............d',
      'd...........cbd',
      '.d...c......bd.',
      '.d.........cbd.',
      '..d......ccbd..',
      '...nnddbbbdn...',
      '.....nnnnn.....',
    ],
    [
      '......dddd.....',
      '...dddbbbbdd...',
      '..dcwwc....bd..',
      '.dww........bd.',
      '.dw..........d.',
      'dc............d',
      'dc............d',
      'd....c........d',
      'd...........cbd',
      '.d..........bd.',
      '.d.........cbd.',
      '..d......ccbd..',
      '...nnddbbbdn...',
      '.....nnnnn.....',
    ],
    [
      '.....ddddd.....',
      '...ddbbbbbdd...',
      '..dcwwc....bd..',
      '.dww........bd.',
      '.dw..........d.',
      'dc...c........d',
      'dc............d',
      'd.............d',
      'd...........cbd',
      '.d..........bd.',
      '.d.......c.cbd.',
      '..d......ccbd..',
      '...nnddbbbdn...',
      '.....nnnnn.....',
    ],
    [
      '.....dddd......',
      '...ddbbbbddd...',
      '..dcwwc....bd..',
      '.dww........bd.',
      '.dw..c.......d.',
      'dc............d',
      'dc............d',
      'd.............d',
      'd...........cbd',
      '.d.......c..bd.',
      '.d.........cbd.',
      '..d......ccbd..',
      '...nnddbbbdn...',
      '.....nnnnn.....',
    ],
  ],
}

export const foam: FxFamily = {
  palette: 'water',
  anchor: [6, 4],
  frames: [
    ['..ww.....w...', '.wccw..wwcw..', 'wcbbcwwcbbcw.', 'cbbdbccbddbcw', 'dddnddddnnddd'],
    ['.....ww......', 'ww.wwccw...w.', 'cwwcbbbcw.wcw', 'bccbddbbcwcbc', 'dddnddddnnddd'],
    ['.w......ww...', 'wcw...wwccw..', 'cbcw.wcbbbcww', 'bdbcwcbdddbcc', 'dddnddddnnddd'],
    ['....w.....w..', '..wwcw...wcw.', '.wcbbcww.cbcw', 'wcbddbccwbdbc', 'dddnddddnnddd'],
  ],
}

// The water trailing the shark (the shark itself is the summon sprite): its
// wake parts in two curls behind the tail and breaks into drops that fall
// behind. 16x9, anchor = the left end, where the shark's tail meets it.
export const sharkWake: FxFamily = {
  palette: 'water',
  anchor: [0, 4],
  frames: [
    [
      '...........c....',
      '....wcc......w..',
      '..wcbbbdc.......',
      'wcbbddn..c.b....',
      'bbddn.......c..w',
      'cbbddn..b.......',
      '..cbbbdd.d......',
      '....ccd......c..',
      '..........b.....',
    ],
    [
      '.............c..',
      '.....wc......b..',
      '..wccbbd..c.....',
      'wcbbdddn....b...',
      'bbddn.........c.',
      'cbbddn....b.....',
      '..cbbbdd...d....',
      '.....cd.......b.',
      '................',
    ],
    [
      '................',
      '....wcc.....c...',
      '..wcbbbd.c......',
      'wcbbdddn........',
      'bbddn.....b....c',
      'cbbddn.b........',
      '..cbbbddd.......',
      '....ccd....d....',
      '.............b..',
    ],
    [
      '..........c.....',
      '.....wc.........',
      '..wccbbdd....c..',
      'wcbbdddn...b....',
      'bbddn...c.......',
      'cbbddn.......b..',
      '..cbbbdd.b......',
      '.....cdd........',
      '...........d....',
    ],
  ],
}
