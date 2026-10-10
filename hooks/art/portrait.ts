// A face's moment (the mood, a blink, the glance, a dojutsu awake) and the
// colour mixing the renderer uses.

export type Mood = 'calm' | 'focus' | 'happy' | 'worried' | 'surprised' | 'sleep' | 'smug'

export type Face = {
  // 0 open, 1 closed
  blink: number
  // where the eyes look, -1..1 on each axis
  gaze: readonly [number, number]
  mood: Mood
  // the kekkei genkai switched on
  active: boolean
}

export const mixc = (a: number, b: number, t: number): number => {
  const ch = (s: number): number => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * t)
  return (ch(16) << 16) | (ch(8) << 8) | ch(0)
}
