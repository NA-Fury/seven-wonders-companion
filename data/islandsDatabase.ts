// /data/islandsDatabase.ts
// Armada "Island cards" mini-DB with rich metadata for synergy analysis,
// plus helper APIs mirroring the leaders database ergonomics.

export type IslandLevel = 1 | 2 | 3;

export interface IslandImmediate {
  vp?: number;                        // direct, immediate VP printed on card (auto-scored NOW)
  coins?: number;                     // immediate coins (stored only)
  military?: number;                  // immediate shields
  naval?: number;                     // immediate naval strength
  advanceFleet?: Array<{
    color: 'blue' | 'yellow' | 'green' | 'red' | 'any';
    spaces: number;                   // how many spaces
    distinct?: boolean;               // whether different fleets are required
  }>;
  resourceChoice?: Array<'wood' | 'ore' | 'stone' | 'clay' | 'glass' | 'papyrus' | 'cloth'>; // produces one of...
  immunity?: {
    taxesPirates?: boolean;           // Foggy Island
    canSkipNavalConflict?: boolean;   // Forgotten Oasis
  };
  discounts?: {
    navalConstructionMinus?: number;  // Ancient Oasis
  };
  neighborsLose?: {
    byCommercialLevel?: boolean;      // Pirate Oasis
    amount?: number;                  // generic fallback
  };
  gainOnFleetAdvance?: { coins?: number }; // Wonderous Oasis
}

export interface IslandEndGame {
  vpFlat?: number;                    // fixed end-game VP (Royal Archipelago)
  scienceChoice?: boolean;            // Golden Archipelago: choose one science symbol
  scienceExtraMost?: boolean;         // Emerald Archipelago: +1 most common science symbol
  vpPer?: Array<
    | { type: 'islandCard'; vp: number }                 // Sheltered Archipelago: 2 VP per Island
    | { type: 'commercialLevel'; mult: number }          // Lush Archipelago: 2× commercial level
    | { type: 'color'; color:
          'brown'|'grey'|'blue'|'yellow'|'red'|'green'|'purple'; vpEach: number } // Rainbow Archipelago
  >;
}

export interface IslandCard {
  id: string;               // slug id
  name: string;
  level: IslandLevel;
  immediate?: IslandImmediate;
  endGame?: IslandEndGame;
  notes?: string[];         // synergy & analysis notes
  tags?: string[];          // for search
}

// Helpers
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const I = (p: Omit<IslandCard, 'id'>): IslandCard => ({ id: slug(p.name), ...p });

// Database
export const ISLANDS: IslandCard[] = [
  // Level 1
  I({ name: 'Overgrown Island', level: 1,
      immediate: { resourceChoice: ['wood','ore'] },
      notes: ['Resource smoothing (brown).'],
      tags: ['resource','wood','ore'] }),
  I({ name: 'Virgin Island', level: 1,
      immediate: { resourceChoice: ['stone','clay'] },
      notes: ['Resource smoothing (brown).'],
      tags: ['resource','stone','clay'] }),
  I({ name: 'Bronze Island', level: 1,
      immediate: { military: 1 },
      notes: ['Early military tempo.'],
      tags: ['military','red'] }),
  I({ name: 'Whistling Island', level: 1,
      immediate: { naval: 1 },
      notes: ['Naval strength bump.'],
      tags: ['naval','armada'] }),
  I({ name: 'Foggy Island', level: 1,
      immediate: { immunity: { taxesPirates: true } },
      notes: ['Immune to Taxes/Pirates coin loss. Pairs with Cities/Armada tax pressure.'],
      tags: ['tax','pirates','cities','armada'] }),
  I({ name: 'Topaz Island (Blue)', level: 1,
      immediate: { advanceFleet: [{ color: 'blue', spaces: 1 }] },
      notes: ['Free Blue fleet advance.'],
      tags: ['fleet','blue'] }),
  I({ name: 'Topaz Island (Yellow)', level: 1,
      immediate: { advanceFleet: [{ color: 'yellow', spaces: 1 }] },
      notes: ['Free Yellow fleet advance.'],
      tags: ['fleet','yellow'] }),
  I({ name: 'Lost Island', level: 1,
      immediate: { advanceFleet: [{ color: 'any', spaces: 1 }] },
      notes: ['Advance any fleet when building a Wonder stage (triggered effect).'],
      tags: ['fleet','wonder'] }),
  I({ name: 'Inhabited Island', level: 1,
      immediate: { vp: 3 },
      notes: ['Direct +3 VP (auto-scored).'],
      tags: ['vp'] }),

  // Level 2
  I({ name: 'Abandoned Oasis', level: 2,
      immediate: { resourceChoice: ['glass','papyrus','cloth'] },
      notes: ['Grey resource smoothing.'],
      tags: ['resource','grey','glass','papyrus','cloth'] }),
  I({ name: 'Iron Oasis', level: 2,
      immediate: { military: 2 },
      notes: ['Moderate military spike.'],
      tags: ['military'] }),
  I({ name: 'Windy Oasis', level: 2,
      immediate: { naval: 2 },
      notes: ['Moderate naval spike.'],
      tags: ['naval'] }),
  I({ name: 'Forgotten Oasis', level: 2,
      immediate: { immunity: { canSkipNavalConflict: true } },
      notes: ['Choose to skip Naval Conflicts each resolution.'],
      tags: ['naval','conflict'] }),
  I({ name: 'Ancient Oasis', level: 2,
      immediate: { discounts: { navalConstructionMinus: 1 } },
      notes: ['-1 resource to each Naval Construction.'],
      tags: ['discount','naval construction'] }),
  I({ name: 'Stormy Oasis', level: 2,
      immediate: { advanceFleet: [{ color: 'any', spaces: 1, distinct: true }, { color: 'any', spaces: 1, distinct: true }] },
      notes: ['Advance two different fleets one space each.'],
      tags: ['fleet'] }),
  I({ name: 'Wonderous Oasis', level: 2,
      immediate: { gainOnFleetAdvance: { coins: 1 } },
      notes: ['+1 coin each time YOU advance a fleet.'],
      tags: ['coins','fleet'] }),
  I({ name: 'Oasis of Statues', level: 2,
      immediate: { vp: 5 },
      notes: ['Direct +5 VP (auto-scored).'],
      tags: ['vp'] }),
  I({ name: 'Pirate Oasis', level: 2,
      immediate: { vp: 3, neighborsLose: { byCommercialLevel: true } },
      notes: ['Direct +3 VP (auto-scored) and neighbors lose coins = their yellow level.'],
      tags: ['vp','tax','commercial'] }),

  // Level 3
  I({ name: 'Scarlet Archipelago', level: 3,
      immediate: { military: 3 },
      notes: ['Big military spike.'],
      tags: ['military'] }),
  I({ name: 'Breezy Archipelago', level: 3,
      immediate: { naval: 3 },
      notes: ['Big naval spike.'],
      tags: ['naval'] }),
  I({ name: 'Torrential Archipelago', level: 3,
      immediate: { advanceFleet: [{ color: 'any', spaces: 1, distinct: true }, { color: 'any', spaces: 1, distinct: true }, { color: 'any', spaces: 1, distinct: true }] },
      notes: ['Advance three different fleets one space each.'],
      tags: ['fleet'] }),
  I({ name: 'Golden Archipelago', level: 3,
      endGame: { scienceChoice: true },
      notes: ['End-game: choose one science symbol (set completer). Great for Babylon/Halikarnassos.'],
      tags: ['science','end game'] }),
  I({ name: 'Emerald Archipelago', level: 3,
      endGame: { scienceExtraMost: true },
      notes: ['End-game: +1 of your most common science symbol.'],
      tags: ['science','end game'] }),
  I({ name: 'Royal Archipelago', level: 3,
      endGame: { vpFlat: 7 },
      notes: ['End-game: +7 VP (stored; not auto-scored NOW).'],
      tags: ['vp','end game'] }),
  I({ name: 'Lush Archipelago', level: 3,
      endGame: { vpPer: [{ type: 'commercialLevel', mult: 2 }] },
      notes: ['End-game: 2 × your yellow track level.'],
      tags: ['commercial','end game'] }),
  I({ name: 'Rainbow Archipelago', level: 3,
      endGame: { vpPer: [{ type: 'color', color: 'blue', vpEach: 1 }] }, // color chosen later – store meta
      notes: ['End-game: choose a color; +1 VP per card of that color.'],
      tags: ['end game','set scoring'] }),
  I({ name: 'Sheltered Archipelago', level: 3,
      endGame: { vpPer: [{ type: 'islandCard', vp: 2 }] },
      notes: ['End-game: +2 VP per Island you own (including itself).'],
      tags: ['end game','islands'] }),
];

// Synergy notes (global)
export const ISLANDS_SYNERGY_NOTES = [
  'Wonders that often advance Green fleet (e.g., Babylon, Halikarnassos) naturally see more Islands.',
  'Siracusa can advance fleets via Wonder effects, accelerating Island access.',
];

// --- Query helpers (same ergonomics as leadersDatabase) ---

export function getIslandByName(name: string): IslandCard | null {
  const norm = name.trim().toLowerCase();
  return ISLANDS.find(i => i.name.toLowerCase() === norm) || null;
}

export function searchIslands(query: string, limit = 10): IslandCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = ISLANDS.map(card => {
    const hay = [
      card.name,
      ...(card.tags || []),
      ...(card.notes || []),
      card.level.toString(),
    ].join(' ').toLowerCase();
    const idx = hay.indexOf(q);
    return { card, score: idx < 0 ? 9999 : idx };
  }).filter(x => x.score !== 9999)
    .sort((a,b) => a.score - b.score)
    .map(x => x.card);
  return scored.slice(0, limit);
}

// Sum ONLY immediate/direct VP (what we auto-score "for NOW")
export function sumImmediateIslandVP(names: string[]): number {
  return names.reduce((sum, n) => {
    const card = getIslandByName(n);
    return sum + (card?.immediate?.vp ?? 0);
  }, 0);
}
