// data/blackCardsDatabase.ts
// Cities (Black) cards database + helpers for detailed-mode scoring.

export type Age = 1 | 2 | 3;

export interface BlackCard {
  id: string;
  name: string;
  age: Age;
  // End-game VP contribution pattern (direct). Many black cards have only immediate effects.
  endGame?:
    | { type: 'perOwnBlack' }                              // Secret Network (VP per your black cards)
    | { type: 'perMvTokensTotal' }                         // Slave Market (VP per your total Military Victory tokens)
    | { type: 'perMvTokensAge'; age: 2 | 3 };              // Guardhouse (Age II), Prison (Age III)
  // Non-VP end-game effects for synergy (not scored here):
  scienceNeighborCopy?: boolean; // Pigeonhole/Band of Spies/Torture Chamber
  diplomacy?: boolean;           // Residence/Consulate/Embassy (Age-based token, not scored here)
  directVP?: number;             // printed immediate VP
  notes?: string[];
}

export interface BlackScoringContext {
  ownBlackCount?: number;       // number of black cards you built (selected count or manual override)
  mvTokensTotal?: number;       // total military victory tokens you have
  mvTokensAge2?: number;        // number of Age II MV tokens
  mvTokensAge3?: number;        // number of Age III MV tokens
}

export type BlackVPBreakdown = { name: string; vp: number; missing?: string[] };

export const BLACK_CARDS: BlackCard[] = [
  // Age I
  { id: 'smugglers_cache', name: "Smuggler's Cache", age: 1 },
  { id: 'west_clandestine_wharf', name: 'West Clandestine Wharf', age: 1 },
  { id: 'east_clandestine_wharf', name: 'East Clandestine Wharf', age: 1 },
  { id: 'secret_warehouse', name: 'Secret Warehouse', age: 1 },
  { id: 'city_gates', name: 'City Gates', age: 1, directVP: 4 },
  { id: 'customs', name: 'Customs', age: 1, directVP: 4 },
  { id: 'dive', name: 'Dive', age: 1 },
  { id: 'opium_stash', name: 'Opium Stash', age: 1 },
  { id: 'hideout', name: 'Hideout', age: 1, directVP: 2 },
  { id: 'raider_camp', name: 'Raider Camp', age: 1 }, // Gain an Age I Military victory token. Your neighbors each take a Debt. (Here add 1 VP to the Detailed Military Score and make a note of it so user can see it being applied)
  { id: 'militia_black', name: 'Militia (Black)', age: 1 },
  { id: 'residence', name: 'Residence', age: 1, diplomacy: true, directVP: 1 },
  { id: 'pigeonhole', name: 'Pigeonhole', age: 1, scienceNeighborCopy: true },

  // Age II
  { id: 'black_market', name: 'Black Market', age: 2 },
  { id: 'architect_firm', name: 'Architect Firm', age: 2, directVP: 2 },
  { id: 'tabularium', name: 'Tabularium', age: 2, directVP: 6 },
  { id: 'trade_center', name: 'Trade Center', age: 2, directVP: 6 },
  { id: 'gambling_den', name: 'Gambling Den', age: 2 },
  { id: 'opium_den', name: 'Opium Den', age: 2 },
  { id: 'lair', name: 'Lair', age: 2, directVP: 3 },
  { id: 'sepulcher', name: 'Sepulcher', age: 2 }, // Gain 4 VP. All players except you lose 1 Coin per Military Victory token they have.
  { id: 'raider_fort', name: 'Raider Fort', age: 2 }, // Gain an Age II Military victory token. Your neighbors each take a Debt. (Here add 3 VP to the Detailed Military Score and make a note of it so user can see it being applied)
  { id: 'guardhouse_black', name: 'Guardhouse (Black)', age: 2, endGame: { type: 'perMvTokensAge', age: 2 } }, // At game end, gain 3 VP for each Age II Military Victory token you have. (Syncronize with Military scoring and make a note of it so user can see it being applied as well as See if RAIDER FORT is selected and add 3 VP per token)
  { id: 'mercenaries_black', name: 'Mercenaries (Black)', age: 2 },
  { id: 'consulate', name: 'Consulate', age: 2, diplomacy: true }, // Gain 2 VP. Take a Diplomacy token.
  { id: 'band_of_spies', name: 'Band of Spies', age: 2, scienceNeighborCopy: true },
  { id: 'forging_agency', name: 'Forging Agency', age: 2 },

  // Age III
  { id: 'capitol_black', name: 'Capitol (Black)', age: 3, directVP: 8 },
  { id: 'mint_black', name: 'Mint (Black)', age: 3, directVP: 8 },
  { id: 'opium_distillery', name: 'Opium Distillery', age: 3 },
  { id: 'brotherhood', name: 'Brotherhood', age: 3, directVP: 4 },
  { id: 'chamber_of_builders', name: 'Chamber of Builders', age: 3, directVP: 4 },
  { id: 'cenotaph', name: 'Cenotaph', age: 3, directVP: 5 },
  { id: 'secret_network', name: 'Secret Network', age: 3, endGame: { type: 'perOwnBlack' } }, // Gain 1 Coin for each black card in your City. At game end, Gain 1 VP for each black card in your City.
  { id: 'slave_market', name: 'Slave Market', age: 3, endGame: { type: 'perMvTokensTotal' } }, // Gain 1 Coin for each Military Victory token you have. At game end, Gain 1 VP for each Military Victory token you have. (Syncronize with Military scoring and make a note of it so user can see it being applied as well)
  { id: 'raider_garrison', name: 'Raider Garrison', age: 3 }, // // Gain an Age III Military victory token. Your neighbors each take a Debt. (Here add 5 VP to the Detailed Military Score and make a note of it so user can see it being applied)
  { id: 'prison', name: 'Prison', age: 3, endGame: { type: 'perMvTokensAge', age: 3 } }, // At game end, gain 4 VP for each Age III Military Victory token you have. (Syncronize with Military scoring and make a note of it so user can see it being applied as well as See if RAIDER GARRISON is selected and add 3 VP per token)
  { id: 'contingient', name: 'Contingient', age: 3 },
  { id: 'embassy_black', name: 'Embassy (Black)', age: 3, diplomacy: true, directVP: 2 },
  { id: 'memorial', name: 'Memorial', age: 3 },
  { id: 'torture_chamber', name: 'Torture Chamber', age: 3, scienceNeighborCopy: true },
];

const norm = (s: string) => s.trim().toLowerCase();

export function searchBlackCards(query: string, limit = 10): BlackCard[] {
  const q = norm(query);
  if (!q) return [];
  const scored = BLACK_CARDS.map((card) => {
    const hay = `${card.name} ${(card.notes || []).join(' ')}`.toLowerCase();
    const idx = hay.indexOf(q);
    return { card, score: idx < 0 ? 9999 : idx };
  })
    .filter((x) => x.score !== 9999)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.card);
  return scored.slice(0, limit);
}

export function getBlackByName(name: string): BlackCard | undefined {
  const q = norm(name);
  return BLACK_CARDS.find((c) => norm(c.name) === q);
}

export function sumBlackEndGameVP(selectedNames: string[], ctx: BlackScoringContext): { total: number; breakdown: BlackVPBreakdown[] } {
  let total = 0;
  const breakdown: BlackVPBreakdown[] = [];
  for (const name of selectedNames) {
    const card = getBlackByName(name);
    if (!card) continue;
    // Direct VP
    if (typeof card.directVP === 'number') {
      breakdown.push({ name: card.name, vp: card.directVP });
      total += card.directVP;
    }
    if (!card.endGame) continue;
    let vp = 0;
    const missing: string[] = [];
    switch (card.endGame.type) {
      case 'perOwnBlack':
        if (ctx.ownBlackCount == null) missing.push('ownBlackCount');
        vp = ctx.ownBlackCount || 0;
        break;
      case 'perMvTokensTotal':
        if (ctx.mvTokensTotal == null) missing.push('mvTokensTotal');
        vp = ctx.mvTokensTotal || 0;
        break;
      case 'perMvTokensAge':
        if (card.endGame.age === 2) {
          if (ctx.mvTokensAge2 == null) missing.push('mvTokensAge2');
          vp = ctx.mvTokensAge2 || 0;
        } else {
          if (ctx.mvTokensAge3 == null) missing.push('mvTokensAge3');
          vp = ctx.mvTokensAge3 || 0;
        }
        break;
    }
    breakdown.push({ name: card.name, vp, missing: missing.length ? missing : undefined });
    total += vp;
  }
  return { total, breakdown };
}
