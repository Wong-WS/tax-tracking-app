import { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Transaction } from '@/context/AppContext';

interface SwipeableCardProps {
  item: Transaction;
  type: 'income' | 'expense';
  onDelete: (id: string) => void;
  swipeableRef?: (ref: Swipeable | null) => void;
}

export default function SwipeableCard({ item, type, onDelete, swipeableRef }: SwipeableCardProps) {
  const isIncome = type === 'income';
  const internalRef = useRef<Swipeable | null>(null);

  const config = {
    amountColor: isIncome ? '#16a34a' : '#dc2626',
    amountPrefix: isIncome ? '+' : '-',
    editRoute: isIncome ? '/edit-income' : '/edit-expense',
    paramKey: isIncome ? 'income' : 'expense',
  };

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
          <View>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={[styles.amount, { color: config.amountColor }]}>
            {config.amountPrefix}${item.amount.toLocaleString()}
          </Text>
        </View>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </Swipeable>
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
    marginBottom: 8,
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
  date: {
    fontSize: 13,
    color: '#94a3b8',
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
