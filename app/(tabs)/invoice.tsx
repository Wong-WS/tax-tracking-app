import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { saveReceiptFile } from '@/utils/fileStorage';
import { Attachment } from '@/context/AppContext';

export default function InvoiceScreen() {
  const { addIncome } = useApp();
  const { theme, isDark } = useTheme();
  const clientNameInputRef = useRef<TextInput>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-focus on Client Name field when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      clientNameInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const generateInvoiceHTML = () => {
    const invoiceNumber = `INV-${Date.now()}`;
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1e293b;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 32px;
            }
            .invoice-number {
              color: #64748b;
              font-size: 14px;
              margin-top: 8px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 12px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .section-content {
              font-size: 16px;
              color: #1e293b;
              line-height: 1.6;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .amount-section {
              background-color: #f8fafc;
              padding: 24px;
              border-radius: 8px;
              border-left: 4px solid #16a34a;
              margin: 30px 0;
            }
            .amount-label {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .amount-value {
              font-size: 36px;
              font-weight: bold;
              color: #16a34a;
            }
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <div class="invoice-number">${invoiceNumber}</div>
          </div>

          <div class="details-grid">
            <div class="section">
              <div class="section-title">Date Paid</div>
              <div class="section-content">${formattedDate}</div>
            </div>

            <div class="section">
              <div class="section-title">Client Name</div>
              <div class="section-content">${clientName}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Description</div>
            <div class="section-content">${description}</div>
          </div>

          <div class="section">
            <div class="section-title">Payment Reference</div>
            <div class="section-content">${paymentReference}</div>
          </div>

          <div class="amount-section">
            <div class="amount-label">Amount Received</div>
            <div class="amount-value">$${formattedAmount}</div>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} • Invoice #${invoiceNumber}
          </div>
        </body>
      </html>
    `;
  };

  const handleGenerateInvoice = async () => {
    // Validation
    if (!clientName.trim()) {
      Alert.alert('Missing Information', 'Please enter client name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter a description');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (!paymentReference.trim()) {
      Alert.alert('Missing Information', 'Please enter payment reference');
      return;
    }

    try {
      setIsGenerating(true);

      // Generate PDF
      const html = generateInvoiceHTML();
      const { uri } = await Print.printToFileAsync({ html });

      // Ask user what to do with the invoice
      Alert.alert(
        'Invoice Generated',
        'Would you like to save this as income or just export the invoice?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Export Only',
            onPress: async () => {
              await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Share Invoice',
              });
            },
          },
          {
            text: 'Save as Income',
            onPress: async () => {
              try {
                // Save PDF to permanent storage
                const invoiceNumber = `INV-${Date.now()}`;
                const fileName = `${invoiceNumber}_${clientName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                const permanentUri = await saveReceiptFile(uri, fileName);

                // Get file size
                const fileInfo = await FileSystem.getInfoAsync(permanentUri);
                const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : undefined;

                // Create attachment
                const attachment: Attachment = {
                  id: `attach-${Date.now()}`,
                  uri: permanentUri,
                  name: fileName,
                  type: 'pdf',
                  size: fileSize,
                  mimeType: 'application/pdf',
                };

                // Add to income with attachment
                addIncome({
                  description: `${clientName} - ${description}`,
                  amount: parseFloat(amount),
                  date: date.toISOString().split('T')[0],
                  category: 'Client Payment',
                  attachments: [attachment],
                });

                // Also share the invoice
                await Sharing.shareAsync(uri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Share Invoice',
                });

                Alert.alert(
                  'Success',
                  'Invoice saved to Income tab with PDF attachment!',
                  [
                    {
                      text: 'View Income',
                      onPress: () => router.push('/(tabs)/income'),
                    },
                    { text: 'OK' },
                  ]
                );

                // Clear form
                setClientName('');
                setDescription('');
                setAmount('');
                setPaymentReference('');
                setDate(new Date());
              } catch (error) {
                console.error('Error saving invoice to income:', error);
                Alert.alert('Error', 'Failed to save invoice to income. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error generating invoice:', error);
      Alert.alert('Error', 'Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Ionicons name="document-text" size={40} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Invoice Generator</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Create professional invoices for your clients</Text>
        </View>

        <View style={styles.form}>
        {/* Date Paid */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Date Paid</Text>
          <TouchableOpacity style={[styles.dateButton, { backgroundColor: theme.input, borderColor: theme.inputBorder }]} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.dateText, { color: theme.text }]}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            themeVariant={isDark ? 'dark' : 'light'}
          />
        )}

        {/* Client Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Client Name</Text>
          <TextInput
            ref={clientNameInputRef}
            style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
            value={clientName}
            onChangeText={setClientName}
            placeholder="Enter client name"
            placeholderTextColor={theme.placeholder}
            returnKeyType="next"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter service/product description"
            placeholderTextColor={theme.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Amount Received */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Amount Received</Text>
          <View style={[styles.amountInputContainer, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
            <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.placeholder}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Payment Reference */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Payment Reference</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text }]}
            value={paymentReference}
            onChangeText={setPaymentReference}
            placeholder="e.g., Bank Transfer, PayPal, Cash"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: theme.primary }, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerateInvoice}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="document-text" size={20} color="#ffffff" />
              <Text style={styles.generateButtonText}>Generate Invoice</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  amountInputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
  },
  generateButton: {
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
