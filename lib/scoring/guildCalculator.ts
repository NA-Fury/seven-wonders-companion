// lib/scoring/guildCalculator.ts - Accurate 7 Wonders Guild Calculations
export interface NeighborData {
  playerId: string;
  position: number;
  cardCounts: {
    brown: number;    // Raw materials
    grey: number;     // Manufactured goods  
    blue: number;     // Civilian structures
    green: number;    // Science structures
    red: number;      // Military structures
    yellow: number;   // Commercial structures
    purple: number;   // Guild structures
  };
  wonderStages: number;
  defeatTokens: number;
  coins: number;
}

export interface GuildDefinition {
  id: string;
  name: string;
  description: string;
  calculation: string;
  dependsOnNeighbors: boolean;
  cardColor?: string;
  pointsPerCard?: number;
  fixedPoints?: number;
}

// Official 7 Wonders Guild Cards with accurate calculations
export const GUILD_CARDS: GuildDefinition[] = [
  {
    id: 'workers_guild',
    name: "Workers' Guild", 
    description: 'Gain 1 victory point for each brown card (raw materials) you and your neighbors have built',
    calculation: '1 point per brown card (self + neighbors)',
    dependsOnNeighbors: true,
    cardColor: 'brown',
    pointsPerCard: 1
  },
  {
    id: 'craftsmens_guild',
    name: "Craftsmen's Guild",
    description: 'Gain 2 victory points for each grey card (manufactured goods) you and your neighbors have built', 
    calculation: '2 points per grey card (self + neighbors)',
    dependsOnNeighbors: true,
    cardColor: 'grey',
    pointsPerCard: 2
  },
  {
    id: 'traders_guild',
    name: "Traders' Guild",
    description: 'Gain 1 victory point for each yellow card (commercial structures) you and your neighbors have built',
    calculation: '1 point per yellow card (self + neighbors)', 
    dependsOnNeighbors: true,
    cardColor: 'yellow',
    pointsPerCard: 1
  },
  {
    id: 'philosophers_guild',
    name: "Philosophers' Guild",
    description: 'Gain 1 victory point for each green card (science structures) you and your neighbors have built',
    calculation: '1 point per green card (self + neighbors)',
    dependsOnNeighbors: true,
    cardColor: 'green', 
    pointsPerCard: 1
  },
  {
    id: 'spies_guild',
    name: "Spies' Guild",
    description: 'Gain 1 victory point for each red card (military structures) you and your neighbors have built',
    calculation: '1 point per red card (self + neighbors)',
    dependsOnNeighbors: true,
    cardColor: 'red',
    pointsPerCard: 1
  },
  {
    id: 'magistrates_guild',
    name: "Magistrates' Guild",
    description: 'Gain 1 victory point for each blue card (civilian structures) you and your neighbors have built',
    calculation: '1 point per blue card (self + neighbors)', 
    dependsOnNeighbors: true,
    cardColor: 'blue',
    pointsPerCard: 1
  },
  {
    id: 'shipowners_guild', 
    name: "Shipowners' Guild",
    description: 'Gain 1 victory point for each brown, grey, and purple card you have built',
    calculation: '1 point per brown/grey/purple card (self only)',
    dependsOnNeighbors: false,
    cardColor: 'mixed'
  },
  {
    id: 'scientists_guild',
    name: "Scientists' Guild", 
    description: 'Choose one science symbol. This card is worth 7 victory points',
    calculation: 'Choose 1 science symbol (counts as wild science)',
    dependsOnNeighbors: false,
    fixedPoints: 7
  },
  {
    id: 'builders_guild',
    name: "Builders' Guild",
    description: 'Gain 2 victory points for each wonder stage you and your neighbors have built',
    calculation: '2 points per wonder stage (self + neighbors)',
    dependsOnNeighbors: true,
    pointsPerCard: 2
  },
  {
    id: 'strategists_guild',
    name: "Strategists' Guild", 
    description: 'Gain 1 victory point for each defeat token you and your neighbors have',
    calculation: '1 point per defeat token (self + neighbors)',
    dependsOnNeighbors: true,
    pointsPerCard: 1
  }
];

export class GuildCalculator {
  
  static calculateGuildPoints(
    guildId: string, 
    playerData: NeighborData, 
    leftNeighbor?: NeighborData, 
    rightNeighbor?: NeighborData
  ): { points: number; breakdown: string } {
    
    const guild = GUILD_CARDS.find(g => g.id === guildId);
    if (!guild) {
      return { points: 0, breakdown: 'Unknown guild card' };
    }

    let points = 0;
    let breakdown = '';

    switch (guild.id) {
      case 'workers_guild': {
        const selfBrown = playerData.cardCounts.brown;
        const leftBrown = leftNeighbor?.cardCounts.brown || 0;
        const rightBrown = rightNeighbor?.cardCounts.brown || 0;
        const total = selfBrown + leftBrown + rightBrown;
        points = total * 1;
        breakdown = `Brown cards: ${selfBrown} (self) + ${leftBrown} (left) + ${rightBrown} (right) = ${total} × 1 = ${points} points`;
        break;
      }

      case 'craftsmens_guild': {
        const selfGrey = playerData.cardCounts.grey;
        const leftGrey = leftNeighbor?.cardCounts.grey || 0;
        const rightGrey = rightNeighbor?.cardCounts.grey || 0;
        const total = selfGrey + leftGrey + rightGrey;
        points = total * 2;
        breakdown = `Grey cards: ${selfGrey} (self) + ${leftGrey} (left) + ${rightGrey} (right) = ${total} × 2 = ${points} points`;
        break;
      }

      case 'traders_guild': {
        const selfYellow = playerData.cardCounts.yellow;
        const leftYellow = leftNeighbor?.cardCounts.yellow || 0;
        const rightYellow = rightNeighbor?.cardCounts.yellow || 0;
        const total = selfYellow + leftYellow + rightYellow;
        points = total * 1;
        breakdown = `Yellow cards: ${selfYellow} (self) + ${leftYellow} (left) + ${rightYellow} (right) = ${total} × 1 = ${points} points`;
        break;
      }

      case 'philosophers_guild': {
        const selfGreen = playerData.cardCounts.green;
        const leftGreen = leftNeighbor?.cardCounts.green || 0;
        const rightGreen = rightNeighbor?.cardCounts.green || 0;
        const total = selfGreen + leftGreen + rightGreen;
        points = total * 1;
        breakdown = `Green cards: ${selfGreen} (self) + ${leftGreen} (left) + ${rightGreen} (right) = ${total} × 1 = ${points} points`;
        break;
      }

      case 'spies_guild': {
        const selfRed = playerData.cardCounts.red;
        const leftRed = leftNeighbor?.cardCounts.red || 0;
        const rightRed = rightNeighbor?.cardCounts.red || 0;
        const total = selfRed + leftRed + rightRed;
        points = total * 1;
        breakdown = `Red cards: ${selfRed} (self) + ${leftRed} (left) + ${rightRed} (right) = ${total} × 1 = ${points} points`;
        break;
      }

      case 'magistrates_guild': {
        const selfBlue = playerData.cardCounts.blue;
        const leftBlue = leftNeighbor?.cardCounts.blue || 0;
        const rightBlue = rightNeighbor?.cardCounts.blue || 0;
        const total = selfBlue + leftBlue + rightBlue;
        points = total * 1;
        breakdown = `Blue cards: ${selfBlue} (self) + ${leftBlue} (left) + ${rightBlue} (right) = ${total} × 1 = ${points} points`;
        break;
      }

      case 'shipowners_guild': {
        const brown = playerData.cardCounts.brown;
        const grey = playerData.cardCounts.grey; 
        const purple = playerData.cardCounts.purple;
        const total = brown + grey + purple;
        points = total * 1;
        breakdown = `Self only: ${brown} brown + ${grey} grey + ${purple} purple = ${total} × 1 = ${points} points`;
        break;
      }

      case 'scientists_guild': {
        points = 7;
        breakdown = 'Fixed 7 points + 1 science symbol of your choice (handled in science calculation)';
        break;
      }

      case 'builders_guild': {
        const selfStages = playerData.wonderStages;
        const leftStages = leftNeighbor?.wonderStages || 0;
        const rightStages = rightNeighbor?.wonderStages || 0;
        const total = selfStages + leftStages + rightStages;
        points = total * 2;
        breakdown = `Wonder stages: ${selfStages} (self) + ${leftStages} (left) + ${rightStages} (right) = ${total} × 2 = ${points} points`;
        break;
      }

      case 'strategists_guild': {
        const selfDefeats = playerData.defeatTokens;
        const leftDefeats = leftNeighbor?.defeatTokens || 0;
        const rightDefeats = rightNeighbor?.defeatTokens || 0;
        const total = selfDefeats + leftDefeats + rightDefeats;
        points = total * 1;
        breakdown = `Defeat tokens: ${selfDefeats} (self) + ${leftDefeats} (left) + ${rightDefeats} (right) = ${total} × 1 = ${points} points`;
        break;
      }

      default:
        breakdown = 'Unknown guild calculation';
        break;
    }

    return { points, breakdown };
  }

  static getAllGuildDefinitions(): GuildDefinition[] {
    return GUILD_CARDS;
  }

  static getGuildById(id: string): GuildDefinition | undefined {
    return GUILD_CARDS.find(g => g.id === id);
  }

  static getGuildsByCategory(cardColor: string): GuildDefinition[] {
    return GUILD_CARDS.filter(g => g.cardColor === cardColor);
  }

  static getNeighborDependentGuilds(): GuildDefinition[] {
    return GUILD_CARDS.filter(g => g.dependsOnNeighbors);
  }

  static validateGuildSelection(guildIds: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for duplicates
    const duplicates = guildIds.filter((id, index) => guildIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate guild cards: ${duplicates.join(', ')}`);
    }

    // Check for unknown guilds
    const unknownGuilds = guildIds.filter(id => !GUILD_CARDS.find(g => g.id === id));
    if (unknownGuilds.length > 0) {
      errors.push(`Unknown guild cards: ${unknownGuilds.join(', ')}`);
    }

    // Typically players can only have 1-2 guild cards maximum
    if (guildIds.length > 3) {
      errors.push(`Too many guild cards (${guildIds.length}). Maximum is typically 3.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper function to estimate guild values for selection
  static estimateGuildValue(
    guildId: string, 
    estimatedCardCounts: { [color: string]: number },
    estimatedNeighborCards: { [color: string]: number } = {}
  ): number {
    const guild = GUILD_CARDS.find(g => g.id === guildId);
    if (!guild) return 0;

    switch (guild.id) {
      case 'workers_guild':
        return (estimatedCardCounts.brown || 0) + (estimatedNeighborCards.brown || 0);
      case 'craftsmens_guild':
        return ((estimatedCardCounts.grey || 0) + (estimatedNeighborCards.grey || 0)) * 2;
      case 'traders_guild':
        return (estimatedCardCounts.yellow || 0) + (estimatedNeighborCards.yellow || 0);
      case 'philosophers_guild':
        return (estimatedCardCounts.green || 0) + (estimatedNeighborCards.green || 0);
      case 'spies_guild':
        return (estimatedCardCounts.red || 0) + (estimatedNeighborCards.red || 0);
      case 'magistrates_guild':
        return (estimatedCardCounts.blue || 0) + (estimatedNeighborCards.blue || 0);
      case 'shipowners_guild':
        return (estimatedCardCounts.brown || 0) + (estimatedCardCounts.grey || 0) + (estimatedCardCounts.purple || 0);
      case 'scientists_guild':
        return 7; // Fixed value
      case 'builders_guild':
        return ((estimatedCardCounts.wonderStages || 0) + (estimatedNeighborCards.wonderStages || 0)) * 2;
      case 'strategists_guild':
        return (estimatedCardCounts.defeatTokens || 0) + (estimatedNeighborCards.defeatTokens || 0);
      default:
        return 0;
    }
  }
}