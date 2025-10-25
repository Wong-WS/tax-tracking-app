import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useApp } from '@/context/AppContext';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { exportAllReceipts } from '@/utils/fileStorage';

export default function SettingsScreen() {
  const { expenses } = useApp();
  const { theme, themeMode, setThemeMode } = useTheme();
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

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto (System)';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textTertiary }]}>Customize your tax tracking experience</Text>
      </View>

      <View style={styles.section}>
        {/* Theme Selector */}
        <View style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="color-palette" size={24} color={theme.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Theme</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Choose your preferred theme</Text>
            </View>
          </View>
          <View style={styles.themeOptions}>
            {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: themeMode === mode ? theme.primary : theme.surface,
                    borderColor: themeMode === mode ? theme.primary : theme.border,
                  }
                ]}
                onPress={() => handleThemeChange(mode)}
              >
                <Text style={[
                  styles.themeOptionText,
                  { color: themeMode === mode ? '#ffffff' : theme.text }
                ]}>
                  {getThemeLabel(mode)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => router.push('/categories')}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="pricetags" size={24} color={theme.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Categories</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Manage income and expense categories</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={handleExportAllReceipts}
          disabled={isExporting || receiptCount === 0}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="download" size={24} color={theme.success} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Export All Receipts</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                {receiptCount === 0
                  ? 'No receipts to export'
                  : `Export ${receiptCount} receipt${receiptCount > 1 ? 's' : ''} to Files app`}
              </Text>
            </View>
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.success} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
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
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  settingCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
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
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
