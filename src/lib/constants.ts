export const BOARDS = [
  // Indian Boards
  { value: 'cbse', label: 'CBSE', category: 'Indian' },
  { value: 'icse', label: 'ICSE', category: 'Indian' },
  { value: 'isc', label: 'ISC', category: 'Indian' },
  { value: 'state', label: 'State Board', category: 'Indian' },
  { value: 'nios', label: 'NIOS', category: 'Indian' },
  // International Boards
  { value: 'ib', label: 'IB (International Baccalaureate)', category: 'International' },
  { value: 'cambridge', label: 'Cambridge (IGCSE/A-Level)', category: 'International' },
  { value: 'edexcel', label: 'Edexcel', category: 'International' },
  { value: 'ap', label: 'AP (Advanced Placement)', category: 'International' },
] as const;

export const CLASS_LEVELS = [
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
] as const;

export const SUBJECTS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'economics', label: 'Economics' },
  { value: 'accountancy', label: 'Accountancy' },
  { value: 'business_studies', label: 'Business Studies' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'political_science', label: 'Political Science' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'other', label: 'Other' },
] as const;

export const EXAM_TYPES = [
  { value: 'board_exam', label: 'Board Exam' },
  { value: 'final', label: 'Final Exam' },
  { value: 'midterm', label: 'Midterm' },
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'sample_paper', label: 'Sample Paper' },
  { value: 'practice', label: 'Practice Paper' },
  { value: 'entrance', label: 'Entrance Exam' },
  { value: 'competitive', label: 'Competitive Exam' },
] as const;

export const YEARS = Array.from({ length: 15 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});