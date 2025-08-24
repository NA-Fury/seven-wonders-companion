import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { ExpansionFlags, GameSetup, PlayerSeat } from './types'

const DEFAULT_EXPANSIONS: ExpansionFlags = {
  leaders: false,
  cities: false,
  armada: false,
  edifice: false,
}

export type SetupState = {
  setup: GameSetup
  setExpansions: (f: Partial<ExpansionFlags>) => void
  setScoringMode: (m: GameSetup['scoringMode']) => void
  setPlayers: (players: PlayerSeat[]) => void
  upsertPlayer: (p: PlayerSeat) => void
  setSeatingOrder: (order: number[]) => void
  setEdificeProjects: (ids: string[]) => void
  hydrate: () => Promise<void>
  persist: () => Promise<void>
  reset: () => void
}

const emptySetup = (): GameSetup => ({
  expansions: { ...DEFAULT_EXPANSIONS },
  players: [],
  numPlayers: 0,
  seatingOrder: [],
  edificeProjects: [],
  scoringMode: 'FinalOnly',
})

export const useSetupStore = create<SetupState>((set, get) => ({
  setup: emptySetup(),
  setExpansions: (f) => set(s => ({ setup: { ...s.setup, expansions: { ...s.setup.expansions, ...f }}})),
  setScoringMode: (m) => set(s => ({ setup: { ...s.setup, scoringMode: m }})),
  setPlayers: (players) => set(s => ({ setup: { ...s.setup, players, numPlayers: players.length }})),
  upsertPlayer: (p) => set(s => {
    const exists = s.setup.players.findIndex(pp => pp.seat === p.seat)
    const players = [...s.setup.players]
    if (exists >= 0) players[exists] = p
    else players.push(p)
    return { setup: { ...s.setup, players, numPlayers: players.length }}
  }),
  setSeatingOrder: (seatingOrder) => set(s => ({ setup: { ...s.setup, seatingOrder }})),
  setEdificeProjects: (ids) => set(s => ({ setup: { ...s.setup, edificeProjects: ids }})),
  hydrate: async () => {
    const raw = await AsyncStorage.getItem('setup')
    if (raw) set({ setup: JSON.parse(raw) as GameSetup })
  },
  persist: async () => {
    const { setup } = get()
    await AsyncStorage.setItem('setup', JSON.stringify(setup))
  },
  reset: () => set({ setup: emptySetup() }),
}))