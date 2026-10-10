// Things held or thrown, drawn apart from the body so any ninja can hold one:
// the kunai for the quick strike, point to the left; anchor = the grip
// (placed at 'hand').

import type { FxFamily } from '../types.ts'

export const kunai: FxFamily = {
  palette: 'kunai',
  anchor: [5, 1],
  frames: [['.wc....', 'wwwcddr', '.wc....']],
}
