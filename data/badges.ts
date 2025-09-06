// data/badges.ts - Badge catalog + evaluation rules
import type { Expansions } from '../store/setupStore';
import { WONDERS_DATABASE } from './wondersDatabase';

export type BadgeSection = 'Records' | 'Wonders' | 'Strategies' | 'Special';

export type Badge = {
  id: string;
  name: string;
  icon: string; // single emoji for uniform sizing
  description: string;
  section: BadgeSection;
  unlock?: (ctx: BadgeContext) => boolean;
};

export type BadgeContext = {
  playerId: string;
  rank: number; // 1..n
  score: number; // total
  breakdown: Partial<Record<
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
    | 'edifice',
    number
  >>;
  expansions: Expansions;
  wonderBoardId?: string; // e.g., 'alexandria'
  playerCount: number;
};

// Creative + strategy badges
const BASE_BADGES: Badge[] = [
  { id: 'record_holder', name: 'Record Holder', icon: '📜', description: 'Held the local highest score.', section: 'Records' },
  { id: 'century_club', name: 'Century Club', icon: '💯', description: 'Score 100+ points in a game.', section: 'Records', unlock: (c) => c.score >= 100 },

  { id: 'warmonger', name: 'Warmonger', icon: '⚔️', description: 'Earn 20+ points from Military.', section: 'Strategies', unlock: (c) => (c.breakdown.military || 0) >= 20 },
  { id: 'tactician', name: 'Tactician', icon: '🛡️', description: 'Win with Military as top category (not a blowout).', section: 'Strategies', unlock: (c) => c.rank === 1 && (c.breakdown.military || 0) > Math.max(
      c.breakdown.science || 0,
      c.breakdown.civil || 0,
      c.breakdown.commercial || 0,
      c.breakdown.guild || 0,
      c.breakdown.wonder || 0,
      c.breakdown.navy || 0
    ) && ((c.breakdown.military || 0) / Math.max(1, c.score)) <= 0.6 },

  { id: 'great_scientist', name: 'Great Scientist', icon: '🔬', description: 'Earn 25+ points from Science.', section: 'Strategies', unlock: (c) => (c.breakdown.science || 0) >= 25 },
  { id: 'scholar_supreme', name: 'Scholar Supreme', icon: '🧠', description: 'Win primarily through Science.', section: 'Strategies', unlock: (c) => c.rank === 1 && (c.breakdown.science || 0) >= 25 && (c.breakdown.science || 0) >= (c.breakdown.military || 0) && (c.breakdown.science || 0) >= (c.breakdown.civil || 0) },

  { id: 'merchant_prince', name: 'Merchant Prince', icon: '🪙', description: 'Earn 15+ points from Commerce.', section: 'Strategies', unlock: (c) => (c.breakdown.commercial || 0) >= 15 },
  { id: 'tycoon', name: 'Tycoon', icon: '💼', description: 'Win with strong Commercial play.', section: 'Strategies', unlock: (c) => c.rank === 1 && (c.breakdown.commercial || 0) >= 18 },

  { id: 'master_builder', name: 'Master Builder', icon: '🏗️', description: 'Earn 20+ points from Civil.', section: 'Strategies', unlock: (c) => (c.breakdown.civil || 0) >= 20 },
  { id: 'architects_muse', name: "Architect's Muse", icon: '🏛️', description: 'Earn 15+ points from Wonder stages.', section: 'Strategies', unlock: (c) => (c.breakdown.wonder || 0) >= 15 },

  { id: 'explorer', name: 'Explorer', icon: '🧭', description: 'Leverage Armada for 10+ Navy points.', section: 'Strategies', unlock: (c) => !!c.expansions.armada && (c.breakdown.navy || 0) >= 10 },
  { id: 'collegium_magnus', name: 'Collegium Magnus', icon: '🏫', description: 'Earn 10+ points from Guilds.', section: 'Strategies', unlock: (c) => (c.breakdown.guild || 0) >= 10 },
  { id: 'guild_master', name: 'Guild Master', icon: '🏵️', description: 'Win with Guilds among top two categories.', section: 'Strategies', unlock: (c) => c.rank === 1 && (c.breakdown.guild || 0) >= 8 && ((c.breakdown.guild || 0) >= (c.breakdown.civil || 0) || (c.breakdown.guild || 0) >= (c.breakdown.commercial || 0)) },
  { id: 'naval_commander', name: 'Naval Commander', icon: '⚓', description: 'Earn 15+ total from Navy/Military combined.', section: 'Strategies', unlock: (c) => (c.breakdown.navy || 0) + (c.breakdown.military || 0) >= 15 },

  { id: 'pacifist', name: 'Pacifist', icon: '🕊️', description: 'Score 0 points from Military.', section: 'Special', unlock: (c) => (c.breakdown.military || 0) === 0 },
  { id: 'balanced_victor', name: 'Renaissance Victor', icon: '⚖️', description: 'Win with no single category exceeding 40% of total.', section: 'Special', unlock: (c) => {
      const vals = [
        c.breakdown.military || 0,
        c.breakdown.science || 0,
        c.breakdown.civil || 0,
        c.breakdown.commercial || 0,
        c.breakdown.guild || 0,
        c.breakdown.wonder || 0,
        c.breakdown.navy || 0,
      ];
      const max = Math.max(...vals);
      return c.rank === 1 && max / Math.max(1, c.score) <= 0.4;
    } },
  { id: 'underdog', name: 'Underdog', icon: '🐺', description: 'Win with < 60 total points.', section: 'Special', unlock: (c) => c.rank === 1 && c.score < 60 },
];

// Auto-generate Wonder Victor badges
const WONDER_BADGES: Badge[] = WONDERS_DATABASE.map((w) => ({
  id: `wonder_victor_${w.id}`,
  name: `${w.name} Victor`,
  icon: '🏛️',
  description: `Win a game with ${w.name}.`,
  section: 'Wonders',
  unlock: (c) => c.rank === 1 && c.wonderBoardId === w.id,
}));

export const BADGES: Badge[] = [
  ...BASE_BADGES,
  ...WONDER_BADGES,
];

export const groupBadges = (ids: string[]) => {
  const set = new Set(ids);
  const unlocked = BADGES.filter((b) => set.has(b.id));
  const locked = BADGES.filter((b) => !set.has(b.id));
  return { unlocked, locked };
};

export const getBadgeById = (id: string) => BADGES.find((b) => b.id === id);

export const evaluateBadgeIdsForContext = (ctx: BadgeContext): string[] => {
  return BADGES.filter((b) => typeof b.unlock === 'function' ? !!b.unlock(ctx) : false).map((b) => b.id);
};

export const evaluateBadgesForContext = (ctx: BadgeContext): Badge[] => {
  const ids = new Set(evaluateBadgeIdsForContext(ctx));
  return BADGES.filter((b) => ids.has(b.id));
};

