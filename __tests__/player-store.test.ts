import { act } from '@testing-library/react-native';

// Mock AsyncStorage for persist
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('playerStore', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('adds, updates, toggles and deduplicates badges', () => {
    const { usePlayerStore } = require('../store/playerStore');

    let id = '';
    act(() => {
      id = usePlayerStore.getState().addProfile(' Alice ');
    });
    expect(id).not.toBe('');

    // Update
    act(() => {
      usePlayerStore.getState().updateProfile(id, { name: 'Alice Cooper' });
    });
    expect(usePlayerStore.getState().profiles[id].name).toBe('Alice Cooper');

    // Toggle selection up to 7
    const ids: string[] = [id];
    act(() => {
      for (let i = 0; i < 10; i++) {
        const nid = usePlayerStore.getState().addProfile(`P${i}`);
        ids.push(nid);
      }
    });
    act(() => {
      ids.forEach((pid) => usePlayerStore.getState().toggleSelected(pid));
    });
    expect(usePlayerStore.getState().selectedForGame.length).toBeLessThanOrEqual(7);

    // Grant badge twice -> once only
    act(() => {
      usePlayerStore.getState().grantBadge(id, 'record-holder');
      usePlayerStore.getState().grantBadge(id, 'record-holder');
    });
    expect(usePlayerStore.getState().profiles[id].badges.filter((b: any) => b.id === 'record-holder').length).toBe(1);
  });
});

