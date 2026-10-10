// Kamui: a warp opened on the post at a distance, a single arm of pale light
// wound round a void, spinning faster as it wrings the post into its eye,
// then snapping shut. Palette 'warp': v the void, n deep violet, d dim, b c w
// the light from dim to white-hot. Each frame is anchored on the eye; placed
// at 'post'. Frames:
//   0 the first pinprick      1 opening: a small swirl
//   2-5 the swirl, a quarter-turn a frame (play 2,3,4,5 in turn: f 'cycle'
//       through `spin`)       6 closing tight      7 shut: the last spark
// The snap after it is impact.ts's star in 'warp'.

import { pal } from '../grid.ts'
import type { FxFamily } from '../types.ts'

export const vortex: FxFamily = {
  palette: 'warp',
  anchor: [6, 6],
  frames: [
    { anchor: [2, 2], rows: ['.....', '..d..', '.dvd.', '..d..', '.....'] },
    {
      anchor: [4, 4],
      rows: [
        '.........',
        '...ddd...',
        '..b...dd.',
        '.b.nvn..d',
        '.b.vvvw.d',
        '.bc.nvw..',
        '..cww....',
        '.........',
        '.........',
      ],
    },
    [
      '.............',
      '.....bbbb....',
      '...bbb..ddd..',
      '...b......dd.',
      '..bb.......d.',
      '..b..nvn...dd',
      '..b..vvvw...d',
      '..cc.nvnw...d',
      '...cc..ww..nn',
      '....ccww...n.',
      '..........nn.',
      '..........n..',
      '.............',
    ],
    [
      '.............',
      '.............',
      '.....cbbb....',
      '....cc..bbb..',
      '...cc.....b..',
      '...c.nvn..bb.',
      '...w.vvv...b.',
      '...wwnvn...b.',
      '....www...db.',
      '..........d..',
      '.nn......dd..',
      '..nnn..ddd...',
      '....nddd.....',
    ],
    [
      '.............',
      '..n..........',
      '.nn..........',
      '.n...wwcc....',
      'nn..ww..cc...',
      'd...wnvn.cc..',
      'd...wvvv..b..',
      'dd...nvn..b..',
      '.d.......bb..',
      '.dd......b...',
      '..ddd..bbb...',
      '....bbbb.....',
      '.............',
    ],
    [
      '.....dddn....',
      '...ddd..nnn..',
      '..dd......nn.',
      '..d..........',
      '.bd...www....',
      '.b...nvnww...',
      '.b...vvv.w...',
      '.bb..nvn.c...',
      '..b.....cc...',
      '..bbb..cc....',
      '....bbbc.....',
      '.............',
      '.............',
    ],
    {
      anchor: [4, 4],
      rows: [
        '.........',
        '....bb...',
        '..cc..d..',
        '.c.nvn.d.',
        '.w.vvv.b.',
        '.d.nvn.c.',
        '..d..ww..',
        '...bb....',
        '.........',
      ],
    },
    { anchor: [2, 2], rows: ['..c..', '.cwc.', 'cwvwc', '.cwc.', '..c..'] },
  ],
}

// the spin, as frames of `vortex` to cycle through
export const SPIN = [2, 3, 4, 5] as const

// Obito's Kamui wringing the post away, the swirl shrinking: after the big
// swirl (uchiha.ts's kamui, 17 across) it tightens to the middle size (the
// vortex's swirl, 13 across: frames 0-3 a quarter-turn a frame), then small
// (4: 9 across), closing tight (5) and shut on a spark (6). The vortex's own
// drawings in the big swirl's colours (its saturated violets, a void at the
// eye), so the three sizes read as one swirl. Each frame anchored on its eye.
export const kamuiWring: FxFamily = {
  palette: pal(`v:#0c0814 n:#140c26 d:#4c3690 b:#8a6cc8 c:#c6b2f0 w:#f4eeff`),
  anchor: [6, 6],
  frames: [2, 3, 4, 5, 1, 6, 7].map(f => vortex.frames[f]!),
}
