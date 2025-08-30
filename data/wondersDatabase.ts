// data/wondersDatabase.ts
// Updated: precise Wonder data (Base + Leaders + Cities + Armada + Edifice) and
// added structured metadata about Edifice/Armada interactions for deep analysis.
// NOTE: Promotional wonders are intentionally excluded.

export type Resource = 'Wood' | 'Stone' | 'Clay' | 'Ore' | 'Glass' | 'Loom' | 'Papyrus' | 'Coin';

export interface ResourceCost {
  resource: Resource;
  amount: number;
}

export interface StageEffect {
  type: 'Points' | 'Resource' | 'Military' | 'Commerce' | 'Science' | 'Special' | 'Naval';
  value?: number;           // Points, Coins, Shields, Naval Strength (context by type)
  description: string;      // Human-readable effect text
}

export interface WonderStage {
  cost: ResourceCost[] | { coins: number }; // Petra etc. use coin costs
  effect: StageEffect;
  points?: number;          // Some stages award VP directly (also echoed in effect.value when type==='Points')
}

export interface WonderSide {
  name: string;
  stages: WonderStage[];    // Ordered left→right, except where noted (e.g., Siracusa can be built in any order)
  specialAbility?: string;  // Side-wide passive or setup rule
  points?: number;          // Optional summary of fixed VP on the side (not required)
  imageUrl?: string;
}

export interface WonderEdificeMeta {
  stagesDay: number;
  stagesNight: number;
  canParticipateAllAgesDay: boolean;   // true if ≥3 stages
  canParticipateAllAgesNight: boolean; // true if ≥3 stages
  synergy: 'Disadvantaged' | 'Neutral' | 'Synergistic';
  notes: string;
  special?: Array<'ExtraPawn' | 'ChoicePerStage' | 'BuildAnyOrder' | 'LeaderFocus' | 'Diplomacy' | 'Naval'>;
}

export interface WonderInteractions {
  armada?: string;
  edifice?: string;
  bothArmadaEdifice?: string;
}

export interface Wonder {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  resource: Resource | 'Leader Discount';  // Allow Roma's non-resource start bonus
  startingBonus?: string;                  // Free/discounted Leaders, etc.
  expansion: 'Base' | 'Leaders' | 'Cities' | 'Armada' | 'Edifice';
  daySide: WonderSide;
  nightSide: WonderSide;
  edificeMeta: WonderEdificeMeta;
  interactions?: WonderInteractions;
}

// -------- Global interaction notes (can be shown in app help) --------
export const INTERACTIONS_GLOBAL = {
  armada: 'When playing with Armada, you may perform a Naval Construction when a Wonder stage shows the Shipyard symbol. Pay the Fleet level cost AND the Wonder stage cost together.',
  edifice: 'When playing with Edifice, you may pay the Participation cost at the same time as your Wonder stage cost to take a Participation pawn for that Age.',
  both: 'If playing WITH BOTH Armada and Edifice, you may NOT both perform a Naval Construction and participate in the Edifice on the SAME Wonder stage build.'
};

// -------- WONDERS (no promotional boards) --------
export const WONDERS_DATABASE: Wonder[] = [

  // ===== BASE GAME =====
  {
    id: 'alexandria',
    name: 'Alexandria',
    description: 'Supports flexible resource production.',
    difficulty: 'Beginner',
    resource: 'Glass',
    expansion: 'Base',
    daySide: {
      name: 'Day',
      stages: [
        {
          cost: [{ resource: 'Stone', amount: 2 }],
          effect: { type: 'Points', value: 3, description: '3 Victory Points' },
          points: 3,
        },
        {
          cost: [{ resource: 'Ore', amount: 2 }],
          effect: { type: 'Resource', description: 'Produce one of Wood/Stone/Ore/Clay per turn' },
        },
        {
          cost: [{ resource: 'Papyrus', amount: 1 }, { resource: 'Loom', amount: 1 }],
          effect: { type: 'Points', value: 7, description: '7 Victory Points' },
          points: 7,
        },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        {
          cost: [{ resource: 'Clay', amount: 2 }],
          effect: { type: 'Resource', description: 'Produce one of Wood/Stone/Ore/Clay per turn' },
        },
        {
          cost: [{ resource: 'Ore', amount: 3 }],
          effect: { type: 'Resource', description: 'Produce one of Glass/Papyrus/Loom per turn' },
        },
        {
          cost: [{ resource: 'Wood', amount: 4 }],
          effect: { type: 'Points', value: 7, description: '7 Victory Points' },
          points: 7,
        },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 3,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: true,
      synergy: 'Neutral',
      notes: 'Standard 3-stage wonder on both sides; full opportunity to participate in all three Edifice Ages.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'babylon',
    name: 'Babylon',
    description: 'Science flexibility; Night allows extra end-of-age play.',
    difficulty: 'Advanced',
    resource: 'Wood',
    expansion: 'Base',
    daySide: {
      name: 'Day',
      stages: [
        {
          cost: [{ resource: 'Clay', amount: 2 }],
          effect: { type: 'Points', value: 3, description: '3 Victory Points' },
          points: 3,
        },
        {
          cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Loom', amount: 1 }],
          effect: { type: 'Science', description: 'At game end, gain a Science symbol of your choice' },
        },
        {
          cost: [{ resource: 'Wood', amount: 4 }],
          effect: { type: 'Points', value: 7, description: '7 Victory Points' },
          points: 7,
        },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        {
          cost: [{ resource: 'Stone', amount: 2 }],
          effect: { type: 'Special', description: 'Play the last Age card of each Age instead of discarding it' },
        },
        {
          cost: [{ resource: 'Clay', amount: 3 }, { resource: 'Glass', amount: 1 }],
          effect: { type: 'Science', description: 'At game end, gain a Science symbol of your choice' },
        },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 2,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: false,
      synergy: 'Disadvantaged',
      notes: 'Night side has only 2 stages → fewer opportunities to participate in Edifice.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'ephesos',
    name: 'Éphesos',
    description: 'Coins-focused wonder.',
    difficulty: 'Beginner',
    resource: 'Papyrus',
    expansion: 'Base',
    daySide: {
      name: 'Day',
      stages: [
        {
          cost: [{ resource: 'Clay', amount: 2 }],
          effect: { type: 'Points', value: 3, description: '3 Victory Points' },
          points: 3,
        },
        {
          cost: [{ resource: 'Wood', amount: 2 }],
          effect: { type: 'Commerce', value: 9, description: 'Gain 9 Coins' },
        },
        {
          cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Glass', amount: 1 }],
          effect: { type: 'Points', value: 7, description: '7 Victory Points' },
          points: 7,
        },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        {
          cost: [{ resource: 'Stone', amount: 2 }],
          effect: { type: 'Commerce', value: 4, description: 'Gain 4 Coins + 2 VP' },
          points: 2,
        },
        {
          cost: [{ resource: 'Wood', amount: 2 }],
          effect: { type: 'Commerce', value: 4, description: 'Gain 4 Coins + 3 VP' },
          points: 3,
        },
        {
          cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Loom', amount: 1 }],
          effect: { type: 'Commerce', value: 4, description: 'Gain 4 Coins + 5 VP' },
          points: 5,
        },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 3,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: true,
      synergy: 'Neutral',
      notes: 'Full 3-stage participation potential on both sides.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'giza',
    name: 'Gizah',
    description: 'Pure VP wonder; Night has 4 stages.',
    difficulty: 'Beginner',
    resource: 'Stone',
    expansion: 'Base',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Wood', amount: 2 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Clay', amount: 2 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Points', value: 5, description: '5 Victory Points' }, points: 5 },
        { cost: [{ resource: 'Stone', amount: 4 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Wood', amount: 2 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Stone', amount: 3 }], effect: { type: 'Points', value: 5, description: '5 Victory Points' }, points: 5 },
        { cost: [{ resource: 'Clay', amount: 3 }], effect: { type: 'Points', value: 5, description: '5 Victory Points' }, points: 5 },
        { cost: [{ resource: 'Stone', amount: 4 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 4,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: true,
      synergy: 'Synergistic',
      notes: 'Night has 4 stages → one extra opportunity to time Edifice participation or Naval construction if Armada is used.',
    },
    interactions: {
      armada: INTERACTIONS_GLOBAL.armada,
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'halicarnassus',
    name: 'Halikarnassos',
    description: 'Discard-pile construction for free.',
    difficulty: 'Advanced',
    resource: 'Loom',
    expansion: 'Base',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Ore', amount: 2 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'Take the discard, build 1 card for free' } },
        { cost: [{ resource: 'Stone', amount: 3 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Clay', amount: 2 }], effect: { type: 'Special', description: 'Build 1 from discard for free + 2 VP' }, points: 2 },
        { cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'Build 1 from discard for free + 1 VP' }, points: 1 },
        { cost: [{ resource: 'Wood', amount: 3 }], effect: { type: 'Special', description: 'Build 1 from discard for free' } },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 3,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: true,
      synergy: 'Neutral',
      notes: 'Full 3-stage participation potential; discard builds don’t directly interact with Edifice rules.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'olympia',
    name: 'Olympía',
    description: 'Free-build timing windows (color-first / age-first/last).',
    difficulty: 'Intermediate',
    resource: 'Clay',
    expansion: 'Base',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Stone', amount: 2 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Wood', amount: 2 }], effect: { type: 'Special', description: 'Construct the FIRST card in each color for free' } },
        { cost: [{ resource: 'Clay', amount: 3 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Ore', amount: 2 }], effect: { type: 'Special', description: 'Construct the FIRST card of each Age for free + 2 VP' }, points: 2 },
        { cost: [{ resource: 'Clay', amount: 3 }], effect: { type: 'Special', description: 'Construct the LAST card of each Age for free + 3 VP' }, points: 3 },
        { cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Points', value: 5, description: '5 Victory Points' }, points: 5 },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 3,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: true,
      synergy: 'Neutral',
      notes: 'Free-build windows don’t alter Edifice participation timing; still occurs when building stages.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'rhodos',
    name: 'Rhódos',
    description: 'Military-oriented wonder.',
    difficulty: 'Intermediate',
    resource: 'Ore',
    expansion: 'Base',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Wood', amount: 2 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Clay', amount: 3 }], effect: { type: 'Military', value: 2, description: '+2 Military Strength' } },
        { cost: [{ resource: 'Ore', amount: 4 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Stone', amount: 3 }], effect: { type: 'Special', description: 'Gain 3 Coins + +1 Military + 3 VP' }, points: 3 },
        { cost: [{ resource: 'Ore', amount: 4 }], effect: { type: 'Special', description: 'Gain 4 Coins + +1 Military + 4 VP' }, points: 4 },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 2,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: false,
      synergy: 'Disadvantaged',
      notes: 'Night has only 2 stages → fewer Edifice participation chances.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  // ===== CITIES =====
  {
    id: 'byzantium',
    name: 'Byzantium',
    description: 'Diplomacy tokens skip conflicts.',
    difficulty: 'Intermediate',
    resource: 'Stone',
    expansion: 'Cities',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Ore', amount: 1 }, { resource: 'Clay', amount: 1 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Wood', amount: 2 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'Gain a Diplomacy token + 4 VP' }, points: 4 },
        { cost: [{ resource: 'Clay', amount: 2 }, { resource: 'Glass', amount: 1 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Ore', amount: 1 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'Gain a Diplomacy token + 4 VP' }, points: 4 },
        { cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Glass', amount: 1 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Special', description: 'Gain a Diplomacy token + 6 VP' }, points: 6 },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 2,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: false,
      synergy: 'Disadvantaged',
      notes: 'Night has only 2 stages → fewer Edifice participation chances. Diplomacy does not affect Edifice rules.',
      special: ['Diplomacy'],
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'petra',
    name: 'Petra',
    description: 'Coin-cost stages and economic pressure.',
    difficulty: 'Advanced',
    resource: 'Clay',
    expansion: 'Cities',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Stone', amount: 1 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: { coins: 5 }, effect: { type: 'Points', value: 7, description: '7 Victory Points (coin cost stage)' }, points: 7 },
        { cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Wood', amount: 1 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Clay', amount: 2 }], effect: { type: 'Special', description: 'All other players lose 2 Coins + 3 VP' }, points: 3 },
        { cost: { coins: 10 }, effect: { type: 'Points', value: 14, description: '14 Victory Points (coin cost stage)' }, points: 14 },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 2,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: false,
      synergy: 'Disadvantaged',
      notes: 'Night has only 2 stages → fewer Edifice participation chances. Coin-heavy effects don’t alter Edifice rules.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  // ===== LEADERS =====
  {
    id: 'abu_simbel',
    name: 'Abu Simbel',
    description: 'Bury Leaders for endgame VP based on their cost.',
    difficulty: 'Advanced',
    resource: 'Papyrus',
    expansion: 'Leaders',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Stone', amount: 1 }, { resource: 'Clay', amount: 1 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Ore', amount: 1 }], effect: { type: 'Points', value: 5, description: '5 Victory Points' }, points: 5 },
        { cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Glass', amount: 1 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Special', description: 'Bury 1 recruited Leader: score 2× its cost at game end' } },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Clay', amount: 2 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Special', description: 'Bury 1 recruited Leader: score 2× its cost at game end' } },
        { cost: [{ resource: 'Wood', amount: 2 }, { resource: 'Glass', amount: 1 }], effect: { type: 'Special', description: 'Bury 1 recruited Leader: score 2× its cost at game end' } },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 2,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: false,
      synergy: 'Disadvantaged',
      notes: 'Night has only 2 stages → fewer Edifice participation chances. Leader burial is orthogonal to Edifice.'
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'roma',
    name: 'Roma',
    description: 'Leader-focused wonder; powerful setup bonuses.',
    difficulty: 'Intermediate',
    resource: 'Leader Discount',   // Encoded as non-resource start bonus
    startingBonus: 'Day: Recruit all of your Leaders for free. Night: Recruit Leaders for 2 coins less; neighbors 1 coin less.',
    expansion: 'Leaders',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Ore', amount: 1 }, { resource: 'Clay', amount: 1 }], effect: { type: 'Points', value: 4, description: '4 Victory Points' }, points: 4 },
        { cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Clay', amount: 1 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Points', value: 6, description: '6 Victory Points' }, points: 6 },
      ],
      specialAbility: 'Recruit all of your Leaders for free.',
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Clay', amount: 1 }], effect: { type: 'Special', description: 'Gain 5 Coins; draw 4 Leader cards from the box' } },
        { cost: [{ resource: 'Stone', amount: 1 }, { resource: 'Clay', amount: 1 }, { resource: 'Glass', amount: 1 }], effect: { type: 'Special', description: 'Recruit an extra Leader and pay its cost + 3 VP' }, points: 3 },
        { cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'Recruit an extra Leader and pay its cost + 3 VP' }, points: 3 },
      ],
      specialAbility: 'Recruit Leaders for 2 coins less; neighbors 1 coin less.',
    },
    edificeMeta: {
      stagesDay: 2, stagesNight: 3,
      canParticipateAllAgesDay: false, canParticipateAllAgesNight: true,
      synergy: 'Disadvantaged',
      notes: 'Day has only 2 stages → fewer Edifice participation chances on Day. Night provides 3 stages.',
      special: ['LeaderFocus'],
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  // ===== ARMADA =====
  {
    id: 'siracusa',
    name: 'Siracusa',
    description: 'Fleet advancement; stages may be built in any order.',
    difficulty: 'Advanced',
    resource: 'Glass',
    expansion: 'Armada',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Ore', amount: 1 }], effect: { type: 'Special', description: 'Advance a Fleet 1 space (free). +1 Naval Strength' }, points: 0 },
        { cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Special', description: 'Advance a Fleet 1 space (free). +3 VP' }, points: 3 },
        { cost: [{ resource: 'Wood', amount: 2 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'Advance a Fleet 1 space (free). +1 Military Strength' }, points: 0 },
      ],
      specialAbility: 'Stages can be built in any order.',
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Ore', amount: 1 }, { resource: 'Clay', amount: 1 }], effect: { type: 'Special', description: 'Gain 6 Coins. All others lose Coins equal to their commercial level.' } },
        { cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Wood', amount: 1 }], effect: { type: 'Special', description: 'Advance two different Fleets 1 space each (free).' } },
        { cost: [{ resource: 'Wood', amount: 2 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: '+1 Military Strength and +1 Naval Strength' } },
      ],
      specialAbility: 'Stages can be built in any order.',
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 3,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: true,
      synergy: 'Neutral',
      notes: 'Full 3-stage participation potential. Must choose between Naval Construction and Edifice participation on the same stage.',
      special: ['BuildAnyOrder', 'Naval'],
    },
    interactions: {
      armada: INTERACTIONS_GLOBAL.armada,
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  // ===== EDIFICE =====
  {
    id: 'carthage',
    name: 'Carthage',
    description: 'Stage choices (left/right effects).',
    difficulty: 'Intermediate',
    resource: 'Ore',
    expansion: 'Edifice',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Stone', amount: 2 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'Choose: Gain 7 Coins OR +1 Military Strength + 2 VP' }, points: 2 },
        { cost: [{ resource: 'Clay', amount: 3 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Ore', amount: 3 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Special', description: 'LEFT: Gain 7 Coins + 4 VP; RIGHT: +2 Military Strength' }, points: 4 },
        { cost: [{ resource: 'Wood', amount: 3 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Special', description: 'LEFT: Build 1 from discard for free; RIGHT: Endgame Science symbol of your choice' } },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 2,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: false,
      synergy: 'Disadvantaged',
      notes: 'Night has only 2 stages → fewer Edifice participation chances. Choice-per-stage enables adaptive play.',
      special: ['ChoicePerStage'],
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

  {
    id: 'ur',
    name: 'Ur',
    description: 'Direct interaction with Edifice: take Participation pawns from the box.',
    difficulty: 'Intermediate',
    resource: 'Wood',
    expansion: 'Edifice',
    daySide: {
      name: 'Day',
      stages: [
        { cost: [{ resource: 'Stone', amount: 1 }, { resource: 'Ore', amount: 1 }], effect: { type: 'Points', value: 3, description: '3 Victory Points' }, points: 3 },
        { cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Clay', amount: 1 }], effect: { type: 'Special', description: 'Take ANY Age I/II/III Participation pawn from the box' } },
        { cost: [{ resource: 'Wood', amount: 3 }, { resource: 'Papyrus', amount: 1 }], effect: { type: 'Points', value: 7, description: '7 Victory Points' }, points: 7 },
      ],
    },
    nightSide: {
      name: 'Night',
      stages: [
        { cost: [{ resource: 'Stone', amount: 1 }, { resource: 'Glass', amount: 1 }], effect: { type: 'Special', description: 'Take an Age I Participation pawn from the box' } },
        { cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Stone', amount: 1 }], effect: { type: 'Special', description: 'Take an Age II Participation pawn from the box' } },
        { cost: [{ resource: 'Clay', amount: 2 }, { resource: 'Stone', amount: 1 }, { resource: 'Loom', amount: 1 }], effect: { type: 'Special', description: 'Take an Age III Participation pawn from the box' } },
      ],
    },
    edificeMeta: {
      stagesDay: 3, stagesNight: 3,
      canParticipateAllAgesDay: true, canParticipateAllAgesNight: true,
      synergy: 'Synergistic',
      notes: 'Can take Participation pawns directly from the box; enables participation without paying project’s cost or doubling up benefits.',
      special: ['ExtraPawn'],
    },
    interactions: {
      edifice: INTERACTIONS_GLOBAL.edifice,
      bothArmadaEdifice: INTERACTIONS_GLOBAL.both,
    }
  },

];

// -------- Helper lookups (stable API for the rest of the app) --------
export function getWonderById(id: string): Wonder | undefined {
  return WONDERS_DATABASE.find(w => w.id === id);
}

export function getWonderSide(wonderId: string, side: 'day' | 'night'): WonderSide | undefined {
  const w = getWonderById(wonderId);
  if (!w) return undefined;
  return side === 'day' ? w.daySide : w.nightSide;
}

export function getEdificeMeta(wonderId: string): WonderEdificeMeta | undefined {
  return getWonderById(wonderId)?.edificeMeta;
}

// Convenience: determine if a side can participate in all Edifice Ages
export function canParticipateAllAges(wonderId: string, side: 'day' | 'night'): boolean {
  const meta = getEdificeMeta(wonderId);
  if (!meta) return true;
  return side === 'day' ? meta.canParticipateAllAgesDay : meta.canParticipateAllAgesNight;
}
