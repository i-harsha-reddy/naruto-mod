// A fingerprint of every frame a ninja can be drawn in, so a change to their
// art shows up as a test failure naming the ninja and the move it touched:
// each jutsu, the quick strike, cheer, arrival, fizzle and dispel at every
// 0.1 s frame (the dojutsu as the move wakes it), and every rest pose in
// every mood, blink, breath and dojutsu, as the terminal's 48 x 12 cells.
// A deliberate change updates the table: `node scripts/fingerprint.mjs`
// prints it afresh.

import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { SPRITE, pixelCells } from '../hooks/art/pixel.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, playOf } from '../hooks/art/moves.ts'
import { frameTime, poseAt, totalOf } from '../hooks/art/move.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { byId } from '../hooks/roster.ts'

export const PARTS: readonly [string, number | null][] = [
  ['jutsu1', 0], ['jutsu2', 1], ['jutsu3', 2], ['quick', QUICK_INDEX], ['cheer', CHEER_INDEX],
  ['arrival', ARRIVAL_INDEX], ['fizzle', FIZZLE_INDEX], ['dispel', DISPEL_INDEX], ['rest', null],
]
const POSES: readonly Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
const MOODS: readonly Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']

// cyrb53: a 53-bit hash of 32-bit words, as 14 hex digits
const hash = (frames: readonly Uint32Array[]): string => {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (const words of frames)
    for (let i = 0; i < words.length; i++) {
      const w = words[i]!
      h1 = Math.imul(h1 ^ w, 2654435761)
      h2 = Math.imul(h2 ^ w, 1597334677)
    }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0')
}

const cells = (st: ChibiState): Uint32Array => pixelCells(st, byId(st.id).glow, SPRITE.columns, SPRITE.rows)

// one part of a ninja's art: a move's every frame, or every rest
export const fingerprintOf = (id: string, index: number | null): string => {
  const frames: Uint32Array[] = []
  if (index !== null) {
    const m = playOf(id, index)
    if (!m) return 'none'
    for (let t = 0; t < totalOf(m) - 1e-6; t += 0.1) {
      const mt = frameTime(t)
      const f = poseAt(m, mt)
      frames.push(cells({ id, face: { blink: 0, gaze: [f.gaze[0], f.gaze[1]], mood: f.mood, active: m.dojutsu !== false }, pose: f.pose, aura: f.aura, badge: null, tick: 0, bob: 0, move: { index, t: mt } }))
    }
  } else
    for (const pose of POSES)
      for (const mood of MOODS)
        for (const [blink, bob, active] of [[0, 0, false], [1, 0, false], [0, 1, false], [0, 0, true]] as const)
          frames.push(cells({ id, face: { blink, gaze: [0, 0], mood, active }, pose, aura: 0, badge: null, tick: 0, bob, move: null }))
  return hash(frames)
}

// The table, as drawn when it was last updated.
export const FINGERPRINTS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  naruto: { jutsu1: '04ad3a059bd909', jutsu2: '19ef4faf76405d', jutsu3: '12b4255dc68147', quick: '19c1b689beacc9', cheer: '1dc548995ac775', arrival: '1c62d8f4f35b23', fizzle: '1be8f4c39d9524', dispel: '1cdfedcf40c8bc', rest: '0b31444e02a314' },
  sasuke: { jutsu1: '02d7bff52a4daf', jutsu2: '10de75873545c8', jutsu3: '022c5d470fbc77', quick: '03693cd14795cc', cheer: '10227b165c801e', arrival: '1ef8167cb10cd9', fizzle: '0831536d7407b7', dispel: '17c066578c6520', rest: '18710a99f347bb' },
  sakura: { jutsu1: '0f6d079b838435', jutsu2: '10197d7f373699', jutsu3: '1ea76528b07f37', quick: '087ec40d06cc34', cheer: '1861a5fa476ba7', arrival: '03b8948014e43e', fizzle: '11828e9f747276', dispel: '15ba8f07888248', rest: '0598a96cc8f9ea' },
  kakashi: { jutsu1: '191c0aad0b3321', jutsu2: '0503e93d0cb8e7', jutsu3: '186c971271df44', quick: '10a581480bc51b', cheer: '1c660ba465bc96', arrival: '17104aca4b6e7e', fizzle: '0c2407c13747e5', dispel: '028cce8240edbc', rest: '1d8bb367f3f34a' },
  hinata: { jutsu1: '196b62b58aaaef', jutsu2: '18916ef6fec438', jutsu3: '0c55f8a1ef7ad1', quick: '0c45078a4b30c7', cheer: '1b4553dccf831f', arrival: '010c8b334d9c22', fizzle: '1b93285f6a0842', dispel: '0b6652dad8ee8d', rest: '082c601a30d043' },
  lee: { jutsu1: '1b71e5309f6544', jutsu2: '0b43b5ecf89ac5', jutsu3: '078e45406a56e7', quick: '0b6f7ae94f9ae3', cheer: '1564ccf5c6eb3f', arrival: '00e21b1dd21a80', fizzle: '130dc670d46222', dispel: '1b5e39665e566f', rest: '04982e170e7bff' },
  neji: { jutsu1: '10f56f62fdcefa', jutsu2: '0154c2c1209c54', jutsu3: '0a3e961dcae7f8', quick: '0a383bc02943a7', cheer: '0ddd17af8180e2', arrival: '00e55740e7bbef', fizzle: '0737ceff143c86', dispel: '1e68c3202301d0', rest: '011ae56cf5d05c' },
  shikamaru: { jutsu1: '05cc99cc321bcc', jutsu2: '0ba9cf0949d29d', jutsu3: '18eed351a7546c', quick: '06c56d7f53a78a', cheer: '0d685f7f7d402c', arrival: '1093c1f4e87412', fizzle: '16bd087490254b', dispel: '051281a88a402b', rest: '194b0145666502' },
  gaara: { jutsu1: '12b2128be6528c', jutsu2: '08ece9d47cec9f', jutsu3: '18fc8190591672', quick: '1feb11a083a923', cheer: '1a68b944f3af20', arrival: '13b8f95795dd3b', fizzle: '1c7db656855d3b', dispel: '0a92fdf7d8dce3', rest: '0d1236917311f3' },
  itachi: { jutsu1: '16f721816ccb9b', jutsu2: '01ab3ffe8f37ca', jutsu3: '01bd9acda308fd', quick: '1893ab2ba30004', cheer: '129ab01d05b231', arrival: '1b1098ab43ca30', fizzle: '1cbdb656ce6908', dispel: '139e20fcd0c480', rest: '077f34587b4a6b' },
  jiraiya: { jutsu1: '1fcce980246ca8', jutsu2: '050dfe7e0f4653', jutsu3: '17256025de294e', quick: '0551bb395b4a2b', cheer: '0ff77f30322db6', arrival: '0196867d5e30a5', fizzle: '06465892863712', dispel: '1c42520b9da809', rest: '1aae5f6413d882' },
  tsunade: { jutsu1: '006ce99eb88d40', jutsu2: '15b7337cabcc06', jutsu3: '065a9b7717d657', quick: '02637848cb814a', cheer: '0d4bce62e4c59a', arrival: '04bbc5da00d4fa', fizzle: '1cb8772ef6a642', dispel: '09b59a3bc21b4b', rest: '08a46310d03b42' },
  orochimaru: { jutsu1: '1b669177b1d90e', jutsu2: '067ef2ea12a4d2', jutsu3: '1f78b66317910f', quick: '16abe6bcd09339', cheer: '021c53dfc54a9f', arrival: '0842318e204abe', fizzle: '13cd3879ff1982', dispel: '0cbfda303e1b46', rest: '14a8a07cdbef8f' },
  minato: { jutsu1: '1209352f13c734', jutsu2: '07555ff3abe2ce', jutsu3: '16dee2311ff339', quick: '17aa7e2ba1fb7a', cheer: '032003dd8b2761', arrival: '05fac53661df6d', fizzle: '17ec39efeb41d2', dispel: '00a66e939aadca', rest: '1771c75f9fcd2a' },
  guy: { jutsu1: '108daba999bbba', jutsu2: '165d15d0fe6621', jutsu3: '0b21dea0445a7e', quick: '06ddaf003ee111', cheer: '10c889a987f1f0', arrival: '18fe7b1cfabfd8', fizzle: '01b77827d830cc', dispel: '0e83c771fc8a27', rest: '1502fffe9c0085' },
  madara: { jutsu1: '06fb06d2cd11ff', jutsu2: '0f272747ee8d58', jutsu3: '0b93e7ee17bbeb', quick: '0c7f13bcdd1d65', cheer: '17c303c204f4f3', arrival: '0fa298d992eff9', fizzle: '013e460657c350', dispel: '1bcdc416f3ea69', rest: '10e8fae9d1a3b5' },
  obito: { jutsu1: '08c0941eacc9bf', jutsu2: '1d18a6cddd823f', jutsu3: '06b255c4fa7ab0', quick: '00872830d01840', cheer: '1f658a2602d0e9', arrival: '1fb9288cae4d8a', fizzle: '052ef3f73051dd', dispel: '0e108e7cd34082', rest: '14635d242ec75b' },
  pain: { jutsu1: '09cf7f20bbf9a6', jutsu2: '108f4d7c4c0bf3', jutsu3: '15636d82983e4c', quick: '030406a6ea2aa6', cheer: '1d94c9f8b242e9', arrival: '0e464c333af9b4', fizzle: '13742a858abd0b', dispel: '11a0037881398e', rest: '028cbedf4d4fea' },
  deidara: { jutsu1: '15854a798c79ae', jutsu2: '0a59e278e2c5d5', jutsu3: '1eeb89758acaef', quick: '09b09f125c7b68', cheer: '10ace4d1f377d6', arrival: '0f0dfdfefe372e', fizzle: '0492c5e062cb9a', dispel: '0a5a55dabf95dd', rest: '0ed272869c989b' },
  kisame: { jutsu1: '1206574b7c0295', jutsu2: '0b173a9468576b', jutsu3: '03a8552f492932', quick: '199c6e60dd8f6c', cheer: '06b7422203f9c3', arrival: '108f1291f6a1bb', fizzle: '1795596456c84d', dispel: '1737dcf30b6a32', rest: '09d5f689b80d51' },
}
