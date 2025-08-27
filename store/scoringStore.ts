// store/scoringStore.ts - Optimized for performance
import { create } from 'zustand';

export interface DetailedScoreData {
  // Wonder
  wonderDirectPoints?: number;
  wonderShowDetails?: boolean;
  wonderStagesBuilt?: boolean[];
  wonderEdificeStage?: { completed: boolean; edificeType?: 'I' | 'II' | 'III' };
  
  // Treasure
  treasureDirectPoints?: number;
  treasureShowDetails?: boolean;
  treasureTotalCoins?: number;
  treasurePermanentDebt?: number;
  treasureCardDebt?: number;
  treasureTaxDebt?: number;
  treasurePiracyDebt?: number;
  treasureCommercialDebt?: number;
  
  // Military
  militaryDirectPoints?: number;
  militaryShowDetails?: boolean;
  militaryTotalStrength?: number;
  militaryStrengthPerAge?: [number, number, number];
  militaryPlayedDove?: boolean;
  militaryDoveAges?: [boolean, boolean, boolean];
  militaryBoardingApplied?: number;
  militaryBoardingReceived?: number;
  militaryChainLinks?: number;
  
  // Science
  scienceDirectPoints?: number;
  scienceShowDetails?: boolean;
  scienceCompass?: number;
  scienceTablet?: number;
  scienceGear?: number;
  scienceNonCardCompass?: number;
  scienceNonCardTablet?: number;
  scienceNonCardGear?: number;
  
  // Blue Cards (Civilian)
  civilianDirectPoints?: number;
  civilianShowDetails?: boolean;
  civilianShipPosition?: number;
  civilianChainLinks?: number;
  civilianTotalCards?: number;
  
  // Yellow Cards (Commercial)
  commercialDirectPoints?: number;
  commercialShowDetails?: boolean;
  commercialShipPosition?: number;
  commercialChainLinks?: number;
  commercialTotalCards?: number;
  commercialPointCards?: number;
  
  // Green Cards
  greenShipPosition?: number;
  
  // Purple Cards (Guilds)
  guildsDirectPoints?: number;
  guildsShowDetails?: boolean;
  guildsCardsPlayed?: string[];
  
  // Black Cards (Cities)
  blackDirectPoints?: number;
  blackShowDetails?: boolean;
  blackTotalCards?: number;
  blackPointCards?: number;
  blackNeighborPositive?: number;
  blackNeighborNegative?: number;
  blackPeaceDoves?: number;
  citiesDirectPoints?: number;
  citiesShowDetails?: boolean;
  
  // Leaders
  leadersDirectPoints?: number;
  leadersShowDetails?: boolean;
  leadersPlayed?: string[];
  leadersAvailable?: string[];
  
  // Navy (Armada)
  navyDirectPoints?: number;
  navyShowDetails?: boolean;
  navyTotalStrength?: number;
  navyPlayedBlueDove?: boolean;
  navyDoveAges?: [boolean, boolean, boolean];
  
  // Islands (Armada)
  islandDirectPoints?: number;
  islandShowDetails?: boolean;
  islandCards?: string[];
  
  // Armada overall
  armadaDirectPoints?: number;
  armadaShowDetails?: boolean;
  
  // Edifice
  edificeDirectPoints?: number;
  edificeShowDetails?: boolean;
  edificeRewards?: number;
  edificePenalties?: number;
  edificeProjectsContributed?: string[];
  
  // Resources
  resourcesDirectPoints?: number;
  resourcesShowDetails?: boolean;
  resourcesBrownCards?: number;
  resourcesGreyCards?: number;
  discardRetrievals?: {
    age1: number;
    age2: number;
    age3: number;
    source: string;
  };
  
  // Shipyard positions (if Armada)
  shipyardPositions?: {
    blue: number;
    yellow: number;
    green: number;
    red: number;
  };
}

interface Player {
  id: string;
  name: string;
}

interface ScoringState {
  playerScores: Record<string, DetailedScoreData>;
  isInitialized: boolean;
  initializeScores: (players: Player[], wonders: any) => void;
  updateScore: (playerId: string, field: string, value: any) => void;
  updateMultipleScores: (playerId: string, updates: Partial<DetailedScoreData>) => void;
  getPlayerScore: (playerId: string) => DetailedScoreData | undefined;
  clearPlayer: (playerId: string) => void;
}

function createDefaultScore(): DetailedScoreData {
  return {
    wonderDirectPoints: 0,
    treasureDirectPoints: 0,
    militaryDirectPoints: 0,
    civilianDirectPoints: 0,
    commercialDirectPoints: 0,
    scienceDirectPoints: 0,
    guildsDirectPoints: 0,
    resourcesDirectPoints: 0,
    citiesDirectPoints: 0,
    leadersDirectPoints: 0,
    navyDirectPoints: 0,
    islandDirectPoints: 0,
    edificeDirectPoints: 0,
  };
}

export const useScoringStore = create<ScoringState>((set, get) => ({
  playerScores: {},
  isInitialized: false,
  initializeScores: (players, _wonders) => {
    const scores: Record<string, DetailedScoreData> = {};
    players.forEach(p => { if (p?.id) scores[p.id] = createDefaultScore(); });
    set({ playerScores: scores, isInitialized: true });
  },
  updateScore: (playerId, field, value) => {
    set(state => {
      const next = { ...state.playerScores };
      if (!next[playerId]) next[playerId] = createDefaultScore();
      next[playerId] = { ...next[playerId], [field]: value };
      return { playerScores: next };
    });
  },
  updateMultipleScores: (playerId, updates) => {
    set(state => {
      const next = { ...state.playerScores };
      if (!next[playerId]) next[playerId] = createDefaultScore();
      next[playerId] = { ...next[playerId], ...updates };
      return { playerScores: next };
    });
  },
  getPlayerScore: (playerId) => get().playerScores[playerId],
  clearPlayer: (playerId) => {
    set(state => {
      const next = { ...state.playerScores };
      delete next[playerId];
      return { playerScores: next };
    });
  },
}));