export interface Category {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: '1', name: 'Freelance', color: '#3b82f6' },
  { id: '2', name: 'Consulting', color: '#8b5cf6' },
  { id: '3', name: 'Salary', color: '#10b981' },
  { id: '4', name: 'Investment', color: '#f59e0b' },
  { id: '5', name: 'Business', color: '#ef4444' },
  { id: '6', name: 'Other', color: '#6b7280' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Office', color: '#3b82f6' },
  { id: '2', name: 'Software', color: '#8b5cf6' },
  { id: '3', name: 'Meals', color: '#ec4899' },
  { id: '4', name: 'Utilities', color: '#10b981' },
  { id: '5', name: 'Travel', color: '#f59e0b' },
  { id: '6', name: 'Marketing', color: '#ef4444' },
  { id: '7', name: 'Education', color: '#06b6d4' },
  { id: '8', name: 'Other', color: '#6b7280' },
];

export const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#6b7280', // Gray
  '#f97316', // Dark Orange
  '#14b8a6', // Teal
  '#a855f7', // Violet
  '#84cc16', // Lime
  '#f43f5e', // Rose
  '#0ea5e9', // Sky
  '#d946ef', // Fuchsia
  '#22c55e', // Emerald
];
