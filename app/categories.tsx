import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import CategoryItem from '@/components/CategoryItem';

type TabType = 'expense' | 'income';

export default function CategoriesScreen() {
  const {
    incomeCategories,
    expenseCategories,
    deleteIncomeCategory,
    deleteExpenseCategory,
    getCategoryUsageCount
  } = useApp();

  const [currentTab, setCurrentTab] = useState<TabType>('expense');

  const categories = currentTab === 'expense' ? expenseCategories : incomeCategories;

  const handleDelete = async (categoryId: string, categoryName: string) => {
    const count = getCategoryUsageCount(categoryName, currentTab);

    if (count > 0) {
      Alert.alert(
        'Cannot Delete Category',
        `This category is used by ${count} transaction${count > 1 ? 's' : ''}. Please reassign or delete those transactions first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = currentTab === 'expense'
              ? await deleteExpenseCategory(categoryId)
              : await deleteIncomeCategory(categoryId);

            if (!result.success) {
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleAddCategory = () => {
    router.push({
      pathname: '/add-category',
      params: { type: currentTab },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'expense' && styles.tabActive]}
          onPress={() => setCurrentTab('expense')}
        >
          <Text style={[styles.tabText, currentTab === 'expense' && styles.tabTextActive]}>
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'income' && styles.tabActive]}
          onPress={() => setCurrentTab('income')}
        >
          <Text style={[styles.tabText, currentTab === 'income' && styles.tabTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView style={styles.content}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No categories yet</Text>
          </View>
        ) : (
          categories.map((category) => {
            const count = getCategoryUsageCount(category.name, currentTab);
            return (
              <CategoryItem
                key={category.id}
                category={category}
                usageCount={count}
                onDelete={() => handleDelete(category.id, category.name)}
                canDelete={count === 0}
              />
            );
          })
        )}
      </ScrollView>

      {/* Add Category Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
