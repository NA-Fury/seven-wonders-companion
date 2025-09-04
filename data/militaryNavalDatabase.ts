// data/militaryNavalDatabase.ts
// Reference lists for Military/Naval strength sources and Diplomacy/Boarding effects.
// These are not required for the scoring engine, but provide searchable metadata
// and a single place to expand future auto-derivation from selected cards.

export type SourceKind = 'Card' | 'WonderStage' | 'Leader' | 'Island' | 'Project';

export interface MilitarySource {
  name: string;
  kind: SourceKind;
  age?: 1 | 2 | 3;
  militaryStrength?: number; // shields from this source
  grantsDiplomacy?: boolean; // Cities: removes from Military conflicts (per event/token)
  boarding?: 'right-right' | 'left-left'; // Armada: additional conflict (ignore diplomacy)
  notes?: string;
}

export interface NavalSource {
  name: string;
  kind: SourceKind;
  age?: 1 | 2 | 3;
  navalStrength?: number; // naval strength from this source
  canSkipNaval?: boolean;  // Forgotten Oasis opt-out
  notes?: string;
}

// --- Military: red cards and others that add shields ---
export const MILITARY_SOURCES: MilitarySource[] = [
  // Base red cards (Age I)
  { name: 'Guard Tower', kind: 'Card', age: 1, militaryStrength: 1 },
  { name: 'Barracks', kind: 'Card', age: 1, militaryStrength: 1 },
  { name: 'Stockade', kind: 'Card', age: 1, militaryStrength: 1 },

  // Base red cards (Age II)
  { name: 'Stables', kind: 'Card', age: 2, militaryStrength: 2 },
  { name: 'Archery Range', kind: 'Card', age: 2, militaryStrength: 2 },
  { name: 'Walls', kind: 'Card', age: 2, militaryStrength: 2 },
  { name: 'Training Ground', kind: 'Card', age: 2, militaryStrength: 2 },

  // Base red cards (Age III)
  { name: 'Arsenal', kind: 'Card', age: 3, militaryStrength: 3 },
  { name: 'Siege Workshop', kind: 'Card', age: 3, militaryStrength: 3 },
  { name: 'Fortifications', kind: 'Card', age: 3, militaryStrength: 3 },
  { name: 'Circus', kind: 'Card', age: 3, militaryStrength: 3 },
  { name: 'Castrum', kind: 'Card', age: 3, militaryStrength: 3 },

  // Cities: coin-cost red cards
  { name: 'Militia', kind: 'Card', age: 1, militaryStrength: 1, notes: 'Costs 3 coins' },
  { name: 'Mercenaries', kind: 'Card', age: 2, militaryStrength: 3, notes: 'Costs 4 coins + Papyrus' },
  { name: 'Contingent', kind: 'Card', age: 3, militaryStrength: 5, notes: 'Costs 5 coins + Cloth' },

  // Leaders (immediate strength)
  { name: 'Hannibal', kind: 'Leader', militaryStrength: 1 },
  { name: 'Caesar', kind: 'Leader', militaryStrength: 2 },

  // Wonders (examples from provided text)
  { name: 'Rhodos (Day) - Stage II', kind: 'WonderStage', militaryStrength: 2 },
  { name: 'Rhodos (Night) - Stage I', kind: 'WonderStage', militaryStrength: 1, notes: '+3 VP' },
  { name: 'Rhodos (Night) - Stage II', kind: 'WonderStage', militaryStrength: 1, notes: '+4 VP' },
  { name: 'Carthage (Day) - Stage II', kind: 'WonderStage', militaryStrength: 1, notes: '+2 VP' },
  { name: 'Carthage (Night) - Stage II', kind: 'WonderStage', militaryStrength: 2 },
  { name: 'Siracusa (Day) - Stage III', kind: 'WonderStage', militaryStrength: 1, notes: 'Also advance fleet' },
  { name: 'Siracusa (Night) - Stage III', kind: 'WonderStage', militaryStrength: 1, notes: '+1 Naval Strength' },

  // Armada red with Boarding effects
  { name: 'Pontoon', kind: 'Card', age: 1, militaryStrength: 1, boarding: 'right-right', notes: 'Give Boarding token to player right of your right neighbor' },
  { name: 'Ballista', kind: 'Card', age: 2, militaryStrength: 2, boarding: 'left-left', notes: 'Give Boarding token to player left of your left neighbor' },
  { name: 'Pier', kind: 'Card', age: 3, militaryStrength: 3, boarding: 'right-right', notes: 'Give Boarding token to player right of your right neighbor' },

  // Islands adding military
  { name: 'Bronze Island', kind: 'Island', age: 1, militaryStrength: 1 },
  { name: 'Iron Oasis', kind: 'Island', age: 2, militaryStrength: 2 },
  { name: 'Scarlet Archipelago', kind: 'Island', age: 3, militaryStrength: 3 },
];

// --- Diplomacy sources (Cities) ---
export const DIPLOMACY_SOURCES: MilitarySource[] = [
  { name: 'Residence', kind: 'Card', age: 1, grantsDiplomacy: true, notes: '+1 VP' },
  { name: 'Consulate', kind: 'Card', age: 2, grantsDiplomacy: true, notes: '+2 VP' },
  { name: 'Embassy', kind: 'Card', age: 3, grantsDiplomacy: true, notes: '+3 VP' },
  { name: 'Aspasia', kind: 'Leader', grantsDiplomacy: true, notes: '+2 VP' },
  { name: 'Byzantium (Day) - Stage II', kind: 'WonderStage', grantsDiplomacy: true, notes: '+4 VP' },
  { name: 'Byzantium (Night) - Stage I', kind: 'WonderStage', grantsDiplomacy: true, notes: '+4 VP' },
  { name: 'Byzantium (Night) - Stage II', kind: 'WonderStage', grantsDiplomacy: true, notes: '+6 VP' },
];

// --- Naval sources (Armada, Islands, Wonders) ---
export const NAVAL_SOURCES: NavalSource[] = [
  // Cards
  { name: 'Coastal Defenses', kind: 'Card', age: 1, navalStrength: 1 },
  { name: 'Fortified Post', kind: 'Card', age: 2, navalStrength: 2 },
  { name: 'Coastal Fortifications', kind: 'Card', age: 3, navalStrength: 3 },

  // Islands
  { name: 'Whistling Island', kind: 'Island', age: 1, navalStrength: 1 },
  { name: 'Windy Oasis', kind: 'Island', age: 2, navalStrength: 2 },
  { name: 'Breezy Archipelago', kind: 'Island', age: 3, navalStrength: 3 },
  { name: 'Forgotten Oasis', kind: 'Island', age: 2, canSkipNaval: true, notes: 'Choose to skip each Naval Conflict resolution' },

  // Wonders
  { name: 'Siracusa (Day) - Stage I', kind: 'WonderStage', navalStrength: 1, notes: 'Also advance a fleet' },
  { name: 'Siracusa (Night) - Stage III', kind: 'WonderStage', navalStrength: 1, notes: '+1 Military Strength' },
];

