import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useApp } from '@/context/AppContext';
import { exportAllReceipts } from '@/utils/fileStorage';

export default function SettingsScreen() {
  const { expenses } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAllReceipts = async () => {
    // Collect all attachments from all expenses
    const allAttachments = expenses
      .filter(expense => expense.attachments && expense.attachments.length > 0)
      .flatMap(expense => expense.attachments!);

    if (allAttachments.length === 0) {
      Alert.alert('No Receipts', 'There are no receipts to export.');
      return;
    }

    try {
      setIsExporting(true);

      // Export all receipts to a temporary directory
      const exportDir = await exportAllReceipts(allAttachments);

      if (!exportDir) {
        Alert.alert('Error', 'Failed to export receipts. Please try again.');
        return;
      }

      // Use sharing to let the user save the folder
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Share the first file with instructions
      Alert.alert(
        'Export Ready',
        `Found ${allAttachments.length} receipt(s). You can now save them to the Files app using the share menu.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Share',
            onPress: async () => {
              // Share the directory - unfortunately Expo Sharing can't share folders directly
              // So we'll need to share files one by one or use a different approach
              Alert.alert(
                'Export Method',
                'Would you like to export all receipts at once or individually?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Share All',
                    onPress: async () => {
                      // Share all files individually
                      for (let i = 0; i < allAttachments.length; i++) {
                        const attachment = allAttachments[i];
                        await Sharing.shareAsync(attachment.uri, {
                          mimeType: attachment.mimeType,
                          dialogTitle: `Receipt ${i + 1} of ${allAttachments.length}`,
                        });
                      }
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error exporting receipts:', error);
      Alert.alert('Error', 'Failed to export receipts. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const receiptCount = expenses
    .filter(expense => expense.attachments && expense.attachments.length > 0)
    .reduce((total, expense) => total + (expense.attachments?.length || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your tax tracking experience</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => router.push('/categories')}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="pricetags" size={24} color="#2563eb" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Categories</Text>
              <Text style={styles.cardSubtitle}>Manage income and expense categories</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={handleExportAllReceipts}
          disabled={isExporting || receiptCount === 0}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="download" size={24} color="#16a34a" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Export All Receipts</Text>
              <Text style={styles.cardSubtitle}>
                {receiptCount === 0
                  ? 'No receipts to export'
                  : `Export ${receiptCount} receipt${receiptCount > 1 ? 's' : ''} to Files app`}
              </Text>
            </View>
            {isExporting ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            )}
          </View>
        </TouchableOpacity>

        {/* Future settings cards can be added here */}
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    padding: 16,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
});
