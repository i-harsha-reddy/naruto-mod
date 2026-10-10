// Lightning, Kakashi's element (the Chidori and the Raikiri): the ball in the
// palm, the first sparks gathering, the wake it tears on the dash, and what
// is left spitting off the hand after the hit. All in the 'volt' palette;
// another element's sparks are the same frames in another (a Rasengan's in
// 'aura'). And Kakashi's own payoffs (registered through flash.ts's VEST_FX):
// the Raikiri's burst through the post, his Kamui's warp, and the twinkle of
// a training post sent into orbit.

import type { FxFamily } from '../types.ts'

// The ball of lightning in his hand: a steady white core (so it never
// jitters) and arcs that leap off it, never the same twice in a row. 13 x 9,
// anchor = the core. Played with f 'cycle'.
export const chidori: FxFamily = {
  palette: 'volt',
  anchor: [6, 4],
  frames: [
    [
      '..........n..',
      '.........d...',
      '..n......b...',
      '.dd.bcwcb....',
      'n..bbwwwb....',
      '....bcwcbd...',
      '.....b....dn.',
      '....d........',
      '...n.........',
    ],
    [
      '..n..........',
      '...d...d.....',
      '...b..b......',
      '....bcwc..dd.',
      '....bwwwbb..n',
      '....bcwcb....',
      '..ddb..b.....',
      '.n.....d.....',
      '........n....',
    ],
    [
      '..........n..',
      '........bd...',
      'nd.....b.....',
      '..dbbcwcb..d.',
      '....bwwwb....',
      '....bcwcb....',
      '.....b...bd..',
      '.....d....bn.',
      '....n........',
    ],
    [
      '....n........',
      '.d..d.......n',
      '.....b....dd.',
      '....bcwcbb...',
      '....bwwwb....',
      '..bbbcwcb....',
      '.nd....bb....',
      '........dd...',
      '..........n..',
    ],
  ],
}

// the first sparks gathering in the palm, before the ball forms (5 x 5, 7 x 7)
export const chidoriBuild: FxFamily = {
  palette: 'volt',
  anchor: [2, 2],
  frames: [
    { anchor: [2, 2], rows: ['d...b', '..c..', '.cwc.', '..c..', 'b..d.'] },
    { anchor: [3, 3], rows: ['.n...d.', '..b.b..', '...c...', 'dbcwcb.', '...c...', '..b..b.', '.d....n'] },
  ],
}

// The bolt the Chidori tears behind it on the dash: anchor at the left (the hand).
export const streak: FxFamily = {
  palette: 'volt',
  anchor: [0, 3],
  frames: [
    [
      '........d................',
      '.......b.................',
      '.....wwcc........dd......',
      'wwwwwcb..cb.....d..dn....',
      'cccb.......bbbbd.........',
      '..............d..........',
      '...............n.........',
    ],
    [
      '.........................',
      '.........................',
      '.....bcb.........d.......',
      'cbcc....b.......d.dn.....',
      '.........bbdd............',
      '.........................',
      '.........................',
    ],
    [
      '.........................',
      '.........................',
      '......bd.................',
      '.bd..............d.......',
      '...........dn............',
      '.........................',
      '.........................',
    ],
  ],
}

// What is left of the Chidori after the hit: sparks spitting off the hand. 7 x 7.
export const sparks: FxFamily = {
  palette: 'volt',
  anchor: [3, 3],
  frames: [
    ['.d...b.', '..b.c..', 'n..cwc.', '..bcwcb', '...cb..', '.b...d.', 'd......'],
    ['....d..', '.b.....', '...c..b', '..cwc..', '.b.c...', '.....n.', '..d....'],
    ['.......', '....n..', '.d.....', '...c...', '.....d.', '..n....', '.......'],
  ],
}

// The Raikiri flaring in the palm as he strains against it (the charge's
// accents): the ball swollen to a 5 x 5 white-hot core, its arcs thrown twice
// as far, then easing back toward the ball's size. 19 x 13, anchor = the
// core (the hand), like the chidori's.
//   0 the flare at its biggest   1 easing back, the arcs breaking off
export const raikiriFlare: FxFamily = {
  palette: 'volt',
  anchor: [9, 6],
  frames: [
    [
      '.........n.........',
      '..n......d.....n...',
      '...d.....b....d....',
      '....bd..bcb..b.....',
      '.......bcwcb....dn.',
      'nd...bccwwwccb.....',
      '..ddbcwwwwwwwcbdd..',
      '.....bccwwwccb...dn',
      '.n.d..bbcwcbb......',
      '....d...bcb..bd....',
      '...b.....b.....d...',
      '..n......d......n..',
      '.........n.........',
    ],
    [
      '...................',
      '...n.....n.........',
      '....d....d....dn...',
      '.....b...b...b.....',
      '........bcb........',
      '.d....bcwwwcb...d..',
      'n.ddbbcwwwwwcbbdd.n',
      '......bcwwwcb......',
      '..d.....bcb..b.....',
      '...b.....b....d....',
      '..n......d.....n...',
      '.........n.........',
      '...................',
    ],
  ],
}

// THE RAIKIRI'S BLOW: the ball driven through the post bursts, the biggest
// frame of the move. A white-hot lens punched through the wood and out its
// far side, its arcs thrown out up, down and back through the post, none up
// past the fist (his face stays clear). 19 x 15, anchor = the core at the
// fist ('hand', on the strike). Three tones and no lone light pixel.
//   0 the burst (hit-stop)   1 breaking, the arcs flung further   2 a last lens
export const raikiriBurst: FxFamily = {
  palette: 'volt',
  anchor: [13, 8],
  frames: [
    [
      '.b........b........',
      '..b.......b........',
      '..cb.....cb........',
      '...c..b..c.........',
      '....c..cc.c........',
      'bb..cc.cwc.........',
      '..cc..ccwwc........',
      'b...ccwwwwwwcc.....',
      '.cccwwwwwwwwwwwcc..',
      'b...ccwwwwwwcc.....',
      '..cc..ccwwc........',
      'bb..cc.cwc...c.....',
      '....c..cc....cb....',
      '...c..b.......b....',
      '..b...........b....',
    ],
    [
      'b.........b........',
      '.b........b........',
      '.cb......cb........',
      '..c......c.........',
      '...c....c..........',
      'b...c..cc..........',
      '.bb..ccwwc.........',
      '...cccwwwwcc.......',
      'cccc.cwwwwwcc.c....',
      '...cccwwwwcc.......',
      '.bb..ccwwc.........',
      'b...c..cc..........',
      '...c....c.....c....',
      '..b......c....cb...',
      '.b.......b.....b...',
    ],
    [
      '...................',
      'b..................',
      '.b.......b.........',
      '.c.......c.........',
      '...................',
      '...................',
      '.......ccc.........',
      'bb....cwwwc........',
      '..cc..cwwwc..c.....',
      'bb....cwwwc........',
      '.......ccc.........',
      '...................',
      '...c...........c...',
      '..b............b...',
      '.b.................',
    ],
  ],
}

// KAMUI'S WARP, Kakashi's (Obito's is fx/kamui.ts): two arms of pale light
// wound round a void, a comma's sharp leading edge, spinning an eighth of a
// turn a frame and GROWING as it wrings the post into its eye: 13 across
// on the aim, 15 as he strains, 17 on the last wrench, then tight and shut.
// Drawn in front of the post, so its wood is seen pinched into the eye
// between the arms. Palette 'warp' (v the void, d b c the light dim to
// bright). Each frame anchored on its eye; placed at the post's middle.
//   0-3 13 x 11, an eighth a frame   4-7 15 x 13   8-11 17 x 13
//   12 closing tight (9 x 9)         13 shut: the last spark
export const kamuiWarp: FxFamily = {
  palette: 'warp',
  anchor: [6, 5],
  frames: [
    {
      anchor: [6,5],
      rows: [
        '.............',
        '...dddd......',
        '..d...cb.....',
        '.d.....cb....',
        '.d..ccv.cb...',
        'd..bcvvvcb..d',
        '...bc.vcc..d.',
        '....bc.....d.',
        '.....bc...d..',
        '......dddd...',
        '.............',
      ],
    },
    {
      anchor: [6,5],
      rows: [
        '.............',
        '..dddddd.....',
        '........d....',
        '.....cc.cb...',
        '....bcvc.cb..',
        '...bcvvvcb...',
        '..bc.cvcb....',
        '...bc.cc.....',
        '....d........',
        '.....dddddd..',
        '.............',
      ],
    },
    {
      anchor: [6,5],
      rows: [
        '......dd.....',
        '........d....',
        '.....bc..d...',
        '...bbcb...d..',
        '..bc..vc...d.',
        '..dccvvvccd..',
        '.d...cv..cb..',
        '..d...bcbb...',
        '...d..cb.....',
        '....d........',
        '.....dd......',
      ],
    },
    {
      anchor: [6,5],
      rows: [
        '.............',
        '..........d..',
        '....bbb....d.',
        '...dc.cb...d.',
        '..d..cvcc..d.',
        '.d..cvvvc..d.',
        '.d..ccvc..d..',
        '.d...bc.cd...',
        '.d....bbb....',
        '..d..........',
        '.............',
      ],
    },
    {
      anchor: [7,6],
      rows: [
        '...............',
        '.....dd........',
        '...dd..db......',
        '..d.....cb.....',
        '.d....cc.cb....',
        '.d...ccv..cb...',
        'd...bcvvvcb...d',
        '...bc..vcc...d.',
        '....bc.cc....d.',
        '.....bc.....d..',
        '......bd..dd...',
        '........dd.....',
        '...............',
      ],
    },
    {
      anchor: [7,6],
      rows: [
        '...............',
        '...dddddd......',
        '..d......d.....',
        '.........cd....',
        '.....bcc..cb...',
        '....bc.vc..cb..',
        '...bc.vvv.cb...',
        '..bc..cv.cb....',
        '...bc..ccb.....',
        '....dc.........',
        '.....d......d..',
        '......dddddd...',
        '...............',
      ],
    },
    {
      anchor: [7,6],
      rows: [
        '.......dd......',
        '.........dd....',
        '...........d...',
        '....bbbb....d..',
        '...bc..cc...d..',
        '..bc...vcc..d..',
        '..dc.cvvvc.cd..',
        '..d..ccv...cb..',
        '..d...cc..cb...',
        '..d....bbbb....',
        '...d...........',
        '....dd.........',
        '......dd.......',
      ],
    },
    {
      anchor: [7,6],
      rows: [
        '...............',
        '...............',
        '....bbbb....d..',
        '...d...cb....d.',
        '..d.....cb...d.',
        '.d....cv.cc..d.',
        '.d...cvvvc...d.',
        '.d..cc.vc....d.',
        '.d...bc.....d..',
        '.d....bc...d...',
        '..d....bbbb....',
        '...............',
        '...............',
      ],
    },
    {
      anchor: [8,6],
      rows: [
        '.................',
        '.....dddd........',
        '...dd...cdb......',
        '..d.......cb.....',
        '.d....ccc..cb....',
        '.d...cc.vc.cb....',
        'd...bc.vvv.cb...d',
        '....bc.cv.cc...d.',
        '....bc..ccc....d.',
        '.....bc.......d..',
        '......bdc...dd...',
        '........dddd.....',
        '.................',
      ],
    },
    {
      anchor: [8,6],
      rows: [
        '.................',
        '...dddddddd......',
        '..d........d.....',
        '......bcc...d....',
        '.....bc.cc..cb...',
        '....bc..vcc.cb...',
        '...bc..vvv..cb...',
        '...bc.ccv..cb....',
        '...bc..cc.cb.....',
        '....d...ccb......',
        '.....d........d..',
        '......dddddddd...',
        '.................',
      ],
    },
    {
      anchor: [8,6],
      rows: [
        '........dd.......',
        '..........dd.....',
        '............d....',
        '.....bbbbb...d...',
        '....bc...cc...d..',
        '...bc...v.cc..d..',
        '..d...cvvvc...d..',
        '..d..cc.v...cb...',
        '..d...cc...cb....',
        '...d...bbbbb.....',
        '....d............',
        '.....dd..........',
        '.......dd........',
      ],
    },
    {
      anchor: [8,6],
      rows: [
        '.................',
        '.................',
        '.....bbbb.....d..',
        '....dc..cbb....d.',
        '...d......cb...d.',
        '..d...ccv..cc..d.',
        '.d...ccvvvcc...d.',
        '.d..cc..vcc...d..',
        '.d...bc......d...',
        '.d....bbc..cd....',
        '..d.....bbbb.....',
        '.................',
        '.................',
      ],
    },
    {
      anchor: [4,4],
      rows: [
        '.........',
        '...bbd...',
        '..c...d..',
        '.c..v..d.',
        '.b.vvv.b.',
        '.d..v..c.',
        '..d...c..',
        '...dbb...',
        '.........',
      ],
    },
    {
      anchor: [2,2],
      rows: [
        '..c..',
        '.cbc.',
        'cbvbc',
        '.cbc.',
        '..c..',
      ],
    },
  ],
}

// A TWINKLE in the sky where a training post went into orbit (Kakashi's
// Thousand Years of Death): a gold glint, the four-pointed star, its cross,
// a fading spark. 7 x 7, anchor = its middle, in the 'hit' palette.
export const twinkle: FxFamily = {
  palette: 'hit',
  anchor: [3, 3],
  frames: [
    ['.......', '.......', '...c...', '..cwc..', '...c...', '.......', '.......'],
    ['...b...', '.b.c.b.', '..ccc..', 'bccwccb', '..ccc..', '.b.c.b.', '...b...'],
    ['.......', '...c...', '...c...', '.ccwcc.', '...c...', '...c...', '.......'],
    ['.......', '.......', '...b...', '..bcb..', '...b...', '.......', '.......'],
  ],
}
