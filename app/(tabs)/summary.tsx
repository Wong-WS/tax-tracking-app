import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export default function SummaryScreen() {
  const { income, expenses, expenseCategories } = useApp();

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Summary</Text>
        <Text style={styles.headerSubtitle}>Your financial overview</Text>
      </View>

      {/* Net Income Card */}
      <View style={styles.netIncomeCard}>
        <Text style={styles.netIncomeLabel}>Net Income</Text>
        <Text style={styles.netIncomeAmount}>${netIncome.toLocaleString()}</Text>
        <Text style={styles.netIncomeSubtext}>
          After deductible expenses
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <View style={styles.cardIcon}>
            <Ionicons name="trending-up" size={24} color="#16a34a" />
          </View>
          <Text style={styles.cardLabel}>Total Income</Text>
          <Text style={[styles.cardAmount, styles.incomeAmount]}>
            ${totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <View style={styles.cardIcon}>
            <Ionicons name="receipt-outline" size={24} color="#dc2626" />
          </View>
          <Text style={styles.cardLabel}>Total Expenses</Text>
          <Text style={[styles.cardAmount, styles.expenseAmount]}>
            ${totalExpenses.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Breakdown by Category */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>

        {categoryBreakdown.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        ) : (
          categoryBreakdown.map((item, index) => (
            <View
              key={item.category}
              style={[
                styles.categoryItem,
                index === categoryBreakdown.length - 1 && styles.categoryItemLast
              ]}
            >
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryColors[item.category] || '#6b7280' }
                  ]}
                />
                <Text style={styles.categoryName}>{item.category}</Text>
              </View>
              <Text style={styles.categoryAmount}>${item.amount.toLocaleString()}</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  netIncomeCard: {
    backgroundColor: '#2563eb',
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
    color: '#bfdbfe',
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
    color: '#bfdbfe',
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    borderLeftColor: '#16a34a',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#16a34a',
  },
  expenseAmount: {
    color: '#dc2626',
  },
  categorySection: {
    backgroundColor: '#ffffff',
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
    color: '#1e293b',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#475569',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
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
    color: '#94a3b8',
  },
});
