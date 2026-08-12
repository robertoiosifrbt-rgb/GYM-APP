/**
 * Turns what you typed into the exercise library into muscles the body map can
 * colour.
 *
 * The `primaryMuscles` / `secondaryMuscles` fields are free text — "Chest",
 * "Shoulders, Triceps", "lats" — so this maps words onto a fixed set of
 * muscles. Matching is per word, never by substring: "Hammer curl" must not
 * count towards hamstrings, and "abduction" must not count towards abs.
 */

export type MuscleId =
  | 'chest'
  | 'abs'
  | 'obliques'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'traps'
  | 'lats'
  | 'lowerBack'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'

export type BodyPart = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Core' | 'Legs'

/** Which silhouette a muscle is drawn on. */
export type BodyView = 'front' | 'back' | 'both'

interface MuscleInfo {
  label: string
  part: BodyPart
  view: BodyView
}

export const MUSCLES: Record<MuscleId, MuscleInfo> = {
  chest: { label: 'Chest', part: 'Chest', view: 'front' },
  abs: { label: 'Abs', part: 'Core', view: 'front' },
  obliques: { label: 'Obliques', part: 'Core', view: 'front' },
  shoulders: { label: 'Shoulders', part: 'Shoulders', view: 'both' },
  biceps: { label: 'Biceps', part: 'Arms', view: 'front' },
  triceps: { label: 'Triceps', part: 'Arms', view: 'back' },
  forearms: { label: 'Forearms', part: 'Arms', view: 'both' },
  traps: { label: 'Traps', part: 'Back', view: 'back' },
  lats: { label: 'Lats', part: 'Back', view: 'back' },
  lowerBack: { label: 'Lower back', part: 'Back', view: 'back' },
  glutes: { label: 'Glutes', part: 'Legs', view: 'back' },
  quads: { label: 'Quads', part: 'Legs', view: 'front' },
  hamstrings: { label: 'Hamstrings', part: 'Legs', view: 'back' },
  calves: { label: 'Calves', part: 'Legs', view: 'both' },
}

export const MUSCLE_IDS = Object.keys(MUSCLES) as MuscleId[]

export const BODY_PARTS: BodyPart[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs']

/**
 * Phrases checked before single words, so "lower back" is not read as "back".
 * Order matters: the first match wins and its words are consumed.
 */
const PHRASES: Array<[string, MuscleId[]]> = [
  ['lower back', ['lowerBack']],
  ['upper back', ['lats', 'traps']],
  ['lower body', ['quads', 'hamstrings', 'glutes', 'calves']],
  ['upper body', ['chest', 'lats', 'shoulders', 'biceps', 'triceps']],
  ['rear delt', ['shoulders']],
  ['front delt', ['shoulders']],
  ['side delt', ['shoulders']],
  ['full body', ['chest', 'lats', 'shoulders', 'quads', 'glutes', 'abs']],
]

/** One word → the muscles it names. Plurals are handled by the lookup, not here. */
const WORDS: Record<string, MuscleId[]> = {
  chest: ['chest'],
  pec: ['chest'],
  pectoral: ['chest'],

  ab: ['abs'],
  abdominal: ['abs'],
  core: ['abs', 'obliques'],
  oblique: ['obliques'],

  shoulder: ['shoulders'],
  delt: ['shoulders'],
  deltoid: ['shoulders'],

  bicep: ['biceps'],
  tricep: ['triceps'],
  forearm: ['forearms'],
  grip: ['forearms'],
  arm: ['biceps', 'triceps'],

  trap: ['traps'],
  trapezius: ['traps'],
  lat: ['lats'],
  latissimus: ['lats'],
  // Bare "back" is read as lats: in a gym context that is what people mean,
  // and both roll up to the same body part anyway.
  back: ['lats'],
  erector: ['lowerBack'],
  spinal: ['lowerBack'],

  glute: ['glutes'],
  quad: ['quads'],
  quadricep: ['quads'],
  hamstring: ['hamstrings'],
  calf: ['calves'],
  calves: ['calves'],
  leg: ['quads', 'hamstrings', 'calves'],
  thigh: ['quads', 'hamstrings'],
}

function lookupWord(word: string): MuscleId[] | undefined {
  if (WORDS[word]) return WORDS[word]
  // "chests" → "chest", "glutes" → "glute". Only a trailing s, which covers
  // every plural these words actually take.
  if (word.endsWith('s') && WORDS[word.slice(0, -1)]) return WORDS[word.slice(0, -1)]
  return undefined
}

/**
 * Every muscle named in a free-text field, without repeats.
 * Unrecognised words are ignored rather than guessed at.
 */
export function parseMuscles(text: string): MuscleId[] {
  const normalised = text.toLowerCase().replace(/[^a-z]+/g, ' ').trim()
  if (!normalised) return []

  const found = new Set<MuscleId>()
  let rest = ` ${normalised} `

  for (const [phrase, muscles] of PHRASES) {
    const needle = ` ${phrase} `
    while (rest.includes(needle)) {
      muscles.forEach((muscle) => found.add(muscle))
      rest = rest.replace(needle, ' ')
    }
  }

  for (const word of rest.trim().split(' ')) {
    lookupWord(word)?.forEach((muscle) => found.add(muscle))
  }

  return MUSCLE_IDS.filter((id) => found.has(id))
}

export function musclesByPart(part: BodyPart): MuscleId[] {
  return MUSCLE_IDS.filter((id) => MUSCLES[id].part === part)
}
