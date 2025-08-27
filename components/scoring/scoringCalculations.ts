// components/scoring/scoringCalculations.ts
import { DetailedScoreData } from '../../store/scoringStore';

export interface CalculationContext {
  wonder?: any;
  expansions?: any;
}

const categoryPointsCache = new Map<string, number>();

export function clearCategoryPointsCache() {
  categoryPointsCache.clear();
}

type CategoryId =
  | 'wonder' | 'treasure' | 'military' | 'civilian' | 'commercial'
  | 'science' | 'guilds' | 'resources' | 'cities' | 'leaders'
  | 'navy' | 'islands' | 'edifice';

export function calculateCategoryPoints(
  playerId: string,
  categoryId: string,
  score: DetailedScoreData,
  context: CalculationContext,
  useCache: boolean = true
): number {
  const cacheKey = `${playerId}-${categoryId}`;
  if (useCache && categoryPointsCache.has(cacheKey)) {
    return categoryPointsCache.get(cacheKey)!;
  }

  let result = 0;

  switch (categoryId as CategoryId) {
    case 'wonder':
      result = (score.wonderDirectPoints || 0);
      break;
    case 'treasure':
      result = (score.treasureDirectPoints || 0);
      break;
    case 'military':
      result = (score.militaryDirectPoints || 0);
      break;
    case 'civilian':
      result = (score.civilianDirectPoints || 0);
      break;
    case 'commercial':
      result = (score.commercialDirectPoints || 0);
      break;
    case 'science':
      result = (score.scienceDirectPoints || 0);
      break;
    case 'guilds':
      result = (score.guildsDirectPoints || 0);
      break;
    case 'resources':
      result = (score.resourcesDirectPoints || 0);
      break;
    case 'cities':
      result = (score.citiesDirectPoints || 0);
      break;
    case 'leaders':
      result = (score.leadersDirectPoints || 0);
      break;
    case 'navy':
      result = (score.navyDirectPoints || 0);
      break;
    case 'islands':
      result = (score.islandDirectPoints || 0);
      break;
    case 'edifice':
      result = (score.edificeDirectPoints || 0);
      break;
    default:
      result = 0;
  }

  if (useCache) categoryPointsCache.set(cacheKey, result);
  return result;
}

export function calculateTotalScore(
  playerId: string,
  score: DetailedScoreData,
  context: CalculationContext
): number {
  const categories: CategoryId[] = [
    'wonder','treasure','military','civilian','commercial',
    'science','guilds','resources','cities','leaders','navy','islands','edifice'
  ];
  return categories.reduce(
    (sum, cat) => sum + calculateCategoryPoints(playerId, cat, score, context, true),
    0
  );
}