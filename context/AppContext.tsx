import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface AppContextType {
  income: Transaction[];
  expenses: Transaction[];
  isLoading: boolean;
  addIncome: (income: Omit<Transaction, 'id'>) => void;
  updateIncome: (id: string, updates: Omit<Transaction, 'id'>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Omit<Transaction, 'id'>) => void;
  updateExpense: (id: string, updates: Omit<Transaction, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  INCOME: '@tax_app_income',
  EXPENSES: '@tax_app_expenses',
};

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [income, setIncome] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [incomeData, expensesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.INCOME),
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
      ]);

      if (incomeData) {
        setIncome(JSON.parse(incomeData));
      }
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Helper function to generate unique IDs
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

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

  const deleteIncome = (id: string) => {
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

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const value: AppContextType = {
    income,
    expenses,
    isLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
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
