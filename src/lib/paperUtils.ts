// Subject abbreviation mapping for formatted titles
const SUBJECT_ABBREVIATIONS: Record<string, string> = {
  nas: 'NAS',
  asd: 'ASD',
  dsdv: 'DSDV',
  coa: 'COA',
  dsa: 'DSA',
  ai: 'AI',
  mathematics: 'MATH',
  mathematics_1: 'MATH-1',
  mathematics_2: 'MATH-2',
  mathematics_3: 'MATH-3',
  mathematics_4: 'MATH-4',
  physics: 'PHY',
  chemistry: 'CHEM',
  biology: 'BIO',
  english: 'ENG',
  hindi: 'HINDI',
  history: 'HIST',
  geography: 'GEO',
  economics: 'ECO',
  accountancy: 'ACC',
  business_studies: 'BS',
  computer_science: 'CS',
  political_science: 'POL',
  sociology: 'SOC',
  psychology: 'PSY',
  software_engineering: 'SE',
  mechanics: 'MECH',
  python: 'PY',
  c: 'C',
  java: 'JAVA',
  electrical_engineering: 'EE',
  electronics_engineering: 'ECE',
  computer_engineering: 'CE',
  other: 'OTHER',
};

// Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Format a paper title in the format: "DSDV 3rd Sem 2025"
 * @param subject - The subject value (e.g., 'dsdv', 'nas')
 * @param semester - The semester number (optional)
 * @param year - The year
 * @returns Formatted title string
 */
export function formatPaperTitle(
  subject: string,
  semester: number | null | undefined,
  year: number
): string {
  const subjectAbbr = SUBJECT_ABBREVIATIONS[subject] || subject.toUpperCase();
  
  if (semester) {
    return `${subjectAbbr} ${semester}${getOrdinalSuffix(semester)} Sem ${year}`;
  }
  
  return `${subjectAbbr} ${year}`;
}

/**
 * Get subject abbreviation
 */
export function getSubjectAbbreviation(subject: string): string {
  return SUBJECT_ABBREVIATIONS[subject] || subject.toUpperCase();
}
