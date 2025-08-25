export interface ScoreCategory {
  total?: number;
}

export interface PlayerScore {
  playerId: string;
  playerName?: string;
  position?: number;
  military?: ScoreCategory;
  treasury?: number;
  wonder?: ScoreCategory;
  civilian?: number;
  commercial?: number;
  science?: ScoreCategory;
  guilds?: ScoreCategory;
  leaders?: number;
  cities?: ScoreCategory;
  armada?: ScoreCategory;
  edifice?: ScoreCategory;
  navy?: ScoreCategory;
  islands?: ScoreCategory;
  total?: number;
  [key: string]: unknown;
}

export class Enhanced7WondersScoringEngine {
  /**
   * Calculates the total score for a player by summing all supported categories.
   */
  static calculateTotalScore(player: PlayerScore): number {
    const categories: Array<number | undefined> = [
      player.military?.total,
      player.treasury,
      player.wonder?.total,
      player.civilian,
      player.commercial,
      player.science?.total,
      player.guilds?.total,
      player.leaders,
      player.cities?.total,
      player.armada?.total,
      player.edifice?.total,
      player.navy?.total,
      player.islands?.total,
    ];

    return categories.reduce((sum, value) => sum + (value ?? 0), 0);
  }

  /**
   * Generates a new array with totals calculated for every player.
   */
  static addTotals(players: PlayerScore[]): PlayerScore[] {
    return players.map((p) => ({ ...p, total: this.calculateTotalScore(p) }));
  }

  /**
   * Sorts players by their total score and applies standard 7 Wonders tie breakers.
   * - Highest total points wins.
   * - If tied, the player with the most treasury points wins.
   * - If still tied, seating position (lowest value) wins.
   */
  static rankPlayers(players: PlayerScore[]): PlayerScore[] {
    const scored = this.addTotals(players);

    return scored.sort((a, b) => {
      const totalDiff = (b.total ?? 0) - (a.total ?? 0);
      if (totalDiff !== 0) return totalDiff;

      const treasuryDiff = (b.treasury ?? 0) - (a.treasury ?? 0);
      if (treasuryDiff !== 0) return treasuryDiff;

      const posA = a.position ?? 0;
      const posB = b.position ?? 0;
      return posA - posB;
    });
  }
}

export default Enhanced7WondersScoringEngine;
