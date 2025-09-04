// store/scoringStore.ts - Enhanced with bug fixes and detailed mode support
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Draft } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { resolveMilitaryConflictsForAll, resolveNavalConflictsForAll } from '../data/conflicts';

export type ScoringMode = 'direct' | 'detailed';

export type CategoryKey =
  | 'wonder'
  | 'treasury'
  | 'military'
  | 'civil'
  | 'commercial'
  | 'science'
  | 'guild'
  | 'cities'
  | 'leaders'
  | 'navy'
  | 'islands'
  | 'edifice';

// Detailed data types for each category
export interface WonderDetails {
  stagesCompleted: boolean[];
  stagePoints: number[];
}

export interface TreasuryDetails {
  coins: number;
  debtFromCards: number;
  debtFromTax: number;
  debtFromPiracy: number;
  commercialPotTaxes: number;
}

export interface MilitaryDetails {
  ageIStrength: number;
  ageIIStrength: number;
  ageIIIStrength: number;
  doveDiplomacyAges: number[];
  boardingTokensApplied: { age: number; count: number }[];
  boardingTokensReceived: { age: number; count: number }[];
  redCardsCount: number;
  chainLinksUsed: number;
  armadaShipPosition?: number;
}

export interface CivilDetails {
  blueCardsCount: number;
  directPointsFromCards: number;
  chainLinksUsed: number;
  armadaShipPosition?: number;
  cardsWithArmadaShips?: number;
}

export interface CommercialDetails {
  yellowCardsCount: number;
  chainLinksUsed: number;
  armadaShipPosition?: number;
  cardsWithArmadaShips?: number;
  citiesCardsCount?: number;
  pointCards: string[];
}

export interface ScienceDetails {
  compasses: number;
  tablets: number;
  gears: number;
  bonusSymbols: { type: 'compass' | 'tablet' | 'gear'; source: string }[];
  greenCardsCount: number;
  chainLinksUsed: number;
  armadaShipPosition?: number;
}

export interface GuildDetails {
  guildsPlayed: string[];
  totalPoints: number;
}

export interface CitiesDetails {
  blackCardsCount: number;
  directPointCards: number;
  affectingNeighbors: { positive: number; negative: number };
  cardsPlayed: string[];
}

export interface LeadersDetails {
  leadersPlayed: string[];
  totalPoints: number;
}

export interface NavyDetails {
  ageIStrength: number;
  ageIIStrength: number;
  ageIIIStrength: number;
  armadaShipPosition: number;
  cardsContributing: number;
  blueDoveDiplomacyAges: number[];
}

export interface IslandDetails {
  islandCards: { stage1: number; stage2: number; stage3: number };
  directPoints: number;
  greenShipPosition: number;
  islandsOwned: string[];
}

export interface EdificeDetails {
  completedProjects: string[];
  incompleteProjects: string[];
  contributedProjects: { project: string; wonderStage: number }[];
  rewards: number;
  penalties: number;
}

export interface CategoryScore {
  directPoints: number | null;
  detailedData: Record<string, any>;
  isDetailed: boolean;
  calculatedPoints?: number;
}

export interface PlayerScore {
  playerId: string;
  categories: Record<CategoryKey, CategoryScore>;
  total: number;
  lastUpdated: Date;
  isComplete: boolean;
}

interface GameMetadata {
  gameId: string;
  gameNumber: number; // Same for all players in this game
  startTime: Date;
  endTime?: Date;
  playerCount: number;
  expansions: {
    leaders: boolean;
    cities: boolean;
    armada: boolean;
    edifice: boolean;
  };
}

interface ScoringState {
  // Core data
  gameMetadata: GameMetadata | null;
  playerScores: Record<string, PlayerScore>;
  currentPlayerId: string | null;

  // UI state
  isLoading: boolean;
  autoSave: boolean;
  gameCounter: number; // Track total games played

  // Actions
  initializeScoring: (playerIds: string[], expansions: any) => void;
  setCurrentPlayer: (playerId: string) => void;
  updateCategoryScore: (
    playerId: string,
    category: CategoryKey,
    points: number | null,
    isDetailed?: boolean
  ) => void;
    updateDetailedData: (
      playerId: string,
      category: CategoryKey,
      data: Record<string, any>
    ) => void;
  calculateCategoryPoints: (playerId: string, category: CategoryKey) => number;
  batchUpdateScores: (
    updates: Array<{ playerId: string; category: CategoryKey; points: number }>
  ) => void;
  calculateTotal: (playerId: string) => number;
  resetCategory: (playerId: string, category: CategoryKey) => void;
  completeScoring: () => void;

  // Computed getters
  getPlayerScore: (playerId: string) => PlayerScore | undefined;
  getAllTotals: () => Record<string, number>;
  isGameComplete: () => boolean;
  getCompletionProgress: () => number;
  getLeaderboard: () => Array<{ playerId: string; total: number; rank: number }>;
  getCategoryBreakdown: (playerId: string) => Record<CategoryKey, number>;
}

// ---- Helpers ---------------------------------------------------------------

const CATEGORY_KEYS = [
  'wonder',
  'treasury',
  'military',
  'civil',
  'commercial',
  'science',
  'guild',
  'cities',
  'leaders',
  'navy',
  'islands',
  'edifice',
] as const satisfies readonly CategoryKey[];

/**
 * Calculate points for Science category based on detailed data
 */
const calculateSciencePoints = (details: ScienceDetails): number => {
  const totalCompasses = details.compasses + details.bonusSymbols.filter(s => s.type === 'compass').length;
  const totalTablets = details.tablets + details.bonusSymbols.filter(s => s.type === 'tablet').length;
  const totalGears = details.gears + details.bonusSymbols.filter(s => s.type === 'gear').length;
  
  const sets = Math.min(totalCompasses, totalTablets, totalGears);
  
  return (totalCompasses * totalCompasses) + 
         (totalTablets * totalTablets) + 
         (totalGears * totalGears) + 
         (sets * 7);
};

/**
 * Calculate points for Treasury based on detailed data
 */
const calculateTreasuryPoints = (details: TreasuryDetails): number => {
  const totalDebt = details.debtFromCards + details.debtFromTax + 
                    details.debtFromPiracy + details.commercialPotTaxes;
  const netCoins = Math.max(0, details.coins - totalDebt);
  return Math.floor(netCoins / 3);
};

/**
 * Safe total calculator that works with both plain and Draft records
 */
type CategoryMap = Record<CategoryKey, CategoryScore>;
const computeTotal = (categories: CategoryMap | Draft<CategoryMap>): number => {
  let total = 0;
  for (const key of CATEGORY_KEYS) {
    const cat = categories[key];
    const pts = (cat?.directPoints ?? cat?.calculatedPoints ?? 0);
    total += pts;
  }
  return total;
};

// Initial category state factory
const createCategoryScore = (): CategoryScore => ({
  directPoints: null,
  detailedData: {},
  isDetailed: false,
  calculatedPoints: undefined,
});

// Create initial player score
const createPlayerScore = (playerId: string): PlayerScore => ({
  playerId,
  categories: {
    wonder: createCategoryScore(),
    treasury: createCategoryScore(),
    military: createCategoryScore(),
    civil: createCategoryScore(),
    commercial: createCategoryScore(),
    science: createCategoryScore(),
    guild: createCategoryScore(),
    cities: createCategoryScore(),
    leaders: createCategoryScore(),
    navy: createCategoryScore(),
    islands: createCategoryScore(),
    edifice: createCategoryScore(),
  },
  total: 0,
  lastUpdated: new Date(),
  isComplete: false,
});

// ---- Store -----------------------------------------------------------------

export const useScoringStore = create<ScoringState>()(
  immer((set, get) => ({
    // Initial state
    gameMetadata: null,
    playerScores: {},
    currentPlayerId: null,
    isLoading: false,
    autoSave: true,
    gameCounter: 0,

    // Initialize scoring for all players
    initializeScoring: (playerIds: string[], expansions: any) => {
      set((state) => {
        // Increment game counter
        state.gameCounter += 1;
        void AsyncStorage.setItem('gameCounter', state.gameCounter.toString());
        
        // Clear previous scores and create fresh ones for each player
        state.playerScores = {};
        playerIds.forEach((playerId) => {
          state.playerScores[playerId] = createPlayerScore(playerId);
        });

        state.currentPlayerId = playerIds[0] || null;

        // All players share the same game metadata
        state.gameMetadata = {
          gameId: `game_${Date.now()}`,
          gameNumber: state.gameCounter, // Same game number for all players
          startTime: new Date(),
          playerCount: playerIds.length,
          expansions: {
            leaders: expansions?.leaders || false,
            cities: expansions?.cities || false,
            armada: expansions?.armada || false,
            edifice: expansions?.edifice || false,
          },
        };

        state.isLoading = false;
      });
    },

    // Set current player
    setCurrentPlayer: (playerId: string) => {
      set((state) => {
        if (state.playerScores[playerId]) {
          state.currentPlayerId = playerId;
        }
      });
    },

    // Update single category score
    updateCategoryScore: (playerId, category, points, isDetailed = false) => {
      set((state) => {
        const playerScore = state.playerScores[playerId];
        if (!playerScore) return;

        playerScore.categories[category].directPoints = points;
        playerScore.categories[category].isDetailed = isDetailed;

        // Recalculate total
        playerScore.total = computeTotal(playerScore.categories);
        playerScore.lastUpdated = new Date();
      });
    },

    // Update detailed data for a category
    updateDetailedData: (playerId, category, data) => {
      set((state) => {
        const playerScore = state.playerScores[playerId];
        if (!playerScore) return;

        playerScore.categories[category].detailedData = data;
        playerScore.categories[category].isDetailed = true;
        
        // Calculate points based on detailed data
        let calculatedPoints = 0;
        
        if (category === 'science' && data) {
          calculatedPoints = calculateSciencePoints(data as ScienceDetails);
        } else if (category === 'treasury' && data) {
          calculatedPoints = calculateTreasuryPoints(data as TreasuryDetails);
        }
        // For categories requiring multi-player resolution, recompute globally below
        playerScore.categories[category].calculatedPoints = calculatedPoints;

        // Recompute conflicts if military/navy detailed data changed
        const recalcConflicts = category === 'military' || category === 'navy';
        if (recalcConflicts) {
          try {
            // Obtain seating order from setup store to determine adjacency
            const setup = require('./setupStore');
            const orderedPlayers: Array<{ id: string; name: string }> = setup.useSetupStore.getState().getOrderedPlayers();
            const order = orderedPlayers.map((p: any) => p.id);

            // Military
            {
              const byPlayer: Record<string, any> = {};
              for (const pid of order) {
                byPlayer[pid] = state.playerScores[pid]?.categories?.military?.detailedData || {};
              }
              const totals = resolveMilitaryConflictsForAll(order, byPlayer);
              for (const pid of order) {
                const pts = totals[pid]?.total ?? 0;
                if (state.playerScores[pid]) {
                  state.playerScores[pid].categories.military.isDetailed = true;
                  state.playerScores[pid].categories.military.calculatedPoints = pts;
                }
              }
            }

            // Navy (only if Armada is active)
            if (state.gameMetadata?.expansions?.armada) {
              const byPlayer: Record<string, any> = {};
              for (const pid of order) {
                byPlayer[pid] = state.playerScores[pid]?.categories?.navy?.detailedData || {};
              }
              const totals = resolveNavalConflictsForAll(order, byPlayer);
              for (const pid of order) {
                const pts = totals[pid]?.total ?? 0;
                if (state.playerScores[pid]) {
                  state.playerScores[pid].categories.navy.isDetailed = true;
                  state.playerScores[pid].categories.navy.calculatedPoints = pts;
                }
              }
            }
          } catch (e) {
            console.warn('Recompute conflicts failed:', e);
          }
          // Recompute totals for all players after conflicts refresh
          for (const pid of Object.keys(state.playerScores)) {
            const ps = state.playerScores[pid];
            ps.total = computeTotal(ps.categories);
            ps.lastUpdated = new Date();
          }
        }

        // Recalculate total for this player (and others below if needed)
        playerScore.total = computeTotal(playerScore.categories);
        playerScore.lastUpdated = new Date();
      });
    },

    // Calculate points for a specific category
    calculateCategoryPoints: (playerId: string, category: CategoryKey) => {
      const playerScore = get().playerScores[playerId];
      if (!playerScore) return 0;
      
      const cat = playerScore.categories[category];
      return cat.directPoints ?? cat.calculatedPoints ?? 0;
    },

    // Batch update scores for performance
    batchUpdateScores: (updates) => {
      set((state) => {
        updates.forEach(({ playerId, category, points }) => {
          const playerScore = state.playerScores[playerId];
          if (!playerScore) return;
          playerScore.categories[category].directPoints = points;
        });

        // Recalculate all totals
        for (const playerId in state.playerScores) {
          const ps = state.playerScores[playerId];
          ps.total = computeTotal(ps.categories);
          ps.lastUpdated = new Date();
        }
      });
    },

    // Calculate total for a player (read-only path)
    calculateTotal: (playerId: string) => {
      const playerScore = get().playerScores[playerId];
      if (!playerScore) return 0;
      return computeTotal(playerScore.categories);
    },

    // Reset a category
    resetCategory: (playerId, category) => {
      set((state) => {
        const playerScore = state.playerScores[playerId];
        if (!playerScore) return;

        playerScore.categories[category] = createCategoryScore();
        playerScore.total = computeTotal(playerScore.categories);
        playerScore.lastUpdated = new Date();
      });
    },

    // Complete scoring
    completeScoring: () => {
      set((state) => {
        if (state.gameMetadata) {
          state.gameMetadata.endTime = new Date();
        }
        for (const playerId in state.playerScores) {
          state.playerScores[playerId].isComplete = true;
        }
      });
    },

    // Get player score
    getPlayerScore: (playerId: string) => {
      return get().playerScores[playerId];
    },

    // Get all totals
    getAllTotals: () => {
      const scores = get().playerScores;
      const totals: Record<string, number> = {};
      for (const playerId in scores) {
        totals[playerId] = scores[playerId].total;
      }
      return totals;
    },

    // Check if game is complete
    isGameComplete: () => {
      const scores = get().playerScores;
      const metadata = get().gameMetadata;
      if (!metadata) return false;
      
      // Check if all enabled categories have scores for all players
      const enabledCategories = CATEGORY_KEYS.filter(cat => {
        if (cat === 'cities') return metadata.expansions.cities;
        if (cat === 'leaders') return metadata.expansions.leaders;
        if (cat === 'navy' || cat === 'islands') return metadata.expansions.armada;
        if (cat === 'edifice') return metadata.expansions.edifice;
        return true; // Base game categories
      });
      
      return Object.values(scores).every(score => 
        enabledCategories.every(cat => 
          score.categories[cat].directPoints !== null || 
          score.categories[cat].calculatedPoints !== undefined
        )
      );
    },

    // Get completion progress (0 to 1)
    getCompletionProgress: () => {
      const scores = get().playerScores;
      const metadata = get().gameMetadata;
      if (!metadata || Object.keys(scores).length === 0) return 0;
      
      const enabledCategories = CATEGORY_KEYS.filter(cat => {
        if (cat === 'cities') return metadata.expansions.cities;
        if (cat === 'leaders') return metadata.expansions.leaders;
        if (cat === 'navy' || cat === 'islands') return metadata.expansions.armada;
        if (cat === 'edifice') return metadata.expansions.edifice;
        return true;
      });
      
      const totalRequired = enabledCategories.length * Object.keys(scores).length;
      let completed = 0;
      
      Object.values(scores).forEach(score => {
        enabledCategories.forEach(cat => {
          if (score.categories[cat].directPoints !== null || 
              score.categories[cat].calculatedPoints !== undefined) {
            completed++;
          }
        });
      });
      
      return completed / totalRequired;
    },

    // Get leaderboard
    getLeaderboard: () => {
      const scores = get().playerScores;
      const leaderboard = Object.values(scores)
        .map((s) => ({ playerId: s.playerId, total: s.total, rank: 0 }))
        .sort((a, b) => b.total - a.total);

      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return leaderboard;
    },

    // Get category breakdown for a player
    getCategoryBreakdown: (playerId: string) => {
      const playerScore = get().playerScores[playerId];
      if (!playerScore) return {} as Record<CategoryKey, number>;
      
      const breakdown: Record<CategoryKey, number> = {} as any;
      CATEGORY_KEYS.forEach(cat => {
        breakdown[cat] = playerScore.categories[cat].directPoints ?? 
                        playerScore.categories[cat].calculatedPoints ?? 0;
      });
      
      return breakdown;
    },
  }))
);
