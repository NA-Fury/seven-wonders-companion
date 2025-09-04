// data/scienceDatabase.ts
// Reference database for Science-related end-game modifiers and sources.
// This supports analysis and structured storage; scoring uses final symbol counts
// plus modifier tokens (choice, most-common+, replace-one) as captured via detailed mode.

export type ScienceModifierKind =
  | 'choice'          // add one symbol of your choice at end of game
  | 'mostCommonPlus'  // add one symbol matching your current most common symbol
  | 'replaceOne'      // replace one existing symbol with any other
  | 'neighborCopy';   // copy a symbol present in a neighbor's city (treated as choice)

export interface ScienceModifierSource {
  name: string;
  kind: ScienceModifierKind;
  age?: 1 | 2 | 3;
  expansion?: 'Base' | 'Cities' | 'Armada' | 'Islands' | 'Leaders' | 'Edifice';
  notes?: string;
}

export const SCIENCE_CHOICE_SOURCES: ScienceModifierSource[] = [
  { name: 'Babylon (Day) - Stage II', kind: 'choice', expansion: 'Base', notes: 'Gain your choice of a science symbol at end of game' },
  { name: 'Babylon (Night) - Stage II', kind: 'choice', expansion: 'Base' },
  { name: 'Carthage (Night) - Stage II', kind: 'choice', expansion: 'Edifice' },
  { name: 'Scientists Guild', kind: 'choice', age: 3, expansion: 'Base' },
  { name: 'Golden Archipelago', kind: 'choice', expansion: 'Islands' },
];

export const SCIENCE_MOST_COMMON_SOURCES: ScienceModifierSource[] = [
  { name: 'Enheduania (Leader)', kind: 'mostCommonPlus', expansion: 'Leaders' },
  { name: 'Cabinet of Explorers', kind: 'mostCommonPlus', age: 1, expansion: 'Armada' },
  { name: 'Navigation Firm', kind: 'mostCommonPlus', age: 2, expansion: 'Armada' },
  { name: 'Circle of Captains', kind: 'mostCommonPlus', age: 3, expansion: 'Armada' },
  { name: 'Emerald Archipelago', kind: 'mostCommonPlus', expansion: 'Islands' },
];

export const SCIENCE_REPLACE_ONE_SOURCES: ScienceModifierSource[] = [
  { name: 'Aganice (Leader)', kind: 'replaceOne', expansion: 'Leaders', notes: 'Replace 1 science symbol in your City with any symbol' },
];

export const SCIENCE_NEIGHBOR_COPY_SOURCES: ScienceModifierSource[] = [
  { name: 'Pigeonhole', kind: 'neighborCopy', age: 1, expansion: 'Cities' },
  { name: 'Band of Spies', kind: 'neighborCopy', age: 2, expansion: 'Cities' },
  { name: 'Torture Chamber', kind: 'neighborCopy', age: 3, expansion: 'Cities' },
];

// Convenience counters from selected source names (case-insensitive)
const norm = (s: string) => s.toLowerCase();

function countFrom(names: string[], list: ScienceModifierSource[]): number {
  const set = new Set(names.map(norm));
  return list.reduce((acc, src) => acc + (set.has(norm(src.name)) ? 1 : 0), 0);
}

export function countChoiceTokensFromSources(names: string[]): number {
  return countFrom(names, SCIENCE_CHOICE_SOURCES);
}

export function countMostCommonTokensFromSources(names: string[]): number {
  return countFrom(names, SCIENCE_MOST_COMMON_SOURCES);
}

export function hasReplaceOneFromSources(names: string[]): boolean {
  return countFrom(names, SCIENCE_REPLACE_ONE_SOURCES) > 0;
}

export function countNeighborCopiesFromSources(names: string[]): number {
  return countFrom(names, SCIENCE_NEIGHBOR_COPY_SOURCES);
}

