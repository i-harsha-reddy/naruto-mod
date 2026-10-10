import { describe, expect, test } from 'claude-code/testing'
import { NINJA } from '../hooks/roster.ts'
import { FINGERPRINTS, PARTS, fingerprintOf } from './fingerprint.ts'

// Every ninja's art, frame for frame, as last approved (tests/fingerprint.ts):
// a change to a template, a head, a palette, an effect or a cel shows up here,
// named by the ninja and the move it touched. After a deliberate change,
// `node scripts/fingerprint.mjs` prints the table to paste in.
describe('the art, frame for frame', () => {
  for (const n of NINJA)
    test(`${n.short}: every jutsu, strike, cheer, shared move and rest pose draws as approved`, () => {
      const now = Object.fromEntries(PARTS.map(([part, index]) => [part, fingerprintOf(n.id, index)]))
      expect({ id: n.id, ...now }).toEqual({ id: n.id, ...FINGERPRINTS[n.id] })
    })
})
