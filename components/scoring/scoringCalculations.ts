// components/scoring/scoringCalculations.ts
import type { PlayerScoreData as DetailedScoreData } from '../../store/scoringStore';

export interface CalculationContext {
  wonder?: any;
  expansions?: any;
}

type CategoryId =
  | 'wonder'
  | 'treasure'
  | 'military'
  | 'civilian'
  | 'commercial'
  | 'science'
  | 'guilds'
  | 'cities'
  | 'leaders'
  | 'navy'
  | 'island'
  | 'edifice';

// Per-player-score cache
const calculationCache = new WeakMap<DetailedScoreData, Map<string, number>>();

export function getDirectPoints(score: DetailedScoreData, categoryId: string): number {
  const field = `${categoryId}Points` as keyof DetailedScoreData;
  return (score[field] as number) ?? 0;
}

export function calculateCategoryPoints(
  _playerId: string,
  categoryId: string,
  score: DetailedScoreData,
  _ctx: CalculationContext,
  useCache = true
): number {
  if (categoryId === 'resources' || categoryId === 'bonus') return 0;

  const direct = getDirectPoints(score, categoryId);
  if (categoryId !== 'science' && categoryId !== 'treasure' && direct !== undefined) {
    return direct;
  }

  if (useCache) {
    let cache = calculationCache.get(score);
    if (!cache) {
      cache = new Map();
      calculationCache.set(score, cache);
    }
    const hit = cache.get(categoryId);
    if (hit !== undefined) return hit;
  }

  let result = 0;

  switch (categoryId as CategoryId) {
    case 'treasure': {
      const coins = score.totalCoins ?? 0;
      const totalDebt =
        (score.permanentDebt ?? 0) +
        (score.cardDebt ?? 0) +
        (score.taxDebt ?? 0) +
        (score.piracyDebt ?? 0) +
        (score.commercialPotTaxes ?? 0);
      result = direct || Math.floor(coins / 3) - totalDebt;
      break;
    }
    case 'science': {
      const compass = (score.scienceCompass ?? 0) + (score.nonCardCompass ?? 0);
      const tablet = (score.scienceTablet ?? 0) + (score.nonCardTablet ?? 0);
      const gear = (score.scienceGear ?? 0) + (score.nonCardGear ?? 0);
      result =
        direct ||
        compass * compass + tablet * tablet + gear * gear + Math.min(compass, tablet, gear) * 7;
      break;
    }
    case 'wonder': {
      result = score.wonderPoints ?? 0;
      break;
    }
    default: {
      result = direct || 0;
    }
  }

  if (useCache) {
    calculationCache.get(score)!.set(categoryId, result);
  }
  return result;
}

export function calculateTotalScore(
  playerId: string,
  score: DetailedScoreData,
  ctx: CalculationContext
) {
  const cats: CategoryId[] = [
    'wonder',
    'treasure',
    'military',
    'civilian',
    'commercial',
    'science',
    'guilds',
    'cities',
    'leaders',
    'navy',
    'island',
    'edifice',
  ];
  return cats.reduce((sum, c) => sum + calculateCategoryPoints(playerId, c, score, ctx, true), 0);
}
