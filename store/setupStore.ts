// store/setupStore.ts - Enhanced with proper integration and validation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shuffleArray } from '../utils/shuffle';

export type GameHistoryEntry = {
  id: string;
  date: Date;
  players: string[];
  expansions: Expansions;
  winner?: string;
  scores: Record<string, number>;
  duration?: number;
};

export type Expansions = { 
  leaders: boolean; 
  cities: boolean; 
  armada: boolean; 
  edifice: boolean; 
};

export type SetupPlayer = { 
  id: string; 
  name: string; 
  avatar?: string;
  stats?: PlayerStats;
};

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  averageScore: number;
  highestScore: number;
  favoriteStrategy?: string;
  lastPlayed?: Date;
};

export type Seating = string[]; // array of player ids in table order

export type WonderAssignment = {
  boardId?: string;
  side?: 'day' | 'night';
  shipyardId?: string; // For Armada expansion
};

export type EdificeProjects = {
  age1?: string;
  age2?: string;
  age3?: string;
};

// Game configuration for validation
export interface GameConfiguration {
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // in minutes
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  recommendedAge: number;
}

type SetupState = {
  expansions: Expansions;
  players: SetupPlayer[];
  seating: Seating;
  wonders: Record<string, WonderAssignment>;
  edificeProjects: EdificeProjects;
  gameConfiguration: GameConfiguration;
  lastGameDate?: Date;
  gameHistory: GameHistoryEntry[];
};

type SetupActions = {
  // Expansion management
  toggleExpansion: (k: keyof Expansions) => void;
  setExpansions: (expansions: Expansions) => void;
  
  // Player management
  addPlayer: (name: string) => void;
  addExistingPlayer: (player: { id: string; name: string; avatar?: string }) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, updates: Partial<SetupPlayer>) => void;
  updatePlayerStats: (id: string, stats: Partial<PlayerStats>) => void;
  
  // Seating management
  setSeating: (ids: string[]) => void;
  randomizeSeating: () => void;
  
  // Wonder assignment
  assignWonder: (playerId: string, data: Partial<WonderAssignment>) => void;
  randomizeWonders: () => void;
  clearWonderAssignments: () => void;
  
  // Edifice projects
  setEdificeProjects: (p: EdificeProjects) => void;
  
  // Game management
  resetGame: () => void;
  clearPlayers: () => void;
  validateGameSetup: () => string[];
  getGameConfiguration: () => GameConfiguration;
  
  // History management
  addGameToHistory: (game: Omit<GameHistoryEntry, 'id'>) => void;
  clearGameHistory: () => void;
  
  // Utility functions
  getOrderedPlayers: () => SetupPlayer[];
  getPlayerNeighbors: (playerId: string) => { left?: SetupPlayer; right?: SetupPlayer };
  getAvailableWonders: () => string[];
  getAssignedWonders: () => Record<string, WonderAssignment>;
};

const initialState: SetupState = {
  expansions: { leaders: false, cities: false, armada: false, edifice: false },
  players: [],
  seating: [],
  wonders: {},
  edificeProjects: {},
  gameConfiguration: {
    minPlayers: 2,
    maxPlayers: 7,
    estimatedDuration: 30,
    complexity: 'Beginner',
    recommendedAge: 10,
  },
  gameHistory: [],
};

export const useSetupStore = create<SetupState & SetupActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Expansion management
      toggleExpansion: (k) => {
        set(state => {
          const newExpansions = { 
            ...state.expansions, 
            [k]: !state.expansions[k] 
          };
          
          // Update game configuration based on expansions
          const gameConfiguration = calculateGameConfiguration(newExpansions);
          
          // Clear incompatible assignments when expansions change
          let newWonders = { ...state.wonders };
          if (k === 'armada' && !newExpansions.armada) {
            // Remove shipyard assignments if Armada is disabled
            Object.keys(newWonders).forEach(playerId => {
              if (newWonders[playerId].shipyardId) {
                delete newWonders[playerId].shipyardId;
              }
            });
          }
          
          return { 
            expansions: newExpansions,
            gameConfiguration,
            wonders: newWonders,
            edificeProjects: k === 'edifice' && !newExpansions.edifice ? {} : state.edificeProjects,
          };
        });
      },

      setExpansions: (expansions) => {
        set(state => ({
          expansions,
          gameConfiguration: calculateGameConfiguration(expansions),
        }));
      },

      // Player management
      addPlayer: (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        
        const state = get();
        
        // Check for duplicate names
        if (state.players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
          throw new Error('A player with this name already exists');
        }
        
        // Check player limit
        if (state.players.length >= state.gameConfiguration.maxPlayers) {
          throw new Error(`Maximum ${state.gameConfiguration.maxPlayers} players allowed`);
        }
        
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newPlayer: SetupPlayer = {
          id,
          name: trimmedName,
          stats: {
            gamesPlayed: 0,
            wins: 0,
            averageScore: 0,
            highestScore: 0,
          }
        };
        
        set(state => ({ 
          players: [...state.players, newPlayer] 
        }));
      },

      // Add a player using an existing persistent profile id
      addExistingPlayer: (player) => {
        const trimmedName = player.name.trim();
        if (!trimmedName) return;

        const state = get();
        // Prevent duplicates by id or name
        if (state.players.some(p => p.id === player.id || p.name.toLowerCase() === trimmedName.toLowerCase())) {
          return;
        }
        if (state.players.length >= state.gameConfiguration.maxPlayers) {
          throw new Error(`Maximum ${state.gameConfiguration.maxPlayers} players allowed`);
        }
        const newPlayer: SetupPlayer = {
          id: player.id, // preserve profile id for post-game analytics
          name: trimmedName,
          avatar: player.avatar,
          stats: {
            gamesPlayed: 0,
            wins: 0,
            averageScore: 0,
            highestScore: 0,
          }
        };
        set(state => ({ players: [...state.players, newPlayer] }));
      },

      removePlayer: (id) =>
        set(state => ({
          players: state.players.filter(p => p.id !== id),
          seating: state.seating.filter(seatId => seatId !== id),
          wonders: Object.fromEntries(
            Object.entries(state.wonders).filter(([playerId]) => playerId !== id)
          ),
        })),

      updatePlayer: (id, updates) =>
        set(state => ({
          players: state.players.map(p => 
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      updatePlayerStats: (id, stats) =>
        set(state => ({
          players: state.players.map(p => 
            p.id === id ? { 
              ...p, 
              stats: { ...p.stats, ...stats } as PlayerStats 
            } : p
          ),
        })),

      // Seating management
      setSeating: (ids) => {
        const state = get();
        
        // Validate that all IDs exist in players
        const validIds = ids.filter(id => state.players.some(p => p.id === id));
        
        set({ seating: validIds });
      },

      randomizeSeating: () => {
        const state = get();
        const shuffled = shuffleArray(state.players).map(p => p.id);

        set({ seating: shuffled });
      },

      // Wonder assignment
      assignWonder: (playerId, data) => 
        set(state => ({ 
          wonders: { 
            ...state.wonders, 
            [playerId]: { 
              ...state.wonders[playerId], 
              ...data 
            } 
          } 
        })),

      randomizeWonders: () => {
        const state = get();
        const availableWonders = get().getAvailableWonders();
        const shuffledWonders = shuffleArray(availableWonders);
        
        const newWonders: Record<string, WonderAssignment> = {};
        state.players.forEach((player, index) => {
          if (index < shuffledWonders.length) {
            newWonders[player.id] = {
              boardId: shuffledWonders[index],
              side: Math.random() > 0.5 ? 'night' : 'day',
            };
          }
        });
        
        set({ wonders: newWonders });
      },

      clearWonderAssignments: () => set({ wonders: {} }),

      // Edifice projects
      setEdificeProjects: (p) => set({ edificeProjects: p }),

      // Game management
      resetGame: () => set({
        seating: [], 
        wonders: {}, 
        edificeProjects: {},
      }),

      clearPlayers: () => set({ 
        players: [],
        seating: [],
        wonders: {},
      }),

      validateGameSetup: () => {
        const state = get();
        const errors: string[] = [];
        
        // Player count validation
        if (state.players.length < state.gameConfiguration.minPlayers) {
          errors.push(`At least ${state.gameConfiguration.minPlayers} players required`);
        }
        
        if (state.players.length > state.gameConfiguration.maxPlayers) {
          errors.push(`Maximum ${state.gameConfiguration.maxPlayers} players allowed`);
        }
        
        // Player name validation
        const names = state.players.map(p => p.name.toLowerCase().trim());
        const uniqueNames = new Set(names);
        if (names.length !== uniqueNames.size) {
          errors.push('All player names must be unique');
        }
        
        // Wonder assignment validation
        const unassignedPlayers = state.players.filter(
          player => !state.wonders[player.id]?.boardId
        );
        if (unassignedPlayers.length > 0) {
          errors.push(`${unassignedPlayers.length} players missing wonder assignments`);
        }
        
        // Armada validation
        if (state.expansions.armada) {
          const unassignedShipyards = state.players.filter(
            player => !state.wonders[player.id]?.shipyardId
          );
          if (unassignedShipyards.length > 0) {
            errors.push(`${unassignedShipyards.length} players missing shipyard assignments`);
          }
        }
        
        // Edifice validation
        if (state.expansions.edifice) {
          const missingProjects = ['age1', 'age2', 'age3'].filter(
            age => !state.edificeProjects[age as keyof EdificeProjects]
          );
          if (missingProjects.length > 0) {
            errors.push(`Missing edifice projects for ${missingProjects.join(', ')}`);
          }
        }
        
        return errors;
      },

      getGameConfiguration: () => {
        const state = get();
        return calculateGameConfiguration(state.expansions);
      },

      // History management
      addGameToHistory: (game) => {
        const id = Date.now().toString();
        const gameEntry: GameHistoryEntry = { ...game, id };
        
        set(state => ({
          gameHistory: [gameEntry, ...state.gameHistory.slice(0, 49)], // Keep last 50 games
          lastGameDate: new Date(),
        }));
        
        // Update player stats
        Object.entries(game.scores).forEach(([playerId, score]) => {
          const isWinner = game.winner === playerId;
          get().updatePlayerStats(playerId, {
            gamesPlayed: (get().players.find(p => p.id === playerId)?.stats?.gamesPlayed || 0) + 1,
            wins: (get().players.find(p => p.id === playerId)?.stats?.wins || 0) + (isWinner ? 1 : 0),
            averageScore: calculateNewAverage(
              get().players.find(p => p.id === playerId)?.stats?.averageScore || 0,
              get().players.find(p => p.id === playerId)?.stats?.gamesPlayed || 0,
              score
            ),
            highestScore: Math.max(
              get().players.find(p => p.id === playerId)?.stats?.highestScore || 0,
              score
            ),
            lastPlayed: new Date(),
          });
        });
      },

      clearGameHistory: () => set({ gameHistory: [] }),

      // Utility functions
      getOrderedPlayers: () => {
        const state = get();
        if (state.seating.length === 0) return state.players;
        return state.seating
          .map(id => state.players.find(p => p.id === id))
          .filter(Boolean) as SetupPlayer[];
      },

      getPlayerNeighbors: (playerId) => {
        const state = get();
        const orderedPlayers = get().getOrderedPlayers();
        const playerIndex = orderedPlayers.findIndex(p => p.id === playerId);
        
        if (playerIndex === -1 || orderedPlayers.length < 3) {
          return {};
        }
        
        const leftIndex = playerIndex === 0 ? orderedPlayers.length - 1 : playerIndex - 1;
        const rightIndex = playerIndex === orderedPlayers.length - 1 ? 0 : playerIndex + 1;
        
        return {
          left: orderedPlayers[leftIndex],
          right: orderedPlayers[rightIndex],
        };
      },

      getAvailableWonders: () => {
        // This would connect to your WONDERS_DATABASE
        // For now, return base wonder IDs - you'll need to import and filter based on expansions
        const baseWonders = [
          'alexandria', 'babylon', 'colossus', 'artemis', 
          'mausoleum', 'olympia', 'giza'
        ];
        
        const state = get();
        const assignedWonderIds = Object.values(state.wonders)
          .map(w => w.boardId)
          .filter(Boolean) as string[];
        
        return baseWonders.filter(id => !assignedWonderIds.includes(id));
      },

      getAssignedWonders: () => {
        const state = get();
        return state.wonders;
      },
    }),
    { 
      name: 'swc-setup', 
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        expansions: state.expansions,
        players: state.players,
        gameHistory: state.gameHistory,
        lastGameDate: state.lastGameDate,
      }),
    }
  )
);

// Helper functions
function calculateGameConfiguration(expansions: Expansions): GameConfiguration {
  let complexity: GameConfiguration['complexity'] = 'Beginner';
  let estimatedDuration = 30;
  let minPlayers = 2;
  let maxPlayers = 7;
  
  const activeExpansions = Object.values(expansions).filter(Boolean).length;
  
  if (activeExpansions === 0) {
    complexity = 'Beginner';
    estimatedDuration = 30;
  } else if (activeExpansions <= 2) {
    complexity = 'Intermediate';
    estimatedDuration = 45;
  } else {
    complexity = 'Advanced';
    estimatedDuration = 60;
  }
  
  // Adjust for specific expansions
  if (expansions.leaders) estimatedDuration += 10;
  if (expansions.cities) estimatedDuration += 15;
  if (expansions.armada) estimatedDuration += 20;
  if (expansions.edifice) estimatedDuration += 10;
  
  return {
    minPlayers,
    maxPlayers,
    estimatedDuration,
    complexity,
    recommendedAge: complexity === 'Advanced' ? 14 : 10,
  };
}

function calculateNewAverage(
  currentAverage: number, 
  gamesPlayed: number, 
  newScore: number
): number {
  if (gamesPlayed === 0) return newScore;
  return Math.round(((currentAverage * gamesPlayed) + newScore) / (gamesPlayed + 1));
}
