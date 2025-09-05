// data/badges.ts - Badge catalog scaffolding

export type Badge = {
  id: string;
  name: string;
  icon: string; // emoji or asset ref
  description: string;
  section: 'Records' | 'Wonders' | 'Strategies' | 'Special';
};

export const BADGES: Badge[] = [
  { id: 'record_holder', name: 'Record Holder', icon: '🏆', description: 'Held the local highest score.', section: 'Records' },
  { id: 'century_club', name: 'Century Club', icon: '💯', description: 'Score 100+ points in a game.', section: 'Records' },
  { id: 'warmonger', name: 'Warmonger', icon: '⚔️', description: '20+ points from Military.', section: 'Strategies' },
  { id: 'great_scientist', name: 'Great Scientist', icon: '🔬', description: '25+ points from Science.', section: 'Strategies' },
  // Wonder winners (sample; expand as needed)
  { id: 'wonder_victor_alexandria', name: 'Alexandria Victor', icon: '🗼', description: 'Win a game with Alexandria.', section: 'Wonders' },
  { id: 'wonder_victor_babylon', name: 'Babylon Victor', icon: '🌿', description: 'Win a game with Babylon.', section: 'Wonders' },
  { id: 'wonder_victor_giza', name: 'Gizah Victor', icon: '🧱', description: 'Win a game with Gizah.', section: 'Wonders' },
  { id: 'wonder_victor_artemis', name: 'Artemis Victor', icon: '🏹', description: 'Win a game with Artemis.', section: 'Wonders' },
  { id: 'wonder_victor_mausoleum', name: 'Mausoleum Victor', icon: '🏛️', description: 'Win a game with Halikarnassos/Mausoleum.', section: 'Wonders' },
  { id: 'wonder_victor_olympia', name: 'Olympia Victor', icon: '🔥', description: 'Win a game with Olympia.', section: 'Wonders' },
  { id: 'wonder_victor_colossus', name: 'Rhodes Victor', icon: '🗿', description: 'Win a game with Rhodes.', section: 'Wonders' },
];

export const groupBadges = (ids: string[]) => {
  const set = new Set(ids);
  const unlocked = BADGES.filter((b) => set.has(b.id));
  const locked = BADGES.filter((b) => !set.has(b.id));
  return { unlocked, locked };
};

