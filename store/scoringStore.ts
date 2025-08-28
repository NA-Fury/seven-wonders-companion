// store/scoringStore.ts
import type { Draft } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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
  gameNumber?: number;
  isComplete: boolean;
}

interface GameMetadata {
  gameId: string;
  startTime: Date;
  endTime?: Date;
  playerCount: number;
  expansions: {
    leaders: boolean;
    cities: boolean;
    armada: boolean; // corresponds to 'navy' category
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

  // Actions
  initializeScoring: (playerIds: string[]) => void;
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
  getLeaderboard: () => Array<{ playerId: string; total: number; rank: number }>;
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
 * Safe total calculator that works with both plain and Draft records.
 * Avoids Object.values (which becomes unknown[] under Draft) to keep types happy.
 */
type CategoryMap = Record<CategoryKey, CategoryScore>;
const computeTotal = (categories: CategoryMap | Draft<CategoryMap>): number => {
  let total = 0;
  for (const key of CATEGORY_KEYS) {
    const cat = categories[key]; // CategoryScore | Draft<CategoryScore>
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
const createPlayerScore = (playerId: string, gameNumber?: number): PlayerScore => ({
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
  gameNumber,
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

    // Initialize scoring for all players
    initializeScoring: (playerIds: string[]) => {
      set((state) => {
        state.playerScores = {};
        playerIds.forEach((playerId, index) => {
          state.playerScores[playerId] = createPlayerScore(playerId, index + 1);
        });

        state.currentPlayerId = playerIds[0] || null;

        state.gameMetadata = {
          gameId: `game_${Date.now()}`,
          startTime: new Date(),
          playerCount: playerIds.length,
          expansions: {
            leaders: false,
            cities: false,
            armada: false,
            edifice: false,
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

        // Recalculate total without Object.values
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
        playerScore.lastUpdated = new Date();
      });
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
      return Object.values(scores).every((s) => s.isComplete);
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
  }))
);
