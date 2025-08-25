import { getWonderBoardSummary } from '../app/setup/getWonderBoardSummary';

describe('getWonderBoardSummary', () => {
  it('returns base message when no expansions selected', () => {
    expect(getWonderBoardSummary(0)).toBe('7 original wonder boards available');
  });

  it('returns singular expansion for one selected', () => {
    expect(getWonderBoardSummary(1)).toBe('9 wonder boards available (7 base + 2 expansion)');
  });

  it('returns plural expansions for multiple selected', () => {
    expect(getWonderBoardSummary(2)).toBe('11 wonder boards available (7 base + 4 expansions)');
  });
});
