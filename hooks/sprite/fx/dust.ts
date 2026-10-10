// The ground: grit kicked up off the heels on a push-off or a landing, and
// earth burst open by something coming up through it (a summoned hound).
// Palette 'dust'.

import type { FxFamily } from '../types.ts'

// Grit off the heels: flat, never a stem or a peg standing up (a narrow nub
// on a base read as feet left behind): two low streaks skidding out either
// side of the feet, then two puffs drifting out to 7 px each side, leaning
// outward as they lift, then two dashes rising off and gone (the same
// pixels a frame as ever: 12, 12, 6). 3 frames, 15 x 4, anchor = bottom
// centre (on the ground).
export const dust: FxFamily = {
  palette: 'dust',
  anchor: [7, 3],
  frames: [
    ['...............', '...............', '...............', '.dbbbbc.cbbbbd.'],
    ['...............', '...............', 'cbb.........bbc', '.bbd.......dbb.'],
    ['...............', 'cbd.........dbc', '...............', '...............'],
  ],
}

// The floor breaking open: a crack and a heave, clods thrown up and out, the
// last of them falling. 15 x 7, anchor = bottom centre (on the ground).
export const earth: FxFamily = {
  palette: 'dust',
  anchor: [7, 6],
  frames: [
    [
      '...............',
      '...............',
      '...............',
      '...............',
      '.....c...c.....',
      '...cbbd.dbbc...',
      '.cbddnnnnnddbc.',
    ],
    [
      '...............',
      '..c.........c..',
      '.cb...c.c...bc.',
      '..d..cb.bc..d..',
      '.....d...d.....',
      'cb...........bc',
      'bd...........db',
    ],
    [
      'c.............c',
      'd.............d',
      '...............',
      '...............',
      '...............',
      '.c...........c.',
      'cbd.........dbc',
    ],
  ],
}
