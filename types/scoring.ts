// Shared types for the scoring system
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

export type PlayerScoreCategory = {
  directPoints?: number;
  calculatedPoints?: number;
  stagesBuilt?: boolean[];
  isComplete?: boolean;
};

export type PlayerScoreData = {
  playerId: string;
  playerName: string;
  position: number;
  wonderData: PlayerWonderData;
  shipyardData?: PlayerShipyardData;
  scoring: {
    total: number;
    pendingCalculations?: boolean;
    isComplete?: boolean;
    wonder?: PlayerScoreCategory;
    military?: PlayerScoreCategory;
    civilian?: PlayerScoreCategory;
    commercial?: PlayerScoreCategory;
    guilds?: PlayerScoreCategory;
    science?: PlayerScoreCategory & {
      compass?: number;
      tablet?: number;
      gear?: number;
    };
    leaders?: PlayerScoreCategory;
    cities?: PlayerScoreCategory;
    armada?: PlayerScoreCategory;
    edifice?: PlayerScoreCategory;
  };
};
