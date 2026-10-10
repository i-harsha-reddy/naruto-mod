// Naruto as a native sprite (Shippuden): the 'jacket' template
// (templates/jacket.ts) in orange with the black yoke and collar, orange
// trousers; his hand-drawn head with the whisker marks, his eyes drawn over
// both eyes at once, Sage Mode as his dojutsu (the toad's pigment round the
// eyes, gold toad eyes with a bar of a pupil), the nightcap he sleeps in, and
// his moves (anims/naruto.ts).

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { JACKET } from '../templates/jacket.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite, Overlay, Prop } from '../types.ts'
import { CHEER, CLONES, NARUTO_POSES, QUICK, RASENGAN, RASENSHURIKEN } from '../anims/naruto.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head, a 1 px dark
// outline traced round it (one column wider on the right for it).
//   a b c  hair: highlight, light, shadow
//   d e    skin, its shadow under the bangs
//   f      the mouth
//   w      the whisker marks: two thin dark lines on each cheek (the lower
//          one reaching the jaw's edge), never a smudge
//   g h i  the headband: cloth, plate, the plate's shade
//   o      outline
const PALETTE = pal(`
  a:#fff27a b:#ffcc22 c:#e58a12 d:#f8d0a8 e:#dc9a70
  f:#9a5038 g:#2a2c3e h:#eef0f6 i:#a8b0c4 o:#0e1019 w:#3a2028
`)

const HEAD: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.....o.....o....o....',
    '..o.oao...oao..oao...',
    '.oaooabo.oaabooabo...',
    '.oaaoabboaabbbabbco..',
    '.oaabbbbbbbbbbbbbbco.',
    'oaabbbbbbbbbbbbbbbcco',
    '.oabbbbbbbbbbbbbbbco.',
    'oagggghhhhhhhhhggggco',
    'obggggiiiigiiiiggggco',
    'oabbbcbbbcbbbcbbbccco',
    'oabcbeebeebeebeebcco.',
    '.obccddddddddddeccco.',
    '..occddddddddddecco..',
    '...ooddddddddddeoo...',
    '....owwdddddddwwo....',
    '....odddddfddddeo....',
    '.....wwddddddeww.....',
    '......ooddddeoo......',
    '........ooooo........',
  ],
}

// The head turned three-quarters toward the post, for the blows (the strike,
// punch, dash, kick and slam cels ask for it: { head: 'turn' }): the face
// three pixels nearer the post, the far cheek foreshortened against the
// outline, the plate turned with it and the cloth wrapping round the near
// side, the side of the head in shadowed hair, the chin carried forward.
// The eyes are at [4, 12] and [9, 12].
const TURN: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '.......o.....o....o....',
    '....o.oao...oao..oao...',
    '...oaooabo.oaabooabo...',
    '..oaaoabboaabbbabbbco..',
    '.oaabbbbbbbbbbbbbbbbco.',
    'oaabbbbbbbbbbbbbbbbbcco',
    '.oabbbbbbbbbbbbbbbbbbco',
    'oaghhhhhhhhhggggggggcco',
    'obgiiiigiiiiggggggggcco',
    'oabbcbbbcbbbbbbbbbbccco',
    'obeebeebeebebbbbbbbccco',
    '.oddddddddddebbbbbbcco.',
    '.oddddddddddeodecbbcco.',
    '.oddddddddddeoeeobcco..',
    '.owwdddddddwwooooooo...',
    '..oddddfdddeo..........',
    '...wwddddeww...........',
    '....oodddeo............',
    '......ooo..............',
  ],
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid, stamped with its top-left at the left eye [7, 12]
// plus `at`. l lash/lid, p pupil, b iris, w glint, s skin, m mouth, t teeth,
// r tongue; y n g the toad eyes.
const EYES: HandEyes = {
  palette: pal(`
    l:#3a2228 p:#14305e b:#2e8cf6 w:#dff0ff s:#f8d0a8 e:#dc9a70
    m:#5a1e22 t:#fff8f0 r:#e8606a
    y:#ffb428 n:#2a1606 g:#e8742c
  `),
  states: {
    open: { at: [0, 0], rows: ['wp...pw', 'bp...pb'] },
    left: { at: [0, 0], rows: ['pw...pw', 'pb...pb'] },
    half: { at: [0, 0], rows: ['ll...ll', 'bp...pb'] },
    shut: { at: [0, 0], rows: ['ss...ss', 'll...ll'] },
    focus: { at: [-1, -1], rows: ['l.......l', '.lp...pl.', '.bp...pb.'] },
    happy: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l'] },
    // worried brows rising to the nose over eyes cast down
    sad: { at: [0, -1], rows: ['.l...l.', 'l.....l', 'bp...pb'] },
    // surprised: brows up, whites all round a pinprick pupil
    wide: { at: [0, -2], rows: ['ll...ll', '.......', 'wp...pw', 'ww...ww'] },
    // "Go!": the focused brows over a shout, the mouth wide open
    go: { at: [-1, -1], rows: ['l.......l', '.lp...pl.', '.bp...pb.', '.........', '...mmm...', '...mrm...'] },
    // his cheer: the eyes squeezed into arches over a huge open grin
    grin: { at: [-1, 0], rows: ['.ll...ll.', 'l..l.l..l', '.........', '..mtttm..', '...mrm...'] },
  },
}

// ------------------------------------------------------------------ Sage Mode

// The toad's orange pigment round the eyes on the head, and gold toad eyes
// with a dark bar of a pupil over whatever the eyes are doing (a focus brow
// stays above them).
const SAGE: Dojutsu = {
  head: {
    ...HEAD,
    palette: { ...PALETTE, ...pal('j:#e0602a k:#b8401c') },
    rows: HEAD.rows.map(
      (r, y) =>
        ({
          11: '.obccdjjjdddjjjeccco.',
          12: '..occdkdddddddkecco..',
        })[y] ?? r,
    ),
  },
  eyes: { at: [-5, 0], rows: ['yy...yy', 'yn...ny'] },
  // at rest a blink shuts them (he only wakes it in a move)
  states: { shut: null, happy: null, grin: null },
}
// and the turned head in Sage Mode (a cel asks for it: { head: 'turnSage' })
const TURN_SAGE: HeadGrid = {
  ...TURN,
  palette: SAGE.head!.palette,
  rows: TURN.rows.map(
    (r, y) =>
      ({
        11: '.odjjjdddjjjebbbbbbcco.',
        12: '.odkddddddkdeodecbbcco.',
      })[y] ?? r,
  ),
}

// ------------------------------------------------------------------ body

// The jacket's letters in his colours: orange with the black yoke and
// collar, a white zip pull under the chin.
const BODY = pal(`
  o:#0e1019
  s:#f8d0a8 k:#dc9a70
  v:#ffa43c w:#f07c16 x:#b4540e
  n:#ffa43c m:#f07c16 l:#b4540e
  f:#45475c j:#25273a
  c:#f07c16 b:#b4540e
  h:#f07c16 g:#eef0f6
  i:#d8660e e:#a2460a
  p:#f89a34 q:#e2720f r:#a2460a
  t:#26305a u:#46569a
  y:#ffcc22 z:#e58a12
  a:#2a2c3e d:#45475c
`)

// His nightcap, asleep: a pale blue stocking cap pulled down over the spikes
// to a fluffy white brim on the headband, two sleepy dot eyes on its front,
// its long tip flopped over the left side to a white pom. Over the head, and
// riding it (the breath's nod sinks it with the head).
const NIGHTCAP: Prop = {
  on: 'head',
  at: [-3, -2],
  only: ['sleep'],
  palette: pal(`o:#0e1019 a:#b4e0f8 b:#80bce8 c:#5890cc w:#f4f8fc x:#c0cede e:#1e3460 p:#ffffff q:#c8d4e6`),
  rows: [
    '.........OOOOO...........',
    '.......OOAAAAAOOOO.......',
    '.....OOAABOOAAAAAAOOO....',
    '....OAABOOAAAAAAAAAABO...',
    '...OAABOAAAAAAAAAAAABBO..',
    '..OAABOAAAAAAAAAAAAABBCO.',
    '..OABOAAAAAAAAAAAAAABBCO.',
    '.OPPOAAAAEAAAAEAAAAABBCO.',
    'OPPPQOWWWWWWWWWWWWWWWWXXO',
    'OPPQQOWXWWWXWWWXWWWXWXXXO',
    '.OQQOOOOOOOOOOOOOOOOOOOO.',
    '..OO.....................',
  ],
}

// In a moving hold's stirring drawings (the template's `<pose>Wind`), his
// headband's tails flap out from behind his head over the far shoulder, in
// the cloth's navy (a, lit d), under the head and the body (he stands two
// pixels from the stage's edge: they stream down, not out).
const TAILS: Overlay = {
  on: 'head',
  at: [19, 8],
  under: true,
  rows: ['..o.', '.oao', '.oda', 'ooao', 'oado', 'odo.', '.o..'],
}
const STIRRING = Object.fromEntries(['charge', 'sign3', 'sign2', 'sign1', 'raise', 'gather', 'thumbs', 'poke', 'think', 'crossed', 'windup', 'spread', 'point'].map(p => [`${p}Wind`, [TAILS]]))

export const NARUTO: NinjaSprite = {
  id: 'naruto',
  template: JACKET,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  dojutsu: SAGE,
  props: [NIGHTCAP],
  heads: { turn: TURN, turnSage: TURN_SAGE },
  // his own poses for his moves (anims/naruto.ts): the "Go!" of the Shadow Clones
  poses: NARUTO_POSES,
  overlays: STIRRING,
  // the thumbs-up of his cheer with the big grin
  poseEyes: { thumbs: 'grin' },
  moves: [RASENGAN, CLONES, RASENSHURIKEN],
  quick: QUICK,
  cheer: CHEER,
}

register(NARUTO)
