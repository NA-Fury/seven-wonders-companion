// lib/scoring/enhancedScoringEngine.ts - Enhanced 7 Wonders scoring with accurate rules
export interface PlayerScore {
  playerId: string;
  playerName?: string;
  position: number; // Seating position for neighbor calculations
  
  // Core scoring categories
  military: MilitaryScore;
  treasury: number; // Coins ÷ 3
  wonder: WonderScore; // Wonder stage points + special abilities
  civilian: number; // Blue cards
  commercial: number; // Yellow cards that give points
  science: ScienceScore;
  guilds: GuildScore; // Purple cards with neighbor calculations
  
  // Expansion scoring
  leaders?: number; // Leaders expansion
  cities?: CitiesScore; // Cities expansion  
  armada?: ArmadaScore; // Armada expansion
  edifice?: EdificeScore; // Edifice projects
  
  // Totals and metadata
  total: number;
  finalRank?: number;
  breakdown: string; // Detailed scoring explanation
}

export interface MilitaryScore {
  conflicts: {
    age1: { left: 'win' | 'lose' | 'tie', right: 'win' | 'lose' | 'tie' };
    age2: { left: 'win' | 'lose' | 'tie', right: 'win' | 'lose' | 'tie' };
    age3: { left: 'win' | 'lose' | 'tie', right: 'win' | 'lose' | 'tie' };
  };
  victoryTokens: {
    age1: number; // 1 point each
    age2: number; // 3 points each  
    age3: number; // 5 points each
  };
  defeatTokens: number; // -1 point each
  total: number;
}

export interface WonderScore {
  stagesBuilt: number[];
  stagePoints: number[]; // Points from each stage
  specialAbilities: string[]; // Description of special abilities
  total: number;
}

export interface ScienceScore {
  symbols: {
    compass: number; // Compasses/Astrolabes
    tablet: number; // Stone tablets
    gear: number; // Gears/Cogs
  };
  wildSymbols: number; // From leaders or special cards
  sets: number; // Sets of 3 different symbols (7 points each)
  squaredPoints: number; // compass² + tablet² + gear²
  total: number;
  breakdown: string; // Detailed calculation explanation
  optimalDistribution?: { compass: number; tablet: number; gear: number; }; // After wild optimization
}

export interface GuildScore {
  cards: GuildCard[];
  neighborDependentPoints: number; // Points from neighbor cards
  ownCardPoints: number; // Points from own cards
  total: number;
  breakdown: string;
}

export interface GuildCard {
  id: string;
  name: string;
  effect: string;
  points: number;
  dependsOnNeighbors: boolean;
}

export interface CitiesScore {
  blackCards: number; // Points from black cards
  debt: number; // -1 point per debt token
  diplomacy: {
    red: number; // Red diplomacy tokens (skip military)
    blue: number; // Blue diplomacy tokens (skip naval)
    tokensUsed: boolean; // Whether diplomacy was used
  };
  teamwork: number; // Points from teamwork cards
  total: number;
}

export interface ArmadaScore {
  navalConflicts: {
    age1: { victories: number; defeats: number; };
    age2: { victories: number; defeats: number; };
    age3: { victories: number; defeats: number; };
  };
  navalVictoryPoints: number;
  navalDefeatPoints: number;
  islands: IslandScore[];
  shipyardAdvancement: number;
  militaryBoarding: number; // Forced military engagement tokens
  total: number;
}

export interface IslandScore {
  islandId: string;
  name: string;
  points: number;
  effect?: string;
}

export interface EdificeScore {
  projects: EdificeProject[];
  totalContributed: number; // Total resources contributed
  completionBonuses: number; // Points from completed projects
  endGameScoring: number; // End-game scoring based on contributions
  total: number;
}

export interface EdificeProject {
  id: string;
  name: string;
  contributionLevel: number; // 0-5 typically
  pointsEarned: number;
  completed: boolean;
}

// Enhanced scoring input with better structure
export interface ScoringInput {
  playerId: string;
  playerName?: string;
  position: number; // Seating position (0-based)
  
  // Basic game state
  coins: number;
  wonderData: {
    wonderId: string;
    side: 'day' | 'night';
    stagesBuilt: number; // Number of stages built
    stagePoints: number[]; // Points for each stage
  };
  
  // Card counts and points
  cards: {
    civilian: { count: number; points: number; }; // Blue cards
    commercial: { count: number; points: number; }; // Yellow cards with points
    military: { count: number; strength: number; }; // Red cards
    science: { 
      compass: number; 
      tablet: number; 
      gear: number; 
      wildSymbols?: number;
    }; // Green cards
    guilds: GuildCard[]; // Purple cards
  };
  
  // Military outcomes (vs neighbors)
  militaryConflicts: {
    age1: { leftNeighbor: 'win' | 'lose' | 'tie', rightNeighbor: 'win' | 'lose' | 'tie' };
    age2: { leftNeighbor: 'win' | 'lose' | 'tie', rightNeighbor: 'win' | 'lose' | 'tie' };
    age3: { leftNeighbor: 'win' | 'lose' | 'tie', rightNeighbor: 'win' | 'lose' | 'tie' };
  };
  
  // Expansion data
  leaders?: {
    points: number;
    abilities: string[];
    wildScience?: number;
  };
  
  cities?: {
    blackCards: { count: number; points: number; };
    debtTokens: number;
    diplomacyTokens: { red: number; blue: number; used: boolean; };
    teamworkCards: { count: number; points: number; };
  };
  
  armada?: {
    navalConflicts: {
      age1: { victories: number; defeats: number; };
      age2: { victories: number; defeats: number; };
      age3: { victories: number; defeats: number; };
    };
    islands: IslandScore[];
    shipyardPoints: number;
    militaryBoardingTokens: number;
  };
  
  edifice?: {
    projects: EdificeProject[];
  };
}

// Enhanced scoring engine with accurate 7 Wonders calculations
export class Enhanced7WondersScoringEngine {
  
  static calculatePlayerScore(input: ScoringInput, allPlayersData?: ScoringInput[]): PlayerScore {
    // Calculate each scoring category
    const military = this.calculateMilitary(input.militaryConflicts);
    const treasury = this.calculateTreasury(input.coins);
    const wonder = this.calculateWonder(input.wonderData);
    const science = this.calculateScience(input.cards.science, input.leaders?.wildScience);
    const guilds = this.calculateGuilds(input.cards.guilds, input, allPlayersData);
    
    // Expansion scores
    const leaders = input.leaders?.points || 0;
    const cities = input.cities ? this.calculateCities(input.cities) : undefined;
    const armada = input.armada ? this.calculateArmada(input.armada) : undefined;
    const edifice = input.edifice ? this.calculateEdifice(input.edifice) : undefined;
    
    // Calculate total
    const total = this.calculateTotal({
      military: military.total,
      treasury,
      wonder: wonder.total,
      civilian: input.cards.civilian.points,
      commercial: input.cards.commercial.points,
      science: science.total,
      guilds: guilds.total,
      leaders,
      cities: cities?.total,
      armada: armada?.total,
      edifice: edifice?.total,
    });

    const breakdown = this.generateDetailedBreakdown({
      military, treasury, wonder, science, guilds, leaders, cities, armada, edifice,
      civilian: input.cards.civilian.points,
      commercial: input.cards.commercial.points,
      total
    });

    return {
      playerId: input.playerId,
      playerName: input.playerName,
      position: input.position,
      military,
      treasury,
      wonder,
      civilian: input.cards.civilian.points,
      commercial: input.cards.commercial.points,
      science,
      guilds,
      leaders,
      cities,
      armada,
      edifice: edifice ? {
        projects: edifice.projects,
        totalContributed: edifice.totalContributed,
        completionBonuses: edifice.completionBonuses,
        endGameScoring: edifice.endGameScoring,
        total: edifice.total
      } : undefined,
      total,
      breakdown,
    };
  }

  static calculateMilitary(conflicts: ScoringInput['militaryConflicts']): MilitaryScore {
    const countResults = (age: { leftNeighbor: string; rightNeighbor: string }) => {
      let victories = 0;
      let defeats = 0;
      
      if (age.leftNeighbor === 'win') victories++;
      if (age.leftNeighbor === 'lose') defeats++;
      if (age.rightNeighbor === 'win') victories++;
      if (age.rightNeighbor === 'lose') defeats++;
      
      return { victories, defeats };
    };

    const age1Results = countResults(conflicts.age1);
    const age2Results = countResults(conflicts.age2);
    const age3Results = countResults(conflicts.age3);

    const victoryTokens = {
      age1: age1Results.victories,
      age2: age2Results.victories,
      age3: age3Results.victories,
    };

    const totalDefeats = age1Results.defeats + age2Results.defeats + age3Results.defeats;
    const totalVictoryPoints = (victoryTokens.age1 * 1) + (victoryTokens.age2 * 3) + (victoryTokens.age3 * 5);
    const totalDefeatPoints = totalDefeats * -1;

    // Normalize to the output shape (left/right)
    const normalizedConflicts: MilitaryScore['conflicts'] = {
       age1: { left: conflicts.age1.leftNeighbor, right: conflicts.age1.rightNeighbor },
       age2: { left: conflicts.age2.leftNeighbor, right: conflicts.age2.rightNeighbor },
       age3: { left: conflicts.age3.leftNeighbor, right: conflicts.age3.rightNeighbor },
    };

    return {
      conflicts: normalizedConflicts,
      victoryTokens,
      defeatTokens: totalDefeats,
      total: totalVictoryPoints + totalDefeatPoints,
    };
  }

  static calculateTreasury(coins: number): number {
    return Math.floor(coins / 3);
  }

  static calculateWonder(wonderData: ScoringInput['wonderData']): WonderScore {
    const stagesBuilt = Array.from({ length: wonderData.stagesBuilt }, (_, i) => i + 1);
    const total = wonderData.stagePoints.slice(0, wonderData.stagesBuilt).reduce((sum, points) => sum + points, 0);

    return {
      stagesBuilt,
      stagePoints: wonderData.stagePoints.slice(0, wonderData.stagesBuilt),
      specialAbilities: [], // This would be populated based on wonder database
      total,
    };
  }

  static calculateScience(scienceData: ScoringInput['cards']['science'], wildSymbols = 0): ScienceScore {
    let { compass, tablet, gear } = scienceData;
    let optimalDistribution;
    
    // Distribute wild symbols optimally
    if (wildSymbols > 0) {
      optimalDistribution = this.optimizeWildScienceDistribution(compass, tablet, gear, wildSymbols);
      compass = optimalDistribution.compass;
      tablet = optimalDistribution.tablet;
      gear = optimalDistribution.gear;
    }

    // Calculate sets of 3 different symbols
    const sets = Math.min(compass, tablet, gear);
    const setsPoints = sets * 7;

    // Calculate squared points
    const squaredPoints = (compass * compass) + (tablet * tablet) + (gear * gear);
    
    const total = setsPoints + squaredPoints;
    const breakdown = this.createScienceBreakdown(compass, tablet, gear, sets, setsPoints, squaredPoints, wildSymbols);

    return {
      symbols: { compass, tablet, gear },
      wildSymbols: wildSymbols || 0,
      sets,
      squaredPoints,
      total,
      breakdown,
      optimalDistribution,
    };
  }

  static optimizeWildScienceDistribution(compass: number, tablet: number, gear: number, wilds: number): { compass: number; tablet: number; gear: number; } {
    let bestScore = 0;
    let bestDistribution = { compass, tablet, gear };

    // Try all possible distributions
    for (let wildCompass = 0; wildCompass <= wilds; wildCompass++) {
      for (let wildTablet = 0; wildTablet <= (wilds - wildCompass); wildTablet++) {
        const wildGear = wilds - wildCompass - wildTablet;
        
        const newCompass = compass + wildCompass;
        const newTablet = tablet + wildTablet;
        const newGear = gear + wildGear;
        
        const sets = Math.min(newCompass, newTablet, newGear);
        const squared = (newCompass * newCompass) + (newTablet * newTablet) + (newGear * newGear);
        const score = (sets * 7) + squared;
        
        if (score > bestScore) {
          bestScore = score;
          bestDistribution = { compass: newCompass, tablet: newTablet, gear: newGear };
        }
      }
    }

    return bestDistribution;
  }

  static createScienceBreakdown(compass: number, tablet: number, gear: number, sets: number, setsPoints: number, squaredPoints: number, wilds: number): string {
    let breakdown = `🧭 ${compass} Compass, 📜 ${tablet} Tablet, ⚙️ ${gear} Gear`;
    
    if (wilds > 0) {
      breakdown += ` (optimized with ${wilds} wild symbols)`;
    }
    
    breakdown += `\n• Sets: ${sets} × 7 = ${setsPoints} points`;
    breakdown += `\n• Squared: ${compass}² + ${tablet}² + ${gear}² = ${squaredPoints} points`;
    breakdown += `\n• Total: ${setsPoints + squaredPoints} points`;
    
    return breakdown;
  }

  static calculateGuilds(guildCards: GuildCard[], playerData: ScoringInput, allPlayersData?: ScoringInput[]): GuildScore {
    let total = 0;
    let neighborDependentPoints = 0;
    let ownCardPoints = 0;
    let breakdown = '';

    // Get neighbor data if available
    const leftNeighbor = allPlayersData?.find(p => p.position === (playerData.position - 1 + (allPlayersData.length)) % (allPlayersData.length));
    const rightNeighbor = allPlayersData?.find(p => p.position === (playerData.position + 1) % (allPlayersData?.length || 1));

    guildCards.forEach(guild => {
      const points = this.calculateGuildCardPoints(guild, playerData, leftNeighbor, rightNeighbor);
      total += points;
      
      if (guild.dependsOnNeighbors) {
        neighborDependentPoints += points;
      } else {
        ownCardPoints += points;
      }
      
      breakdown += `• ${guild.name}: ${points} points\n`;
    });

    return {
      cards: guildCards,
      neighborDependentPoints,
      ownCardPoints,
      total,
      breakdown: breakdown.trim(),
    };
  }

  static calculateGuildCardPoints(guild: GuildCard, player: ScoringInput, leftNeighbor?: ScoringInput, rightNeighbor?: ScoringInput): number {
    // This is a simplified implementation - you'd need to expand based on actual guild cards
    switch (guild.id) {
      case 'workers_guild':
        // 1 point per brown card (self + neighbors)
        const brownCards = (player.cards.civilian.count || 0) + 
                           (leftNeighbor?.cards.civilian.count || 0) + 
                           (rightNeighbor?.cards.civilian.count || 0);
        return brownCards;
      
      case 'craftsmens_guild':
        // 2 points per gray card (self + neighbors)
        const grayCards = (player.cards.commercial.count || 0) + 
                          (leftNeighbor?.cards.commercial.count || 0) + 
                          (rightNeighbor?.cards.commercial.count || 0);
        return grayCards * 2;
      
      case 'scientists_guild':
        // Choose 1 science symbol
        return 7; // This would be handled in science calculation
      
      default:
        return guild.points;
    }
  }

  static calculateCities(citiesData: ScoringInput['cities']): CitiesScore {
    if (!citiesData) return { blackCards: 0, debt: 0, diplomacy: { red: 0, blue: 0, tokensUsed: false }, teamwork: 0, total: 0 };

    const blackCardPoints = citiesData.blackCards.points;
    const debtPenalty = citiesData.debtTokens * -1;
    const teamworkPoints = citiesData.teamworkCards.points;
    
    const total = blackCardPoints + debtPenalty + teamworkPoints;

    return {
      blackCards: blackCardPoints,
      debt: debtPenalty,
      diplomacy: {
        red: citiesData.diplomacyTokens.red,
        blue: citiesData.diplomacyTokens.blue,
        tokensUsed: citiesData.diplomacyTokens.used,
      },
      teamwork: teamworkPoints,
      total,
    };
  }

  static calculateArmada(armadaData: ScoringInput['armada']): ArmadaScore {
    if (!armadaData) return {
      navalConflicts: { age1: { victories: 0, defeats: 0 }, age2: { victories: 0, defeats: 0 }, age3: { victories: 0, defeats: 0 } },
      navalVictoryPoints: 0,
      navalDefeatPoints: 0,
      islands: [],
      shipyardAdvancement: 0,
      militaryBoarding: 0,
      total: 0
    };

    const navalVictoryPoints = 
      (armadaData.navalConflicts.age1.victories * 1) +
      (armadaData.navalConflicts.age2.victories * 3) +
      (armadaData.navalConflicts.age3.victories * 5);

    const navalDefeatPoints = 
      (armadaData.navalConflicts.age1.defeats +
       armadaData.navalConflicts.age2.defeats +
       armadaData.navalConflicts.age3.defeats) * -1;

    const islandPoints = armadaData.islands.reduce((sum, island) => sum + island.points, 0);

    const total = navalVictoryPoints + navalDefeatPoints + islandPoints + 
                  armadaData.shipyardPoints + armadaData.militaryBoardingTokens;

    return {
      navalConflicts: armadaData.navalConflicts,
      navalVictoryPoints,
      navalDefeatPoints,
      islands: armadaData.islands,
      shipyardAdvancement: armadaData.shipyardPoints,
      militaryBoarding: armadaData.militaryBoardingTokens,
      total,
    };
  }

  static calculateEdifice(edificeData: ScoringInput['edifice']): EdificeScore {
    if (!edificeData) return {
      projects: [],
      totalContributed: 0,
      completionBonuses: 0,
      endGameScoring: 0,
      total: 0
    };

    const totalContributed = edificeData.projects.reduce((sum, project) => sum + project.contributionLevel, 0);
    const completionBonuses = edificeData.projects.filter(p => p.completed).reduce((sum, project) => sum + project.pointsEarned, 0);
    const endGameScoring = edificeData.projects.reduce((sum, project) => sum + project.pointsEarned, 0);

    return {
      projects: edificeData.projects,
      totalContributed,
      completionBonuses,
      endGameScoring,
      total: endGameScoring,
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

  private static generateDetailedBreakdown(data: any): string {
    let breakdown = `🏆 Final Score: ${data.total} points\n\n`;
    
    breakdown += `⚔️ Military: ${data.military.total} points\n`;
    breakdown += `💰 Treasury: ${data.treasury} points\n`;
    breakdown += `🏛️ Wonder: ${data.wonder.total} points\n`;
    breakdown += `🏘️ Civilian: ${data.civilian} points\n`;
    breakdown += `💼 Commercial: ${data.commercial} points\n`;
    breakdown += `🔬 Science: ${data.science.total} points\n`;
    breakdown += `🎭 Guilds: ${data.guilds.total} points\n`;
    
    if (data.leaders) breakdown += `👑 Leaders: ${data.leaders} points\n`;
    if (data.cities) breakdown += `🏙️ Cities: ${data.cities.total} points\n`;
    if (data.armada) breakdown += `⚓ Armada: ${data.armada.total} points\n`;
    if (data.edifice) breakdown += `🗿 Edifice: ${data.edifice.total} points\n`;
    
    return breakdown;
  }

  static rankPlayers(scores: PlayerScore[]): PlayerScore[] {
    return scores
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        // Tiebreaker: coins, then science points
        if (b.treasury !== a.treasury) return b.treasury - a.treasury;
        return b.science.total - a.science.total;
      })
      .map((score, index) => ({
        ...score,
        finalRank: index + 1,
      }));
  }
}