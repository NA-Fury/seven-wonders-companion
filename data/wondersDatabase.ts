// data/wondersDatabase.ts - Updated with all expansion wonders
export interface Wonder {
  stages: any;
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  daySide: WonderSide;
  nightSide: WonderSide;
  resource: Resource;
  expansion: 'Base' | 'Leaders' | 'Cities' | 'Armada' | 'Edifice';
}

export interface WonderSide {
  name: string;
  stages: WonderStage[];
  specialAbility?: string;
  points: number;
  imageUrl?: string;
}

export interface WonderStage {
  cost: ResourceCost[];
  effect: StageEffect;
  points?: number;
}

export interface ResourceCost {
  resource: Resource;
  amount: number;
}

export interface StageEffect {
  type: 'Points' | 'Resource' | 'Military' | 'Science' | 'Commerce' | 'Special';
  value?: number;
  description: string;
}

export type Resource = 'Wood' | 'Stone' | 'Clay' | 'Ore' | 'Glass' | 'Loom' | 'Papyrus' | 'Coin';

export const WONDERS_DATABASE: Wonder[] = [
  // BASE GAME WONDERS
  {
      id: 'alexandria',
      name: 'The Lighthouse of Alexandria',
      description: 'Ancient wonder of learning and trade',
      difficulty: 'Beginner',
      resource: 'Glass',
      expansion: 'Base',
      daySide: {
          name: 'Alexandria A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 2 }],
                  effect: { type: 'Resource', description: 'Choose 1 Raw Material' }
              },
              {
                  cost: [{ resource: 'Glass', amount: 2 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Resource Flexibility'
      },
      nightSide: {
          name: 'Alexandria B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Clay', amount: 2 }],
                  effect: { type: 'Resource', description: 'Choose 1 Raw Material' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Resource', description: 'Choose 1 Manufactured Good' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 3 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Ultimate Resource Flexibility'
      },
      stages: undefined
  },
  {
      id: 'babylon',
      name: 'The Hanging Gardens of Babylon',
      description: 'Scientific marvel of the ancient world',
      difficulty: 'Advanced',
      resource: 'Clay',
      expansion: 'Base',
      daySide: {
          name: 'Babylon A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Clay', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 3 }],
                  effect: { type: 'Science', description: 'Science Symbol of Choice' }
              },
              {
                  cost: [{ resource: 'Clay', amount: 4 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Extra Science Turn'
      },
      nightSide: {
          name: 'Babylon B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Loom', amount: 1 }, { resource: 'Clay', amount: 1 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Wood', amount: 2 }],
                  effect: { type: 'Science', description: 'Science Symbol of Choice' }
              },
              {
                  cost: [{ resource: 'Papyrus', amount: 1 }, { resource: 'Clay', amount: 3 }],
                  effect: { type: 'Science', description: 'Science Symbol of Choice' }
              }
          ],
          specialAbility: 'Double Science Flexibility'
      },
      stages: undefined
  },
  {
      id: 'colossus',
      name: 'The Colossus of Rhodes',
      description: 'Mighty guardian of the harbor',
      difficulty: 'Intermediate',
      resource: 'Ore',
      expansion: 'Base',
      daySide: {
          name: 'Rhodes A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Clay', amount: 3 }],
                  effect: { type: 'Military', value: 2, description: '2 Military Strength' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 4 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Military Dominance'
      },
      nightSide: {
          name: 'Rhodes B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 3 }],
                  effect: { type: 'Military', value: 1, description: '1 Military + 3 Coins + 3 Points' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 4 }],
                  effect: { type: 'Military', value: 1, description: '1 Military + 4 Coins + 4 Points' }
              }
          ],
          specialAbility: 'Military + Economic Power'
      },
      stages: undefined
  },
  {
      id: 'artemis',
      name: 'The Temple of Artemis at Ephesus',
      description: 'Sacred temple of wealth and prosperity',
      difficulty: 'Beginner',
      resource: 'Papyrus',
      expansion: 'Base',
      daySide: {
          name: 'Ephesus A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Commerce', value: 9, description: '9 Coins' }
              },
              {
                  cost: [{ resource: 'Papyrus', amount: 2 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Economic Prosperity'
      },
      nightSide: {
          name: 'Ephesus B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Commerce', value: 4, description: '4 Coins + 3 Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Commerce', value: 4, description: '4 Coins + 4 Points' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 1 }, { resource: 'Papyrus', amount: 1 }, { resource: 'Glass', amount: 1 }],
                  effect: { type: 'Commerce', value: 4, description: '4 Coins + 5 Points' }
              }
          ],
          specialAbility: 'Incremental Wealth Building'
      },
      stages: undefined
  },
  {
      id: 'mausoleum',
      name: 'The Mausoleum of Halicarnassus',
      description: 'Eternal resting place with mystical powers',
      difficulty: 'Advanced',
      resource: 'Loom',
      expansion: 'Base',
      daySide: {
          name: 'Halicarnassus A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Clay', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 3 }],
                  effect: { type: 'Special', description: 'Play Discarded Card' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 2 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Discard Pile Access'
      },
      nightSide: {
          name: 'Halicarnassus B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Ore', amount: 2 }],
                  effect: { type: 'Special', description: 'Play Discarded Card + 2 Points' }
              },
              {
                  cost: [{ resource: 'Clay', amount: 3 }],
                  effect: { type: 'Special', description: 'Play Discarded Card + 1 Point' }
              },
              {
                  cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }, { resource: 'Loom', amount: 1 }],
                  effect: { type: 'Special', description: 'Play Discarded Card' }
              }
          ],
          specialAbility: 'Triple Discard Access'
      },
      stages: undefined
  },
  {
      id: 'olympia',
      name: 'The Statue of Zeus at Olympia',
      description: 'Divine statue of the king of gods',
      difficulty: 'Intermediate',
      resource: 'Wood',
      expansion: 'Base',
      daySide: {
          name: 'Olympia A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Special', description: 'Free Construction' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 2 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Free Building'
      },
      nightSide: {
          name: 'Olympia B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Commerce', description: 'Trade Discount + 3 Points' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Commerce', value: 5, description: '5 Coins + 5 Points' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 1 }, { resource: 'Ore', amount: 2 }],
                  effect: { type: 'Special', description: 'Copy Guild + 2 Points' }
              }
          ],
          specialAbility: 'Guild Copying Power'
      },
      stages: undefined
  },
  {
      id: 'giza',
      name: 'The Great Pyramid of Giza',
      description: 'Eternal monument to divine pharaohs',
      difficulty: 'Beginner',
      resource: 'Stone',
      expansion: 'Base',
      daySide: {
          name: 'Giza A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 3 }],
                  effect: { type: 'Points', value: 5, description: '5 Victory Points' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 4 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Pure Victory Points'
      },
      nightSide: {
          name: 'Giza B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 3 }],
                  effect: { type: 'Points', value: 5, description: '5 Victory Points' }
              },
              {
                  cost: [{ resource: 'Clay', amount: 3 }],
                  effect: { type: 'Points', value: 5, description: '5 Victory Points' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 4 }, { resource: 'Papyrus', amount: 1 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Maximum Victory Points'
      },
      stages: undefined
  },

  // LEADERS EXPANSION WONDERS
  {
      id: 'rome',
      name: 'The Forum Romanum',
      description: 'Center of Roman power and politics',
      difficulty: 'Intermediate',
      resource: 'Stone',
      expansion: 'Leaders',
      daySide: {
          name: 'Rome A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Commerce', value: 5, description: '5 Coins' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 2 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Leadership Focus'
      },
      nightSide: {
          name: 'Rome B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Commerce', value: 4, description: '4 Coins + 2 Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Ore', amount: 1 }],
                  effect: { type: 'Special', description: 'Free Leader + 2 Points' }
              },
              {
                  cost: [{ resource: 'Clay', amount: 2 }, { resource: 'Stone', amount: 1 }],
                  effect: { type: 'Points', value: 6, description: '6 Victory Points' }
              }
          ],
          specialAbility: 'Enhanced Leadership'
      },
      stages: undefined
  },
  {
      id: 'abu_simbel',
      name: 'The Temple of Abu Simbel',
      description: 'Colossal monument to Ramesses II',
      difficulty: 'Advanced',
      resource: 'Clay',
      expansion: 'Leaders',
      daySide: {
          name: 'Abu Simbel A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Clay', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }, { resource: 'Glass', amount: 1 }],
                  effect: { type: 'Special', description: 'Recruit Leader for Free' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 2 }, { resource: 'Loom', amount: 1 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Divine Leadership'
      },
      nightSide: {
          name: 'Abu Simbel B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Clay', amount: 2 }],
                  effect: { type: 'Special', description: 'Recruit Leader + 1 Point' }
              },
              {
                  cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }],
                  effect: { type: 'Special', description: 'Recruit Leader + 3 Points' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 1 }, { resource: 'Stone', amount: 2 }],
                  effect: { type: 'Special', description: 'Recruit Leader + 5 Points' }
              }
          ],
          specialAbility: 'Triple Leadership Recruitment'
      },
      stages: undefined
  },

  // CITIES EXPANSION WONDERS
  {
      id: 'byzantium',
      name: 'The Hagia Sophia',
      description: 'Architectural marvel of the Byzantine Empire',
      difficulty: 'Intermediate',
      resource: 'Glass',
      expansion: 'Cities',
      daySide: {
          name: 'Byzantium A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }, { resource: 'Glass', amount: 1 }],
                  effect: { type: 'Special', description: 'Diplomacy Token' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 3 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Diplomatic Immunity'
      },
      nightSide: {
          name: 'Byzantium B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Commerce', value: 4, description: '4 Coins + 2 Points' }
              },
              {
                  cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }],
                  effect: { type: 'Special', description: 'Diplomacy + Trade Bonus' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 2 }],
                  effect: { type: 'Points', value: 6, description: '6 Victory Points' }
              }
          ],
          specialAbility: 'Enhanced Diplomacy'
      },
      stages: undefined
  },
  {
      id: 'petra',
      name: 'The Treasury of Petra',
      description: 'Rose-red city carved from stone',
      difficulty: 'Advanced',
      resource: 'Stone',
      expansion: 'Cities',
      daySide: {
          name: 'Petra A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Ore', amount: 1 }, { resource: 'Clay', amount: 1 }],
                  effect: { type: 'Commerce', value: 8, description: '8 Coins' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 1 }, { resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }],
                  effect: { type: 'Points', value: 8, description: '8 Victory Points' }
              }
          ],
          specialAbility: 'Trading Hub'
      },
      nightSide: {
          name: 'Petra B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Commerce', value: 3, description: '3 Coins + 1 Point' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Commerce', value: 5, description: '5 Coins + 2 Points' }
              },
              {
                  cost: [{ resource: 'Clay', amount: 2 }, { resource: 'Ore', amount: 1 }],
                  effect: { type: 'Commerce', value: 7, description: '7 Coins + 3 Points' }
              }
          ],
          specialAbility: 'Incremental Wealth'
      },
      stages: undefined
  },

  // ARMADA EXPANSION WONDERS
  {
      id: 'siracusa',
      name: 'The Fortress of Siracusa',
      description: 'Impregnable naval fortress of Sicily',
      difficulty: 'Intermediate',
      resource: 'Stone',
      expansion: 'Armada',
      daySide: {
          name: 'Siracusa A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Military', value: 2, description: '2 Naval Strength' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 3 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Naval Supremacy'
      },
      nightSide: {
          name: 'Siracusa B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Military', value: 1, description: '1 Naval + 2 Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Clay', amount: 1 }],
                  effect: { type: 'Special', description: 'Advance Fleet + 3 Points' }
              },
              {
                  cost: [{ resource: 'Ore', amount: 2 }, { resource: 'Glass', amount: 1 }],
                  effect: { type: 'Military', value: 2, description: '2 Naval + 4 Points' }
              }
          ],
          specialAbility: 'Enhanced Naval Power'
      },
      stages: undefined
  },

  // EDIFICE EXPANSION WONDERS
  {
      id: 'ur',
      name: 'The Ziggurat of Ur',
      description: 'Ancient temple tower reaching to the heavens',
      difficulty: 'Advanced',
      resource: 'Clay',
      expansion: 'Edifice',
      daySide: {
          name: 'Ur A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Clay', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 2 }],
                  effect: { type: 'Special', description: 'Edifice Bonus' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 2 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Divine Construction'
      },
      nightSide: {
          name: 'Ur B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Clay', amount: 2 }],
                  effect: { type: 'Special', description: 'Build Edifice + 2 Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Stone', amount: 1 }],
                  effect: { type: 'Special', description: 'Edifice Advancement + 3 Points' }
              },
              {
                  cost: [{ resource: 'Glass', amount: 1 }, { resource: 'Papyrus', amount: 1 }],
                  effect: { type: 'Points', value: 6, description: '6 Victory Points' }
              }
          ],
          specialAbility: 'Enhanced Edifice Building'
      },
      stages: undefined
  },
  {
      id: 'carthage',
      name: 'The Ports of Carthage',
      description: 'Commercial empire of the Mediterranean',
      difficulty: 'Intermediate',
      resource: 'Ore',
      expansion: 'Edifice',
      daySide: {
          name: 'Carthage A',
          points: 3,
          stages: [
              {
                  cost: [{ resource: 'Ore', amount: 2 }],
                  effect: { type: 'Points', value: 3, description: '3 Victory Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 2 }],
                  effect: { type: 'Commerce', value: 6, description: '6 Coins' }
              },
              {
                  cost: [{ resource: 'Stone', amount: 3 }],
                  effect: { type: 'Points', value: 7, description: '7 Victory Points' }
              }
          ],
          specialAbility: 'Commercial Network'
      },
      nightSide: {
          name: 'Carthage B',
          points: 0,
          stages: [
              {
                  cost: [{ resource: 'Ore', amount: 2 }],
                  effect: { type: 'Commerce', value: 4, description: '4 Coins + 2 Points' }
              },
              {
                  cost: [{ resource: 'Wood', amount: 1 }, { resource: 'Clay', amount: 1 }],
                  effect: { type: 'Special', description: 'Trade Bonus + Edifice' }
              },
              {
                  cost: [{ resource: 'Loom', amount: 1 }, { resource: 'Papyrus', amount: 1 }],
                  effect: { type: 'Commerce', value: 8, description: '8 Coins + 4 Points' }
              }
          ],
          specialAbility: 'Enhanced Commerce & Building'
      },
      stages: undefined
  }
];

// Shipyard data for Armada expansion - Updated with proper structure
export interface Shipyard {
  id: string;
  name: string;
  description: string;
  redTrack: ShipyardTrack;
  yellowTrack: ShipyardTrack;
  blueTrack: ShipyardTrack;
  greenTrack: ShipyardTrack;
}

export interface ShipyardTrack {
  color: 'red' | 'yellow' | 'blue' | 'green';
  name: string;
  levels: ShipyardLevel[];
}

export interface ShipyardLevel {
  cost: number; // Cost in coins to advance
  reward: string; // What you get for reaching this level
}

// Legacy shipyard structure for backward compatibility
export const SHIPYARDS_DATABASE: Shipyard[] = [
  {
    id: 'military_port',
    name: 'Military Port',
    description: 'Focused on naval warfare and military dominance',
    redTrack: {
      color: 'red',
      name: 'War Fleet',
      levels: [
        { cost: 1, reward: '1 Military Shield' },
        { cost: 2, reward: '2 Military Shields' },
        { cost: 3, reward: '1 Military + 3 Points' },
        { cost: 4, reward: '2 Military + 1 Point' }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Trade Fleet',
      levels: [
        { cost: 2, reward: '3 Coins' },
        { cost: 3, reward: '3 Coins + 1 Point' },
        { cost: 4, reward: '5 Coins' },
        { cost: 5, reward: '2 Coins + 3 Points' }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Exploration Fleet',
      levels: [
        { cost: 1, reward: '3 Points' },
        { cost: 2, reward: '5 Points' },
        { cost: 3, reward: '2 Points' },
        { cost: 4, reward: '7 Points' }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Science Fleet',
      levels: [
        { cost: 2, reward: 'Science Symbol' },
        { cost: 3, reward: 'Science Symbol + 1 Point' },
        { cost: 4, reward: 'Science Symbol + 2 Points' },
        { cost: 5, reward: '2 Science Symbols' }
      ]
    }
  },
  {
    id: 'commercial_port',
    name: 'Commercial Port',
    description: 'Specialized in trade and economic prosperity',
    redTrack: {
      color: 'red',
      name: 'Defense Fleet',
      levels: [
        { cost: 2, reward: '1 Military Shield' },
        { cost: 3, reward: '1 Military + 1 Point' },
        { cost: 4, reward: '2 Military Shields' },
        { cost: 5, reward: '1 Military + 2 Points' }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Merchant Fleet',
      levels: [
        { cost: 1, reward: '4 Coins' },
        { cost: 2, reward: '2 Coins + 2 Points' },
        { cost: 3, reward: '6 Coins' },
        { cost: 4, reward: '3 Coins + 2 Points' }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Discovery Fleet',
      levels: [
        { cost: 2, reward: '4 Points' },
        { cost: 3, reward: '4 Points' },
        { cost: 4, reward: '3 Points' },
        { cost: 5, reward: '6 Points' }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Research Fleet',
      levels: [
        { cost: 3, reward: 'Science Symbol' },
        { cost: 4, reward: 'Science Symbol + 1 Point' },
        { cost: 5, reward: 'Science Symbol + 3 Points' },
        { cost: 6, reward: '2 Science Symbols + 1 Point' }
      ]
    }
  },
  {
    id: 'balanced_port',
    name: 'Balanced Port',
    description: 'Well-rounded approach to naval development',
    redTrack: {
      color: 'red',
      name: 'Naval Guard',
      levels: [
        { cost: 1, reward: '1 Military + 1 Point' },
        { cost: 2, reward: '1 Military Shield' },
        { cost: 3, reward: '1 Military + 2 Points' },
        { cost: 4, reward: '2 Military Shields' }
      ]
    },
    yellowTrack: {
      color: 'yellow',
      name: 'Trading Fleet',
      levels: [
        { cost: 2, reward: '3 Coins + 1 Point' },
        { cost: 3, reward: '4 Coins' },
        { cost: 4, reward: '2 Coins + 3 Points' },
        { cost: 5, reward: '5 Coins' }
      ]
    },
    blueTrack: {
      color: 'blue',
      name: 'Explorer Fleet',
      levels: [
        { cost: 1, reward: '3 Points' },
        { cost: 2, reward: '4 Points' },
        { cost: 3, reward: '4 Points' },
        { cost: 4, reward: '6 Points' }
      ]
    },
    greenTrack: {
      color: 'green',
      name: 'Learning Fleet',
      levels: [
        { cost: 2, reward: 'Science Symbol + 1 Point' },
        { cost: 3, reward: 'Science Symbol' },
        { cost: 4, reward: 'Science Symbol + 2 Points' },
        { cost: 5, reward: '2 Science Symbols' }
      ]
    }
  }
];