// data/armadaDatabase.ts - Complete 7 shipyard system matching official game
export interface ArmadaShipyard {
  id: string;
  name: string;
  wonderTrack: 'red' | 'yellow' | 'blue' | 'green'; // Which track has the wonder symbol
  redTrack: NavalTrack;
  yellowTrack: NavalTrack;
  blueTrack: NavalTrack;
  greenTrack: NavalTrack;
}

export interface NavalTrack {
  color: 'red' | 'yellow' | 'blue' | 'green';
  name: string;
  spaces: NavalSpace[];
}

export interface NavalSpace {
  position: number; // 0-6 (7 spaces total)
  cost: ResourceCost | null; // null for starting space
  effect: SpaceEffect | null; // null for starting space
  hasWonderSymbol?: boolean; // true if this space has the wonder symbol
}

export interface ResourceCost {
  type: 'raw' | 'manufactured' | 'any' | 'coins';
  amount: number;
  options?: string[]; // For "one of wood/stone/clay" type costs
}

export interface SpaceEffect {
  type: 'military' | 'commercial' | 'points' | 'tax' | 'special';
  value?: number;
  description: string;
  commercialLevel?: number; // For yellow track
  taxAmount?: number; // For tax effects
}

export const ARMADA_SHIPYARDS: ArmadaShipyard[] = [
  // 2 RED WONDER TRACK SHIPYARDS
  {
    id: 'navy_shipyard',
    name: 'Navy Shipyard',
    wonderTrack: 'red',
    redTrack: {
      color: 'red',
      name: 'War Fleet',
      spaces: [
        { position: 0, cost: null, effect: null, hasWonderSymbol: true },
        { 
          position: 1, 
          cost: { type: 'any', amount: 1, options: ['wood', 'stone', 'clay', 'ore'] },
          effect: { type: 'military', value: 1, description: '1 Naval Strength' }
        },
        { 
          position: 2, 
          cost: { type: 'any', amount: 1, options: ['wood', 'stone', 'clay'] },
          effect: { type: 'military', value: 2, description: '2 Naval Strength' }
        },
        { 
          position: 3, 
          cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] },
          effect: { type: 'military', value: 3, description: '3 Naval Strength' }
        },
        { 
          position: 4, 
          cost: { type: 'manufactured', amount: 1, options: ['glass', 'loom', 'papyrus'] },
          effect: { type: 'military', value: 4, description: '4 Naval Strength + 2 Coins', taxAmount: 2 }
        },
        { 
          position: 5, 
          cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] },
          effect: { type: 'military', value: 5, description: '5 Naval Strength + 3 Coins', commercialLevel: 3 }
        },
        { 
          position: 6, 
          cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay'] },
          effect: { type: 'military', value: 8, description: '8 Naval Strength + 4 Coins + 10 Points', commercialLevel: 4, taxAmount: 4 }
        }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Trade Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'coins', amount: 1 }, effect: { type: 'commercial', value: 1, description: 'Commercial Level 1', commercialLevel: 1 } },
        { position: 2, cost: { type: 'coins', amount: 2 }, effect: { type: 'tax', description: 'Gain 2 Coins, Tax 1 Coin', value: 2, taxAmount: 1 } },
        { position: 3, cost: { type: 'coins', amount: 3 }, effect: { type: 'commercial', value: 2, description: 'Commercial Level 2 + 3 Coins', commercialLevel: 2 } },
        { position: 4, cost: { type: 'coins', amount: 4 }, effect: { type: 'tax', description: '4 Coins, Tax 2 Coins', value: 4, taxAmount: 2 } },
        { position: 5, cost: { type: 'coins', amount: 5 }, effect: { type: 'commercial', value: 3, description: 'Commercial Level 3 + 5 Coins', commercialLevel: 3 } },
        { position: 6, cost: { type: 'coins', amount: 6 }, effect: { type: 'commercial', value: 4, description: 'Commercial Level 4 + Tax 4 Coins', commercialLevel: 4, taxAmount: 4 } }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Victory Points Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 2, description: '2 Victory Points' } },
        { position: 2, cost: { type: 'raw', amount: 2 }, effect: { type: 'points', value: 4, description: '4 Victory Points' } },
        { position: 3, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'points', value: 6, description: '6 Victory Points' } },
        { position: 4, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'points', value: 8, description: '8 Victory Points' } },
        { position: 5, cost: { type: 'any', amount: 3 }, effect: { type: 'points', value: 10, description: '10 Victory Points' } },
        { position: 6, cost: { type: 'any', amount: 4 }, effect: { type: 'points', value: 15, description: '15 Victory Points' } }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Discovery Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 2 }, effect: { type: 'special', description: 'Explore Level 1 Island (Draw 4 cards, keep 1)' } },
        { position: 2, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'special', description: 'Science Symbol + 1 Point' } },
        { position: 3, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: 'Explore Level 2 Island (Draw 4 cards, keep 1)' } },
        { position: 4, cost: { type: 'any', amount: 3 }, effect: { type: 'special', description: 'Science Symbol + 3 Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'special', description: 'Explore Level 3 Island (Draw 4 cards, keep 1)' } },
        { position: 6, cost: { type: 'any', amount: 4 }, effect: { type: 'special', description: '2 Science Symbols + 5 Points' } }
      ]
    }
  },
  {
    id: 'fortress_shipyard',
    name: 'Fortress Shipyard',
    wonderTrack: 'red',
    redTrack: {
      color: 'red',
      name: 'War Fleet',
      spaces: [
        { position: 0, cost: null, effect: null, hasWonderSymbol: true },
        { position: 1, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 1 Point' } },
        { position: 2, cost: { type: 'any', amount: 1, options: ['ore'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 2 Points' } },
        { position: 3, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 2, description: '2 Naval Strength + 1 Point' } },
        { position: 4, cost: { type: 'manufactured', amount: 1, options: ['glass', 'loom', 'papyrus'] }, effect: { type: 'military', value: 3, description: '3 Naval Strength + 2 Points' } },
        { position: 5, cost: { type: 'any', amount: 3, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 4, description: '4 Naval Strength + 3 Points' } },
        { position: 6, cost: { type: 'any', amount: 2, options: ['manufactured'] }, effect: { type: 'military', value: 6, description: '6 Naval Strength + 5 Points' } }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Support Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'coins', amount: 2 }, effect: { type: 'commercial', value: 1, description: 'Commercial Level 1 + 1 Point', commercialLevel: 1 } },
        { position: 2, cost: { type: 'coins', amount: 3 }, effect: { type: 'tax', description: '3 Coins + 1 Point', value: 3 } },
        { position: 3, cost: { type: 'coins', amount: 4 }, effect: { type: 'commercial', value: 2, description: 'Commercial Level 2 + 2 Points', commercialLevel: 2 } },
        { position: 4, cost: { type: 'coins', amount: 5 }, effect: { type: 'tax', description: '4 Coins + 2 Points', value: 4 } },
        { position: 5, cost: { type: 'coins', amount: 6 }, effect: { type: 'commercial', value: 3, description: 'Commercial Level 3 + 3 Points', commercialLevel: 3 } },
        { position: 6, cost: { type: 'coins', amount: 7 }, effect: { type: 'commercial', value: 4, description: 'Commercial Level 4 + 5 Points + Tax 3', commercialLevel: 4, taxAmount: 3 } }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Victory Points Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 3, description: '3 Victory Points' } },
        { position: 2, cost: { type: 'raw', amount: 2 }, effect: { type: 'points', value: 5, description: '5 Victory Points' } },
        { position: 3, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'points', value: 7, description: '7 Victory Points' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'points', value: 9, description: '9 Victory Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'points', value: 12, description: '12 Victory Points' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'points', value: 16, description: '16 Victory Points' } }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Scout Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 2 }, effect: { type: 'special', description: 'Science Symbol + 1 Point' } },
        { position: 2, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'special', description: 'Explore Level 1 Island + 1 Point' } },
        { position: 3, cost: { type: 'any', amount: 3 }, effect: { type: 'special', description: 'Science Symbol + 2 Points' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: 'Explore Level 2 Island + 2 Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'special', description: '2 Science Symbols + 1 Point' } },
        { position: 6, cost: { type: 'any', amount: 4 }, effect: { type: 'special', description: 'Explore Level 3 Island + 2 Science + 3 Points' } }
      ]
    }
  },

  // 1 YELLOW WONDER TRACK SHIPYARD
  {
    id: 'commercial_shipyard',
    name: 'Commercial Shipyard',
    wonderTrack: 'yellow',
    redTrack: {
      color: 'red',
      name: 'Defense Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength' } },
        { position: 2, cost: { type: 'any', amount: 1, options: ['ore'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 1 Point' } },
        { position: 3, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 2, description: '2 Naval Strength' } },
        { position: 4, cost: { type: 'manufactured', amount: 1, options: ['glass', 'loom', 'papyrus'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 2 Points' } },
        { position: 5, cost: { type: 'any', amount: 3, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 3, description: '3 Naval Strength' } },
        { position: 6, cost: { type: 'any', amount: 2, options: ['manufactured'] }, effect: { type: 'military', value: 4, description: '4 Naval Strength + 3 Points' } }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Merchant Fleet',
      spaces: [
        { position: 0, cost: null, effect: null, hasWonderSymbol: true },
        { position: 1, cost: { type: 'coins', amount: 1 }, effect: { type: 'commercial', value: 1, description: 'Commercial Level 1', commercialLevel: 1 } },
        { position: 2, cost: { type: 'coins', amount: 1 }, effect: { type: 'tax', description: 'Gain 2 Coins, Tax 1 Coin', value: 2, taxAmount: 1 } },
        { position: 3, cost: { type: 'coins', amount: 2 }, effect: { type: 'commercial', value: 2, description: 'Commercial Level 2 + 2 Coins', commercialLevel: 2 } },
        { position: 4, cost: { type: 'coins', amount: 3 }, effect: { type: 'tax', description: '3 Coins, Tax 2 Coins', value: 3, taxAmount: 2 } },
        { position: 5, cost: { type: 'coins', amount: 4 }, effect: { type: 'commercial', value: 3, description: 'Commercial Level 3 + 4 Coins', commercialLevel: 3 } },
        { position: 6, cost: { type: 'coins', amount: 5 }, effect: { type: 'commercial', value: 4, description: 'Commercial Level 4 + 6 Coins + Tax 3', commercialLevel: 4, taxAmount: 3 } }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Prosperity Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 3, description: '3 Victory Points' } },
        { position: 2, cost: { type: 'raw', amount: 2 }, effect: { type: 'points', value: 5, description: '5 Victory Points' } },
        { position: 3, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'points', value: 7, description: '7 Victory Points' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'points', value: 9, description: '9 Victory Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'points', value: 12, description: '12 Victory Points' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'points', value: 16, description: '16 Victory Points' } }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Research Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 2 }, effect: { type: 'special', description: 'Explore Level 1 Island (Draw 4 cards, keep 1)' } },
        { position: 2, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'special', description: 'Science Symbol' } },
        { position: 3, cost: { type: 'any', amount: 3 }, effect: { type: 'special', description: 'Explore Level 2 Island (Draw 4 cards, keep 1) + 1 Point' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: 'Science Symbol + 2 Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'special', description: 'Explore Level 3 Island (Draw 4 cards, keep 1) + 3 Points' } },
        { position: 6, cost: { type: 'any', amount: 4 }, effect: { type: 'special', description: '2 Science Symbols + 4 Points' } }
      ]
    }
  },

  // 2 BLUE WONDER TRACK SHIPYARDS
  {
    id: 'balanced_shipyard',
    name: 'Balanced Shipyard',
    wonderTrack: 'blue',
    redTrack: {
      color: 'red',
      name: 'Naval Guard',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'any', amount: 1, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 1 Point' } },
        { position: 2, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength' } },
        { position: 3, cost: { type: 'any', amount: 1, options: ['ore'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 2 Points' } },
        { position: 4, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'military', value: 2, description: '2 Naval Strength' } },
        { position: 5, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 3, description: '3 Naval Strength + 1 Point' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'military', value: 5, description: '5 Naval Strength + 2 Points' } }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Trading Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'coins', amount: 2 }, effect: { type: 'commercial', value: 1, description: 'Commercial Level 1 + 1 Point', commercialLevel: 1 } },
        { position: 2, cost: { type: 'coins', amount: 1 }, effect: { type: 'tax', description: '3 Coins', value: 3 } },
        { position: 3, cost: { type: 'coins', amount: 3 }, effect: { type: 'commercial', value: 2, description: 'Commercial Level 2 + 3 Points', commercialLevel: 2 } },
        { position: 4, cost: { type: 'coins', amount: 2 }, effect: { type: 'tax', description: '4 Coins + 1 Point', value: 4 } },
        { position: 5, cost: { type: 'coins', amount: 4 }, effect: { type: 'commercial', value: 3, description: 'Commercial Level 3 + 2 Coins', commercialLevel: 3 } },
        { position: 6, cost: { type: 'coins', amount: 5 }, effect: { type: 'commercial', value: 4, description: 'Commercial Level 4 + 5 Coins + 2 Points', commercialLevel: 4 } }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Victory Points Fleet',
      spaces: [
        { position: 0, cost: null, effect: null, hasWonderSymbol: true },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 3, description: '3 Victory Points' } },
        { position: 2, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 4, description: '4 Victory Points' } },
        { position: 3, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'points', value: 6, description: '6 Victory Points' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'points', value: 8, description: '8 Victory Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'points', value: 11, description: '11 Victory Points' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'points', value: 15, description: '15 Victory Points' } }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Explorer Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 2 }, effect: { type: 'special', description: 'Science Symbol + 1 Point' } },
        { position: 2, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'special', description: 'Explore Level 1 Island (Draw 4 cards, keep 1)' } },
        { position: 3, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: 'Science Symbol + 2 Points' } },
        { position: 4, cost: { type: 'any', amount: 3 }, effect: { type: 'special', description: 'Explore Level 2 Island (Draw 4 cards, keep 1) + 1 Point' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'special', description: '2 Science Symbols' } },
        { position: 6, cost: { type: 'any', amount: 4 }, effect: { type: 'special', description: 'Explore Level 3 Island (Draw 4 cards, keep 1) + 3 Science + 5 Points' } }
      ]
    }
  },
  {
    id: 'glory_shipyard',
    name: 'Glory Shipyard',
    wonderTrack: 'blue',
    redTrack: {
      color: 'red',
      name: 'Honor Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'any', amount: 1, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 2 Points' } },
        { position: 2, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 2, description: '2 Naval Strength' } },
        { position: 3, cost: { type: 'any', amount: 1, options: ['ore'] }, effect: { type: 'military', value: 2, description: '2 Naval Strength + 1 Point' } },
        { position: 4, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'military', value: 3, description: '3 Naval Strength + 1 Point' } },
        { position: 5, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 4, description: '4 Naval Strength + 2 Points' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'military', value: 6, description: '6 Naval Strength + 4 Points' } }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Wealth Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'coins', amount: 1 }, effect: { type: 'commercial', value: 1, description: 'Commercial Level 1 + 2 Points', commercialLevel: 1 } },
        { position: 2, cost: { type: 'coins', amount: 2 }, effect: { type: 'tax', description: '4 Coins + 1 Point', value: 4 } },
        { position: 3, cost: { type: 'coins', amount: 3 }, effect: { type: 'commercial', value: 2, description: 'Commercial Level 2 + 3 Points', commercialLevel: 2 } },
        { position: 4, cost: { type: 'coins', amount: 4 }, effect: { type: 'tax', description: '5 Coins + 2 Points', value: 5 } },
        { position: 5, cost: { type: 'coins', amount: 5 }, effect: { type: 'commercial', value: 3, description: 'Commercial Level 3 + 4 Points', commercialLevel: 3 } },
        { position: 6, cost: { type: 'coins', amount: 6 }, effect: { type: 'commercial', value: 4, description: 'Commercial Level 4 + 7 Coins + 3 Points', commercialLevel: 4 } }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Victory Points Fleet',
      spaces: [
        { position: 0, cost: null, effect: null, hasWonderSymbol: true },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 4, description: '4 Victory Points' } },
        { position: 2, cost: { type: 'raw', amount: 2 }, effect: { type: 'points', value: 6, description: '6 Victory Points' } },
        { position: 3, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'points', value: 8, description: '8 Victory Points' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'points', value: 10, description: '10 Victory Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'points', value: 13, description: '13 Victory Points' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'points', value: 17, description: '17 Victory Points' } }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Discovery Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'special', description: 'Science Symbol + 2 Points' } },
        { position: 2, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'special', description: 'Explore Level 1 Island + 2 Points' } },
        { position: 3, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: 'Science Symbol + 3 Points' } },
        { position: 4, cost: { type: 'any', amount: 3 }, effect: { type: 'special', description: 'Explore Level 2 Island + 3 Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'special', description: '2 Science Symbols + 2 Points' } },
        { position: 6, cost: { type: 'any', amount: 4 }, effect: { type: 'special', description: 'Explore Level 3 Island + 3 Science + 6 Points' } }
      ]
    }
  },

  // 2 GREEN WONDER TRACK SHIPYARDS
  {
    id: 'discovery_shipyard',
    name: 'Discovery Shipyard',
    wonderTrack: 'green',
    redTrack: {
      color: 'red',
      name: 'Escort Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 1 Point' } },
        { position: 2, cost: { type: 'any', amount: 1, options: ['ore'] }, effect: { type: 'military', value: 2, description: '2 Naval Strength' } },
        { position: 3, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 2, description: '2 Naval Strength + 1 Point' } },
        { position: 4, cost: { type: 'manufactured', amount: 1, options: ['glass', 'loom', 'papyrus'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 3 Points' } },
        { position: 5, cost: { type: 'any', amount: 3, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 3, description: '3 Naval Strength + 2 Points' } },
        { position: 6, cost: { type: 'any', amount: 2, options: ['manufactured'] }, effect: { type: 'military', value: 4, description: '4 Naval Strength + 4 Points' } }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Supply Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'coins', amount: 2 }, effect: { type: 'commercial', value: 1, description: 'Commercial Level 1 + 2 Points', commercialLevel: 1 } },
        { position: 2, cost: { type: 'coins', amount: 2 }, effect: { type: 'tax', description: '3 Coins + 2 Points', value: 3 } },
        { position: 3, cost: { type: 'coins', amount: 3 }, effect: { type: 'commercial', value: 2, description: 'Commercial Level 2 + 4 Points', commercialLevel: 2 } },
        { position: 4, cost: { type: 'coins', amount: 4 }, effect: { type: 'tax', description: '4 Coins + 3 Points', value: 4 } },
        { position: 5, cost: { type: 'coins', amount: 5 }, effect: { type: 'commercial', value: 3, description: 'Commercial Level 3 + 5 Points', commercialLevel: 3 } },
        { position: 6, cost: { type: 'coins', amount: 6 }, effect: { type: 'commercial', value: 4, description: 'Commercial Level 4 + 6 Points + Tax 4', commercialLevel: 4, taxAmount: 4 } }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Achievement Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 2, description: '2 Victory Points + 1 Science' } },
        { position: 2, cost: { type: 'raw', amount: 2 }, effect: { type: 'points', value: 4, description: '4 Victory Points + 1 Science' } },
        { position: 3, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'points', value: 6, description: '6 Victory Points + 1 Science' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'points', value: 8, description: '8 Victory Points + 1 Science' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'points', value: 10, description: '10 Victory Points + 2 Science' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'points', value: 14, description: '14 Victory Points + 2 Science' } }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Exploration Fleet',
      spaces: [
        { position: 0, cost: null, effect: null, hasWonderSymbol: true },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'special', description: 'Explore Level 1 Island + Science Symbol' } },
        { position: 2, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'special', description: '2 Science Symbols' } },
        { position: 3, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: 'Explore Level 2 Island + Science Symbol + 2 Points' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: '2 Science Symbols + 3 Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'special', description: 'Explore Level 3 Island + 2 Science + 2 Points' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'special', description: '3 Science Symbols + Explore All Islands + 7 Points' } }
      ]
    }
  },
  {
    id: 'exploration_shipyard',
    name: 'Exploration Shipyard',
    wonderTrack: 'green',
    redTrack: {
      color: 'red',
      name: 'Guardian Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'any', amount: 1, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 1 Science' } },
        { position: 2, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay'] }, effect: { type: 'military', value: 2, description: '2 Naval Strength + 1 Point' } },
        { position: 3, cost: { type: 'any', amount: 1, options: ['ore'] }, effect: { type: 'military', value: 1, description: '1 Naval Strength + 1 Science + 1 Point' } },
        { position: 4, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'military', value: 2, description: '2 Naval Strength + 1 Science' } },
        { position: 5, cost: { type: 'any', amount: 2, options: ['wood', 'stone', 'clay', 'ore'] }, effect: { type: 'military', value: 3, description: '3 Naval Strength + 2 Science' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'military', value: 5, description: '5 Naval Strength + 2 Science + 3 Points' } }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Resource Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'coins', amount: 1 }, effect: { type: 'commercial', value: 1, description: 'Commercial Level 1 + 1 Science', commercialLevel: 1 } },
        { position: 2, cost: { type: 'coins', amount: 2 }, effect: { type: 'tax', description: '2 Coins + 1 Science + 1 Point', value: 2 } },
        { position: 3, cost: { type: 'coins', amount: 3 }, effect: { type: 'commercial', value: 2, description: 'Commercial Level 2 + 1 Science + 2 Points', commercialLevel: 2 } },
        { position: 4, cost: { type: 'coins', amount: 3 }, effect: { type: 'tax', description: '3 Coins + 1 Science + 2 Points', value: 3 } },
        { position: 5, cost: { type: 'coins', amount: 4 }, effect: { type: 'commercial', value: 3, description: 'Commercial Level 3 + 2 Science + 2 Points', commercialLevel: 3 } },
        { position: 6, cost: { type: 'coins', amount: 5 }, effect: { type: 'commercial', value: 4, description: 'Commercial Level 4 + 2 Science + 4 Points + Tax 2', commercialLevel: 4, taxAmount: 2 } }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Knowledge Fleet',
      spaces: [
        { position: 0, cost: null, effect: null },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'points', value: 2, description: '2 Victory Points + 1 Science' } },
        { position: 2, cost: { type: 'raw', amount: 2 }, effect: { type: 'points', value: 4, description: '4 Victory Points + 1 Science' } },
        { position: 3, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'points', value: 5, description: '5 Victory Points + 2 Science' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'points', value: 7, description: '7 Victory Points + 2 Science' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'points', value: 9, description: '9 Victory Points + 3 Science' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'points', value: 12, description: '12 Victory Points + 3 Science' } }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Discovery Fleet',
      spaces: [
        { position: 0, cost: null, effect: null, hasWonderSymbol: true },
        { position: 1, cost: { type: 'raw', amount: 1 }, effect: { type: 'special', description: '2 Science Symbols + 1 Point' } },
        { position: 2, cost: { type: 'manufactured', amount: 1 }, effect: { type: 'special', description: 'Explore Level 1 Island + Science Symbol + 1 Point' } },
        { position: 3, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: '2 Science Symbols + 3 Points' } },
        { position: 4, cost: { type: 'any', amount: 2 }, effect: { type: 'special', description: 'Explore Level 2 Island + 2 Science + 2 Points' } },
        { position: 5, cost: { type: 'manufactured', amount: 2 }, effect: { type: 'special', description: '3 Science Symbols + 3 Points' } },
        { position: 6, cost: { type: 'any', amount: 3 }, effect: { type: 'special', description: 'Explore Level 3 Island + 4 Science + 5 Points' } }
      ]
    }
  }
];

// Helper functions for shipyard statistics
export function getShipyardsByWonderTrack(track: 'red' | 'yellow' | 'blue' | 'green') {
  return ARMADA_SHIPYARDS.filter(shipyard => shipyard.wonderTrack === track);
}

export function getShipyardDistribution() {
  return {
    red: getShipyardsByWonderTrack('red').length,
    yellow: getShipyardsByWonderTrack('yellow').length,
    blue: getShipyardsByWonderTrack('blue').length,
    green: getShipyardsByWonderTrack('green').length,
    total: ARMADA_SHIPYARDS.length
  };
}

export function getRandomShipyards(count: number): ArmadaShipyard[] {
  if (count <= 0) return [];
  
  // Ensure we don't exceed available shipyards
  const maxCount = Math.min(count, ARMADA_SHIPYARDS.length);
  
  // Track how many of each wonder track color we've assigned
  const trackCounts = { red: 0, yellow: 0, blue: 0, green: 0 };
  const maxPerTrack = { red: 2, yellow: 1, blue: 2, green: 2 };
  
  const selected: ArmadaShipyard[] = [];
  const available = [...ARMADA_SHIPYARDS];
  
  // Shuffle the available shipyards
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  
  // Select shipyards while respecting distribution limits
  for (const shipyard of available) {
    if (selected.length >= maxCount) break;
    
    // Check if we can add this shipyard without exceeding limits
    if (trackCounts[shipyard.wonderTrack] < maxPerTrack[shipyard.wonderTrack]) {
      selected.push(shipyard);
      trackCounts[shipyard.wonderTrack]++;
    }
  }
  
  return selected;
}

export function getBalancedRandomShipyards(playerCount: number): ArmadaShipyard[] {
  return getRandomShipyards(playerCount);
}

// Maintain backward compatibility
export const SHIPYARDS_DATABASE = ARMADA_SHIPYARDS;