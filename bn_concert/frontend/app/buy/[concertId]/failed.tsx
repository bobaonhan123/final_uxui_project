import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../../../src/constants/theme';
import { Button } from '../../../src/components';
import type { PaymentOption } from '../../../src/api/services';

export default function FailedScreen() {
  const {
    concertId,
    error,
    orderId,
    seatIds,
    insurance,
    giftCardCode,
    total,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    failedMethodType,
    failedSavedMethodId,
    failedIdealBank,
  } = useLocalSearchParams<{
    concertId: string;
    error: string;
    orderId?: string;
    seatIds: string;
    insurance: string;
    giftCardCode: string;
    total: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerAddress: string;
    failedMethodType?: PaymentOption;
    failedSavedMethodId?: string;
    failedIdealBank?: string;
  }>();
  const router = useRouter();

  const navigateToPayment = (resetSelection: boolean) => {
    if (!concertId) {
      router.replace('/(tabs)');
      return;
    }

    router.replace({
      pathname: `/buy/${concertId}/payment`,
      params: {
        seatIds: seatIds || '',
        insurance: insurance || '0',
        giftCardCode: giftCardCode || '',
        total: total || '0',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || '',
        customerAddress: customerAddress || '',
        orderId: orderId || '',
        failedMethodType: resetSelection ? '' : (failedMethodType || ''),
        failedSavedMethodId: resetSelection ? '' : (failedSavedMethodId || ''),
        failedIdealBank: resetSelection ? '' : (failedIdealBank || ''),
        resetMethod: resetSelection ? '1' : '0',
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="close" size={64} color={Colors.white} />
        </View>
      </View>

      <Text style={styles.title}>Payment Failed</Text>
      <Text style={styles.subtitle}>
        {error || 'Something went wrong. Please try again.'}
      </Text>

      {orderId ? (
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>Order {orderId.slice(0, 8).toUpperCase()}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button title="Retry Payment" onPress={() => navigateToPayment(false)} />
        <Button title="Change Method" onPress={() => navigateToPayment(true)} variant="outline" />
        <Button title="Back to Home" onPress={() => router.replace('/(tabs)')} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconWrap: { marginBottom: Spacing.xl },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { ...Fonts.h1, marginBottom: Spacing.sm },
  subtitle: {
    ...Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  orderBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: `${Colors.error}15`,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
  },
  orderBadgeText: { ...Fonts.caption, color: Colors.error, fontSize: 12, fontFamily: Fonts.bold.fontFamily },
  actions: { width: '100%', gap: Spacing.sm },
});
