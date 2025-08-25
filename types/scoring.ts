// Enhanced comprehensive types for the scoring system
export type EdificeProject = {
  id: string;
  name: string;
  contributionLevel: number;
  pointsEarned: number;
  completed: boolean;
};

export type PlayerWonderData = {
  wonderId: string;
  side: 'day' | 'night';
  maxStages: number;
  stagePoints: number[];
};

export type PlayerShipyardData = {
  shipyardId: string;
  name: string;
  wonderTrack: string;
};

// Enhanced category tracking with detailed breakdown
export type PlayerScoreCategory = {
  directPoints?: number;
  calculatedPoints?: number;
  stagesBuilt?: boolean[];
  isComplete?: boolean;
  pendingCalculation?: boolean;
  detailsEntered?: boolean;
};

// Detailed tracking types
export type TreasureData = {
  totalCoins?: number;
  permanentDebt?: number;
  taxDebt?: number;
  piracyDebt?: number;
  commercialDebt?: number;
  calculatedPoints?: number;
};

export type MilitaryData = {
  totalStrength?: number;
  strengthPerAge?: [number, number, number];
  playedDoveDiplomacy?: boolean;
  doveAges?: boolean[];
  boardingApplied?: number;
  boardingReceived?: number;
  chainLinks?: number;
  victoryPoints?: number;
};

export type NavyData = {
  totalStrength?: number;
  playedBlueDove?: boolean;
  doveAges?: boolean[];
  shipyardPosition?: { blue?: number; yellow?: number; green?: number };
  victoryPoints?: number;
};

export type CardCategoryData = {
  totalCards?: number;
  chainLinksUsed?: number;
  shipyardPosition?: number;
  pointGivingCards?: number;
  expansionCards?: { cities?: number; armada?: number; islands?: number };
  calculatedFromStacking?: number;
};

export type ScienceData = {
  compass?: number;
  tablet?: number;
  gear?: number;
  nonCardInstruments?: { compass?: number; tablet?: number; gear?: number };
  calculatedPoints?: number;
};

export type PlayerScoreData = {
  playerId: string;
  playerName: string;
  position: number;
  wonderData: PlayerWonderData;
  shipyardData?: PlayerShipyardData;
  gameMetadata?: {
    dateTime?: Date;
    location?: string;
    anonymous?: boolean;
  };
  scoring: {
    total: number;
    pendingCalculations?: boolean;
    isComplete?: boolean;
    wonder?: PlayerScoreCategory & {
      edificeStage?: { completed?: boolean; edificeType?: 'I' | 'II' | 'III' };
    };
    treasure?: PlayerScoreCategory & TreasureData;
    military?: PlayerScoreCategory & MilitaryData;
    civilian?: PlayerScoreCategory & CardCategoryData;
    commercial?: PlayerScoreCategory & CardCategoryData;
    guilds?: PlayerScoreCategory & { cardsPlayed?: string[] };
    science?: PlayerScoreCategory & ScienceData;
    leaders?: PlayerScoreCategory & { leadersPlayed?: string[] };
    cities?: PlayerScoreCategory & CardCategoryData;
    armada?: PlayerScoreCategory & CardCategoryData;
    navy?: PlayerScoreCategory & NavyData;
    edifice?: PlayerScoreCategory & { 
      rewardsEarned?: number; 
      penaltiesIncurred?: number;
      projectsContributed?: string[];
    };
    islands?: PlayerScoreCategory & { islandCards?: string[] };
    resources?: PlayerScoreCategory & { brownCards?: number; greyCards?: number };
    purpleCards?: PlayerScoreCategory & { cardsPlayed?: string[] };
    blackCards?: PlayerScoreCategory & { 
      cardsPlayed?: string[];
      pointCards?: number;
      neighborEffects?: { positive?: number; negative?: number };
      peaceDoveTokens?: number;
    };
  };
};
