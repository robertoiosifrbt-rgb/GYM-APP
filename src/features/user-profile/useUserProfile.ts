import { usePersistedState } from '../../shared/usePersistedState'
import { DEFAULT_USER_PROFILE, type UserProfile, calculateLevel } from './types'

const STORAGE_KEY = 'gym-app:user-profile'

function recover(raw: unknown): UserProfile {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_USER_PROFILE

  const obj = raw as Record<string, unknown>
  const name = typeof obj.name === 'string' ? obj.name : DEFAULT_USER_PROFILE.name
  const totalXp = typeof obj.totalXp === 'number' ? Math.max(0, obj.totalXp) : 0

  const { level, xp, xpNeeded } = calculateLevel(totalXp)

  return { name, level, xp, xpNeeded }
}

export function useUserProfile() {
  const [profile, setProfile] = usePersistedState<UserProfile>(STORAGE_KEY, DEFAULT_USER_PROFILE, recover)

  function updateName(name: string) {
    setProfile((p) => ({ ...p, name }))
  }

  function addXp(amount: number) {
    const newTotal = profile.xp + profile.xpNeeded * (profile.level - 1) + amount
    const updated = recover({ name: profile.name, totalXp: newTotal })
    setProfile(updated)
  }

  return { profile, updateName, addXp }
}
