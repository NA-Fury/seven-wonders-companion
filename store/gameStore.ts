// store/gameStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Expansion, GameState, Player, PlayerScore } from '../types/game';

interface GameStore {
  // Current game state
  currentGame: GameState | null;
  selectedExpansions: Expansion[];
  
  // Game history
  gameHistory: GameState[];
  
  // Player management
  savedPlayers: Player[];
  
  // Actions
  setExpansions: (expansions: Expansion[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  
  // Game lifecycle
  startNewGame: (players: Player[], expansions: Expansion[]) => void;
  endGame: (scores: PlayerScore[]) => void;
  resetCurrentGame: () => void;
  
  // Score calculation
  calculateScores: () => PlayerScore[];
  updatePlayerScore: (playerId: string, scoreUpdates: Partial<PlayerScore>) => void;
  
  // Persistence
  savePlayer: (player: Player) => void;
  loadSavedPlayers: () => void;
  clearHistory: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      selectedExpansions: ['Base'],
      gameHistory: [],
      savedPlayers: [],

      setExpansions: (expansions) => set({ selectedExpansions: expansions }),

      addPlayer: (player) => {
        const state = get();
        if (state.currentGame) {
          set({
            currentGame: {
              ...state.currentGame,
              players: [...state.currentGame.players, player],
            },
          });
        }
      },

      removePlayer: (playerId) => {
        const state = get();
        if (state.currentGame) {
          set({
            currentGame: {
              ...state.currentGame,
              players: state.currentGame.players.filter(p => p.id !== playerId),
            },
          });
        }
      },

      updatePlayer: (playerId, updates) => {
        const state = get();
        if (state.currentGame) {
          set({
            currentGame: {
              ...state.currentGame,
              players: state.currentGame.players.map(p =>
                p.id === playerId ? { ...p, ...updates } : p
              ),
            },
          });
        }
      },

      startNewGame: (players, expansions) => {
        const newGame: GameState = {
          id: Date.now().toString(),
          players,
          expansions,
          currentAge: 1,
          scores: [],
          startTime: new Date(),
        };
        set({ 
          currentGame: newGame,
          selectedExpansions: expansions 
        });
      },

      endGame: (scores) => {
        const state = get();
        if (state.currentGame) {
          const completedGame = {
            ...state.currentGame,
            scores,
            endTime: new Date(),
          };
          set({
            currentGame: null,
            gameHistory: [completedGame, ...state.gameHistory.slice(0, 49)], // Keep last 50 games
          });
        }
      },

      resetCurrentGame: () => set({ currentGame: null }),

      calculateScores: () => {
        const state = get();
        if (!state.currentGame) return [];
        
        // Basic score calculation - I'll expand this based on 7 Wonders rules
        return state.currentGame.players.map(player => ({
          playerId: player.id,
          military: 0, // Calculate based on military tokens
          treasury: 0, // Calculate coins/3
          wonder: 0, // Calculate wonder stages built
          civilian: 0, // Calculate civilian structure points
          commercial: 0, // Calculate commercial structure points
          guilds: 0, // Calculate guild points
          science: 0, // Calculate science points (most complex)
          leaders: state.selectedExpansions.includes('Leaders') ? 0 : undefined,
          cities: state.selectedExpansions.includes('Cities') ? 0 : undefined,
          armada: state.selectedExpansions.includes('Armada') ? 0 : undefined,
          edifices: state.selectedExpansions.includes('Edifice') ? 0 : undefined,
          debt: state.selectedExpansions.includes('Cities') ? 0 : undefined,
          total: 0, // Sum of all categories
        }));
      },

      updatePlayerScore: (playerId, scoreUpdates) => {
        const state = get();
        if (state.currentGame) {
          const updatedScores = state.currentGame.scores.map(score =>
            score.playerId === playerId 
              ? { ...score, ...scoreUpdates, total: calculateTotal({ ...score, ...scoreUpdates }) }
              : score
          );
          
          set({
            currentGame: {
              ...state.currentGame,
              scores: updatedScores,
            },
          });
        }
      },

      savePlayer: (player) => {
        const state = get();
        const existingIndex = state.savedPlayers.findIndex(p => p.id === player.id);
        if (existingIndex >= 0) {
          const updated = [...state.savedPlayers];
          updated[existingIndex] = player;
          set({ savedPlayers: updated });
        } else {
          set({ savedPlayers: [...state.savedPlayers, player] });
        }
      },

      loadSavedPlayers: () => {
        // This will be called automatically by persist middleware
      },

      clearHistory: () => set({ gameHistory: [] }),
    }),
    {
      name: 'seven-wonders-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        gameHistory: state.gameHistory,
        savedPlayers: state.savedPlayers,
        selectedExpansions: state.selectedExpansions 
      }),
    }
  )
);

// Helper function to calculate total score
function calculateTotal(score: PlayerScore): number {
  return (
    score.military +
    score.treasury +
    score.wonder +
    score.civilian +
    score.commercial +
    score.guilds +
    score.science +
    (score.leaders || 0) +
    (score.cities || 0) +
    (score.armada || 0) +
    (score.edifices || 0) -
    (score.debt || 0)
  );
}