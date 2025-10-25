import { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import SwipeableCard from '@/components/SwipeableCard';

export default function IncomeScreen() {
  const { income, deleteIncome } = useApp();
  const { theme } = useTheme();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const renderIncomeItem = ({ item }: { item: typeof income[0] }) => (
    <SwipeableCard
      item={item}
      type="income"
      onDelete={deleteIncome}
      swipeableRef={(ref) => {
        if (ref) {
          swipeableRefs.current.set(item.id, ref);
        }
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.totalContainer, { backgroundColor: theme.success }]}>
        <Text style={[styles.totalLabel, { color: theme.primaryLight }]}>Total Income</Text>
        <Text style={[styles.totalAmount, { color: '#ffffff' }]}>
          ${income.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
        </Text>
      </View>

      <FlatList
        data={income}
        renderItem={renderIncomeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color={theme.borderLight} />
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No income entries yet</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.success }]}
        onPress={() => router.push('/add-income')}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  totalContainer: {
    padding: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
