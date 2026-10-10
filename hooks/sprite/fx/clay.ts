// Clay (Deidara): C1 clay birds and spiders, and the bang they all end in.
// "Art is an explosion!" White clay with a cool grey shade and a dark edge so
// it holds on any background; the blast a white heart in gold and orange
// fire with a red rim, then soot smoke lit red from underneath.

import { pal } from '../grid.ts'
import type { FxFamily } from '../types.ts'

// ------------------------------------------------------------------ C1 bird
// A clay bird flying left, three-frame flap (up, level, down): a round head
// with a beak and a dark eye, a fat body, a forked tail. 13x10, anchor = its
// middle; it bobs a pixel with the flap so the loop has lift.
export const clayBird: FxFamily = {
  palette: 'clay',
  anchor: [6, 5],
  frames: [
    [
      '........nn...',
      '.......nwcn..',
      '..nnn.nwcbn..',
      '.nwwwnwcbn...',
      'nbwnwwccbnnn.',
      '.nwwcccccbcbn',
      '..nwccccbbnn.',
      '...nnbbbbn...',
      '.....nnnn....',
      '.............',
    ],
    [
      '.............',
      '.............',
      '..nnn.nnnnn..',
      '.nwwwnwwwccn.',
      'nbwnwwccccbnn',
      '.nwwcccccbcbn',
      '..nwccccbbnn.',
      '...nnbbbbn...',
      '.....nnnn....',
      '.............',
    ],
    [
      '.............',
      '.............',
      '..nnn........',
      '.nwwwnnnnnnn.',
      'nbwnwwcccccbn',
      '.nwwcwccccbcn',
      '..nwcwcbbbnn.',
      '...nwcbnnn...',
      '...ncbn......',
      '....nn.......',
    ],
  ],
}

// ------------------------------------------------------------------ C1 spider
// A clay spider scuttling along the floor (anchor = under its middle, on the
// ground row): a domed white clay body 7 across and 5 high, inked round, lit
// on top and shaded under, and two legs a side in the clay's grey, solid
// strokes so they read on the dark floor: an outer one arched up over the
// body's shoulder and down to the floor, an inner one under it. Frames: legs flung wide, legs
// gathered under it, wide again on the other step, and lit white-hot (about
// to go off: the body white, the legs gold). 11x6; loop the first three
// while sliding it 1 px a frame.
export const claySpider: FxFamily = {
  // the clay's own colours (fx/palettes.ts's 'clay') and the gold of the fuse
  palette: pal(`w:#fbf8ef c:#dcd5c4 b:#a39a86 n:#3e372f y:#ffd84a`),
  anchor: [5, 5],
  frames: [
    ['....nnn....', '.bbnwwwnbb.', 'b.nwwcccn.b', 'b.ncccbbn.b', 'b.bnnnnnb.b', 'b.b.....b.b'],
    ['....nnn....', '..bnwwwnb..', '.bnwwcccnb.', '.bncccbbnb.', '.bbnnnnnbb.', '.b.b...b.b.'],
    ['....nnn....', '.bbnwwwnbb.', 'b.nwwcccn.b', 'b.ncccbbn.b', 'b..nnnnn..b', 'b..b...b..b'],
    ['....nnn....', '.yynwwwnyy.', 'y.nwwwwwn.y', 'y.nwwwwwn.y', 'y.ynnnnny.y', 'y.y.....y.y'],
  ],
}

// ------------------------------------------------------------------ katsu
// The bang, 5 frames: a white flash with eight spikes; the fireball, white
// at heart; grown, its heart cooling to gold, soot already rolling off the
// top and fire spilling along the ground; a column of smoke lit red from the
// embers underneath; puffs drifting apart. 22x22; anchor = bottom centre, on
// the ground under the post (AT.postBase).
export const katsu: FxFamily = {
  palette: 'blast',
  anchor: [11, 21],
  frames: [
    [
      '......................',
      '......................',
      '......................',
      '......................',
      '......................',
      '......................',
      '......................',
      '......................',
      '...........y..........',
      '...........w..........',
      '.......y...w...y......',
      '.........yyyyy........',
      '........yywwwyy.......',
      '........ywwwwwy.......',
      '.....ywwywwwwwywwy....',
      '........ywwwwwy.......',
      '........yywwwyy.......',
      '.........yyyyy........',
      '.......y...w...y......',
      '...........w..........',
      '...........y..........',
      '......................',
    ],
    [
      '......................',
      '......................',
      '......................',
      '.........rrrrr........',
      '........rooooor.......',
      '.......rooyyyoor......',
      '......rooyyyyyoor.....',
      '......royyyyyyyor.....',
      '.....royyyyyyyyyor....',
      '....rooyyywwwyyyoor...',
      '...rooyyywwwwwyyyoor..',
      '...rooyywwwwwwwyyoor..',
      '..rrooyywwwwwwwyyoorr.',
      '...rooyywwwwwwwyyoor..',
      '...rooyyywwwwwyyyoor..',
      '....rooyyywwwyyyoor...',
      '.....royyyyyyyyyor....',
      '....rroooyyyyyooorr...',
      '.....rrooooooooorr....',
      '.....rrrrooooorrrr....',
      '.......rrrrrrrrr......',
      '........rrrrrrr.......',
    ],
    [
      '..........kkk.........',
      '......kkkkkkkkkkk.....',
      '.....kkkkkkkkkkkkk....',
      '.....kkkkkkkkkkkkk....',
      '....kkkkkkkkkkkkkkk...',
      '...kkkkkkrrrrrkkkkkk..',
      '..kkkkkrrrooorrrkkkkk.',
      '...kkkrooooooooorkkk..',
      '..rrkrooooooooooorkrr.',
      '.rrrrooooyyyyyoooorrrr',
      '.rrrrooyyyyyyyyyoorrrr',
      '.rrroooyyywwwyyyooorrr',
      '.rrrooyyywwwwwyyyoorrr',
      '.rrrooyyywwwwwyyyoorrr',
      '..rrooyyywwwwwyyyoorr.',
      '...roooyyywwwyyyooor..',
      '..rrrooyyyyyyyyyoorrr.',
      '..rrrooooyyyyyoooorrr.',
      '.rrrrrooooooooooorrrrr',
      '..rrrrrooooooooorrrrr.',
      '..rrrrrrrrooorrrrrrrr.',
      '....r.rrrrrrrrrrr.r...',
    ],
    [
      '......................',
      '.........kkkk.........',
      '....kkk.kkkkkk.kkk....',
      '...kkkkkkkkkkkkkkkk...',
      '..kkkkkkkkkkkkkkkkkk..',
      '.kkkkkkkkkkkkkkkkkkkk.',
      '.kkkkkkkkkkkkkkkkkkkk.',
      '.kkkkrkkkkkkkkkkrkkkk.',
      '..kkrrkkkrkkrkkkrrkk..',
      '..rrr.rkrrkkrrkr.rrr..',
      '......r.rkkkkr.r......',
      '.........krrk.........',
      '.........rorr.........',
      '.........roor.........',
      '........rooyr.........',
      '........royor.........',
      '.......rroyorr........',
      '......rrooyoorr.......',
      '....rrooyywyyoorr.....',
      '...rroooyyyyyooorr....',
      '...rrrrooooooorrrr....',
      '.....rrrrrrrrrrrr.....',
    ],
    [
      '.........kkk..........',
      '........kkkkk.........',
      '...kk..kkkkkkk..kkk...',
      '..kkkk.kkkkkkk.kkkkk..',
      '.kkkkkk.kkkkk.kkkkkk..',
      '.kkkkkk.rkkkr.kkkkkk..',
      '.rkkkkr..rrr..rkkkkr..',
      '..rrrr........rrrr....',
      '......................',
      '..........o...........',
      '......................',
      '.....o..........o.....',
      '......................',
      '......................',
      '.........o............',
      '......................',
      '......................',
      '......................',
      '......................',
      '......................',
      '........r.o.r.........',
      '.......rrrorrr........',
    ],
  ],
}
