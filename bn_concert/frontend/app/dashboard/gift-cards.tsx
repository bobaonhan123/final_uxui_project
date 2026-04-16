import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../../src/constants/theme';
import { giftCardApi } from '../../src/api/services';
import { Button, Input } from '../../src/components';
import type { GiftCard } from '../../src/types';

export default function GiftCardsScreen() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a gift card code');
      return;
    }
    setRedeeming(true);
    try {
      const { data } = await giftCardApi.redeem(trimmed);
      setCards((prev) => [data, ...prev]);
      setCode('');
      Alert.alert('Success', `Gift card redeemed! Balance: $${data.current_balance.toFixed(2)}`);
    } catch {
      Alert.alert('Error', 'Invalid or expired gift card code');
    } finally {
      setRedeeming(false);
    }
  };

  const maskCode = (c: string) => {
    if (c.length <= 4) return c;
    return '****-****-' + c.slice(-4);
  };

  const balancePercent = (card: GiftCard) =>
    card.original_balance > 0 ? (card.current_balance / card.original_balance) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Redeem Section */}
      <View style={styles.redeemCard}>
        <Text style={styles.redeemTitle}>Redeem Gift Card</Text>
        <Text style={styles.redeemDesc}>Enter the code from your gift card</Text>
        <Input
          placeholder="e.g. ABCD-EFGH-1234"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <Button title="Redeem" onPress={handleRedeem} loading={redeeming} />
      </View>

      {/* Gift Cards List */}
      <Text style={styles.sectionTitle}>
        My Gift Cards {cards.length > 0 && `(${cards.length})`}
      </Text>

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="gift-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No gift cards redeemed yet</Text>
        </View>
      ) : (
        cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardCodeRow}>
                <Ionicons name="gift" size={18} color={Colors.primary} />
                <Text style={styles.cardCode}>{maskCode(card.code)}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: card.is_active ? Colors.success : Colors.textLight },
                ]}
              />
            </View>

            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceValue}>${card.current_balance.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.balanceLabel}>Original</Text>
                <Text style={styles.originalValue}>${card.original_balance.toFixed(2)}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${balancePercent(card)}%` },
                ]}
              />
            </View>

            <Text style={styles.statusText}>
              {card.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.md, paddingBottom: 40 },
  redeemCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  redeemTitle: { ...Fonts.h3, fontSize: 18, lineHeight: 24, color: Colors.text },
  redeemDesc: { ...Fonts.caption, color: Colors.textSecondary, marginTop: Spacing.xxs, marginBottom: Spacing.md },
  sectionTitle: { ...Fonts.h3, lineHeight: 24, color: Colors.text, marginBottom: Spacing.sm },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardCodeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardCode: { ...Fonts.medium, color: Colors.text },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  balanceLabel: { ...Fonts.caption, color: Colors.textSecondary },
  balanceValue: { ...Fonts.h2, fontSize: 22, color: Colors.primary },
  originalValue: { ...Fonts.button14, color: Colors.textSecondary },
  progressBg: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  statusText: { ...Fonts.caption, color: Colors.textSecondary, marginTop: Spacing.sm - Spacing.xxs, textAlign: 'right' },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.sm,
  },
  emptyText: { ...Fonts.body14, color: Colors.textSecondary },
});
