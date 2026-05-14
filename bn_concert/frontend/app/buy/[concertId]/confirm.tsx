import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { concertApi } from '../../../src/api/services';
import { Footer } from '../../../src/components';
import Header from '../../../src/components/Header';
import { useAuth } from '../../../src/context/AuthContext';
import {
  BuyPriceSlider,
  BuyStepper,
  BuyTicketDateCard,
  FigmaSeatMap,
  formatMoney,
} from '../../../src/components/BuyFlowScaffold';
import { BorderRadius, Colors, Fonts, Spacing, Breakpoints, Layout } from '../../../src/constants/theme';
const MENU_ROWS = [
  { id: 'menu-contact', icon: 'call-outline', label: 'Contact us', route: '/dashboard/contact' },
  { id: 'menu-tickets', icon: 'ticket-outline', label: 'Tickets', route: '/(tabs)/tickets' },
  { id: 'menu-blog', icon: 'document-text-outline', label: 'Blog', route: '/(tabs)/blog' },
  { id: 'menu-language', icon: 'information-circle-outline', label: 'Language' },
];
import type { Concert, EventSeat } from '../../../src/types';

export default function ConfirmScreen() {
  const {
    concertId,
    sectionId,
    sectionName,
    sectionPrice,
    seatIds,
    seatLabels,
    seatPrices,
  } = useLocalSearchParams<{
    concertId: string;
    sectionId?: string;
    sectionName: string;
    sectionPrice?: string;
    seatIds: string;
    seatLabels: string;
    seatPrices: string;
  }>();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;

  const { isAuthenticated } = useAuth();

  const ids = useMemo(() => seatIds?.split(',').filter(Boolean) || [], [seatIds]);
  const labels = useMemo(() => seatLabels?.split(',') || [], [seatLabels]);
  const prices = useMemo(() => seatPrices?.split(',').map(Number) || [], [seatPrices]);

  const [concert, setConcert] = useState<Concert | null>(null);
  const [seats, setSeats] = useState<EventSeat[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(ids));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedIds(new Set(ids));
  }, [ids]);

  useEffect(() => {
    if (!concertId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const requests: Promise<unknown>[] = [concertApi.get(concertId)];
    if (sectionId) {
      requests.push(concertApi.getSectionSeats(concertId, sectionId));
    }

    Promise.allSettled(requests)
      .then(([concertResult, seatsResult]) => {
        if (!isMounted) return;

        if (concertResult.status === 'fulfilled') {
          setConcert((concertResult.value as Awaited<ReturnType<typeof concertApi.get>>).data);
        }

        if (seatsResult?.status === 'fulfilled') {
          setSeats((seatsResult.value as Awaited<ReturnType<typeof concertApi.getSectionSeats>>).data);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [concertId, sectionId]);

  const ticketItems = ids
    .map((id, index) => ({
      id,
      label: labels[index] || `Seat ${index + 1}`,
      price: Number.isFinite(prices[index]) ? prices[index] : Number(sectionPrice || 0),
    }))
    .filter((item) => selectedIds.has(item.id));

  const subtotal = ticketItems.reduce((sum, item) => sum + item.price, 0);
  const displayPrice = ticketItems[0]?.price || Number(sectionPrice || 600);

  const removeSeat = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const goToPayment = () => {
    if (ticketItems.length === 0) return;

    router.push({
      pathname: `/buy/${concertId}/payment`,
      params: {
        sectionId: sectionId || '',
        sectionName,
        sectionPrice: String(sectionPrice || displayPrice),
        seatIds: ticketItems.map((item) => item.id).join(','),
        seatLabels: ticketItems.map((item) => item.label).join(','),
        seatPrices: ticketItems.map((item) => String(item.price)).join(','),
        total: String(subtotal),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {isDesktop ? (
        <View style={styles.headerFullWidth}>
          <Header
            containerStyle={{ maxWidth: Layout.maxContentWidth, alignSelf: 'center' }}
            isDesktop={isDesktop}
            isAuthenticated={isAuthenticated}
            menuRows={MENU_ROWS}
            onMenuRowPress={(row) => row.route ? router.push(row.route) : undefined}
            onMenuPress={() => {}}
            showSearch={'inline'}
            searchPlaceholder={'Search here'}
            onProfilePress={() => router.push('/(tabs)/profile')}
            onLoginPress={() => router.push('/(auth)/login')}
          />
        </View>
      ) : null}
      <View style={[styles.contentWrapper, isDesktop ? styles.contentWrapperDesktop : styles.contentWrapperMobile]}>
        <BuyTicketDateCard
          concert={concert}
          quantity={ticketItems.length || 2}
          price={displayPrice}
          onChangeDate={() => router.push(`/buy/${concertId}`)}
        />
        {!isDesktop ? <BuyStepper currentStep={3} /> : null}
        {!isDesktop ? <BuyPriceSlider price={displayPrice} /> : null}

        <View style={styles.mapWrap}>
          <FigmaSeatMap seats={seats} selectedIds={selectedIds} disabled />
        </View>

        {isDesktop ? (
          <View style={styles.controlsRow}>
            <View style={styles.ticketListDesktop}>
              {ticketItems.map((item, index) => (
                <View key={item.id} style={styles.ticketRow}>
                  <View style={styles.ticketIndex}>
                    <Text style={styles.ticketIndexText}>{index + 1}</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.ticketText}>
                    {sectionName}, {item.label} - {formatMoney(item.price)}
                  </Text>
                  <TouchableOpacity hitSlop={8} onPress={() => removeSeat(item.id)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.borderMedium} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.desktopButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => router.replace(`/buy/${concertId}/section`)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Change section</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.continueWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={ticketItems.length === 0}
                onPress={goToPayment}
                style={[styles.primaryButton, ticketItems.length === 0 && styles.primaryButtonDisabled]}
              >
                <Text style={[styles.primaryButtonText, ticketItems.length === 0 && styles.primaryButtonTextDisabled]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.ticketList}>
              {ticketItems.map((item, index) => (
                <View key={item.id} style={styles.ticketRow}>
                  <View style={styles.ticketIndex}>
                    <Text style={styles.ticketIndexText}>{index + 1}</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.ticketText}>
                    {sectionName}, {item.label} - {formatMoney(item.price)}
                  </Text>
                  <TouchableOpacity hitSlop={8} onPress={() => removeSeat(item.id)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.borderMedium} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.replace(`/buy/${concertId}/section`)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Change section</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={ticketItems.length === 0}
                onPress={goToPayment}
                style={[styles.primaryButton, ticketItems.length === 0 && styles.primaryButtonDisabled]}
              >
                <Text style={[styles.primaryButtonText, ticketItems.length === 0 && styles.primaryButtonTextDisabled]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={styles.footerWrapper}>
        <Footer containerStyle={styles.footer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    paddingTop: Spacing.md,
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  contentWrapperDesktop: {
    paddingHorizontal: 0,
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
  contentWrapperMobile: {
    alignSelf: 'center',
    maxWidth: 430,
    paddingHorizontal: Spacing.md,
  },
  center: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  mapWrap: {
    marginTop: 8,
  },
  ticketList: {
    alignSelf: 'center',
    gap: Spacing.sm,
    marginTop: 16,
    width: 328,
  },
  ticketRow: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 33,
    paddingHorizontal: Spacing.sm,
  },
  ticketIndex: {
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    width: 16,
  },
  ticketIndexText: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 12,
  },
  ticketText: {
    ...Fonts.body12,
    color: Colors.neutral700,
    flex: 1,
    lineHeight: 17,
  },
  actionRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    width: 328,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.md,
  },
  ticketListDesktop: {
    width: 430,
    gap: Spacing.sm,
  },
  desktopButtonsRow: {
    marginTop: Spacing.sm,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 328,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: Colors.neutral700,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 121,
  },
  secondaryButtonText: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 32,
    justifyContent: 'center',
    width: 97,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  primaryButtonText: {
    ...Fonts.button12,
    color: Colors.white,
  },
  primaryButtonTextDisabled: {
    color: Colors.textLight,
  },
  footer: {
    width: '100%',
    marginTop: 48,
  },
  footerWrapper: {
    width: '100%',
  },
  headerFullWidth: {
    width: '100%',
    backgroundColor: Colors.white,
  },
});
