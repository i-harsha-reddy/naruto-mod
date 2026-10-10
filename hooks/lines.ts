// What the spinner says while a turn runs: the chosen ninja's own lines mixed
// with ninja-world words for what Claude is doing right now. The words anyone
// could say are here; what only some would (Sage Mode, the Hokage, the ring)
// belongs to the ninja's own lines or their side's.

import type { Group, Ninja } from './roster.ts'

type Mode = 'requesting' | 'responding' | 'thinking' | 'tool-input' | 'tool-use'

const SPINNER: Record<Mode, readonly string[]> = {
  thinking: ['Studying the scroll', 'Gathering chakra', 'Reading the enemy’s chakra', 'Planning the next move', 'Weighing the mission'],
  requesting: ['Dispatching a summons', 'Releasing a messenger hawk', 'Sending word ahead'],
  responding: ['Writing the mission report', 'Unsealing the scroll', 'Inking the jutsu'],
  'tool-input': ['Weaving hand signs', 'Molding chakra', 'Taking aim with a kunai'],
  'tool-use': ['Performing the jutsu', 'Throwing shuriken', 'Channelling chakra'],
}

// the errands of a ninja's side: the Leaf's black ops, the rogues' ring
const SIDE: Record<Group, readonly string[]> = {
  'Hidden Leaf': ['Signalling the ANBU', 'Guarding the village gates'],
  Akatsuki: ['Calling a meeting through the ring', 'Meeting at the hideout'],
  Elsewhere: [],
}

// a well-stirred hash, so neighbouring turns pick unrelated lines
const mix = (n: number): number => {
  let x = (n | 0) ^ 0x5bd1e995
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d)
  x = Math.imul(x ^ (x >>> 12), 0x297a2d39)
  return (x ^ (x >>> 15)) >>> 0
}

// steady within one turn and mode, so the line does not flicker on redraws
export const pickLine = (ninja: Ninja, mode: Mode, turn: number): string => {
  const generic = SPINNER[mode] ?? SPINNER.thinking
  const side = SIDE[ninja.group] ?? []
  const pool = mode === 'thinking' || mode === 'tool-use' ? [...ninja.lines, ...generic, ...side] : [...generic, ...side, ...ninja.lines.slice(0, 1)]
  const modeIndex = Object.keys(SPINNER).indexOf(mode)
  return pool[mix(turn * 31 + modeIndex * 7 + ninja.id.length) % pool.length]!
}

