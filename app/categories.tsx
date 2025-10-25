import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
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
  const { theme } = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Categories</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.input },
            currentTab === 'expense' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setCurrentTab('expense')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.textSecondary },
            currentTab === 'expense' && styles.tabTextActive
          ]}>
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.input },
            currentTab === 'income' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setCurrentTab('income')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.textSecondary },
            currentTab === 'income' && styles.tabTextActive
          ]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView style={styles.content}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={64} color={theme.borderLight} />
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No categories yet</Text>
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
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleAddCategory}>
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
