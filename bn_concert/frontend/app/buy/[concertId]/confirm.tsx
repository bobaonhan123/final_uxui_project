import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts, ComponentSizes } from '../../../src/constants/theme';
import { giftCardApi, userApi } from '../../../src/api/services';

const INSURANCE_RATE = 0.05;

export default function ConfirmScreen() {
  const { concertId, sectionName, seatIds, seatLabels, seatPrices } =
    useLocalSearchParams<{
      concertId: string;
      sectionName: string;
      seatIds: string;
      seatLabels: string;
      seatPrices: string;
    }>();
  const router = useRouter();

  const ids = seatIds?.split(',') || [];
  const labels = seatLabels?.split(',') || [];
  const prices = seatPrices?.split(',').map(Number) || [];

  const [insurance, setInsurance] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [appliedGiftCardBalance, setAppliedGiftCardBalance] = useState<number | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  useEffect(() => {
    userApi
      .getMe()
      .then(({ data }) => {
        setCustomerName(`${data.first_name} ${data.last_name}`.trim());
        setCustomerPhone(data.phone || '');
        setCustomerEmail(data.email || '');
        setCustomerAddress(
          [data.address, data.city, data.country].filter(Boolean).join(', '),
        );
      })
      .catch(() => {
        Alert.alert(
          'Profile not loaded',
          'Please fill in your contact information manually before payment.',
        );
      });
  }, []);

  const subtotal = useMemo(
    () => prices.reduce((sum, price) => sum + price, 0),
    [prices],
  );
  const insuranceFee = insurance ? subtotal * INSURANCE_RATE : 0;
  const giftCardDiscount =
    appliedGiftCardBalance !== null
      ? Math.min(appliedGiftCardBalance, subtotal + insuranceFee)
      : 0;
  const total = Math.max(0, subtotal + insuranceFee - giftCardDiscount);
  const normalizedGiftCardCode = giftCardCode.trim().toUpperCase();

  const handleApplyGiftCard = async () => {
    if (!normalizedGiftCardCode) return;

    setApplyingCode(true);
    try {
      const { data } = await giftCardApi.redeem(normalizedGiftCardCode);
      setGiftCardCode(normalizedGiftCardCode);
      setAppliedGiftCardBalance(data.current_balance);
      Alert.alert('Gift Card Applied', `Discount preview: -$${Math.min(data.current_balance, subtotal + insuranceFee).toFixed(2)}`);
    } catch (err: unknown) {
      setAppliedGiftCardBalance(null);
      const error = err as { response?: { data?: { detail?: string } } };
      const message = error.response?.data?.detail || 'Invalid or inactive gift card code.';
      Alert.alert('Gift Card Error', message);
    } finally {
      setApplyingCode(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      Alert.alert('Missing Information', 'Please provide your name and email before payment.');
      return;
    }

    router.push({
      pathname: `/buy/${concertId}/payment`,
      params: {
        seatIds,
        insurance: insurance ? '1' : '0',
        giftCardCode: appliedGiftCardBalance !== null ? normalizedGiftCardCode : '',
        total: String(total),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerAddress: customerAddress.trim(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="musical-notes" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>
          <Text style={styles.sectionLabel}>Section: {sectionName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected Seats</Text>
          {ids.map((id, index) => (
            <View key={id} style={styles.seatRow}>
              <View style={styles.seatInfo}>
                <Ionicons name="ticket-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.seatLabel}>{labels[index] || `Seat ${index + 1}`}</Text>
              </View>
              <Text style={styles.seatPrice}>${prices[index]?.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>${subtotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <TextInput
            style={styles.infoInput}
            placeholder="Full name"
            placeholderTextColor={Colors.textLight}
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.infoInput}
            placeholder="Email"
            placeholderTextColor={Colors.textLight}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.infoInput}
            placeholder="Phone"
            placeholderTextColor={Colors.textLight}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.infoInput}
            placeholder="Address"
            placeholderTextColor={Colors.textLight}
            value={customerAddress}
            onChangeText={setCustomerAddress}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.insuranceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Ticket Insurance</Text>
              <Text style={styles.insuranceDescription}>
                Protect your purchase with a full refund option (5% of subtotal)
              </Text>
            </View>
            <Switch
              value={insurance}
              onValueChange={setInsurance}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>
          {insurance && (
            <Text style={styles.insuranceCost}>+ ${insuranceFee.toFixed(2)}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gift Card</Text>
          <View style={styles.giftCardRow}>
            <TextInput
              style={styles.giftCardInput}
              placeholder="Enter gift card code"
              placeholderTextColor={Colors.textLight}
              value={giftCardCode}
              onChangeText={(value) => {
                setGiftCardCode(value);
                setAppliedGiftCardBalance(null);
              }}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.applyButton, (!normalizedGiftCardCode || applyingCode) && { opacity: 0.5 }]}
              onPress={handleApplyGiftCard}
              disabled={!normalizedGiftCardCode || applyingCode}
            >
              {applyingCode ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
          {giftCardDiscount > 0 && (
            <Text style={styles.giftCardAppliedText}>
              Applied discount: -${giftCardDiscount.toFixed(2)}
            </Text>
          )}
        </View>

        <View style={[styles.card, styles.totalCard]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {insurance && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Insurance (5%)</Text>
              <Text style={styles.totalValue}>${insuranceFee.toFixed(2)}</Text>
            </View>
          )}
          {giftCardDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Gift Card</Text>
              <Text style={[styles.totalValue, { color: Colors.success }]}>
                -${giftCardDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueToPayment}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  cardTitle: { ...Fonts.bold, fontSize: 15, marginBottom: Spacing.xs },
  sectionLabel: { ...Fonts.medium, color: Colors.textSecondary, fontSize: 14 },
  seatRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  seatInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  seatLabel: { ...Fonts.regular },
  seatPrice: { ...Fonts.medium },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  totalLabel: { ...Fonts.regular, color: Colors.textSecondary },
  subtotalValue: { ...Fonts.bold },
  totalValue: { ...Fonts.medium },
  totalCard: { marginBottom: Spacing.md },
  grandTotalLabel: { ...Fonts.bold, fontSize: 16 },
  grandTotalValue: { ...Fonts.bold, fontSize: 20, color: Colors.primary },
  infoInput: {
    minHeight: ComponentSizes.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
    marginTop: Spacing.sm,
    ...Fonts.regular,
  },
  insuranceRow: { flexDirection: 'row', alignItems: 'center' },
  insuranceDescription: { ...Fonts.caption, marginTop: 2, paddingRight: Spacing.md },
  insuranceCost: { ...Fonts.medium, color: Colors.primary, marginTop: Spacing.sm },
  giftCardRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  giftCardInput: {
    minHeight: ComponentSizes.inputHeight,
    flex: 1, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md,
    paddingVertical: 0, ...Fonts.regular,
  },
  applyButton: {
    minWidth: 84,
    minHeight: ComponentSizes.inputHeight,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: { ...Fonts.bold, color: Colors.white, fontSize: 14 },
  giftCardAppliedText: { ...Fonts.caption, color: Colors.success, marginTop: Spacing.sm },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: Spacing.md, paddingBottom: Spacing.lg,
  },
  continueButton: {
    minHeight: ComponentSizes.buttonHeightLg,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 0, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  continueButtonText: { ...Fonts.bold, color: Colors.white, fontSize: 16 },
});
