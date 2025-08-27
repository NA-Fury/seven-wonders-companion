// store/scoringStore.ts - Optimized for performance
import { create } from 'zustand';
import { WONDERS_DATABASE } from '../data/wondersDatabase';

export interface DetailedScoreData {
  // Wonder
  wonderDirectPoints: number;
  wonderShowDetails: boolean;
  wonderStagesBuilt: boolean[];
  wonderEdificeStage?: { completed: boolean; edificeType?: 'I' | 'II' | 'III' };
  
  // Treasure
  treasureDirectPoints: number;
  treasureShowDetails: boolean;
  treasureTotalCoins: number;
  treasurePermanentDebt: number;
  treasureCardDebt: number;
  treasureTaxDebt: number;
  treasurePiracyDebt: number;
  treasureCommercialDebt: number;
  
  // Military
  militaryDirectPoints: number;
  militaryShowDetails: boolean;
  militaryTotalStrength: number;
  militaryStrengthPerAge: [number, number, number];
  militaryPlayedDove: boolean;
  militaryDoveAges: [boolean, boolean, boolean];
  militaryBoardingApplied: number;
  militaryBoardingReceived: number;
  militaryChainLinks: number;
  
  // Science
  scienceDirectPoints: number;
  scienceShowDetails: boolean;
  scienceCompass: number;
  scienceTablet: number;
  scienceGear: number;
  scienceNonCardCompass: number;
  scienceNonCardTablet: number;
  scienceNonCardGear: number;
  
  // Blue Cards (Civilian)
  civilianDirectPoints: number;
  civilianShowDetails: boolean;
  civilianShipPosition?: number;
  civilianChainLinks: number;
  civilianTotalCards: number;
  
  // Yellow Cards (Commercial)
  commercialDirectPoints: number;
  commercialShowDetails: boolean;
  commercialShipPosition?: number;
  commercialChainLinks: number;
  commercialTotalCards: number;
  commercialPointCards: number;
  
  // Green Cards
  greenShipPosition?: number;
  
  // Purple Cards (Guilds)
  guildsDirectPoints: number;
  guildsShowDetails: boolean;
  guildsCardsPlayed: string[];
  
  // Black Cards (Cities)
  blackDirectPoints: number;
  blackShowDetails: boolean;
  blackTotalCards: number;
  blackPointCards: number;
  blackNeighborPositive: number;
  blackNeighborNegative: number;
  blackPeaceDoves: number;
  citiesDirectPoints: number;
  citiesShowDetails: boolean;
  
  // Leaders
  leadersDirectPoints: number;
  leadersShowDetails: boolean;
  leadersPlayed: string[];
  leadersAvailable?: string[];
  
  // Navy (Armada)
  navyDirectPoints: number;
  navyShowDetails: boolean;
  navyTotalStrength: number;
  navyPlayedBlueDove: boolean;
  navyDoveAges: [boolean, boolean, boolean];
  
  // Islands (Armada)
  islandDirectPoints: number;
  islandShowDetails: boolean;
  islandCards: string[];
  
  // Armada overall
  armadaDirectPoints: number;
  armadaShowDetails: boolean;
  
  // Edifice
  edificeDirectPoints: number;
  edificeShowDetails: boolean;
  edificeRewards: number;
  edificePenalties: number;
  edificeProjectsContributed: string[];
  
  // Resources
  resourcesDirectPoints: number;
  resourcesShowDetails: boolean;
  resourcesBrownCards: number;
  resourcesGreyCards: number;
  discardRetrievals?: {
    age1: number;
    age2: number;
    age3: number;
    source: string;
  };
  
  // Shipyard positions (if Armada)
  shipyardPositions: {
    blue: number;
    yellow: number;
    green: number;
    red: number;
  };
}

interface ScoringState {
  playerScores: Record<string, DetailedScoreData>;
  calculationCache: Map<string, number>;
  isInitialized: boolean;
  
  // Actions
  initializeScores: (players: any[], wonders: any) => void;
  updateScore: (playerId: string, field: string, value: any) => void;
  updateMultipleScores: (playerId: string, updates: Partial<DetailedScoreData>) => void;
  getPlayerScore: (playerId: string) => DetailedScoreData | undefined;
  clearCache: () => void;
}

const createDefaultScore = (maxStages: number = 0): DetailedScoreData => ({
  wonderDirectPoints: 0,
  wonderShowDetails: false,
  wonderStagesBuilt: new Array(maxStages).fill(false),
  wonderEdificeStage: { completed: false },
  treasureDirectPoints: 0,
  treasureShowDetails: false,
  treasureTotalCoins: 0,
  treasurePermanentDebt: 0,
  treasureCardDebt: 0,
  treasureTaxDebt: 0,
  treasurePiracyDebt: 0,
  treasureCommercialDebt: 0,
  militaryDirectPoints: 0,
  militaryShowDetails: false,
  militaryTotalStrength: 0,
  militaryStrengthPerAge: [0, 0, 0],
  militaryPlayedDove: false,
  militaryDoveAges: [false, false, false],
  militaryBoardingApplied: 0,
  militaryBoardingReceived: 0,
  militaryChainLinks: 0,
  scienceDirectPoints: 0,
  scienceShowDetails: false,
  scienceCompass: 0,
  scienceTablet: 0,
  scienceGear: 0,
  scienceNonCardCompass: 0,
  scienceNonCardTablet: 0,
  scienceNonCardGear: 0,
  civilianDirectPoints: 0,
  civilianShowDetails: false,
  civilianShipPosition: 0,
  civilianChainLinks: 0,
  civilianTotalCards: 0,
  commercialDirectPoints: 0,
  commercialShowDetails: false,
  commercialShipPosition: 0,
  commercialChainLinks: 0,
  commercialTotalCards: 0,
  commercialPointCards: 0,
  greenShipPosition: 0,
  guildsDirectPoints: 0,
  guildsShowDetails: false,
  guildsCardsPlayed: [],
  blackDirectPoints: 0,
  blackShowDetails: false,
  blackTotalCards: 0,
  blackPointCards: 0,
  blackNeighborPositive: 0,
  blackNeighborNegative: 0,
  blackPeaceDoves: 0,
  citiesDirectPoints: 0,
  citiesShowDetails: false,
  leadersDirectPoints: 0,
  leadersShowDetails: false,
  leadersPlayed: [],
  leadersAvailable: [],
  navyDirectPoints: 0,
  navyShowDetails: false,
  navyTotalStrength: 0,
  navyPlayedBlueDove: false,
  navyDoveAges: [false, false, false],
  islandDirectPoints: 0,
  islandShowDetails: false,
  islandCards: [],
  armadaDirectPoints: 0,
  armadaShowDetails: false,
  edificeDirectPoints: 0,
  edificeShowDetails: false,
  edificeRewards: 0,
  edificePenalties: 0,
  edificeProjectsContributed: [],
  resourcesDirectPoints: 0,
  resourcesShowDetails: false,
  resourcesBrownCards: 0,
  resourcesGreyCards: 0,
  discardRetrievals: {
    age1: 0,
    age2: 0,
    age3: 0,
    source: '',
  },
  shipyardPositions: {
    blue: 0,
    yellow: 0,
    green: 0,
    red: 0,
  },
});

export const useScoringStore = create<ScoringState>((set, get) => ({
  playerScores: {},
  calculationCache: new Map(),
  isInitialized: false,

  initializeScores: (players, wonders) => {
    const scores: Record<string, DetailedScoreData> = {};
    
    players.forEach((player: any) => {
      if (!player?.id) return;
      
      const wonderAssignment = wonders[player.id];
      const wonderData = wonderAssignment?.boardId
        ? WONDERS_DATABASE.find(w => w.id === wonderAssignment.boardId)
        : null;

      const side = wonderAssignment?.side || 'day';
      const maxStages = side === 'day'
        ? wonderData?.daySide?.stages?.length || 0
        : wonderData?.nightSide?.stages?.length || 0;

      scores[player.id] = createDefaultScore(maxStages);
    });

    set({ 
      playerScores: scores, 
      isInitialized: true,
      calculationCache: new Map() 
    });
  },

  updateScore: (playerId, field, value) => {
    set((state) => {
      const newScores = { ...state.playerScores };
      if (!newScores[playerId]) {
        newScores[playerId] = createDefaultScore();
      }
      newScores[playerId] = {
        ...newScores[playerId],
        [field]: value,
      };
      
      // Clear cache for this player
      const newCache = new Map(state.calculationCache);
      Array.from(newCache.keys()).forEach(key => {
        if (key.startsWith(playerId)) {
          newCache.delete(key);
        }
      });
      
      return { 
        playerScores: newScores,
        calculationCache: newCache 
      };
    });
  },

  updateMultipleScores: (playerId, updates) => {
    set((state) => {
      const newScores = { ...state.playerScores };
      if (!newScores[playerId]) {
        newScores[playerId] = createDefaultScore();
      }
      newScores[playerId] = {
        ...newScores[playerId],
        ...updates,
      };
      
      // Clear cache for this player
      const newCache = new Map(state.calculationCache);
      Array.from(newCache.keys()).forEach(key => {
        if (key.startsWith(playerId)) {
          newCache.delete(key);
        }
      });
      
      return { 
        playerScores: newScores,
        calculationCache: newCache 
      };
    });
  },

  getPlayerScore: (playerId) => {
    const state = get();
    return state.playerScores[playerId];
  },

  clearCache: () => {
    set({ calculationCache: new Map() });
  },
}));