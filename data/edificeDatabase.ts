// data/edificeDatabase.ts
// Updated to support 7 Wonders: Edifice expansion cards, participation, rewards, and penalties.
// This file preserves existing exports (EdificeProject, getProjectsByAge, getRandomProjects, getProjectById)
// and adds detailed scoring helpers used by the scoring UI.

// ---------- Types used by existing UI ----------
export interface EdificeProject {
  id: string;
  name: string;
  age: 1 | 2 | 3;
  description: string;
  cost: ResourceCost[]; // include Coin for participation cost
  effect: EdificeEffect;
  points: number; // direct VP (for cards that grant static VP); many Edifice cards are dynamic (pointsFormula)
  imageUrl?: string;
  strategicValue: 'Economic' | 'Military' | 'Science' | 'Balanced' | 'Situational';
  complexity: 'Simple' | 'Moderate' | 'Complex';

  // NEW: Edifice expansion-specific fields
  participationCostCoins?: number;
  reward?: EdificeReward;
  penalty?: EdificePenalty;
}

export interface EdificeEffect {
  type: 'EndGame' | 'Immediate' | 'Ongoing';
  description: string;
  pointsFormula?: string; // human-readable math, e.g. '1 × Wonder Stages Built'
  condition?: string;
}

export interface ResourceCost {
  resource: Resource;
  amount: number;
}

export type Resource =
  | 'Wood'
  | 'Stone'
  | 'Clay'
  | 'Ore'
  | 'Glass'
  | 'Loom'
  | 'Papyrus'
  | 'Coin';

// ---------- New Edifice expansion reward/penalty model ----------
export type WonderStageRoman = 'I' | 'II' | 'III';

export type CardColor =
  | 'red'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'grey'
  | 'brown'
  | 'purple';

export interface EdificeReward {
  kind:
    | 'Coins'
    | 'MilitaryVictoryToken'
    | 'MilitaryStrength'
    | 'EndGameVP'
    | 'ResourceGeneration'
    | 'Special';
  amount?: number; // coins or shields; when kind === 'MilitaryVictoryToken', amount is count of tokens
  tokenAge?: 2 | 3; // for MilitaryVictoryToken
  vpPer?:
    | 'WonderStage'
    | 'BlueCard'
    | 'CompleteBrownGreySet'
    | 'DifferentColorAgeCards'; // used by evaluator
  description?: string; // fallback human text
}

export interface EdificePenalty {
  kind: 'Coins' | 'RemoveCard' | 'LoseMilitaryVictoryTokens' | 'Special';
  amount?: number; // coins or tokens
  colorToRemove?: CardColor; // when kind === 'RemoveCard'
  description?: string; // fallback human text
}

// ---------- Per-game + per-player scoring helpers ----------
export interface CitySnapshot {
  // Provide these counts at scoring time for dynamic formulas
  wonderStagesBuilt: number;
  blueCount: number;
  brownCount: number;
  greyCount: number;
  differentColorAgeCards?: number; // 7W color diversity across Ages
}

export interface EdificeSelectionByAge {
  age1?: string;
  age2?: string;
  age3?: string;
}

export interface EdificeCompletionByAge {
  age1: boolean;
  age2: boolean;
  age3: boolean;
}

export interface PlayerEdificeParticipation {
  contributed: boolean;
  stage?: WonderStageRoman; // I / II / III when contributed
}

export interface PlayerEdificeByAge {
  age1?: PlayerEdificeParticipation;
  age2?: PlayerEdificeParticipation;
  age3?: PlayerEdificeParticipation;
}

export interface EdificeDetailedScore {
  // Edifice-only VP; DO NOT include conversion of coins to VP (that's Treasury category).
  edificePoints: number;

  // Side-effects to other categories (surface for the app to route appropriately)
  coinsDelta: number; // + for rewards, - for penalties
  militaryVictoryTokensAgeII: number;
  militaryVictoryTokensAgeIII: number;
  militaryStrengthDelta: number; // shields; affects Military resolution, not VP directly here
  loseMilitaryVictoryTokens: number; // generic loss if specified

  // For penalties that remove a card; the app can prompt the user to adjust that category
  removeCardColors: CardColor[];

  // Useful for audit trail in UI
  notes: string[];
}

// ---------- Edifice card data (official names & behaviors) ----------
// The participation cost is always in coins; when a project is COMPLETED,
// every player who has a participation pawn (i.e., contributed when building a Wonder stage)
// receives the REWARD. If the project is NOT completed by the end of the Age,
// players WITHOUT a participation pawn suffer the PENALTY.
// If a player contributed but the project wasn't completed, they neither receive rewards nor penalties.

// AGE I
export const AGE1_PROJECTS: EdificeProject[] = [
  {
    id: 'money_changer',
    name: 'Money Changer',
    age: 1,
    description: 'A guild of money handlers and lenders.',
    cost: [{ resource: 'Coin', amount: 1 }],
    participationCostCoins: 1,
    effect: {
      type: 'Immediate',
      description: 'If constructed: gain 4 coins. If not constructed: those without a pawn lose 2 coins.',
      pointsFormula: '',
    },
    reward: { kind: 'Coins', amount: 4, description: 'Gain 4 Coins' },
    penalty: { kind: 'Coins', amount: 2, description: 'Lose 2 Coins' },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Simple',
  },
  {
    id: 'curtain_wall',
    name: 'Curtain Wall',
    age: 1,
    description: 'Defensive fortifications encircling the city.',
    cost: [{ resource: 'Coin', amount: 2 }],
    participationCostCoins: 2,
    effect: {
      type: 'Immediate',
      description:
        'If constructed: gain Military Strength. If not constructed: those without a pawn discard 1 grey card.',
      pointsFormula: '',
    },
    reward: { kind: 'MilitaryStrength', amount: 1, description: 'Gain Military Strength (shields)' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'grey', description: 'Discard one grey card' },
    points: 0,
    strategicValue: 'Military',
    complexity: 'Simple',
  },
  {
    id: 'outpost',
    name: 'Outpost',
    age: 1,
    description: 'Frontier guard post and deterrent.',
    cost: [{ resource: 'Coin', amount: 1 }],
    participationCostCoins: 1,
    effect: {
      type: 'Immediate',
      description:
        'If constructed: gain 1 Age II military victory token. If not constructed: those without a pawn discard 1 red card.',
      pointsFormula: '',
    },
    reward: { kind: 'MilitaryVictoryToken', amount: 1, tokenAge: 2, description: 'Gain 1 Age II military victory token' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'red', description: 'Discard one red card' },
    points: 0,
    strategicValue: 'Military',
    complexity: 'Simple',
  },
  {
    id: 'belvedere',
    name: 'Belvedere',
    age: 1,
    description: 'Elevated platform celebrating your Wonder.',
    cost: [{ resource: 'Coin', amount: 1 }],
    participationCostCoins: 1,
    effect: {
      type: 'EndGame',
      description: 'If constructed: 1 VP for each Wonder stage you constructed. If not: those without a pawn discard 1 brown card.',
      pointsFormula: '1 × Your Wonder Stages',
    },
    reward: { kind: 'EndGameVP', amount: 0, vpPer: 'WonderStage', description: '1 VP per own Wonder stage' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'brown', description: 'Discard one brown card' },
    points: 0,
    strategicValue: 'Balanced',
    complexity: 'Simple',
  },
  {
    id: 'artisan_district',
    name: 'Artisan District',
    age: 1,
    description: 'Artisan workshops flourish.',
    cost: [{ resource: 'Coin', amount: 2 }],
    participationCostCoins: 2,
    effect: {
      type: 'EndGame',
      description: 'If constructed: 3 VP per complete set of brown and grey cards in your city. If not: those without a pawn discard 1 yellow card.',
      pointsFormula: '3 × Complete (Brown+Grey) Sets',
    },
    reward: {
      kind: 'EndGameVP',
      vpPer: 'CompleteBrownGreySet',
      description: '3 VP per complete brown+grey set',
    },
    penalty: { kind: 'RemoveCard', colorToRemove: 'yellow', description: 'Discard one yellow card' },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Moderate',
  },
];

// AGE II
export const AGE2_PROJECTS: EdificeProject[] = [
  {
    id: 'auction_house',
    name: 'Auction House',
    age: 2,
    description: 'A bustling market of valuables.',
    cost: [{ resource: 'Coin', amount: 2 }],
    participationCostCoins: 2,
    effect: {
      type: 'Immediate',
      description: 'If constructed: gain 7 coins. If not constructed: those without a pawn lose 5 coins.',
      pointsFormula: '',
    },
    reward: { kind: 'Coins', amount: 7, description: 'Gain 7 Coins' },
    penalty: { kind: 'Coins', amount: 5, description: 'Lose 5 Coins' },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Simple',
  },
  {
    id: 'river_port',
    name: 'River Port',
    age: 2,
    description: 'River trade hub.',
    cost: [{ resource: 'Coin', amount: 3 }],
    participationCostCoins: 3,
    effect: {
      type: 'Ongoing',
      description: 'If constructed: generates one of Wood/Stone/Ore/Clay per turn. If not: those without a pawn discard 1 blue card.',
      pointsFormula: '',
    },
    reward: { kind: 'ResourceGeneration', description: 'Generate one of Wood/Stone/Ore/Clay each turn' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'blue', description: 'Discard one blue card' },
    points: 0,
    strategicValue: 'Balanced',
    complexity: 'Moderate',
  },
  {
    id: 'factory',
    name: 'Factory',
    age: 2,
    description: 'Manufactured goods production.',
    cost: [{ resource: 'Coin', amount: 3 }],
    participationCostCoins: 3,
    effect: {
      type: 'Ongoing',
      description: 'If constructed: generates one of Glass/Papyrus/Loom per turn. If not: those without a pawn discard 1 brown card.',
      pointsFormula: '',
    },
    reward: { kind: 'ResourceGeneration', description: 'Generate one of Glass/Papyrus/Loom each turn' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'brown', description: 'Discard one brown card' },
    points: 0,
    strategicValue: 'Science',
    complexity: 'Moderate',
  },
  {
    id: 'staging_camp',
    name: 'Staging Camp',
    age: 2,
    description: 'Military mustering field.',
    cost: [{ resource: 'Coin', amount: 2 }],
    participationCostCoins: 2,
    effect: {
      type: 'Immediate',
      description: 'If constructed: gain 1 Age III military victory token. If not: those without a pawn discard 1 red card.',
      pointsFormula: '',
    },
    reward: { kind: 'MilitaryVictoryToken', amount: 1, tokenAge: 3, description: 'Gain 1 Age III military victory token' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'red', description: 'Discard one red card' },
    points: 0,
    strategicValue: 'Military',
    complexity: 'Simple',
  },
  {
    id: 'amphitheater',
    name: 'Amphitheater',
    age: 2,
    description: 'Performances elevate civic pride.',
    cost: [{ resource: 'Coin', amount: 3 }],
    participationCostCoins: 3,
    effect: {
      type: 'EndGame',
      description: 'If constructed: 1 VP per blue card in your city. If not: those without a pawn discard 1 brown card.',
      pointsFormula: '1 × Blue Cards',
    },
    reward: { kind: 'EndGameVP', vpPer: 'BlueCard', description: '1 VP per blue card' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'brown', description: 'Discard one brown card' },
    points: 0,
    strategicValue: 'Balanced',
    complexity: 'Moderate',
  },
];

// AGE III
export const AGE3_PROJECTS: EdificeProject[] = [
  {
    id: 'gold_reserves',
    name: 'Gold Reserves',
    age: 3,
    description: 'The city coffers overflow.',
    cost: [{ resource: 'Coin', amount: 3 }],
    participationCostCoins: 3,
    effect: {
      type: 'Immediate',
      description: 'If constructed: gain 15 coins. If not constructed: those without a pawn lose 9 coins.',
      pointsFormula: '',
    },
    reward: { kind: 'Coins', amount: 15, description: 'Gain 15 Coins' },
    penalty: { kind: 'Coins', amount: 9, description: 'Lose 9 Coins' },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Simple',
  },
  {
    id: 'concentric_castle',
    name: 'Concentric Castle',
    age: 3,
    description: 'Layered fortifications.',
    cost: [{ resource: 'Coin', amount: 5 }],
    participationCostCoins: 5,
    effect: {
      type: 'Immediate',
      description: 'If constructed: gain Military Strength (≈+2 shields). If not: those without a pawn lose two Military Victory tokens.',
      pointsFormula: '',
    },
    reward: { kind: 'MilitaryStrength', amount: 2, description: 'Gain ≈2 shields (treat as military strength bonus)' },
    penalty: { kind: 'LoseMilitaryVictoryTokens', amount: 2, description: 'Lose two Military Victory tokens' },
    points: 0,
    strategicValue: 'Military',
    complexity: 'Moderate',
  },
  {
    id: 'military_school',
    name: 'Military School',
    age: 3,
    description: 'Elite training for commanders.',
    cost: [{ resource: 'Coin', amount: 5 }],
    participationCostCoins: 5,
    effect: {
      type: 'Immediate',
      description: 'If constructed: gain 1 Age III Military Victory token and discard all Military Defeat tokens. If not: those without a pawn discard 1 red card.',
      pointsFormula: '',
    },
    reward: {
      kind: 'Special',
      description: 'Gain 1 Age III Military Victory token and discard all Military Defeat tokens',
    },
    penalty: { kind: 'RemoveCard', colorToRemove: 'red', description: 'Discard one red card' },
    points: 0,
    strategicValue: 'Military',
    complexity: 'Complex',
  },
  {
    id: 'archives',
    name: 'Archives',
    age: 3,
    description: 'A library of civilization.',
    cost: [{ resource: 'Coin', amount: 5 }],
    participationCostCoins: 5,
    effect: {
      type: 'EndGame',
      description:
        'If constructed: 1 VP for each different color of Age cards in your City. If not: those without a pawn discard 1 blue card.',
      pointsFormula: '1 × Different Colors of Age Cards',
    },
    reward: {
      kind: 'EndGameVP',
      vpPer: 'DifferentColorAgeCards',
      description: '1 VP per different color of Age cards',
    },
    penalty: { kind: 'RemoveCard', colorToRemove: 'blue', description: 'Discard one blue card' },
    points: 0,
    strategicValue: 'Balanced',
    complexity: 'Moderate',
  },
  {
    id: 'agora',
    name: 'Agora',
    age: 3,
    description: 'Marketplace of ideas and influence.',
    cost: [{ resource: 'Coin', amount: 6 }],
    participationCostCoins: 6,
    effect: {
      type: 'EndGame',
      description:
        'If constructed: you may apply the effect of one purple card in your City a second time. If not: those without a pawn discard 1 green card.',
      pointsFormula: 'Double a Purple (Guild) effect',
    },
    reward: { kind: 'Special', description: 'Apply one purple (guild) card a second time at end of game' },
    penalty: { kind: 'RemoveCard', colorToRemove: 'green', description: 'Discard one green card' },
    points: 0,
    strategicValue: 'Situational',
    complexity: 'Complex',
  },
];

// Aggregate
export const ALL_EDIFICE_PROJECTS: EdificeProject[] = [
  ...AGE1_PROJECTS,
  ...AGE2_PROJECTS,
  ...AGE3_PROJECTS,
];

// ---------- Helper functions for setup UI (existing) ----------
export function getProjectsByAge(age: 1 | 2 | 3): EdificeProject[] {
  switch (age) {
    case 1:
      return AGE1_PROJECTS;
    case 2:
      return AGE2_PROJECTS;
    case 3:
      return AGE3_PROJECTS;
  }
}

export function getRandomProjects(): { age1: string; age2: string; age3: string } {
  return {
    age1: AGE1_PROJECTS[Math.floor(Math.random() * AGE1_PROJECTS.length)].id,
    age2: AGE2_PROJECTS[Math.floor(Math.random() * AGE2_PROJECTS.length)].id,
    age3: AGE3_PROJECTS[Math.floor(Math.random() * AGE3_PROJECTS.length)].id,
  };
}

export function getProjectById(id: string): EdificeProject | undefined {
  return ALL_EDIFICE_PROJECTS.find((project) => project.id === id);
}

// ---------- Detailed scoring evaluator ----------
export function computeEdificeDetailedScore(params: {
  projectId: string;
  isCompleted: boolean;
  playerContributed: boolean;
  contributedStage?: WonderStageRoman; // I/II/III (stored for analytics/UI)
  city: CitySnapshot; // snapshot of the player's city for endgame formulas
}): EdificeDetailedScore {
  const project = getProjectById(params.projectId);
  if (!project) {
    return {
      edificePoints: 0,
      coinsDelta: 0,
      militaryVictoryTokensAgeII: 0,
      militaryVictoryTokensAgeIII: 0,
      militaryStrengthDelta: 0,
      loseMilitaryVictoryTokens: 0,
      removeCardColors: [],
      notes: [`Unknown project: ${params.projectId}`],
    };
  }

  const notes: string[] = [];
  let edificePoints = 0;
  let coinsDelta = 0;
  let tokensII = 0;
  let tokensIII = 0;
  let shields = 0;
  let loseTokens = 0;
  const removeCardColors: CardColor[] = [];

  if (params.isCompleted && params.playerContributed) {
    // Apply reward
    const r = project.reward;
    if (r) {
      switch (r.kind) {
        case 'Coins':
          coinsDelta += r.amount ?? 0;
          notes.push(`Reward: +${r.amount ?? 0} coins`);
          break;
        case 'MilitaryVictoryToken':
          if (r.tokenAge === 2) tokensII += r.amount ?? 0;
          else if (r.tokenAge === 3) tokensIII += r.amount ?? 0;
          notes.push(`Reward: +${r.amount ?? 0} Age ${r.tokenAge} military victory token(s)`);
          break;
        case 'MilitaryStrength':
          shields += r.amount ?? 0;
          notes.push(`Reward: +${r.amount ?? 0} military strength`);
          break;
        case 'EndGameVP':
          if (r.vpPer === 'WonderStage') {
            edificePoints += params.city.wonderStagesBuilt * 1;
            notes.push(`Reward: +${params.city.wonderStagesBuilt} VP (1 × wonder stages built)`);
          } else if (r.vpPer === 'BlueCard') {
            edificePoints += params.city.blueCount * 1;
            notes.push(`Reward: +${params.city.blueCount} VP (1 × blue cards)`);
          } else if (r.vpPer === 'CompleteBrownGreySet') {
            const sets = Math.min(params.city.brownCount, params.city.greyCount);
            edificePoints += sets * 3;
            notes.push(`Reward: +${sets * 3} VP (3 × ${sets} complete brown+grey sets)`);
          } else if (r.vpPer === 'DifferentColorAgeCards') {
            const diff = params.city.differentColorAgeCards ?? 0;
            edificePoints += diff * 1;
            notes.push(`Reward: +${diff} VP (1 × different colors of Age cards)`);
          } else {
            notes.push(`Reward (VP): ${project.effect.pointsFormula ?? r.description ?? ''}`);
          }
          break;
        case 'ResourceGeneration':
          notes.push(`Reward: ${r.description ?? 'Resource generation ongoing.'}`);
          break;
        case 'Special':
          notes.push(`Reward (special): ${r.description ?? project.effect.description}`);
          break;
      }
    }
  } else if (!params.isCompleted && !params.playerContributed) {
    // Apply penalty
    const p = project.penalty;
    if (p) {
      switch (p.kind) {
        case 'Coins':
          coinsDelta -= p.amount ?? 0;
          notes.push(`Penalty: -${p.amount ?? 0} coins`);
          break;
        case 'RemoveCard':
          if (p.colorToRemove) {
            removeCardColors.push(p.colorToRemove);
            notes.push(`Penalty: must discard one ${p.colorToRemove} card`);
          } else {
            notes.push(`Penalty: ${p.description ?? 'Remove a card'}`);
          }
          break;
        case 'LoseMilitaryVictoryTokens':
          loseTokens += p.amount ?? 0;
          notes.push(`Penalty: lose ${p.amount ?? 0} military victory token(s)`);
          break;
        case 'Special':
          notes.push(`Penalty (special): ${p.description ?? project.effect.description}`);
          break;
      }
    }
  } else {
    // (Completed && !contributed) or (!Completed && contributed) -> neither reward nor penalty
    notes.push('No reward or penalty for this player based on contribution/completion rules.');
  }

  return {
    edificePoints,
    coinsDelta,
    militaryVictoryTokensAgeII: tokensII,
    militaryVictoryTokensAgeIII: tokensIII,
    militaryStrengthDelta: shields,
    loseMilitaryVictoryTokens: loseTokens,
    removeCardColors,
    notes,
  };
}

// Convenience: compute all three Ages for a player
export function computeEdificeDetailedScoreForPlayer(params: {
  selectedByAge: EdificeSelectionByAge;
  completedByAge: EdificeCompletionByAge;
  playerByAge: PlayerEdificeByAge;
  // Provide snapshots for the player; can reuse same snapshot for each age if you prefer
  cityByAge: { age1: CitySnapshot; age2: CitySnapshot; age3: CitySnapshot };
}): { age1?: EdificeDetailedScore; age2?: EdificeDetailedScore; age3?: EdificeDetailedScore } {
  const out: any = {};
  (['age1', 'age2', 'age3'] as const).forEach((k, i) => {
    const projId = params.selectedByAge[k];
    if (!projId) return;
    const isCompleted = params.completedByAge[k as 'age1' | 'age2' | 'age3'];
    const p = params.playerByAge[k] ?? { contributed: false };
    out[k] = computeEdificeDetailedScore({
      projectId: projId,
      isCompleted,
      playerContributed: !!p.contributed,
      contributedStage: p.stage,
      city: params.cityByAge[k],
    });
  });
  return out;
}

// ---------- Reference notes for in-app help ----------
export const EDIFICE_REFERENCE_NOTES: string = [
  'Edifice cards are constructed collaboratively when players build Wonder stages.',
  'Contribute by paying the participation cost when you build a Wonder stage to take a participation pawn.',
  'If an Edifice is constructed in an Age, all players who contributed gain the Reward.',
  'If an Edifice is NOT constructed by the end of an Age, all players who did NOT contribute suffer the Penalty.',
  'If you contributed but it was not constructed, you neither gain the Reward nor suffer the Penalty.',
  'You may record which Wonder Stage (I, II, III) you contributed on for analytics or tie-ins to other effects.',
].join('\n');


export const EDIFICE_REFERENCE_NOTES_EXTENDED: string = [
  'Edifice cards are a new category of cards included in the Edifice expansion. They represent prestigious buildings that players construct together during the game.',
  'For each game, a random Edifice is chosen for each Age.',
  'Each Edifice has a Project side and a Constructed side. A player can participate in the construction of the Edifice when they build a Stage of their Wonder.',
  'If a player pays the participation cost of the Edifice when they build their Wonder, they take a Participation pawn for that Age.',
  'If the Edifice is constructed, all players who participated gain the Reward of the Edifice.',
  'If an Edifice is not constructed by the end of the Age, all players who do not have a participation pawn suffer the Penalty of the Edifice card.',
  'Ur is a wonder included in the Edifice expansion that directly interacts with the Edifice cards. Its Wonder stages include effects that allow it to take participation pawns from the box.'
].join('\n');

