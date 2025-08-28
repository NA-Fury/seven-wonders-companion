// store/scoringStore.ts - Optimized with proper memoization
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PlayerScoreData {
  // Quick Score Mode - Direct Points
  wonderPoints?: number;
  treasurePoints?: number;
  militaryPoints?: number;
  civilianPoints?: number;
  commercialPoints?: number;
  sciencePoints?: number;
  guildsPoints?: number;
  citiesPoints?: number;
  leadersPoints?: number;
  navyPoints?: number;
  islandPoints?: number;
  edificePoints?: number;

  // Detailed Mode Flags
  wonderDetailsEntered?: boolean;
  treasureDetailsEntered?: boolean;
  militaryDetailsEntered?: boolean;
  civilianDetailsEntered?: boolean;
  commercialDetailsEntered?: boolean;
  scienceDetailsEntered?: boolean;
  guildsDetailsEntered?: boolean;
  citiesDetailsEntered?: boolean;
  leadersDetailsEntered?: boolean;
  navyDetailsEntered?: boolean;
  islandDetailsEntered?: boolean;
  edificeDetailsEntered?: boolean;

  // Wonder Details
  wonderStagesCompleted?: boolean[];
  
  // Treasure Details
  totalCoins?: number;
  permanentDebt?: number;
  cardDebt?: number;
  taxDebt?: number;
  piracyDebt?: number;
  commercialPotTaxes?: number;

  // Military Details
  militaryStrengthAge1?: number;
  militaryStrengthAge2?: number;
  militaryStrengthAge3?: number;
  redDoveTokensPlayed?: number[];
  redShipPosition?: number;
  militaryBoardingApplied?: number;
  militaryBoardingReceived?: number;
  totalRedCards?: number;
  militaryChainLinks?: number;

  // Civilian Details
  totalBlueCards?: number;
  blueShipPosition?: number;
  civilChainLinks?: number;
  armadaShipIconCards?: number;

  // Commercial Details
  totalYellowCards?: number;
  yellowShipPosition?: number;
  commercialChainLinks?: number;
  commercialArmadaCards?: number;
  commercialCitiesCards?: number;

  // Science Details
  scienceCompass?: number;
  scienceTablet?: number;
  scienceGear?: number;
  nonCardCompass?: number;
  nonCardTablet?: number;
  nonCardGear?: number;
  greenShipPosition?: number;
  totalGreenCards?: number;
  scienceChainLinks?: number;

  // Guild Details
  guildCards?: string[];

  // Cities Details (if expansion enabled)
  totalBlackCards?: number;
  blackCardsWithPoints?: number;
  blackCardsAffectingNeighbors?: number;
  blackCardsPositiveEffects?: number;
  blackCardsNegativeEffects?: number;

  // Leaders Details (if expansion enabled)
  leadersPlayed?: string[];

  // Navy Details (if Armada enabled)
  navyStrengthAge1?: number;
  navyStrengthAge2?: number;
  navyStrengthAge3?: number;
  navyRedShipPosition?: number;
  navyContributingCards?: number;
  blueDoveTokensPlayed?: number[];

  // Island Details (if Armada enabled)
  islandGreenShipPosition?: number;
  islandStage1Count?: number;
  islandStage2Count?: number;
  islandStage3Count?: number;
  islandDirectPoints?: number;

  // Edifice Details (if expansion enabled)
  edificeContributions?: {
    age1?: number; // which wonder stage contributed
    age2?: number;
    age3?: number;
  };

  // Analysis Data
  brownResourceCards?: number;
  grayResourceCards?: number;
  discardRetrievals?: {
    age1?: number;
    age2?: number;
    age3?: number;
    source?: string;
  };
}

interface ScoringState {
  playerScores: Record<string, PlayerScoreData>;
  currentPlayerIndex: number;
  isInitialized: boolean;
  gameStartTime: string;
  lastUpdate: number;

  // Actions
  initializeScoring: (playerIds: string[], startTime?: string) => void;
  updateQuickScore: (playerId: string, category: string, points: number) => void;
  updateDetailedScore: (playerId: string, updates: Partial<PlayerScoreData>) => void;
  setCurrentPlayer: (index: number) => void;
  
  // Getters
  getPlayerScore: (playerId: string) => PlayerScoreData;
  getPlayerTotal: (playerId: string, expansions: any) => { total: number; isComplete: boolean };
  calculateSciencePoints: (playerId: string) => number;
  calculateTreasurePoints: (playerId: string) => number;
  
  // Management
  resetScores: () => void;
  // returns saved game id
  saveGame: () => Promise<string>;
}

export const useScoringStore = create<ScoringState>()(
  persist(
    (set, get) => ({
      playerScores: {},
      currentPlayerIndex: 0,
      isInitialized: false,
      gameStartTime: new Date().toISOString(),
      lastUpdate: Date.now(),

      initializeScoring: (playerIds, startTime) => {
        const scores: Record<string, PlayerScoreData> = {};
        playerIds.forEach(id => {
          scores[id] = {
            wonderPoints: 0,
            treasurePoints: 0,
            militaryPoints: 0,
            civilianPoints: 0,
            commercialPoints: 0,
            sciencePoints: 0,
            guildsPoints: 0,
            citiesPoints: 0,
            leadersPoints: 0,
            navyPoints: 0,
            islandPoints: 0,
            edificePoints: 0,
          };
        });
        
        set({
          playerScores: scores,
          isInitialized: true,
          gameStartTime: startTime || new Date().toISOString(),
          currentPlayerIndex: 0,
          lastUpdate: Date.now(),
        });
      },

      updateQuickScore: (playerId, category, points) => {
        const state = get();
        const playerScore = state.playerScores[playerId] || {};
        
        set({
          playerScores: {
            ...state.playerScores,
            [playerId]: {
              ...playerScore,
              [`${category}Points`]: points,
            }
          },
          lastUpdate: Date.now(),
        });
      },

      updateDetailedScore: (playerId, updates) => {
        const state = get();
        const playerScore = state.playerScores[playerId] || {};
        
        // Auto-calculate certain scores if detailed data provided
        let calculatedUpdates = { ...updates };
        
        // Auto-calculate science if details provided
        if (updates.scienceCompass !== undefined || 
            updates.scienceTablet !== undefined || 
            updates.scienceGear !== undefined) {
          const compass = (updates.scienceCompass || playerScore.scienceCompass || 0) + 
                          (updates.nonCardCompass || playerScore.nonCardCompass || 0);
          const tablet = (updates.scienceTablet || playerScore.scienceTablet || 0) + 
                        (updates.nonCardTablet || playerScore.nonCardTablet || 0);
          const gear = (updates.scienceGear || playerScore.scienceGear || 0) + 
                      (updates.nonCardGear || playerScore.nonCardGear || 0);
          
          const sciencePoints = (compass * compass) + (tablet * tablet) + (gear * gear) + 
                               (Math.min(compass, tablet, gear) * 7);
          
          calculatedUpdates.sciencePoints = sciencePoints;
          calculatedUpdates.scienceDetailsEntered = true;
        }

        // Auto-calculate treasure if details provided
        if (updates.totalCoins !== undefined) {
          const coinPoints = Math.floor((updates.totalCoins || 0) / 3);
          const totalDebt = (updates.permanentDebt || playerScore.permanentDebt || 0) +
                           (updates.cardDebt || playerScore.cardDebt || 0) +
                           (updates.taxDebt || playerScore.taxDebt || 0) +
                           (updates.piracyDebt || playerScore.piracyDebt || 0) +
                           (updates.commercialPotTaxes || playerScore.commercialPotTaxes || 0);
          
          calculatedUpdates.treasurePoints = Math.max(0, coinPoints - totalDebt);
          calculatedUpdates.treasureDetailsEntered = true;
        }
        
        set({
          playerScores: {
            ...state.playerScores,
            [playerId]: {
              ...playerScore,
              ...calculatedUpdates,
            }
          },
          lastUpdate: Date.now(),
        });
      },

      setCurrentPlayer: (index) => {
        set({ currentPlayerIndex: index });
      },

      getPlayerScore: (playerId) => {
        return get().playerScores[playerId] || {};
      },

      getPlayerTotal: (playerId, expansions) => {
        const score = get().playerScores[playerId];
        if (!score) return { total: 0, isComplete: false };

        let total = 0;
        let hasUndetermined = false;

        // Base game categories
        const baseCategories = [
          'wonder', 'treasure', 'military', 'civilian', 
          'commercial', 'science', 'guilds'
        ];

        // Add expansion categories
        const activeCategories = [...baseCategories];
        if (expansions?.cities) activeCategories.push('cities');
        if (expansions?.leaders) activeCategories.push('leaders');
        if (expansions?.armada) {
          activeCategories.push('navy', 'island');
        }
        if (expansions?.edifice) activeCategories.push('edifice');

        activeCategories.forEach(category => {
          const points = score[`${category}Points` as keyof PlayerScoreData] as number;
          const detailsEntered = score[`${category}DetailsEntered` as keyof PlayerScoreData];
          
          if (points !== undefined && points !== 0) {
            total += points;
          } else if (detailsEntered) {
            // Details entered but no quick score - mark as undetermined
            hasUndetermined = true;
          }
        });

        return { 
          total, 
          isComplete: !hasUndetermined 
        };
      },

      calculateSciencePoints: (playerId) => {
        const score = get().playerScores[playerId];
        if (!score) return 0;

        const compass = (score.scienceCompass || 0) + (score.nonCardCompass || 0);
        const tablet = (score.scienceTablet || 0) + (score.nonCardTablet || 0);
        const gear = (score.scienceGear || 0) + (score.nonCardGear || 0);

        return (compass * compass) + (tablet * tablet) + (gear * gear) + 
               (Math.min(compass, tablet, gear) * 7);
      },

      calculateTreasurePoints: (playerId) => {
        const score = get().playerScores[playerId];
        if (!score) return 0;

        const coinPoints = Math.floor((score.totalCoins || 0) / 3);
        const totalDebt = (score.permanentDebt || 0) +
                         (score.cardDebt || 0) +
                         (score.taxDebt || 0) +
                         (score.piracyDebt || 0) +
                         (score.commercialPotTaxes || 0);

        return Math.max(0, coinPoints - totalDebt);
      },

      resetScores: () => {
        set({
          playerScores: {},
          currentPlayerIndex: 0,
          isInitialized: false,
          lastUpdate: Date.now(),
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
              gameStartTime: state.gameStartTime,
              timestamp: Date.now(),
            })
          );
          
          return gameId;
        } catch (e) {
          console.error('Failed to save game:', e);
          throw e;
        }
      },
    }),
    {
      name: '7wonders-scoring',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playerScores: state.playerScores,
        gameStartTime: state.gameStartTime,
      }),
    }
  )
);