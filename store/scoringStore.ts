// store/scoringStore.ts
import { create } from 'zustand';

export interface DetailedScoreData {
  // Direct points (quick entry)
  wonderDirectPoints: number;
  treasureDirectPoints: number;
  militaryDirectPoints: number;
  civilianDirectPoints: number;
  commercialDirectPoints: number;
  scienceDirectPoints: number;
  guildsDirectPoints: number;
  citiesDirectPoints: number;
  leadersDirectPoints: number;
  navyDirectPoints: number;
  islandDirectPoints: number;
  edificeDirectPoints: number;
  resourcesDirectPoints: number;
  
  // Detail flags
  wonderShowDetails: boolean;
  treasureShowDetails: boolean;
  militaryShowDetails: boolean;
  civilianShowDetails: boolean;
  commercialShowDetails: boolean;
  scienceShowDetails: boolean;
  guildsShowDetails: boolean;
  citiesShowDetails: boolean;
  leadersShowDetails: boolean;
  navyShowDetails: boolean;
  islandShowDetails: boolean;
  edificeShowDetails: boolean;
  resourcesShowDetails: boolean;
  
  // Wonder details
  wonderStagesBuilt: boolean[];
  wonderEdificeStage?: { completed: boolean; edificeType?: 'I' | 'II' | 'III' };
  
  // Treasure details
  treasureTotalCoins: number;
  treasurePermanentDebt: number;
  treasureCardDebt: number;
  treasureTaxDebt: number;
  treasurePiracyDebt: number;
  treasureCommercialDebt: number;
  
  // Military details
  militaryTotalStrength: number;
  militaryStrengthPerAge: [number, number, number];
  militaryPlayedDove: boolean;
  militaryDoveAges: [boolean, boolean, boolean];
  militaryBoardingApplied: number;
  militaryBoardingReceived: number;
  militaryChainLinks: number;
  
  // Science details
  scienceCompass: number;
  scienceTablet: number;
  scienceGear: number;
  scienceNonCardCompass: number;
  scienceNonCardTablet: number;
  scienceNonCardGear: number;
  
  // Civilian details
  civilianShipPosition: number;
  civilianChainLinks: number;
  civilianTotalCards: number;
  
  // Commercial details
  commercialShipPosition: number;
  commercialChainLinks: number;
  commercialTotalCards: number;
  commercialPointCards: number;
  
  // Green ship position
  greenShipPosition: number;
  
  // Guild details
  guildsCardsPlayed: string[];
  
  // Cities expansion
  blackTotalCards: number;
  blackPointCards: number;
  blackNeighborPositive: number;
  blackNeighborNegative: number;
  blackPeaceDoves: number;
  
  // Leaders expansion
  leadersPlayed: string[];
  leadersAvailable: string[]; // NEW: Track available leaders
  
  // Navy (Armada)
  navyTotalStrength: number;
  navyPlayedBlueDove: boolean;
  navyDoveAges: [boolean, boolean, boolean];
  
  // Islands (Armada)
  islandCards: string[];
  
  // Edifice
  edificeRewards: number;
  edificePenalties: number;
  edificeProjectsContributed: string[];
  
  // Resources - NEW detailed tracking
  resourcesBrownCards: number;
  resourcesGreyCards: number;
  
  // Shipyard positions - NEW comprehensive tracking
  shipyardPositions: {
    blue: number;
    yellow: number;
    green: number;
    red: number;
  };
  
  // Discard pile retrievals - NEW
  discardRetrievals: {
    age1: number;
    age2: number;
    age3: number;
    source: string; // e.g., "Halicarnassus", "Solomon", "Forging Agency"
  };
}

interface ScoringStore {
  playerScores: Record<string, DetailedScoreData>;
  calculationCache: Map<string, number>;
  
  // Actions
  initializeScores: (players: any[], wonders: any) => void;
  updateScore: (playerId: string, field: string, value: any) => void;
  updateMultipleScores: (playerId: string, updates: Partial<DetailedScoreData>) => void;
  getPlayerScore: (playerId: string) => DetailedScoreData | null;
  clearCache: (playerId?: string) => void;
  
  // Batch operations
  setLeadersAvailable: (playerId: string, leaders: string[]) => void;
  updateShipyardPositions: (playerId: string, positions: Partial<DetailedScoreData['shipyardPositions']>) => void;
  updateDiscardRetrievals: (playerId: string, retrievals: Partial<DetailedScoreData['discardRetrievals']>) => void;
}

const createDefaultScore = (maxStages: number = 0): DetailedScoreData => ({
  // Direct points
  wonderDirectPoints: 0,
  treasureDirectPoints: 0,
  militaryDirectPoints: 0,
  civilianDirectPoints: 0,
  commercialDirectPoints: 0,
  scienceDirectPoints: 0,
  guildsDirectPoints: 0,
  citiesDirectPoints: 0,
  leadersDirectPoints: 0,
  navyDirectPoints: 0,
  islandDirectPoints: 0,
  edificeDirectPoints: 0,
  resourcesDirectPoints: 0,
  
  // Detail flags
  wonderShowDetails: false,
  treasureShowDetails: false,
  militaryShowDetails: false,
  civilianShowDetails: false,
  commercialShowDetails: false,
  scienceShowDetails: false,
  guildsShowDetails: false,
  citiesShowDetails: false,
  leadersShowDetails: false,
  navyShowDetails: false,
  islandShowDetails: false,
  edificeShowDetails: false,
  resourcesShowDetails: false,
  
  // Wonder
  wonderStagesBuilt: new Array(maxStages).fill(false),
  wonderEdificeStage: { completed: false },
  
  // Treasure
  treasureTotalCoins: 0,
  treasurePermanentDebt: 0,
  treasureCardDebt: 0,
  treasureTaxDebt: 0,
  treasurePiracyDebt: 0,
  treasureCommercialDebt: 0,
  
  // Military
  militaryTotalStrength: 0,
  militaryStrengthPerAge: [0, 0, 0],
  militaryPlayedDove: false,
  militaryDoveAges: [false, false, false],
  militaryBoardingApplied: 0,
  militaryBoardingReceived: 0,
  militaryChainLinks: 0,
  
  // Science
  scienceCompass: 0,
  scienceTablet: 0,
  scienceGear: 0,
  scienceNonCardCompass: 0,
  scienceNonCardTablet: 0,
  scienceNonCardGear: 0,
  
  // Civilian
  civilianShipPosition: 0,
  civilianChainLinks: 0,
  civilianTotalCards: 0,
  
  // Commercial
  commercialShipPosition: 0,
  commercialChainLinks: 0,
  commercialTotalCards: 0,
  commercialPointCards: 0,
  
  // Green
  greenShipPosition: 0,
  
  // Guilds
  guildsCardsPlayed: [],
  
  // Cities
  blackTotalCards: 0,
  blackPointCards: 0,
  blackNeighborPositive: 0,
  blackNeighborNegative: 0,
  blackPeaceDoves: 0,
  
  // Leaders
  leadersPlayed: [],
  leadersAvailable: [],
  
  // Navy
  navyTotalStrength: 0,
  navyPlayedBlueDove: false,
  navyDoveAges: [false, false, false],
  
  // Islands
  islandCards: [],
  
  // Edifice
  edificeRewards: 0,
  edificePenalties: 0,
  edificeProjectsContributed: [],
  
  // Resources
  resourcesBrownCards: 0,
  resourcesGreyCards: 0,
  
  // Shipyard positions
  shipyardPositions: {
    blue: 0,
    yellow: 0,
    green: 0,
    red: 0,
  },
  
  // Discard retrievals
  discardRetrievals: {
    age1: 0,
    age2: 0,
    age3: 0,
    source: '',
  },
});

export const useScoringStore = create<ScoringStore>((set, get) => ({
  playerScores: {},
  calculationCache: new Map(),

  initializeScores: (players, wonders) => {
    const scores: Record<string, DetailedScoreData> = {};
    players.forEach((player: any) => {
      if (!player) return;
      const wonderAssignment = wonders[player.id];
      const maxStages = wonderAssignment?.maxStages || 3;
      scores[player.id] = createDefaultScore(maxStages);
    });
    set({ playerScores: scores, calculationCache: new Map() });
  },

  updateScore: (playerId, field, value) => {
    set(state => {
      const current = state.playerScores[playerId] || createDefaultScore();
      const updated = { ...current, [field]: value } as DetailedScoreData;
      const category = field.replace(/[A-Z].*/, '');
      const cacheKey = `${playerId}-${category}`;
      const newCache = new Map(state.calculationCache);
      newCache.delete(cacheKey);
      return {
        playerScores: { ...state.playerScores, [playerId]: updated },
        calculationCache: newCache,
      };
    });
  },

  updateMultipleScores: (playerId, updates) => {
    set(state => {
      const current = state.playerScores[playerId] || createDefaultScore();
      const updated = { ...current, ...updates };
      const newCache = new Map(state.calculationCache);
      newCache.forEach((_, key) => {
        if (key.startsWith(`${playerId}-`)) newCache.delete(key);
      });
      return {
        playerScores: { ...state.playerScores, [playerId]: updated },
        calculationCache: newCache,
      };
    });
  },

  getPlayerScore: (playerId) => get().playerScores[playerId] || null,

  clearCache: (playerId) => {
    set(state => {
      if (!playerId) {
        return { calculationCache: new Map() };
      }
      const newCache = new Map(state.calculationCache);
      newCache.forEach((_, key) => {
        if (key.startsWith(`${playerId}-`)) newCache.delete(key);
      });
      return { calculationCache: newCache };
    });
  },

  setLeadersAvailable: (playerId, leaders) => {
    set(state => {
      const current = state.playerScores[playerId] || createDefaultScore();
      const updated = { ...current, leadersAvailable: leaders };
      return { playerScores: { ...state.playerScores, [playerId]: updated } };
    });
  },

  updateShipyardPositions: (playerId, positions) => {
    set(state => {
      const current = state.playerScores[playerId] || createDefaultScore();
      const updated = {
        ...current,
        shipyardPositions: { ...current.shipyardPositions, ...positions },
      };
      return { playerScores: { ...state.playerScores, [playerId]: updated } };
    });
  },

  updateDiscardRetrievals: (playerId, retrievals) => {
    set(state => {
      const current = state.playerScores[playerId] || createDefaultScore();
      const updated = {
        ...current,
        discardRetrievals: { ...current.discardRetrievals, ...retrievals },
      };
      return { playerScores: { ...state.playerScores, [playerId]: updated } };
    });
  },
}));
