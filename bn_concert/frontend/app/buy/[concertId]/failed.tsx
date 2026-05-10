import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Footer, Header } from '../../../src/components';
import { BorderRadius, Colors, Fonts, Spacing } from '../../../src/constants/theme';
import type { PaymentOption } from '../../../src/api/services';

export default function FailedScreen() {
  const {
    concertId,
    error,
    orderId,
    seatIds,
    seatLabels,
    seatPrices,
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
    seatLabels?: string;
    seatPrices?: string;
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
        seatLabels: seatLabels || '',
        seatPrices: seatPrices || '',
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header showSearch />

      <View style={styles.messageStage}>
        <View style={styles.iconCircle}>
          <Ionicons name="close" size={30} color={Colors.white} />
        </View>
        <Text style={styles.title}>Sorry, Payment failed</Text>
        <Text style={styles.subtitle}>
          {error || 'Unfortunately, your order cannot be completed. Please try a different payment method.'}
        </Text>
        {orderId ? <Text style={styles.orderText}>Order {orderId.slice(0, 8).toUpperCase()}</Text> : null}

        <TouchableOpacity activeOpacity={0.8} onPress={() => navigateToPayment(false)} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Retry Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={() => navigateToPayment(true)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Change Method</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={() => router.replace('/(tabs)')} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Back to Homepage</Text>
        </TouchableOpacity>
      </View>

      <Footer containerStyle={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    alignSelf: 'center',
    maxWidth: '100%',
    width: 360,
  },
  messageStage: {
    alignItems: 'center',
    minHeight: 430,
    paddingHorizontal: 20,
    paddingTop: 86,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: Colors.error,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  title: {
    ...Fonts.h1,
    color: Colors.text,
    fontSize: 28,
    lineHeight: 34,
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    ...Fonts.body14,
    color: Colors.neutral700,
    lineHeight: 24,
    marginTop: 18,
    textAlign: 'center',
  },
  orderText: {
    ...Fonts.body12,
    color: Colors.error,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 40,
    justifyContent: 'center',
    marginTop: 32,
    width: 202,
  },
  primaryButtonText: {
    ...Fonts.button14,
    color: Colors.white,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: Colors.neutral700,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginTop: 16,
    width: 202,
  },
  secondaryButtonText: {
    ...Fonts.button14,
    color: Colors.neutral700,
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonText: {
    ...Fonts.body12,
    color: Colors.neutral700,
  },
  footer: {
    marginTop: 0,
  },
});
