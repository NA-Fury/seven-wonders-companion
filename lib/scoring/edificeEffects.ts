import { getProjectById, type EdificeProject } from '@/data/edificeDatabase';

export type EdificeOutcome = Record<1 | 2 | 3, 'reward' | 'penalty' | 'none'>;

export type EdificeProjectsByAge = Record<1 | 2 | 3, EdificeProject | null>;

export type EdificeEffectsResult = {
  projectsByAge: EdificeProjectsByAge;
  effectsBreakdown: string[];
  totalCoinsDelta: number;
  totalMilitaryTokensII: number;
  totalMilitaryTokensIII: number;
  totalMilitaryStrength: number;
  totalPenaltyEffects: string[];
};

/**
 * Computes Edifice effects for a single player based on completion outcomes.
 * This keeps the detail rendering in UI while centralizing the scoring logic.
 */
export function computeEdificeEffects(
  edificeProjects: { age1?: string; age2?: string; age3?: string } | undefined,
  outcomeByAge: EdificeOutcome
): EdificeEffectsResult {
  const projectsByAge: EdificeProjectsByAge = {
    1: edificeProjects?.age1 ? (getProjectById(edificeProjects.age1) ?? null) : null,
    2: edificeProjects?.age2 ? (getProjectById(edificeProjects.age2) ?? null) : null,
    3: edificeProjects?.age3 ? (getProjectById(edificeProjects.age3) ?? null) : null,
  };

  let totalCoinsDelta = 0;
  let totalMilitaryTokensII = 0;
  let totalMilitaryTokensIII = 0;
  let totalMilitaryStrength = 0;
  const totalPenaltyEffects: string[] = [];
  const effectsBreakdown: string[] = [];

  ([
    1,
    2,
    3,
  ] as const).forEach((age) => {
    const project = projectsByAge[age];
    if (!project) return;
    const outcome = outcomeByAge[age];

    if (outcome === 'reward' && project.reward) {
      const r = project.reward;
      switch (r.kind) {
        case 'Coins':
          totalCoinsDelta += r.amount || 0;
          effectsBreakdown.push(`Age ${age}: +${r.amount || 0} coins (reward)`);
          break;
        case 'MilitaryVictoryToken':
          if (r.tokenAge === 2) totalMilitaryTokensII += r.amount || 0;
          else if (r.tokenAge === 3) totalMilitaryTokensIII += r.amount || 0;
          effectsBreakdown.push(`Age ${age}: +${r.amount || 0} Age ${r.tokenAge} military tokens (reward)`);
          break;
        case 'MilitaryStrength':
          totalMilitaryStrength += r.amount || 0;
          effectsBreakdown.push(`Age ${age}: +${r.amount || 0} military strength (reward)`);
          break;
        case 'EndGameVP':
          effectsBreakdown.push(`Age ${age}: VP bonus from ${project.name} (reward) - calculate manually`);
          break;
        case 'Special':
          effectsBreakdown.push(`Age ${age}: ${r.description} (reward)`);
          break;
      }
    } else if (outcome === 'penalty' && project.penalty) {
      const p = project.penalty;
      switch (p.kind) {
        case 'Coins':
          totalCoinsDelta -= p.amount || 0;
          effectsBreakdown.push(`Age ${age}: -${p.amount || 0} coins (penalty)`);
          break;
        case 'RemoveCard':
          totalPenaltyEffects.push(`Remove 1 ${p.colorToRemove} card from Age ${age}`);
          effectsBreakdown.push(`Age ${age}: Remove 1 ${p.colorToRemove} card (penalty)`);
          break;
        case 'LoseMilitaryVictoryTokens':
          totalPenaltyEffects.push(`Lose ${p.amount || 0} military victory tokens from Age ${age}`);
          effectsBreakdown.push(`Age ${age}: Lose ${p.amount || 0} military tokens (penalty)`);
          break;
      }
    }
  });

  return {
    projectsByAge,
    effectsBreakdown,
    totalCoinsDelta,
    totalMilitaryTokensII,
    totalMilitaryTokensIII,
    totalMilitaryStrength,
    totalPenaltyEffects,
  };
}
