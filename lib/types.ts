export type ExpansionFlags = {
  leaders: boolean
  cities: boolean
  armada: boolean
  edifice: boolean
}

export type WonderSide = 'Day' | 'Night' // A/B visuals later

export type PlayerProfile = {
  id: string
  name: string
  avatarUrl?: string
  notes?: string
  // future: style tags, favorite wonders/colors
}

export type PlayerSeat = {
  seat: number
  displayName: string
  profileId?: string
  wonderId?: string
  wonderSide?: WonderSide
  armadaShipyard?: string // if armada on
}

export type GameSetup = {
  expansions: ExpansionFlags
  players: PlayerSeat[]
  numPlayers: number
  seatingOrder: number[] // array of seat indices in table order
  edificeProjects?: string[]
  scoringMode: 'PerAge' | 'FinalOnly'
}