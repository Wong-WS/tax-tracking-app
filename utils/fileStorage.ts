import * as FileSystem from 'expo-file-system/legacy';
import { Attachment } from '@/context/AppContext';

// Directory for storing receipts
const RECEIPTS_DIR = `${FileSystem.documentDirectory}receipts/`;

// Ensure receipts directory exists
export async function ensureReceiptsDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(RECEIPTS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RECEIPTS_DIR, { intermediates: true });
  }
}

// Copy file to app's permanent storage
export async function saveReceiptFile(sourceUri: string, fileName: string): Promise<string> {
  await ensureReceiptsDirectory();

  // Generate unique filename to avoid collisions
  const timestamp = Date.now();
  const extension = fileName.split('.').pop() || 'jpg';
  const uniqueFileName = `${timestamp}_${fileName}`;
  const destinationUri = `${RECEIPTS_DIR}${uniqueFileName}`;

  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
    return destinationUri;
  } catch (error) {
    console.error('Error saving receipt file:', error);
    throw new Error('Failed to save receipt file');
  }
}

// Delete a receipt file
export async function deleteReceiptFile(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error('Error deleting receipt file:', error);
  }
}

// Delete all receipts for a transaction
export async function deleteTransactionReceipts(attachments?: Attachment[]): Promise<void> {
  if (!attachments || attachments.length === 0) return;

  for (const attachment of attachments) {
    await deleteReceiptFile(attachment.uri);
  }
}

// Get file type from URI
export function getFileType(uri: string, mimeType?: string): 'image' | 'pdf' | 'document' {
  const lowerUri = uri.toLowerCase();
  const lowerMime = mimeType?.toLowerCase() || '';

  if (lowerUri.match(/\.(jpg|jpeg|png|gif|webp|heic)$/) || lowerMime.startsWith('image/')) {
    return 'image';
  }

  if (lowerUri.endsWith('.pdf') || lowerMime === 'application/pdf') {
    return 'pdf';
  }

  return 'document';
}

// Get file size
export async function getFileSize(uri: string): Promise<number | undefined> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
  } catch (error) {
    console.error('Error getting file size:', error);
  }
  return undefined;
}

// Format file size for display
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Export all receipts to a temporary folder
export async function exportAllReceipts(attachments: Attachment[]): Promise<string | null> {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  try {
    // Create a temporary export directory
    const exportDir = `${FileSystem.cacheDirectory}receipts_export/`;
    const dirInfo = await FileSystem.getInfoAsync(exportDir);

    // Clean up existing export directory if it exists
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(exportDir);
    }

    // Create fresh export directory
    await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

    // Copy all receipts to the export directory
    for (const attachment of attachments) {
      const fileInfo = await FileSystem.getInfoAsync(attachment.uri);
      if (fileInfo.exists) {
        const destinationUri = `${exportDir}${attachment.name}`;
        await FileSystem.copyAsync({
          from: attachment.uri,
          to: destinationUri,
        });
      }
    }

    return exportDir;
  } catch (error) {
    console.error('Error exporting receipts:', error);
    return null;
  }
}
