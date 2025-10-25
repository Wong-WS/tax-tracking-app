import { Alert } from 'react-native';

/**
 * Custom hook for showing delete confirmation dialogs
 * @param title - Dialog title
 * @param message - Dialog message
 * @param onConfirm - Callback when deletion is confirmed
 * @returns Function to show the confirmation dialog
 */
export function useDeleteConfirmation(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>
) {
  return () => {
    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onConfirm,
      },
    ]);
  };
}
