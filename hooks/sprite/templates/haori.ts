// The 'haori' outfit template: a chibi in a heavy layered outfit, an outer
// layer (a haori coat, or armour plates) over a robe, a thick belt, trousers
// and sandals (Jiraiya; Madara). Drawn once, in SEMANTIC letters; each ninja
// who wears it maps them to colours in their own file (ninja/<id>.ts's `body`):
//   o          outline
//   s k        skin, skin shadow (hands)
//   v w x      outer layer (haori / armour plates): lit, mid, shadow
//   c          its mark (Jiraiya: the yellow circles; Madara: a plate-edge glint)
//   n m l      robe (sleeves, the collar's V): lit, mid, shadow
//   b j        belt: lit, shadow
//   p q r      trousers: lit, mid, shadow
//   t u        sandals: shadow, lit
//   y z        hair, light and shadow (for smears)
// UPPERCASE: the same colour drawn OVER the head (a hand in front of the
// face). Light from the top left.
//
// The outer layer has its own silhouette: square shoulder caps a pixel wider
// than the sleeves, and a long coat skirt from the belt to the ankles, its two
// flaps flaring over the thighs and parting at the front on the trousers. In
// action the flaps stream behind (charge, dash, strike, follow), flick up (jump,
// tuck) or spread on the ground (crouch, sleep, slam); a lunge bares the front
// leg's trousers.
//
// Drawn in the prototype in 31 poses (the
// blows redrawn in round 6 with one clear limb line under a head kept off the
// body, and the kabuki added), plus each hold's stirring and breath drawings
// made from them below: every
// companion pose has its own drawing, plus the breath (idle1), the dash's
// smear, the follow-through, the landing crouch, the hop, the fist-pump cheer
// and its pump (cheer2) and the wave. Each pose: rows (26 wide, root column
// 13, last row on the feet), head [dx, dy], hand [x, y] (the held hand, for
// effects; the kick's sole, the slam's palm on the ground), eyes (its default
// eye state), as (the companion pose it stands for), breath (its other
// breathing frame), and points.back: the small of the back behind the belt,
// where a slung thing rides (Jiraiya's scroll), when it is not at the
// template's [13, 9]. See templates/vest.ts for how to add a pose.

import type { Pose } from '../../art/chibi.ts'
import type { PoseGrid, Template } from '../types.ts'

const POSES: Record<string, PoseGrid> = {
  idle0: {
    as: 'idle',
    breath: 'idle1',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwwnnmwwwwxxo...',
      '...oxxxovvwwwnmlwwwoxxo...',
      '....onmovvwwwnmlwwxolo....',
      '....onmovvwwwnmlwwxolo....',
      '....oskobbbbbbbbbbjoko....',
      '....oskvvcwwwqrwwcxxko....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // inhale: shoulders and hands up a pixel, the coat stretched
  idle1: {
    as: 'idle',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwwnnmwwwwxxo...',
      '...oxxxovvwwwnmlwwwoxxo...',
      '....onmovvwwwnmlwwxolo....',
      '....onmovvwwwnmlwwxolo....',
      '....oskovvwwwnmlwwxoko....',
      '....oskobbbbbbbbbbjoko....',
      '....ooovvcwwwqrwwcxxoo....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // OX: elbows thrown wide, the flat hand under the upright one at the belly
  sign1: {
    as: 'signs',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwwnnmwwwwxxo...',
      '..ooxxxovvwwOOOOwwwoxxoo..',
      '..onnmovvwwwOSKOwwwxolxo..',
      '.onnmmOOOOOOSKKOOOOOOllo..',
      '.oonNNNNNNOSSSKKOMMMMMMoo.',
      '..ooOOOOOOOOOOOOOOOOOOo...',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // RABBIT: the seal at mid-chest, a pixel toward the arena, a row of the
  // coat showing between the chin and it (never a beard): the two hands
  // pressed palm to palm in a 4 x 3 block, the fingers split at the top, the
  // forearms in from the elbows tucked to the ribs (lowercase: under the head)
  sign2: {
    as: 'signs2',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwwnnmwwwwxxo...',
      '...oxxxovvwwwnmlwwwoxxo...',
      '....onmovvwwwnmlwwxolo....',
      '....onmnoskokmllwwxolo....',
      '....onnnosskkollmmmllo....',
      '....ovvvoskkkowwcxxxo.....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // MONKEY: the near elbow cocked up and out, the hands meeting point-forward
  sign3: {
    as: 'signs3',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '...ooo.ooooooooooooooo....',
      '..oNNNOovvvvwwwnnmwwwxxo..',
      '..oNMMNOOOvvwwwnmlwwoxxo..',
      '...OOMMNNNOOOOOOnlwxolo...',
      '....OOOMMMOSSSKOOwwxolo...',
      '....ovvOOOOSSKKOMMMMMlo...',
      '....ovvcwOOOOOOOOOOOcxo...',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // CHARGE: knees bent, the jutsu hand thrust forward and down, the other hand clamped on its wrist; the front flap over the bent knee
  charge: {
    as: 'charge',
    head: [-1, 2],
    hand: [1, 9],
    eyes: 'focus',
    points: { back: [15, 9] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.....oooooooooooooooo.....',
      '...oovvvvvwwwnnmwwwwxxo...',
      '..oonmxovvwwwnmlwwwwxxo...',
      'oonnmmoOOOOOOwwwwwwxolo...',
      'SKmmoOSKMMMMMObbbbjxoko...',
      'KKoovOOOOOOOOOqqqrwwxxo...',
      'oo.ovvvwwo..oqqqqrowxxxo..',
      '...oouuuto..ouuuttooooo...',
    ],
  },
  // WINDUP: sunk low and rocked back, the jutsu hand drawn in low at the front, the far fist cocked at the ribs
  windup: {
    as: 'gather',
    head: [1, 2],
    hand: [4, 12],
    eyes: 'focus',
    points: { back: [14, 11] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.......oooooooooooooooo...',
      '.....oovvvvvwwwnnmwwwwxo..',
      '....oonmxovvwwwnmlwwwwxlo.',
      '...onmmoovvwwwwwwOOOOxlo..',
      '..onmmoobbbbbbbOSKKOxoo...',
      '..oskoovvvwqqqqqOOOrwxxo..',
      '..oskkovvwwo.oqqqqrowwxxo.',
      '...ooooouuutto...ouuuttoo.',
    ],
  },
  // DASH smear: the run frame smeared back along its path: streaks of hair, coat, flaps and trousers trailing behind, the front edge left crisp
  smear: {
    as: 'dash',
    head: [-3, 1],
    hand: [2, 21],
    eyes: 'focus',
    points: { back: [19, 20] },
    rows: [
      '.....................................',
      '.....................................',
      '.....................................',
      '.....................................',
      '.....................................',
      '.....................................',
      '......................yyyyyzz........',
      '.....................................',
      '........................yyyyyyyyzz...',
      '.....................................',
      '.......................yyyyyz........',
      '.......................yyyyyyyyzz....',
      '.....................................',
      '......................zzzzz..........',
      '.....................................',
      '.....................................',
      '.........ooooooooooooo...............',
      '........onvvvwwwwwwwxxoo..wwww..w....',
      '.......onnvvwwwwwwwwxxlnmo.ww..w.....',
      '......onmmovvwwwwwwwxxoSKo...........',
      '..oooonmmoobbbbbbbbbjooKKow..w.......',
      '.oSSnnmmo.opqqqqqqqrovvwwoww..w......',
      '.oKKmmo..oppqqo..oqrrowwxoxx..x......',
      '..oooo..ouuutto...oouuttoo...........',
    ],
  },
  // DASH: the run's contact frame, a long low split, the jutsu hand carried forward and low in one clear line from under the jaw, the far arm flung back, both flaps streaming behind; the head barely dipped, off the body
  dash: {
    as: 'dash',
    head: [-3, 1],
    hand: [2, 11],
    eyes: 'focus',
    points: { back: [19, 10] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.........ooooooooooooo....',
      '........onvvvwwwwwwwxxoo..',
      '.......onnvvwwwwwwwwxxlnmo',
      '......onmmovvwwwwwwwxxoSKo',
      '..oooonmmoobbbbbbbbbjooKKo',
      '.oSSnnmmo.opqqqqqqqrovvwwo',
      '.oKKmmo..oppqqo..oqrrowwxo',
      '..oooo..ouuutto...oouuttoo',
    ],
  },
  // STRIKE: the arm driven straight out at the post in one clear line from under the jaw (the head at standing height, off the body, so the arm shows whole), the back flap swung out behind
  strike: {
    as: 'strike',
    head: [-1, 0],
    hand: [0, 8],
    eyes: 'focus',
    points: { back: [19, 10] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........ooooooooooo.....',
      '.........onvvvwwwwwwxxo...',
      'oooooooooonvvwwwwwwwxxlo..',
      'SSnnnnnnnnnnvwwwwwwwxxlo..',
      'KKmmmmmmmmmmmvwwwwwwxxlo..',
      'oooooooooooooobbbbbbbjoo..',
      '........oopqqqqqqrovvvwwxo',
      '......oppqqoo....oqrowwxxo',
      '.....ouuuttto.....oouutto.',
    ],
  },
  // FOLLOW-THROUGH: carried past the hit, the body a row lower, the arm still one line at the post, the back foot kicked up under the flying back flap
  follow: {
    as: 'punch',
    head: [-2, 0],
    hand: [0, 8],
    eyes: 'focus',
    points: { back: [19, 10] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.........ooooooooooooo....',
      'ooooooooonvvvwwwwwwxxo....',
      'SSnnnnnnnnnvvwwwwwwwxxo...',
      'KKmmmmmmmmmmvwwwwwwwxxlooo',
      'ooooooooooooobbbbbbbjooqro',
      '........oopqqqqqqqrrvwwxxo',
      '.......oppqqoo....owwxxoo.',
      '......ouuuttto.....ooooo..',
    ],
  },
  // CROUCH: the landing squash, knees wide, arms out for balance, the flaps spread on the ground
  crouch: {
    as: 'slam',
    head: [0, 3],
    eyes: 'shut',
    points: { back: [13, 11] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooooo....',
      '..oooovvvvvwwwnnmwwwxxooo.',
      '.onnmmmovvwwwwnmlwwxxommlo',
      '.osskooovvwwwwwwwwwxooskko',
      '..ooo.oobbbbbbbbbbbjooooo.',
      '...ovvcvwqqqqqqqqqrwwcxxo.',
      '..oouuttoooooooooooouuttoo',
    ],
  },
  // TUCK: a cannonball in the air, knees hugged up under the chin, hands on the shins, the flaps hanging between the knees
  tuck: {
    as: 'tuck',
    head: [0, 4],
    eyes: 'shut',
    points: { back: [13, 6] },
    rows: [
      '..........................',
      '..........................',
      '.....oooooooooooooooo.....',
      '...oovvvvvwwwnnmwwwxxo....',
      '..oqqqoovvwwwnmlwwxxolo...',
      '.oqqqqqOSKwwwwwwwxxoqqo...',
      '.oqqrrrOKKobbbbbbjoqqqro..',
      '..oqrroOOovcwwwwcxoqqrro..',
      '..ouuuttoovvwo.owxxouutto.',
      '...oooooo.ooo...ooooooo...',
    ],
  },
  // JUMP: the happy hop, heels kicked up behind, a fist pumped beside the face, the flaps flicked up
  jump: {
    as: 'raise',
    head: [0, 2],
    hand: [1, 2],
    eyes: 'happy',
    points: { back: [12, 10] },
    rows: [
      '..........................',
      '.OO.......................',
      'OSKO......................',
      'OKKO......................',
      'ONMO......................',
      '.ONMO.....................',
      '..ONMoooooooooooooooo.....',
      '...oovvvvvwwwnnmwwwwxo....',
      '....oxxovvwwwnmlwwxolo....',
      '.....omovvwwwwwwwxoko.....',
      '.....oobbbbbbbbbbjooo.....',
      '....ovcwwqqqqqqrwcxoooo...',
      '....oovvwoqqqqqrwxxqqtto..',
      '......oouuto.oooooqqtto...',
      '.........ooo.....oooo.....',
    ],
  },
  // CHEER: a fist punched up beside the head on the arena side, the other hand easy at the side
  cheer: {
    as: 'raise',
    breath: 'cheer2',
    hand: [1, 7],
    eyes: 'happy',
    points: { back: [13, 16] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.OO.......................',
      'OSKO......................',
      'OKKO......................',
      'ONMO......................',
      '.ONMO.....................',
      '..ONMooooooooooooooooo....',
      '...OOvvvvvwwwnnmwwwwxxo...',
      '....oxxovvwwwnmlwwwoxxo...',
      '.....oovvwwwwnmlwwxolo....',
      '.....ovvvwwwwnmlwwxolo....',
      '.....obbbbbbbbbbbbjoko....',
      '....ovvvvcwwwqrwwcxxko....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // the pump: the fist a pixel lower, the elbow bent
  cheer2: {
    as: 'raise',
    hand: [1, 8],
    eyes: 'happy',
    points: { back: [13, 16] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.OO.......................',
      'OSKO......................',
      'OKKO......................',
      'ONMO......................',
      '.ONMoooooooooooooooooo....',
      '..OOOvvvvvwwwnnmwwwwxxo...',
      '....oxxovvwwwnmlwwwoxxo...',
      '.....oovvwwwwnmlwwxolo....',
      '.....ovvvwwwwnmlwwxolo....',
      '.....obbbbbbbbbbbbjoko....',
      '....ovvvvcwwwqrwwcxxko....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // SLUMP: the whole frame sags forward, head hung out in front, the back rounded behind it, arms dangling
  slump: {
    as: 'slump',
    head: [-3, 2],
    eyes: 'sad',
    points: { back: [14, 10] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.............ooooooooo....',
      '..........ooooovvvwwxxoo..',
      '.......oooovvvvwwwnmwxxxo.',
      '....oonnmmovvwwwwnmlwwxxo.',
      '...onnmmoovvwwwwwwwwwxolo.',
      '...onmooobbbbbbbbbbbjoko..',
      '...oskovcwqqqqqqqrwwcxo...',
      '...oskkovvoqqrooqqrowxxo..',
      '....oooooouuttoouuttoooo..',
    ],
  },
  // SLEEP: sat cross-legged, nodded off, the head drooped onto the chest: the
  // square shoulder caps and the collar's V either side of the chin down to
  // the belt, the robe's sleeves bent at the elbows and the forearms in along
  // the thighs to the hands folded in the lap, the coat's flaps spread over
  // the knees (a pixel or two past the head on each side) and parted at the
  // front on the crossed shins, the sandals' toes peeking where they cross
  sleep: {
    as: 'sleep',
    head: [0, 2],
    eyes: 'shut',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....ooooooooooooooooooo...',
      '...ovvvvwwwwnnmwwwwwxxxo..',
      '...oxxxovvwwnmlwwwxoxxxo..',
      '....onmovvwwnmlwwxxomlo...',
      '..ooonmmobbbbbbbbjommlooo.',
      '.ovvwonnmmsssksskmmllowxxo',
      '.ovwwcwwwouutouutowwwcwxxo',
      '..ooooooooooooooooooooooo.',
    ],
  },
  // THINK: the near hand on the chin, the elbow propped low
  think: {
    as: 'think',
    eyes: 'half',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwOOOOwwwwxxo...',
      '...oxxxovvwOSSKOwwwoxxo...',
      '....onmovvwOSKKOwwxolo....',
      '....onnmmooONMOOOOOOolo...',
      '....ooonmmOSKMMMMMMMLlo...',
      '.......oOOOOOOOOOOOOOOo...',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // CROSSED: arms folded, two rows tall, inside the coat (its dark edge
  // showing a pixel either side, the sleeves no wider than the torso): the
  // upper arms down the sides; the near forearm low from its elbow, then one
  // step up at the middle to a small fist on the far upper arm; the far
  // forearm in its sleeve's shade under the raised half. A row of the coat
  // and the robe's V shows above them (under the chin), the coat's skirt
  // two rows below.
  crossed: {
    as: 'crossed',
    hand: [17, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwwnnmwwwwxxo...',
      '...oxxxxovwwwnmlwwoxxxo...',
      '....oxnmovwwwnmlwxolxo....',
      '....oxnmovwnnnnnnsklxo....',
      '....oxnnnnnnlmmmmmmlxo....',
      '....ovvvvcwwwqrwwcxxxo....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // ALERT: both hands flung up by the head, startled
  alert: {
    as: 'alert',
    hand: [1, 1],
    eyes: 'wide',
    rows: [
      '.OO....................OO.',
      'OSKO..................OSKO',
      'OKKO..................OKKO',
      'ONMO..................OMLO',
      '.ONMOoooooooooooooooooMLO.',
      '..ONMvvvvvwwwnnmwwwwxMLO..',
      '...OOxxovvwwwnmlwwwoxOO...',
      '.....ovvvwwwwnmlwwwxo.....',
      '.....ovvvwwwwwnwwwxxo.....',
      '.....obbbbbbbbbbbbbjo.....',
      '....ovvvvcwwwqrwwcxxxo....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // THUMBS: a fist held out toward the arena at chest height, the thumb up over it
  thumbs: {
    as: 'thumbs',
    hand: [1, 7],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '.O.ovvvvvvwwwnnmwwwwxxo...',
      'OSOOxxxovvwwwnmlwwwoxxo...',
      'OSKONNNNovwwwwnmlwwxolo...',
      'OKKOMMMMovvwwwwnwwwxolo...',
      '.OOOOOOOobbbbbbbbbbjoko...',
      '....ovvvvcwwwqrwwcxxko....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // SCRATCH: the sheepish scratch, the elbow out past the cheek, the hand up on the hair at the temple
  scratch: {
    as: 'scratch',
    hand: [5, 4],
    eyes: 'happy',
    points: { back: [13, 16] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '....OOOO..................',
      '...OSSKO..................',
      '..OOSKKO..................',
      '..ONMOO...................',
      '.ONMO.....................',
      'ONMO......................',
      'ONNO......................',
      'OMNMO.....................',
      '.OMNMoooooooooooooooo.....',
      '..OOOvvvvvwwwnnmwwwwxxo...',
      '....oxxovvwwwnmlwwwoxxo...',
      '.....oovvwwwwnmlwwxolo....',
      '.....ovvvwwwwnmlwwxolo....',
      '.....obbbbbbbbbbbbjoko....',
      '....ovvvvcwwwqrwwcxxko....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // POKE: fingertips poked together just under the chin, elbows in
  poke: {
    as: 'poke',
    hand: [13, 6],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwOOOOwwwwxxo...',
      '...oxxxovvwOSKSKOwwoxxo...',
      '....onmovvwOSKSKOwxolo....',
      '....onmovvONMONMOOxolo....',
      '....onmoONMOwwwONMOolo....',
      '....ovvvOOOOcwqOOOOxxo....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // KICK: the front leg driven out flat at the arena from the hip, the near fist up in guard below the jaw where it shows, the back flap swinging
  kick: {
    as: 'kick',
    head: [0, 0],
    hand: [0, 11],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........ooooooooooo.....',
      '.........onvvvwwwwwwxxo...',
      '....oooo.onvvwwwwwwwxxlo..',
      '...oSKnmoovvvwwwwwwwxxlo..',
      '...oKKmooobbbbbbbbbbjolo..',
      'oooooooooooopqqqqqrwwxxo..',
      'uppppppppppppqqqqrowwxxo..',
      'tqqqqqqqqqqqqrroqqrowxxo..',
      'oooooooooooooo.ouutoooo...',
    ],
  },
  // RAISE: the near arm straight up beside the head, the open hand up by the top of the hair (the hand point just over the palm); the head tips away from it
  raise: {
    as: 'raise',
    head: [1, 0],
    hand: [2, 5],
    eyes: 'focus',
    points: { back: [13, 20] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..OO......................',
      '.OSKO.....................',
      '.OKKO.....................',
      '.ONMO.....................',
      '.ONMO.....................',
      '.ONMO.....................',
      '.ONMO.....................',
      '..ONMO....................',
      '..ONMO....................',
      '...ONMO...................',
      '....ONMOoooooooooooooo....',
      '...oovvvvvwwwnnmwwwwxxo...',
      '....oxxovvwwwnmlwwwoxxo...',
      '.....oovvwwwwnmlwwxolo....',
      '.....ovvvwwwwnmlwwxolo....',
      '.....obbbbbbbbbbbbjoko....',
      '....ovvvvcwwwqrwwcxxko....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // SLAM: dropped into a wide crouch, the near arm one diagonal from under the jaw down to the palm slapped flat on the ground; the head dipped a pixel, not sunk into the body
  slam: {
    as: 'slam',
    head: [0, 1],
    hand: [3, 13],
    eyes: 'focus',
    points: { back: [19, 10] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........ooooooooooooo...',
      '.........onvvvwwwwwwwxxo..',
      '........onnvvwwwwwwwwxxlo.',
      '.......onnmoovvwwwwwwxxolo',
      '......onnmo.obbbbbbbbbjoo.',
      '.....onnmo.ovvvwqqqqrwwxxo',
      '....onnmo.ovvwoqro.oqqrxxo',
      '..SSKKo..ouuuttoo...ouutto',
    ],
  },
  // SPREAD: both arms flung out and down in an A, palms open at the hips (not a T)
  spread: {
    as: 'spread',
    hand: [1, 8],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwwnnmwwwwxxo...',
      '..onxxxovvwwwnmlwwwoxxlo..',
      '.onmo..ovvwwwnmlwwxo..mlo.',
      'osko...ovvwwwnmlwwxo...oko',
      'okko...obbbbbbbbbbjo..okko',
      '.oo.ovvvvcwwwqrwwcxxxo.oo.',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // PUNCH: a straight right at the arena in one line from under the jaw, the other fist chambered at the ribs where it shows past the coat
  punch: {
    as: 'punch',
    head: [-1, 0],
    hand: [0, 8],
    eyes: 'focus',
    points: { back: [19, 10] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........ooooooooooo.....',
      '.........onvvvwwwwwwxxo...',
      'oooooooooonvvwwwwwwwxxoo..',
      'SSnnnnnnnnnnvwwwwwwwxonlo.',
      'KKmmmmmmmmmmmvwwwwwwxoskko',
      'oooooooooooooobbbbbbjoooo.',
      '.......oopqqqqqqrovvvwwxo.',
      '......oppqqoo....oqrowwxxo',
      '.....ouuuttto.....oouutto.',
    ],
  },
  // GATHER: chakra gathered in the near palm held out low at the side, the other hand hovering at the belt
  gather: {
    as: 'gather',
    hand: [2, 9],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....oooooooooooooooooo....',
      '...ovvvvvvwwwnnmwwwwxxo...',
      '..ooxxxovvwwwnmlwwwoxxo...',
      '.onnmmovvwwwwnmlwwxolo....',
      'onmmoovvwwwwwnmlwwxolo....',
      'OSSKoobbbbbbbbbbjOSKOo....',
      'OSKKOvcwwqqqqqqrwOKKOo....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // WAVE: hello, the open hand up beside the face, fingers spread
  wave: {
    as: 'raise',
    hand: [2, 4],
    eyes: 'happy',
    points: { back: [13, 16] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '.O.O......................',
      'OSOSO.....................',
      'OSSKO.....................',
      'OSKKO.....................',
      '.ONMO.....................',
      '.ONMO.....................',
      '.ONMO.....................',
      'ONMO......................',
      'ONMOooooooooooooooooo.....',
      '.OOOvvvvvvwwwnnmwwwwxxo...',
      '....oxxovvwwwnmlwwwoxxo...',
      '.....oovvwwwwnmlwwxolo....',
      '.....ovvvwwwwnmlwwxolo....',
      '.....obbbbbbbbbbbbjoko....',
      '....ovvvvcwwwqrwwcxxko....',
      '...ovvvvwwwwoqqowwwxxxo...',
      '...ooooouuttoouuttooooo...',
    ],
  },
  // KABUKI: the Toad Sage's mie (Jiraiya's cheer): stood on the far leg, the
  // near knee hauled up to the hip, the near arm thrust out at the arena with
  // the palm up and open, the far fist cocked up by his ear; the head thrown
  // back
  kabuki: {
    as: 'thumbs',
    head: [1, 0],
    hand: [1, 6],
    eyes: 'happy',
    points: { back: [13, 15] },
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.OO.......................',
      'OSKO......................',
      'OSKO......................',
      'OKKOO.....................',
      '.ONMO.....................',
      '..ONMO....................',
      '...ONMO...................',
      '....ONMOoooooooooooooo....',
      '.....OOvvvvvwwwnnmwwwxo...',
      '......oxxovwwwnmlwwoxxo...',
      '......obbbbbbbbbbbbbjoko..',
      '..ooppppqqvvvwwwwwwxxko...',
      '.ouuqqqqoovvwwwwwwwxxxo...',
      '.ouuto...ovvvwwwoqqowxxo..',
      '..ooo....oooooouuttooooo..',
    ],
  },
}

// ------------------------------------------------------------------ stirring and breathing

// Drawings made from the hand-drawn poses above, a pixel or two each, so a
// long hold never sits on one dead drawing (anims/kit.ts's hold()):
//
// `<pose>Wind`: the pose stirring. The coat's skirt (the row over the feet)
// swings a pixel toward the back, its front edge in and its back edge out,
// and the coat above it flares a pixel at the back; `patch` paints a few
// pixels more ('.' keeps, '_' clears, a letter paints) at its top-left:
// a sleeve's hem, the far flap.
//
// `<pose>In`: the breath in (the pose's `breath`). Everything above row `k`
// lifted a pixel (shoulders, arms, hands, the hand point with them), row k
// stretched to fill: the chest swelling under the coat.

const COAT = /[vwxc]/
// the last drawn column of a row, and the first
const lastOf = (r: string): number => r.search(/[^.]\.*$/)
const firstOf = (r: string): number => r.search(/[^.]/)
const swung = (r: string, front: boolean): string => {
  const a = [...r]
  const b = lastOf(r)
  if (b > 0 && a[b] === 'o' && COAT.test(a[b - 1]!)) {
    while (a.length <= b + 1) a.push('.')
    a[b + 1] = 'o'
    a[b] = a[b - 1]!
  }
  const f = firstOf(r)
  if (front && f >= 0 && a[f] === 'o' && COAT.test(a[f + 1]!)) {
    a[f] = '.'
    a[f + 1] = 'o'
  }
  return a.join('')
}
const paint = (rows: string[], at: readonly [number, number], patch: readonly string[]): string[] => {
  const out = rows.map(r => [...r])
  patch.forEach((line, dy) => {
    const row = out[at[1] + dy]!
    ;[...line].forEach((ch, dx) => {
      if (ch === '.') return
      while (row.length <= at[0] + dx) row.push('.')
      row[at[0] + dx] = ch === '_' ? '.' : ch
    })
  })
  const w = Math.max(...out.map(r => r.length))
  return out.map(r => [...r, ...'.'.repeat(w - r.length)].join(''))
}
export const wind = (p: PoseGrid, patch?: { at: readonly [number, number]; rows: readonly string[] }): PoseGrid => {
  const n = p.rows.length
  let rows = p.rows.map((r, y) => (y === n - 2 ? swung(r, true) : y === n - 3 ? swung(r, false) : r))
  if (patch) rows = paint(rows, patch.at, patch.rows)
  const w = Math.max(...rows.map(r => r.length))
  return { ...p, rows: rows.map(r => r.padEnd(w, '.')), breath: undefined } as PoseGrid
}
const inhale = (p: PoseGrid, k: number): PoseGrid => {
  if (/[^.]/.test(p.rows[0]!)) throw new Error('a breath needs a clear row on top')
  const rows = [...p.rows.slice(1, k + 1), p.rows[k]!, ...p.rows.slice(k + 1)]
  const up = ([x, y]: readonly [number, number]): [number, number] => [x, y < k ? y - 1 : y]
  const { breath: _, ...rest } = p
  return {
    ...rest,
    rows,
    ...(p.hand ? { hand: up(p.hand) } : {}),
    ...(p.points ? { points: Object.fromEntries(Object.entries(p.points).map(([name, q]) => [name, up(q)])) } : {}),
  }
}

// the holds' poses stirring
for (const name of ['idle0', 'crossed', 'think', 'sign1', 'sign2', 'sign3', 'spread', 'alert', 'thumbs', 'gather', 'raise', 'cheer', 'wave'])
  POSES[`${name}Wind`] = wind(POSES[name]!)
// the charge: the flaps behind the bent knees
POSES['chargeWind'] = wind(POSES['charge']!, { at: [19, 10], rows: ['.xo', 'xxo', 'oo.'] })
// the palm on the ground: the back flap lifting off the floor
POSES['slamWind'] = wind(POSES['slam']!, { at: [23, 10], rows: ['oxxo', 'xxxo'] })
// the kabuki: the coat's back hem flicking up behind the standing leg
POSES['kabukiWind'] = wind(POSES['kabuki']!, { at: [20, 16], rows: ['xxko', 'xxxxo', 'xxxo.'] })

// the rest poses breathing in (the companion's breath, a hold's breath)
for (const [name, k] of [['crossed', 7], ['think', 11], ['sign1', 11], ['sign2', 7], ['sign3', 10], ['gather', 11], ['thumbs', 10], ['kabuki', 16]] as const) {
  POSES[`${name}In`] = inhale(POSES[name]!, k)
  POSES[name] = { ...POSES[name]!, breath: `${name}In` }
}

// Every companion pose (art/chibi.ts's Pose) to the haori's drawing of it:
// all drawn under their own names (the extras: idle1 the breath, windup the
// anticipation, smear and dash the run, follow the follow-through, crouch the
// landing, jump the hop, cheer and cheer2 the fist pump, wave the hello).
export const HAORI_MAP: Readonly<Record<Pose, string>> = {
  idle: 'idle0',
  crossed: 'crossed',
  think: 'think',
  signs: 'sign1',
  signs2: 'sign2',
  signs3: 'sign3',
  gather: 'gather',
  charge: 'charge',
  strike: 'strike',
  punch: 'punch',
  kick: 'kick',
  dash: 'dash',
  slam: 'slam',
  spread: 'spread',
  raise: 'raise',
  thumbs: 'thumbs',
  scratch: 'scratch',
  alert: 'alert',
  poke: 'poke',
  tuck: 'tuck',
  sleep: 'sleep',
  slump: 'slump',
}

// The floor's shadow, for the poses stood on the ground with the coat's hem
// across the feet row. The stage's own shadow under a ninja is 16 pixels,
// narrower than this hem (20), so under the haori it never showed: each
// ninja wearing it carries this one (a prop behind, on the feet) two pixels
// wider than the hem each side, in the stage's shadow colour, in exactly the
// poses (their own included) drawn standing.
const HEM = '...ooooouuttoouuttooooo...'
export const GROUND_SHADOW_ROWS = ['ss....................ss'] as const
export const standingPoses = (own: Readonly<Record<string, unknown>> = {}): string[] => {
  const rowsOf = (name: string, seen = 0): readonly string[] | undefined => {
    const p = own[name] ?? POSES[name]
    if (typeof p === 'string') return seen > 4 ? undefined : rowsOf(p, seen + 1)
    if (p && typeof p === 'object' && 'base' in p) return rowsOf((p as { base: string }).base, seen + 1)
    return (p as PoseGrid | undefined)?.rows
  }
  return [...new Set([...Object.keys(POSES), ...Object.keys(own)])].filter(name => rowsOf(name)?.at(-1) === HEM)
}

export const HAORI: Template = {
  name: 'haori',
  letters: 'oskvwxcnmlbjpqrtuyz',
  root: 13,
  neck: 6,
  poses: POSES,
  map: HAORI_MAP,
  points: { back: [13, 9] },
}
