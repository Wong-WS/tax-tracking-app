import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '@/constants/categories';
import { deleteTransactionReceipts } from '@/utils/fileStorage';
import { validateTransactions } from '@/utils/validation/transactionValidator';
import { generateId } from '@/hooks/useId';

// Types
export interface Attachment {
  id: string;
  uri: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  size?: number;
  mimeType?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  attachments?: Attachment[]; // Optional for backward compatibility with existing data
}

export type { Category };

interface AppContextType {
  income: Transaction[];
  expenses: Transaction[];
  isLoading: boolean;
  incomeCategories: Category[];
  expenseCategories: Category[];
  addIncome: (income: Omit<Transaction, 'id'>) => void;
  updateIncome: (id: string, updates: Omit<Transaction, 'id'>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Omit<Transaction, 'id'>) => void;
  updateExpense: (id: string, updates: Omit<Transaction, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addIncomeCategory: (name: string, color: string) => Promise<{success: boolean, error?: string}>;
  deleteIncomeCategory: (id: string) => Promise<{success: boolean, count?: number}>;
  addExpenseCategory: (name: string, color: string) => Promise<{success: boolean, error?: string}>;
  deleteExpenseCategory: (id: string) => Promise<{success: boolean, count?: number}>;
  getCategoryUsageCount: (categoryName: string, type: 'income' | 'expense') => number;
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  INCOME: '@tax_app_income',
  EXPENSES: '@tax_app_expenses',
  INCOME_CATEGORIES: '@tax_app_income_categories',
  EXPENSE_CATEGORIES: '@tax_app_expense_categories',
};

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [income, setIncome] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [incomeData, expensesData, incomeCategoriesData, expenseCategoriesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.INCOME),
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.getItem(STORAGE_KEYS.INCOME_CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES),
      ]);

      // Validate and load income data
      if (incomeData) {
        try {
          const parsed = JSON.parse(incomeData);
          const validated = validateTransactions(parsed);
          setIncome(validated);

          // Log if any transactions were filtered out
          if (validated.length !== parsed.length) {
            console.warn(`Filtered out ${parsed.length - validated.length} invalid income transactions`);
          }
        } catch (error) {
          console.error('Error parsing income data:', error);
          setIncome([]);
        }
      }

      // Validate and load expense data
      if (expensesData) {
        try {
          const parsed = JSON.parse(expensesData);
          const validated = validateTransactions(parsed);
          setExpenses(validated);

          // Log if any transactions were filtered out
          if (validated.length !== parsed.length) {
            console.warn(`Filtered out ${parsed.length - validated.length} invalid expense transactions`);
          }
        } catch (error) {
          console.error('Error parsing expense data:', error);
          setExpenses([]);
        }
      }

      // Load or initialize categories
      if (incomeCategoriesData && expenseCategoriesData) {
        setIncomeCategories(JSON.parse(incomeCategoriesData));
        setExpenseCategories(JSON.parse(expenseCategoriesData));
      } else {
        // First time - use defaults
        setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
        setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
        // Save defaults
        await AsyncStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(DEFAULT_INCOME_CATEGORIES));
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to defaults on error
      setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
      setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  // Save income to AsyncStorage whenever it changes
  useEffect(() => {
    const saveIncome = async () => {
      if (!isLoading) {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(income));
        } catch (error) {
          console.error('Error saving income data:', error);
          // You could show a toast notification here
        }
      }
    };
    saveIncome();
  }, [income, isLoading]);

  // Save expenses to AsyncStorage whenever it changes
  useEffect(() => {
    const saveExpenses = async () => {
      if (!isLoading) {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        } catch (error) {
          console.error('Error saving expenses data:', error);
          // You could show a toast notification here
        }
      }
    };
    saveExpenses();
  }, [expenses, isLoading]);

  // Income CRUD operations
  const addIncome = (newIncome: Omit<Transaction, 'id'>) => {
    const incomeWithId: Transaction = {
      ...newIncome,
      id: generateId(),
    };
    setIncome((prev) => [incomeWithId, ...prev]);
  };

  const updateIncome = (id: string, updates: Omit<Transaction, 'id'>) => {
    setIncome((prev) =>
      prev.map((item) =>
        item.id === id ? { ...updates, id } : item
      )
    );
  };

  const deleteIncome = async (id: string) => {
    // Find the income to delete its attachments
    const incomeItem = income.find(i => i.id === id);
    if (incomeItem?.attachments) {
      await deleteTransactionReceipts(incomeItem.attachments);
    }
    setIncome((prev) => prev.filter((item) => item.id !== id));
  };

  // Expense CRUD operations
  const addExpense = (newExpense: Omit<Transaction, 'id'>) => {
    const expenseWithId: Transaction = {
      ...newExpense,
      id: generateId(),
    };
    setExpenses((prev) => [expenseWithId, ...prev]);
  };

  const updateExpense = (id: string, updates: Omit<Transaction, 'id'>) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id ? { ...updates, id } : item
      )
    );
  };

  const deleteExpense = async (id: string) => {
    // Find the expense to delete its receipts
    const expense = expenses.find(e => e.id === id);
    if (expense?.attachments) {
      await deleteTransactionReceipts(expense.attachments);
    }
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Category management
  const getCategoryUsageCount = (categoryName: string, type: 'income' | 'expense') => {
    const transactions = type === 'income' ? income : expenses;
    return transactions.filter(t => t.category === categoryName).length;
  };

  const addIncomeCategory = async (name: string, color: string): Promise<{success: boolean, error?: string}> => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { success: false, error: 'Category name is required' };
    }

    if (trimmedName.length > 20) {
      return { success: false, error: 'Category name must be 20 characters or less' };
    }

    // Check for duplicates
    if (incomeCategories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { success: false, error: 'Category name already exists' };
    }

    const newCategory: Category = {
      id: generateId(),
      name: trimmedName,
      color,
    };

    const updated = [...incomeCategories, newCategory];
    setIncomeCategories(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving income categories:', error);
    }

    return { success: true };
  };

  const deleteIncomeCategory = async (id: string): Promise<{success: boolean, count?: number}> => {
    const category = incomeCategories.find(c => c.id === id);
    if (!category) {
      return { success: false };
    }

    const count = getCategoryUsageCount(category.name, 'income');

    if (count > 0) {
      return { success: false, count };
    }

    const updated = incomeCategories.filter(c => c.id !== id);
    setIncomeCategories(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving income categories:', error);
    }

    return { success: true };
  };

  const addExpenseCategory = async (name: string, color: string): Promise<{success: boolean, error?: string}> => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { success: false, error: 'Category name is required' };
    }

    if (trimmedName.length > 20) {
      return { success: false, error: 'Category name must be 20 characters or less' };
    }

    // Check for duplicates
    if (expenseCategories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { success: false, error: 'Category name already exists' };
    }

    const newCategory: Category = {
      id: generateId(),
      name: trimmedName,
      color,
    };

    const updated = [...expenseCategories, newCategory];
    setExpenseCategories(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving expense categories:', error);
    }

    return { success: true };
  };

  const deleteExpenseCategory = async (id: string): Promise<{success: boolean, count?: number}> => {
    const category = expenseCategories.find(c => c.id === id);
    if (!category) {
      return { success: false };
    }

    const count = getCategoryUsageCount(category.name, 'expense');

    if (count > 0) {
      return { success: false, count };
    }

    const updated = expenseCategories.filter(c => c.id !== id);
    setExpenseCategories(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving expense categories:', error);
    }

    return { success: true };
  };

  const value: AppContextType = {
    income,
    expenses,
    isLoading,
    incomeCategories,
    expenseCategories,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncomeCategory,
    deleteIncomeCategory,
    addExpenseCategory,
    deleteExpenseCategory,
    getCategoryUsageCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
