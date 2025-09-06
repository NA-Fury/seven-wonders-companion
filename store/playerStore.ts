import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CategoryKey } from './scoringStore';
import { evaluateBadgeIdsForContext } from '../data/badges';

export type WonderSide = 'day' | 'night';

export interface PlayerBadge {
  id: string;
  unlockedAt: string; // ISO date
}

export interface PlayerProfileStats {
  gamesPlayed: number;
  wins: number;
  runnerUp: number;
  thirdPlace: number;
  winRate: number; // 0..1
  top3Rate: number; // 0..1
  pointsTotal: number;
  averageScore: number;
  highestScore?: { score: number; gameId: string };
  lowestScore?: { score: number; gameId: string };
  categoryAverages: Partial<Record<CategoryKey, number>>;
  wondersPlayed: Record<string, { day: number; night: number; total: number }>; // wonderId
  neighborCounts: Record<string, number>; // otherProfileId -> times adjacent
  expansionsUseCounts: { leaders: number; cities: number; armada: number; edifice: number; baseOnly: number };
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  stats: PlayerProfileStats;
  badges: PlayerBadge[];
}

export interface GameResultInput {
  gameId: string;
  date: string; // ISO
  playerOrder: string[]; // profile ids, table order for neighbors
  scores: Record<string, number>; // profileId -> total
  ranks: Record<string, number>; // profileId -> 1..n
  expansions: { leaders: boolean; cities: boolean; armada: boolean; edifice: boolean };
  wonders: Record<string, { boardId?: string; side?: WonderSide }>; // profileId -> assignment
  categoryBreakdowns?: Record<string, Partial<Record<CategoryKey, number>>>; // optional
}

type PlayerDBState = {
  profiles: Record<string, PlayerProfile>;
  selectedForGame: string[]; // profile ids
};

type PlayerDBActions = {
  addProfile: (name: string) => string; // returns id
  removeProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<Pick<PlayerProfile, 'name' | 'avatar'>>) => void;
  getAllProfiles: () => PlayerProfile[];
  toggleSelected: (id: string) => void;
  clearSelection: () => void;
  setSelection: (ids: string[]) => void;
  recordGameResult: (input: GameResultInput) => void;
  grantBadge: (id: string, badgeId: string) => void;
};

const emptyStats = (): PlayerProfileStats => ({
  gamesPlayed: 0,
  wins: 0,
  runnerUp: 0,
  thirdPlace: 0,
  winRate: 0,
  top3Rate: 0,
  pointsTotal: 0,
  averageScore: 0,
  highestScore: undefined,
  lowestScore: undefined,
  categoryAverages: {},
  wondersPlayed: {},
  neighborCounts: {},
  expansionsUseCounts: { leaders: 0, cities: 0, armada: 0, edifice: 0, baseOnly: 0 },
});

export const usePlayerStore = create<PlayerDBState & PlayerDBActions>()(
  persist(
    (set, get) => ({
      profiles: {},
      selectedForGame: [],

      addProfile: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        const now = new Date().toISOString();
        const profile: PlayerProfile = {
          id,
          name: trimmed,
          createdAt: now,
          updatedAt: now,
          stats: emptyStats(),
          badges: [],
        };
        set((s) => ({ profiles: { ...s.profiles, [id]: profile } }));
        return id;
      },

      removeProfile: (id) => {
        set((s) => {
          const next = { ...s.profiles };
          delete next[id];
          return { profiles: next, selectedForGame: s.selectedForGame.filter((x) => x !== id) };
        });
      },

      updateProfile: (id, updates) => {
        set((s) => {
          const p = s.profiles[id];
          if (!p) return {} as any;
          const updated: PlayerProfile = {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          } as PlayerProfile;
          return { profiles: { ...s.profiles, [id]: updated } };
        });
      },

      getAllProfiles: () => Object.values(get().profiles).sort((a, b) => a.name.localeCompare(b.name)),

      toggleSelected: (id) => {
        set((s) => {
          const has = s.selectedForGame.includes(id);
          const next = has ? s.selectedForGame.filter((x) => x !== id) : [...s.selectedForGame, id];
          return { selectedForGame: next.slice(0, 7) };
        });
      },

      clearSelection: () => set({ selectedForGame: [] }),
      setSelection: (ids) => set({ selectedForGame: ids.slice(0, 7) }),

      grantBadge: (id, badgeId) => {
        set((s) => {
          const p = s.profiles[id];
          if (!p) return {} as any;
          if (p.badges.some((b) => b.id === badgeId)) return {} as any;
          const nb: PlayerBadge = { id: badgeId, unlockedAt: new Date().toISOString() };
          return { profiles: { ...s.profiles, [id]: { ...p, badges: [...p.badges, nb] } } };
        });
      },

      // Update per-player stats based on a completed game
      recordGameResult: (input) => {
        set((s) => {
          const updated: Record<string, PlayerProfile> = { ...s.profiles };

          const playerIds = Object.keys(input.scores);
          const playerCount = playerIds.length;
          const isBaseOnly = !input.expansions.leaders && !input.expansions.cities && !input.expansions.armada && !input.expansions.edifice;

          // compute previous global high score (for Record Holder)
          const prevGlobalHigh = Object.values(updated).reduce((m, p) => Math.max(m, p.stats.highestScore?.score || 0), 0);

          // Neighbor map: use table order, circular
          const leftOf = (idx: number) => (idx === 0 ? playerCount - 1 : idx - 1);
          const rightOf = (idx: number) => (idx === playerCount - 1 ? 0 : idx + 1);

          for (let i = 0; i < input.playerOrder.length; i++) {
            const pid = input.playerOrder[i];
            const profile = updated[pid];
            if (!profile) continue; // skip players not in DB

            const stats = { ...profile.stats };
            const score = input.scores[pid] ?? 0;
            const rank = input.ranks[pid] ?? 0;

            // Totals
            stats.gamesPlayed += 1;
            stats.pointsTotal += score;
            stats.averageScore = Math.round((stats.pointsTotal / stats.gamesPlayed) * 10) / 10;

            // Placements
            if (rank === 1) stats.wins += 1;
            if (rank === 2) stats.runnerUp += 1;
            if (rank === 3) stats.thirdPlace += 1;
            stats.winRate = stats.gamesPlayed > 0 ? +(stats.wins / stats.gamesPlayed).toFixed(3) : 0;
            const top3 = stats.wins + stats.runnerUp + stats.thirdPlace;
            stats.top3Rate = stats.gamesPlayed > 0 ? +(top3 / stats.gamesPlayed).toFixed(3) : 0;

            // High/Low score
            if (!stats.highestScore || score > stats.highestScore.score) {
              stats.highestScore = { score, gameId: input.gameId };
            }
            if (!stats.lowestScore || score < stats.lowestScore.score) {
              stats.lowestScore = { score, gameId: input.gameId };
            }

            // Wonders played
            const w = input.wonders[pid];
            if (w?.boardId) {
              const prev = stats.wondersPlayed[w.boardId] || { day: 0, night: 0, total: 0 };
              const sideKey = (w.side || 'day') as WonderSide;
              const next = { ...prev, [sideKey]: prev[sideKey] + 1, total: prev.total + 1 } as any;
              stats.wondersPlayed[w.boardId] = next;
            }

            // Neighbors
            const leftId = input.playerOrder[leftOf(i)];
            const rightId = input.playerOrder[rightOf(i)];
            stats.neighborCounts[leftId] = (stats.neighborCounts[leftId] || 0) + 1;
            stats.neighborCounts[rightId] = (stats.neighborCounts[rightId] || 0) + 1;

            // Expansions usage
            if (isBaseOnly) stats.expansionsUseCounts.baseOnly += 1;
            if (input.expansions.leaders) stats.expansionsUseCounts.leaders += 1;
            if (input.expansions.cities) stats.expansionsUseCounts.cities += 1;
            if (input.expansions.armada) stats.expansionsUseCounts.armada += 1;
            if (input.expansions.edifice) stats.expansionsUseCounts.edifice += 1;

            // Category averages (if provided)
            const breakdown = input.categoryBreakdowns?.[pid] || {};
            const cats = Object.keys(breakdown) as CategoryKey[];
            cats.forEach((cat) => {
              const prev = stats.categoryAverages[cat] || 0;
              // Update running avg roughly: newAvg = oldAvg + (x - oldAvg)/n
              const val = (breakdown[cat] as number) || 0;
              const n = stats.gamesPlayed;
              const newAvg = prev + (val - prev) / n;
              stats.categoryAverages[cat] = Math.round(newAvg * 10) / 10;
            });

            // Centralized badge evaluation
            const existing = new Set(profile.badges.map((b) => b.id));
            const ctx = {
              playerId: pid,
              rank,
              score,
              breakdown: breakdown as any,
              expansions: input.expansions,
              wonderBoardId: w?.boardId,
              playerCount,
            };
            const newlyEarned = new Set(evaluateBadgeIdsForContext(ctx));

            // Record Holder (global highest) — add if this score beats previous global record
            if (score > prevGlobalHigh) {
              newlyEarned.add('record_holder');
            }

            // Merge badges without duplicating previously unlocked ones
            const merged = [
              ...profile.badges,
              ...Array.from(newlyEarned)
                .filter((id) => !existing.has(id))
                .map((id) => ({ id, unlockedAt: input.date })),
            ];

            updated[pid] = {
              ...profile,
              stats,
              badges: merged,
              updatedAt: new Date().toISOString(),
            };
          }

          return { profiles: updated };
        });
      },
    }),
    {
      name: 'swc-players',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profiles: s.profiles }),
    },
  ),
);

// Helpers for selection
export const selectProfiles = () => usePlayerStore.getState().getAllProfiles();
export const getSelectedIds = () => usePlayerStore.getState().selectedForGame;
