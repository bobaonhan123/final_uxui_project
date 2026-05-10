import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { giftCardApi, orderApi, userApi, type PaymentOption } from '../../../src/api/services';
import { Footer } from '../../../src/components';
import {
  BuyStepper,
  BuyTicketDateCard,
  formatMoney,
} from '../../../src/components/BuyFlowScaffold';
import { BorderRadius, Colors, Fonts, Spacing } from '../../../src/constants/theme';
import type { Concert, PaymentMethod } from '../../../src/types';
import { concertApi } from '../../../src/api/services';

const INSURANCE_RATE = 0.05;
const PAYMENT_BRANDS = ['AMEX', 'VISA', 'Revolut', 'MC', 'PayPal', 'Maestro'] as const;
const IDEAL_BANKS = ['ING', 'Rabobank', 'ABN AMRO', 'SNS Bank'];

export default function PaymentScreen() {
  const {
    concertId,
    seatIds,
    seatLabels,
    seatPrices,
    total,
    customerName: initialCustomerName,
    customerPhone: initialCustomerPhone,
    customerEmail: initialCustomerEmail,
    customerAddress: initialCustomerAddress,
    orderId,
    failedMethodType,
    failedSavedMethodId,
    failedIdealBank,
    resetMethod,
  } = useLocalSearchParams<{
    concertId: string;
    seatIds: string;
    seatLabels?: string;
    seatPrices?: string;
    total?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    orderId?: string;
    failedMethodType?: PaymentOption;
    failedSavedMethodId?: string;
    failedIdealBank?: string;
    resetMethod?: string;
  }>();
  const router = useRouter();

  const normalizedSeatIds = useMemo(
    () => seatIds?.split(',').filter(Boolean) ?? [],
    [seatIds],
  );
  const labels = useMemo(() => seatLabels?.split(',').filter(Boolean) ?? [], [seatLabels]);
  const prices = useMemo(() => seatPrices?.split(',').map(Number).filter((value) => !Number.isNaN(value)) ?? [], [seatPrices]);

  const [concert, setConcert] = useState<Concert | null>(null);
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [insurance, setInsurance] = useState(false);
  const [useGiftCard, setUseGiftCard] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [applyingGiftCard, setApplyingGiftCard] = useState(false);
  const [appliedGiftCardBalance, setAppliedGiftCardBalance] = useState<number | null>(null);

  const [customerName, setCustomerName] = useState(initialCustomerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail || '');
  const [customerAddress, setCustomerAddress] = useState(initialCustomerAddress || '');

  const [cardNumber, setCardNumber] = useState('4502 - 4556 - 1975 - 2302');
  const [cardName, setCardName] = useState(initialCustomerName || 'Sylvie Van Beek');
  const [cardExpiry, setCardExpiry] = useState('21/08');
  const [cardCvv, setCardCvv] = useState('5879');
  const [idealBank, setIdealBank] = useState(failedIdealBank || '');

  const hasSavedCards = savedCards.length > 0;
  const requiresCardDetails = selectedOption === 'new_card';
  const requiresIdealBank = selectedOption === 'ideal';
  const subtotal = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) : Number(total || 0);
  const insuranceFee = insurance ? subtotal * INSURANCE_RATE : 0;
  const giftCardDiscount = appliedGiftCardBalance !== null
    ? Math.min(appliedGiftCardBalance, subtotal + insuranceFee)
    : 0;
  const finalTotal = Math.max(0, subtotal + insuranceFee - giftCardDiscount);
  const displayPrice = prices[0] || subtotal || 600;
  const normalizedGiftCardCode = giftCardCode.trim().toUpperCase();

  useEffect(() => {
    if (!concertId) return;
    concertApi.get(concertId).then(({ data }) => setConcert(data)).catch(() => setConcert(null));
  }, [concertId]);

  useEffect(() => {
    userApi
      .getMe()
      .then(({ data }) => {
        if (!initialCustomerName) {
          const fullName = `${data.first_name} ${data.last_name}`.trim();
          setCustomerName(fullName);
          setCardName(fullName);
        }
        if (!initialCustomerPhone) setCustomerPhone(data.phone || '');
        if (!initialCustomerEmail) setCustomerEmail(data.email || '');
        if (!initialCustomerAddress) {
          setCustomerAddress([data.address, data.city, data.country].filter(Boolean).join(', '));
        }
      })
      .catch(() => undefined);
  }, [initialCustomerAddress, initialCustomerEmail, initialCustomerName, initialCustomerPhone]);

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
        if (!failedMethodType) setSelectedOption('new_card');
      })
      .finally(() => setLoadingMethods(false));
  }, [failedMethodType, failedSavedMethodId, resetMethod]);

  const validateCardForm = () => {
    const normalizedCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(normalizedCardNumber)) {
      Alert.alert('Invalid card', 'Please enter a valid card number.');
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert('Invalid card', 'Please enter the card holder name.');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      Alert.alert('Invalid card', 'Please enter expiry in MM/YY format.');
      return false;
    }
    if (!/^\d{3,4}$/.test(cardCvv.trim())) {
      Alert.alert('Invalid card', 'Please enter a valid CVV.');
      return false;
    }
    return true;
  };

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, '')
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, '$1 - ')
      .trim();

  const formatExpiry = (value: string) => {
    const normalized = value.replace(/\D/g, '').slice(0, 4);
    if (normalized.length <= 2) return normalized;
    return `${normalized.slice(0, 2)} / ${normalized.slice(2, 4)}`;
  };

  const handleApplyGiftCard = async () => {
    if (!normalizedGiftCardCode) return;

    setApplyingGiftCard(true);
    try {
      const { data } = await giftCardApi.redeem(normalizedGiftCardCode);
      setGiftCardCode(normalizedGiftCardCode);
      setAppliedGiftCardBalance(data.current_balance);
    } catch (err: unknown) {
      setAppliedGiftCardBalance(null);
      const error = err as { response?: { data?: { detail?: string } } };
      Alert.alert('Gift card error', error.response?.data?.detail || 'Invalid or inactive gift card code.');
    } finally {
      setApplyingGiftCard(false);
    }
  };

  const handlePay = async () => {
    if (!concertId || !selectedOption) return;
    if (selectedOption === 'saved_card' && !selectedSavedCardId) {
      Alert.alert('Select card', 'Please choose one of your saved cards.');
      return;
    }
    if (requiresCardDetails && !validateCardForm()) return;
    if (requiresIdealBank && !idealBank.trim()) {
      Alert.alert('Select bank', 'Please choose your iDeal bank.');
      return;
    }
    if (!orderId && normalizedSeatIds.length === 0) {
      Alert.alert('No seats selected', 'Please go back and select at least one seat.');
      return;
    }

    setProcessing(true);
    let activeOrderId = orderId;

    try {
      if (!activeOrderId) {
        const { data: order } = await orderApi.create({
          concert_id: concertId,
          items: normalizedSeatIds.map((id) => ({ event_seat_id: id })),
          insurance,
          gift_card_code: appliedGiftCardBalance !== null ? normalizedGiftCardCode : undefined,
          payment_method: selectedOption,
          customer_name: customerName.trim() || undefined,
          customer_phone: customerPhone.trim() || undefined,
          customer_email: customerEmail.trim() || undefined,
          customer_address: customerAddress.trim() || undefined,
        });
        activeOrderId = order.id;
      }

      if (!activeOrderId) throw new Error('Unable to create order');

      if (selectedOption === 'saved_card') {
        await orderApi.pay(activeOrderId, {
          payment_option: 'saved_card',
          saved_payment_method_id: selectedSavedCardId ?? undefined,
        });
      } else if (selectedOption === 'new_card') {
        await orderApi.pay(activeOrderId, {
          payment_option: 'new_card',
          card_number: cardNumber.replace(/\D/g, ''),
          card_holder_name: cardName.trim(),
          card_expiry: cardExpiry.replace(/\s/g, ''),
          card_cvv: cardCvv.trim(),
          save_new_card: true,
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
      router.replace({
        pathname: `/buy/${concertId}/failed`,
        params: {
          error: error.response?.data?.detail || 'Payment failed. Please try again.',
          orderId: activeOrderId || '',
          seatIds: seatIds || '',
          seatLabels: seatLabels || '',
          seatPrices: seatPrices || '',
          total: String(finalTotal),
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BuyTicketDateCard
        concert={concert}
        quantity={normalizedSeatIds.length || 2}
        price={displayPrice}
        onChangeDate={() => router.push(`/buy/${concertId}`)}
      />
      <BuyStepper currentStep={4} />

      <View style={styles.checkoutPanel}>
        <View style={styles.infoBlock}>
          <View style={styles.infoTitleRow}>
            <Text style={styles.infoTitle}>1. Your Information</Text>
            <Ionicons name="create-outline" size={16} color={Colors.neutral700} />
          </View>
          <View style={styles.infoDetails}>
            <View style={styles.verticalLine} />
            <View style={styles.infoRows}>
              <InfoRow icon="person-circle-outline" text={customerName || 'Customer'} />
              <InfoRow icon="call-outline" text={customerPhone || '8023456789'} />
              <InfoRow icon="location-outline" text={customerAddress || 'Delftwegstraat 23, Delft, Netherlands'} />
              <InfoRow icon="mail-outline" text={customerEmail || 'sylvievanbeek@gmail.com'} />
            </View>
          </View>
        </View>

        <CheckRow
          label="Missed events insurance"
          selected={insurance}
          onPress={() => setInsurance((value) => !value)}
        />
        <CheckRow
          label="Use your gift card"
          selected={useGiftCard}
          onPress={() => setUseGiftCard((value) => !value)}
        />

        {useGiftCard ? (
          <View style={styles.giftCardRow}>
            <TextInput
              value={giftCardCode}
              onChangeText={(value) => {
                setGiftCardCode(value);
                setAppliedGiftCardBalance(null);
              }}
              autoCapitalize="characters"
              placeholder="Gift card code"
              placeholderTextColor={Colors.textLight}
              style={styles.giftCardInput}
            />
            <TouchableOpacity
              disabled={!normalizedGiftCardCode || applyingGiftCard}
              onPress={handleApplyGiftCard}
              style={[styles.applyButton, (!normalizedGiftCardCode || applyingGiftCard) && styles.applyButtonDisabled]}
            >
              {applyingGiftCard ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.applyText}>Apply</Text>}
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.paymentTitle}>2. Select your payment method</Text>

        <View style={styles.methodPanel}>
          <View style={styles.methodPanelHeader}>
            <Ionicons name="card-outline" size={24} color={Colors.neutral700} />
            <Text style={styles.methodPanelTitle}>Your last purchase methods</Text>
          </View>

          {loadingMethods ? (
            <ActivityIndicator color={Colors.primary} style={styles.methodLoader} />
          ) : hasSavedCards ? (
            <View style={styles.savedCards}>
              {savedCards.slice(0, 2).map((method) => {
                const selected = selectedOption === 'saved_card' && selectedSavedCardId === method.id;

                return (
                  <TouchableOpacity
                    key={method.id}
                    activeOpacity={0.75}
                    onPress={() => {
                      setSelectedOption('saved_card');
                      setSelectedSavedCardId(method.id);
                    }}
                    style={styles.savedCardOption}
                  >
                    <View style={[styles.miniCard, selected && styles.miniCardSelected]}>
                      <Text style={[styles.miniCardBrand, selected && styles.miniCardBrandSelected]}>VISA</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.savedCardName}>{method.label}</Text>
                    <Text style={styles.savedCardNumber}>{method.last_four ? `*** ${method.last_four}` : '*** 011'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noSavedText}>No saved cards yet.</Text>
          )}
        </View>

        <View style={styles.methodPanel}>
          <View style={styles.methodPanelHeader}>
            <Ionicons name="card-outline" size={24} color={Colors.neutral700} />
            <Text style={styles.methodPanelTitle}>Add a new method:</Text>
          </View>

          <View style={styles.brandGrid}>
            {PAYMENT_BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand}
                activeOpacity={0.75}
                onPress={() => setSelectedOption(brand === 'PayPal' ? 'ideal' : 'new_card')}
                style={[
                  styles.brandChip,
                  ((brand !== 'PayPal' && selectedOption === 'new_card') || (brand === 'PayPal' && selectedOption === 'ideal')) && styles.brandChipSelected,
                ]}
              >
                <Text style={styles.brandText}>{brand}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {requiresIdealBank ? (
            <View style={styles.bankGrid}>
              {IDEAL_BANKS.map((bank) => (
                <TouchableOpacity
                  key={bank}
                  activeOpacity={0.75}
                  onPress={() => setIdealBank(bank)}
                  style={[styles.bankChip, idealBank === bank && styles.bankChipSelected]}
                >
                  <Text style={[styles.bankText, idealBank === bank && styles.bankTextSelected]}>{bank}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.cardInfo}>
              <Field label="Card number" value={cardNumber} onChangeText={(value) => setCardNumber(formatCardNumber(value))} placeholder="4502 - 4556 - 1975 - 2302" keyboardType="number-pad" />
              <Field label="Card owner name" value={cardName} onChangeText={setCardName} placeholder="Sylvie Van Beek" />
              <Field label="Expiry date" value={cardExpiry} onChangeText={(value) => setCardExpiry(formatExpiry(value))} placeholder="21 - 08 - 2027" keyboardType="number-pad" />
              <Field label="CCV2" value={cardCvv} onChangeText={(value) => setCardCvv(value.replace(/\D/g, '').slice(0, 4))} placeholder="5879" keyboardType="number-pad" secureTextEntry />
            </View>
          )}
        </View>
      </View>

      <View style={styles.orderOverview}>
        <Text style={styles.overviewTitle}>Payment details</Text>
        <OverviewRow label="Order number" value="11458523" />
        <OverviewRow label={`Ticket price${labels[0] ? `: ${labels[0]}` : ''}`} value={formatMoney(displayPrice)} />
        <OverviewRow label="Booking fee" value={formatMoney(20)} />
        <OverviewRow label="Ticket insurance" value={insurance ? formatMoney(insuranceFee) : '$0'} />
        <OverviewRow label="Gift Card" value={giftCardDiscount > 0 ? `-${formatMoney(giftCardDiscount)}` : '$0'} />
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>Final price</Text>
          <Text style={styles.finalValue}>{formatMoney(finalTotal + 20)}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!selectedOption || processing}
          onPress={handlePay}
          style={[styles.payButton, (!selectedOption || processing) && styles.payButtonDisabled]}
        >
          {processing ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.payButtonText}>Submit & Pay</Text>}
        </TouchableOpacity>
      </View>

      <Footer containerStyle={styles.footer} />
    </ScrollView>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={Colors.neutral700} />
      <Text numberOfLines={1} style={styles.infoText}>{text}</Text>
    </View>
  );
}

function CheckRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.checkRow}>
      <Ionicons name={selected ? 'checkbox-outline' : 'square-outline'} size={16} color={Colors.success} />
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={styles.input}
        />
        <Ionicons name="create-outline" size={14} color={Colors.borderMedium} />
      </View>
    </View>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.overviewRow}>
      <Text numberOfLines={1} style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: Spacing.md,
    width: 360,
  },
  checkoutPanel: {
    alignSelf: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    marginTop: 24,
    padding: 12,
    width: 328,
  },
  infoBlock: {
    marginBottom: 20,
  },
  infoTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoTitle: {
    ...Fonts.h3,
    color: Colors.neutral700,
    fontSize: 16,
    lineHeight: 19,
  },
  infoDetails: {
    flexDirection: 'row',
  },
  verticalLine: {
    backgroundColor: Colors.borderMedium,
    marginRight: 8,
    width: 1,
  },
  infoRows: {
    flex: 1,
    gap: 12,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 24,
  },
  infoText: {
    ...Fonts.body12,
    color: Colors.neutral700,
    flex: 1,
    lineHeight: 16,
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    height: 28,
  },
  checkLabel: {
    ...Fonts.body12,
    color: Colors.neutral700,
    lineHeight: 16,
  },
  giftCardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  giftCardInput: {
    ...Fonts.body12,
    backgroundColor: Colors.white,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flex: 1,
    height: 36,
    paddingHorizontal: Spacing.sm,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 36,
    justifyContent: 'center',
    width: 70,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyText: {
    ...Fonts.button12,
    color: Colors.white,
  },
  paymentTitle: {
    ...Fonts.h3,
    color: Colors.neutral700,
    fontSize: 16,
    lineHeight: 19,
    marginTop: 24,
  },
  methodPanel: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    marginTop: 16,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  methodPanelHeader: {
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    flexDirection: 'row',
    gap: Spacing.sm,
    height: 44,
    paddingHorizontal: 10,
  },
  methodPanelTitle: {
    ...Fonts.body12,
    color: Colors.neutral700,
    lineHeight: 15,
  },
  methodLoader: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 12,
  },
  savedCards: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
  },
  savedCardOption: {
    width: 56,
  },
  miniCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.white,
    borderRadius: 5,
    borderWidth: 2,
    height: 39,
    justifyContent: 'center',
    width: 56,
  },
  miniCardSelected: {
    borderColor: Colors.primary,
  },
  miniCardBrand: {
    ...Fonts.body10,
    color: Colors.secondary,
  },
  miniCardBrandSelected: {
    color: Colors.primary,
  },
  savedCardName: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 16,
    marginTop: 6,
  },
  savedCardNumber: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 16,
  },
  noSavedText: {
    ...Fonts.body12,
    color: Colors.neutral700,
    paddingHorizontal: 16,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  brandChip: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.white,
    borderRadius: 5,
    borderWidth: 2,
    height: 35,
    justifyContent: 'center',
    width: 50,
  },
  brandChipSelected: {
    borderColor: Colors.primary,
  },
  brandText: {
    ...Fonts.body10,
    color: Colors.secondary,
    fontSize: 9,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  bankChip: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  bankChipSelected: {
    backgroundColor: Colors.selectedSurface,
    borderColor: Colors.primary,
  },
  bankText: {
    ...Fonts.body10,
    color: Colors.neutral700,
  },
  bankTextSelected: {
    color: Colors.primary,
  },
  cardInfo: {
    gap: 15,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 12,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 43,
    paddingHorizontal: Spacing.sm,
  },
  input: {
    ...Fonts.body12,
    color: Colors.neutral700,
    flex: 1,
    padding: 0,
  },
  orderOverview: {
    alignSelf: 'center',
    backgroundColor: Colors.neutral950,
    borderRadius: BorderRadius.md,
    marginTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    width: 328,
  },
  overviewTitle: {
    ...Fonts.h3,
    color: Colors.white,
    fontSize: 16,
    lineHeight: 19,
    marginBottom: 16,
  },
  overviewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  overviewLabel: {
    ...Fonts.body12,
    color: Colors.white,
    flex: 1,
    lineHeight: 15,
  },
  overviewValue: {
    ...Fonts.body12,
    color: Colors.white,
    lineHeight: 15,
    marginLeft: 12,
  },
  finalRow: {
    alignItems: 'center',
    borderTopColor: Colors.neutral700,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 18,
  },
  finalLabel: {
    ...Fonts.heading16,
    color: Colors.white,
  },
  finalValue: {
    ...Fonts.heading16,
    color: Colors.primary,
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 40,
    justifyContent: 'center',
    marginTop: 16,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    ...Fonts.button14,
    color: Colors.white,
  },
  footer: {
    marginHorizontal: -Spacing.md,
    marginTop: 48,
  },
});
