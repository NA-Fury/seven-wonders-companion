import { getLeaderByName } from '@/data/leadersDatabase';

type WonderStage = { points?: number; effect?: { description?: string } };

export type WonderScoreInput = {
  wonderId: string;
  stages: WonderStage[];
  detailedData: Record<string, any>;
};

export type WonderScoreResult = {
  points: number;
  carthageScienceStageKeys: string[];
};

const CARTHAGE_CHOICE_VP = /Choose: Gain 7 Coins OR \+1 Military Strength \+ 2 VP/i;
const CARTHAGE_LEFT_RIGHT = /LEFT: Gain 7 Coins \+ 4 VP; RIGHT: \+2 Military Strength/i;
const CARTHAGE_SCIENCE = /Endgame Science symbol of your choice/i;

/**
 * Pure wonder-stage scoring with special-case handling.
 * - Carthage: VP depends on left/right choice and grants a science choice token.
 * - Abu Simbel: buried leader cost is doubled as VP.
 */
export function calculateWonderStagePoints(input: WonderScoreInput): WonderScoreResult {
  const { wonderId, stages, detailedData } = input;
  let points = 0;
  const carthageScienceStageKeys: string[] = [];

  stages.forEach((stage, index) => {
    const stageKey = `stage${index + 1}`;
    if (!detailedData[stageKey]) return;

    let stagePoints = stage?.points || 0;
    const desc = stage?.effect?.description || '';

    if (wonderId === 'carthage') {
      if (CARTHAGE_CHOICE_VP.test(desc)) {
        stagePoints = 2;
      }
      if (CARTHAGE_LEFT_RIGHT.test(desc)) {
        const choice = detailedData[`${stageKey}Choice`];
        stagePoints = choice === 'left' ? 4 : 0;
      }
      if (CARTHAGE_SCIENCE.test(desc)) {
        const choice = detailedData[`${stageKey}Choice`];
        const alreadyApplied = detailedData[`${stageKey}ChoiceSciApplied`];
        if (choice === 'right' && !alreadyApplied) {
          carthageScienceStageKeys.push(stageKey);
        }
      }
    }

    points += stagePoints;
  });

  if (wonderId === 'abu_simbel') {
    const addBurialScore = (slotIdx: number) => {
      const stageKey = `stage${slotIdx}`;
      if (!detailedData[stageKey]) return 0;
      const leaderName = detailedData[`${stageKey}BuriedLeaderName`];
      if (!leaderName) return 0;
      const leader = getLeaderByName(leaderName);
      if (!leader) return 0;

      let costPaid = leader.cost || 0;
      if (leader.costType === 'age') {
        const ageValue = parseInt(String(detailedData[`${stageKey}BuriedLeaderAge`] || ''), 10);
        if (!ageValue || ageValue < 1 || ageValue > 3) return 0;
        costPaid = ageValue;
      }
      return costPaid * 2;
    };

    points += addBurialScore(1);
    points += addBurialScore(2);
    points += addBurialScore(3);
  }

  return { points, carthageScienceStageKeys };
}
