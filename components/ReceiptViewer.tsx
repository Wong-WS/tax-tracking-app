import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Attachment } from '@/context/AppContext';
import { formatFileSize } from '@/utils/fileStorage';

interface ReceiptViewerProps {
  visible: boolean;
  attachments: Attachment[];
  initialIndex?: number;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function ReceiptViewer({ visible, attachments, initialIndex = 0, onClose }: ReceiptViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!visible || attachments.length === 0) return null;

  const currentAttachment = attachments[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(currentAttachment.uri, {
        mimeType: currentAttachment.mimeType,
        dialogTitle: 'Open with...',
      });
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const handleDownload = async () => {
    // Only allow downloading images (MediaLibrary doesn't support PDFs in Expo Go)
    if (currentAttachment.type !== 'image') {
      Alert.alert(
        'Save File',
        'Use the Share button to save this file. You can choose "Save to Files" or any other app from the share menu.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is required to save images.');
        return;
      }

      // Save image to Photos
      await MediaLibrary.createAssetAsync(currentAttachment.uri);
      Alert.alert('Success', 'Image saved to Photos');
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to save image');
    }
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{currentAttachment.name}</Text>
            {currentAttachment.size && (
              <Text style={styles.headerSubtitle}>{formatFileSize(currentAttachment.size)}</Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleDownload}>
              <Ionicons name="download-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentAttachment.type === 'image' ? (
            <ScrollView
              style={styles.imageScrollView}
              contentContainerStyle={styles.imageScrollContent}
              minimumZoomScale={1}
              maximumZoomScale={3}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Image source={{ uri: currentAttachment.uri }} style={styles.image} resizeMode="contain" />
            </ScrollView>
          ) : (
            <View style={styles.documentContainer}>
              <Ionicons name={getIconForType(currentAttachment.type) as any} size={80} color="#94a3b8" />
              <Text style={styles.documentText}>{currentAttachment.name}</Text>
              <Text style={styles.documentType}>{currentAttachment.type.toUpperCase()}</Text>
              {currentAttachment.size && (
                <Text style={styles.documentSize}>{formatFileSize(currentAttachment.size)}</Text>
              )}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                  <Ionicons name="open-outline" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.downloadButton]} onPress={handleDownload}>
                  <Ionicons name="download-outline" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.documentHint}>View opens the file in another app • Download saves to your device</Text>
            </View>
          )}
        </View>

        {/* Navigation */}
        {attachments.length > 1 && (
          <>
            <TouchableOpacity style={styles.navButtonLeft} onPress={goToPrevious}>
              <Ionicons name="chevron-back" size={32} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButtonRight} onPress={goToNext}>
              <Ionicons name="chevron-forward" size={32} color="#ffffff" />
            </TouchableOpacity>

            {/* Page Indicator */}
            <View style={styles.pageIndicator}>
              <Text style={styles.pageText}>
                {currentIndex + 1} / {attachments.length}
              </Text>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageScrollView: {
    flex: 1,
    width: width,
  },
  imageScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height - 140,
  },
  image: {
    width: width,
    height: height - 140,
  },
  documentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  documentText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  documentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 8,
  },
  documentSize: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  documentHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  navButtonLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});
