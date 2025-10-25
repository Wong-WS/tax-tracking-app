import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

interface CategoryItemProps {
  category: Category;
  usageCount: number;
  onDelete: () => void;
  canDelete: boolean;
}

export default function CategoryItem({ category, usageCount, onDelete, canDelete }: CategoryItemProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.left}>
        <View style={[styles.colorDot, { backgroundColor: category.color }]} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{category.name}</Text>
          <Text style={[styles.count, { color: theme.textSecondary }]}>
            {usageCount === 0
              ? 'No transactions'
              : `${usageCount} transaction${usageCount > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onDelete}
        style={[styles.deleteButton, !canDelete && styles.deleteButtonDisabled]}
        disabled={!canDelete}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color={canDelete ? theme.error : theme.borderLight}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  count: {
    fontSize: 13,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
});
