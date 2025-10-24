import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/context/AppContext';

interface CategoryItemProps {
  category: Category;
  usageCount: number;
  onDelete: () => void;
  canDelete: boolean;
}

export default function CategoryItem({ category, usageCount, onDelete, canDelete }: CategoryItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.colorDot, { backgroundColor: category.color }]} />
        <View style={styles.info}>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.count}>
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
          color={canDelete ? '#dc2626' : '#cbd5e1'}
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
    backgroundColor: '#ffffff',
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
    color: '#1e293b',
    marginBottom: 2,
  },
  count: {
    fontSize: 13,
    color: '#64748b',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
});
