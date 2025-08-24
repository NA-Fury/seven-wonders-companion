export type EdificeProject = {
  id: string;
  age: 1|2|3;
  name: string;
  effectSummary: string; // human note; scoring hooks will live in the engine later
};

export const OFFICIAL_EDIFICE_PROJECTS: EdificeProject[] = [
  // TODO: Fill with the official list later (Milestone 2.5).
  // Example placeholders:
  { id: 'a1-aqueduct', age: 1, name: 'Aqueduct', effectSummary: 'Contribute for coins; end-of-game VP for contributors.' },
  { id: 'a1-workshop', age: 1, name: 'Workshop', effectSummary: 'Contribute for discount; small VP at end.' },
  { id: 'a2-fortifications', age: 2, name: 'Fortifications', effectSummary: 'Mid-game shield bonus for contributors.' },
  { id: 'a3-arena', age: 3, name: 'Arena', effectSummary: 'Big end-of-game VP for contributors/finishers.' },
];
