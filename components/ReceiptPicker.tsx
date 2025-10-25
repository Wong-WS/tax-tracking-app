import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Attachment } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { saveReceiptFile, getFileType, getFileSize, formatFileSize } from '@/utils/fileStorage';

interface ReceiptPickerProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  required?: boolean;
}

export default function ReceiptPicker({ attachments, onChange, required = true }: ReceiptPickerProps) {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      setIsProcessing(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addAttachment(result.assets[0].uri, result.assets[0].fileName || 'photo.jpg', result.assets[0].mimeType);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }

      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        for (const asset of result.assets) {
          await addAttachment(asset.uri, asset.fileName || 'image.jpg', asset.mimeType);
        }
      }
    } catch (error) {
      console.error('Error choosing from gallery:', error);
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChooseDocument = async () => {
    try {
      setIsProcessing(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        for (const file of result.assets) {
          await addAttachment(file.uri, file.name, file.mimeType);
        }
      }
    } catch (error) {
      console.error('Error choosing document:', error);
      Alert.alert('Error', 'Failed to select document');
    } finally {
      setIsProcessing(false);
    }
  };

  const addAttachment = async (sourceUri: string, fileName: string, mimeType?: string) => {
    try {
      // Save file to permanent storage
      const permanentUri = await saveReceiptFile(sourceUri, fileName);
      const fileSize = await getFileSize(permanentUri);
      const fileType = getFileType(permanentUri, mimeType);

      const newAttachment: Attachment = {
        id: generateId(),
        uri: permanentUri,
        name: fileName,
        type: fileType,
        size: fileSize,
        mimeType: mimeType,
      };

      onChange([...attachments, newAttachment]);
    } catch (error) {
      console.error('Error adding attachment:', error);
      Alert.alert('Error', 'Failed to add receipt');
    }
  };

  const removeAttachment = (id: string) => {
    Alert.alert(
      'Remove Receipt',
      required && attachments.length === 1
        ? 'At least one receipt is required. You cannot remove the last receipt.'
        : 'Are you sure you want to remove this receipt?',
      required && attachments.length === 1
        ? [{ text: 'OK', style: 'cancel' }]
        : [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => {
                onChange(attachments.filter(a => a.id !== id));
              },
            },
          ]
    );
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'document-text';
      case 'document':
        return 'document';
      default:
        return 'image';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>
        Receipts / Invoices {required && <Text style={[styles.required, { color: theme.error }]}>*</Text>}
      </Text>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.primary + '20', borderColor: theme.primaryLight },
            isProcessing && styles.buttonDisabled
          ]}
          onPress={handleTakePhoto}
          disabled={isProcessing}
        >
          <Ionicons name="camera" size={20} color={theme.primary} />
          <Text style={[styles.actionButtonText, { color: theme.primary }]}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.primary + '20', borderColor: theme.primaryLight },
            isProcessing && styles.buttonDisabled
          ]}
          onPress={handleChooseFromGallery}
          disabled={isProcessing}
        >
          <Ionicons name="images" size={20} color={theme.primary} />
          <Text style={[styles.actionButtonText, { color: theme.primary }]}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.primary + '20', borderColor: theme.primaryLight },
            isProcessing && styles.buttonDisabled
          ]}
          onPress={handleChooseDocument}
          disabled={isProcessing}
        >
          <Ionicons name="document" size={20} color={theme.primary} />
          <Text style={[styles.actionButtonText, { color: theme.primary }]}>Document</Text>
        </TouchableOpacity>
      </View>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsList}>
          {attachments.map((attachment) => (
            <View key={attachment.id} style={[styles.attachmentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {attachment.type === 'image' ? (
                <Image source={{ uri: attachment.uri }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.documentPreview, { backgroundColor: theme.input }]}>
                  <Ionicons name={getIconForType(attachment.type) as any} size={40} color={theme.textSecondary} />
                </View>
              )}
              <View style={styles.attachmentInfo}>
                <Text style={[styles.attachmentName, { color: theme.text }]} numberOfLines={1}>
                  {attachment.name}
                </Text>
                {attachment.size && (
                  <Text style={[styles.attachmentSize, { color: theme.textSecondary }]}>{formatFileSize(attachment.size)}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeAttachment(attachment.id)}
              >
                <Ionicons name="close-circle" size={24} color={theme.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Empty State */}
      {attachments.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="receipt-outline" size={48} color={theme.borderLight} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No receipts added yet</Text>
          {required && <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>At least one receipt is required</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  required: {
    // Color applied inline
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  attachmentsList: {
    marginBottom: 8,
  },
  attachmentCard: {
    width: 140,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 100,
  },
  documentPreview: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    padding: 8,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 11,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
