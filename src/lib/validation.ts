import { z } from 'zod';

// Constants for validation limits
const MAX_SEARCH_LENGTH = 100;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_BIO_LENGTH = 500;
const MAX_NAME_LENGTH = 100;
const MAX_INSTITUTE_LENGTH = 200;

const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear() + 1;
const MIN_AGE = 10;
const MAX_AGE = 100;
const MIN_SEMESTER = 1;
const MAX_SEMESTER = 8;

// Search and filter validation
export const searchQuerySchema = z.string().max(MAX_SEARCH_LENGTH, 'Search query too long').default('');

export const browseFiltersSchema = z.object({
  board: z.string().max(50).default(''),
  classLevel: z.string().max(50).default(''),
  subject: z.string().max(100).default(''),
  year: z.string().max(10).default(''),
  examType: z.string().max(50).default(''),
  semester: z.string().max(10).default(''),
  internalNumber: z.string().max(10).default(''),
  instituteName: z.string().max(MAX_INSTITUTE_LENGTH).default(''),
});

// Upload form validation
export const uploadFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`)
    .transform(val => val.trim()),
  description: z.string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .transform(val => val?.trim() || ''),
  classLevel: z.string().min(1, 'Class is required'),
  board: z.string().min(1, 'Board is required'),
  subject: z.string().min(1, 'Subject is required'),
  year: z.string().min(1, 'Year is required'),
  examType: z.string().min(1, 'Exam type is required'),
  semester: z.string().optional(),
  internalNumber: z.string().optional(),
  instituteName: z.string()
    .max(MAX_INSTITUTE_LENGTH, `Institute name must be less than ${MAX_INSTITUTE_LENGTH} characters`)
    .optional()
    .transform(val => val?.trim() || ''),
});

// Profile validation
export const profileSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters`)
    .transform(val => val.trim()),
  bio: z.string()
    .max(MAX_BIO_LENGTH, `Bio must be less than ${MAX_BIO_LENGTH} characters`)
    .optional()
    .transform(val => val?.trim() || ''),
  class_level: z.string().min(1, 'Class/Level is required'),
  board: z.string().min(1, 'Board is required'),
  year: z.number().int().min(MIN_YEAR).max(MAX_YEAR).nullable().optional(),
  course: z.string().max(100).optional(),
  semester: z.number().int().min(MIN_SEMESTER).max(MAX_SEMESTER).nullable().optional(),
  age: z.number().int().min(MIN_AGE).max(MAX_AGE).nullable().optional(),
});

// Sanitize search input - removes special regex characters
export function sanitizeSearchInput(input: string): string {
  // Limit length first
  const trimmed = input.slice(0, MAX_SEARCH_LENGTH).trim();
  // Escape special characters that could cause issues in ILIKE queries
  return trimmed.replace(/[%_\\]/g, '\\$&');
}

// Validate and sanitize year input
export function validateYear(yearStr: string): number | null {
  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return null;
  }
  return year;
}

// Validate numeric input within range
export function validateNumericRange(
  value: string | number | null | undefined,
  min: number,
  max: number
): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

export type BrowseFilters = z.infer<typeof browseFiltersSchema>;
export type UploadFormData = z.infer<typeof uploadFormSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
