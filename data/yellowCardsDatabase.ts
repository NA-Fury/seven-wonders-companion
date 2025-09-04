// data/yellowCardsDatabase.ts
// Yellow (Commercial) cards reference + helpers for detailed mode scoring.

export type Age = 1 | 2 | 3;

export interface YellowCard {
  id: string;
  name: string;
  age: Age;
  // Whether this card contributes end-game VP; many yellow cards are coins/discounts only.
  endGameVP?: true;
  notes?: string[];
}

export interface YellowScoringContext {
  // Derived or entered counts for YOUR city
  yellowCount?: number;        // can be length of selected yellow card names
  brownCount?: number;
  greyCount?: number;
  redCount?: number;
  wonderStagesBuilt?: number;  // from Wonder detailed mode if available
  // Armada commercial level (yellow naval track)
  commercialLevel?: number;
}

export type YellowVPBreakdown = {
  name: string;
  vp: number;
  missing?: string[]; // list of missing fields required for this card to score
};

// Minimal list focused on end-game VP cards (others are coins/discounts only)
export const YELLOW_CARDS: YellowCard[] = [
  { id: 'tavern', name: 'Tavern', age: 1, notes: ['Coins only'] },
  { id: 'west_trading_post', name: 'West Trading Post', age: 1, notes: ['Discount only'] },
  { id: 'east_trading_post', name: 'East Trading Post', age: 1, notes: ['Discount only'] },
  { id: 'marketplace', name: 'Marketplace', age: 1, notes: ['Discount only'] },
  { id: 'caravansery', name: 'Caravansery', age: 2, notes: ['Resource production'] },
  { id: 'forum', name: 'Forum', age: 2, notes: ['Resource production'] },
  { id: 'vineyard', name: 'Vineyard', age: 1, notes: ['Coins by brown (you+neighbors)'] },
  { id: 'bazaar', name: 'Bazaar', age: 1, notes: ['Coins by grey (you+neighbors)'] },
  // End-game VP providers:
  { id: 'lighthouse', name: 'Lighthouse', age: 2, endGameVP: true, notes: ['1 VP per yellow in your City'] },
  { id: 'haven', name: 'Haven', age: 3, endGameVP: true, notes: ['1 VP per brown in your City'] },
  { id: 'chamber_of_commerce', name: 'Chamber of Commerce', age: 3, endGameVP: true, notes: ['2 VP per grey in your City'] },
  { id: 'ludus', name: 'Ludus', age: 3, endGameVP: true, notes: ['1 VP per red in your City'] },
  { id: 'arena', name: 'Arena', age: 3, endGameVP: true, notes: ['1 VP per Wonder stage in your City'] },
  // Armada (yellow) with end-game VP
  { id: 'port_customs', name: 'Port Customs', age: 3, endGameVP: true, notes: ['VP = 2 x commercial pot level'] },
  { id: 'pirate_crew', name: 'Pirate Crew', age: 3, notes: ['Gain 4 VP. Coins, others lose coins by commercial level'] },
  // Armada coins/tax cards
  { id: 'pirate_hideout', name: 'Pirate Hideout', age: 1, notes: ['Coins, others lose coins by commercial level'] },
  { id: 'pirates_den', name: "Pirate's Den", age: 2, notes: ['Coins, others lose coins by commercial level'] },
  { id: 'eastern_emporium', name: 'Eastern Emporium', age: 2, notes: ['Discount'] },
  { id: 'western_emporium', name: 'Western Emporium', age: 3, notes: ['Discount'] },
];

// Simple index and search
const norm = (s: string) => s.trim().toLowerCase();

export function getYellowByName(name: string): YellowCard | undefined {
  const q = norm(name);
  return YELLOW_CARDS.find((c) => norm(c.name) === q);
}

export function searchYellowCards(query: string, limit = 10): YellowCard[] {
  const q = norm(query);
  if (!q) return [];
  const scored = YELLOW_CARDS.map((card) => {
    const hay = `${card.name} ${(card.notes || []).join(' ')}`.toLowerCase();
    const idx = hay.indexOf(q);
    return { card, score: idx < 0 ? 9999 : idx };
  })
    .filter((x) => x.score !== 9999)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.card);
  return scored.slice(0, limit);
}

// Compute end-game VP for a single yellow card using provided context
export function yellowCardEndGameVP(card: YellowCard, ctx: YellowScoringContext): YellowVPBreakdown {
  if (!card.endGameVP) return { name: card.name, vp: 0 };

  const missing: string[] = [];
  let vp = 0;
  switch (card.id) {
    case 'lighthouse':
      if (ctx.yellowCount == null) missing.push('yellowCount');
      vp = ctx.yellowCount || 0;
      break;
    case 'haven':
      if (ctx.brownCount == null) missing.push('brownCount');
      vp = ctx.brownCount || 0;
      break;
    case 'chamber_of_commerce':
      if (ctx.greyCount == null) missing.push('greyCount');
      vp = ctx.greyCount || 0;
      break;
    case 'ludus':
      if (ctx.redCount == null) missing.push('redCount');
      vp = ctx.redCount || 0;
      break;
    case 'arena':
      if (ctx.wonderStagesBuilt == null) missing.push('wonderStagesBuilt');
      vp = ctx.wonderStagesBuilt || 0;
      break;
    case 'port_customs':
      if (ctx.commercialLevel == null) missing.push('commercialLevel');
      vp = (ctx.commercialLevel || 0) * 2;
      break;
    default:
      vp = 0;
  }
  return { name: card.name, vp, missing: missing.length ? missing : undefined };
}

export function sumYellowEndGameVP(selectedNames: string[], ctx: YellowScoringContext): { total: number; breakdown: YellowVPBreakdown[] } {
  const breakdown: YellowVPBreakdown[] = [];
  let total = 0;
  for (const name of selectedNames) {
    const card = getYellowByName(name);
    if (!card) continue;
    const b = yellowCardEndGameVP(card, ctx);
    breakdown.push(b);
    total += b.vp;
  }
  return { total, breakdown };
}

