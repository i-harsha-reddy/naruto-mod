// The ninja, by roster id. Each ninja's file (ninja/<id>.ts) ends
// with `register(THEIR_SPRITE)`; index.ts imports each file once, which is
// what lists them. Nothing here imports anything, so a ninja's file can
// register itself without an import cycle.

import type { NinjaSprite } from './types.ts'

export const NATIVE: Record<string, NinjaSprite> = {}

export const register = (n: NinjaSprite): NinjaSprite => {
  if (NATIVE[n.id] && NATIVE[n.id] !== n) throw new Error(`two native sprites for ${n.id}`)
  NATIVE[n.id] = n
  return n
}
