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
  | 'science' | 'guilds' | 'cities' | 'leaders'
  | 'navy' | 'islands' | 'edifice';

// Note: 'resources' and 'bonus' are explicitly NOT scoring categories

export function calculateCategoryPoints(
  playerId: string,
  categoryId: string,
  score: DetailedScoreData,
  context: CalculationContext,
  useCache: boolean = true
): number {
  // Non-scoring categories always return 0
  if (categoryId === 'resources' || categoryId === 'bonus') {
    return 0;
  }

  const cacheKey = `${playerId}-${categoryId}`;
  if (useCache && categoryPointsCache.has(cacheKey)) {
    return categoryPointsCache.get(cacheKey)!;
  }

  let result = 0;

  switch (categoryId as CategoryId) {
    case 'wonder':
      // Calculate based on stages built if available
      const wonderStages = (score as any).wonderStagesBuilt;
      if (wonderStages && context.wonder) {
        const wonderData = context.wonder;
        const wonder = wonderData?.boardId;
        if (wonder) {
          // Add logic to calculate from stages
          result = score.wonderDirectPoints || 0;
        } else {
          result = score.wonderDirectPoints || 0;
        }
      } else {
        result = score.wonderDirectPoints || 0;
      }
      break;
      
    case 'treasure':
      // Calculate treasure points: coins/3 - debts
      const coins = score.treasureTotalCoins || 0;
      const coinPoints = Math.floor(coins / 3);
      const permanentDebt = score.treasurePermanentDebt || 0;
      const cardDebt = score.treasureCardDebt || 0;
      const taxDebt = score.treasureTaxDebt || 0;
      const piracyDebt = score.treasurePiracyDebt || 0;
      const commercialDebt = score.treasureCommercialDebt || 0;
      
      const totalDebt = permanentDebt + cardDebt + taxDebt + piracyDebt + commercialDebt;
      
      // If direct points are set, use those, otherwise calculate
      if (score.treasureDirectPoints !== undefined && score.treasureDirectPoints !== 0) {
        result = score.treasureDirectPoints;
      } else if (coins > 0 || totalDebt > 0) {
        result = coinPoints - totalDebt;
      } else {
        result = 0;
      }
      break;
      
    case 'military':
      result = score.militaryDirectPoints || 0;
      break;
      
    case 'civilian':
      result = score.civilianDirectPoints || 0;
      break;
      
    case 'commercial':
      result = score.commercialDirectPoints || 0;
      break;
      
    case 'science':
      // Calculate science points if symbols are set
      const compass = (score.scienceCompass || 0) + (score.scienceNonCardCompass || 0);
      const tablet = (score.scienceTablet || 0) + (score.scienceNonCardTablet || 0);
      const gear = (score.scienceGear || 0) + (score.scienceNonCardGear || 0);
      
      if (score.scienceDirectPoints !== undefined && score.scienceDirectPoints !== 0) {
        result = score.scienceDirectPoints;
      } else if (compass > 0 || tablet > 0 || gear > 0) {
        // Science scoring formula: squares + sets of 3
        const squarePoints = (compass * compass) + (tablet * tablet) + (gear * gear);
        const minSymbol = Math.min(compass, tablet, gear);
        const setPoints = minSymbol * 7;
        result = squarePoints + setPoints;
      } else {
        result = 0;
      }
      break;
      
    case 'guilds':
      result = score.guildsDirectPoints || 0;
      break;
      
    case 'cities':
      result = score.citiesDirectPoints || 0;
      break;
      
    case 'leaders':
      result = score.leadersDirectPoints || 0;
      break;
      
    case 'navy':
      result = score.navyDirectPoints || 0;
      break;
      
    case 'islands':
      result = score.islandDirectPoints || 0;
      break;
      
    case 'edifice':
      result = score.edificeDirectPoints || 0;
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
  // Only include scoring categories
  const scoringCategories: CategoryId[] = [
    'wonder', 'treasure', 'military', 'civilian', 'commercial',
    'science', 'guilds', 'cities', 'leaders', 'navy', 'islands', 'edifice'
  ];
  
  return scoringCategories.reduce(
    (sum, cat) => sum + calculateCategoryPoints(playerId, cat, score, context, true),
    0
  );
}