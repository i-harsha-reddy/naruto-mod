// Gaara as a native sprite: everything that is his own over the shared
// 'robe' template (templates/robe.ts): his colours for its letters, his
// hand-drawn head (and the head turned to the post) and eyes, the gourd slung
// on his back (a prop, its neck and cork up over his shoulder behind his
// head) and its strap (baked into his own copy of the robe), the one pose he
// does his own way (he never sleeps), and his moves (anims/gaara.ts).

import { gaaraMoves } from '../anims/gaara.ts'
import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { ROBE, dress } from '../templates/robe.ts'
import type { HandEyes, HeadGrid, NinjaSprite, PoseGrid, Prop } from '../types.ts'

// ------------------------------------------------------------------ head

// The hand-drawn 21 x 19 head with a 1 px dark outline traced round it, so
// the spikes hold their shape in front of the sand. The hair in clean tufts,
// three reds and a highlight, lit from the top left, a dark crease between
// each tuft; the fringe parted over the brow on his left, where the 'love'
// kanji sits on bare skin, crisp. The dark lids over his eyes and the soft
// rings round them are the head's; the eyes inside the rings are drawn by EYES.
//   a b c k  hair: shadow, mid, lit, highlight
//   d e      skin, its shadow
//   f r      the dark lid line over each eye, the soft ring round it
//   g        the kanji
//   h        the nose's shade
//   o        outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#781a20 b:#b8322c c:#e45c3c k:#f89a6c d:#f5dfcf e:#dcc0b0
    f:#2e1622 r:#8c5a66 g:#b0102a h:#c09484 o:#140a10
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
      '......o....o..o......',
      '...o.oko.oocoobo.o...',
      '..ocookcoccbobbbobo..',
      '..occokcccabbbbbabbo.',
      '.occcccccacbbbbbabao.',
      'occccccbacbbbbbabbaao',
      '.obcccbbabbbbbbabbao.',
      'obbccbbabbbbbbaabbbao',
      '.oabcbbabbbbaddgddbao',
      '.oabbbaabbbaddgggdao.',
      '.oabbaddabadddgdgdao.',
      '.oabadffddddffddddao.',
      '.oabardddrdrdddrdbao.',
      '..oabrdddrdrdddrbao..',
      '...oaddrrdddrrdeao...',
      '....ooddddhdddeoo....',
      '......odddddeeo......',
      '.......ooddeoo.......',
      '.........ooo.........',
    ],
}

// The head turned three-quarters toward the post (strikes, throws): the
// face, the kanji and the jaw three pixels nearer the post, the near cheek
// at the head's edge, the far eye close to the far cheek, the hair swung two
// pixels back over the far side (the spikes shifted, the far hair a mass
// down to the jaw), so the outline itself turns.
export const TURN: HeadGrid = {
  ...HEAD,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  rows: [
    '........o....o..o....',
    '.....o.oko.oocoobo.o.',
    '....ocookcoccbobbbobo',
    '...occokcccabbbbbabbo',
    '..occcccccacbbbbbabao',
    '.occcccbacbbbbbabbaao',
    '.obccbbabbbbbbabbbbao',
    '.obcbbabbbbbbaabbbbao',
    '.oabcbabbaddgddbbbbao',
    '.oabbaabbddgggdbbbbao',
    '.oaddabadddgdgdbbbbao',
    '.oaffddddffddeabbbbao',
    '.ordddrdrdddreabbbbao',
    '.ordddrdrdddrbabbbao.',
    '.oddrrdddrrdeoabbbao.',
    '..oddddhdddeoabbao...',
    '...odddddeeo.........',
    '....ooddeoo..........',
    '......ooo............',
  ],
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid (stamped with its top-left at the viewer's left eye
// plus `at`), inside the dark rings of the head: pale sea-green irises with a
// glint, a pinprick of pupil toward the nose.
//   l lid, p pupil, w glint, i iris, s e skin and its shade, r a ring faded
//   toward the skin (closed eyes), f the ring, m his mouth
export const EYES: HandEyes = {
  palette: pal(`l:#2a1420 p:#1a1420 w:#f4fbf8 i:#86d8c6 s:#f5dfcf e:#dcc0b0 r:#b89490 m:#8a5a5a f:#3a1e2a`),
  states: {
    // the flat, unblinking stare
    open: { at: [0, 0], rows: ['wi...wi', 'ip...pi'] },
    // a look at the post
    left: { at: [0, 0], rows: ['wi...wi', 'pi...pi'] },
    half: { at: [0, 0], rows: ['ll...ll', 'ip...pi'] },
    // shut: a line low in each eye, the rings faded round it
    shut: { at: [-1, -1], rows: ['.rr...rr.', 'rssr.rssr', 'rllr.rllr', '.rr...rr.'] },
    // the ring pulled down at the inner corners, the lids lowered outside
    focus: { at: [0, -1], rows: ['.f...f.', 'li...il', 'ip...pi'] },
    // an arch over each shut eye, the rings faded so it reads as a smile
    happy: { at: [-1, -1], rows: ['.rr...rr.', 'rllr.rllr', 'lssl.lssl', '.rr...rr.'] },
    // the lids drooped, looking down
    sad: { at: [-1, -1], rows: ['..f...f..', '.ss...ss.', '.ip...pi.'] },
    // startled: the irises shrunk to pinpricks in the whites
    wide: { at: [0, 0], rows: ['ww...ww', 'wp...pw'] },
    // his cheer's face: the eyes open, the small smile he keeps for friends
    smile: { at: [0, 0], rows: ['wi...wi', 'ip...pi', '..m.m..', '...m...'] },
  },
}

// ------------------------------------------------------------------ body

// The robe's letters in his colours: a maroon long coat (the sleeves a step
// lighter, so an arm across it still reads), the same maroon trousers, a grey
// sash; i j his strap, a e d c f the gourd (sand, shade, light, cork, band).
export const BODY = pal(`
  o:#140a10
  s:#f5dfcf k:#dcc0b0
  v:#b4404c w:#862c3c x:#561a2a
  n:#cc5a64 m:#9a3444 l:#621e30
  g:#aaa298 h:#6e6860
  p:#4a3448 q:#382838 r:#261a28
  t:#2e2c3a u:#58566c b:#382838
  i:#b8b2ac j:#7e7874
  a:#caa66a e:#96743e d:#ecd296 c:#6a4024 f:#5a3820
  y:#e8603e z:#b32c26
`)

// ------------------------------------------------------------------ what he wears

// The sand gourd slung on his back, its neck and cork up over his right
// shoulder (the arena side) behind his head, the defining shape of him: worn
// at each pose's nape, drawn behind the body and head, so an arm raised on
// that side hides it.
const GOURD: Prop = {
  on: 'back',
  at: [-15, -9],
  behind: true,
  rows: [
    '.oo.......',
    'occo......',
    'occco.....',
    '.offfo....',
    '.oddaaoo..',
    'oddaaaaeo.',
    'odaaaaaeeo',
    'oaaaaaaeeo',
    'oaaaaaeeeo',
    '.oaaaeeeo.',
    '..oooooo..',
  ],
}

// The gourd's grey strap over his near shoulder and across the chest to the
// hip, at the nape, but only over the coat and sash (an arm across the chest
// stays in front of it).
const STRAP = { at: 'back' as const, anchor: [6, 0] as const, on: 'vwxgh', rows: ['.......', 'ii.....', '.ii....', '..iij..', '....jj.'] }

// SLEEP: he never sleeps. When the others nod off he sits down cross-legged
// as they do, but upright, with his arms folded, head up (a pixel higher than
// their drooped heads), eyes open, watching.
const SLEEP: PoseGrid = {
  as: 'sleep',
  head: [0, 1],
  eyes: 'open',
  // (the robe's folded arms as standing, a row lower with the head: the fist
  // on the far arm beside the chin, the near forearm under it, the far
  // forearm under that, the sash below them; the skirt spread over the
  // knees, a pixel or two past the head on each side, and open at the front
  // on the crossed shins, the sandals' toes peeking where they cross)
  points: { back: [16, 5], waist: [16, 10] },
  rows: [
    '.............................',
    '.............................',
    '.............................',
    '.............................',
    '.............................',
    '........oooooooooooooooo.....',
    '.......ONNOvvvwwwwwwwOMLO....',
    '.......ONMOvvwwwwwwxOSSLO....',
    '.......ONMSKllllllnnnSKLO....',
    '.....ooOMnnnnnnnnnnllllLOooo.',
    '....ovvwoogghgghgghhhhoowwxxo',
    '....ovwwwwwwouutquutowwwwxxxo',
    '.....ooooooooooooooooooooooo.',
  ],
}

// his copy of the robe: the gourd, the strap, his sleep
export const GAARA_ROBE = dress(ROBE, { poses: { sleep: SLEEP }, marks: [STRAP] })

export const GAARA: NinjaSprite = {
  id: 'gaara',
  template: GAARA_ROBE,
  body: BODY,
  head: HEAD,
  heads: { turn: TURN },
  eyes: EYES,
  props: [GOURD],
  ...gaaraMoves(GAARA_ROBE),
}

register(GAARA)
