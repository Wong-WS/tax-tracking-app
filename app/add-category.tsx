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
import { useTheme } from '@/context/ThemeContext';
import { COLOR_PALETTE } from '@/constants/categories';

export default function AddCategoryScreen() {
  const params = useLocalSearchParams();
  const type = (params.type as 'income' | 'expense') || 'expense';

  const { addIncomeCategory, addExpenseCategory } = useApp();
  const { theme } = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add Category</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: theme.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Category Name */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Category Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder={type === 'income' ? 'e.g., Royalties' : 'e.g., Rent'}
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.placeholder}
            maxLength={20}
          />
          <Text style={[styles.helperText, { color: theme.textTertiary }]}>{name.length}/20 characters</Text>
        </View>

        {/* Type Info */}
        <View style={[styles.infoBox, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons
            name={type === 'income' ? 'trending-up' : 'receipt-outline'}
            size={20}
            color={type === 'income' ? theme.primary : theme.error}
          />
          <Text style={[styles.infoText, { color: theme.primary }]}>
            Adding to {type === 'income' ? 'Income' : 'Expense'} categories
          </Text>
        </View>

        {/* Color Picker */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Choose Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && [styles.colorButtonSelected, { borderColor: theme.text }],
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
          <Text style={[styles.label, { color: theme.textSecondary }]}>Preview</Text>
          <View style={[styles.previewContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.previewDot, { backgroundColor: selectedColor }]} />
            <Text style={[styles.previewText, { color: theme.text }]}>{name || 'Category Name'}</Text>
          </View>
        </View>
      </ScrollView>
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
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
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
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
  },
});
