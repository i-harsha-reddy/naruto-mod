// What plays: each ninja's moves as the sprite engine (sprite/) draws them,
// their three jutsu, quick strike and cheer (sprite/anims/<id>.ts) and the
// arrival, fizzle and dispel every ninja shares (sprite/anims/shared.ts),
// each a Move whose beats come from its cels (sprite/cels.ts).

import { NATIVE, sharedOf } from '../sprite/index.ts'
import type { CelMove } from '../sprite/types.ts'

// the ninja's three jutsu, in /ninja jutsu's order
export const movesOf = (id: string): readonly CelMove[] => NATIVE[id]?.moves ?? []

// A playing move's index (ChibiState's move.index): 0 to 2 a ninja's jutsu,
// QUICK_INDEX their quick strike, ARRIVAL_INDEX the arrival, FIZZLE_INDEX a
// jutsu fizzling out, CHEER_INDEX their cheer, DISPEL_INDEX a jutsu
// dispelled by a permission prompt
export const QUICK_INDEX = 3
export const ARRIVAL_INDEX = -1
export const FIZZLE_INDEX = -2
export const CHEER_INDEX = -3
export const DISPEL_INDEX = -4
export const playOf = (id: string, index: number): CelMove | undefined => {
  const n = NATIVE[id]
  if (!n) return undefined
  if (index === ARRIVAL_INDEX) return sharedOf(n).arrival
  if (index === FIZZLE_INDEX) return sharedOf(n).fizzle
  if (index === DISPEL_INDEX) return sharedOf(n).dispel
  return index === QUICK_INDEX ? n.quick : index === CHEER_INDEX ? n.cheer : index >= 0 ? n.moves[index] : undefined
}
