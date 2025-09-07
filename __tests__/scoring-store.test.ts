import { act } from '@testing-library/react-native';

// Mock AsyncStorage used in store
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('scoringStore', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('initializes players, updates scores, totals, and leaderboard', () => {
    const { useScoringStore } = require('../store/scoringStore');

    act(() => {
      useScoringStore.getState().initializeScoring(['a', 'b'], { leaders: false, cities: false, armada: false, edifice: false });
    });

    // Update two categories
    act(() => {
      useScoringStore.getState().updateCategoryScore('a', 'wonder', 5);
      useScoringStore.getState().updateCategoryScore('a', 'treasury', 3);
      useScoringStore.getState().updateCategoryScore('b', 'wonder', 2);
      useScoringStore.getState().updateCategoryScore('b', 'treasury', 1);
    });

    const totalA = useScoringStore.getState().calculateTotal('a');
    const totalB = useScoringStore.getState().calculateTotal('b');
    expect(totalA).toBeGreaterThan(totalB);

    // All totals
    const totals = useScoringStore.getState().getAllTotals();
    expect(totals).toEqual(expect.objectContaining({ a: totalA, b: totalB }));

    // Leaderboard in order
    const leaderboard = useScoringStore.getState().getLeaderboard();
    expect(leaderboard[0].playerId).toBe('a');
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[1].rank).toBe(2);

    // Completion progress reflects only some categories set (base game ~7 categories)
    const progress = useScoringStore.getState().getCompletionProgress();
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);

    // Category breakdown contains set values
    const breakdownA = useScoringStore.getState().getCategoryBreakdown('a');
    expect(breakdownA.wonder).toBe(5);
    expect(breakdownA.treasury).toBe(3);
  });
});

