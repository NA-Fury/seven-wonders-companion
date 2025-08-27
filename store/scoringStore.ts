// store/scoringStore.ts - Optimized with persistent storage support
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { useStoreWithEqualityFn } from 'zustand/traditional'; // add this import

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
  
  // Resources (Analysis only - no points)
  resourcesDirectPoints?: number; // Always 0, kept for consistency
  resourcesShowDetails?: boolean;
  resourcesBrownCards?: number;
  resourcesGreyCards?: number;
  
  // Bonus Analysis
  bonusShowDetails?: boolean;
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
  lastUpdate: number;
  gameId: string | null;
  
  // Actions
  initializeScores: (players: Player[], wonders: any) => void;
  updateScore: (playerId: string, field: string, value: any) => void;
  updateMultipleScores: (playerId: string, updates: Partial<DetailedScoreData>) => void;
  getPlayerScore: (playerId: string) => DetailedScoreData | undefined;
  clearPlayer: (playerId: string) => void;
  resetAllScores: () => void;
  saveGame: () => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
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
    resourcesBrownCards: 0,
    resourcesGreyCards: 0,
    discardRetrievals: {
      age1: 0,
      age2: 0,
      age3: 0,
      source: '',
    },
  };
}

// Create the store with persistence
export const useScoringStore = create<ScoringState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        playerScores: {},
        isInitialized: false,
        lastUpdate: Date.now(),
        gameId: null,
        
        initializeScores: (players, _wonders) => {
          const scores: Record<string, DetailedScoreData> = {};
          players.forEach(p => { 
            if (p?.id) scores[p.id] = createDefaultScore(); 
          });
          set({ 
            playerScores: scores, 
            isInitialized: true,
            lastUpdate: Date.now(),
          });
        },
        
        updateScore: (playerId, field, value) => {
          const state = get();
          const next = { ...state.playerScores };
          if (!next[playerId]) next[playerId] = createDefaultScore();
          next[playerId] = { ...next[playerId], [field]: value };
          set({ 
            playerScores: next,
            lastUpdate: Date.now(),
          });
        },
        
        updateMultipleScores: (playerId, updates) => {
          const state = get();
          const next = { ...state.playerScores };
          if (!next[playerId]) next[playerId] = createDefaultScore();
          next[playerId] = { ...next[playerId], ...updates };
          set({ 
            playerScores: next,
            lastUpdate: Date.now(),
          });
        },
        
        getPlayerScore: (playerId) => get().playerScores[playerId],
        
        clearPlayer: (playerId) => {
          const state = get();
          const next = { ...state.playerScores };
          delete next[playerId];
          set({ 
            playerScores: next,
            lastUpdate: Date.now(),
          });
        },
        
        resetAllScores: () => {
          set({ 
            playerScores: {}, 
            isInitialized: false,
            lastUpdate: Date.now(),
            gameId: null,
          });
        },
        
        saveGame: async () => {
          const state = get();
          const gameId = `game-${Date.now()}`;
          try {
            await AsyncStorage.setItem(
              `@7wonders-game-${gameId}`,
              JSON.stringify({
                playerScores: state.playerScores,
                timestamp: Date.now(),
              })
            );
            set({ gameId });
          } catch (e) {
            console.error('Failed to save game:', e);
          }
        },
        
        loadGame: async (gameId: string) => {
          try {
            const saved = await AsyncStorage.getItem(`@7wonders-game-${gameId}`);
            if (saved) {
              const data = JSON.parse(saved);
              set({ 
                playerScores: data.playerScores,
                isInitialized: true,
                lastUpdate: Date.now(),
                gameId,
              });
            }
          } catch (e) {
            console.error('Failed to load game:', e);
          }
        },
      }),
      {
        name: '7wonders-scoring-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          playerScores: state.playerScores,
          gameId: state.gameId,
        }),
      }
    )
  )
);

// Performance optimization: memoized selector
const deepEqual = (
  a: DetailedScoreData | undefined,
  b: DetailedScoreData | undefined
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  // Cheap deep compare (OK for modest object size)
  return JSON.stringify(a) === JSON.stringify(b);
};

export const usePlayerScore = (playerId: string) =>
  useStoreWithEqualityFn(
    useScoringStore,
    state => state.playerScores[playerId],
    deepEqual
  );

// Batch updates for better performance
export const batchUpdateScores = (updates: Array<{ playerId: string; field: string; value: any }>) => {
  const { updateScore } = useScoringStore.getState();
  updates.forEach(({ playerId, field, value }) => {
    updateScore(playerId, field, value);
  });
};