// data/edificeDatabase.ts
export interface EdificeProject {
  id: string;
  name: string;
  age: 1 | 2 | 3;
  description: string;
  cost: ResourceCost[];
  effect: EdificeEffect;
  points: number;
  imageUrl?: string; // For future image implementation
  strategicValue: 'Economic' | 'Military' | 'Science' | 'Balanced' | 'Situational';
  complexity: 'Simple' | 'Moderate' | 'Complex';
}

export interface EdificeEffect {
  type: 'EndGame' | 'Immediate' | 'Ongoing';
  description: string;
  pointsFormula?: string;
  condition?: string;
}

export interface ResourceCost {
  resource: Resource;
  amount: number;
}

export type Resource = 'Wood' | 'Stone' | 'Clay' | 'Ore' | 'Glass' | 'Loom' | 'Papyrus' | 'Coin';

// Age 1 Edifice Projects
export const AGE1_PROJECTS: EdificeProject[] = [
  {
    id: 'theater',
    name: 'Theater',
    age: 1,
    description: 'Cultural venue providing entertainment and prestige',
    cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Clay', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 3 points for each Wonder stage built in your city',
      pointsFormula: '3 × Wonder Stages Built'
    },
    points: 0,
    strategicValue: 'Balanced',
    complexity: 'Simple'
  },
  {
    id: 'statue',
    name: 'Statue',
    age: 1,
    description: 'Monument celebrating civic pride and achievement',
    cost: [{ resource: 'Stone', amount: 2 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 1 point for each built structure in your city',
      pointsFormula: '1 × Total Structures Built'
    },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Simple'
  },
  {
    id: 'obelisk',
    name: 'Obelisk',
    age: 1,
    description: 'Towering stone monument marking territorial claims',
    cost: [{ resource: 'Stone', amount: 1 }, { resource: 'Clay', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 2 points for each military victory token you have',
      pointsFormula: '2 × Military Victory Tokens'
    },
    points: 0,
    strategicValue: 'Military',
    complexity: 'Simple'
  },
  {
    id: 'decorations',
    name: 'Decorations',
    age: 1,
    description: 'Ornamental embellishments enhancing city beauty',
    cost: [{ resource: 'Clay', amount: 2 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 5 points if you have built all stages of your Wonder',
      condition: 'All Wonder stages completed'
    },
    points: 5,
    strategicValue: 'Situational',
    complexity: 'Moderate'
  },
  {
    id: 'archway',
    name: 'Archway',
    age: 1,
    description: 'Grand entrance demonstrating architectural mastery',
    cost: [{ resource: 'Stone', amount: 1 }, { resource: 'Wood', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 3 points for each pair of identical manufactured goods',
      pointsFormula: '3 × Pairs of Manufactured Goods'
    },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Moderate'
  }
];

// Age 2 Edifice Projects  
export const AGE2_PROJECTS: EdificeProject[] = [
  {
    id: 'rostral_column',
    name: 'Rostral Column',
    age: 2,
    description: 'Naval monument celebrating maritime victories',
    cost: [{ resource: 'Stone', amount: 1 }, { resource: 'Ore', amount: 2 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 4 points for each different type of raw material you produce',
      pointsFormula: '4 × Different Raw Materials'
    },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Moderate'
  },
  {
    id: 'triumphal_arch',
    name: 'Triumphal Arch',
    age: 2,
    description: 'Ceremonial archway commemorating great achievements',
    cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Clay', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 3 points for each civilian structure (blue) in your city',
      pointsFormula: '3 × Blue Structures'
    },
    points: 0,
    strategicValue: 'Balanced',
    complexity: 'Simple'
  },
  {
    id: 'belvedere',
    name: 'Belvedere',
    age: 2,
    description: 'Elevated viewing platform showcasing city grandeur',
    cost: [{ resource: 'Wood', amount: 2 }, { resource: 'Glass', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 2 points for each Wonder stage in neighboring cities',
      pointsFormula: '2 × Neighbor Wonder Stages'
    },
    points: 0,
    strategicValue: 'Situational',
    complexity: 'Complex'
  },
  {
    id: 'caesareum',
    name: 'Caesareum',
    age: 2,
    description: 'Temple dedicated to imperial worship and authority',
    cost: [{ resource: 'Clay', amount: 1 }, { resource: 'Loom', amount: 1 }, { resource: 'Papyrus', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 2 points for each defeat token you have',
      pointsFormula: '2 × Defeat Tokens'
    },
    points: 0,
    strategicValue: 'Situational',
    complexity: 'Complex'
  },
  {
    id: 'odeion',
    name: 'Odeion',
    age: 2,
    description: 'Concert hall for musical performances and recitals',
    cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Stone', amount: 1 }, { resource: 'Glass', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 5 points for each set of 3 different science symbols',
      pointsFormula: '5 × Sets of 3 Science Symbols'
    },
    points: 0,
    strategicValue: 'Science',
    complexity: 'Complex'
  }
];

// Age 3 Edifice Projects
export const AGE3_PROJECTS: EdificeProject[] = [
  {
    id: 'palace',
    name: 'Palace',
    age: 3,
    description: 'Royal residence demonstrating ultimate power and wealth',
    cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Loom', amount: 1 }, { resource: 'Papyrus', amount: 1 }, { resource: 'Clay', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 8 points if you have the most victory points at game end',
      condition: 'Most victory points',
      pointsFormula: '8 if winning'
    },
    points: 8,
    strategicValue: 'Situational',
    complexity: 'Complex'
  },
  {
    id: 'senate',
    name: 'Senate',
    age: 3,
    description: 'Governing body representing civic authority and law',
    cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Stone', amount: 1 }, { resource: 'Loom', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 3 points for each different guild (purple) in your city',
      pointsFormula: '3 × Different Guilds'
    },
    points: 0,
    strategicValue: 'Balanced',
    complexity: 'Moderate'
  },
  {
    id: 'mausoleum_edifice',
    name: 'Mausoleum',
    age: 3,
    description: 'Grand tomb ensuring eternal remembrance',
    cost: [{ resource: 'Glass', amount: 2 }, { resource: 'Papyrus', amount: 1 }, { resource: 'Loom', amount: 1 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 6 points plus 2 points for each blue structure in your city',
      pointsFormula: '6 + (2 × Blue Structures)'
    },
    points: 6,
    strategicValue: 'Balanced',
    complexity: 'Moderate'
  },
  {
    id: 'lighthouse_edifice',
    name: 'Lighthouse',
    age: 3,
    description: 'Beacon guiding ships safely to harbor',
    cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Glass', amount: 1 }, { resource: 'Coin', amount: 4 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 4 points for each different type of manufactured good you produce',
      pointsFormula: '4 × Different Manufactured Goods'
    },
    points: 0,
    strategicValue: 'Economic',
    complexity: 'Moderate'
  },
  {
    id: 'great_work',
    name: 'Great Work',
    age: 3,
    description: 'Masterpiece of engineering showcasing civilization peak',
    cost: [{ resource: 'Ore', amount: 1 }, { resource: 'Stone', amount: 1 }, { resource: 'Wood', amount: 1 }, { resource: 'Clay', amount: 1 }, { resource: 'Coin', amount: 3 }],
    effect: {
      type: 'EndGame',
      description: 'Gain 12 points',
      pointsFormula: '12 points'
    },
    points: 12,
    strategicValue: 'Balanced',
    complexity: 'Simple'
  }
];

export const ALL_EDIFICE_PROJECTS = [
  ...AGE1_PROJECTS,
  ...AGE2_PROJECTS, 
  ...AGE3_PROJECTS
];

// Helper functions for project selection
export function getProjectsByAge(age: 1 | 2 | 3): EdificeProject[] {
  switch (age) {
    case 1: return AGE1_PROJECTS;
    case 2: return AGE2_PROJECTS;
    case 3: return AGE3_PROJECTS;
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
  return ALL_EDIFICE_PROJECTS.find(project => project.id === id);
}