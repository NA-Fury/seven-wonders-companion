// /data/leadersDatabase.ts
// Leaders database with search + immediate VP helpers
// Only applies DIRECT VP for now. Coins/military/diplomacy/etc are stored for future analysis.

export type CostType = 'flat' | 'age';

export interface Leader {
  id: string;                // slug
  name: string;
  costType: CostType;        // 'flat' or 'age' (A Coins)
  cost: number;              // if costType === 'age', this is the base (1..3 by Age in-game)
  immediate?: {
    vp?: number;             // direct VP on recruit (applied now)
    coins?: number;          // direct coins on recruit (NOT converted to VP now)
    military?: number;       // immediate shields (future: military calc)
    diplomacy?: boolean;     // grants diplomacy token
  };
  textEffect?: string;       // short rules text (for UI)
  endGame?: string;          // end-game scoring (stored for later)
  tags?: string[];           // synergy tags for later analysis
  notes?: string;            // extra notes/explanations
}

// Helper: normalize names for matching/suggestions
const norm = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const LEADERS: Leader[] = [
  // --- Economy / Cost reducers / Free builds ---
  { id: 'maecenas', name: 'Maecenas', costType:'flat', cost:1,
    textEffect:'You may recruit all next Leaders for free.',
    tags:['leaders','economy'], notes:'Free chain of leaders; Roma (Night) synergy.' },
  { id: 'imhotep', name: 'Imhotep', costType:'flat', cost:3,
    textEffect:'Pay 1 fewer resource to construct Wonder stages.',
    tags:['wonder','economy'], notes:'Carthage/Gizah synergy.' },
  { id: 'hammurabi', name: 'Hammurabi', costType:'flat', cost:2,
    textEffect:'Pay 1 fewer resource to construct blue cards.',
    tags:['civil','economy'] },
  { id: 'leonidas', name: 'Leonidas', costType:'flat', cost:2,
    textEffect:'Pay 1 fewer resource to construct red cards.',
    tags:['military','economy'] },
  { id: 'archimedes', name: 'Archimedes', costType:'flat', cost:4,
    textEffect:'Pay 1 fewer resource to construct green cards.',
    tags:['science','economy'] },
  { id: 'ramses', name: 'Ramses', costType:'flat', cost:5,
    textEffect:'Construct purple (guild) cards for free.',
    tags:['guild','economy'] },

  // --- Direct money / per-action income ---
  { id:'croesus', name:'Croesus', costType:'flat', cost:1,
    immediate:{ coins:6 }, textEffect:'Gain 6 coins now.',
    tags:['treasury'] },
  { id:'xenophon', name:'Xenophon', costType:'flat', cost:2,
    textEffect:'Each time you construct a yellow card, gain 2 coins.',
    tags:['commercial'] },
  { id:'vitruvius', name:'Vitruvius', costType:'flat', cost:1,
    textEffect:'Each time you chain-build for free, gain 2 coins.',
    tags:['chaining','economy'] },
  { id:'nero', name:'Nero', costType:'flat', cost:1,
    textEffect:'Each time you gain a Military Victory token, gain 2 coins.',
    tags:['military','treasury'] },
  { id:'bilkis', name:'Bilkis', costType:'flat', cost:4,
    textEffect:'Once per turn, buy any resource from the reserve for 1 coin.',
    tags:['economy','resources'] },

  // --- Immediate military / diplomacy / special actions ---
  { id:'hannibal', name:'Hannibal', costType:'flat', cost:2,
    immediate:{ military:1 }, textEffect:'+1 Military Strength.',
    tags:['military'] },
  { id:'caesar', name:'Caesar', costType:'flat', cost:5,
    immediate:{ military:2 }, textEffect:'+2 Military Strength.',
    tags:['military'] },
  { id:'solomon', name:'Solomon', costType:'flat', cost:3,
    textEffect:'Take all cards in discard; choose 1 and construct it for free.',
    tags:['flex','discard'] },

  // --- Science boosters (end-game) ---
  { id:'euclid', name:'Euclid', costType:'flat', cost:5,
    textEffect:'Science booster.', endGame:'Science scoring synergy.',
    tags:['science'] },
  { id:'ptolemy', name:'Ptolemy', costType:'flat', cost:5,
    textEffect:'Science booster.', endGame:'Science scoring synergy.',
    tags:['science'] },
  { id:'pythagoras', name:'Pythagoras', costType:'flat', cost:5,
    textEffect:'Science booster.', endGame:'Science scoring synergy.',
    tags:['science'] },

  // --- DIRECT VP on recruit (applied now) ---
  { id:'sappho', name:'Sappho', costType:'flat', cost:1,
    immediate:{ vp:2 }, textEffect:'+2 VP now.', tags:['direct-vp'] },
  { id:'zenobia', name:'Zenobia', costType:'flat', cost:2,
    immediate:{ vp:3 }, textEffect:'+3 VP now.', tags:['direct-vp'] },
  { id:'nefertiti', name:'Nefertiti', costType:'flat', cost:3,
    immediate:{ vp:4 }, textEffect:'+4 VP now.', tags:['direct-vp'] },
  { id:'cleopatra', name:'Cleopatra', costType:'flat', cost:4,
    immediate:{ vp:5 }, textEffect:'+5 VP now.', tags:['direct-vp'] },

  // --- End-game per-color/per-set VP ---
  { id:'phidias', name:'Phidias', costType:'flat', cost:3,
    endGame:'1 VP per brown card in your city.',
    tags:['civil','brown'] },
  { id:'praxiteles', name:'Praxiteles', costType:'flat', cost:3,
    endGame:'2 VP per grey card in your city.',
    tags:['grey'] },
  { id:'nebuchadnezzar', name:'Nebuchadnezzar', costType:'flat', cost:4,
    endGame:'1 VP per blue card in your city.',
    tags:['civil'] },
  { id:'varro', name:'Varro', costType:'flat', cost:3,
    endGame:'1 VP per yellow card in your city.',
    tags:['commercial'] },
  { id:'pericles', name:'Pericles', costType:'flat', cost:6,
    endGame:'2 VP per red card in your city.',
    tags:['military'] },
  { id:'hypatia', name:'Hypatia', costType:'flat', cost:4,
    endGame:'1 VP per green card in your city.',
    tags:['science'] },
  { id:'hiram', name:'Hiram', costType:'flat', cost:3,
    endGame:'2 VP per purple card in your city.',
    tags:['guild'] },
  { id:'midas', name:'Midas', costType:'flat', cost:3,
    endGame:'1 VP per complete set of 3 coins in your treasure.',
    tags:['treasury'] },
  { id:'amytis', name:'Amytis', costType:'flat', cost:4,
    endGame:'2 VP per Wonder stage you constructed.',
    tags:['wonder'] },
  { id:'alexander', name:'Alexander', costType:'flat', cost:3,
    endGame:'1 VP per Military Victory token you earned.',
    tags:['military'] },
  { id:'justinian', name:'Justinian', costType:'flat', cost:3,
    endGame:'3 VP per complete set of (blue, red, green).',
    tags:['set-collect'] },
  { id:'plato', name:'Plato', costType:'flat', cost:3,
    endGame:'7 VP per complete set of all colors (br, gr, bl, yl, rd, gn, pr).',
    tags:['set-collect'] },
  { id:'aristotle', name:'Aristotle', costType:'flat', cost:3,
    endGame:'3 VP per complete set of 3 different Science symbols.',
    tags:['science','set-collect'] },

  // --- Coin bonus/neighbor interactions ---
  { id:'berenice', name:'Berenice', costType:'flat', cost:2,
    textEffect:'When you gain coins from reserve, take +1 coin.',
    tags:['treasury'] },
  { id:'hapshepsut', name:'Hapshepsut', costType:'flat', cost:2,
    textEffect:'Once per turn per neighbor, gain 1 coin after buying a resource from them.',
    tags:['trade','treasury'] },

  // --- Age-cost leaders (A Coins) ---
  { id:'nitocris', name:'Nitocris', costType:'age', cost:1,
    textEffect:'Take a Military Victory token for the current Age.',
    tags:['military'] },
  { id:'telesilla', name:'Telesilla', costType:'flat', cost:3,
    textEffect:'Discard all your Military Defeat tokens. All others discard one Victory token of their choice.',
    tags:['military'] },
  { id:'tomyris', name:'Tomyris', costType:'flat', cost:4,
    textEffect:'When you take a Defeat token, give it to your winning neighbor instead.',
    tags:['military'] },
  { id:'aganice', name:'Aganice', costType:'age', cost:1,
    endGame:'Replace 1 science symbol with any symbol.',
    tags:['science'] },
  { id:'enheduania', name:'Enheduania', costType:'flat', cost:4,
    endGame:'Gain 1 extra science symbol: whichever you have the most of.',
    tags:['science'] },
  { id:'phryne', name:'Phryne', costType:'age', cost:1,
    endGame:'+5 VP if you have more blue cards than each neighbor.',
    tags:['civil','conditional'] },
  { id:'cornelia', name:'Cornelia', costType:'age', cost:1,
    endGame:'+5 VP if you have more yellow cards than each neighbor.',
    tags:['commercial','conditional'] },
  { id:'euryptyle', name:'Euryptyle', costType:'age', cost:1,
    endGame:'+5 VP if you have more red cards than each neighbor.',
    tags:['military','conditional'] },
  { id:'theano', name:'Theano', costType:'age', cost:1,
    endGame:'+5 VP if you have more green cards than each neighbor.',
    tags:['science','conditional'] },
  { id:'makeda', name:'Makeda', costType:'age', cost:1,
    endGame:'+5 VP if you have more coins than each neighbor.',
    tags:['treasury','conditional'] },
  { id:'cynisca', name:'Cynisca', costType:'age', cost:1,
    endGame:'+6 VP if you have no Military Defeat tokens.',
    tags:['military','conditional'] },

  // --- Token/unique patterns ---
  { id:'gorgo', name:'Gorgo', costType:'flat', cost:5,
    endGame:'For each pair of identical Military Victory tokens, gain VP equal to the token value.',
    tags:['military'] },
  { id:'agrippina', name:'Agrippina', costType:'flat', cost:1,
    endGame:'+7 VP if Agrippina is the only face-up Leader in your city.',
    tags:['leaders','conditional'] },
  { id:'caligula', name:'Caligula', costType:'flat', cost:3,
    textEffect:'Once per Age, construct a black card for free.',
    tags:['cities'] },
  { id:'diocletian', name:'Diocletian', costType:'flat', cost:2,
    textEffect:'Each time you construct a black card, gain 2 coins.',
    tags:['cities','treasury'] },
  { id:'octavia', name:'Octavia', costType:'flat', cost:1,
    textEffect:'Each time you construct a Wonder stage, gain 2 coins; all others lose 1 coin.',
    tags:['wonder','treasury'] },
  { id:'arsinoe', name:'Arsinoe', costType:'age', cost:1,
    immediate:{ coins:4 }, textEffect:'Gain 4 coins; all others lose coins equal to current Age.',
    tags:['treasury','interaction'] },
  { id:'aspasia', name:'Aspasia', costType:'flat', cost:3,
    immediate:{ vp:2 }, textEffect:'+2 VP & take a Diplomacy token.',
    tags:['cities','diplomacy','direct-vp'] },
  { id:'darius', name:'Darius', costType:'flat', cost:4,
    endGame:'1 VP per black card in your city.',
    tags:['cities'] },
];

// Recommended leaders by wonder (for later synergy analysis)
export const RECOMMENDED_BY_WONDER: Record<string, { day?: string[]; night?: string[] }> = {
  Alexandria: { day:['Leonidas','Hammurabi','Bilkis'] },
  Babylon:    { day:['Archimedes','Hypatia','Theano','Enheduania','Aganice','Aristotle'] },
  Éphesos:    { day:['Xenophon','Hapshepsut','Varro'] },
  Gizah:      { day:['Phidias'], night:['Imhotep','Amytis','Octavia'] },
  Halikarnassos:{ day:['Solomon'], night:['Vitruvius','Enheduania','Aganice'] },
  Olympía:    { day:['Plato','Justinian','Hannibal'], night:['Vitruvius','Praxiteles'] },
  Rhódos:     { day:['Leonidas','Nero','Alexander','Gorgo'] },
  Byzantium:  { day:['Aspasia','Cynisca'] },
  Petra:      { day:['Croesus','Arsinoe','Diocletian','Midas'] },
  Roma:       { day:['Caesar','Pericles','Gorgo','Ramses'], night:['Maecenas'] },
  'Abu Simbel':{ day:['Bilkis','Archimedes','Ramses'], night:['Agrippina'] },
  Siracusa:   { day:[], night:[] }, // (not specified in source text)
  Carthage:   { day:[], night:[] }, // (not specified in source text)
  Ur:         { day:[], night:[] }, // (not specified in source text)
};

// --- API ---

export function searchLeaders(query: string, limit = 8): Leader[] {
  const q = norm(query);
  if (!q) return [];
  // startsWith preferred, then includes
  const starts = LEADERS.filter(l => norm(l.name).startsWith(q));
  const includes = LEADERS.filter(l => !starts.includes(l) && norm(l.name).includes(q));
  return [...starts, ...includes].slice(0, limit);
}

export function getLeaderByName(name: string): Leader | undefined {
  const q = norm(name);
  return LEADERS.find(l => norm(l.name) === q);
}

export function sumImmediateVP(leaderNames: string[]): number {
  return leaderNames.reduce((sum, n) => {
    const l = getLeaderByName(n);
    return sum + (l?.immediate?.vp ?? 0);
  }, 0);
}

export function immediateInfo(leaderNames: string[]) {
  return leaderNames.map(n => {
    const l = getLeaderByName(n);
    return {
      name: n,
      vp: l?.immediate?.vp ?? 0,
      coins: l?.immediate?.coins ?? 0,
      military: l?.immediate?.military ?? 0,
      diplomacy: !!l?.immediate?.diplomacy,
    };
  });
}
