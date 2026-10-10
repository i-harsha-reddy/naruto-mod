// Pain (the Rinnegan): Shinra Tensei's push, Bansho Ten'in's pull, Chibaku
// Tensei's black sphere gathering the ground into a moon, and the chakra rods
// he runs the post through. Gravity is lilac here: white at the heart of a
// force, lilac at its edge, deep violet as it fades.

import { pal } from '../grid.ts'
import type { FxFamily } from '../types.ts'

// ------------------------------------------------------------------ Shinra Tensei
// The push: a filled ring of force 3 to 4 px thick bursting out of his palm
// and sweeping the whole arena out to the stage's edges, white on its
// leading edge, lilac behind, deep violet at its trailing edge, a second
// ripple dragged behind it; a ring seen a little from above, centred just
// ahead of the palm thrust at the arena, and drawn ROUND him: its far half
// (above the centre line) behind him (`shinra`, back: true), its near half
// (below it, the waist down) in front of him (`shinraFront`), so it reads as
// a whole ring growing out of him and over the post, never a crescent. It
// crosses the post on frame 2, its foot reaches the stage's edge on frame 4,
// and it thins away off the edges. The dust it shoves along the floor is the
// move's (anims/pain.ts). STAGE-SIZED effects: 48x24, anchor [0, 0], placed
// at the stage's top-left (AT.stage). Hold each frame two.
const SHINRA_C: readonly [number, number] = [20, 16]
// a ring of outer radius r, its three bands (outermost first) in `bands`;
// only the rows `rows` says (the far half, or the near)
const ring = (r: number, bands: string, rows: (y: number) => boolean = () => true): string[] =>
  Array.from({ length: 24 }, (_, y) =>
    Array.from({ length: 48 }, (_, x) => {
      if (!rows(y)) return '.'
      const d = Math.hypot(x - SHINRA_C[0], (y - SHINRA_C[1]) * 1.6)
      const band = Math.floor(r - d)
      return d <= r && band >= 0 && band < bands.length ? bands[band]! : '.'
    }).join(''),
  )
// two rings in one frame: the wave and the ripple it drags behind it
const both = (a: string[], b: string[]): string[] => a.map((row, y) => [...row].map((ch, x) => (ch !== '.' ? ch : b[y]![x]!)).join(''))
const RINGS: readonly [number, string, number, string][] = [
  [4, 'wwc', 0, ''],
  [8, 'wwcb', 0, ''],
  [12, 'wwcbd', 6, 'dn'],
  [18, 'wcbd', 11, 'dn'],
  [25, 'cbd', 17, 'dn'],
  [33, 'bdn', 24, 'n'],
]
const ringsOf = (rows: (y: number) => boolean): string[][] => RINGS.map(([r, a, q, b]) => (q ? both(ring(r, a, rows), ring(q, b, rows)) : ring(r, a, rows)))
export const shinra: FxFamily = {
  palette: 'push',
  anchor: [0, 0],
  frames: ringsOf(y => y < SHINRA_C[1]),
}
export const shinraFront: FxFamily = {
  palette: 'push',
  anchor: [0, 0],
  frames: ringsOf(y => y >= SHINRA_C[1]),
}

// ------------------------------------------------------------------ Bansho Ten'in
// The pull: three lines of force streaming from the post (anchor, its right
// face) toward his reaching hand, dashes bright at their heads riding them 2 px
// a frame toward him; loops. 14x9.
export const bansho: FxFamily = {
  palette: 'push',
  anchor: [0, 4],
  frames: [
    [
      '..............',
      '....dbcw....db',
      '..............',
      '..............',
      'ndbcw...ndbcw.',
      '..............',
      '..............',
      '....dbcw....db',
      '..............',
    ],
    [
      '..............',
      'cw....dbcw....',
      '..............',
      '..............',
      '..ndbcw...ndbc',
      '..............',
      '..............',
      'cw....dbcw....',
      '..............',
    ],
    [
      '..............',
      'dbcw....dbcw..',
      '..............',
      '..............',
      'w...ndbcw...nd',
      '..............',
      '..............',
      'dbcw....dbcw..',
      '..............',
    ],
    [
      '..............',
      '..dbcw....dbcw',
      '..............',
      '..............',
      'bcw...ndbcw...',
      '..............',
      '..............',
      '..dbcw....dbcw',
      '..............',
    ],
  ],
}

// ------------------------------------------------------------------ Chibaku Tensei
// The black sphere over the arena (its heart where it is placed): a black
// core rimmed in lilac with rocks torn off the ground streaming up into it
// (each a rock trailing a violet streak), growing as the rock packs round
// it, plate by plate, seamed black, lit from the upper left, its lower right
// rim catching the lilac light; then a moon of stone 26 across, hung two
// pixels higher so the stage's top crops it, the last of the rubble flying
// up into it (frame 3), and the moon alone (frame 4, for the hold and its
// rise). 30x30 frames; place it over the arena ([12, 7]).
export const chibaku: FxFamily = {
  palette: pal(`n:#0a0810 d:#3a2f5e b:#9c88e6 r:#a8927a k:#665642 h:#cdb998 s:#2c2420`),
  anchor: [14, 14],
  frames: [
    {
      anchor: [14, 14],
      rows: [
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '............ddddd.............',
        '...........ddnnnbb............',
        '...........dnnnnnb............',
        '...........dnnnnnb............',
        '...........dnnnnnb............',
        '...........dbnnnbb............',
        '............bbbbb.............',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '.........rk...................',
        '.........d........rk..........',
        '.........n........d...........',
        '.............rk...n...........',
        '.............n................',
        '..............................',
      ],
    },
    {
      anchor: [14, 14],
      rows: [
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............d...............',
        '...........ddddddhk...........',
        '..........ddhsrrrkk...........',
        '.........ddhnnnnnkbb..........',
        '.........dhnnnnnnnkb..........',
        '.........dhnnnnnnnkb..........',
        '........ddhnnnnnnnsbb.........',
        '.........dsnnnnnnnsb..........',
        '.........drnnnnnnnkb..........',
        '.........dbrnnnnnkbb..........',
        '..........bbkkskkbb...........',
        '...........kkbbbbb............',
        '...........kk.b...............',
        '....................rk........',
        '.......rk...........d.........',
        '.......d............d.........',
        '.......d............n.........',
        '.......n....rk................',
        '....rk......d.................',
        '....d.......d...rk............',
        '....n.......n...d.............',
        '................n.............',
      ],
    },
    {
      anchor: [14, 14],
      rows: [
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '..............................',
        '...........ddddddd............',
        '.......hkddddshrdddd..........',
        '.......kkdhhhssrrrrbb.........',
        '.......ddhhhhssrrrrrbb........',
        '......ddshhhsrssrrrkkbb.......',
        '......dhsshhsrrsssssskb.......',
        '.....ddhhsssssrsrrrrkkbb......',
        '.....ddhhsrrrsnrrrrkksbb......',
        '.....dhhhssrrnnnrrksskkb......',
        '.....dhhshssnnnnnsskkkkb......',
        '.....dhshrrssnnnkkkkkkkb......',
        '.....ddhrrrrssnkkkkkkkbb......',
        '.....ddrrrssksssskkkkkkk......',
        '......drssrkkskksskkkkkk......',
        '......dbrrkkkskkkssskbb.......',
        '.......bbkkkskkkkkkkbb........',
        '.......hkbkkskkkkkkbb.........',
        '.......kkbbbbkkkbbbb..........',
        '...........bbbbbbb............',
        '......rk.............rk.......',
        '......d..............d........',
        '......d..............d........',
        '......d....rk....rk..d........',
        '......n....d.....d...n........',
        '...........n.....n............',
      ],
    },
    {
      anchor: [14, 16],
      rows: [
        '..................hk..........',
        '...........dddddddkk..........',
        '........ddddhhhshdddd.........',
        '.......ddhhhhhshhrrsdd........',
        '.....dddhhhhhshhrrsrrbbb......',
        '....ddhhhhhhshhrrrsrrrrbb.....',
        '.hhkdhhhhhhshhrrrsrrrrsrb.....',
        '.hkkdhhhssshhrrrrsrrrksrbb....',
        '.kkkhssshhshrrrrsrrrksrrkbb...',
        '..dsshhhhhsrrrrrsrrkksrkkkb...',
        '..dsshhhhhsrrrrsrrkksrkkkkb...',
        '.ddhssssssrrrrrsrkkkskkkkkbb..',
        '.dhhhhhhhsrrrrsrkkkkskkkkkkb..',
        '.dhhhhhhhssrrrskkkkskkkkkkkb..',
        '.dssshhhhrsssskksssskkkkkkkb..',
        '.dhhssshrsrrrssskkkskkkssssb..',
        'hkhhrrsssrrrkkskksssssskkkkb..',
        'kkdrrrrrsrrkkkssskkskkkkkkkkk.',
        '..drrrrrsrkkkkskkkksskkkkkkkk.',
        '..drrrrrskkkkksskkkkskkkkkkkk.',
        '..ddrrrrskkkkkkskkkkskkkkbb...',
        '...dbrrrskkkkkkskkkkskkkbb....',
        '....brrrskkkkkkskkkksskkb.....',
        '....bbrkskkkkkkskkkkkskbb.....',
        '.....bbbsskkkkkskkkkkbbb......',
        '.......kkskkkkkskkkkkb........',
        '.......kkkbbkkkskbbkk.........',
        '.......kkk.bbbbbbb............',
        '....rk..................rk....',
        '....n.........rk........n.....',
      ],
    },
    {
      anchor: [14, 16],
      rows: [
        '..................hk..........',
        '...........dddddddkk..........',
        '........ddddhhhshdddd.........',
        '.......ddhhhhhshhrrsdd........',
        '.....dddhhhhhshhrrsrrbbb......',
        '....ddhhhhhhshhrrrsrrrrbb.....',
        '.hhkdhhhhhhshhrrrsrrrrsrb.....',
        '.hkkdhhhssshhrrrrsrrrksrbb....',
        '.kkkhssshhshrrrrsrrrksrrkbb...',
        '..dsshhhhhsrrrrrsrrkksrkkkb...',
        '..dsshhhhhsrrrrsrrkksrkkkkb...',
        '.ddhssssssrrrrrsrkkkskkkkkbb..',
        '.dhhhhhhhsrrrrsrkkkkskkkkkkb..',
        '.dhhhhhhhssrrrskkkkskkkkkkkb..',
        '.dssshhhhrsssskksssskkkkkkkb..',
        '.dhhssshrsrrrssskkkskkkssssb..',
        'hkhhrrsssrrrkkskksssssskkkkb..',
        'kkdrrrrrsrrkkkssskkskkkkkkkkk.',
        '..drrrrrsrkkkkskkkksskkkkkkkk.',
        '..drrrrrskkkkksskkkkskkkkkkkk.',
        '..ddrrrrskkkkkkskkkkskkkkbb...',
        '...dbrrrskkkkkkskkkkskkkbb....',
        '....brrrskkkkkkskkkksskkb.....',
        '....bbrkskkkkkkskkkkkskbb.....',
        '.....bbbsskkkkkskkkkkbbb......',
        '.......kkskkkkkskkkkkb........',
        '.......kkkbbkkkskbbkk.........',
        '.......kkk.bbbbbbb............',
        '..............................',
        '..............................',
      ],
    },
  ],
}

// ------------------------------------------------------------------ chakra rod
// One of his black receivers thrown into the post (anchor = its point): in
// flight with the air streaking off its butt, driven 2 px into the wood with a
// glint at the point, then at rest (shake the post meanwhile). Point to the
// left, a knob on the butt. 18x5.
export const chakraRod: FxFamily = {
  palette: 'rod',
  anchor: [0, 2],
  frames: [
    [
      '..................',
      '.............d.dd.',
      'wcccccccccdnn.....',
      'dnnnnnnnnndnn.ddd.',
      '..................',
    ],
    [
      '..................',
      '.c................',
      'cwccccccccccdnn...',
      '.cnnnnnnnnnndnn...',
      '..................',
    ],
    [
      '..................',
      '..................',
      '..ccccccccccdnn...',
      '..nnnnnnnnnndnn...',
      '..................',
    ],
  ],
}

// ------------------------------------------------------------------ his gravity
// Pain's own pull round him (not the chakra aura the others share): a dark
// ring of force on the floor under his feet, its back arc behind his legs,
// its front on the ground, a lilac glint (3 px) running round it, and a
// thick stream of rocks (solid lumps, lit on top, their undersides in the
// ring's violet) lifting off the ground round him, four pixels a frame, out
// of step, in six lanes, a rock every 7 px up each (three or four lanes show
// between him and the post, ten rocks or more at once). No single specks:
// every rock is 2 x 2, 3 x 3 or a 4 x 3 lump. 40x22, anchor = the middle of
// its front, on the feet ('feet'); draw it behind him (back: true): only what
// is outside his silhouette shows. Cycle it.
export const gravityWell: FxFamily = {
  palette: pal(`n:#2a2258 d:#5a48a8 b:#c4b0f4 r:#a8927a`),
  anchor: [20, 21],
  frames: [
    [
      'rrr.....nn..............................',
      'rrn................................rr...',
      'nn...rr...rr.......................nn...',
      '....rrrn..nn............................',
      '.....nn.................................',
      '..............................rr........',
      '.......rr.....................nn........',
      '.......nn...........................rr..',
      'rr.................................rrrn.',
      'nn........rr........................nn..',
      '....rr....nn............................',
      '....nn.........................rr.......',
      '.......rrr....................rrrn......',
      '.......rrn.....................nn.......',
      '.rr....nn...............................',
      'rrrn...............................rr...',
      '.nn................................nn...',
      '........................................',
      '........................................',
      '...........nnnnnnnnnnnnnnnnnnn..........',
      '.......nddd...................dddn......',
      '.......nbbbdddddddddddddddddddddn.......',
    ],
    [
      '....nn........................rrr.......',
      '..............................rrn.......',
      '.......rr.....................nn........',
      '.......nn...........................rr..',
      'rr.................................rrrn.',
      'nn...rr...rr........................nn..',
      '....rrrn..nn............................',
      '.....nn.................................',
      '.......rrr....................rr........',
      '.......rrn....................nn........',
      '.rr....nn...............................',
      'rrrn...............................rr...',
      '.nn.......rr.......................nn...',
      '....rr....nn............................',
      '....nn.........................rr.......',
      '..............................rrrn......',
      '...............................nn.......',
      '........................................',
      '........................................',
      '...........nnnnnnnnnnnnnnnnnnn..........',
      '.......nddd...................dddn......',
      '.......ndddddddbbbddddddddddddddn.......',
    ],
    [
      'rrn................................rr...',
      'nn...rr...rr.......................nn...',
      '....rrrn..nn............................',
      '.....nn.................................',
      '..............................rr........',
      '.......rr.....................nn........',
      '.......nn...........................rr..',
      'rr.................................rrrn.',
      'nn........rr........................nn..',
      '....rr....nn............................',
      '....nn.........................rr.......',
      '.......rrr....................rrrn......',
      '.......rrn.....................nn.......',
      '.rr....nn...............................',
      'rrrn...............................rr...',
      '.nn.......rr.......................nn...',
      '..........nn............................',
      '........................................',
      '........................................',
      '...........nnnnnnnnnnnnnnnnnnn..........',
      '.......nddd...................dddn......',
      '.......nddddddddddddddbbbdddddddn.......',
    ],
    [
      '........rr....................rrn.......',
      '.......rrrn...................nn........',
      '........nn..........................rr..',
      'rr.................................rrrn.',
      'nn...rr...rr........................nn..',
      '....rrrn..nn............................',
      '.....nn.................................',
      '..............................rr........',
      '.......rr.....................nn........',
      '.rr....nn...............................',
      'rrrn...............................rr...',
      '.nn.......rr.......................nn...',
      '....rr....nn............................',
      '....nn.........................rr.......',
      '.......rrr....................rrrn......',
      '.......rrn.....................nn.......',
      '.......nn...............................',
      '........................................',
      '........................................',
      '...........nnnnnnnnnnnnnnnnnnn..........',
      '.......nddd...................dddn......',
      '.......ndddddddddddddddddddddbbbn.......',
    ],
  ],
}

// and letting go: the ring broken into arcs, the rocks dropping back; the
// last arcs on the floor. The same size and anchor as gravityWell (40x22); play 0, 1
// as the well ends, so it never vanishes in a frame.
export const gravityFade: FxFamily = {
  palette: pal(`n:#2a2258 d:#5a48a8 b:#c4b0f4 r:#a8927a`),
  anchor: [20, 21],
  frames: [
    [
      '........................................',
      '........................................',
      '..........rr............................',
      '..........nn............................',
      '....rr..................................',
      '....nn..................................',
      '........................................',
      '........................................',
      '.rr.....................................',
      'rrrn....................................',
      '.nn......rr.............................',
      '.........nn.............................',
      '........................................',
      '........................................',
      '......rrr.......................rr......',
      '.rr...rrn......................rrrn.....',
      '.nn...nn........................nn......',
      '....................................rr..',
      '....................................nn..',
      '........................................',
      '.......nd.....................dn........',
      '......ndd..nddd....nddd...nddd..dn......',
    ],
    [
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........rr..............................',
      '..rr...rrrn.............................',
      '..nn....nnrr....................rr......',
      '..........nn....................nn......',
      '........nd....nd......nd.....nd.........',
    ],
  ],
}
