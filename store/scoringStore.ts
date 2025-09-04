// store/scoringStore.ts - Enhanced with bug fixes and detailed mode support
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Draft } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { resolveMilitaryConflictsForAll, resolveNavalConflictsForAll } from '../data/conflicts';
import { computeGuildsForAll } from '../data/guildsResolver';
import { computeLeadersForAll } from '../data/leadersResolver';

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
  // Optional fixed bonuses by type (leaders, wonders, etc.)
  fixedBonuses?: { compass?: number; tablet?: number; gear?: number };
  // Legacy array support (we will count by type when present)
  bonusSymbols?: { type: 'compass' | 'tablet' | 'gear'; source?: string }[];
  // Wild tokens that can be assigned to any symbol at end of game (Scientists Guild, Babylon/Carthage stage, Golden Archipelago, neighbor-copy, etc.)
  choiceTokens?: number;
  // Tokens that add +1 to your most common symbol (Armada cards, Emerald Archipelago)
  mostCommonPlusTokens?: number;
  // Replace one existing symbol with any symbol (Aganice)
  replaceOneToken?: number; // 0 or 1 typically
  // Cities: copy neighbors' science symbol(s) at end of game (treated as choice tokens here)
  neighborCopies?: number;
  // Detailed breakdown inputs for better UI guidance (optional)
  greenCardsCount?: number;
  greenAddedCompass?: number;
  greenAddedGear?: number;
  greenAddedTablet?: number;
  otherAddedCompass?: number;
  otherAddedGear?: number;
  otherAddedTablet?: number;
  // Misc tracking (optional, not used in calc directly)
  chainLinksUsed?: number;
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
  // Per-player analysis helpers data (e.g., resource card counts)
  analysisByPlayer: Record<string, { brownCards?: number; greyCards?: number; [k: string]: any }>;

  // UI state
  isLoading: boolean;
  autoSave: boolean;
  gameCounter: number; // Track total games played

  // Actions
  initializeScoring: (playerIds: string[], expansions: any) => void;
  setCurrentPlayer: (playerId: string) => void;
  updateAnalysisData: (playerId: string, data: Record<string, any>) => void;
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
 * Calculate points for Science with advanced modifiers.
 */
const calculateSciencePoints = (details: ScienceDetails): number => {
  const bonusArray = Array.isArray(details.bonusSymbols) ? details.bonusSymbols : [];
  const countFromBonusArray = (type: 'compass' | 'tablet' | 'gear') =>
    bonusArray.filter((s) => s.type === type).length;

  // Base counts
  let a = (details.compasses || 0) + (details.fixedBonuses?.compass || 0) + countFromBonusArray('compass');
  let b = (details.tablets || 0) + (details.fixedBonuses?.tablet || 0) + countFromBonusArray('tablet');
  let c = (details.gears || 0) + (details.fixedBonuses?.gear || 0) + countFromBonusArray('gear');

  // Apply additional contributions if provided
  a += (details.greenAddedCompass || 0) + (details.otherAddedCompass || 0);
  b += (details.greenAddedTablet || 0) + (details.otherAddedTablet || 0);
  c += (details.greenAddedGear || 0) + (details.otherAddedGear || 0);

  // Choice tokens (wilds), include neighbor copies as wilds too
  let wild = (details.choiceTokens || 0) + (details.neighborCopies || 0);

  // Greedy: assign wilds to raise the lowest counts first (maximize sets)
  while (wild > 0) {
    // Find the lowest among a,b,c; if tie, any is fine
    if (a <= b && a <= c) a++;
    else if (b <= a && b <= c) b++;
    else c++;
    wild--;
  }

  // Most-common-plus tokens: each adds 1 to the current highest symbol (ties allowed among highs)
  let mcp = details.mostCommonPlusTokens || 0;
  while (mcp > 0) {
    // Identify current max; if ties, choose arbitrarily one of the max buckets
    if (a >= b && a >= c) a++;
    else if (b >= a && b >= c) b++;
    else c++;
    mcp--;
  }

  // Optionally apply one replace-one move if it improves score (Aganice)
  const score = (x: number, y: number, z: number) => x * x + y * y + z * z + 7 * Math.min(x, y, z);
  const baseScore = score(a, b, c);
  if ((details.replaceOneToken || 0) > 0) {
    let best = baseScore;
    const vals = [a, b, c];
    for (let from = 0; from < 3; from++) {
      if (vals[from] <= 0) continue;
      for (let to = 0; to < 3; to++) {
        if (to === from) continue;
        const next = [...vals] as number[];
        next[from] -= 1;
        next[to] += 1;
        const cand = score(next[0], next[1], next[2]);
        if (cand > best) best = cand;
      }
    }
    return best;
  }

  return baseScore;
};

/**
 * Calculate points for Treasury based on detailed data
 * VP = floor(coins / 3) - (sum of all debts/taxes)
 */
const calculateTreasuryPoints = (details: TreasuryDetails): number => {
  const coins = Math.max(0, details.coins);
  const totalDebt = (details.debtFromCards || 0) + (details.debtFromTax || 0) +
                    (details.debtFromPiracy || 0) + (details.commercialPotTaxes || 0);
  return Math.floor(coins / 3) - totalDebt;
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
    analysisByPlayer: {},

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

    // Update analysis helper data for a player
    updateAnalysisData: (playerId, data) => {
      set((state) => {
        const prev = state.analysisByPlayer[playerId] || {};
        state.analysisByPlayer[playerId] = { ...prev, ...data };

        // Recompute guilds after analysis data update (affects neighbors' VP)
        try {
          const setup = require('./setupStore');
          const orderedPlayers: Array<{ id: string; name: string }> = setup.useSetupStore.getState().getOrderedPlayers();
          const order = orderedPlayers.map((p: any) => p.id);

          const getSnapshot = (pid: string) => {
            const ps = state.playerScores[pid];
            const dd = (cat: CategoryKey) => ps?.categories?.[cat]?.detailedData || {};
            const wonderStages = (() => {
              const w = dd('wonder');
              return Object.keys(w).filter(k => k.startsWith('stage') && w[k]).length;
            })();
            const leadersCount = (() => {
              const l = dd('leaders');
              const arr: string[] = Array.isArray(l.selectedLeaders) ? l.selectedLeaders : [];
              return arr.length;
            })();
            const purpleCount = (() => {
              const g = dd('guild');
              if (typeof (g as any).purpleCardsCount === 'number') return (g as any).purpleCardsCount as number;
              const arr: string[] = Array.isArray((g as any).selectedPurpleCards) ? (g as any).selectedPurpleCards : [];
              return arr.length;
            })();
            const commercial = dd('commercial');
            const civil = dd('civil');
            const military = dd('military');
            const science = dd('science');
            const cities = dd('cities');
            const treasury = dd('treasury');
            const edifice = dd('edifice');
            const analysis = state.analysisByPlayer[pid] || {};

            return {
              brown: analysis.brownCards,
              grey: analysis.grayCards,
              blue: civil.blueCardsCount,
              yellow: (Array.isArray(commercial.selectedYellowCards) ? commercial.selectedYellowCards.length : commercial.yellowCardsCount) || 0,
              red: military.redCardsCount,
              green: science.greenCardsCount,
              purple: purpleCount,
              black: cities.blackCardsCount,
              leaders: leadersCount,
              wonderStagesBuilt: wonderStages,
              coins: treasury.coins,
              edificePawns: {
                age1: !!edifice.contributedAge1,
                age2: !!edifice.contributedAge2,
                age3: !!edifice.contributedAge3,
              },
              selectedGuilds: (Array.isArray(dd('guild').selectedPurpleCards) ? dd('guild').selectedPurpleCards : []),
            };
          };

          const totals = computeGuildsForAll({ order, getSnapshot });
          for (const pid of order) {
            if (state.playerScores[pid]) {
              state.playerScores[pid].categories.guild.isDetailed = true;
              state.playerScores[pid].categories.guild.calculatedPoints = totals[pid]?.total ?? 0;
            }
          }
          for (const pid of Object.keys(state.playerScores)) {
            const ps = state.playerScores[pid];
            ps.total = computeTotal(ps.categories);
            ps.lastUpdated = new Date();
          }
        } catch (e) {
          console.warn('Recompute guilds (analysis update) failed:', e);
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
                let pts = totals[pid]?.total ?? 0;
                // Add immediate bonuses from selected Black (Cities) cards that grant MV tokens
                const citiesDD = state.playerScores[pid]?.categories?.cities?.detailedData || {};
                const selected: string[] = Array.isArray(citiesDD.selectedBlackCards) ? citiesDD.selectedBlackCards : [];
                const names = selected.map((n) => String(n).toLowerCase());
                if (names.some(n => n === 'raider camp' || n === 'raider_camp')) pts += 1;
                if (names.some(n => n === 'raider fort' || n === 'raider_fort')) pts += 3;
                if (names.some(n => n === 'raider garrison' || n === 'raider_garrison')) pts += 5;
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

        // Recompute Guilds when any relevant category changes (neighbors dependent)
        const guildAffected = (
          category === 'guild' ||
          category === 'civil' ||
          category === 'commercial' ||
          category === 'military' ||
          category === 'science' ||
          category === 'cities' ||
          category === 'leaders' ||
          category === 'wonder' ||
          category === 'treasury'
        );
        if (guildAffected) {
          try {
            const setup = require('./setupStore');
            const orderedPlayers: Array<{ id: string; name: string }> = setup.useSetupStore.getState().getOrderedPlayers();
            const order = orderedPlayers.map((p: any) => p.id);

            const getSnapshot = (pid: string) => {
              const ps = state.playerScores[pid];
              const dd = (cat: CategoryKey) => ps?.categories?.[cat]?.detailedData || {};
              const wonderStages = (() => {
                const w = dd('wonder');
                return Object.keys(w).filter(k => k.startsWith('stage') && w[k]).length;
              })();
              const leadersCount = (() => {
                const l = dd('leaders');
                const arr: string[] = Array.isArray(l.selectedLeaders) ? l.selectedLeaders : [];
                return arr.length;
              })();
              const purpleCount = (() => {
                const g = dd('guild');
                const arr: string[] = Array.isArray(g.selectedPurpleCards) ? g.selectedPurpleCards : [];
                return arr.length;
              })();
              const selectedGuilds: string[] = (() => {
                const g = dd('guild');
                return Array.isArray(g.selectedPurpleCards) ? g.selectedPurpleCards : [];
              })();
              const edifice = dd('edifice');
              const cities = dd('cities');
              const commercial = dd('commercial');
              const civil = dd('civil');
              const military = dd('military');
              const science = dd('science');
              const treasury = dd('treasury');

              const analysis = state.analysisByPlayer[pid] || {};
              return {
                brown: analysis.brownCards,
                grey: analysis.grayCards,
                blue: civil.blueCardsCount,
                yellow: (Array.isArray(commercial.selectedYellowCards) ? commercial.selectedYellowCards.length : commercial.yellowCardsCount) || 0,
                red: military.redCardsCount,
                green: science.greenCardsCount,
                purple: purpleCount,
                black: cities.blackCardsCount,
                leaders: leadersCount,
                wonderStagesBuilt: wonderStages,
                coins: treasury.coins,
                edificePawns: {
                  age1: !!edifice.contributedAge1,
                  age2: !!edifice.contributedAge2,
                  age3: !!edifice.contributedAge3,
                },
                selectedGuilds,
              };
            };

            const totals = computeGuildsForAll({ order, getSnapshot });
            for (const pid of order) {
              if (state.playerScores[pid]) {
                state.playerScores[pid].categories.guild.isDetailed = true;
                state.playerScores[pid].categories.guild.calculatedPoints = totals[pid]?.total ?? 0;
              }
            }
            // After guild recompute, refresh overall totals
            for (const pid of Object.keys(state.playerScores)) {
              const ps = state.playerScores[pid];
              ps.total = computeTotal(ps.categories);
              ps.lastUpdated = new Date();
            }
          } catch (e) {
            console.warn('Recompute guilds failed:', e);
          }
        }

        // Recompute Leaders indirect VP when affected categories change
        const leadersAffected = (
          category === 'leaders' ||
          category === 'civil' ||
          category === 'commercial' ||
          category === 'military' ||
          category === 'science' ||
          category === 'cities' ||
          category === 'treasury'
        );
        if (leadersAffected) {
          try {
            const setup = require('./setupStore');
            const orderedPlayers: Array<{ id: string; name: string }> = setup.useSetupStore.getState().getOrderedPlayers();
            const order = orderedPlayers.map((p: any) => p.id);

            const getSnapshot = (pid: string) => {
              const ps = state.playerScores[pid];
              const dd = (k: CategoryKey) => ps?.categories?.[k]?.detailedData || {};
              const analysis = state.analysisByPlayer[pid] || {};
              const commercial = dd('commercial');
              const civil = dd('civil');
              const military = dd('military');
              const science = dd('science');
              const cities = dd('cities');
              const treasury = dd('treasury');
              return {
                brown: analysis.brownCards,
                grey: analysis.grayCards,
                blue: civil.blueCardsCount,
                yellow: (Array.isArray(commercial.selectedYellowCards) ? commercial.selectedYellowCards.length : commercial.yellowCardsCount) || 0,
                red: military.redCardsCount,
                green: science.greenCardsCount,
                black: cities.blackCardsCount,
                coins: treasury.coins,
                mvTokensAge1: military.mvTokensAge1,
                mvTokensAge2: military.mvTokensAge2,
                mvTokensAge3: military.mvTokensAge3,
                selectedLeaders: (Array.isArray(dd('leaders').selectedLeaders) ? dd('leaders').selectedLeaders : []),
              };
            };

            const totals = computeLeadersForAll({ order, getSnapshot });
            for (const pid of order) {
              const indirect = totals[pid]?.totalIndirect ?? 0;
              if (state.playerScores[pid]) {
                // Keep immediate VP in directPoints; put indirect into calculatedPoints
                state.playerScores[pid].categories.leaders.isDetailed = true;
                state.playerScores[pid].categories.leaders.calculatedPoints = indirect;
              }
            }
            // refresh totals
            for (const pid of Object.keys(state.playerScores)) {
              const ps = state.playerScores[pid];
              ps.total = computeTotal(ps.categories);
              ps.lastUpdated = new Date();
            }
          } catch (e) {
            console.warn('Recompute leaders failed:', e);
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
