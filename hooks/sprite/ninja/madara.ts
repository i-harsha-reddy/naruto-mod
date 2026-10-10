// Madara as a native sprite: everything that is his own over the shared
// 'haori' template (templates/haori.ts): his head (and turned three-quarters
// to the post), his ever-open Sharingan and the Rinnegan, the red armour over
// a deep blue robe, the mane down his back and the round gunbai slung behind
// his shoulder, the gunbai on his shoulder for a cheer, his own home column,
// and his moves (anims/madara.ts).

import { pal } from '../grid.ts'
import { GROUND_SHADOW_ROWS, HAORI, standingPoses } from '../templates/haori.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite, Prop, PropPlace } from '../types.ts'
import { register } from '../registry.ts'
import { CHEER, FIRE_ANNIHILATION, MADARA_POSES, QUICK, SUSANOO, TENGAI_SHINSEI } from '../anims/madara.ts'

// ------------------------------------------------------------------ head

// His hand-drawn 21 x 19 head, traced with a 1 px outline. The hair is
// clean three-tone spikes, no dither: five up top (the outer two flung out
// sideways), a spike out of each side at the temple and the cheek, each lit
// on its top-left facet with a dark parting where they meet; three bangs
// hang to the brows with the skin in shadow between them; long side locks
// frame the face to below the jaw, ending in points. The rest of the long
// hair falls behind the shoulders as the mane prop. The eyes are drawn by
// EYES.
//   a b c n  hair: shadow, mid, lit, deepest
//   d e      skin, its shadow under the bangs
//   o        outline
const PALETTE = pal(`
  a:#30324a b:#464966 c:#686e98 n:#22233a d:#f4d8c0 e:#d8ac94 o:#0e1019
`)

export const HEAD: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.....o....o....o.....',
    '....oco..oco..oco....',
    '.o.occboocbboocbbo.o.',
    'ocbbcbbanccbbancbbcao',
    'ocbbbbbbacbbbbacbbbao',
    'ocbbbbbbbabbbbbabbbao',
    '.ocbbbbbbbbbbbbbbbao.',
    '..ocbbbbbbbbbbbbbao..',
    'ocbbbbbacbbbbacbbbbco',
    '.ocbbbbacbbbbacbbbao.',
    '..oabcbacbbacbaabao..',
    'ocbabeaeeeaeeaeebabco',
    '.ocbbdddddddddddbbao.',
    '.ocbbdddddddddddbbao.',
    'ocbbbdddddddddddbbbco',
    '.ocbbbdddddddeebbbao.',
    '..ocaaodddddeeoabao..',
    '..oao.oooddeooo.oao..',
    '...oo....ooo....oo...',
  ],
}

// The head turned three-quarters toward the post (a cel's `head: 'turn'`):
// the face and bangs slid three pixels toward the arena, the far cheek
// narrowed so the far eye sits at the hair's edge, the near locks thinned to
// a strand and the whole mass of the hair swung two pixels back (23 wide),
// so the outline itself turns.
export const TURN: HeadGrid = {
  ...HEAD,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  rows: [
    '.....o....o....o.......',
    '....oco..oco..oco......',
    '...occboocbboocbbo.o...',
    '.ocbcbbanccbbancbbbbcao',
    '.ocbbbbbacbbbbacbbbbbao',
    '.ocbbbbbbabbbbbabbbbbao',
    '..ocbbbbbbbbbbbbbbbbao.',
    '...ocbbbbbbbbbbbbbbao..',
    'ocbbbbbacbbbbacbbbbbbco',
    '.ocbbbbacbbbbacbbbbbao.',
    'obcbacbbacbaabbbbbbbao.',
    'oceaeeeaeeaebbbbbbbbco.',
    'ocdddddddddebbbbbbbbao.',
    'ocdddddddddebbbbbbbbbao',
    'ocdddddddddebbbbbbbbbco',
    '.odddddddeebbbbbbbbao..',
    '..odddddeeoabbbbbbao...',
    '...oooddeooo.oabbao....',
    '......ooo....oooo......',
  ],
}

// ------------------------------------------------------------------ eyes

// Hand-drawn faces, each one grid over both eyes (and the mouth for a smirk
// or a gasp), stamped with its top-left at the left eye plus `at`; '.' keeps
// the head's own pixel. The Sharingan is always on: a red iris, its dark
// heart toward the nose, under a heavy lash line.
//   l lash, r red, q its glint, p the dark heart, s e skin and its shadow,
//   m mouth, w white, v k the Rinnegan's pale rings and dark ripples
export const EYES: HandEyes = {
  palette: pal(`
    l:#2a1418 p:#2a0608 r:#d8141e q:#f0645a s:#f4d8c0 e:#d8ac94 m:#8a4646 w:#f4f1ee
    v:#c4b4e4 k:#5a4a86
  `),
  states: {
    // the stare: lash line, red iris, the dark heart toward the nose, a glint
    open: { at: [0, -1], rows: ['ll...ll', 'rp...pr', 'qr...rq'] },
    left: { at: [0, -1], rows: ['ll...ll', 'pr...pr', 'rq...rq'] },
    half: { at: [0, -1], rows: ['ll...ll', 'll...ll', 'rp...pr'] },
    shut: { at: [0, 0], rows: ['ss...ss', 'll...ll'] },
    // focus: the brows driven down hard at the nose
    focus: { at: [0, -1], rows: ['.l...l.', 'lr...rl', 'rp...pr'] },
    // the rare smile: arches
    happy: { at: [-1, 0], rows: ['lll...lll', 'lsl...lsl'] },
    sad: { at: [0, -1], rows: ['l.....l', 'rl...lr', 'rp...pr'] },
    wide: { at: [0, -1], rows: ['l.....l', 'rp...pr', 'rr...rr', '.......', '...m...'] },
    // smug (his cheer): one lid lowered, the corner of the mouth up
    smug: { at: [0, -1], rows: ['ll...ll', 'rp...ll', 'qr...pr', '.....m.', '...mm..'] },
    // the Rinnegan, for a cel that asks for it: pale rings round a dark ripple
    rinnegan: { at: [0, -1], rows: ['ll...ll', 'vk...kv', 'kv...vk'] },
  },
}

// The Rinnegan awake (reading, and Tengai Shinsei): the Sharingan's red
// gives way to its pale rings, over whatever the lids and mouth are doing (a
// both-eye grid, at the right eye less the 5 columns to the left one). A
// blink or a smile shuts it at rest; in a move it stays open.
const RINNEGAN: Dojutsu = {
  eyes: { at: [-5, -1], rows: ['ll...ll', 'vk...kv', 'kv...vk'] },
  states: {
    half: { at: [-5, -1], rows: ['ll...ll', 'll...ll', 'vk...kv'] },
    focus: { at: [-5, -1], rows: ['.l...l.', 'lv...vl', 'vk...kv'] },
    sad: { at: [-5, -1], rows: ['l.....l', 'vl...lv', 'vk...kv'] },
    wide: { at: [-5, -1], rows: ['l.....l', 'vk...kv', 'kv...vk'] },
    smug: { at: [-5, -1], rows: ['ll...ll', 'vk...ll', 'kv...kv'] },
    shut: null,
    happy: null,
  },
}

// ------------------------------------------------------------------ body

// The haori's letters in his colours: the outer layer is his red armour (c a
// lighter glint on the plate edges); the robe, trousers and sandals a deep
// blue, bluer than his grey-navy hair so a sleeve raised over the hair still
// parts from it, and light enough to read on the terminal; a dark sash.
const BODY = pal(`
  o:#0e1019
  s:#f4d8c0 k:#d8ac94
  v:#d24a40 w:#a02c30 x:#681a22 c:#e87060
  n:#5a6cb0 m:#3e4c88 l:#2a3462
  b:#4a4a5e j:#2e2e3c
  p:#4a5a98 q:#36437a r:#252f56
  t:#252f56 u:#4a5a98
  y:#464966 z:#30324a
`)

// ------------------------------------------------------------------ props

// His mane: the long spiky hair falling down his back to the knees, behind
// everything: never a curtain. On the arena side it flares out in three wild
// locks, each swept out and down to its own point with a notch of air under
// it (so his outline breaks into spikes, not a rounded slab), the last one
// hanging lowest; on the far side a broad dark mass down his back past the
// gunbai, breaking into heavy points. It hangs from the head, so it bobs
// with it.
const MANE_PALETTE = pal(`o:#0e1019 c:#686e98 b:#464966 a:#30324a n:#22233a`)
const MANE: Prop = {
  on: 'head',
  at: [-9, 8],
  behind: true,
  palette: MANE_PALETTE,
  rows: [
    '.........oo...................oo..',
    '........ocbo.................obao.',
    '.......ocbbo.................obnao',
    '......ocbbao..................obao',
    '....ooocbbao..................obao',
    '..oocbbbbbao.................obnao',
    '.ocbbbbbbaao................obbnao',
    'ocbbaaoobaao................obnnao',
    '.oo...ocbaao...............obbnnao',
    '....oocbbaao...............obnnao.',
    '..oocbbbbaao...............obnnao.',
    '.ocbbbbbaaao..............obnnao..',
    'ocbbaaoobao...............obnao...',
    '.oo..ocbaao...............onaao...',
    '....ocbaao................oaao....',
    '...ocaaoo.................oao.....',
    '...ooo.....................o......',
  ],
}
// streaming back in a dash or a lunge: all of it behind, blown out flat
const MANE_BLOWN: PropPlace = {
  on: 'head',
  at: [-4, 9],
  rows: [
    '...........................oo...',
    '..........................obbo..',
    '.........................obbbboo',
    '.........................obbnnbao',
    '........................obbbnnnao',
    '........................obbnnnaao',
    '........................obbnnaao.',
    '........................obnnaao..',
    '.........................oaao.o..',
    '..........................oo.....',
  ],
}
const blown = Object.fromEntries(['dash', 'smear', 'strike', 'follow', 'punch', 'slump', 'kick', 'breathe'].map(p => [p, MANE_BLOWN]))

// The gunbai: his war fan, a great round face (11 x 12) inside a dark rim,
// cream lit on the left and shaded on its far side and underneath, three
// segment lines fanning up from where the long handle meets it (a fan, not a
// paddle), the handle dark, wrapped at the grip. Slung on his back, the face
// up behind his far shoulder past his hair; in his hand (Uchiha Return, the
// cheer) held up by the handle, rested on his near shoulder from the far
// hand tucked in his folded arms, swung round flat at the post.
//   o rim, w cream, e its shade, g the segment lines and the wrap, h the handle
const GUNBAI_PALETTE = pal(`o:#0e1019 w:#f2e8cc e:#c4b08a r:#d02e36 s:#8e1a24 h:#4a2e1c g:#7a5a3a`)
export const GUNBAI_ROWS = [
  '...ooooo...',
  '.oowwwweoo.',
  '.owwwgweeo.',
  'owwwwgwweeo',
  'ogwwwgwwego',
  'owgwwgwegeo',
  'owgwwgwegeo',
  'owwgwgwgeeo',
  '.owgwgegeo.',
  '.oeegggeeo.',
  '..oogggoo..',
  '....oho....',
  '....oho....',
  '....ogo....',
  '....ogo....',
  '....ogo....',
  '....oho....',
  '....oho....',
  '....oho....',
  '....ooo....',
] as const
// On his back it is seen three-quarters on, turned edge-toward-us: a narrow
// oval (6 wide) in its rim, lit on the near side, shaded on the far, one
// segment line running up the face from the handle's joint, the handle down
// behind his shoulder; up behind his far shoulder beside his hair, whole on
// the stage (never the edge of a circle cut by the stage's side, which read
// as a fish bone, or a hook)
export const GUNBAI_BACK = [
  '.oooo.',
  'owwweo',
  'owwgeo',
  'owwgeo',
  'owwgeo',
  'owwgeo',
  'owgeeo',
  '.ogeo.',
  '..oho.',
  '..oho.',
  '..ogo.',
  '..ogo.',
  '..oho.',
  '..oho.',
  '..oho.',
  '..ooo.',
] as const
const GUNBAI: Prop = { on: 'head', at: [19, 1], behind: true, palette: GUNBAI_PALETTE, rows: GUNBAI_BACK }
// in a lunge the head swings forward off it: the fan stands up over the far
// shoulder instead (on the pose's back point)
const up: PropPlace = { rows: GUNBAI_BACK, on: 'back', at: [1, -12] }
// (braced in the fire breath's split, the head thrust far forward: up behind
// the far shoulder, clear of the hair)
const braced: PropPlace = { rows: GUNBAI_BACK, on: 'back', at: [6, -14] }
// and sunk low (a crouch, a kick, the slam), where the head drops over its
// pocket: up behind the far shoulder from the feet
const low: PropPlace = { rows: GUNBAI_BACK, on: 'feet', at: [9, -17] }
// (in Uchiha Return and the cheer it is in his hand: off his back; in the
// Susanoo's stance it is put away under the giant)
const IN_HAND = ['fanUp', 'fanSwing', 'fanFollow', 'fanRest', 'fanTap'] as const
const PUT_AWAY = ['susCrouch', 'swordUp', 'swordBack', 'swordSwing', 'swordDown', 'swordHold'] as const

// The gunbai in hand, in UPPERCASE so it is drawn over his head where they
// meet: held up by the handle (the fist round its wrap, the hand point), the
// face high over his near shoulder; swung round flat at the post, the face
// end-on to it; rested on his near shoulder from the far hand tucked in his
// folded arms, the face up by his near cheek (lowercase: under the head).
const FAN_HELD: Prop = {
  on: 'hand',
  at: [-5, -14],
  palette: GUNBAI_PALETTE,
  only: IN_HAND,
  rows: GUNBAI_ROWS.map(r => r.toUpperCase()),
}
const FAN_REST: PropPlace = {
  on: 'feet',
  at: [-19, -23],
  rows: [
    '...ooooo........',
    '.oowwwweoo......',
    '.owwwgweeo......',
    'owwwwgwweeo.....',
    'ogwwwgwwego.....',
    'owgwwgwegeo.....',
    'owgwwgwegeo.....',
    'owwgwgwgeeo.....',
    '.owgwgegeo......',
    '.oeegggeeo......',
    '..oogggooo......',
    '.....oogho......',
    '......oho.......',
    '......ohoo......',
    '.......oho......',
    '.......ogoo.....',
    '........ogo.....',
    '........ogoo....',
    '.........oho....',
    '.........ohoo...',
    '..........oho...',
    '..........ooo...',
  ],
}
// (swept round at the post: the face turned edge-on toward it, held up off
// the fist on a short length of handle, clear of the post)
const FAN_FLAT: PropPlace = {
  on: 'hand',
  at: [-6, -13],
  rows: [
    '..ooo...',
    '.owweo..',
    'owwgeeo.',
    'owwgeeo.',
    'owgggeo.',
    'owgggeo.',
    'owgggeo.',
    'owgggeo.',
    'owwgeeo.',
    'owwgeeo.',
    '.oweeoo.',
    '..ooooho',
    '....ohho',
    '.....oho',
  ],
}

// The Susanoo's straight sword, a blade of its blue chakra with a lit edge, a
// cross-guard and a dark grip (behind him, in front of the post and the
// giant: it rides on his feet, which stay home through the cut). Raised over
// the giant's shoulder, the tip up by the frame's top-left; swung flat at the
// post, the tip's path smeared behind it; driven down through the post.
//   o outline, a the blade, c its lit edge, b its shade, g the guard, h the
//   grip, w the smear
const SWORD_PALETTE = pal(`o:#0c1a4a a:#7aa6ff c:#e2eeff b:#2c56c4 g:#f2f8ff h:#1e3c8c w:#5a8af0`)
const SWORD_UP: PropPlace = {
  on: 'feet',
  at: [-32, -22],
  rows: [
    '.o................',
    'ocoo..............',
    'obaco.............',
    '.obaco............',
    '..obaco...........',
    '...obaco..........',
    '....obaco.........',
    '.....obaco........',
    '......obaco.......',
    '.......obaco..o...',
    '........obacoogo..',
    '.........obacgo...',
    '..........oogo....',
    '..........ogoho...',
    '.........ogo.oho..',
    '..........o...oho.',
    '...............o..',
  ],
}
const SWORD_SWING: PropPlace = {
  on: 'feet',
  at: [-33, -20],
  rows: [
    '..w.................',
    '..w.................',
    '.w..................',
    '.w..................',
    '.w..................',
    'ww..................',
    'w...................',
    '.......ww...........',
    '................o...',
    '..oooooooooooooogo..',
    '.occccccccccccccgoo.',
    'ocaaaaaaaaaaaaaaghho',
    '.obbbbbbbbbbbbbbgoo.',
    '..oooooooooooooogo..',
    '................o...',
  ],
}
const SWORD_DOWN: PropPlace = {
  on: 'feet',
  at: [-33, -13],
  rows: [
    '....................o...',
    '.................ooogoo.',
    '...............ooccoghho',
    '.............ooccaaogoo.',
    '...........ooccaabbogo..',
    '.........ooccaabbooogo..',
    '.......ooccaabboo...o...',
    '.....ooccaabboo.........',
    '...ooccaabboo...........',
    '..occaabboo.............',
    '.ooaabboo...............',
    'ocabboo.................',
    '.oooo...................',
  ],
}
const SWORD: Prop = {
  ...SWORD_UP,
  behind: true,
  palette: SWORD_PALETTE,
  only: ['swordUp', 'swordBack', 'swordSwing', 'swordDown', 'swordHold'],
  // (the wind-up: drawn back a pixel further over the giant's shoulder; and
  // left standing in the post as he draws himself up)
  poses: { swordBack: { ...SWORD_UP, at: [-31, -23] }, swordSwing: SWORD_SWING, swordDown: SWORD_DOWN, swordHold: SWORD_DOWN },
}

// the floor's shadow past the coat's hem (templates/haori.ts), in the poses he stands in
const SHADOW: Prop = { on: 'feet', at: [-12, 0], behind: true, palette: pal(`s:#09090c`), rows: GROUND_SHADOW_ROWS, only: standingPoses(MADARA_POSES) }

export const MADARA: NinjaSprite = {
  id: 'madara',
  template: HAORI,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  dojutsu: RINNEGAN,
  // the gunbai in hand and the Susanoo's sword (anims/madara.ts)
  poses: MADARA_POSES,
  props: [
    { ...MANE, poses: blown },
    { ...GUNBAI, poses: { strike: up, dash: up, follow: up, punch: up, smear: up, slump: up, breathe: braced, kick: low, slam: low, crouch: low, charge: low, windup: low }, skip: [...IN_HAND, ...PUT_AWAY] },
    { ...FAN_HELD, poses: { fanSwing: FAN_FLAT, fanFollow: FAN_FLAT, fanRest: FAN_REST, fanTap: { ...FAN_REST, at: [-19, -25] } } },
    SWORD,
    SHADOW,
  ],
  // his cheer (the roster's arms folded): the smug look
  poseEyes: { crossed: 'smug' },
  heads: { turn: TURN },
  // two columns nearer the arena than the others, so the gunbai on his back
  // fits on the stage beside his hair
  home: 33,
  moves: [FIRE_ANNIHILATION, SUSANOO, TENGAI_SHINSEI],
  quick: QUICK,
  cheer: CHEER,
}

register(MADARA)
