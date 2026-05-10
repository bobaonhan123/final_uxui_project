import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { concertApi } from '../../../src/api/services';
import { Footer } from '../../../src/components';
import {
  BuyPriceSlider,
  BuyStepper,
  BuyTicketDateCard,
  FigmaSeatMap,
} from '../../../src/components/BuyFlowScaffold';
import { BorderRadius, Colors, Fonts, Spacing } from '../../../src/constants/theme';
import type { Concert, EventSeat } from '../../../src/types';

const MAX_SEATS = 6;

export default function SeatsScreen() {
  const { concertId, sectionId, sectionName, sectionPrice } = useLocalSearchParams<{
    concertId: string;
    sectionId: string;
    sectionName: string;
    sectionPrice: string;
  }>();
  const router = useRouter();
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BuyTicketDateCard
        concert={concert}
        quantity={selectedSeats.length || 2}
        price={displayPrice}
        onChangeDate={() => router.push(`/buy/${concertId}`)}
      />
      <BuyStepper currentStep={2} />
      <BuyPriceSlider price={displayPrice} />

      <View style={styles.mapWrap}>
        <FigmaSeatMap seats={seats} selectedIds={selectedIds} onToggleSeat={toggleSeat} />
      </View>

      {selectedSeats.length > 0 ? (
        <Text style={styles.selectionText}>
          {selectedSeats.length} selected: {selectedSeatLabels.filter(Boolean).join(', ')}
        </Text>
      ) : (
        <Text style={styles.selectionText}>Select your seats from the section plan</Text>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push(`/buy/${concertId}`)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Change date</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={selectedSeats.length === 0}
          onPress={goToConfirm}
          style={[styles.primaryButton, selectedSeats.length === 0 && styles.primaryButtonDisabled]}
        >
          <Text style={[styles.primaryButtonText, selectedSeats.length === 0 && styles.primaryButtonTextDisabled]}>
            Buy Ticket
          </Text>
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
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: Spacing.md,
    width: 360,
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
  selectionText: {
    ...Fonts.body10,
    alignSelf: 'center',
    color: Colors.textSecondary,
    lineHeight: 12,
    marginTop: 8,
    minHeight: 12,
    textAlign: 'center',
    width: 328,
  },
  actionRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: 328,
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
    marginHorizontal: -Spacing.md,
    marginTop: 48,
  },
});
