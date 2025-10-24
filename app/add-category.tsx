import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { COLOR_PALETTE } from '@/constants/categories';

export default function AddCategoryScreen() {
  const params = useLocalSearchParams();
  const type = (params.type as 'income' | 'expense') || 'expense';

  const { addIncomeCategory, addExpenseCategory } = useApp();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (name.trim().length > 20) {
      Alert.alert('Error', 'Category name must be 20 characters or less');
      return;
    }

    const result = type === 'income'
      ? await addIncomeCategory(name, selectedColor)
      : await addExpenseCategory(name, selectedColor);

    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to add category');
      return;
    }

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Category</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Category Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder={type === 'income' ? 'e.g., Royalties' : 'e.g., Rent'}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#94a3b8"
            maxLength={20}
          />
          <Text style={styles.helperText}>{name.length}/20 characters</Text>
        </View>

        {/* Type Info */}
        <View style={styles.infoBox}>
          <Ionicons
            name={type === 'income' ? 'trending-up' : 'receipt-outline'}
            size={20}
            color={type === 'income' ? '#2563eb' : '#dc2626'}
          />
          <Text style={styles.infoText}>
            Adding to {type === 'income' ? 'Income' : 'Expense'} categories
          </Text>
        </View>

        {/* Color Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Choose Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.previewContainer}>
            <View style={[styles.previewDot, { backgroundColor: selectedColor }]} />
            <Text style={styles.previewText}>{name || 'Category Name'}</Text>
          </View>
        </View>
      </ScrollView>
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
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'right',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
});
