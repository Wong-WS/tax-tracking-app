import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '@/context/AppContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function RootNavigator() {
  const { isLoading } = useApp();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-income"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-income"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-expense"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-expense"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-category"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AppProvider>
            <RootNavigator />
          </AppProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
