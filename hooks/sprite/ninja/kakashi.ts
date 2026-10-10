// Kakashi as a native sprite: everything that is his own. His body is the
// shared 'vest' template (templates/vest.ts); here are its letters in his
// colours, his hand-drawn head (and the head with the headband pushed up for
// the Sharingan), his hand-drawn eyes, and his moves (anims/kakashi.ts).
//
// TO ADD A NINJA, copy this file: pick their template (or draw one:
// templates/vest.ts says how), map its letters to their colours in `body`,
// draw their head (a dark outline traced round the hair helps it hold in
// front of effects) with its palette as letters, and their eyes in every
// state the faces use (types.ts's EyeState: each mood, blink and glance).
// Their own poses, overlays, props and dojutsu are in types.ts's top. Write
// their moves as cels (anims/kakashi.ts says how), end the file with
// register(...), and add its one import line to sprite/index.ts.

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { VEST } from '../templates/vest.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite } from '../types.ts'
import { CHEER, KAKASHI_POSES, KAMUI, NINKEN, QUICK, RAIKIRI } from '../anims/kakashi.ts'
import { arrivalOf } from '../anims/shared.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head, touched up: a
// 1 px dark outline traced round it (so the hair holds its shape in front of
// the aura and the lightning), one column wider for the outline on the right.
//   a b c  hair: highlight, light, shadow
//   d e    skin, its shadow under the hair
//   f      the headband's cloth (dark), slanted over his left eye
//   g i    the mask, its shadow
//   h      the headband's plate
//   o      outline
const PALETTE = pal(`
  a:#f8fafc b:#c9cedc c:#8b92aa d:#f6d8bc e:#d8b498
  f:#1e2236 g:#3a4572 h:#dfe4ee i:#28305a o:#0e1019
`)

const HEAD: HeadGrid = {
  palette: PALETTE,
  // each eye's top-left pixel: viewer's left (open), right (under the headband)
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '..o....o.....o.......',
    '.oao..oao...oao......',
    '.oabo.oabo..oaboo....',
    '.oabcooabcoooabbco...',
    'oaobbcobbbbcobbbbco..',
    'oabbbbcbbbbbcbbbbbco.',
    '.obbbbbcbbbbbcbbbbcco',
    'oabbbbbbcbbbbbcbbbcco',
    'offfhhfhhbbbbbbcbbcco',
    'offfcccccffbbbbbbbcco',
    '.oabbfffffffbbbbbcco.',
    '.oabbeeeefffffbbbcco.',
    '.oabbddddddfffffbcco.',
    '..obbdddddddffffbco..',
    '...ooggggggggggioo...',
    '.....oggggggggio.....',
    '......ogggggiio......',
    '.......ooggioo.......',
    '.........ooo.........',
  ],
}

// The Sharingan's head: the headband pushed up straight, the face bared, the
// red eye (drawn by SHARINGAN below) and its scar.
const OPEN: Readonly<Record<number, string>> = {
  8: 'offfhhfhhfffffffbbcco',
  9: 'offfcccccfffffffbbcco',
  10: '.oabbeeeeeeeeeeebcco.',
  11: '.oabbdddddddddddbcco.',
  12: '.oabbdddddddddddbcco.',
  13: '..obbdddddddddddbco..',
}
const HEAD_OPEN: HeadGrid = { ...HEAD, rows: HEAD.rows.map((r, y) => OPEN[y] ?? r) }

// The head turned three-quarters toward the post, for the action poses (a
// cel asks for it by name: k: { head: 'turn' }): the face, the mask, the
// visible eye and the headband's plate three pixels toward the post, the
// face's edge now the profile (no hair left of the eye), the spikes and the
// back of the head swung two pixels back (two columns wider), the far side
// of the jaw shaded wide; the far eye under the band. The neck stays over
// the root, so the chin juts ahead of it. With the Sharingan awake a cel
// asks for 'turnSharingan' instead: a named head wins over the dojutsu's,
// so on 'turn' the red eye would be stamped over the band.
const TURN: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [4, 12],
    [8, 12],
  ],
  neck: [10, 17],
  rows: [
    '....o....o.....o.......',
    '...oao..oao...oao......',
    '...oabo.oabo..oaboo....',
    '...oabcooabcoooabbco...',
    '..oaobbcobbbbcobbbbco..',
    '.oaabbbbcbbbbbcbbbbbco.',
    '.oabbbbbbcbbbbbcbbbbcco',
    'oabbbbbbbbcbbbbbcbbbcco',
    'ohhfhhfbbbbbbbbbbcbccco',
    'occcccffbbbbbbbbbbbccco',
    'obfffffffbbbbbbbbbbcco.',
    'obeeeefffffbbbbbbbccco.',
    'odddddddfffffbbbbbcco..',
    '.odddddddffffbbbbbco...',
    'oogggggggggggiiiioo....',
    '..ogggggggggiiio.......',
    '...oggggggiiio.........',
    '....oooggiioo..........',
    '......oooo.............',
  ],
}
// turned, the headband pushed up for the Sharingan (OPEN's rows, turned)
const TURN_OPEN: Readonly<Record<number, string>> = {
  8: 'ohhfhhffffffffbbbcbccco',
  9: 'occcccffffffffbbbbbccco',
  10: 'obeeeeeeeeeeebbbbbbcco.',
  11: 'oddddddddddbbbbbbbccco.',
  12: 'oddddddddddbbbbbbbcco..',
  13: '.odddddddddbbbbbbbco...',
}
const TURN_SHARINGAN: HeadGrid = { ...TURN, rows: TURN.rows.map((r, y) => TURN_OPEN[y] ?? r) }

// ------------------------------------------------------------------ eyes

// Hand-drawn eye states, for the viewer's left eye (stamped with their
// top-left at the eye plus `at`; the right one, bared by the Sharingan,
// mirrors them). l lid line, p pupil, w white, s skin, r the Sharingan's
// red, k its dark heart, x the scar.
const EYES: HandEyes = {
  palette: pal(`l:#4a3438 p:#1c1820 w:#f4f1ee s:#f6d8bc r:#e0222c k:#3a060a x:#c47a6e`),
  mirror: true,
  rightHidden: true,
  states: {
    // the famous bored, heavy-lidded look: a lid across the top, the pupil toward the nose
    open: { at: [0, 0], rows: ['ll', 'wp'] },
    // looking at the post (left)
    left: { at: [0, 0], rows: ['ll', 'pw'] },
    // half shut: a blink's in-between, drowsy, reading
    half: { at: [0, 0], rows: ['ll', 'lp'] },
    // shut: a line low in the eye
    shut: { at: [0, 0], rows: ['ss', 'll'] },
    // focus: the lid pulled down hard, a brow pixel over the outer corner
    focus: { at: [-1, -1], rows: ['l..', '.lp'] },
    // the eye-smile, an upturned U: Kakashi's ^_^
    happy: { at: [-1, 0], rows: ['.ll.', 'l..l'] },
    // crestfallen: the lid drooping to the outer side
    sad: { at: [-1, -1], rows: ['..l', '.l.', 'lp.'] },
    // startled: the lids flung open, all white round a pinprick
    wide: { at: [0, 0], rows: ['ww', 'wp'] },
    // reading: the lid low and level, the pupil sunk to the outer corner, down at the book
    read: { at: [0, 0], rows: ['ll', 'p.'] },
  },
}

// The Sharingan: the headband pushed up, and in the bared right eye the red
// eye, its dark heart toward the nose, the scar down through the brow (under
// a heavy lid when he reads; at rest a blink or the eye-smile shuts it too,
// and in a move it stays open whatever the other eye does).
const SHARINGAN: Dojutsu = {
  head: HEAD_OPEN,
  eyes: { at: [0, -2], rows: ['.x', '.x', 'kr', 'rr'] },
  states: { half: { at: [0, -2], rows: ['.x', '.x', 'll', 'kr'] }, read: { at: [0, -2], rows: ['.x', '.x', 'll', 'kr'] }, shut: null, happy: null },
}

// ------------------------------------------------------------------ body

// The vest's letters (templates/vest.ts) in his colours: the green flak
// vest, navy shirt and trousers, the red swirl crest, his orange book.
const BODY = pal(`
  o:#0e1019
  s:#f6d8bc k:#d8b498
  v:#a6b86a w:#76893f x:#4b5a29
  n:#56679e m:#3a4572 l:#262d52
  p:#4a5a90 q:#3a4572 r:#262d52
  t:#2c3458 u:#4a5a90
  g:#dfe4ee h:#8b92aa
  c:#d8343a b:#c9cedb
  a:#f48a24 e:#a84e12 d:#f6ecd0
  y:#c9cedc z:#8b92aa
`)

// ------------------------------------------------------------------ reading

// His Icha Icha reading pose (the companion's 'think': Claude reading,
// searching or thinking it over), drawn on the vest in its letters, 24 rows
// so its rows are the stage's (the feet on the last). Slouched: the upper
// body leaning a pixel toward the book, the head sunk a pixel into the
// collar; the near hand holds the book up at his chin (the book is a prop on
// that hand, below), the near arm behind it; the far arm hangs with its elbow
// out, the hand in his pocket. Its breath ('think2') lifts the book a pixel
// as the breath sinks his head a pixel further into it, a page standing up
// off the book as he turns it.
const READING: readonly string[] = [
  '.....oooooooooooooo.......',
  '...oncnvvvwwmmmwwwxlo.....',
  '...onmovvwwwmwwwxxolo.....',
  '...onmovwwwwwwwwxxollo....',
  '...onmovwwwwwwwwxxoolo....',
  '...omloxxxxxxxxxxxxolo....',
  '.....ooopqqqqqqqqrrlo.....',
  '........obbbooqqro........',
  '.......ouuttoouutto.......',
]
const READ_ROWS = [...Array.from({ length: 24 - READING.length }, () => '.'.repeat(26)), ...READING]

// Make-Out Paradise, open in his hand, held up and turned toward the arena:
// the orange cover with its dark title, the spine, the cream page block
// down the far side and along the top (open, the pages split at the spine),
// outlined; his fingers under it. UPPERCASE: in front of his chin. (The
// vest's own think, and its a e d book letters, he no longer draws.)
const BOOK_PALETTE = pal(`o:#0e1019 a:#f48a24 b:#ffb24e e:#a84e12 d:#f6ecd0 j:#5a1a0e s:#f6d8bc k:#d8b498`)
const BOOK: readonly string[] = [
  'OOOOOOOO',
  'ODDDDODO',
  'OBAAAEDO',
  'OAJJAEDO',
  'OAAAAEDO',
  'OAAAAEDO',
  '.OOOSK..',
]
// on the breath: the book a row higher, a page standing up off it (turning)
const BOOK_TURN: readonly string[] = [
  '...O....',
  'OOODOOOO',
  ...BOOK.slice(1),
]

export const KAKASHI: NinjaSprite = {
  id: 'kakashi',
  template: VEST,
  body: BODY,
  poses: {
    // his cheer's own head-scratch (it breathes into cheer2), not the vest's
    scratch: 'cheer',
    // reading his book (the hand is the book's), breathing into think2
    think: { as: 'think', rows: READ_ROWS, head: [0, 1], hand: [4, 20], eyes: 'read', breath: 'think2' },
    think2: { as: 'think', rows: READ_ROWS, head: [0, 1], hand: [4, 19], eyes: 'read' },
    // his own drawings for his moves (anims/kakashi.ts): the Raikiri's second charge key...
    ...KAKASHI_POSES,
  },
  // the book in his reading hand, only while he reads; a page turning on the breath
  props: [{ rows: BOOK, on: 'hand', at: [-4, -6], palette: BOOK_PALETTE, only: ['think', 'think2'], poses: { think2: { rows: BOOK_TURN, at: [-4, -7] } } }],
  // the lazy, lidded look down at the page
  poseEyes: { think: 'read' },
  head: HEAD,
  // turned three-quarters toward the post, for his strikes, dashes and Kamui
  heads: { turn: TURN, turnSharingan: TURN_SHARINGAN },
  eyes: EYES,
  dojutsu: SHARINGAN,
  moves: [RAIKIRI, NINKEN, KAMUI],
  quick: QUICK,
  cheer: CHEER,
  // the first arrival, his head rising with him a pixel (only his hair's outline tips cut)
  arrival: arrivalOf(VEST, { rise: true }),
}

register(KAKASHI)
