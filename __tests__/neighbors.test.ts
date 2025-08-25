import { neighbors } from '../lib/neighbors';

describe('neighbors', () => {
  it('returns correct neighbors for seat 0 in a 3-player game', () => {
    expect(neighbors(0, 3)).toEqual({ left: 2, right: 1 });
  });

  it('returns correct neighbors for seat 2 in a 5-player game', () => {
    expect(neighbors(2, 5)).toEqual({ left: 1, right: 3 });
  });

  it('returns correct neighbors for last seat', () => {
    expect(neighbors(2, 3)).toEqual({ left: 1, right: 0 });
  });

  it('throws on seat out of range', () => {
    expect(() => neighbors(3, 3)).toThrow('seat must be within range');
  });

  it('throws on non-positive player count', () => {
    expect(() => neighbors(0, 0)).toThrow('number of players must be positive');
  });
});

