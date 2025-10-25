import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Transaction } from '@/context/AppContext';
import ReceiptViewer from './ReceiptViewer';

interface SwipeableCardProps {
  item: Transaction;
  type: 'income' | 'expense';
  onDelete: (id: string) => void;
  swipeableRef?: (ref: Swipeable | null) => void;
}

export default function SwipeableCard({ item, type, onDelete, swipeableRef }: SwipeableCardProps) {
  const isIncome = type === 'income';
  const internalRef = useRef<Swipeable | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const config = {
    amountColor: isIncome ? '#16a34a' : '#dc2626',
    amountPrefix: isIncome ? '+' : '-',
    editRoute: isIncome ? '/edit-income' : '/edit-expense',
    paramKey: isIncome ? 'income' : 'expense',
  };

  const hasAttachments = item.attachments && item.attachments.length > 0;
  const firstAttachment = item.attachments?.[0];

  const handleDelete = () => {
    Alert.alert(
      `Delete ${isIncome ? 'Income' : 'Expense'}`,
      `Are you sure you want to delete "${item.description}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(item.id);
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // Close the swipeable row before navigating
    internalRef.current?.close();

    router.push({
      pathname: config.editRoute as any,
      params: { [config.paramKey]: JSON.stringify(item) },
    });
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Ionicons name="pencil" size={20} color="#ffffff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={20} color="#ffffff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Swipeable
        ref={(ref) => {
          internalRef.current = ref;
          if (swipeableRef) {
            swipeableRef(ref);
          }
        }}
        renderRightActions={renderRightActions}
        overshootRight={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.infoSection}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={[styles.amount, { color: config.amountColor }]}>
                {config.amountPrefix}${item.amount.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>

            {/* Receipt Thumbnail and Badge */}
            {hasAttachments && (
              <TouchableOpacity
                style={styles.receiptBadge}
                onPress={() => setViewerVisible(true)}
              >
                {firstAttachment?.type === 'image' ? (
                  <Image source={{ uri: firstAttachment.uri }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.documentThumbnail}>
                    <Ionicons name="document-text" size={16} color="#8b5cf6" />
                  </View>
                )}
                {item.attachments && item.attachments.length > 1 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.attachments.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Swipeable>

      {/* Receipt Viewer Modal */}
      {hasAttachments && (
        <ReceiptViewer
          visible={viewerVisible}
          attachments={item.attachments!}
          onClose={() => setViewerVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoSection: {
    flex: 1,
    marginRight: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#64748b',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  date: {
    fontSize: 13,
    color: '#94a3b8',
  },
  receiptBadge: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  documentThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
