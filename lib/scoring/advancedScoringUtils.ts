// lib/scoring/advancedScoringUtils.ts

// Enhanced science calculation with detailed breakdown
export interface ScienceCalculation {
  compass: number;
  tablet: number;
  gear: number;
  wildScience?: number;
  sets: number;
  setPoints: number;
  symbolSquares: number;
  squarePoints: number;
  total: number;
  breakdown: string;
  efficiency: number;
}

export class ScienceCalculator {
  static calculate(
    compass: number,
    tablet: number,
    gear: number,
    wildScience = 0
  ): ScienceCalculation {
    if (compass < 0 || tablet < 0 || gear < 0 || wildScience < 0) {
      throw new Error('Science symbols cannot be negative');
    }

    const { optimalCompass, optimalTablet, optimalGear } =
      this.optimizeWildScience(compass, tablet, gear, wildScience);

    const sets = Math.min(optimalCompass, optimalTablet, optimalGear);
    const setPoints = sets * 7;

    const symbolSquares =
      optimalCompass ** 2 + optimalTablet ** 2 + optimalGear ** 2;
    const squarePoints = symbolSquares;

    const total = setPoints + squarePoints;

    const totalSymbols = optimalCompass + optimalTablet + optimalGear;
    const symbolsInSets = sets * 3;
    const efficiency = totalSymbols > 0 ? (symbolsInSets / totalSymbols) * 100 : 0;

    const breakdown = this.createBreakdown(
      optimalCompass,
      optimalTablet,
      optimalGear,
      sets,
      setPoints,
      squarePoints,
      wildScience
    );

    return {
      compass: optimalCompass,
      tablet: optimalTablet,
      gear: optimalGear,
      wildScience,
      sets,
      setPoints,
      symbolSquares,
      squarePoints,
      total,
      breakdown,
      efficiency: Math.round(efficiency * 10) / 10,
    };
  }

  private static optimizeWildScience(
    compass: number,
    tablet: number,
    gear: number,
    wildScience: number
  ): { optimalCompass: number; optimalTablet: number; optimalGear: number } {
    if (wildScience === 0) {
      return { optimalCompass: compass, optimalTablet: tablet, optimalGear: gear };
    }

    let bestScore = -Infinity;
    let bestDistribution = { optimalCompass: compass, optimalTablet: tablet, optimalGear: gear };

    for (let addCompass = 0; addCompass <= wildScience; addCompass++) {
      for (let addTablet = 0; addTablet <= wildScience - addCompass; addTablet++) {
        const addGear = wildScience - addCompass - addTablet;

        const testCompass = compass + addCompass;
        const testTablet = tablet + addTablet;
        const testGear = gear + addGear;

        const sets = Math.min(testCompass, testTablet, testGear);
        const squares = testCompass ** 2 + testTablet ** 2 + testGear ** 2;
        const score = sets * 7 + squares;

        if (score > bestScore) {
          bestScore = score;
          bestDistribution = {
            optimalCompass: testCompass,
            optimalTablet: testTablet,
            optimalGear: testGear,
          };
        }
      }
    }

    return bestDistribution;
  }

  private static createBreakdown(
    compass: number,
    tablet: number,
    gear: number,
    sets: number,
    setPoints: number,
    squarePoints: number,
    wildScience: number
  ): string {
    let breakdown = `${compass} Compass, ${tablet} Tablet, ${gear} Gear\n`;

    if (wildScience > 0) {
      breakdown += `(${wildScience} wild science optimally distributed)\n`;
    }

    breakdown += `${sets} complete sets × 7 = ${setPoints} points\n`;
    breakdown += `Symbol squares: ${compass}² + ${tablet}² + ${gear}² = ${squarePoints} points`;

    return breakdown;
  }

  static getSuggestion(compass: number, tablet: number, gear: number): string {
    const min = Math.min(compass, tablet, gear);
    const max = Math.max(compass, tablet, gear);

    if (min === 0) return 'Focus on collecting all three symbol types to form complete sets';
    if (max - min > 3) return 'Try to balance your science symbols for more efficient scoring';
    if (min >= 3) return 'Great science balance! Consider leaders or guilds that provide wild science';
    return 'Collect more science symbols to increase your score';
  }
}

// Enhanced military calculation
export interface MilitaryCalculation {
  conflicts: {
    age1: { left: 'win' | 'lose' | 'tie'; right: 'win' | 'lose' | 'tie' };
    age2: { left: 'win' | 'lose' | 'tie'; right: 'win' | 'lose' | 'tie' };
    age3: { left: 'win' | 'lose' | 'tie'; right: 'win' | 'lose' | 'tie' };
  };
  victoryPoints: number;
  defeatPenalty: number;
  total: number;
  breakdown: string;
  efficiency: string;
}

export class MilitaryCalculator {
  static calculate(conflicts: MilitaryCalculation['conflicts']): MilitaryCalculation {
    let victoryPoints = 0;
    let defeats = 0;
    let victories = 0;

    const ageMultipliers = { age1: 1, age2: 3, age3: 5 } as const;
    const breakdown: string[] = [];

    (Object.entries(conflicts) as Array<
      [keyof typeof ageMultipliers, { left: 'win' | 'lose' | 'tie'; right: 'win' | 'lose' | 'tie' }]
    >).forEach(([age, results]) => {
      const multiplier = ageMultipliers[age];
      let ageVictories = 0;
      let ageDefeats = 0;

      if (results.left === 'win') {
        victoryPoints += multiplier;
        victories++;
        ageVictories++;
      } else if (results.left === 'lose') {
        defeats++;
        ageDefeats++;
      }

      if (results.right === 'win') {
        victoryPoints += multiplier;
        victories++;
        ageVictories++;
      } else if (results.right === 'lose') {
        defeats++;
        ageDefeats++;
      }

      const ageLabel = `Age ${age.slice(-1)}`;
      if (ageVictories > 0 || ageDefeats > 0) {
        breakdown.push(`${ageLabel}: ${ageVictories}W, ${ageDefeats}L = ${ageVictories * multiplier}pts`);
      } else {
        breakdown.push(`${ageLabel}: No decisive battles`);
      }
    });

    const defeatPenalty = defeats;
    const total = victoryPoints - defeatPenalty;

    if (defeatPenalty > 0) breakdown.push(`Defeat penalty: -${defeatPenalty}pts`);

    const totalConflicts = 6;
    const decisiveConflicts = victories + defeats;
    const winRate = decisiveConflicts > 0 ? (victories / decisiveConflicts) * 100 : 0;

    const efficiency =
      `${victories}W ${defeats}L out of ${totalConflicts} conflicts` +
      (decisiveConflicts > 0 ? ` (${Math.round(winRate)}% win rate)` : '');

    return {
      conflicts,
      victoryPoints,
      defeatPenalty,
      total,
      breakdown: breakdown.join('\n'),
      efficiency,
    };
  }

  static getSuggestion(result: MilitaryCalculation): string {
    const { victoryPoints, defeatPenalty, total } = result;

    if (total < 0) return 'Consider investing more in military strength or using diplomacy tokens';
    if (total === 0) return 'Military strategy is neutral. Focus on other scoring paths';
    if (victoryPoints >= 15) return "Excellent military dominance! You've maximized military scoring";
    if (defeatPenalty === 0) return 'Good military defense! No defeat penalties';
    return 'Solid military performance. Consider expanding military strength';
  }
}

// Comprehensive scoring summary
export interface ScoringSummary {
  playerName: string;
  categories: {
    wonder: number;
    military: number;
    civilian: number;
    commercial: number;
    science: number;
    guilds: number;
    leaders?: number;
    cities?: number;
    armada?: number;
    edifice?: number;
  };
  total: number;
  breakdown: string;
  ranking?: number;
  recommendations: string[];
  efficiency: {
    pointsPerCategory: number;
    strongestCategory: keyof ScoringSummary['categories'];
    weakestCategory: keyof ScoringSummary['categories'];
    balance: number;
  };
}

export class ScoringSummaryGenerator {
  static generate(
    playerName: string,
    scores: Record<string, number>,
    expansions: Record<string, boolean> = {},
    allPlayerScores?: Record<string, number>[]
  ): ScoringSummary {
    const categories: ScoringSummary['categories'] = {
      wonder: scores.wonder || 0,
      military: scores.military || 0,
      civilian: scores.civilian || 0,
      commercial: scores.commercial || 0,
      science: scores.science || 0,
      guilds: scores.guilds || 0,
      ...(expansions.leaders ? { leaders: scores.leaders || 0 } : {}),
      ...(expansions.cities ? { cities: scores.cities || 0 } : {}),
      ...(expansions.armada ? { armada: scores.armada || 0 } : {}),
      ...(expansions.edifice ? { edifice: scores.edifice || 0 } : {}),
    };

    const total = Object.values(categories).reduce((sum, score) => sum + (score || 0), 0);

    const categoryCount = Object.keys(categories).length;
    const pointsPerCategory = total / categoryCount;

    const sorted = Object.entries(categories) as Array<[keyof ScoringSummary['categories'], number]>;
    sorted.sort((a, b) => (b[1] || 0) - (a[1] || 0));

    const strongestCategory = sorted[0][0];
    const weakestCategory = sorted[sorted.length - 1][0];

    const mean = pointsPerCategory;
    const variance =
      (Object.values(categories).reduce((sum, score) => sum + Math.pow((score || 0) - mean, 2), 0) /
        categoryCount) || 0;
    const standardDeviation = Math.sqrt(variance);
    const balance = Math.max(0, 100 - standardDeviation * 2);

    const breakdown = Object.entries(categories)
      .map(([category, score]) => `${category.charAt(0).toUpperCase() + category.slice(1)}: ${score || 0}`)
      .join(' | ');

    const recommendations = this.generateRecommendations(categories, total, balance);

    let ranking: number | undefined;
    if (allPlayerScores) {
      const totals = allPlayerScores.map(s => Object.values(s).reduce((sum, v) => sum + (v || 0), 0));
      totals.push(total);
      totals.sort((a, b) => b - a);
      ranking = totals.indexOf(total) + 1;
    }

    return {
      playerName,
      categories,
      total,
      breakdown,
      ranking,
      recommendations,
      efficiency: {
        pointsPerCategory: Math.round(pointsPerCategory * 10) / 10,
        strongestCategory,
        weakestCategory,
        balance: Math.round(balance),
      },
    };
  }

  private static generateRecommendations(
    categories: ScoringSummary['categories'],
    total: number,
    balance: number
  ): string[] {
    const recommendations: string[] = [];

    if (total < 30) recommendations.push('Focus on fundamental scoring - civilian buildings and wonder stages');
    else if (total < 50) recommendations.push('Good foundation! Consider specializing in science or military');
    else if (total < 70) recommendations.push('Strong performance! Look for guild synergies');
    else recommendations.push("Excellent game! You've mastered multiple scoring paths");

    if (balance < 40) recommendations.push('Very specialized strategy - risky but can pay off big');
    else if (balance < 70) recommendations.push('Good strategic focus while maintaining other scoring');
    else recommendations.push('Well-balanced approach across all categories');

    if ((categories.science || 0) > 20) {
      recommendations.push('Science mastery achieved! Wild science from leaders/guilds is key');
    } else if ((categories.science || 0) > 0 && (categories.science || 0) < 10) {
      recommendations.push('Either commit fully to science or avoid it entirely');
    }

    if ((categories.military || 0) < 0) {
      recommendations.push('Military weakness is costly - consider defensive cards');
    } else if ((categories.military || 0) > 15) {
      recommendations.push('Military dominance! Your neighbors fear you');
    }

    if ((categories.guilds || 0) > 15) {
      recommendations.push("Excellent guild utilization! You've maximized neighbor bonuses");
    }

    return recommendations;
  }
}

// Hook (no JSX, safe to keep here in .ts)
export function useAdvancedScoring() {
  const calculateScience = (compass: number, tablet: number, gear: number, wildScience = 0) => {
    try {
      return ScienceCalculator.calculate(compass, tablet, gear, wildScience);
    } catch (error) {
      console.error('Science calculation error:', error);
      return null;
    }
  };

  const calculateMilitary = (conflicts: MilitaryCalculation['conflicts']) => {
    try {
      return MilitaryCalculator.calculate(conflicts);
    } catch (error) {
      console.error('Military calculation error:', error);
      return null;
    }
  };

  const generateSummary = (
    playerName: string,
    scores: Record<string, number>,
    expansions: Record<string, boolean> = {},
    allPlayerScores?: Record<string, number>[]
  ) => {
    try {
      return ScoringSummaryGenerator.generate(playerName, scores, expansions, allPlayerScores);
    } catch (error) {
      console.error('Summary generation error:', error);
      return null;
    }
  };

  return {
    calculateScience,
    calculateMilitary,
    generateSummary,
    getScienceSuggestion: ScienceCalculator.getSuggestion,
    getMilitarySuggestion: MilitaryCalculator.getSuggestion,
  };
}
