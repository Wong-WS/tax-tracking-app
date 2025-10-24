import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp, Transaction } from '@/context/AppContext';

interface TransactionFormProps {
  type: 'income' | 'expense';
  mode: 'add' | 'edit';
}

const INCOME_CATEGORIES = [
  'Freelance',
  'Consulting',
  'Salary',
  'Investment',
  'Business',
  'Other',
];

const EXPENSE_CATEGORIES = [
  'Office',
  'Software',
  'Meals',
  'Utilities',
  'Travel',
  'Marketing',
  'Education',
  'Other',
];

export default function TransactionForm({ type, mode }: TransactionFormProps) {
  const { addIncome, updateIncome, addExpense, updateExpense } = useApp();
  const params = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState(
    type === 'income' ? 'Freelance' : 'Office'
  );
  const [transactionId, setTransactionId] = useState('');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isIncome = type === 'income';
  const isEdit = mode === 'edit';

  // Configuration based on type
  const config = {
    title: isEdit
      ? isIncome
        ? 'Edit Income'
        : 'Edit Expense'
      : isIncome
      ? 'Add Income'
      : 'Add Expense',
    saveColor: isIncome ? '#2563eb' : '#dc2626',
    placeholder: isIncome
      ? 'e.g., Freelance Project'
      : 'e.g., Office Supplies',
  };

  // Load existing transaction data for edit mode
  useEffect(() => {
    if (isEdit) {
      const paramKey = isIncome ? 'income' : 'expense';
      const transactionData = params[paramKey];

      if (transactionData && typeof transactionData === 'string') {
        try {
          const data = JSON.parse(transactionData) as Transaction;
          setTransactionId(data.id);
          setDescription(data.description);
          setAmount(data.amount.toString());
          setDate(new Date(data.date));
          setCategory(data.category);
        } catch (error) {
          console.error('Error parsing transaction data:', error);
        }
      }
    }
    // Only run once when component mounts or when the specific param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.income, params.expense, isEdit, isIncome]);

  const handleSave = () => {
    // Validation
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const transactionData = {
      description: description.trim(),
      amount: parseFloat(amount),
      date: date.toISOString().split('T')[0],
      category,
    };

    // Call appropriate Context method
    if (isEdit) {
      if (isIncome) {
        updateIncome(transactionId, transactionData);
      } else {
        updateExpense(transactionId, transactionData);
      }
    } else {
      if (isIncome) {
        addIncome(transactionData);
      } else {
        addExpense(transactionData);
      }
    }

    // Navigate back
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: config.saveColor }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder={config.placeholder}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Amount Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Category Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && [
                    styles.categoryChipActive,
                    { backgroundColor: config.saveColor, borderColor: config.saveColor },
                  ],
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    paddingLeft: 4,
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    // Dynamic background and border color applied inline
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
});
