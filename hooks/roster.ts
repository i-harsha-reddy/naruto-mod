// The twenty ninja: who they are and their voice. How they look and move is
// their sprite: sprite/ninja/<id>.ts (head, eyes, outfit) and
// sprite/anims/<id>.ts (their jutsu).

import type { Pose } from './art/chibi.ts'
import type { Mood } from './art/portrait.ts'

// the side a ninja is listed under by /ninja list, and whose errands the spinner runs
export type Group = 'Hidden Leaf' | 'Akatsuki' | 'Elsewhere'

export type Ninja = {
  id: string
  name: string
  short: string
  // what fans call them too, for /ninja: "tobi", "pervy sage"
  aliases?: readonly string[]
  // a nickname that steps in as someone else, with words of its own: Tobi
  voices?: Readonly<Record<string, { name: string; quote: string }>>
  // the side they fight on
  group: Group
  // read after the name: "Kakashi Hatake, the Copy Ninja"
  title: string
  quote: string
  // eyes that wake while Claude reads: the Sharingan, Byakugan or Rinnegan
  dojutsu?: true
  // reads with the dojutsu covered (Kakashi, his headband down over the
  // Sharingan, nose in his book): it wakes for the jutsu only
  readsCovered?: true
  // the colour their jutsu and aura glow in
  glow: number
  // spinner lines in the ninja's voice, and past-tense words for the turn footer
  lines: readonly string[]
  past: readonly string[]
  // how they greet you and take a win: a hello, an answered turn, a nudge
  cheer: { pose: Pose; mood: Mood }
  // never sleeps (Gaara): left alone, arms folded and eyes open, no z
  insomniac?: true
}

// the cheers: a smirk with crossed arms, a thumbs-up (and each of the rest their own)
const SMUG = { pose: 'crossed', mood: 'smug' } as const
const THUMBS = { pose: 'thumbs', mood: 'happy' } as const

export const NINJA: readonly Ninja[] = [
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    short: 'Naruto',
    aliases: ['seventh hokage', 'kurama', 'nine tails', 'kyuubi', 'dobe'],
    group: 'Hidden Leaf',
    title: 'the Number One Hyperactive Knucklehead Ninja',
    quote: 'Believe it! I never go back on my word!',
    glow: 0x6ac8ff,
    lines: ['Believe it', 'Making shadow clones', 'Sending out shadow clones', 'Meditating in Sage Mode', 'Eating ramen at Ichiraku', 'Never giving up, dattebayo', 'Reporting to the Hokage', 'Training with Pervy Sage'],
    past: ['Trained', 'Believed it', 'Spun a Rasengan'],
    cheer: THUMBS,
  },
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    short: 'Sasuke',
    aliases: ['teme'],
    group: 'Hidden Leaf',
    title: 'the Last of the Uchiha',
    quote: "I'm an avenger.",
    dojutsu: true,
    glow: 0x9ad0ff,
    lines: ['Seeing through it with the Sharingan', 'Walking the path of an avenger', 'Hn', 'Weaving lightning'],
    past: ['Brooded', 'Trained', 'Sharpened a Chidori'],
    cheer: SMUG,
  },
  {
    id: 'sakura',
    name: 'Sakura Haruno',
    short: 'Sakura',
    aliases: ['forehead'],
    group: 'Hidden Leaf',
    title: 'the Medical Ninja of Team 7',
    quote: 'Shannaro!',
    glow: 0xff80c0,
    lines: ['Healing with medical ninjutsu', 'Shannaro', 'Studying with Lady Tsunade', 'Controlling chakra perfectly'],
    past: ['Healed', 'Studied', 'Molded chakra'],
    cheer: THUMBS,
  },
  {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    short: 'Kakashi',
    aliases: ['kakashi sensei', 'sixth hokage'],
    group: 'Hidden Leaf',
    title: 'the Copy Ninja',
    quote: 'Those who abandon their friends are worse than scum.',
    dojutsu: true,
    readsCovered: true,
    glow: 0xcfe8ff,
    // his favourite book stays unnamed for a shared screen; the orange book he holds is the wink
    lines: ['Reading his favourite book', 'Lost on the road of life', 'Copying the jutsu', 'Running a little late'],
    past: ['Read a chapter', 'Copied', 'Ran late'],
    // the eye-smile
    cheer: { pose: 'scratch', mood: 'happy' },
  },
  {
    id: 'hinata',
    name: 'Hinata Hyuga',
    short: 'Hinata',
    group: 'Hidden Leaf',
    title: 'the Byakugan Princess',
    quote: "I won't go back on my word. That's my nindo too!",
    dojutsu: true,
    glow: 0x8ab0ff,
    lines: ['Activating the Byakugan', 'Watching Naruto from afar', 'Pressing chakra points', 'Never giving up'],
    past: ['Watched', 'Trained', 'Scanned with the Byakugan'],
    // a shy poke of the fingers
    cheer: { pose: 'poke', mood: 'happy' },
  },
  {
    id: 'lee',
    name: 'Rock Lee',
    short: 'Rock Lee',
    aliases: ['bushy brows'],
    group: 'Hidden Leaf',
    title: 'the Handsome Devil of the Leaf',
    quote: 'A dropout can beat a genius through hard work!',
    glow: 0x7aff9a,
    lines: ['Running 500 laps around Konoha', 'Burning with the springtime of youth', 'Training until I drop', 'Opening the first gate'],
    past: ['Trained', 'Ran laps', 'Did push-ups'],
    cheer: THUMBS,
  },
  {
    id: 'neji',
    name: 'Neji Hyuga',
    short: 'Neji',
    group: 'Hidden Leaf',
    title: 'the Hyuga Prodigy',
    quote: 'You are within the range of my divination.',
    dojutsu: true,
    glow: 0xa8c8ff,
    lines: ['Seeing through fate', 'Within the range of divination', 'Defying destiny', 'Spinning Kaiten'],
    past: ['Divined', 'Meditated', 'Trained'],
    cheer: SMUG,
  },
  {
    id: 'shikamaru',
    name: 'Shikamaru Nara',
    short: 'Shikamaru',
    group: 'Hidden Leaf',
    title: 'the Strategist of the Leaf',
    quote: 'What a drag...',
    glow: 0x8a8aaa,
    lines: ['What a drag', 'Watching the clouds', 'Planning two hundred moves ahead', 'Playing shogi with Asuma'],
    past: ['Strategized', 'Watched clouds', 'Played shogi'],
    cheer: { pose: 'scratch', mood: 'calm' },
  },
  {
    id: 'gaara',
    name: 'Gaara',
    short: 'Gaara',
    aliases: ['shukaku', 'one tail'],
    group: 'Elsewhere',
    title: 'the Fifth Kazekage',
    quote: 'I will protect my village.',
    glow: 0xe0b878,
    lines: ['Gathering sand', 'Protecting the Sand Village', 'Raising the sand shield', 'Listening to the desert'],
    past: ['Gathered sand', 'Stood guard', 'Kept watch'],
    // arms folded, unmoved
    cheer: { pose: 'crossed', mood: 'calm' },
    // the One-Tail kept him awake his whole childhood
    insomniac: true,
  },
  {
    id: 'itachi',
    name: 'Itachi Uchiha',
    short: 'Itachi',
    group: 'Akatsuki',
    title: 'the Prodigy of the Uchiha',
    quote: 'Forgive me, Sasuke. There will be no next time.',
    dojutsu: true,
    glow: 0xff7a2a,
    lines: ['Casting Tsukuyomi', 'Poking Sasuke’s forehead', 'Seeing through the genjutsu', 'Scattering into crows'],
    past: ['Cast a genjutsu', 'Contemplated', 'Watched over Sasuke'],
    // a calm two fingers raised at his face (unlike the hand signs he weaves
    // while Claude works, so his cheer is seen)
    cheer: { pose: 'raise', mood: 'calm' },
  },
  {
    id: 'jiraiya',
    name: 'Jiraiya',
    short: 'Jiraiya',
    aliases: ['pervy sage', 'ero sennin', 'erosennin'],
    group: 'Hidden Leaf',
    title: 'the Toad Sage',
    quote: 'A ninja is one who endures.',
    glow: 0x6ac8ff,
    lines: ['Doing some research', 'Writing his next novel', 'Meditating in Sage Mode', 'Summoning the toads', 'Sending a messenger toad'],
    past: ['Researched', 'Wrote', 'Gathered nature energy'],
    cheer: THUMBS,
  },
  {
    id: 'tsunade',
    name: 'Tsunade',
    short: 'Tsunade',
    aliases: ['granny tsunade', 'lady tsunade', 'legendary sucker', 'baa chan'],
    group: 'Hidden Leaf',
    title: 'the Fifth Hokage',
    quote: 'Your dream is my dream too.',
    glow: 0xb080ff,
    lines: ['Losing at the gambling tables', 'Signing Hokage paperwork', 'Releasing the Strength of a Hundred', 'Healing the wounded'],
    past: ['Gambled', 'Signed paperwork', 'Healed'],
    cheer: THUMBS,
  },
  {
    id: 'orochimaru',
    name: 'Orochimaru',
    short: 'Orochimaru',
    group: 'Elsewhere',
    title: 'the Snake Sannin',
    quote: 'All the jutsu in the world will be mine.',
    glow: 0xb070e0,
    lines: ['Kukuku', 'Researching forbidden jutsu', 'Seeking immortality', 'Shedding a skin', 'Experimenting in the lab, kukuku'],
    past: ['Experimented', 'Researched', 'Plotted'],
    cheer: SMUG,
  },
  {
    id: 'minato',
    name: 'Minato Namikaze',
    short: 'Minato',
    aliases: ['fourth hokage', 'yondaime'],
    group: 'Hidden Leaf',
    title: 'the Yellow Flash of the Leaf',
    quote: 'I believe in you, Naruto.',
    glow: 0xffe060,
    lines: ['Marking kunai with seals', 'Flashing across the battlefield', 'Teaching the Rasengan', 'Protecting the Leaf'],
    past: ['Marked kunai', 'Wrote seals', 'Kept watch'],
    cheer: THUMBS,
  },
  {
    id: 'guy',
    name: 'Might Guy',
    short: 'Might Guy',
    aliases: ['gai', 'might gai', 'maito gai', 'guy sensei', 'gai sensei'],
    group: 'Hidden Leaf',
    title: 'Konoha’s Sublime Green Beast',
    quote: 'Youth is all about hard work and guts!',
    glow: 0xff3a3a,
    lines: ['Blazing with the power of youth', 'Challenging my eternal rival', 'Doing 1,000 push-ups', 'Opening the Eight Gates'],
    past: ['Trained youthfully', 'Did handstand laps', 'Burned with youth'],
    cheer: THUMBS,
  },
  {
    id: 'madara',
    name: 'Madara Uchiha',
    short: 'Madara',
    group: 'Elsewhere',
    title: 'the Ghost of the Uchiha',
    quote: 'Wake up to reality.',
    dojutsu: true,
    glow: 0xff7a2a,
    lines: ['Waking up to reality', 'Casting the Infinite Tsukuyomi', 'Taking on all five Kage', 'Looking for Hashirama'],
    past: ['Schemed', 'Waited', 'Dreamed'],
    cheer: SMUG,
  },
  {
    id: 'obito',
    name: 'Obito Uchiha',
    short: 'Obito',
    aliases: ['tobi'],
    voices: { tobi: { name: 'Tobi', quote: 'Tobi is a good boy!' } },
    group: 'Akatsuki',
    title: 'the Masked Man',
    quote: "I'm no one. I don't want to be anyone.",
    dojutsu: true,
    glow: 0x8a7aaa,
    lines: ['Phasing through Kamui', 'Tobi is a good boy', 'Plotting the Moon’s Eye Plan', 'Wearing the mask'],
    past: ['Plotted', 'Hid in Kamui', 'Played Tobi'],
    // Tobi's wave
    cheer: { pose: 'raise', mood: 'happy' },
  },
  {
    id: 'pain',
    name: 'Pain',
    short: 'Pain',
    aliases: ['nagato', 'yahiko', 'pein', 'rinnegan'],
    group: 'Akatsuki',
    title: 'the Leader of the Akatsuki',
    quote: 'Feel pain, contemplate pain, accept pain, know pain.',
    dojutsu: true,
    glow: 0xc0b0f0,
    lines: ['Teaching the world pain', 'Contemplating pain', 'Pulling with Bansho Ten’in', 'Looking down from the rain tower'],
    past: ['Contemplated', 'Meditated in the rain', 'Watched from the tower'],
    // arms spread over the rain
    cheer: { pose: 'spread', mood: 'calm' },
  },
  {
    id: 'deidara',
    name: 'Deidara',
    short: 'Deidara',
    aliases: ['senpai'],
    group: 'Akatsuki',
    title: 'the Mad Bomber of the Stone',
    quote: 'Art is an explosion!',
    glow: 0xf8e8b0,
    lines: ['Molding explosive clay, un', 'Sculpting fleeting art', 'Art is an explosion, un', 'Arguing art with Sasori, un'],
    past: ['Made art', 'Molded clay', 'Sculpted'],
    cheer: { pose: 'raise', mood: 'happy' },
  },
  {
    id: 'kisame',
    name: 'Kisame Hoshigaki',
    short: 'Kisame',
    aliases: ['samehada'],
    group: 'Akatsuki',
    title: 'the Monster of the Hidden Mist',
    quote: "Samehada doesn't cut. It shaves!",
    glow: 0x4a9ae8,
    lines: ['Feeding Samehada', 'Shaving off chakra', 'Making a water prison', 'Grinning like a shark'],
    past: ['Fed Samehada', 'Swam', 'Hunted'],
    cheer: { pose: 'raise', mood: 'smug' },
  },
]

export const byId = (id: string): Ninja => NINJA.find(n => n.id === id) ?? NINJA[0]!

// A name as typed, for matching: lower case, letters and single spaces, with
// "lord" or "lady" before it and an honorific after it ("-kun", " sensei",
// "sama") dropped, unless that is all there is ("senpai"), and a long vowel
// spelled short ("kyuubi" is "kyubi")
const HONORIFIC = /^(.*[a-z]) ?(?:kun|chan|san|sama|sensei|senpai|dono)$/
const norm = (s: string): string => {
  const q = s
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:lord|lady) (?=[a-z])/, '')
    .replace(/uu/g, 'u')
  const bare = HONORIFIC.exec(q)?.[1]?.trim()
  return bare && bare.length >= 2 ? bare : q
}
// the same with no spaces, so "ero sennin", "erosennin" and "nine-tails" meet
const compact = (s: string): string => norm(s).replace(/ /g, '')

// Fuzzy lookup for `/ninja <name>`: id, short or full name, a nickname, any
// word of the full name, the start of a nickname, then (`loose`) a part of a
// name or title ("hokage")
export const findNinja = (query: string, loose = true): Ninja | undefined => {
  const q = norm(query)
  const c = compact(query)
  if (q === '') return undefined
  return (
    NINJA.find(n => n.id === q) ??
    NINJA.find(n => n.short.toLowerCase() === q || n.name.toLowerCase() === q) ??
    NINJA.find(n => n.aliases?.some(a => compact(a) === c)) ??
    NINJA.find(n => n.name.toLowerCase().split(' ').some(w => w.startsWith(q))) ??
    (c.length >= 4 ? NINJA.find(n => n.aliases?.some(a => compact(a).startsWith(c))) : undefined) ??
    (loose && q.length >= 3 && !/^(the|of|of the)$/.test(q) ? NINJA.find(n => n.name.toLowerCase().includes(q) || n.title.toLowerCase().includes(q)) : undefined)
  )
}

// who steps in for `query`: the ninja, or the one a nickname of theirs plays (Tobi)
export const voiceOf = (n: Ninja, query: string): { name: string; quote: string } => {
  const c = compact(query)
  for (const [alias, voice] of Object.entries(n.voices ?? {})) if (compact(alias) === c) return voice
  return { name: n.name, quote: n.quote }
}

// the edit distance between two words: letters added, dropped or changed, or
// two side by side swapped ("lsit" is one off "list")
export const distance = (a: string, b: string): number => {
  let before: number[] = []
  let row = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(row[j]! + 1, next[j - 1]! + 1, row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) next[j] = Math.min(next[j]!, before[j - 2]! + 1)
    }
    before = row
    row = next
  }
  return row[b.length]!
}

// How far off a slip of `q` may be: one letter up to five letters, two up to
// eight, three beyond; and two or more off, it must still start right.
const slip = (q: string, word: string): number | null => {
  const d = distance(q, word)
  const most = q.length <= 5 ? 1 : q.length <= 8 ? 2 : 3
  return d > most || (d >= 2 && word[0] !== q[0]) ? null : d
}

// The nearest of `words` (each with a cost added: a surname or a nickname is
// a little further than a first name) to a slip of `query`, a tie going to
// the word that starts as it does; undefined if none is near enough.
const nearest = <T>(query: string, words: readonly (readonly [string, T, number])[]): T | undefined => {
  const q = compact(query)
  if (q === '') return undefined
  let best: T | undefined
  let cost = Infinity
  let first = false
  for (const [word, value, extra] of words) {
    const d = slip(q, word)
    if (d === null) continue
    const starts = word[0] === q[0]
    if (d + extra < cost || (d + extra === cost && starts && !first)) {
      best = value
      cost = d + extra
      first = starts
    }
  }
  return best
}

// the ninja whose name (or nickname) is nearest a name nobody has, for "Did
// you mean...?", unless none is near enough to be a slip
export const nearestNinja = (query: string): Ninja | undefined =>
  nearest(
    query,
    NINJA.flatMap(n => {
      const [given = n.id, ...family] = norm(n.name).split(' ')
      return [
        ...[n.id, compact(n.short), given].map(w => [w, n, 0] as const),
        ...[...family, ...(n.aliases ?? []).map(compact)].map(w => [w, n, 0.5] as const),
      ]
    }),
  )

// the nearest of some plain words (the subcommands), by the same rules
export const nearestWord = (query: string, words: readonly string[]): string | undefined => nearest(query, words.map(w => [w, w, 0] as const))

// Ninja not on the roster (yet), each with a word in the series' own spirit
// and someone related who is: /ninja hashirama
const NOT_YET: readonly { names: readonly string[]; text: string }[] = [
  { names: ['hashirama', 'hashirama senju', 'first hokage', 'shodaime'], text: "Hashirama isn't here (yet). Madara is still looking for him: /ninja madara" },
  { names: ['tobirama', 'tobirama senju', 'second hokage', 'nidaime'], text: "Tobirama isn't here (yet). Minato mastered his jutsu: /ninja minato" },
  { names: ['hiruzen', 'hiruzen sarutobi', 'third hokage', 'sandaime'], text: "Hiruzen isn't here (yet). His student carries his will: /ninja jiraiya" },
  { names: ['sai'], text: "Sai isn't here (yet); he's reading up on friendship. Team 7: /ninja naruto" },
  { names: ['yamato', 'tenzo', 'tenzou'], text: "Yamato isn't here (yet). His senpai is, running late: /ninja kakashi" },
  { names: ['kabuto', 'kabuto yakushi'], text: "Kabuto isn't here (yet). Lord Orochimaru is, kukuku: /ninja orochimaru" },
  { names: ['konan'], text: "Konan isn't here (yet). She never strays far from Pain: /ninja pain" },
  { names: ['sasori'], text: "Sasori isn't here (yet). His partner is, un: /ninja deidara" },
  { names: ['hidan'], text: "Hidan isn't here (yet); his prayers run long. His leader: /ninja pain" },
  { names: ['kakuzu'], text: "Kakuzu isn't here (yet); he's off counting bounties. Try /ninja kisame" },
  { names: ['zabuza', 'zabuza momochi'], text: "Zabuza isn't here (yet). Another Swordsman of the Mist is: /ninja kisame" },
  { names: ['haku'], text: "Haku isn't here (yet). Naruto still remembers him: /ninja naruto" },
  { names: ['temari'], text: "Temari isn't here (yet). Her little brother is: /ninja gaara" },
  { names: ['kankuro', 'kankurou'], text: "Kankuro isn't here (yet). His little brother is: /ninja gaara" },
  { names: ['choji', 'chouji', 'choji akimichi'], text: "Choji isn't here (yet); barbecue comes first. His friend: /ninja shikamaru" },
  { names: ['ino', 'ino yamanaka'], text: "Ino isn't here (yet). Her rival in everything is: /ninja sakura" },
  { names: ['kiba', 'kiba inuzuka', 'akamaru'], text: "Kiba isn't here (yet). Akamaru says woof. Their teammate: /ninja hinata" },
  { names: ['shino', 'shino aburame'], text: "Shino isn't here (yet), and he'd like to know why. Teammate: /ninja hinata" },
  { names: ['tenten'], text: "Tenten isn't here (yet). Her teammates are: /ninja lee or /ninja neji" },
  { names: ['iruka', 'iruka umino'], text: "Iruka isn't here (yet); he's buying ramen. His best student: /ninja naruto" },
  { names: ['konohamaru'], text: "Konohamaru isn't here (yet). His Boss is: /ninja naruto" },
  { names: ['boruto', 'boruto uzumaki'], text: "Boruto isn't here (yet). His dad is: /ninja naruto" },
  { names: ['sarada', 'sarada uchiha'], text: "Sarada isn't here (yet). Her parents are: /ninja sasuke or /ninja sakura" },
  { names: ['himawari', 'himawari uzumaki'], text: "Himawari isn't here (yet). Her parents are: /ninja naruto or /ninja hinata" },
  { names: ['mitsuki'], text: "Mitsuki isn't here (yet). His parent is, kukuku: /ninja orochimaru" },
  { names: ['shisui', 'shisui uchiha'], text: "Shisui isn't here (yet). His best friend is: /ninja itachi" },
  { names: ['kushina', 'kushina uzumaki'], text: "Kushina isn't here (yet), dattebane!\nHer husband and son are: /ninja minato or /ninja naruto" },
  { names: ['asuma', 'asuma sarutobi'], text: "Asuma isn't here (yet). His student carries his blades: /ninja shikamaru" },
  { names: ['kurenai', 'kurenai yuhi'], text: "Kurenai isn't here (yet). Her student is: /ninja hinata" },
  { names: ['killer bee', 'bee', 'killerbee'], text: "Killer Bee isn't here (yet), fool ya fool! His student is: /ninja naruto" },
  { names: ['zetsu'], text: "Zetsu isn't here (yet), but he's probably watching. Try /ninja obito" },
  { names: ['kaguya', 'kaguya otsutsuki'], text: "Kaguya isn't here (yet). Madara thought he'd be the one: /ninja madara" },
  // (a sensei, for anyone who calls theirs just that)
  { names: ['sensei'], text: 'Which sensei? Kakashi, Jiraiya and Might Guy are all here: /ninja kakashi' },
]

// what /ninja says of someone not on the roster yet, if `query` names one
export const notYet = (query: string): string | undefined => {
  const c = compact(query)
  return c === '' ? undefined : NOT_YET.find(e => e.names.some(name => compact(name) === c))?.text
}
