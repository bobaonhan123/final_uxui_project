import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { userApi } from '../../src/api/services';
import { Button, Input, LoadingScreen } from '../../src/components';
import type { PaymentMethod } from '../../src/types';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  card: 'card-outline',
  visa: 'card-outline',
  mastercard: 'card-outline',
  paypal: 'logo-paypal',
};

export default function PaymentsScreen() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New method form
  const [newLabel, setNewLabel] = useState('');
  const [newLastFour, setNewLastFour] = useState('');
  const [newType, setNewType] = useState('card');
  const [adding, setAdding] = useState(false);

  const fetchMethods = useCallback(async () => {
    try {
      const { data } = await userApi.getPaymentMethods();
      setMethods(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMethods();
    setRefreshing(false);
  }, [fetchMethods]);

  const handleDelete = (pm: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Remove ${pm.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userApi.deletePaymentMethod(pm.id);
              setMethods((prev) => prev.filter((m) => m.id !== pm.id));
            } catch {
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ],
    );
  };

  const handleAdd = async () => {
    if (!newLabel.trim()) {
      Alert.alert('Error', 'Please enter a label');
      return;
    }
    setAdding(true);
    try {
      const { data } = await userApi.addPaymentMethod({
        type: newType,
        label: newLabel.trim(),
        last_four: newLastFour.trim() || undefined,
        is_default: methods.length === 0,
      });
      setMethods((prev) => [...prev, data]);
      setModalVisible(false);
      setNewLabel('');
      setNewLastFour('');
    } catch {
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setAdding(false);
    }
  };

  const renderMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name={TYPE_ICONS[item.type.toLowerCase()] ?? 'card-outline'} size={22} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{item.label}</Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          {item.last_four && (
            <Text style={styles.lastFour}>•••• {item.last_four}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={methods}
        keyExtractor={(item) => item.id}
        renderItem={renderMethod}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>Add a payment method to speed up checkout</Text>
          </View>
        }
        ListFooterComponent={
          <Button
            title="Add Payment Method"
            variant="outline"
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add-circle-outline" size={18} color={Colors.primary} />}
            style={{ marginTop: Spacing.md }}
          />
        }
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <View style={styles.typeRow}>
              {['card', 'paypal'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, newType === t && styles.typeBtnActive]}
                  onPress={() => setNewType(t)}
                >
                  <Ionicons
                    name={t === 'paypal' ? 'logo-paypal' : 'card-outline'}
                    size={18}
                    color={newType === t ? Colors.white : Colors.text}
                  />
                  <Text style={[styles.typeBtnText, newType === t && styles.typeBtnTextActive]}>
                    {t === 'paypal' ? 'PayPal' : 'Card'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Label" value={newLabel} onChangeText={setNewLabel} placeholder="e.g. Personal Visa" />
            {newType === 'card' && (
              <Input
                label="Last 4 Digits"
                value={newLastFour}
                onChangeText={(t) => setNewLastFour(t.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                keyboardType="number-pad"
                maxLength={4}
              />
            )}

            <Button title="Add" onPress={handleAdd} loading={adding} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  list: { padding: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.text },
  defaultBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  defaultText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  lastFour: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { fontSize: 14, fontWeight: '500', color: Colors.text },
  typeBtnTextActive: { color: Colors.white },
});
