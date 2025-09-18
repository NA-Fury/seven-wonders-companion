// data/badges.ts - Badge catalog + evaluation rules
import type { Expansions } from '../store/setupStore';
import { WONDERS_DATABASE } from './wondersDatabase';
import { RECOMMENDED_BY_WONDER as _REC_RAW } from './leadersDatabase';

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
  // Optional enrichments used by synergy badges
  leadersRecruited?: string[];
};

// Normalize helper for robust text matching
const norm = (s: string) => s?.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Normalized map of recommended leaders per wonder name
const RECOMMENDED_BY_WONDER_NORM: Record<string, { day?: string[]; night?: string[] }> = (() => {
  const out: Record<string, { day?: string[]; night?: string[] }> = {};
  Object.entries(_REC_RAW || {}).forEach(([k, v]) => { out[norm(k)] = v; });
  return out;
})();

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

// Additional badges: Leaders, Cities, Naval, Island, Edifice, and synergies
const EXTRA_BADGES: Badge[] = [
  // Category focus
  { id: 'leaders_icon', name: 'Council Favorite', icon: '👑', description: 'Earn 15+ points from Leaders.', section: 'Strategies', unlock: (c) => (c.breakdown.leaders || 0) >= 15 },
  { id: 'cities_magnate', name: 'Shadow Magnate', icon: '🕶️', description: 'Earn 15+ points from Cities.', section: 'Strategies', unlock: (c) => (c.breakdown.cities || 0) >= 15 },
  { id: 'naval_warlord', name: 'Sea Warlord', icon: '🚢', description: 'Earn 12+ from Naval Conflicts.', section: 'Strategies', unlock: (c) => !!c.expansions.armada && (c.breakdown.navy || 0) >= 12 },
  { id: 'island_hopper', name: 'Island Hopper', icon: '🏝️', description: 'Earn 12+ points from Islands.', section: 'Strategies', unlock: (c) => (c.breakdown.islands || 0) >= 12 },
  { id: 'edifice_ally', name: 'Monumental Ally', icon: '🏛️', description: 'Earn 9+ points from Edifice contributions.', section: 'Strategies', unlock: (c) => (c.breakdown.edifice || 0) >= 9 },

  // Synergy: Cynisca + Tomyris both recruited
  { id: 'twin_shields', name: 'Twin Shields', icon: '🛡️', description: 'Recruit Cynisca and Tomyris together.', section: 'Special', unlock: (c) => {
      const names = (c.leadersRecruited || []).map(norm);
      return names.includes(norm('Cynisca')) && names.includes(norm('Tomyris'));
    } },

  // Synergy: Wonder + recommended leaders
  { id: 'chosen_by_the_wonder', name: 'Chosen by the Wonder', icon: '✨', description: 'Recruit a recommended Leader for your Wonder.', section: 'Special', unlock: (c) => {
      if (!c.wonderBoardId) return false;
      const w = WONDERS_DATABASE.find(w => w.id === c.wonderBoardId);
      if (!w) return false;
      let rec = RECOMMENDED_BY_WONDER_NORM[norm(w.name)] || {};
      if (!rec) {
        const fb: Record<string,string> = { ephesos: '�phesos', olympia: 'Olymp�a', rhodos: 'Rh�dos' };
        const fk = fb[norm(w.name)];
        if (fk && (_REC_RAW as any)[fk]) rec = (_REC_RAW as any)[fk];
      }
      const candidates = new Set([...(rec.day || []), ...(rec.night || [])].map(norm));
      return (c.leadersRecruited || []).map(norm).some(n => candidates.has(n));
    } },
  { id: 'destinys_favorite', name: "Destiny's Favorite", icon: '🌟', description: 'Recruit 2+ recommended Leaders for your Wonder.', section: 'Special', unlock: (c) => {
      if (!c.wonderBoardId) return false;
      const w = WONDERS_DATABASE.find(w => w.id === c.wonderBoardId);
      if (!w) return false;
      let rec = RECOMMENDED_BY_WONDER_NORM[norm(w.name)] || {};
      if (!rec) {
        const fb: Record<string,string> = { ephesos: '�phesos', olympia: 'Olymp�a', rhodos: 'Rh�dos' };
        const fk = fb[norm(w.name)];
        if (fk && (_REC_RAW as any)[fk]) rec = (_REC_RAW as any)[fk];
      }
      const candidates = new Set([...(rec.day || []), ...(rec.night || [])].map(norm));
      const count = (c.leadersRecruited || []).map(norm).filter(n => candidates.has(n)).length;
      return count >= 2;
    } },
];

const ALL_BADGES: Badge[] = [
  ...BASE_BADGES,
  ...EXTRA_BADGES,
  ...WONDER_BADGES,
];

// Ensure even total number of badges by optional padding
const PAD: Badge[] = (ALL_BADGES.length % 2 === 1)
  ? [{ id: 'even_keeper', name: 'Curator’s Seal', icon: '🔖', description: 'Collection balanced to an even set.', section: 'Special' }]
  : [];

export const BADGES: Badge[] = [...ALL_BADGES, ...PAD];

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
