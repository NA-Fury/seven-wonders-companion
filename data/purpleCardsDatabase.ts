// data/purpleCardsDatabase.ts
// Guilds (Purple) database for later detailed-mode scoring integration.

export interface PurpleCard {
  id: string;
  name: string;
  notes?: string[];
}

export const PURPLE_CARDS: PurpleCard[] = [
  { id: 'workers_guild', name: "Workers Guild", notes: ['VP per brown in neighbors'] },
  { id: 'craftsmens_guild', name: "Craftsmens Guild", notes: ['VP per grey in neighbors'] },
  { id: 'magistrates_guild', name: "Magistrates Guild", notes: ['VP per blue in neighbors'] },
  { id: 'traders_guild', name: "Traders Guild", notes: ['VP per yellow in neighbors'] },
  { id: 'spies_guild', name: "Spies Guild", notes: ['VP per red in neighbors'] },
  { id: 'philosophers_guild', name: "Philosophers Guild", notes: ['VP per green in neighbors'] },
  { id: 'shipowners_guild', name: "Shipowners Guild", notes: ['VP per brown/grey/purple in your City'] },
  { id: 'scientists_guild', name: "Scientists Guild", notes: ['Choice science symbol at end of game'] },
  { id: 'decorators_guild', name: "Decorators Guild", notes: ['VP only if all Wonder stages built'] },
  { id: 'builders_guild', name: "Builders Guild", notes: ['VP per Wonder stage (you+neighbors)'] },
  { id: 'gamers_guild', name: "Gamers Guild", notes: ['VP per 3 coins in neighbors'] },
  { id: 'architects_guild', name: "Architects Guild", notes: ['VP per purple in neighbors'] },
  { id: 'shadow_guild', name: "Shadow Guild", notes: ['VP per black in neighbors'] },
  { id: 'diplomats_guild', name: "Diplomats Guild", notes: ['VP per leader in neighbors'] },
  { id: 'engineers_guild', name: "Engineers Guild", notes: ['VP if you have participation pawns age I+II+III'] },
  { id: 'forgers_guild', name: "Forgers Guild", notes: ['Others lose coins; VP gained'] },
];

const norm = (s: string) => s.trim().toLowerCase();

export function getPurpleByName(name: string): PurpleCard | undefined {
  const q = norm(name);
  return PURPLE_CARDS.find((c) => norm(c.name) === q);
}

export function searchPurpleCards(query: string, limit = 10): PurpleCard[] {
  const q = norm(query);
  if (!q) return [];
  const scored = PURPLE_CARDS.map((card) => {
    const hay = `${card.name} ${(card.notes || []).join(' ')}`.toLowerCase();
    const idx = hay.indexOf(q);
    return { card, score: idx < 0 ? 9999 : idx };
  })
    .filter((x) => x.score !== 9999)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.card);
  return scored.slice(0, limit);
}

