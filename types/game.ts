// types/game.ts
export interface Player {
  id: string;
  name: string;
  wonder: Wonder;
  wonderSide: 'A' | 'B';
  leaders?: Leader[];
  cities?: City[];
  armada?: ArmadaCard[];
  edifices?: EdificeCard[];
}

export interface Wonder {
  name: string;
  resource?: Resource;
  stages: WonderStage[];
}

export interface WonderStage {
  cost: Resource[];
  effect: Effect;
  points?: number;
}

export interface Leader {
  name: string;
  cost: number;
  age: 1 | 2 | 3;
  effect: Effect;
  points?: number;
}

export interface City {
  name: string;
  type: 'Commercial' | 'Industrial' | 'Cultural' | 'Military';
  cost: Resource[];
  effect: Effect;
  points?: number;
}

export interface ArmadaCard {
  name: string;
  type: 'Red' | 'Blue' | 'Navigation';
  cost: Resource[];
  effect: Effect;
  points?: number;
}

export interface EdificeCard {
  name: string;
  cost: Resource[];
  effect: Effect;
  points?: number;
}

export type Resource = 
  | 'Wood' | 'Stone' | 'Clay' | 'Ore' 
  | 'Glass' | 'Loom' | 'Papyrus'
  | 'Coin';

export interface Effect {
  type: 'Resource' | 'Science' | 'Military' | 'Commerce' | 'Victory' | 'Special';
  value?: number;
  resource?: Resource;
  scienceSymbol?: 'Tablet' | 'Compass' | 'Gear';
}

export interface GameState {
  id: string;
  players: Player[];
  expansions: Expansion[];
  currentAge: 1 | 2 | 3;
  scores: PlayerScore[];
  startTime: Date;
  endTime?: Date;
}

export interface PlayerScore {
  playerId: string;
  military: number;
  treasury: number;
  wonder: number;
  civilian: number;
  commercial: number;
  guilds: number;
  science: number;
  leaders?: number;
  cities?: number;
  armada?: number;
  edifices?: number;
  debt?: number;
  total: number;
}

export type Expansion = 
  | 'Base'
  | 'Leaders' 
  | 'Cities'
  | 'Armada'
  | 'Edifice';