import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

export default function SummaryScreen() {
  const { income, expenses, expenseCategories } = useApp();
  const { theme } = useTheme();

  // Build dynamic color map from categories
  const categoryColors = useMemo(() => {
    const colors: { [key: string]: string } = {};
    expenseCategories.forEach(cat => {
      colors[cat.name] = cat.color;
    });
    return colors;
  }, [expenseCategories]);

  // Calculate totals from real data
  const totalIncome = useMemo(
    () => income.reduce((sum, item) => sum + item.amount, 0),
    [income]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  );

  const netIncome = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  // Group expenses by category and sort
  const categoryBreakdown = useMemo(() => {
    const expensesByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    // Convert to array and sort by amount (highest first)
    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Summary</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textTertiary }]}>Your financial overview</Text>
      </View>

      {/* Net Income Card */}
      <View style={[styles.netIncomeCard, { backgroundColor: theme.primary }]}>
        <Text style={[styles.netIncomeLabel, { color: theme.primaryLight }]}>Net Income</Text>
        <Text style={styles.netIncomeAmount}>${netIncome.toLocaleString()}</Text>
        <Text style={[styles.netIncomeSubtext, { color: theme.primaryLight }]}>
          After deductible expenses
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <View style={[styles.summaryCard, styles.incomeCard, { backgroundColor: theme.card, borderLeftColor: theme.success }]}>
          <View style={styles.cardIcon}>
            <Ionicons name="trending-up" size={24} color={theme.success} />
          </View>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Total Income</Text>
          <Text style={[styles.cardAmount, { color: theme.success }]}>
            ${totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard, { backgroundColor: theme.card, borderLeftColor: theme.error }]}>
          <View style={styles.cardIcon}>
            <Ionicons name="receipt-outline" size={24} color={theme.error} />
          </View>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Total Expenses</Text>
          <Text style={[styles.cardAmount, { color: theme.error }]}>
            ${totalExpenses.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Breakdown by Category */}
      <View style={[styles.categorySection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Expense Breakdown</Text>

        {categoryBreakdown.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No expenses yet</Text>
          </View>
        ) : (
          categoryBreakdown.map((item, index) => (
            <View
              key={item.category}
              style={[
                styles.categoryItem,
                { borderBottomColor: theme.borderLight },
                index === categoryBreakdown.length - 1 && styles.categoryItemLast
              ]}
            >
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryColors[item.category] || theme.textTertiary }
                  ]}
                />
                <Text style={[styles.categoryName, { color: theme.textSecondary }]}>{item.category}</Text>
              </View>
              <Text style={[styles.categoryAmount, { color: theme.text }]}>${item.amount.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  netIncomeCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  netIncomeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  netIncomeAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  netIncomeSubtext: {
    fontSize: 13,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
  },
  expenseCard: {
    borderLeftWidth: 4,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  categorySection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 15,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryItemLast: {
    borderBottomWidth: 0,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
