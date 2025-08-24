import AsyncStorage from '@react-native-async-storage/async-storage'
import { PlayerProfile } from './types'

const KEY = 'players.v1'

export async function listPlayers(): Promise<PlayerProfile[]> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

export async function savePlayers(players: PlayerProfile[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(players))
}

export async function upsertPlayer(profile: PlayerProfile) {
  const all = await listPlayers()
  const i = all.findIndex(p => p.id === profile.id)
  if (i >= 0) all[i] = profile
  else all.push(profile)
  await savePlayers(all)
}