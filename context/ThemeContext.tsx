import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  border: string;
  borderLight: string;

  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Status colors
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  info: string;

  // Component specific
  card: string;
  cardBorder: string;
  input: string;
  inputBorder: string;
  placeholder: string;

  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;

  // Special
  shadow: string;
  overlay: string;
}

const lightTheme: Theme = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',

  text: '#1e293b',
  textSecondary: '#475569',
  textTertiary: '#64748b',

  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  primary: '#2563eb',
  primaryLight: '#bfdbfe',
  primaryDark: '#1e40af',

  success: '#16a34a',
  successLight: '#dcfce7',
  error: '#dc2626',
  errorLight: '#fee2e2',
  warning: '#f59e0b',
  info: '#0ea5e9',

  card: '#ffffff',
  cardBorder: '#e2e8f0',
  input: '#ffffff',
  inputBorder: '#e2e8f0',
  placeholder: '#94a3b8',

  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  tabActive: '#2563eb',
  tabInactive: '#64748b',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkTheme: Theme = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#334155',

  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',

  border: '#334155',
  borderLight: '#475569',

  primary: '#3b82f6',
  primaryLight: '#1e40af',
  primaryDark: '#60a5fa',

  success: '#22c55e',
  successLight: '#166534',
  error: '#ef4444',
  errorLight: '#7f1d1d',
  warning: '#f59e0b',
  info: '#0ea5e9',

  card: '#1e293b',
  cardBorder: '#334155',
  input: '#1e293b',
  inputBorder: '#334155',
  placeholder: '#64748b',

  tabBar: '#1e293b',
  tabBarBorder: '#334155',
  tabActive: '#3b82f6',
  tabInactive: '#94a3b8',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@tax_app_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine actual theme based on mode
  const isDark = themeMode === 'auto'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  if (isLoading) {
    return null; // or a loading screen
  }

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
