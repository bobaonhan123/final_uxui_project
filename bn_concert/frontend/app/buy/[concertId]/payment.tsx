import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts, ComponentSizes } from '../../../src/constants/theme';
import { orderApi, userApi, type PaymentOption } from '../../../src/api/services';
import type { PaymentMethod } from '../../../src/types';

const IDEAL_BANKS = ['ING', 'Rabobank', 'ABN AMRO', 'SNS Bank'];

const METHOD_META: Record<
  PaymentOption,
  { label: string; icon: keyof typeof Ionicons.glyphMap; description: string }
> = {
  saved_card: {
    label: 'Saved Card',
    icon: 'card',
    description: 'Use a card saved in your account',
  },
  new_card: {
    label: 'New Card',
    icon: 'card-outline',
    description: 'Pay with a new Visa or Mastercard',
  },
  ideal: {
    label: 'iDeal',
    icon: 'business-outline',
    description: 'Direct transfer from your bank',
  },
};

export default function PaymentScreen() {
  const {
    concertId,
    seatIds,
    insurance,
    giftCardCode,
    total,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    orderId,
    failedMethodType,
    failedSavedMethodId,
    failedIdealBank,
    resetMethod,
  } = useLocalSearchParams<{
    concertId: string;
    seatIds: string;
    insurance: string;
    giftCardCode: string;
    total: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerAddress: string;
    orderId?: string;
    failedMethodType?: PaymentOption;
    failedSavedMethodId?: string;
    failedIdealBank?: string;
    resetMethod?: string;
  }>();
  const router = useRouter();

  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCardForLater, setSaveCardForLater] = useState(true);

  const [idealBank, setIdealBank] = useState(failedIdealBank || '');

  const hasSavedCards = savedCards.length > 0;
  const requiresCardDetails = selectedOption === 'new_card';
  const requiresIdealBank = selectedOption === 'ideal';
  const parsedTotal = Number(total || 0);
  const normalizedSeatIds = useMemo(
    () => (seatIds?.split(',').filter(Boolean) ?? []),
    [seatIds],
  );

  useEffect(() => {
    userApi
      .getPaymentMethods()
      .then(({ data }) => {
        const cards = data.filter((method) => {
          const normalizedType = method.type.toLowerCase();
          return normalizedType === 'bank_card' || normalizedType === 'card';
        });
        setSavedCards(cards);

        if (resetMethod === '1') {
          setSelectedOption(cards.length > 0 ? 'saved_card' : 'new_card');
          setSelectedSavedCardId(cards.find((method) => method.is_default)?.id ?? cards[0]?.id ?? null);
          return;
        }

        if (failedMethodType) {
          setSelectedOption(failedMethodType);
          if (failedMethodType === 'saved_card') {
            setSelectedSavedCardId(
              failedSavedMethodId || cards.find((method) => method.is_default)?.id || cards[0]?.id || null,
            );
          }
          return;
        }

        if (cards.length > 0) {
          setSelectedOption('saved_card');
          setSelectedSavedCardId(cards.find((method) => method.is_default)?.id ?? cards[0]?.id ?? null);
          return;
        }
        setSelectedOption('new_card');
      })
      .catch(() => {
        if (!failedMethodType) {
          setSelectedOption('new_card');
        }
      })
      .finally(() => setLoadingMethods(false));
  }, [failedMethodType, failedSavedMethodId, resetMethod]);

  const validateCardForm = () => {
    const normalizedCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(normalizedCardNumber)) {
      Alert.alert('Invalid Card', 'Please enter a valid card number.');
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert('Invalid Card', 'Please enter the card holder name.');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      Alert.alert('Invalid Card', 'Please enter expiry in MM/YY format.');
      return false;
    }
    if (!/^\d{3,4}$/.test(cardCvv.trim())) {
      Alert.alert('Invalid Card', 'Please enter a valid CVV.');
      return false;
    }
    return true;
  };

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, '')
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();

  const formatExpiry = (value: string) => {
    const normalized = value.replace(/\D/g, '').slice(0, 4);
    if (normalized.length <= 2) return normalized;
    return `${normalized.slice(0, 2)}/${normalized.slice(2, 4)}`;
  };

  const handlePay = async () => {
    if (!concertId) {
      Alert.alert('Missing Data', 'Concert information is missing.');
      return;
    }
    if (!selectedOption) {
      Alert.alert('Select Payment', 'Please choose a payment method.');
      return;
    }
    if (selectedOption === 'saved_card' && !selectedSavedCardId) {
      Alert.alert('Select Card', 'Please choose one of your saved cards.');
      return;
    }
    if (requiresCardDetails && !validateCardForm()) {
      return;
    }
    if (requiresIdealBank && !idealBank.trim()) {
      Alert.alert('Select Bank', 'Please choose your iDeal bank.');
      return;
    }
    if (!orderId && normalizedSeatIds.length === 0) {
      Alert.alert('No Seats Selected', 'Please go back and select at least one seat.');
      return;
    }

    setProcessing(true);
    let activeOrderId = orderId;

    try {
      if (!activeOrderId) {
        const { data: order } = await orderApi.create({
          concert_id: concertId,
          items: normalizedSeatIds.map((id) => ({ event_seat_id: id })),
          insurance: insurance === '1',
          gift_card_code: giftCardCode || undefined,
          payment_method: selectedOption,
          customer_name: customerName?.trim() || undefined,
          customer_phone: customerPhone?.trim() || undefined,
          customer_email: customerEmail?.trim() || undefined,
          customer_address: customerAddress?.trim() || undefined,
        });
        activeOrderId = order.id;
      }

      if (!activeOrderId) {
        throw new Error('Unable to create order');
      }

      if (selectedOption === 'saved_card') {
        await orderApi.pay(activeOrderId, {
          payment_option: 'saved_card',
          saved_payment_method_id: selectedSavedCardId ?? undefined,
        });
      } else if (selectedOption === 'new_card') {
        await orderApi.pay(activeOrderId, {
          payment_option: 'new_card',
          card_number: cardNumber.replace(/\s/g, ''),
          card_holder_name: cardName.trim(),
          card_expiry: cardExpiry.trim(),
          card_cvv: cardCvv.trim(),
          save_new_card: saveCardForLater,
        });
      } else {
        await orderApi.pay(activeOrderId, {
          payment_option: 'ideal',
          ideal_bank: idealBank.trim(),
        });
      }

      router.replace({
        pathname: `/buy/${concertId}/success`,
        params: { orderId: activeOrderId },
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const message = error.response?.data?.detail || 'Payment failed. Please try again.';
      router.replace({
        pathname: `/buy/${concertId}/failed`,
        params: {
          error: message,
          orderId: activeOrderId || '',
          seatIds: seatIds || '',
          insurance: insurance || '0',
          giftCardCode: giftCardCode || '',
          total: total || '0',
          customerName: customerName || '',
          customerPhone: customerPhone || '',
          customerEmail: customerEmail || '',
          customerAddress: customerAddress || '',
          failedMethodType: selectedOption || '',
          failedSavedMethodId: selectedSavedCardId || '',
          failedIdealBank: idealBank || '',
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderMethodCard = (
    option: PaymentOption,
    onPress: () => void,
    selected: boolean,
  ) => (
    <TouchableOpacity
      style={[styles.methodCard, selected && styles.methodCardSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Ionicons
        name={METHOD_META[option].icon}
        size={22}
        color={selected ? Colors.primary : Colors.textSecondary}
      />
      <View style={styles.methodInfo}>
        <Text style={[styles.methodLabel, selected && styles.methodLabelSelected]}>
          {METHOD_META[option].label}
        </Text>
        <Text style={styles.methodDescription}>{METHOD_META[option].description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>${parsedTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.customerCard}>
          <Text style={styles.customerTitle}>Billing Contact</Text>
          <Text style={styles.customerText}>{customerName || 'Customer'}</Text>
          <Text style={styles.customerText}>{customerEmail || 'No email provided'}</Text>
          {!!customerPhone && <Text style={styles.customerText}>{customerPhone}</Text>}
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {loadingMethods ? (
          <View style={styles.loadingMethodsCard}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingMethodsText}>Loading saved payment methods…</Text>
          </View>
        ) : (
          <>
            {hasSavedCards && (
              <View style={styles.cardGroup}>
                <Text style={styles.groupTitle}>Saved Cards</Text>
                {savedCards.map((method) => {
                  const isSelected = selectedOption === 'saved_card' && selectedSavedCardId === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[styles.savedCardRow, isSelected && styles.savedCardRowSelected]}
                      activeOpacity={0.75}
                      onPress={() => {
                        setSelectedOption('saved_card');
                        setSelectedSavedCardId(method.id);
                      }}
                    >
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.methodInfo}>
                        <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                          {method.label}
                        </Text>
                        <Text style={styles.methodDescription}>
                          {method.last_four ? `•••• ${method.last_four}` : 'Saved card'}
                          {method.is_default ? ' • Default' : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {!hasSavedCards && (
              <View style={styles.emptySavedCardNotice}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.emptySavedCardText}>No saved cards yet. Use New Card to continue.</Text>
              </View>
            )}

            {renderMethodCard('new_card', () => setSelectedOption('new_card'), selectedOption === 'new_card')}
            {renderMethodCard('ideal', () => setSelectedOption('ideal'), selectedOption === 'ideal')}
          </>
        )}

        {requiresCardDetails && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Card Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Card number"
              placeholderTextColor={Colors.textLight}
              value={cardNumber}
              onChangeText={(value) => setCardNumber(formatCardNumber(value))}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Card holder name"
              placeholderTextColor={Colors.textLight}
              value={cardName}
              onChangeText={setCardName}
            />
            <View style={styles.inlineFields}>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="MM/YY"
                placeholderTextColor={Colors.textLight}
                value={cardExpiry}
                onChangeText={(value) => setCardExpiry(formatExpiry(value))}
                keyboardType="number-pad"
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="CVV"
                placeholderTextColor={Colors.textLight}
                value={cardCvv}
                onChangeText={(value) => setCardCvv(value.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
              />
            </View>
            <View style={styles.saveCardRow}>
              <Text style={styles.saveCardText}>Save this card for future payments</Text>
              <Switch
                value={saveCardForLater}
                onValueChange={setSaveCardForLater}
                trackColor={{ true: Colors.primary, false: Colors.border }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        )}

        {requiresIdealBank && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Select your bank</Text>
            <View style={styles.bankChips}>
              {IDEAL_BANKS.map((bank) => {
                const selected = idealBank === bank;
                return (
                  <TouchableOpacity
                    key={bank}
                    style={[styles.bankChip, selected && styles.bankChipSelected]}
                    onPress={() => setIdealBank(bank)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.bankChipText, selected && styles.bankChipTextSelected]}>
                      {bank}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payButton, (!selectedOption || processing) && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={!selectedOption || processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={Colors.white} />
              <Text style={styles.payButtonText}>Pay ${parsedTotal.toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  totalCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  totalLabel: { ...Fonts.medium, color: Colors.textSecondary },
  totalValue: { ...Fonts.h1, color: Colors.primary, marginTop: Spacing.xs },
  customerCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  customerTitle: { ...Fonts.bold, fontSize: 15, marginBottom: 6 },
  customerText: { ...Fonts.caption, fontSize: 13 },
  sectionTitle: {
    ...Fonts.h3,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  loadingMethodsCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingMethodsText: { ...Fonts.caption, fontSize: 13 },
  cardGroup: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.sm,
  },
  groupTitle: {
    ...Fonts.bold,
    fontSize: 14,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  savedCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  savedCardRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.selectedSurface,
  },
  emptySavedCardNotice: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptySavedCardText: { ...Fonts.caption, fontSize: 13 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  methodCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.selectedSurface },
  methodInfo: { flex: 1, marginLeft: Spacing.sm },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  radioSelected: { borderColor: Colors.primary },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  methodLabel: { ...Fonts.bold, fontSize: 16 },
  methodLabelSelected: { color: Colors.primary },
  methodDescription: { ...Fonts.caption, marginTop: Spacing.xs },
  formCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  formTitle: { ...Fonts.bold, fontSize: 15, marginBottom: Spacing.sm },
  input: {
    minHeight: ComponentSizes.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
    marginBottom: Spacing.sm,
    ...Fonts.regular,
  },
  inlineFields: { flexDirection: 'row', gap: Spacing.sm },
  inlineInput: { flex: 1 },
  saveCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  saveCardText: { ...Fonts.caption, fontSize: 13, flex: 1, marginRight: Spacing.sm },
  bankChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  bankChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  bankChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.selectedSurface,
  },
  bankChipText: { ...Fonts.caption, fontSize: 13, color: Colors.textSecondary },
  bankChipTextSelected: { color: Colors.primary, fontFamily: Fonts.bold.fontFamily },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  payButton: {
    minHeight: ComponentSizes.buttonHeightMd,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payButtonDisabled: { opacity: 0.5 },
  payButtonText: { ...Fonts.bold, color: Colors.white, fontSize: 16 },
});
