// The jutsu as the mod names them: each ninja's three, in order, with the
// short name the spinner shouts, what calls them (a shell command, a
// subagent, an edit), whether the eyes wake, and the beats that start the
// shout or shout lines of their own. Frozen from the vector engine the sprite
// engine replaced, so the moves keep their names, shouts and triggers.

export type JutsuFacts = {
  name: string
  shout: string
  on?: readonly ('shell' | 'edit' | 'agent')[]
  dojutsu?: boolean
  beats: readonly { name: string; shout: true | string }[]
}

export const JUTSU: Readonly<Record<string, readonly JutsuFacts[]>> = {
  naruto: [
    { name: 'Rasengan', shout: 'Rasengan', on: ['shell'], dojutsu: false, beats: [{ name: 'dash', shout: true }] },
    { name: 'Shadow Clone Jutsu', shout: 'Shadow Clone Jutsu', on: ['agent'], dojutsu: false, beats: [{ name: 'poof', shout: true }] },
    { name: 'Wind Style: Rasenshuriken', shout: 'Rasenshuriken', beats: [{ name: 'release', shout: true }] },
  ],
  sasuke: [
    { name: 'Chidori', shout: 'Chidori', on: ['shell'], beats: [] },
    { name: 'Fire Style: Great Fireball Jutsu', shout: 'Great Fireball', beats: [] },
    { name: 'Chidori Katana', shout: 'Chidori Katana', on: ['edit'], beats: [{ name: 'flow', shout: true }] },
  ],
  sakura: [
    { name: 'Cherry Blossom Impact', shout: 'Cherry Blossom Impact', on: ['shell'], dojutsu: false, beats: [] },
    { name: 'Chakra Enhanced Strength', shout: 'Shannaro', on: ['edit'], dojutsu: false, beats: [{ name: 'windup', shout: true }] },
    { name: 'Summoning Jutsu: Katsuyu', shout: 'Summon: Katsuyu', on: ['agent'], dojutsu: false, beats: [{ name: 'slam', shout: true }] },
  ],
  kakashi: [
    { name: 'Raikiri', shout: 'Raikiri', on: ['shell'], beats: [] },
    { name: 'Summoning Jutsu: Ninken', shout: 'Summon: Ninken', on: ['agent'], dojutsu: false, beats: [] },
    { name: 'Kamui', shout: 'Kamui', beats: [] },
  ],
  hinata: [
    { name: 'Gentle Step: Twin Lion Fists', shout: 'Twin Lion Fists', on: ['shell'], beats: [{ name: 'dash', shout: true }] },
    { name: 'Gentle Fist', shout: 'Gentle Fist', on: ['edit'], beats: [] },
    { name: 'Eight Trigrams Sixty-Four Palms Protection', shout: '64 Palms Guard', beats: [{ name: 'palms', shout: true }] },
  ],
  lee: [
    { name: 'Leaf Hurricane', shout: 'Leaf Hurricane', on: ['shell'], dojutsu: false, beats: [] },
    { name: 'Primary Lotus', shout: 'Primary Lotus', dojutsu: false, beats: [{ name: 'wrap', shout: true }] },
    { name: 'Eight Inner Gates', shout: 'Eight Gates', on: ['edit'], dojutsu: false, beats: [{ name: 'open', shout: true }] },
  ],
  neji: [
    { name: 'Eight Trigrams Palm Rotation', shout: 'Palm Rotation', on: ['shell'], beats: [{ name: 'spin', shout: true }] },
    { name: 'Eight Trigrams Sixty-Four Palms', shout: 'Eight Trigrams', on: ['edit'], beats: [{ name: 'hit', shout: 'Two Palms' }, { name: 'hit2', shout: 'Four Palms' }, { name: 'hit3', shout: 'Eight Palms' }, { name: 'hit4', shout: 'Sixteen Palms' }, { name: 'hit5', shout: 'Thirty-Two Palms' }, { name: 'hit6', shout: 'Sixty-Four Palms' }, { name: 'finish', shout: 'Sixty-Four Palms' }] },
    { name: 'Eight Trigrams Vacuum Palm', shout: 'Vacuum Palm', beats: [{ name: 'release', shout: true }] },
  ],
  shikamaru: [
    { name: 'Shadow Possession Jutsu', shout: 'Shadow Possession', on: ['shell'], dojutsu: false, beats: [{ name: 'bind', shout: true }] },
    { name: 'Shadow Neck Bind Jutsu', shout: 'Neck Bind', dojutsu: false, beats: [] },
    { name: 'Shadow-Sewing Technique', shout: 'Shadow Sewing', on: ['edit'], dojutsu: false, beats: [] },
  ],
  gaara: [
    { name: 'Sand Coffin', shout: 'Sand Coffin', on: ['shell'], dojutsu: false, beats: [{ name: 'coffin', shout: true }, { name: 'crush', shout: 'Sand Burial' }, { name: 'impact', shout: 'Sand Burial' }] },
    { name: 'Sand Shield', shout: 'Sand Shield', dojutsu: false, beats: [{ name: 'rise', shout: true }] },
    { name: 'Sand Shuriken', shout: 'Sand Shuriken', on: ['edit'], dojutsu: false, beats: [] },
  ],
  itachi: [
    { name: 'Tsukuyomi', shout: 'Tsukuyomi', on: ['shell'], beats: [{ name: 'stare', shout: true }] },
    { name: 'Crow Clone Jutsu', shout: 'Crow Clone', on: ['agent'], beats: [] },
    { name: 'Amaterasu', shout: 'Amaterasu', beats: [] },
  ],
  jiraiya: [
    { name: 'Giant Rasengan', shout: 'Giant Rasengan', on: ['shell'], dojutsu: true, beats: [{ name: 'dash', shout: true }] },
    { name: 'Summoning Jutsu: Gamabunta', shout: 'Summon: Gamabunta', on: ['agent'], dojutsu: false, beats: [{ name: 'slam', shout: true }] },
    { name: 'Needle Jizō', shout: 'Needle Jizo', dojutsu: false, beats: [] },
  ],
  tsunade: [
    { name: 'Heavenly Foot of Pain', shout: 'Heavenly Foot', on: ['shell'], dojutsu: false, beats: [] },
    { name: 'Strength of a Hundred Seal', shout: 'Strength of a Hundred', on: ['edit'], dojutsu: false, beats: [] },
    { name: 'Summoning Jutsu: Katsuyu', shout: 'Summon: Katsuyu', on: ['agent'], dojutsu: false, beats: [{ name: 'slam', shout: true }] },
  ],
  orochimaru: [
    { name: 'Striking Shadow Snakes', shout: 'Shadow Snakes', on: ['shell'], dojutsu: false, beats: [] },
    { name: 'Summoning Jutsu: Manda', shout: 'Summon: Manda', on: ['agent'], dojutsu: false, beats: [] },
    { name: 'Kusanagi', shout: 'Kusanagi', on: ['edit'], dojutsu: false, beats: [] },
  ],
  minato: [
    { name: 'Flying Thunder God', shout: 'Flying Thunder God', on: ['shell'], dojutsu: false, beats: [] },
    { name: 'Rasengan', shout: 'Rasengan', dojutsu: false, beats: [] },
    { name: 'Three-Pronged Kunai', shout: 'Three-Prong Kunai', on: ['edit'], dojutsu: false, beats: [{ name: 'seal', shout: true }] },
  ],
  guy: [
    { name: 'Dynamic Entry', shout: 'Dynamic Entry', on: ['edit'], dojutsu: false, beats: [] },
    { name: 'Morning Peacock', shout: 'Morning Peacock', on: ['shell'], dojutsu: false, beats: [] },
    { name: 'Eighth Gate: Night Guy', shout: 'Night Guy', dojutsu: false, beats: [] },
  ],
  madara: [
    { name: 'Fire Style: Great Fire Annihilation', shout: 'Fire Annihilation', on: ['shell'], beats: [] },
    { name: 'Susanoo', shout: 'Susanoo', beats: [] },
    { name: 'Tengai Shinsei', shout: 'Tengai Shinsei', on: ['agent'], beats: [{ name: 'second', shout: 'Second meteor' }] },
  ],
  obito: [
    { name: 'Kamui', shout: 'Kamui', on: ['shell'], beats: [{ name: 'focus', shout: true }] },
    { name: 'Summoning Jutsu: Nine-Tails', shout: 'Summon: Nine-Tails', on: ['agent'], dojutsu: true, beats: [{ name: 'slam', shout: true }] },
    { name: 'Wood Style: Cutting Technique', shout: 'Wood Style', on: ['edit'], beats: [] },
  ],
  pain: [
    { name: 'Shinra Tensei', shout: 'Shinra Tensei', on: ['shell'], beats: [] },
    { name: 'Bansho Ten\'in', shout: 'Bansho Ten\'in', on: ['edit'], beats: [] },
    { name: 'Chibaku Tensei', shout: 'Chibaku Tensei', beats: [{ name: 'launch', shout: true }] },
  ],
  deidara: [
    { name: 'C1', shout: 'Katsu', on: ['shell'], dojutsu: false, beats: [{ name: 'katsu', shout: true }] },
    { name: 'Clay Spiders', shout: 'Clay Spiders', on: ['edit'], dojutsu: false, beats: [] },
    { name: 'C2 Dragon', shout: 'C2 Dragon', dojutsu: false, beats: [{ name: 'appear', shout: true }] },
  ],
  kisame: [
    { name: 'Water Style: Shark Bullet', shout: 'Shark Bullet', on: ['shell'], dojutsu: false, beats: [{ name: 'release', shout: true }] },
    { name: 'Samehada', shout: 'Samehada', on: ['edit'], dojutsu: false, beats: [{ name: 'leap', shout: true }] },
    { name: 'Water Prison Shark Dance', shout: 'Shark Dance', dojutsu: false, beats: [] },
  ],
}
