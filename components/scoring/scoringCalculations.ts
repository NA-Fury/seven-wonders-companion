// components/scoring/scoringCalculations.ts
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { DetailedScoreData, useScoringStore } from '../../store/scoringStore';

interface CalculationContext {
  wonder?: any;
  expansions?: any;
}

export function calculateCategoryPoints(
  playerId: string,
  categoryId: string,
  score: DetailedScoreData,
  context: CalculationContext,
  useCache: boolean = true
): number {
  const cacheKey = `${playerId}-${categoryId}`;
  const cache = useScoringStore.getState().calculationCache;
  if (useCache && cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // Return direct points if no details entered
  const showDetailsKey = `${categoryId}ShowDetails` as keyof DetailedScoreData;
  const directPointsKey = `${categoryId}DirectPoints` as keyof DetailedScoreData;

  let result: number;
  if (!(score as any)[showDetailsKey]) {
    result = (score as any)[directPointsKey] || 0;
  } else {
    switch (categoryId) {
      case 'wonder':
        result = calculateWonderPoints(score, context);
        break;
      case 'treasure':
        result = calculateTreasurePoints(score, context);
        break;
      case 'science':
        result = calculateSciencePoints(score);
        break;
      case 'military':
        result = score.militaryDirectPoints || 0;
        break;
      case 'civilian':
        result = calculateCivilianPoints(score, context);
        break;
      case 'commercial':
        result = calculateCommercialPoints(score, context);
        break;
      case 'guilds':
        result = score.guildsDirectPoints || 0;
        break;
      case 'resources':
        result = calculateResourcePoints(score);
        break;
      case 'cities':
        result = calculateCitiesPoints(score);
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
        result = calculateEdificePoints(score);
        break;
      default:
        result = (score as any)[`${categoryId}DirectPoints`] || 0;
    }
  }

  if (useCache) {
    cache.set(cacheKey, result);
  }
  return result;
}

function calculateWonderPoints(score: DetailedScoreData, context: CalculationContext): number {
  if (!score.wonderShowDetails) {
    return score.wonderDirectPoints || 0;
  }

  const wonderData = context.wonder;
  if (!wonderData?.boardId) return 0;

  const wonder = WONDERS_DATABASE.find(w => w.id === wonderData.boardId);
  if (!wonder) return 0;

  const side = wonderData.side || 'day';
  const stages = side === 'day' ? wonder.daySide?.stages : wonder.nightSide?.stages;
  if (!stages) return 0;

  let total = 0;
  const stagesBuilt = score.wonderStagesBuilt || [];
  
  stagesBuilt.forEach((built, index) => {
    if (built && stages[index]) {
      total += stages[index].points || stages[index].effect?.value || 0;
    }
  });

  // Add edifice stage points if applicable
  if (score.wonderEdificeStage?.completed && context.expansions?.edifice) {
    // Edifice points are handled separately
  }

  return total;
}

function calculateTreasurePoints(score: DetailedScoreData, context: CalculationContext): number {
  if (!score.treasureShowDetails) {
    return score.treasureDirectPoints || 0;
  }

  const totalCoins = score.treasureTotalCoins || 0;
  const totalDebt = (score.treasurePermanentDebt || 0) +
                    (score.treasureCardDebt || 0) +
                    (score.treasureTaxDebt || 0) +
                    (score.treasurePiracyDebt || 0) +
                    (score.treasureCommercialDebt || 0);

  const netCoins = totalCoins - totalDebt;
  return Math.floor(netCoins / 3);
}

function calculateSciencePoints(score: DetailedScoreData): number {
  if (!score.scienceShowDetails) {
    return score.scienceDirectPoints || 0;
  }

  const totalCompass = (score.scienceCompass || 0) + (score.scienceNonCardCompass || 0);
  const totalTablet = (score.scienceTablet || 0) + (score.scienceNonCardTablet || 0);
  const totalGear = (score.scienceGear || 0) + (score.scienceNonCardGear || 0);

  // Calculate sets (minimum of all three symbols)
  const sets = Math.min(totalCompass, totalTablet, totalGear);
  
  // Calculate squares
  const squares = (totalCompass * totalCompass) + 
                  (totalTablet * totalTablet) + 
                  (totalGear * totalGear);

  return (sets * 7) + squares;
}

function calculateCivilianPoints(score: DetailedScoreData, context: CalculationContext): number {
  if (!score.civilianShowDetails) {
    return score.civilianDirectPoints || 0;
  }

  let total = score.civilianDirectPoints || 0;

  // Add shipyard position bonus if applicable (guard undefined)
  const civPos = typeof score.civilianShipPosition === 'number' ? score.civilianShipPosition : 0;
  if (context.expansions?.armada && civPos > 0) {
    const shipyardBonus = getShipyardPositionBonus(civPos, 'blue');
    total += shipyardBonus;
  }

  return total;
}

function calculateCommercialPoints(score: DetailedScoreData, context: CalculationContext): number {
  if (!score.commercialShowDetails) {
    return score.commercialDirectPoints || 0;
  }

  let total = score.commercialDirectPoints || 0;

  // Add shipyard position bonus (guard undefined)
  const commPos = typeof score.commercialShipPosition === 'number' ? score.commercialShipPosition : 0;
  if (context.expansions?.armada && commPos > 0) {
    const shipyardBonus = getShipyardPositionBonus(commPos, 'yellow');
    total += shipyardBonus;
  }

  return total;
}

function calculateResourcePoints(score: DetailedScoreData): number {
  if (!score.resourcesShowDetails) {
    return score.resourcesDirectPoints || 0;
  }

  // Resource cards typically don't give direct points
  // but can be used for analysis
  return score.resourcesDirectPoints || 0;
}

function calculateCitiesPoints(score: DetailedScoreData): number {
  if (!score.citiesShowDetails) {
    return score.citiesDirectPoints || 0;
  }

  let total = score.blackPointCards || 0;
  
  // Add neighbor effects
  total += (score.blackNeighborPositive || 0) * 2;
  total -= (score.blackNeighborNegative || 0);

  return total;
}

function calculateEdificePoints(score: DetailedScoreData): number {
  if (!score.edificeShowDetails) {
    return score.edificeDirectPoints || 0;
  }

  const rewards = score.edificeRewards || 0;
  const penalties = score.edificePenalties || 0;

  return rewards - penalties;
}

function getShipyardPositionBonus(position: number, track: string): number {
  // Shipyard position bonuses (simplified - adjust based on actual game rules)
  const bonuses: Record<string, number[]> = {
    blue: [0, 1, 2, 3, 5, 7, 10],
    yellow: [0, 1, 1, 2, 3, 5, 8],
    green: [0, 0, 1, 1, 2, 3, 5],
    red: [0, 2, 3, 5, 7, 10, 15],
  };

  const trackBonuses = bonuses[track] || [0];
  return trackBonuses[Math.min(position, trackBonuses.length - 1)] || 0;
}

// Shipyard position validation and synchronization
export function validateShipyardPositions(
  score: DetailedScoreData,
  shipyardData: any
): DetailedScoreData['shipyardPositions'] {
  const positions = { ...score.shipyardPositions };
  
  // Only assign when the optional value is a valid number
  if (typeof score.civilianShipPosition === 'number' && score.civilianShipPosition !== positions.blue) {
    positions.blue = score.civilianShipPosition;
  }
  if (typeof score.commercialShipPosition === 'number' && score.commercialShipPosition !== positions.yellow) {
    positions.yellow = score.commercialShipPosition;
  }
  if (typeof score.greenShipPosition === 'number' && score.greenShipPosition !== positions.green) {
    positions.green = score.greenShipPosition;
  }

  return positions;
}

// Leader autocomplete suggestions (for future implementation)
export function getLeaderSuggestions(input: string, availableLeaders: string[]): string[] {
  if (!input || input.length < 2) return [];
  
  const lowercaseInput = input.toLowerCase();
  return availableLeaders
    .filter(leader => leader.toLowerCase().includes(lowercaseInput))
    .slice(0, 5);
}

// Discard retrieval validation
export function validateDiscardRetrievals(score: DetailedScoreData): boolean {
  const { discardRetrievals } = score;
  if (!discardRetrievals) return true;

  const total = (discardRetrievals.age1 || 0) + 
                (discardRetrievals.age2 || 0) + 
                (discardRetrievals.age3 || 0);

  // Check if source is valid when cards are retrieved
  if (total > 0 && !discardRetrievals.source) {
    return false;
  }

  // Validate source (Halicarnassus allows 1 per age, Solomon allows multiple, etc.)
  const validSources = ['Halicarnassus', 'Solomon', 'Forging Agency', 'Other'];
  if (discardRetrievals.source && !validSources.includes(discardRetrievals.source)) {
    // Allow custom sources but flag for review
  }

  return true;
}

// Calculate total game score
export function calculateTotalScore(
  playerId: string,
  score: DetailedScoreData,
  context: CalculationContext
): number {
  const categories = [
    'wonder', 'treasure', 'military', 'civilian', 'commercial',
    'science', 'guilds', 'resources'
  ];

  // Add expansion categories if enabled
  if (context.expansions?.cities) categories.push('cities');
  if (context.expansions?.leaders) categories.push('leaders');
  if (context.expansions?.armada) {
    categories.push('navy', 'islands');
  }
  if (context.expansions?.edifice) categories.push('edifice');

  return categories.reduce((total, category) => {
    return total + calculateCategoryPoints(playerId, category, score, context);
  }, 0);
}

// Analysis helpers for later implementation
export function analyzePlayerPerformance(
  score: DetailedScoreData,
  context: CalculationContext
): {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Science analysis
  const sciencePoints = calculateSciencePoints(score);
  if (sciencePoints > 30) {
    strengths.push('Strong science strategy with good symbol diversity');
  } else if (sciencePoints < 10 && score.scienceShowDetails) {
    weaknesses.push('Science symbols underutilized');
    recommendations.push('Consider focusing on one symbol type or building complete sets');
  }

  // Military analysis
  if (score.militaryTotalStrength > 10) {
    strengths.push('Dominant military presence');
  } else if (score.militaryTotalStrength < 3) {
    weaknesses.push('Vulnerable to military conflicts');
  }

  // Resource analysis
  if (score.resourcesBrownCards > 5) {
    strengths.push('Strong resource production base');
  }
  if (score.resourcesGreyCards > 3) {
    strengths.push('Good manufactured goods production');
  }

  // Treasure analysis
  const treasurePoints = calculateTreasurePoints(score, context);
  if (treasurePoints < 0) {
    weaknesses.push('High debt burden affecting final score');
    recommendations.push('Focus on commercial structures and coin generation');
  }

  // Discard pile usage
  if (score.discardRetrievals && 
      (score.discardRetrievals.age1 + score.discardRetrievals.age2 + score.discardRetrievals.age3) > 3) {
    strengths.push(`Effective use of ${score.discardRetrievals.source} ability`);
  }

  return { strengths, weaknesses, recommendations };
}