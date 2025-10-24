import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SummaryScreen() {
  // Mock data - will be replaced with real data later
  const totalIncome = 5250;
  const totalExpenses = 340.48;
  const netIncome = totalIncome - totalExpenses;
  const estimatedTax = netIncome * 0.25; // Simple 25% estimate

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tax Year 2025</Text>
        <Text style={styles.headerSubtitle}>Financial Summary</Text>
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

      {/* Tax Estimate Card */}
      <View style={styles.taxCard}>
        <View style={styles.taxHeader}>
          <Ionicons name="calculator-outline" size={28} color="#f59e0b" />
          <Text style={styles.taxTitle}>Estimated Tax</Text>
        </View>
        <Text style={styles.taxAmount}>${estimatedTax.toLocaleString()}</Text>
        <Text style={styles.taxDisclaimer}>
          Based on 25% tax rate. This is an estimate only.
        </Text>
      </View>

      {/* Breakdown by Category */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>

        <View style={styles.categoryItem}>
          <View style={styles.categoryLeft}>
            <View style={[styles.categoryDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.categoryName}>Office Supplies</Text>
          </View>
          <Text style={styles.categoryAmount}>$125.50</Text>
        </View>

        <View style={styles.categoryItem}>
          <View style={styles.categoryLeft}>
            <View style={[styles.categoryDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.categoryName}>Software</Text>
          </View>
          <Text style={styles.categoryAmount}>$49.99</Text>
        </View>

        <View style={styles.categoryItem}>
          <View style={styles.categoryLeft}>
            <View style={[styles.categoryDot, { backgroundColor: '#ec4899' }]} />
            <Text style={styles.categoryName}>Meals</Text>
          </View>
          <Text style={styles.categoryAmount}>$85.00</Text>
        </View>

        <View style={styles.categoryItem}>
          <View style={styles.categoryLeft}>
            <View style={[styles.categoryDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.categoryName}>Utilities</Text>
          </View>
          <Text style={styles.categoryAmount}>$79.99</Text>
        </View>
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
  taxCard: {
    backgroundColor: '#fffbeb',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 24,
  },
  taxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  taxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  taxAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 8,
  },
  taxDisclaimer: {
    fontSize: 12,
    color: '#92400e',
    fontStyle: 'italic',
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
});
