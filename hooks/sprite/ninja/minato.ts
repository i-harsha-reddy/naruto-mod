// Minato as a native sprite, on the shared 'vest' template
// (templates/vest.ts): the vest under a white haori with red flames along its
// hem (a back panel and hem drawn per pose as an overlay, swinging out behind
// him in the action poses), his blond spikes and the headband, the clear blue
// eyes, a kunai caught in a reverse grip and a wink for a cheer, and his
// moves (anims/minato.ts).

import { pal } from '../grid.ts'
import { wear } from '../dress.ts'
import { register } from '../registry.ts'
import { VEST } from '../templates/vest.ts'
import type { HandEyes, HeadGrid, NinjaSprite, Overlay, Template } from '../types.ts'
import { MINATO_POSES, minatoMoves } from '../anims/minato.ts'

// ------------------------------------------------------------------ head

// The blond spikes (lit, gold, shadow), the headband across the brow, the
// fringe falling over it, and his own mark: the long bangs hanging either
// side of his face past the jaw, apart from it, their tips down beside the
// chin (Naruto's face sits open under his spikes; Minato's is framed).
//   a b c  hair: highlight, gold, shadow (and the brows)
//   d e    skin, its shadow
//   f g    the headband's cloth, its plate
//   h      the mouth
//   o      outline
const HEAD: HeadGrid = {
  palette: pal(`
    a:#fff8b0 b:#ffe24a c:#d8a414 d:#f8d6b4 e:#dcae8c f:#262c46 g:#e4e8f0 h:#c08070
    o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.....o.....o....o....',
    '....oao..ooao..oao...',
    '.o.oabo.oaabbooabo.o.',
    'oaooabboabbbbcobbcoco',
    'oaabbbbbbbbbbbbbbbcco',
    '.oabbbbbbbbbbbbbbbco.',
    'oaabbbbbbbbbbbbbbbcco',
    'oabbbfgggggggggfbbbco',
    'oabbcfgggfffgggfcbbco',
    'oabbabbcbbbbbcbbabcco',
    'oaabbaeeebcbeeeabbcco',
    '.oabbaddcdddcddabbco.',
    '.oabbodddddddddobbco.',
    '.oabbodddddddddobbco.',
    '..oabodddddddddobco..',
    '..oabbodddhdddobbco..',
    '..oabo.oddddeo.obco..',
    '...ob...oddeo...bo...',
    '...o.....ooo.....o...',
  ],
}

// The head turned three-quarters toward the post, for the blows (a cel's
// head: 'turn'): a real profile. The spikes swept back, up and off the
// crown and out behind in a sawtooth; the headband's plate at the front,
// its cloth wrapping back; the face at the front edge, the nose a pixel
// proud of the brow and the chin, the jaw running back to the ear (a small
// C of skin behind the long bang), the hair down the back of the head to
// the nape.
const HEAD_TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '...........oo.....oo.',
    '.........ooao...ooao.',
    '...oo..ooaabo.ooabbo.',
    '..oaooaabbbo.oabbbbao',
    '.oaabbabbbbbabbbbbbco',
    '.oabbbbbbbbbbbbbbbbco',
    'oaabbbbbbbbbbbbbbbbao',
    'ofggggggggfbbbbbbbco.',
    'ofggfffgggfbbbbbbbbao',
    'obabbbcbbbabbbbbbbco.',
    '.odeebcbeeabbbbbbbbao',
    '.oddccddcddbooabbbco.',
    '.odddddddddbddobbbco.',
    'oddddddddddbdeobbco..',
    '.oddddddddbboobbbco..',
    '..oddddhdddbbbbbco...',
    '...oddddddeoobbo.....',
    '....ooddddeo.oo......',
    '......oooooo.........',
  ],
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid, its column 0 on the left eye ([7, 12]): clear blue
// eyes under a dark lash line, the glint toward the light.
//   l lash, p pupil, i iris, w white, s e skin and its shadow, m mouth,
//   c the brows (the hair's shadow)
const EYES: HandEyes = {
  palette: pal(`l:#262c46 p:#1a2a5a i:#3a86e6 w:#ffffff s:#f8d6b4 e:#dcae8c m:#c08070 c:#d8a414`),
  states: {
    open: { at: [0, 0], rows: ['ll...ll', 'wi...wi'] },
    left: { at: [0, 0], rows: ['ll...ll', 'iw...iw'] },
    half: { at: [0, 0], rows: ['ee...ee', 'll...ll'] },
    shut: { at: [0, 1], rows: ['ll...ll'] },
    focus: { at: [0, -1], rows: ['.l...l.', 'll...ll', 'ip...ip'] },
    happy: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l', '.........', '...mmm...', '....m....'] },
    // the cheer's second beat: a wink
    wink: { at: [-1, 0], rows: ['.ll...ll.', '.wi..l..l', '.........', '...mmm...', '....m....'] },
    // a knowing half-smile, the eyes level
    smug: { at: [0, 0], rows: ['ll...ll', 'ii...ii', '.......', '...mm..'] },
    sad: { at: [0, -1], rows: ['l.....l', 'll...ll', 'wi...wi', '.......', '..mmm..'] },
    // startled: the brows up a row, the eyes round
    wide: { at: [0, -1], rows: ['cc...cc', 'ww...ww', 'wi...iw'] },
  },
}

// ------------------------------------------------------------------ body

// The vest's letters in his colours: the green vest, navy shirt and trousers,
// the red swirl crest; and the haori's own letters: g i h white (lit, mid,
// shade), f j its flames (red, orange).
const BODY = pal(`
  o:#0e1019
  s:#f8d6b4 k:#dcae8c
  v:#a6b86a w:#76893f x:#4b5a29
  n:#56679e m:#3a4572 l:#262d52
  p:#4a5a90 q:#3a4572 r:#262d52
  t:#2c3458 u:#4a5a90
  g:#fbfbf6 i:#e4e6ee h:#c2c7d6
  f:#d8342a j:#f89a2a
  c:#d8343a b:#c9cedb
  a:#f48a24 e:#a84e12 d:#f6ecd0
  y:#ffe24a z:#d8a414
`)

// ------------------------------------------------------------------ the haori

// The white haori over the vest, one overlay per pose: short flared sleeves
// (white to the elbow, the navy forearm below), the open front edge down the
// near side, the back panel hanging behind him to the knee, and the hem's
// red-and-orange flame trim. In the action poses the back panel swings out
// behind him, the flames along its trailing edge. (Drawn as full grids,
// reduced to these sparse overlays; at rest the near sleeve is white to the
// elbow and the near front panel hangs to its own flame hem, so the coat
// reads round the green vest on both sides; the strike's flared sleeve tucks its top
// edge behind his cheek, so a breath that sinks his head never hides his eye
// under it.)
// the haori of a pose for its Wind (the pose stirring in a moving hold): the
// same overlay, a pixel up where the Wind heaves the shoulders
const up = (list: readonly Overlay[], dy = 1): Overlay[] => list.map(o => ({ ...o, at: [o.at?.[0] ?? 0, (o.at?.[1] ?? 0) - dy] as const }))

const OVERLAYS: Readonly<Record<string, readonly Overlay[]>> = {
  idle0: [
    {
      at: [3, 5],
      rows: [
        '.ogggi.........ihh...',
        'ogggig........ih.hho.',
        'oiiihgv.......ih...ho',
        '.....gg.......ih...ho',
        '.....gg.......ih...ho',
        '.....gi.......ihfhhfo',
        '....offj......ffjffjo',
        '....ooo.........oooo.',
      ],
    },
  ],
  idle1: [
    {
      at: [3, 4],
      rows: [
        '.ogggi.........ihh...',
        'ogggig........ih.hho.',
        'oiiihgv.......ih...ho',
        '.....gg.......ih...ho',
        '.....gg.......ih...ho',
        '.....gg.......ih..hho',
        '.....gi.......ihfhhfo',
        '....offj......ffjffjo',
        '....ooo.........oooo.',
      ],
    },
  ],
  sign1: [
    {
      at: [3, 5],
      rows: [
        '..gggi..........hh.....',
        '.ggi.g.........ih.h....',
        '.gii.g.........ih.h....',
        'gii...............h....',
        '.......................',
        '.......................',
        '...of.........ffjffo...',
        '................ooo....',
      ],
    },
  ],
  sign2: [
    {
      at: [3, 5],
      rows: [
        '..gggi.........hh....',
        '..gi.g........ih.h...',
        'oggi.g........ih.hho.',
        '.....g........ih...ho',
        '...............h...ho',
        '..................hfo',
        '....of........ffjffjo',
        '................oooo.',
      ],
    },
  ],
  sign3: [
    {
      at: [3, 5],
      rows: [
        'GGG..gg..........h.....',
        'G......g......ih.h.....',
        '..............ih.h.....',
        '...............ih......',
        '.......................',
        '.......................',
        '...of.........ffjffo...',
        '................ooo....',
      ],
    },
  ],
  charge: [
    {
      at: [4, 6],
      rows: [
        '.gggi.........ihh...',
        'gii.g........ih.hho.',
        'ih...........ih...ho',
        '............ih...hho',
        '................hfho',
        '...............ffjfo',
        '...............oooo.',
      ],
    },
  ],
  windup: [
    {
      at: [4, 8],
      rows: [
        '...gggi.........ihh...',
        'oggii.g........ih.hho.',
        '......g............ho.',
        '.....g............hho.',
        '..................hfho',
        '...................fjo',
        '....................o.',
      ],
    },
  ],
  smear: [
    {
      at: [7, 17],
      rows: [
        '.gg............hhhiiii..ii',
        'gii............hggii..g...',
        '...............hhii..i....',
        '..............ffjj..jf..f.',
      ],
    },
  ],
  dash: [
    {
      at: [7, 6],
      rows: [
        '.ggi...........h.....oo.',
        'giig...........hih..ogio',
        '...g...............ogifo',
        '..............hihhgiifjo',
        '...............hhhhfjfo.',
        '................ffjoo...',
        '.................oo.....',
      ],
    },
  ],
  strike: [
    {
      at: [5, 5],
      rows: [
        '.oooo',
        'oggii',
        'ogiih',
        'oihhh',
        'ooooo',
      ],
    },
    {
      at: [19, 5],
      rows: [
        'ih',
        'ih',
        'i',
      ],
    },
    {
      at: [19, 3], under: true,
      rows: [
        '...ooo...',
        '..oggio..',
        '..ogiiho.',
        '..ogiihho',
        '...oiihho',
        '....oihho',
        '....offjo',
        '....ooooo',
      ],
    },
  ],
  follow: [
    {
      at: [6, 6],
      rows: [
        '.oooo',
        'oggii',
        'ogiih',
        'oihhh',
        'ooooo',
      ],
    },
    {
      at: [20, 6],
      rows: [
        'ih',
        'ih',
        'i',
      ],
    },
    {
      at: [20, 4], under: true,
      rows: [
        '...ooo...',
        '..oggio..',
        '..ogiiho.',
        '..ogiihho',
        '...oiihhoo',
        '....oihhfo',
        '.....offjo',
        '.....oooo',
      ],
    },
  ],
  crouch: [
    {
      at: [5, 8],
      rows: [
        '..gggi.v.w..m..ih...',
        'ii.g.........ih.ih..',
        '...g.........ih.....',
        '...g.........ih.....',
        '................fjfo',
      ],
    },
  ],
  tuck: [
    {
      at: [6, 3],
      rows: [
        'gggi........hh......',
        '..g........ih.......',
        '..........ih........',
        '....................',
        '....................',
        '...ffjffjf..........',
        '...oooooooo...._....',
      ],
    },
  ],
  jump: [
    {
      at: [4, 6],
      rows: [
        'I.................',
        '.ggi..........hh..',
        '..i.g.......ihholo',
        '..i.g.......ih....',
        '....g.......ihhh..',
        '..of..........fjf.',
      ],
    },
  ],
  slump: [
    {
      at: [8, 6],
      rows: [
        '...........ih...',
        '..ggivw....ihho_',
        'gii.g.......ihh.',
        '..g........ih.h.',
        '.g.........ih...',
        '...........hhhho',
        '...........fjfo.',
        '...........oo...',
      ],
    },
  ],
  // sat cross-legged asleep: white to the elbows (below his hair, where it
  // shows), the open fronts either side of the vest's hem
  sleep: [
    {
      at: [4, 7],
      rows: [
        '.gg.............ih',
        '.gg.............ih',
        '.gii.g.......i.iih',
      ],
    },
  ],
  think: [
    {
      at: [2, 5],
      rows: [
        '...ggg...........hh...',
        '.oggi..........ih.hho.',
        '._.nm..........ih...ho',
        '__onmo.........ih...ho',
        '__onm.N........ih...ho',
        '__onmNMO.......ih...ho',
        '._oooo...........ifhfo',
        '....of.........ffjffjo',
        '.................oooo.',
      ],
    },
  ],
  // arms folded (the vest's crossed): the short white sleeves over the
  // upper arms to the elbows, flared a pixel; the front edges hanging either
  // side of the vest below the folded arms, the back panel behind the far
  // arm, its flames along the hem
  crossed: [
    {
      at: [3, 5],
      rows: [
        '..gggi.........ihh..',
        'oggi.............hho',
        '..GI.............HHO',
        '.....g.........ihhho',
        '.....g.........ihhho',
        '.....gp........ifhfo',
        '....of.........fjfjo',
        '................ooo.',
      ],
    },
  ],
  alert: [
    {
      at: [3, 5],
      rows: [
        'GI...................',
        '.GI................ih',
        '..ggg...........ihh..',
        '......g........ih....',
        '......g........ih....',
        '.....g........ih.....',
        '.....g........ih.....',
        '.....g.........hho...',
        '....of........fjfo...',
        '................oo...',
      ],
    },
  ],
  thumbs: [
    {
      at: [5, 5],
      rows: [
        'gggi.........ihh...',
        'gi.g........ih.hho.',
        'ii.g........ih...ho',
        '...g........ih...ho',
        '...g........ih...ho',
        '...gp.......ihfhhfo',
        '..of........ffjffjo',
        '..............oooo.',
      ],
    },
  ],
  // the cheer's grip: the thumbs-up's arm, so its sleeve
  grip: [
    {
      at: [5, 5],
      rows: [
        'gggi.........ihh...',
        'gi.g........ih.hho.',
        'ii.g........ih...ho',
        '...g........ih...ho',
        '...g........ih...ho',
        '...gp.......ihfhhfo',
        '..of........ffjffjo',
        '..............oooo.',
      ],
    },
  ],
  scratch: [
    {
      at: [2, 11],
      rows: [
        'GI....................',
        'gi....................',
        'gi....................',
        '.gi...................',
        '..gi..................',
        '...gggi.........ihh...',
        '......g........ih.hho.',
        '......g........ih...ho',
        '......g........ih...ho',
        '......g........ih...ho',
        '......gp.......ihfhhfo',
        '.....of........ffjffjo',
        '.................oooo.',
      ],
    },
  ],
  poke: [
    {
      at: [5, 5],
      rows: [
        'gggi.........ihh.....',
        'gi.g........ih.h.....',
        'gi.g........ih.h.....',
        '.............h.......',
        '.....................',
        '...g.........hhh.....',
        '..of........ffjfo....',
        '..............oo.....',
      ],
    },
  ],
  kick: [
    {
      at: [10, 4],
      rows: [
        '.oo',
        'ogg',
        'ogi',
        'oi',
      ],
    },
    {
      at: [19, 5],
      rows: [
        'ih',
        'ih',
      ],
    },
    {
      at: [19, 3], under: true,
      rows: [
        '..ooo....',
        '.oggiio..',
        '.ogiihho.',
        '..oiihhho',
        '...oihhfo',
        '....offjo',
        '.....ooo.',
      ],
    },
  ],
  raise: [
    {
      at: [3, 13],
      rows: [
        'GI...................',
        '.Gi..................',
        '..gi.................',
        '..gggi.........ihh...',
        '.___.g........ih.hho.',
        '.....g........ih...ho',
        '.....g........ih...ho',
        '.....g........ih...ho',
        '.....gp.......ihfhhfo',
        '....of........ffjffjo',
        '................oooo.',
      ],
    },
  ],
  slam: [
    {
      at: [4, 7],
      rows: [
        '..oo',
        '.ogg',
        'ogio',
        'oho.',
      ],
    },
    {
      at: [17, 5],
      rows: [
        '...oooo.',
        '..ogghio',
        '..ogiiho',
        '.ogiihho',
        'ogiihhho',
        'ofjffjfo',
      ],
    },
  ],
  spread: [
    {
      at: [4, 5],
      rows: [
        '.gggi..........hh..',
        'gi..g........ihiho_',
        '....g........ih....',
        '....g........ih....',
        '....g........ih....',
        '....gp........hhho.',
        '...............fjfo',
        '.................o.',
      ],
    },
  ],
  punch: [
    {
      at: [4, 5],
      rows: [
        '..oooo',
        '.oggii',
        '.ogiih',
        '.oihhh',
        '.ooooo',
      ],
    },
    {
      at: [18, 5],
      rows: [
        'ih',
        'ih',
        'i',
      ],
    },
    {
      at: [19, 4], under: true,
      rows: [
        '..ooo..',
        '.oggio.',
        '.ogiiho',
        '.ogiiho',
        '.oiihho',
        '..oihho',
        '..offjo',
        '..oooo.',
      ],
    },
  ],
  gather: [
    {
      at: [5, 6],
      rows: [
        'gggi.........ihh.....',
        'gi.g........ih.h.....',
        '.....................',
        '.....................',
        '...g...........hhho..',
        '................fjo..',
        '.................oo..',
      ],
    },
  ],
  // driving the Rasengan down (anims/minato.ts's drive): the short sleeve at
  // the shoulder, the back panel flung up behind him
  drive: [
    {
      at: [18, 2], under: true,
      rows: [
        '..ooo...',
        '.oggio..',
        '.ogiiho.',
        '.ogiihho',
        '..oiihho',
        '...oihho',
        '...offjo',
        '...oooo.',
      ],
    },
  ],
  wave: [
    {
      at: [5, 9],
      rows: [
        '.................._..',
        '................._...',
        '................._...',
        '................._...',
        '.....................',
        '..................ih.',
        '.................ih..',
        'gggi.........ihih....',
        'gi.g........ih.ho....',
        '...g........ih.ho....',
        '...g........ih.ho....',
        '...g........ih.hho...',
        '...gp.......ihfhho...',
        '..of........ffjffo...',
        '..............ooo....',
      ],
    },
  ],
}

// every pose's Wind wears its haori
const HAORI: Readonly<Record<string, readonly Overlay[]>> = {
  ...OVERLAYS,
  cheer: OVERLAYS['grip']!,
  cheer2: OVERLAYS['grip']!,
  sign1Wind: up(OVERLAYS['sign1']!),
  sign2Wind: up(OVERLAYS['sign2']!),
  sign3Wind: up(OVERLAYS['sign3']!),
  crossedWind: up(OVERLAYS['crossed']!),
  gatherWind: up(OVERLAYS['gather']!),
  chargeWind: up(OVERLAYS['charge']!),
  spreadWind: up(OVERLAYS['spread']!),
  alertWind: up(OVERLAYS['alert']!),
  punchWind: up(OVERLAYS['punch']!),
  raiseWind: OVERLAYS['raise']!,
  strikeWind: OVERLAYS['strike']!,
  slamWind: OVERLAYS['slam']!,
}

// his cheer: the kunai caught in a reverse grip, the knowing smile, then the
// wink (his companion cheer, the thumbs-up's place, is the grip too)
const POSES = {
  ...MINATO_POSES,
  thumbs: { ...MINATO_POSES.grip, eyes: 'smug' },
  cheer: { ...MINATO_POSES.grip, eyes: 'smug' },
  cheer2: { ...MINATO_POSES.grip, eyes: 'wink' },
} as const

// the vest as his moves see it, his own poses in it (their beats' poses and faces)
const WORN: Template = wear(VEST, POSES)

export const MINATO: NinjaSprite = {
  id: 'minato',
  template: VEST,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  heads: { turn: HEAD_TURN },
  poses: POSES,
  overlays: HAORI,
  ...minatoMoves(WORN),
}

register(MINATO)
