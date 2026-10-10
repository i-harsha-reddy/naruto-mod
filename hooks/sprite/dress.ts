// A ninja's own copy of their template, made once: the template's poses with
// the ninja's own poses put in (NinjaSprite.poses: another pose's drawing
// under a name, changed a little, or a drawing of their own), their rules run
// over every grid, and their per-pose overlays baked in (NinjaSprite.overlays;
// a pose's `<pose>Wind` drawing takes the pose's overlays, unless it has its own).
// The compositor draws from this, so a ninja who changes nothing draws from
// the template's own grids, untouched.
//
// Baking an overlay ({ rows, at?, on?, under? }) into a pose grid: '.' keeps
// the grid's pixel, '_' or '-' clears it, any other letter paints it (the
// body's letters, UPPERCASE over the head). `at` is its top-left in the grid;
// a negative row grows the grid upward (the feet stay on the last row, the
// hand and points keep their place on the body), a long row grows it to the
// right; a negative column throws (the root must stay put). Left out, the
// overlay's last row sits on the feet row at column 0. on: 'head' measures
// `at` from the head's top-left where the pose seats it (standing, plus the
// pose's head offset). `under` paints only where the grid is clear.

import type { Pose } from '../art/chibi.ts'
import { poseOf } from './cels.ts'
import type { Grid, HeadGrid, NinjaSprite, Overlay, PoseGrid, PoseRef, Template, XY } from './types.ts'

const isRef = (v: unknown): v is PoseRef => typeof v === 'object' && v !== null && 'base' in v

// an overlay baked into a pose's grid: its rows, hand and points moved with
// any rows it grew upward
const bake = (pose: PoseGrid, ov: Overlay, t: Template, head: HeadGrid): PoseGrid => {
  let rows = pose.rows.map(r => [...r])
  const w0 = Math.max(0, ...rows.map(r => r.length))
  let [x, y] = ov.at ?? [0, rows.length - ov.rows.length]
  if (ov.on === 'head') {
    const [hdx, hdy] = pose.head ?? [0, 0]
    x += t.root - head.neck[0] + hdx
    y += rows.length - 1 - t.neck - head.neck[1] + hdy
  }
  if (x < 0) throw new Error(`an overlay left of the grid's column 0 would move the root`)
  let grew = 0
  while (y < 0) {
    rows.unshift([...'.'.repeat(w0)])
    y++
    grew++
  }
  ov.rows.forEach((line, ry) => {
    const row = rows[y + ry]
    if (!row) throw new Error(`an overlay's row ${ry} falls below the feet`)
    for (let rx = 0; rx < line.length; rx++) {
      const ch = line[rx]!
      if (ch === '.' || ch === ' ') continue
      while (row.length <= x + rx) row.push('.')
      if (ov.under && row[x + rx] !== '.') continue
      row[x + rx] = ch === '_' || ch === '-' ? '.' : ch
    }
  })
  const w = Math.max(...rows.map(r => r.length))
  rows = rows.map(r => (r.length < w ? [...r, ...'.'.repeat(w - r.length)] : r))
  const down = (p: XY): XY => [p[0], p[1] + grew]
  return {
    ...pose,
    rows: rows.map(r => r.join('')),
    ...(pose.hand && grew ? { hand: down(pose.hand) } : {}),
    ...(pose.points && grew ? { points: Object.fromEntries(Object.entries(pose.points).map(([k, p]) => [k, down(p)])) } : {}),
  }
}

// The template with a ninja's own poses put in (NinjaSprite.poses): another
// pose's drawing under a name, changed a little, or a drawing of their own.
// Their moves are written against it (celMove's template), so each beat
// reports the pose and face the ninja is drawn in; dressOf adds their rules
// and overlays. The template itself when they bring none.
//     const T = wear(HAORI, MADARA_POSES)     (one line, for six hand-built copies)
export const wear = (t: Template, own: NinjaSprite['poses']): Template => {
  if (!own) return t
  const poses: Record<string, PoseGrid> = { ...t.poses }
  for (const [name, p] of Object.entries(own)) {
    if (typeof p === 'string') poses[name] = poseOf(t, p)
    else if (isRef(p)) {
      const base = poseOf(t, p.base)
      poses[name] = {
        ...base,
        ...(p.eyes ? { eyes: p.eyes } : {}),
        ...(p.head ? { head: p.head } : {}),
        ...(p.hand ? { hand: p.hand } : {}),
        ...(p.points ? { points: { ...base.points, ...p.points } } : {}),
      }
    } else poses[name] = p
  }
  return { ...t, poses }
}

const dressed = new WeakMap<NinjaSprite, Template>()

// The ninja's template: the original itself when they change nothing.
export const dressOf = (n: NinjaSprite): Template => {
  let d = dressed.get(n)
  if (d) return d
  const t = n.template
  if (!n.poses && !n.overlays && !n.rules) {
    dressed.set(n, t)
    return t
  }
  // the ninja's own poses: another pose's drawing (with changes), or their own
  const poses: Record<string, PoseGrid> = { ...wear(t, n.poses).poses }
  // a re-pointed pose takes its base's overlays first, and so does a pose's
  // Wind drawing (a moving hold's: `sign2Wind` wears what `sign2` wears)
  // unless the ninja gives the Wind overlays of its own
  const baseOf = (name: string): string | undefined => {
    const own = n.poses?.[name]
    if (typeof own === 'string') return own
    if (isRef(own)) return own.base
    return name.endsWith('Wind') && poses[name.slice(0, -4)] && !n.overlays?.[name] ? name.slice(0, -4) : undefined
  }
  for (const name of Object.keys(poses)) {
    let p = poses[name]!
    for (const rule of n.rules ?? []) {
      const rows: Grid = rule(p.rows, name)
      if (rows !== p.rows) p = { ...p, rows }
    }
    const base = baseOf(name)
    const list = [...(n.overlays?.['*'] ?? []), ...(base && base !== name ? (n.overlays?.[base] ?? []) : []), ...(n.overlays?.[name] ?? [])]
    for (const ov of list) p = bake(p, ov, t, n.head)
    poses[name] = p
  }
  for (const name of Object.keys(n.overlays ?? {})) if (name !== '*' && !poses[name] && !t.map[name as Pose]) throw new Error(`${n.id}: overlays for a pose there is none of: ${name}`)
  d = { ...t, poses }
  dressed.set(n, d)
  return d
}

// the names a pose answers to: the one asked for, and the drawing it resolves to
export const namesOf = (t: Template, name: string): [string, string] => [name, t.poses[name] ? name : (t.map[name as Pose] ?? name)]
