// The summoned animals as effects: hand-drawn pixel sprites, one file each in
// summons/ (rows of letters a, b, c... naming their palette in order, a
// `foot` pixel standing on the ground), outlined a pixel round in the stage's
// outline colour, anchored on the foot. A cel places one like any effect
// (`{ fx: 'bull', f: 0, at: [x, GROUND] }`), and `sink` brings it up out of
// the ground. Each is drawn facing left, toward the arena, in a small palette
// of its own; the giants are drawn to be cut off by the stage's edges:
// Gamabunta looms in head and shoulders, the Nine-Tails sits with his tails
// fanned up, both filling the arena's height. Also the summoned things of a
// few jutsu (Deidara's clay dragon, Susanoo, a meteor).

import { outlined } from '../grid.ts'
import type { FxFamily, Palette } from '../types.ts'
import { sprite as toad } from './summons/toad.ts'
import { sprite as pakkun } from './summons/pakkun.ts'
import { sprite as bull } from './summons/bull.ts'
import { sprite as ninken } from './summons/ninken.ts'
import { sprite as slug } from './summons/slug.ts'
import { sprite as manda } from './summons/manda.ts'
import { sprite as crow } from './summons/crow.ts'
import { sprite as shark } from './summons/shark.ts'
import { sprite as kurama } from './summons/kurama.ts'
import { sprite as c2 } from './summons/c2.ts'
import { sprite as susanoo } from './summons/susanoo.ts'
import { sprite as meteor } from './summons/meteor.ts'

export type SummonId = 'toad' | 'pakkun' | 'bull' | 'ninken' | 'slug' | 'manda' | 'crow' | 'shark' | 'kurama' | 'c2' | 'susanoo' | 'meteor'

// A sprite drawn by hand: `rows` are letters naming `palette` colours (a is
// the first), '.' clear; `foot` is the pixel (column, row) that stands on the
// ground. Up to about 20x24 pixels; a giant may be placed so the stage's edges
// cut it.
export type PixelSprite = { palette: readonly number[]; rows: readonly string[]; foot: readonly [number, number] }

export const PIXEL_SUMMONS: Readonly<Record<SummonId, PixelSprite>> = { toad, pakkun, bull, ninken, slug, manda, crow, shark, kurama, c2, susanoo, meteor }

export const OUTLINE = 0x0e1019
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

const familyOf = (id: SummonId): FxFamily => {
  const s = PIXEL_SUMMONS[id]
  // (the outline's letter is past the sprite's own)
  const o = LETTERS[s.palette.length]!
  const palette: Palette = Object.fromEntries([...s.palette.map((c, i) => [LETTERS[i]!, c] as const), [o, OUTLINE]])
  return { palette, anchor: [s.foot[0] + 1, s.foot[1] + 1], frames: [outlined(s.rows, o)] }
}

export const SUMMON_FX: Readonly<Record<string, FxFamily>> = Object.fromEntries((Object.keys(PIXEL_SUMMONS) as SummonId[]).map(id => [id, familyOf(id)]))
