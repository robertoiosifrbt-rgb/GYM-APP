export interface UserProfile {
  name: string
  level: number
  xp: number
  xpNeeded: number
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Roberto',
  level: 1,
  xp: 0,
  xpNeeded: 1000,
}

export function calculateLevel(totalXp: number): { level: number; xp: number; xpNeeded: number } {
  let level = 1
  let remaining = totalXp
  const baseXpPerLevel = 1000

  while (remaining >= baseXpPerLevel * level) {
    remaining -= baseXpPerLevel * level
    level++
  }

  return {
    level,
    xp: remaining,
    xpNeeded: baseXpPerLevel * level,
  }
}
