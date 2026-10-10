// The motion report: each move of each ninja measured on the drawing itself
// (the ninja's body alone, then the effects), against the motion rules.
//   node scripts/motion.mjs [ids] [moves]
//     ids    comma-separated (default: every ninja)
//     moves  comma-separated indexes or labels (default J1,J2,J3,QK,CH):
//            0 1 2 = J1 J2 J3, 3 = QK (the quick strike), -3 = CH (the cheer),
//            -1 = AR (the arrival), -2 = FZ (the fizzle), -4 = DP (the dispel)
//   env: ALL=1 prints every move's row (default: only the moves that break a rule),
//        STRICT=1 exits 1 when any rule fails
//
// The columns, per move (frames are 10 fps):
//   N        the move's length in frames
//   statue   the longest stretch where every frame of the body stays within 40 px of
//            the stretch's first (a statue, or a statue with a 1-2 px twitch), and where
//            RULE: no stretch over 8 frames (0.8 s)
//   still    the longest run of pixel-identical body frames, and where
//            RULE: none over 8 frames
//   shudder  whole-body back-and-forth: the root (x, dy, lift) stepping away and back
//            within 2 frames, twice or more in 6 frames, on the ground (head-only
//            trembles, hdx/hdy, are allowed and not counted)
//            RULE: none
//   in       px of the body's first frame against the rest it starts from (the hand
//            signs while working; the idle stance for the cheer): a start pop (no rule)
//   out      px of the body's last frame against the idle stance
//            RULE: 60 px or less (the jutsu, quick strike and cheer; the shared
//            moves hand over to something else: '-')
//   pre      px of the frame before the ending (the trailing idle1/idle0 frames)
//            against the idle stance (rule 5's "within about 60 px of rest", as a guide)
//   vanish   effect px lost between the move's last two frames / the largest one-frame
//            loss anywhere in it (and its frame). Effect px are the pixels the cel's
//            effects change (the post's own poof in and out left out); a loss counts
//            when 50 px or more go (env VANISH) and less than 40% of the effect is
//            left (a big effect gone in one frame; an impact star's 58 -> 16 px
//            burst is not).
//            RULE: no such one-frame vanish
//   hold     the longest body hold, aligned (was 'limb'): the body drawn with the head
//            masked out, and the hem (the 2 rows at the feet) and the effects, laid
//            on each other at the best shift of up to 2 px across and 1 px up or down
//            (a nudge of the root, or a drawing redrawn a pixel over: raise and
//            raiseLow), its pixels compared. A nudged twin of a drawing is the same
//            drawing. A hold is a run of frames that are one pose family (at roots
//            within the nudge) or within HOLD px (env HOLD, 40: a Wind or a 1 px
//            redraw is 14-20, a punch and its strike 23, another seal or arm 50 or
//            more) of the run's first drawing, or two such keys alternating (A B A B,
//            A B A: a loop of drawings in one place)
//            RULE: none over 8 frames (0.8 s), however much the head, the hem and a
//            1-2 px nudge stir
//   cycle    the same short sequence of 2-6 body drawings (aligned twins as for
//            hold) repeated 3 times or more running, each drawing held the same frames
//            each time (a flurry at one constant rate: palm, palmLow, palm, palmLow...)
//            RULE: none. A flurry builds: 2-frame holds, then 1-frame, then smears,
//            ending on a held finish (a rate that changes, or a sequence that does,
//            passes)
//   root     the root's travel (the span of x, or of the height dy - lift) in the 6
//            frames each side of the first blow (the first 'impact', 'finish' or
//            'hit' beat), for the jutsu and quick strike ('-' for the cheer, or a
//            move with no blow)
//            RULE: 2 px or more (a caster moves their weight: kit.ts's cast())
//   shake    the cel shake (the camera's: the whole stage, post too): the longest run
//            of consecutive shaken frames whose shake changes (a buzz), and the
//            frames where it jolts the stage down over 1 px with the ninja on the
//            ground. The shake counts in the shudder check too (the root as drawn).
//            RULE: no buzz over 3 frames; no grounded down-shake over 1 px
//   hover    the longest airborne run (lift as drawn, after any clip) at one lift
//            RULE: under 3 frames (a leap arcs: it changes lift every frame or two)
//
// Self-contained: it loads the mod it sits in (scripts/..), or ROOT=<mod root>.

import { pathToFileURL } from 'node:url'

const base = process.env.ROOT ? pathToFileURL(process.env.ROOT.replace(/\/?$/, '/')) : new URL('..', import.meta.url)
const load = path => import(new URL(path, base).href)
const { NATIVE, frameOf } = await load('hooks/sprite/index.ts')
const { playOf } = await load('hooks/art/moves.ts')
const { NINJA } = await load('hooks/roster.ts')
const { dressOf, namesOf } = await load('hooks/sprite/dress.ts')
const { layoutOf } = await load('hooks/sprite/compose.ts')
const { GROUND } = await load('hooks/sprite/stage.ts')

const T = 40 // a statue's tolerance, px
const LONG = 8 // frames: 0.8 s
const OUT = 60 // px
const VANISH = Number(process.env.VANISH ?? 50) // px
const KEEP = 0.4 // of the effect left, at most, for a loss to count as a vanish
const NEAR = 6 // frames each side of the first blow the root must travel in
const TRAVEL = 2 // px of root travel there, at least
const BUZZ = 3 // consecutive changing shake frames, at most
const DOWN = 1 // px a grounded ninja's stage may shake down, at most
const HOVER = 3 // airborne frames at one lift: this many fail
const HOLD = Number(process.env.HOLD ?? 40) // px: bodies this close, laid on each other, are one drawing
const ALIGN_X = 2 // px across a root may be nudged and still be the same drawing
const ALIGN_Y = 1 // px up or down
const HEM = 2 // rows at the feet left out of a hold's body (the feet and the hem's stir)
const CYCLE = 3 // repeats of a 2-6 drawing sequence at one rate that fail
const isHit = name => name === 'impact' || name === 'finish' || /^hit\d*$/.test(name)
const LABELS = { 0: 'J1', 1: 'J2', 2: 'J3', 3: 'QK', '-3': 'CH', '-1': 'AR', '-2': 'FZ', '-4': 'DP' }
const BY_LABEL = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, Number(k)]))

const ids = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : NINJA.map(n => n.id).filter(id => NATIVE[id])
const moves = (process.argv[3] ?? 'J1,J2,J3,QK,CH').split(',').map(s => (s.toUpperCase() in BY_LABEL ? BY_LABEL[s.toUpperCase()] : Number(s)))
for (const id of ids) if (!NATIVE[id]) throw new Error(`no ninja ${id}`)

const W = 48
const face = { blink: 0, gaze: [0, 0], mood: 'calm', active: false }
const stateOf = (id, o = {}) => ({ id, face, pose: o.pose ?? 'idle', aura: 0, effect: null, badge: null, tick: 0, clones: 0, bob: 0, move: o.move ?? null })
const diff = (a, b) => {
  let n = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++
  return n
}
const same = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

// a move's frame f drawn from a copy of its frames changed by `edit` (`n`: the
// ninja drawn, theirs unless given: the headless copy)
const drawn = (id, index, m, f, edit, n = NATIVE[id]) => {
  const strip = { ...m, frames: m.frames.map(edit) }
  return frameOf(n, stateOf(id, { move: { index, t: f * 0.1 + 0.001 } }), () => strip).px
}
// the ninja with the head masked out: every head (theirs, the dojutsu's, their
// variants), the eyes and the props riding the head drawn clear, their grids
// kept (so the head seats and clips as ever); the body's UPPERCASE hands over
// the face still drawn
const clear = p => Object.fromEntries(Object.keys(p).map(k => [k, null]))
const blank = h => h && { ...h, palette: clear(h.palette) }
const headless = n => ({
  ...n,
  head: blank(n.head),
  ...(n.heads ? { heads: Object.fromEntries(Object.entries(n.heads).map(([k, h]) => [k, blank(h)])) } : {}),
  eyes: { ...n.eyes, palette: clear(n.eyes.palette) },
  ...(n.dojutsu ? { dojutsu: { ...n.dojutsu, ...(n.dojutsu.head ? { head: blank(n.dojutsu.head) } : {}) } } : {}),
  ...(n.props ? { props: n.props.filter(p => p.on !== 'head') } : {}),
})
// a pose's family: the drawing it is drawn with, its Wind, In and Breath
// variants and any pose's breath drawing folded into the pose
const familyOf = t => {
  const breathOf = {}
  for (const [name, p] of Object.entries(t.poses)) if (p.breath && p.breath !== name) breathOf[p.breath] ??= name
  const strip = name => {
    let s = name
    for (let k = 0; k < 4; k++) {
      const next = (breathOf[s] ?? s).replace(/(Wind|In|Breath)$/, '')
      if (next === s || !next) break
      s = next
    }
    return s
  }
  return pose => strip(namesOf(t, pose)[1])
}
// the body alone: the ninja, no effects, post, clones, tint, shake or flash
const bodyOnly = x => ({ n: 1, tag: x.tag, t: x.t, ...(x.k ? { k: x.k } : {}) })
// the post's own poof (kit.ts's smokeAt and wispsAt): the bookend, not an effect of the move's
const poof = e => e.fx === 'smoke' && e.at === 'post'
const withFx = x => ({ ...x, fx: (x.fx ?? []).filter(e => !poof(e)) })
const noFx = x => ({ ...x, fx: [] })

// A frame's body for the hold and cycle rules: the headless body drawn, its
// hem's rows at the feet and the floor shadow left out (clear), and its root.
const H24 = 24
const SHADE = 0x09090c
const bodyOf = (px, feetY) => {
  const out = new Int32Array(px.length).fill(-1)
  const cut = feetY - HEM + 1
  for (let i = 0; i < px.length; i++) if (px[i] !== SHADE && ((i / W) | 0) < cut) out[i] = px[i]
  return out
}
// How far apart two frames' bodies are as drawn, once laid on each other:
// the fewest pixels that differ over every shift of up to ALIGN_X across and
// ALIGN_Y up or down (a nudge of the root, or a drawing redrawn a pixel over:
// raise and raiseLow); null when even the roots are further apart than that
// plus a nudge (the body has travelled).
const alignedApart = (A, B) => {
  if (Math.abs(B.x - A.x) > 2 * ALIGN_X || Math.abs(B.h - A.h) > 2 * ALIGN_Y) return null
  let best = Infinity
  for (let sy = -ALIGN_Y; sy <= ALIGN_Y; sy++)
    for (let sx = -ALIGN_X; sx <= ALIGN_X; sx++) {
      let n = 0
      for (let y = 0; y < H24 && n < best; y++)
        for (let x = 0; x < W; x++) {
          const X = x + sx
          const Y = y + sy
          const b = X < 0 || Y < 0 || X >= W || Y >= H24 ? -1 : B.m[Y * W + X]
          if (A.m[y * W + x] !== b) n++
        }
      // (B's pixels shifted off the stage)
      if (n < best)
        for (let y = 0; y < H24; y++)
          for (let x = 0; x < W; x++) {
            const X = x - sx
            const Y = y - sy
            if ((X < 0 || Y < 0 || X >= W || Y >= H24) && B.m[y * W + x] !== -1) n++
          }
      best = Math.min(best, n)
    }
  return best
}

const report = []
const fails = { statue: [], still: [], shudder: [], out: [], vanish: [], hold: [], cycle: [], root: [], shake: [], hover: [] }
for (const id of ids) {
  const idle = frameOf(NATIVE[id], stateOf(id), () => undefined).px
  const signs = frameOf(NATIVE[id], stateOf(id, { pose: 'signs' }), () => undefined).px
  const bare = headless(NATIVE[id])
  const family = familyOf(dressOf(NATIVE[id]))
  for (const index of moves) {
    const m = playOf(id, index)
    if (!m) continue
    const label = LABELS[index] ?? String(index)
    const F = m.frames
    const N = F.length
    const body = F.map((_, f) => drawn(id, index, m, f, bodyOnly))
    const pose = f => F[f]?.k?.pose ?? '-'
    // statues: greedy stretches within T px of their first frame
    let statue = { n: 0, at: 0 }
    for (let i = 0; i < N; ) {
      let j = i
      while (j + 1 < N && diff(body[i], body[j + 1]) <= T) j++
      if (j - i + 1 > statue.n) statue = { n: j - i + 1, at: i }
      i = j + 1
    }
    // pixel-identical runs
    let still = { n: 0, at: 0 }
    for (let i = 0; i < N; ) {
      let j = i
      while (j + 1 < N && same(body[i], body[j + 1])) j++
      if (j - i + 1 > still.n) still = { n: j - i + 1, at: i }
      i = j + 1
    }
    // whole-body shudder: on the ground, runs of one root position, a short run (1-2
    // frames) that steps away and back to where it came from is a flick; two flicks
    // within 6 frames are a shudder
    // (the root as drawn: the cel's shake counted, the camera's jolt of the stage)
    const shakeOf = f => (typeof F[f].shake === 'number' ? [F[f].shake, 0] : (F[f].shake ?? [0, 0]))
    const posOf = f => (F[f].k && !(F[f].k.lift > 0) ? `${F[f].k.x + shakeOf(f)[0]},${(F[f].k.dy ?? 0) + shakeOf(f)[1]}` : null)
    const runs = []
    for (let f = 0; f < N; f++) {
      const p = posOf(f)
      if (runs.length && runs[runs.length - 1].p === p) runs[runs.length - 1].n++
      else runs.push({ p, at: f, n: 1 })
    }
    const flicks = []
    for (let r = 1; r + 1 < runs.length; r++) if (runs[r].p !== null && runs[r].n <= 2 && runs[r - 1].p !== null && runs[r - 1].p === runs[r + 1].p) flicks.push(runs[r].at)
    const shudders = []
    for (let i = 1; i < flicks.length; i++) if (flicks[i] - flicks[i - 1] <= 6 && !shudders.includes(flicks[i - 1])) shudders.push(flicks[i - 1])
    // holds, aligned: runs of frames twinned with the run's first (one pose
    // family, or masks within HOLD px, the roots laid on each other when within
    // a nudge); and two such keys alternating (A B A...: a loop of two drawings)
    const bareBody = F.map((_, f) => drawn(id, index, m, f, bodyOnly, bare))
    const at = F.map((x, f) => (x.k ? { x: x.k.x, h: (x.k.dy ?? 0) - (x.k.lift ?? 0), m: bodyOf(bareBody[f], layoutOf(NATIVE[id], x.k).feet[1]) } : null))
    const near = (a, b) => {
      if (!at[a] || !at[b]) return false
      const d = alignedApart(at[a], at[b])
      return d !== null && ((family(F[a].k.pose) === family(F[b].k.pose) && Math.abs(at[a].x - at[b].x) <= ALIGN_X && Math.abs(at[a].h - at[b].h) <= ALIGN_Y) || d <= HOLD)
    }
    const memo = new Map()
    const twins = (a, b) => {
      const key = a < b ? a * 4096 + b : b * 4096 + a
      if (!memo.has(key)) memo.set(key, near(a, b))
      return memo.get(key)
    }
    // (MDEBUG=<id>:<index>: each frame's distance from frame MREF, 0 unless given, and from the one before)
    if (process.env.MDEBUG === `${id}:${index}`) {
      const ref = Number(process.env.MREF ?? 0)
      for (let f = 0; f < N; f++) if (at[f]) console.error(f, pose(f), `d${ref}`, at[ref] ? alignedApart(at[ref], at[f]) : '-', 'dprev', f && at[f - 1] ? alignedApart(at[f - 1], at[f]) : '-')
    }
    let hold = { n: 0, at: 0, loop: false }
    const keys = []
    for (let i = 0; i < N; ) {
      if (!F[i].k) {
        keys.push({ at: i, n: 1, none: true })
        i++
        continue
      }
      let j = i
      while (j + 1 < N && twins(i, j + 1)) j++
      keys.push({ at: i, n: j - i + 1 })
      i = j + 1
    }
    for (const g of keys) if (!g.none && g.n > hold.n) hold = { n: g.n, at: g.at, loop: false }
    // (the rest stance, a move's bookend, is never one of a loop's keys)
    const rest = g => g.none || family(F[g.at].k.pose) === family('idle0')
    for (let a = 0; a + 2 < keys.length; a++) {
      if (rest(keys[a]) || rest(keys[a + 1])) continue
      let b = a + 1
      while (b + 1 < keys.length && !rest(keys[b + 1]) && twins(keys[b + 1].at, keys[b - 1].at)) b++
      if (b - a >= 2) {
        const n = keys.slice(a, b + 1).reduce((t, g) => t + g.n, 0)
        if (n > hold.n) hold = { n, at: keys[a].at, loop: true }
      }
    }
    // cycles: each frame named for the first drawing it twins, the names'
    // runs; a sequence of 2-6 runs repeated CYCLE times running, each run
    // held as long each time
    const names = []
    const reps = []
    for (let f = 0; f < N; f++) {
      if (!F[f].k) {
        names.push(-1)
        continue
      }
      let k = reps.findIndex(r => twins(r, f))
      if (k < 0) {
        k = reps.length
        reps.push(f)
      }
      names.push(k)
    }
    const seq = []
    for (let f = 0; f < N; f++) {
      if (seq.length && seq[seq.length - 1].name === names[f]) seq[seq.length - 1].n++
      else seq.push({ name: names[f], n: 1, at: f })
    }
    let cycle = { reps: 0, p: 0, at: 0, n: 0 }
    for (let p = 2; p <= 6; p++)
      for (let r = 0; r + 2 * p <= seq.length; r++) {
        if (seq.slice(r, r + p).some(u => u.name < 0) || new Set(seq.slice(r, r + p).map(u => u.name)).size < 2) continue
        let e = r + p
        while (e < seq.length && seq[e].name === seq[e - p].name && seq[e].n === seq[e - p].n) e++
        const k = Math.floor((e - r) / p)
        if (k > cycle.reps || (k === cycle.reps && k > 0 && p < cycle.p)) {
          const n = seq.slice(r, r + k * p).reduce((t, u) => t + u.n, 0)
          cycle = { reps: k, p, at: seq[r].at, n, rate: seq.slice(r, r + p).map(u => u.n).join('') }
        }
      }
    // root travel round the first blow: the span of x, or of the height
    const blow = F.findIndex(f => isHit(f.tag))
    let travel = null
    if (blow >= 0 && index >= 0) {
      const near = F.slice(Math.max(0, blow - NEAR), Math.min(N, blow + NEAR + 1)).filter(f => f.k)
      const xs = near.map(f => f.k.x)
      const ys = near.map(f => (f.k.dy ?? 0) - (f.k.lift ?? 0))
      travel = near.length ? Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) : 0
    }
    // shake: runs of consecutive shaken frames whose shake changes; grounded down-shakes
    const shaken = f => shakeOf(f)[0] !== 0 || shakeOf(f)[1] !== 0
    let buzz = { n: 0, at: 0 }
    for (let i = 0; i < N; ) {
      if (!shaken(i)) {
        i++
        continue
      }
      let j = i
      let changes = false
      while (j + 1 < N && shaken(j + 1)) {
        if (String(shakeOf(j + 1)) !== String(shakeOf(j))) changes = true
        j++
      }
      if (changes && j - i + 1 > buzz.n) buzz = { n: j - i + 1, at: i }
      i = j + 1
    }
    const downs = []
    for (let f = 0; f < N; f++) if (F[f].k && !(F[f].k.lift > 0) && shakeOf(f)[1] > DOWN) downs.push(f)
    // hovers: airborne runs at one lift, as drawn (after the clip)
    const liftOf = f => {
      const k = F[f].k
      if (!k || !(k.lift > 0)) return 0
      return GROUND + (k.dy ?? 0) - layoutOf(NATIVE[id], k).feet[1]
    }
    let hover = { n: 0, at: 0, lift: 0 }
    for (let i = 0; i < N; ) {
      const l = liftOf(i)
      let j = i
      while (j + 1 < N && l > 0 && liftOf(j + 1) === l) j++
      if (l > 0 && j - i + 1 > hover.n) hover = { n: j - i + 1, at: i, lift: l }
      i = j + 1
    }
    // pops
    const from = index === -3 ? idle : signs
    const pin = diff(from, body[0])
    const pout = diff(idle, body[N - 1])
    let e = N
    while (e > 0 && /^idle[01]$/.test(pose(e - 1))) e--
    const pre = e > 0 && e < N ? diff(idle, body[e - 1]) : null
    // effects: the pixels the cel's effects change
    const eff = F.map((_, f) => diff(drawn(id, index, m, f, withFx), drawn(id, index, m, f, noFx)))
    const lossAt = f => eff[f] - eff[f + 1]
    const vanishes = []
    for (let f = 0; f + 1 < N; f++) if (lossAt(f) >= VANISH && eff[f + 1] < eff[f] * KEEP) vanishes.push(f)
    let worst = { px: 0, at: -1 }
    for (let f = 0; f + 1 < N; f++) if (lossAt(f) > worst.px) worst = { px: lossAt(f), at: f }
    const last = N > 1 ? Math.max(0, lossAt(N - 2)) : 0
    const fxNames = f => [...new Set((F[f]?.fx ?? []).filter(x => !poof(x)).map(x => x.fx))].join('+')
    const row = {
      id,
      label,
      name: m.name,
      N,
      statue,
      still,
      shudders,
      pin,
      pout,
      pre,
      last,
      worst,
      vanishes,
      hold,
      cycle,
      travel,
      buzz,
      downs,
      hover,
    }
    if (statue.n > LONG) fails.statue.push(`${id} ${label} ${statue.n}f@${statue.at} ${pose(statue.at)}`)
    if (still.n > LONG) fails.still.push(`${id} ${label} ${still.n}f@${still.at} ${pose(still.at)}`)
    if (shudders.length) fails.shudder.push(`${id} ${label} @${shudders.join(',')}`)
    // (the shared moves hand over to something else: the fizzle to the slump, the dispel to the "!")
    const ends = index >= -3 && index !== -1 && index !== -2
    if (ends && pout > OUT) fails.out.push(`${id} ${label} ${pout}px [${pose(N - 1)}]`)
    for (const f of vanishes) fails.vanish.push(`${id} ${label} f${f}->${f + 1} -${lossAt(f)}px (${eff[f]}->${eff[f + 1]}) ${fxNames(f)}`)
    const holdBad = hold.n > LONG
    const cycleBad = cycle.reps >= CYCLE
    const rootBad = travel !== null && travel < TRAVEL
    const shakeBad = buzz.n > BUZZ || downs.length > 0
    const hoverBad = hover.n >= HOVER
    if (holdBad) fails.hold.push(`${id} ${label} ${hold.n}f@${hold.at} ${pose(hold.at)}${hold.loop ? ' (a loop of two)' : ''} (${(hold.n / 10).toFixed(1)} s)`)
    if (cycleBad) fails.cycle.push(`${id} ${label} ${cycle.p} drawings x${cycle.reps} @${cycle.at} (${cycle.n}f, ${cycle.rate} frames each): ${F.slice(cycle.at, cycle.at + cycle.n).map(f => f.k?.pose ?? '-').filter((p, i, a) => i === 0 || p !== a[i - 1]).slice(0, cycle.p * 2).join(' ')}...`)
    if (rootBad) fails.root.push(`${id} ${label} ${travel}px round the blow @${blow} (${F[blow].tag})`)
    if (shakeBad) fails.shake.push(`${id} ${label}${buzz.n > BUZZ ? ` buzz ${buzz.n}f@${buzz.at}: ${F.slice(buzz.at, buzz.at + buzz.n).map(f => JSON.stringify(f.shake)).join(' ')}` : ''}${downs.length ? ` down >${DOWN}px @${downs.join(',')}` : ''}`)
    if (hoverBad) fails.hover.push(`${id} ${label} ${hover.n}f@${hover.at} at lift ${hover.lift} ${pose(hover.at)}`)
    row.ends = ends
    row.bad = statue.n > LONG || still.n > LONG || shudders.length > 0 || (ends && pout > OUT) || vanishes.length > 0 || holdBad || cycleBad || rootBad || shakeBad || hoverBad
    row.holdBad = holdBad
    row.cycleBad = cycleBad
    row.rootBad = rootBad
    row.shakeBad = shakeBad
    row.hoverBad = hoverBad
    report.push(row)
  }
}

const pad = (s, n) => String(s).padEnd(n)
const lpad = (s, n) => String(s).padStart(n)
const flag = bad => (bad ? '!' : ' ')
console.log(`${pad('ninja', 11)} ${pad('mv', 3)}${pad('name', 22)}${lpad('N', 3)}  ${pad('statue', 10)}${pad('still', 9)}${pad('shudder', 9)}${lpad('in', 4)}${lpad('out', 5)}${lpad('pre', 5)}  ${pad('vanish', 13)}${pad('hold', 9)}${pad('cycle', 7)}${pad('root', 6)}${pad('shake', 7)}hover`)
for (const r of report) {
  if (!process.env.ALL && !r.bad) continue
  const st = `${flag(r.statue.n > LONG)}${r.statue.n}@${r.statue.at}`
  const sl = `${flag(r.still.n > LONG)}${r.still.n}@${r.still.at}`
  const sh = `${flag(r.shudders.length > 0)}${r.shudders.length ? r.shudders.join(',') : '-'}`
  const vn = `${flag(r.vanishes.length > 0)}${r.last}/${r.worst.px}${r.worst.at >= 0 ? '@' + r.worst.at : ''}`
  const lb = `${flag(r.holdBad)}${r.hold.n}@${r.hold.at}`
  const cy = `${flag(r.cycleBad)}${r.cycle.reps ? `${r.cycle.p}x${r.cycle.reps}` : '-'}`
  const rt = `${flag(r.rootBad)}${r.travel ?? '-'}`
  const sk = `${flag(r.shakeBad)}${r.buzz.n}${r.downs.length ? 'v' : ''}`
  const hv = `${flag(r.hoverBad)}${r.hover.n ? `${r.hover.n}@${r.hover.at}` : '-'}`
  console.log(`${pad(r.id, 11)} ${pad(r.label, 3)}${pad(r.name.slice(0, 21), 22)}${lpad(r.N, 3)}  ${pad(st, 10)}${pad(sl, 9)}${pad(sh, 9)}${lpad(r.pin, 4)}${lpad(r.ends ? (r.pout > OUT ? '!' : '') + r.pout : '-', 5)}${lpad(r.pre ?? '-', 5)}  ${pad(vn, 13)}${pad(lb, 9)}${pad(cy, 7)}${pad(rt, 6)}${pad(sk, 7)}${hv}`)
}
const total = report.length
console.log(`\n${total} moves of ${ids.length} ninja (${process.env.ALL ? 'all rows' : 'rows that break a rule; ALL=1 for every row'}; ! marks a broken rule)`)
const RULES = [
  ['statue', `no stretch over ${LONG} frames within ${T} px`],
  ['still', `no pixel-identical body run over ${LONG} frames`],
  ['shudder', 'no whole-body back-and-forth (x, dy) every 1-2 frames'],
  ['out', `last frame within ${OUT} px of the idle stance`],
  ['vanish', `no effect losing ${VANISH}+ px and over ${Math.round(100 * (1 - KEEP))}% of itself in one frame`],
  ['hold', `no body hold over ${LONG} frames (was limb): one pose family or twins within ${HOLD} px, roots aligned within ${ALIGN_X} across and ${ALIGN_Y} up/down, head and hem ignored; A B A loops too`],
  ['cycle', `no sequence of 2-6 drawings repeated ${CYCLE}+ times at one rate (a flurry builds: 2f, 1f, smears, a held finish)`],
  ['root', `${TRAVEL}+ px of root travel within ${NEAR} frames of the first blow (jutsu, quick strike)`],
  ['shake', `no shake buzz over ${BUZZ} frames; no grounded down-shake over ${DOWN} px`],
  ['hover', `no airborne run of ${HOVER}+ frames at one lift`],
]
for (const [k, what] of RULES) {
  const f = fails[k]
  console.log(`${pad(k, 8)} ${f.length ? 'FAIL' : 'pass'}  ${what}${f.length ? `: ${f.length}\n           ${f.join('\n           ')}` : ''}`)
}
if (process.env.STRICT && Object.values(fails).some(f => f.length)) process.exit(1)
