import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp, Transaction, Attachment } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import ReceiptPicker from '@/components/ReceiptPicker';
import { deleteTransactionReceipts } from '@/utils/fileStorage';

interface TransactionFormProps {
  type: 'income' | 'expense';
  mode: 'add' | 'edit';
}

export default function TransactionForm({ type, mode }: TransactionFormProps) {
  const { addIncome, updateIncome, addExpense, updateExpense, incomeCategories, expenseCategories } = useApp();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const descriptionInputRef = useRef<TextInput>(null);
  const originalAttachmentsRef = useRef<Attachment[]>([]);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState(
    categories[0]?.name || ''
  );
  const [transactionId, setTransactionId] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
          if (data.attachments) {
            setAttachments(data.attachments);
            // Store original attachments for cleanup comparison
            originalAttachmentsRef.current = data.attachments;
          }
        } catch (error) {
          console.error('Error parsing transaction data:', error);
        }
      }
    }
    // Only run once when component mounts or when the specific param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.income, params.expense, isEdit, isIncome]);

  // Auto-focus on Description field when in add mode
  useEffect(() => {
    if (!isEdit) {
      const timer = setTimeout(() => {
        descriptionInputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isEdit]);

  const handleSave = async () => {
    // Validation
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // For expenses, require at least one attachment
    if (!isIncome && attachments.length === 0) {
      Alert.alert('Receipt Required', 'Please attach at least one receipt or invoice for this expense.');
      return;
    }

    // If editing an expense, clean up removed attachments
    if (isEdit && !isIncome && originalAttachmentsRef.current.length > 0) {
      const removedAttachments = originalAttachmentsRef.current.filter(
        original => !attachments.some(current => current.id === original.id)
      );

      if (removedAttachments.length > 0) {
        await deleteTransactionReceipts(removedAttachments);
      }
    }

    const transactionData = {
      description: description.trim(),
      amount: parseFloat(amount),
      date: date.toISOString().split('T')[0],
      category,
      attachments: !isIncome ? attachments : undefined, // Only include attachments for expenses
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

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{config.title}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: config.saveColor }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
      >
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
          <TextInput
            ref={descriptionInputRef}
            style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder={config.placeholder}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={theme.placeholder}
            returnKeyType="next"
          />
        </View>

        {/* Amount Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Amount</Text>
          <View style={[styles.amountContainer, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
            <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Date</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.dateText, { color: theme.text }]}>{date.toLocaleDateString()}</Text>
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
          <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: theme.input, borderColor: theme.inputBorder },
                  category === cat.name && [
                    styles.categoryChipActive,
                    { backgroundColor: config.saveColor, borderColor: config.saveColor },
                  ],
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: theme.textSecondary },
                    category === cat.name && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Receipt Picker - only for expenses */}
        {!isIncome && (
          <ReceiptPicker
            attachments={attachments}
            onChange={setAttachments}
            required={true}
          />
        )}
      </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    paddingLeft: 4,
    fontSize: 20,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
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
    borderWidth: 1,
  },
  categoryChipActive: {
    // Dynamic background and border color applied inline
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
});
