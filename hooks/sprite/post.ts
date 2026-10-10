// The wooden training post every jutsu hits: a 4 px log stake, end grain on
// top, lit from the left, a twisted rope band with its knot's tail, a knot in
// the grain. 6 wide (7 with the rope's tail) by 11 tall, outline included.
// `anchor` is the pixel set on the ground at stage.ts's POST_X: the bottom
// row, column 2.
//
// Letters: o outline, a b end grain (lit, shade), l m d k the wood (lit,
// middle, shadow, the knot), r s the rope (lit, shade), x e f a hole burnt
// through it (charred, glowing, hot), w a blade's white-hot slash.
//
// Frames: stand; lean (the top rocked a pixel away from a blow); scorch and
// scorchLean (a Raikiri's hole punched through, its rim still glowing);
// scarred (the cooled hole); twist1-3 (wrung into Kamui's vortex, thinner
// and shorter toward its middle); cut, split and felled (a sword's stroke:
// the slash across it rising to the left, the top slid a pixel down along
// the cut on its pale face, then lying on the ground beside the stump).

import { pal } from './grid.ts'
import type { Grid, PostFrame, XY } from './types.ts'

export const POST_PALETTE = pal(`
  o:#1a1008 a:#f2cf94 b:#c99a5c l:#cf8f50 m:#9c6434 d:#6b3f1d k:#43260f
  r:#efe2b8 s:#b39a68 x:#1c1210 e:#ff9a3c f:#ffe08a w:#ffffff
`)

export const POST_ANCHOR: XY = [2, 10]

export const POST: Readonly<Record<PostFrame, Grid>> = {
  stand: [
    '.oooo.',
    'oabbbo',
    'olmmdo',
    'orrsso',
    'osrrsso',
    'olmmdos',
    'olmmdo.',
    'olkmdo',
    'olmmdo',
    'olmkdo',
    'olmmdo',
  ],
  lean: [
    'oooo..',
    'abbbo.',
    'lmmdoo',
    'orrsso',
    'osrrsso',
    'olmmdos',
    'olmmdo.',
    'olkmdo',
    'olmmdo',
    'olmkdo',
    'olmmdo',
  ],
  scorch: [
    '.oooo.',
    'oabbbo',
    'olmmdo',
    'orrsso',
    'osrrsso',
    'olmxedo',
    'olxxfo.',
    'olmxeo',
    'olmmdo',
    'olmkdo',
    'olmmdo',
  ],
  scorchLean: [
    'oooo..',
    'abbbo.',
    'lmmdoo',
    'orrsso',
    'osrrsso',
    'olmxedo',
    'olxxfo.',
    'olmxeo',
    'olmmdo',
    'olmkdo',
    'olmmdo',
  ],
  scarred: [
    '.oooo.',
    'oabbbo',
    'olmmdo',
    'orrsso',
    'osrrsso',
    'olmxkdo',
    'olxxko.',
    'olmxko',
    'olmmdo',
    'olmkdo',
    'olmmdo',
  ],
  // Kamui: the top dragged right and the foot left round the vortex's eye
  // (at the rope), the wood stretched thin
  twist1: [
    '..ooo.',
    '.oabo.',
    '.olmdo',
    'orrsso',
    'osrrsso',
    'olmmdo.',
    'olmdo..',
    'olkdo..',
    'olmdo..',
    'olmdo..',
    'olmmdo.',
  ],
  // wrung tighter: a thin S of wood, its ends drawn in
  twist2: [
    '......',
    '......',
    '...oo.',
    '..obdo',
    '.orsso',
    '.omdo.',
    'olmo..',
    'olmo..',
    'olmdo.',
    '.ooo..',
    '......',
  ],
  // a sword's stroke: the slash, white-hot, rising to the left through it
  cut: [
    '.oooo..',
    'oabbbo.',
    'olmmdo.',
    'orrsso.',
    'wsrrsso',
    'owmmdos',
    'olwmdo.',
    'olkwdo.',
    'olmmwo.',
    'olmkdw.',
    'olmmdo.',
  ],
  // the top slid a pixel down along the cut, its pale face showing
  split: [
    '........',
    '..oooo..',
    '.oabbbo.',
    '.olmmdo.',
    'oorrsso.',
    'oasrrsso',
    'olammdos',
    'olkamdo.',
    'olmmado.',
    'olmkdoo.',
    'olmmdo..',
  ],
  // the stump, and the top lying on the ground beside it
  felled: [
    '................',
    '................',
    '................',
    '................',
    'oo..............',
    'oao.............',
    'olao....oooooooo',
    'olkao..oabmmrrlo',
    'olmmao.oabmmsrdo',
    'olmkdo.obbmkmsdo',
    'olmmdo..oooooooo',
  ],
  // a last sliver at the eye
  twist3: [
    '......',
    '......',
    '......',
    '......',
    '...oo.',
    '..omo.',
    '..olo.',
    '..oo..',
    '......',
    '......',
    '......',
  ],
}
