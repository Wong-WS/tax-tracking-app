import { Category } from '@/types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate category name
 */
export function validateCategoryName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Category name is required' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Category name must be 20 characters or less' };
  }

  return { valid: true };
}

/**
 * Check if category name already exists
 */
export function checkDuplicateCategory(
  name: string,
  existingCategories: Category[]
): boolean {
  const trimmedName = name.trim().toLowerCase();
  return existingCategories.some(
    cat => cat.name.toLowerCase() === trimmedName
  );
}
