// Tsunade as a native sprite: the 'top' template (templates/top.ts) as her
// grey kimono top and blue sash under the green haori, dark trousers and
// heeled sandals; her hand-drawn head (the blonde pigtails, the violet
// diamond on her brow), her amber eyes drawn over both eyes and the mouth at
// once, the haori worn open over it all (overlays: its fronts and skirts, its
// tail flying out behind her in the action poses with the "gamble" roundel
// showing), the Strength of a Hundred seal as her dojutsu, and her moves
// (anims/tsunade.ts).

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { TOP } from '../templates/top.ts'
import type { Dojutsu, Grid, HandEyes, HeadGrid, NinjaSprite, Overlay, Prop } from '../types.ts'
import { CHEER, HEAVENLY_FOOT, HUNDRED, KATSUYU, QUICK } from '../anims/tsunade.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head with a 1 px
// dark outline traced round it, one column wider and (for the pigtails' tips)
// one row taller; seated with its top 23 rows over the feet, the chin on the
// neck.
//   a b c  hair: mid, shadow, light
//   d      the dark gold of the pigtails' ties
//   e f    skin, its shadow
//   g i    the violet diamond, its glint
//   h      the mouth
//   k      the seal's marks (the Strength of a Hundred released: SEAL)
//   o      outline
const PALETTE = pal(`
  a:#f8d870 b:#d8a038 c:#fff2b8 d:#a86e1c e:#fad8bc f:#e6b090
  g:#8a3ee0 h:#d06868 i:#c084ff o:#0e1019 k:#3a1060
`)

const HEAD: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.......ooooooo.......',
    '.....ooaaaaaaaoo.....',
    '....oacccaaaaaaao....',
    '...oaccaaaaaaaaabo...',
    '..oacaaaaaaaaaaabbo..',
    '..oaaaaaaabaaaaabbo..',
    '..oaaaaaabebaaaabbo..',
    '..oaaaaabeeebaaabbo..',
    '..oaaaabeeieebaabbo..',
    '..oaaabeeegeeebabbo..',
    '..oaabeeeeeeeeebbbo..',
    '..oabeeeeeeeeeeebbo..',
    '..oabeeeeeeeeeeebbo..',
    '..oabeeeeeeeeeeebbo..',
    '..oabeeeeeeeeeeebbo..',
    '.odddeeeeeheeeefdddo.',
    '.ocaaoeeeeeeeffoabbo.',
    '.ocaaooofffffoooabbo.',
    '..oabo..ooooo..obbo..',
    '...oo...........oo...',
  ],
}

// The head turned three-quarters toward the arena, for the blows (strike,
// punch, the run, the kick, the heel): a real turned head, not the front one
// slid over. The face at the front edge, the far cheek its contour with the
// nose's tip breaking it, the jaw running back up from the chin to the ear
// (a skin notch between cheek and hair), the parting and the diamond turned
// with it; the hair swept back from the brow over a round crown (a strand of
// shade following it back, the light along the crown), narrowing at the nape
// where the near pigtail is tied and swings out behind. The eyes three
// pixels left.
const TURN: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '.......ooooooo.........',
    '.....ooaaaaaaaoo.......',
    '....oacccccaaaaabo.....',
    '...oacccaaaaaaaaabbo...',
    '..oacaaaaaabaaaaaabbo..',
    '..oaaaabaaaaabaaaaabbo.',
    '..oaaabebaaaaaabaaabbo.',
    '..oaabeeebaaaaaabaabbo.',
    '..oabeeieebaaaaaabaabbo',
    '..oaeeegeeeebaaaaabaabo',
    '..oaeeeeeeeeebaaaaababo',
    '..oaeeeeeeeeefoaaaababo',
    '..oaeeeeeeeeefeoaaabbo.',
    '.oeeeeeeeeeeefeoaabbo..',
    '..oeeeeeeeeefoaaabbo...',
    '..odeeeheeeefoaabdddo..',
    '..ocoeeeeeffobbbbaabbo.',
    '..ocaoffffoo.obbbaabbo.',
    '...oo.oooo....oobbbo...',
    '...................oo..',
  ],
}

// ------------------------------------------------------------------ the seal

// The Strength of a Hundred released: the Byakugo seal's marks spread from
// the diamond over her brow and down her cheeks (k). It is her dojutsu (a
// cel's `awake`), the eyes her own; a move spreads it in stages first
// (the eye states 'seal1' and 'seal2' below draw the marks as they creep
// out, then the head takes over), and draws it back the same way.
const SEALED: Readonly<Record<number, string>> = {
  7: '..oaaaaabekebaaabbo..',
  8: '..oaaaabekikebaabbo..',
  9: '..oaaabekegekebabbo..',
  10: '..oaabekeeeeekebbbo..',
  14: '..oabkeeeeeeeeekbbo..',
  15: '.odddekeeeheeekfdddo.',
}
const SEAL: Dojutsu = {
  head: { ...HEAD, rows: HEAD.rows.map((r, y) => SEALED[y] ?? r) },
}
// and on the turned head, slid with the face
const SEALED_TURN: Readonly<Record<number, string>> = {
  7: '..oaabekebaaaaaabaabbo.',
  8: '..oabekikebaaaaaabaabbo',
  9: '..oaekegekeebaaaaabaabo',
  10: '..oakeeeeekeebaaaaababo',
  14: '..oekeeeeeekfoaaabbo...',
  15: '..odkeeheeekfoaabdddo..',
}
const TURN_SEAL: HeadGrid = { ...TURN, rows: TURN.rows.map((r, y) => SEALED_TURN[y] ?? r) }

// ------------------------------------------------------------------ eyes

// Hand-drawn faces, each over both eyes (columns 0-1 and 5-6 of the grid
// stamped at the left eye) and, where the face changes it, the mouth.
//   l lid, p pupil, g iris, h its light, w white, s e skin and its shadow,
//   m mouth, d its inside, t tongue, k the seal's marks, i their glow
const FOCUS: Grid = ['.l.....l.', '..l...l..', '.ll...ll.', '.gp...pg.']
const EYES: HandEyes = {
  palette: pal(`
    l:#3a2018 p:#3a2410 g:#b07c3c h:#e8c890 w:#ffffff s:#fad8bc e:#e6b090
    m:#c05a5a d:#5a1a1a t:#e87070 k:#3a1060 i:#c084ff
  `),
  states: {
    // wide awake: the lash line over a two-row iris, the pupils toward the nose
    open: { at: [0, -1], rows: ['ll...ll', 'gp...pg', 'hg...gh'] },
    // a glance at the arena (left)
    left: { at: [0, -1], rows: ['ll...ll', 'pg...pg', 'gh...gh'] },
    // a blink's half frame, drowsy: the lash down a row
    half: { at: [0, -1], rows: ['ss...ss', 'll...ll', 'gp...pg'] },
    // shut (a blink, sleep, a landing): a soft U, the lash tails up
    shut: { at: [-1, -1], rows: ['.ss...ss.', 'lss...ssl', '.ll...ll.'] },
    // focus: the brows slanting down to the nose, the lids lowered
    focus: { at: [-1, -2], rows: FOCUS },
    // happy: ^^ arcs and an open smile
    happy: { at: [-1, -1], rows: ['.ll...ll.', 'l..l.l..l', '.ss...ss.', '.........', '...mdm...', '....t....'] },
    // sad (the slump): the brows up at the nose, the lids down, a small frown
    sad: { at: [-1, -2], rows: ['..l...l..', '.l.....l.', '.ll...ll.', '.pg...gp.', '.........', '....m....', '...m.m...'] },
    // surprised (alert): wide whites, pinprick pupils, an o mouth
    wide: { at: [0, -1], rows: ['ll...ll', 'ww...ww', 'wp...pw', '.......', '...d...', '...d...'] },
    // smug (a job done): the lids lowered, a smirk up one side
    smug: { at: [-1, -1], rows: ['.ss...ss.', '.ll...ll.', '.gp...pg.', '.....m...', '...mm....'] },
    // the hello: a wink and a smirk (her cheer: leave it to me)
    wink: { at: [-1, -1], rows: ['.ll...ll.', '.gp..l..l', '.hg......', '.....m...', '...mm....'] },
    // the battle cry: the focus brows and lids, the mouth open wide
    shout: { at: [-1, -2], rows: [...FOCUS, '.........', '...ddd...', '...dtd...'] },
    // the seal creeping out of the diamond, the focus face under it: its
    // first marks round the diamond, glowing...
    seal1: { at: [-1, -5], rows: ['....i....', '...i.i...', '.........', ...FOCUS] },
    // ...then down the brow and onto the cheeks, darkening (the seal head next)
    seal2: { at: [-2, -5], rows: ['.....k.....', '....k.k....', '...i...i...', ...FOCUS.map(r => `.${r}.`), 'i.........i'] },
  },
}

// ------------------------------------------------------------------ body

// The top's letters in her colours: the grey kimono top (no mark on it), the
// green haori's sleeves (its elbows the same green) and skirts, the blue sash,
// dark trousers and sandals; the scroll she reads (cream, brown rollers), and
// the haori's roundel in the same cream and brown.
const BODY = pal(`
  o:#0e1019
  s:#fad8bc k:#e6b090
  v:#c8c8c0 w:#a2a29a x:#74746e
  n:#7aa65a m:#5c8440 l:#3e5e2a
  f:#7aa65a i:#5c8440 j:#3e5e2a
  b:#34407a
  p:#4c5476 q:#32374f r:#1e2134
  t:#1e2134 u:#4c5476
  g:#7aa65a h:#5c8440
  c:#c8c8c0
  a:#f4ecd8 e:#7a5030 d:#5a4a40
  y:#f8d870 z:#d8a038
`)

// ------------------------------------------------------------------ the haori

// The green haori worn open over the grey kimono: its fronts down either side
// of the kimono and the sash, its skirts hanging past the knees either side
// of the legs. In the action poses it swings: its tail flies out behind her,
// showing the pale roundel on its back with the "gamble" kanji (a d).
// (Bottom-aligned on the pose: '.' keeps the template's pixel.)
// standing, hands at the sides: the fronts at columns 9 and 16, the skirts
// either side of the legs
const HAORI: Grid = [
  '.........n......m.........',
  '.........n......m.........',
  '.........n......m.........',
  '.........n......m.........',
  '.........n......m.........',
  '.....of............jo.....',
  '.....ofi..........ijo.....',
  '......o............o......',
]
// the near arm away from the side (its skirt corner outlined from above)
const HAORI_L: Grid = HAORI.map((r, y) => (y === 4 ? '......o..n......m.........' : r))
// the far arm away from the side
const HAORI_R: Grid = HAORI.map((r, y) => (y === 4 ? '.........n......m..o......' : r))
// both arms away from the sides
const HAORI_LR: Grid = HAORI.map((r, y) => (y === 4 ? '......o..n......m..o......' : r))
// the hanging skirts alone (the fronts hidden behind the arms)
const SKIRTS: Grid = ['......o............o......', '.....of............jo.....', '.....ofi..........ijo.....', '......o............o......']

const ov = (rows: Grid): readonly Overlay[] => [{ rows }]
const OVERLAYS: Readonly<Record<string, readonly Overlay[]>> = {
  idle0: ov(HAORI),
  // the breath: the fronts down a pixel with the shoulders, the skirts out
  idle1: [{ at: [0, 6], rows: ['.........n......m.........', '.........n......m.........', '.........n......m.........', '.........n......m.........', '..........................', '....ofi.............ijo...', '.....o...............o....'] }],
  // the hands at the chin, the elbows wide: the fronts down the kimono, the skirts beside the legs
  // the hands at the collar, the arms in front of the fronts: the skirts alone, beside the legs
  sign1: [{ at: [0, 11], rows: ['....ofi............ijo....', '.....o..............o.....'] }],
  sign2: [{ at: [0, 10], rows: ['.....of............jo.....', '.....ofi..........ijo.....', '......o............o......'] }],
  sign3: [{ at: [0, 11], rows: ['.........n....m...........', '.........n....m...........', '.........n....m...........', '.....of............jo.....', '.....ofi..........ijo.....', '......o............o......'] }],
  think: [{ at: [0, 11], rows: ['.....ofi..........ijo.....', '......o............o......'] }],
  // the rising kick: the haori's tail streams out behind the standing leg, the roundel showing
  kick: [{ at: [18, 12], rows: ['.jjjjo..', 'oiiaado.', '.oooooo.'] }],
  // in the air: the skirts fly up behind the thigh and flap under the front leg
  leap: [{ at: [6, 12], rows: ['offf', '.oo.'] }, { at: [16, 7], rows: ['..oo', '.ojjo', 'ofjo.', 'oo..'] }],
  // (the heel up: the haori's skirts fall below the hip in the template's own drawing)
  // a hand on the hip: the fronts down the kimono, the skirts beside the legs
  hip: [{ at: [0, 13], rows: ['........n.....m...........', '........n.....m...........', '..........................', '.....of...........jo......', '.....ofi.........ijo......', '......o...........o.......'] }],
  flick: [{ at: [0, 14], rows: ['...........n....m.........', '..........................', '.....of............jo.....', '.....ofi..........ijo.....', '......o............o......'] }],
  // the arms folded over the kimono: the blue sash showing under them
  // between the haori's fronts, the skirts beside the legs
  crossed: [{ at: [0, 10], rows: ['.....ofnbbbbbbbbbbmjo.....', '.....ofi..........ijo.....', '......o............o......'] }],
  poke: ov(SKIRTS),
  cheer: ov(HAORI_L),
  cheer2: ov(HAORI_L),
  scratch: ov(HAORI_L),
  raise: ov(HAORI_L),
  wave: ov(HAORI_R),
  alert: ov(HAORI_LR),
  // the wide stance: the skirts out past the feet
  gather: ov(['....o...............o.....', '....o................o....', '..........................']),
  // arms flung wide, feet apart: the skirts flare out past the feet
  spread: ov(['...oooo............oooo...', '...offf............jjjo...', '...ofio............oijo...', '....oo..............oo....']),
  // crouched: the tail swings out behind
  charge: ov(['.........n......m....oo...', '.........n......m...ofio..', '..................fiado...', '...................ijjo...', '....................oo....']),
  // sunk low, rocked back: the haori pools behind her
  windup: ov(['.....................oo...', '......................jo..', '.......................jo.', '.......................oo.']),
  // the lunge: the tail flies up and out behind her, the roundel showing
  strike: ov([
    '........................ooo.',
    '.......................ofijo',
    '......................ofiaao',
    '......................oiiado',
    '......................oijjo.',
    '.....................jjooo..',
    '......................oo....',
    '............................',
  ]),
  // the deepest lunge: the tail streams straight back from the hip
  punch: ov(['........................oooo.', '.......................oiaajo', '......................oiiadjo', '.....................jjjjjooo', '........................oooo.', '.............................']),
  // carried past the hit: the tail flung up behind, over the kicked-up leg
  follow: ov([
    '........................ooo.',
    '.......................ofio.',
    '.......................oiaao',
    '.......................oiado',
    '.......................jjjo.',
    '............................',
    '............................',
    '............................',
  ]),
  // the run: the haori streams flat out behind, under the far hand
  dash: ov(['..................oooo....ooo', '....................iiaajjjjo', '.......................ojjjjo', '........................oooo.']),
  // the stomp: the haori whipped out behind the head, past the far knee
  stomp: [{ at: [26, 16], rows: ['....ooo', '..oojjo', '.ojjjjo', 'ojiiado', '.ooooo.'] }],
  // the hop: the skirts flare out either side
  jump: ov(['......o............o......', '.....ofi..........ijo.....', '.....ooo..........ooo.....', '..........................']),
  // the landing: the skirts spread on the ground
  crouch: ov(['..offo..............ojjo..', '..oooo..............oooo..']),
  // down on one knee: the haori fans out behind
  slam: ov(['......................o...', '......................jo..', '......................jjo.', '........................o.']),
  // the smear: the haori streams out behind with the rest, its streaks in its own green
  smear: ov(['..................oooo....ooo........', '....................iiaajjjjo...ij..j', '.......................ojjjjo..jj..j.', '........................oooo.........']),
}

// A moving hold's other drawing (templates/top.ts's <pose>Wind: the hem
// trailing): the near pigtail's tip swung out behind her too (UPPERCASE over
// the head's edge, measured from the head), the pose's haori as it is
const PIGTAIL: Overlay = { on: 'head', at: [17, 17], rows: ['..ZO', '.ZZO', '.OO.'] }
const WINDS = ['gather', 'windup', 'slam', 'sign1', 'sign2', 'sign3', 'crossed', 'strike', 'follow', 'pump', 'hip', 'charge']
const STIRRED: Readonly<Record<string, readonly Overlay[]>> = Object.fromEntries(WINDS.map(p => [`${p}Wind`, [...(OVERLAYS[p] ?? []), PIGTAIL]]))

// The two low pigtails falling on past the shoulders (her silhouette's
// break): drawn behind the body from under the head's ties, so they show
// only beside the arms, each tail's tip curling out from the body (a notch
// of the background between tip and sleeve); riding with the head.
const TAILS: Prop = {
  on: 'head',
  at: [-2, 16],
  behind: true,
  palette: PALETTE,
  rows: [
    '..oaa..................',
    '.ocaab...........aabbo.',
    '.ocaab...........aabbo.',
    '.ocaab...........oabbbo',
    'ocaab.............oabbo',
    'ocao...............obbo',
    '.oo.................oo.',
  ],
}

export const TSUNADE: NinjaSprite = {
  id: 'tsunade',
  template: TOP,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  dojutsu: SEAL,
  overlays: { ...OVERLAYS, ...STIRRED },
  heads: { turn: TURN, turnSeal: TURN_SEAL },
  props: [TAILS],
  // her cheer is her own: a hand on the hip, a finger raised, a wink and a
  // smirk ("leave it to me"), stirring as she holds it
  poses: { thumbs: 'hip', thumbsWind: 'hipWind' },
  poseEyes: { thumbs: 'wink', hip: 'wink' },
  moves: [HEAVENLY_FOOT, HUNDRED, KATSUYU],
  quick: QUICK,
  cheer: CHEER,
}

register(TSUNADE)
