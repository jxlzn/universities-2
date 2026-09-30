// ---------------------------------------------------------------------------
// Data for "Does the rise of Asia's universities pass Times Higher Education's test?"
// Sources:
//   Times Higher Education World University Rankings 2025, 2026 & 2027
//   QS World University Rankings 2027
//   U.S. News Best Global Universities 2026–27
// ---------------------------------------------------------------------------

/** False once THE WUR 2027 numbers are entered. */
export const the27Pending = false;

/** HTML wrapper for in-copy TODOs — amber chalk chips in the draft. */
export function ph(label) {
  return `<span class="ph">[${label}]</span>`;
}

export const systems = {
  qs: { key: 'qs', label: 'QS', full: 'QS World University Rankings 2027', color: 'var(--qs)' },
  the: { key: 'the', label: 'THE', full: 'Times Higher Education 2027', color: 'var(--the)' },
  us: { key: 'us', label: 'U.S. News', full: 'U.S. News Best Global 2026–27', color: 'var(--us)' }
};

export const regions = {
  asia: { key: 'asia', label: 'Asia', color: 'var(--r-asia)' },
  na: { key: 'na', label: 'North America', color: 'var(--r-na)' },
  europe: { key: 'europe', label: 'Europe', color: 'var(--r-europe)' },
  rest: { key: 'rest', label: 'Rest of world', color: 'var(--r-rest)' }
};

// Region for chart colouring. HK/SG/CN/JP treated as Asia (BT editorial frame).
export function regionOf(country) {
  if (['CN', 'HK', 'SG', 'JP', 'KR', 'TW'].includes(country)) return 'asia';
  if (['US', 'CA'].includes(country)) return 'na';
  if (['GB', 'CH', 'DE', 'FR', 'NL', 'SE', 'BE', 'IT', 'ES', 'DK', 'AT', 'FI', 'IE', 'NO'].includes(country))
    return 'europe';
  return 'rest';
}

// Share of THE Top 50 by region. Counts from published overall tables
// (ties share a rank; institutions in a tied band inside the top 50 are included).
export const regionalShares = [
  { year: 2018, asia: 6, na: 25, europe: 17, rest: 2 },
  { year: 2021, asia: 7, na: 24, europe: 17, rest: 2 },
  { year: 2024, asia: 9, na: 23, europe: 16, rest: 2 },
  { year: 2025, asia: 9, na: 24, europe: 15, rest: 2 },
  { year: 2026, asia: 10, na: 23, europe: 15, rest: 2 },
  { year: 2027, asia: 10, na: 25, europe: 14, rest: 1 }
];

export const regionOrder = ['asia', 'na', 'europe', 'rest'];

export const universities = [
  { id: 'oxford',   name: 'University of Oxford',          short: 'Oxford',     country: 'GB', the25: 1,  the26: 1,  the27: 1,  qs27: 4,  us: 4 },
  { id: 'mit',      name: 'MIT',                          short: 'MIT',        country: 'US', the25: 2,  the26: 2,  the27: 2,  qs27: 1,  us: 2 },
  { id: 'harvard',  name: 'Harvard University',            short: 'Harvard',    country: 'US', the25: 3,  the26: 5,  the27: 6,  qs27: 5,  us: 1 },
  { id: 'princeton',name: 'Princeton University',          short: 'Princeton',  country: 'US', the25: 4,  the26: 3,  the27: 3,  qs27: 27, us: 14 },
  { id: 'cambridge',name: 'University of Cambridge',       short: 'Cambridge',  country: 'GB', the25: 5,  the26: 3,  the27: 5,  qs27: 6,  us: 5 },
  { id: 'stanford', name: 'Stanford University',           short: 'Stanford',   country: 'US', the25: 6,  the26: 5,  the27: 3,  qs27: 2,  us: 3 },
  { id: 'caltech',  name: 'Caltech',                       short: 'Caltech',    country: 'US', the25: 7,  the26: 7,  the27: 7,  qs27: 7,  us: 23 },
  { id: 'berkeley', name: 'UC Berkeley',                   short: 'Berkeley',   country: 'US', the25: 8,  the26: 9,  the27: 9,  qs27: 20, us: 7 },
  { id: 'imperial', name: 'Imperial College London',      short: 'Imperial',   country: 'GB', the25: 9,  the26: 8,  the27: 8,  qs27: 2,  us: 14 },
  { id: 'yale',     name: 'Yale University',               short: 'Yale',       country: 'US', the25: 10, the26: 10, the27: 9,  qs27: 16, us: 8 },
  { id: 'eth',      name: 'ETH Zurich',                    short: 'ETH Zurich', country: 'CH', the25: 11, the26: 11, the27: 12, qs27: 8,  us: 33 },
  { id: 'tsinghua', name: 'Tsinghua University',           short: 'Tsinghua',   country: 'CN', the25: 12, the26: 12, the27: 11, qs27: 14, us: 6 },
  { id: 'peking',   name: 'Peking University',             short: 'Peking',     country: 'CN', the25: 13, the26: 13, the27: 13, qs27: 13, us: 19 },
  { id: 'chicago',  name: 'University of Chicago',         short: 'Chicago',    country: 'US', the25: 14, the26: 15, the27: 16, qs27: 24, us: 25 },
  { id: 'upenn',    name: 'University of Pennsylvania',    short: 'UPenn',      country: 'US', the25: 14, the26: 14, the27: 14, qs27: 15, us: 17 },
  { id: 'jhu',      name: 'Johns Hopkins University',      short: 'Johns Hopkins', country: 'US', the25: 16, the26: 16, the27: 17, qs27: 20, us: 17 },
  { id: 'nus',      name: 'National University of Singapore', short: 'NUS',     country: 'SG', the25: 17, the26: 17, the27: 15, qs27: 10, us: 16 },
  { id: 'cornell',  name: 'Cornell University',            short: 'Cornell',    country: 'US', the25: 20, the26: 18, the27: 21, qs27: 16, us: 13 },
  { id: 'ucl',      name: 'UCL',                           short: 'UCL',        country: 'GB', the25: 22, the26: 22, the27: 17, qs27: 8,  us: 9 },
  { id: 'tum',      name: 'Technical University of Munich', short: 'TUM',       country: 'DE', the25: 26, the26: 27, the27: 25, qs27: 25, us: 79 },
  { id: 'tokyo',    name: 'University of Tokyo',           short: 'Tokyo',      country: 'JP', the25: 28, the26: 26, the27: 27, qs27: null, us: null },
  { id: 'ntu',      name: 'Nanyang Technological Univ.',   short: 'NTU',        country: 'SG', the25: 30, the26: 31, the27: 28, qs27: 12, us: 27 },
  { id: 'epfl',     name: 'EPFL',                          short: 'EPFL',       country: 'CH', the25: 32, the26: 35, the27: 36, qs27: 22, us: 86 },
  { id: 'hku',      name: 'University of Hong Kong',       short: 'HKU',        country: 'HK', the25: 35, the26: 33, the27: 33, qs27: 11, us: 40 },
  { id: 'melbourne',name: 'University of Melbourne',       short: 'Melbourne',  country: 'AU', the25: 39, the26: 37, the27: 34, qs27: 22, us: 30 },
  { id: 'cuhk',     name: 'Chinese Univ. of Hong Kong',   short: 'CUHK',       country: 'HK', the25: 44, the26: 41, the27: 42, qs27: 18, us: 28 },
  { id: 'sydney',   name: 'University of Sydney',          short: 'Sydney',     country: 'AU', the25: 61, the26: 53, the27: null, qs27: 28, us: 31 },
  { id: 'unsw',     name: 'UNSW Sydney',                  short: 'UNSW',       country: 'AU', the25: 83, the26: null, the27: null, qs27: 19, us: 79 }
];

// Gap chart: prefer THE 2027 once filled; falls back to 2026 while pending.
export const gapUniversities = universities.filter((u) => {
  const the = u.the27 ?? u.the26;
  return the != null && u.qs27 != null && the <= 55 && u.qs27 <= 30;
});

export const sources = [
  { label: 'THE World University Rankings 2027', url: 'https://www.timeshighereducation.com/world-university-rankings/latest/world-ranking' },
  { label: 'THE World University Rankings 2026', url: 'https://www.timeshighereducation.com/world-university-rankings/2026/world-ranking' },
  { label: 'THE World University Rankings 2025', url: 'https://www.timeshighereducation.com/world-university-rankings/2025/world-ranking' },
  { label: 'THE methodology (WUR 3.0)', url: 'https://www.timeshighereducation.com/world-university-rankings/methodology' },
  { label: 'QS World University Rankings 2027', url: 'https://www.topuniversities.com/world-university-rankings' },
  { label: 'QS Rankings methodology', url: 'https://www.qs.com/insights/world-university-rankings-methodology' },
  { label: 'U.S. News Best Global Universities 2026–27', url: 'https://www.usnews.com/education/best-global-universities/rankings' }
];
