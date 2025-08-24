// lib/scoring/scoringEngine.ts - Complete 7 Wonders scoring system
export interface PlayerScore {
  playerId: string;
  playerName?: string;
  
  // Core scoring categories
  military: MilitaryScore;
  treasury: number; // Coins ÷ 3
  wonder: number; // Wonder stage points
  civilian: number; // Blue cards
  commercial: number; // Yellow cards that give points
  science: ScienceScore;
  guilds: number; // Purple cards
  
  // Expansion scoring
  leaders?: number; // Leaders expansion
  cities?: CitiesScore; // Cities expansion  
  armada?: ArmadaScore; // Armada expansion
  edifice?: number; // Edifice projects
  
  // Totals
  total: number;
  finalRank?: number;
}

export interface MilitaryScore {
  victoryTokens: {
    age1: number; // 1 point each
    age2: number; // 3 points each  
    age3: number; // 5 points each
  };
  defeatTokens: number; // -1 point each
  total: number;
}

export interface ScienceScore {
  symbols: {
    compass: number;
    tablet: number; 
    gear: number;
  };
  wildSymbols: number; // From some leaders/special cards
  sets: number; // Sets of 3 different symbols (7 points each)
  pairs: number; // Pairs calculation (compass² + tablet² + gear²)
  total: number;
  breakdown: string; // Explanation of calculation
}

export interface CitiesScore {
  blackCards: number; // Points from black cards
  debt: number; // -1 point per debt token
  diplomacy: {
    red: number; // Red diplomacy tokens used (skip military)
    blue: number; // Blue diplomacy tokens used (skip naval)
  };
  teamwork: number; // Points from teamwork cards
  total: number;
}

export interface ArmadaScore {
  navalVictory: {
    age1: number; // 1 point each
    age2: number; // 3 points each
    age3: number; // 5 points each  
  };
  navalDefeat: number; // -1 point each
  islands: number; // Points from island cards
  shipyardAdvancement: number; // Points from shipyard track advancement
  militaryBoarding: number; // Points from military boarding tokens
  total: number;
}

export interface ScoringInput {
  // Basic inputs
  coins: number;
  wonderStages: number[]; // Points for each stage built
  
  // Military 
  militaryVictories: { age1: number; age2: number; age3: number; };
  militaryDefeats: number;
  
  // Structure points
  civilianPoints: number; // Blue cards total
  commercialPoints: number; // Yellow cards that give points
  guildPoints: number; // Purple cards total
  
  // Science symbols
  scienceSymbols: { compass: number; tablet: number; gear: number; };
  wildScienceSymbols?: number;
  
  // Expansion specific
  leaderPoints?: number;
  citiesInput?: CitiesInput;
  armadaInput?: ArmadaInput;
  edificePoints?: number;
}

export interface CitiesInput {
  blackCardPoints: number;
  debtTokens: number;
  redDiplomacyUsed: number;
  blueDiplomacyUsed: number;
  teamworkPoints: number;
}

export interface ArmadaInput {
  navalVictories: { age1: number; age2: number; age3: number; };
  navalDefeats: number;
  islandPoints: number;
  shipyardPoints: number;
  militaryBoardingPoints: number;
}

export class ScoringEngine {
  
  static calculatePlayerScore(input: ScoringInput, playerId: string, playerName?: string): PlayerScore {
    const military = this.calculateMilitary(input.militaryVictories, input.militaryDefeats);
    const treasury = this.calculateTreasury(input.coins);
    const wonder = this.calculateWonder(input.wonderStages);
    const science = this.calculateScience(input.scienceSymbols, input.wildScienceSymbols);
    
    // Expansion scores
    const cities = input.citiesInput ? this.calculateCities(input.citiesInput) : undefined;
    const armada = input.armadaInput ? this.calculateArmada(input.armadaInput) : undefined;
    
    const total = this.calculateTotal({
      military: military.total,
      treasury,
      wonder,
      civilian: input.civilianPoints,
      commercial: input.commercialPoints,
      science: science.total,
      guilds: input.guildPoints,
      leaders: input.leaderPoints,
      cities: cities?.total,
      armada: armada?.total,
      edifice: input.edificePoints,
    });

    return {
      playerId,
      playerName,
      military,
      treasury,
      wonder,
      civilian: input.civilianPoints,
      commercial: input.commercialPoints,
      science,
      guilds: input.guildPoints,
      leaders: input.leaderPoints,
      cities,
      armada,
      edifice: input.edificePoints,
      total,
    };
  }

  static calculateMilitary(victories: { age1: number; age2: number; age3: number; }, defeats: number): MilitaryScore {
    const victoryPoints = (victories.age1 * 1) + (victories.age2 * 3) + (victories.age3 * 5);
    const defeatPoints = defeats * -1;
    
    return {
      victoryTokens: victories,
      defeatTokens: defeats,
      total: victoryPoints + defeatPoints,
    };
  }

  static calculateTreasury(coins: number): number {
    return Math.floor(coins / 3);
  }

  static calculateWonder(stagePoints: number[]): number {
    return stagePoints.reduce((sum, points) => sum + points, 0);
  }

  static calculateScience(symbols: { compass: number; tablet: number; gear: number; }, wildSymbols = 0): ScienceScore {
    let { compass, tablet, gear } = symbols;
    
    // Distribute wild symbols optimally
    if (wildSymbols > 0) {
      const distribution = this.distributeWildScience(compass, tablet, gear, wildSymbols);
      compass = distribution.compass;
      tablet = distribution.tablet; 
      gear = distribution.gear;
    }

    // Calculate sets of 3 different symbols
    const sets = Math.min(compass, tablet, gear);
    const setsPoints = sets * 7;

    // Calculate pairs (symbol count squared)
    const pairsPoints = (compass * compass) + (tablet * tablet) + (gear * gear);
    
    const total = setsPoints + pairsPoints;
    
    const breakdown = this.createScienceBreakdown(compass, tablet, gear, sets, setsPoints, pairsPoints, wildSymbols);

    return {
      symbols: { compass, tablet, gear },
      wildSymbols,
      sets,
      pairs: pairsPoints,
      total,
      breakdown,
    };
  }

  static distributeWildScience(compass: number, tablet: number, gear: number, wilds: number): { compass: number; tablet: number; gear: number; } {
    // Try all possible distributions and pick the one with highest score
    let bestScore = 0;
    let bestDistribution = { compass, tablet, gear };

    for (let wildCompass = 0; wildCompass <= wilds; wildCompass++) {
      for (let wildTablet = 0; wildTablet <= (wilds - wildCompass); wildTablet++) {
        const wildGear = wilds - wildCompass - wildTablet;
        
        const newCompass = compass + wildCompass;
        const newTablet = tablet + wildTablet;
        const newGear = gear + wildGear;
        
        const sets = Math.min(newCompass, newTablet, newGear);
        const pairs = (newCompass * newCompass) + (newTablet * newTablet) + (newGear * newGear);
        const score = (sets * 7) + pairs;
        
        if (score > bestScore) {
          bestScore = score;
          bestDistribution = { compass: newCompass, tablet: newTablet, gear: newGear };
        }
      }
    }

    return bestDistribution;
  }

  static createScienceBreakdown(compass: number, tablet: number, gear: number, sets: number, setsPoints: number, pairsPoints: number, wilds: number): string {
    let breakdown = `🧭 ${compass} Compass, 📜 ${tablet} Tablet, ⚙️ ${gear} Gear`;
    
    if (wilds > 0) {
      breakdown += ` (including ${wilds} wild symbols)`;
    }
    
    breakdown += `\n• Sets: ${sets} × 7 = ${setsPoints} points`;
    breakdown += `\n• Pairs: ${compass}² + ${tablet}² + ${gear}² = ${pairsPoints} points`;
    breakdown += `\n• Total: ${setsPoints + pairsPoints} points`;
    
    return breakdown;
  }

  static calculateCities(input: CitiesInput): CitiesScore {
    const total = input.blackCardPoints - input.debtTokens + input.teamworkPoints;
    
    return {
      blackCards: input.blackCardPoints,
      debt: input.debtTokens * -1,
      diplomacy: {
        red: input.redDiplomacyUsed,
        blue: input.blueDiplomacyUsed,
      },
      teamwork: input.teamworkPoints,
      total,
    };
  }

  static calculateArmada(input: ArmadaInput): ArmadaScore {
    const navalVictoryPoints = (input.navalVictories.age1 * 1) + (input.navalVictories.age2 * 3) + (input.navalVictories.age3 * 5);
    const navalDefeatPoints = input.navalDefeats * -1;
    
    const total = navalVictoryPoints + navalDefeatPoints + input.islandPoints + input.shipyardPoints + input.militaryBoardingPoints;
    
    return {
      navalVictory: input.navalVictories,
      navalDefeat: input.navalDefeats,
      islands: input.islandPoints,
      shipyardAdvancement: input.shipyardPoints,
      militaryBoarding: input.militaryBoardingPoints,
      total,
    };
  }

  private static calculateTotal(scores: {
    military: number;
    treasury: number;
    wonder: number;
    civilian: number;
    commercial: number;
    science: number;
    guilds: number;
    leaders?: number;
    cities?: number;
    armada?: number;
    edifice?: number;
  }): number {
    return (
      scores.military +
      scores.treasury +
      scores.wonder +
      scores.civilian +
      scores.commercial +
      scores.science +
      scores.guilds +
      (scores.leaders || 0) +
      (scores.cities || 0) +
      (scores.armada || 0) +
      (scores.edifice || 0)
    );
  }

  static rankPlayers(scores: PlayerScore[]): PlayerScore[] {
    return scores
      .sort((a, b) => b.total - a.total)
      .map((score, index) => ({
        ...score,
        finalRank: index + 1,
      }));
  }

  static generateScoreBreakdown(score: PlayerScore): string {
    let breakdown = `🏆 ${score.playerName || `Player ${score.playerId}`}: ${score.total} points\n\n`;
    
    breakdown += `⚔️ Military: ${score.military.total} points\n`;
    breakdown += `  • Victories: Age 1 (${score.military.victoryTokens.age1}×1), Age 2 (${score.military.victoryTokens.age2}×3), Age 3 (${score.military.victoryTokens.age3}×5)\n`;
    breakdown += `  • Defeats: ${score.military.defeatTokens} × -1\n\n`;
    
    breakdown += `💰 Treasury: ${score.treasury} points (coins ÷ 3)\n\n`;
    
    breakdown += `🏛️ Wonder: ${score.wonder} points\n\n`;
    
    breakdown += `🏘️ Civilian: ${score.civilian} points\n\n`;
    
    breakdown += `💼 Commercial: ${score.commercial} points\n\n`;
    
    breakdown += `🔬 Science: ${score.science.total} points\n`;
    breakdown += `${score.science.breakdown}\n\n`;
    
    breakdown += `🎭 Guilds: ${score.guilds} points\n\n`;
    
    if (score.leaders !== undefined) {
      breakdown += `👑 Leaders: ${score.leaders} points\n\n`;
    }
    
    if (score.cities) {
      breakdown += `🏙️ Cities: ${score.cities.total} points\n`;
      breakdown += `  • Black cards: ${score.cities.blackCards}\n`;
      breakdown += `  • Debt tokens: ${score.cities.debt}\n`;
      breakdown += `  • Teamwork: ${score.cities.teamwork}\n\n`;
    }
    
    if (score.armada) {
      breakdown += `⚓ Armada: ${score.armada.total} points\n`;
      breakdown += `  • Naval victories: ${score.armada.navalVictory.age1 + score.armada.navalVictory.age2 + score.armada.navalVictory.age3}\n`;
      breakdown += `  • Naval defeats: ${score.armada.navalDefeat}\n`;
      breakdown += `  • Islands: ${score.armada.islands}\n`;
      breakdown += `  • Shipyard: ${score.armada.shipyardAdvancement}\n\n`;
    }
    
    if (score.edifice !== undefined) {
      breakdown += `🏗️ Edifice: ${score.edifice} points\n\n`;
    }
    
    return breakdown;
  }
}

// Helper functions for common scoring scenarios
export class ScoringHelpers {
  
  static calculateGuildPoints(guildType: string, playerData: any, neighborData: any[]): number {
    // Implementation would depend on specific guild card effects
    // This would need to be expanded based on actual guild cards
    switch (guildType) {
      case 'workers_guild':
        return (playerData.brownCards + neighborData.reduce((sum, n) => sum + n.brownCards, 0));
      case 'craftsmens_guild':
        return 2 * (playerData.greyCards + neighborData.reduce((sum, n) => sum + n.greyCards, 0));
      case 'traders_guild':
        return (playerData.yellowCards + neighborData.reduce((sum, n) => sum + n.yellowCards, 0));
      case 'philosophers_guild':
        return (playerData.greenCards + neighborData.reduce((sum, n) => sum + n.greenCards, 0));
      case 'spies_guild':
        return (playerData.redCards + neighborData.reduce((sum, n) => sum + n.redCards, 0));
      case 'magistrates_guild':
        return (playerData.blueCards + neighborData.reduce((sum, n) => sum + n.blueCards, 0));
      case 'shipowners_guild':
        return (playerData.brownCards + playerData.greyCards + playerData.purpleCards);
      case 'scientists_guild':
        return 7; // Provides 1 science symbol of choice
      case 'builders_guild':
        return 2 * (playerData.wonderStages + neighborData.reduce((sum, n) => sum + n.wonderStages, 0));
      case 'strategists_guild':
        return (playerData.defeatTokens + neighborData.reduce((sum, n) => sum + n.defeatTokens, 0));
      default:
        return 0;
    }
  }

  static calculateEdificePoints(projectId: string, contributionLevel: number, gameEndData: any): number {
    // This would implement specific edifice project scoring
    // Each project has different scoring mechanics
    return 0; // Placeholder
  }

  static validateScoringInput(input: ScoringInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (input.coins < 0) errors.push('Coins cannot be negative');
    if (input.militaryDefeats < 0) errors.push('Military defeats cannot be negative');
    if (input.scienceSymbols.compass < 0 || input.scienceSymbols.tablet < 0 || input.scienceSymbols.gear < 0) {
      errors.push('Science symbols cannot be negative');
    }
    
    // Validate military victories are reasonable
    const totalVictories = input.militaryVictories.age1 + input.militaryVictories.age2 + input.militaryVictories.age3;
    if (totalVictories > 6) { // Max 2 neighbors × 3 ages
      errors.push('Too many military victories (max 6 total)');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}