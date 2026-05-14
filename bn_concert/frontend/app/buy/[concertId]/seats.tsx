import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
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
} from '../../../src/components/BuyFlowScaffold';
import { BorderRadius, Colors, Fonts, Spacing, Breakpoints, Layout } from '../../../src/constants/theme';
import type { Concert, EventSeat } from '../../../src/types';

const MAX_SEATS = 6;

const MENU_ROWS = [
  { id: 'menu-contact', icon: 'call-outline', label: 'Contact us', route: '/dashboard/contact' },
  { id: 'menu-tickets', icon: 'ticket-outline', label: 'Tickets', route: '/(tabs)/tickets' },
  { id: 'menu-blog', icon: 'document-text-outline', label: 'Blog', route: '/(tabs)/blog' },
  { id: 'menu-language', icon: 'information-circle-outline', label: 'Language' },
];

export default function SeatsScreen() {
  const { concertId, sectionId, sectionName, sectionPrice } = useLocalSearchParams<{
    concertId: string;
    sectionId: string;
    sectionName: string;
    sectionPrice: string;
  }>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [seats, setSeats] = useState<EventSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const parsedSectionPrice = Number(sectionPrice || 0);

  useEffect(() => {
    if (!concertId || !sectionId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      concertApi.get(concertId),
      concertApi.getSectionSeats(concertId, sectionId),
    ])
      .then(([concertResult, seatsResult]) => {
        if (!isMounted) return;

        setConcert(concertResult.status === 'fulfilled' ? concertResult.value.data : null);
        setSeats(seatsResult.status === 'fulfilled' ? seatsResult.value.data : []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [concertId, sectionId]);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedIds.has(seat.id)),
    [seats, selectedIds],
  );

  const displayPrice = selectedSeats[0]?.price || parsedSectionPrice || 600;
  const selectedSeatLabels = selectedSeats.map((seat) => seat.seat?.label || '');

  const toggleSeat = (seatId: string) => {
    const seat = seats.find((item) => item.id === seatId);
    if (!seat || seat.status !== 'available') return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
        return next;
      }

      if (next.size >= MAX_SEATS) {
        Alert.alert('Limit reached', `You can select up to ${MAX_SEATS} seats.`);
        return prev;
      }

      next.add(seatId);
      return next;
    });
  };

  const goToConfirm = () => {
    if (selectedSeats.length === 0) return;

    router.push({
      pathname: `/buy/${concertId}/confirm`,
      params: {
        sectionId,
        sectionName,
        sectionPrice: String(parsedSectionPrice || displayPrice),
        seatIds: selectedSeats.map((seat) => seat.id).join(','),
        seatLabels: selectedSeatLabels.join(','),
        seatPrices: selectedSeats.map((seat) => String(seat.price)).join(','),
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
    <View style={styles.page}>
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

        <View style={[styles.contentWrapper, isDesktop ? styles.contentWrapperDesktop : null]}>
          <View style={styles.mainContent}>
            <BuyTicketDateCard
              concert={concert}
              quantity={selectedSeats.length || 2}
              price={displayPrice}
              onChangeDate={() => router.push(`/buy/${concertId}`)}
            />
            {!isDesktop ? <BuyStepper currentStep={2} /> : null}
            {!isDesktop ? <BuyPriceSlider price={displayPrice} /> : null}

            <View style={[styles.mapWrap, isDesktop ? styles.mapWrapDesktop : null]}>
              <FigmaSeatMap seats={seats} selectedIds={selectedIds} onToggleSeat={toggleSeat} />
            </View>

            {selectedSeats.length > 0 ? (
              <Text style={styles.selectionText}>
                {selectedSeats.length} selected: {selectedSeatLabels.filter(Boolean).join(', ')}
              </Text>
            ) : (
              <Text style={styles.selectionText}>Select your seats from the section plan</Text>
            )}

            <View style={[styles.actionRow, isDesktop ? styles.actionRowDesktop : null]}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push(`/buy/${concertId}`)}
                style={[styles.secondaryButton, isDesktop ? styles.secondaryButtonDesktop : null]}
              >
                <Text style={styles.secondaryButtonText}>Change date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={selectedSeats.length === 0}
                onPress={goToConfirm}
                style={[styles.primaryButton, selectedSeats.length === 0 && styles.primaryButtonDisabled, isDesktop ? styles.primaryButtonDesktop : null]}
              >
                <Text style={[styles.primaryButtonText, selectedSeats.length === 0 && styles.primaryButtonTextDisabled]}>
                  Buy Ticket
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footerWrapper}>
          <Footer containerStyle={styles.footer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    width: '100%',
  },
  content: {
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
  mainContent: {
    width: '100%',
  },
  center: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  page: {
    flex: 1,
    backgroundColor: Colors.white,
    width: '100%',
  },
  mapWrap: {
    marginTop: 8,
  },
  mapWrapDesktop: {
    marginTop: Spacing.xl,
    width: '100%',
  },
  selectionText: {
    ...Fonts.body10,
    color: Colors.textSecondary,
    lineHeight: 12,
    marginTop: 8,
    minHeight: 12,
    textAlign: 'center',
    width: '100%',
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  actionRowDesktop: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: Spacing.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: Colors.neutral700,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 97,
  },
  secondaryButtonDesktop: {
    minWidth: 140,
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
  primaryButtonDesktop: {
    minWidth: 180,
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
