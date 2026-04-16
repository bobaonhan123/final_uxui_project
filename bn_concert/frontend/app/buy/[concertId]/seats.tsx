import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts, ComponentSizes } from '../../../src/constants/theme';
import { concertApi } from '../../../src/api/services';
import type { EventSeat } from '../../../src/types';

const MAX_SEATS = 6;
const SEAT_SIZE = ComponentSizes.seatSize;
const SEAT_GAP = Spacing.xs;

export default function SeatsScreen() {
  const { concertId, sectionId, sectionName, sectionPrice } = useLocalSearchParams<{
    concertId: string;
    sectionId: string;
    sectionName: string;
    sectionPrice: string;
  }>();
  const router = useRouter();
  const [seats, setSeats] = useState<EventSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!concertId || !sectionId) return;
    concertApi
      .getSectionSeats(concertId, sectionId)
      .then(({ data }) => setSeats(data))
      .finally(() => setLoading(false));
  }, [concertId, sectionId]);

  const rows = useMemo(() => {
    const grouped: Record<string, EventSeat[]> = {};
    seats.forEach((s) => {
      const row = s.seat?.row || '?';
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(s);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const toggleSeat = (seat: EventSeat) => {
    if (seat.status !== 'available') return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else {
        if (next.size >= MAX_SEATS) {
          Alert.alert('Limit Reached', `You can select up to ${MAX_SEATS} seats.`);
          return prev;
        }
        next.add(seat.id);
      }
      return next;
    });
  };

  const selectedSeats = seats.filter((s) => selectedIds.has(s.id));
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const minSeatPrice = seats.length ? Math.min(...seats.map((s) => s.price)) : 0;
  const maxSeatPrice = seats.length ? Math.max(...seats.map((s) => s.price)) : 0;

  const getSeatColor = (seat: EventSeat) => {
    if (selectedIds.has(seat.id)) return Colors.seatSelected;
    switch (seat.status) {
      case 'available': return Colors.seatAvailable;
      case 'sold': return Colors.seatSold;
      case 'held': return Colors.seatHeld;
      default: return Colors.border;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Info */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionName}>{sectionName}</Text>
        <Text style={styles.sectionPrice}>${Number(sectionPrice).toFixed(2)} / seat</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { color: Colors.seatAvailable, label: 'Available' },
          { color: Colors.seatSelected, label: 'Selected' },
          { color: Colors.seatSold, label: 'Sold' },
        ].map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Stage indicator */}
      <View style={styles.stageContainer}>
        <View style={styles.stage}>
          <Text style={styles.stageText}>STAGE</Text>
        </View>
      </View>

      <View style={styles.priceInfoRow}>
        <Text style={styles.priceInfoText}>Price range</Text>
        <Text style={styles.priceInfoValue}>${minSeatPrice.toFixed(0)} - ${maxSeatPrice.toFixed(0)}</Text>
      </View>

      {/* Seat Map */}
      <ScrollView style={styles.seatMap} contentContainerStyle={styles.seatMapContent} showsVerticalScrollIndicator={false}>
        {rows.map(([row, rowSeats]) => (
          <View key={row} style={styles.seatRow}>
            <Text style={styles.rowLabel}>{row}</Text>
            <View style={styles.seatsContainer}>
              {rowSeats
                .sort((a, b) => (a.seat?.number || 0) - (b.seat?.number || 0))
                .map((seat) => (
                  <TouchableOpacity
                    key={seat.id}
                    style={[styles.seat, { backgroundColor: getSeatColor(seat) }]}
                    onPress={() => toggleSeat(seat)}
                    activeOpacity={seat.status === 'available' ? 0.6 : 1}
                    disabled={seat.status !== 'available' && !selectedIds.has(seat.id)}
                  >
                    <Text style={styles.seatLabel}>{seat.seat?.number}</Text>
                  </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.rowLabel}>{row}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Selection Summary */}
      <View style={styles.bottomBar}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.resetButton}
            activeOpacity={0.8}
            onPress={() => setSelectedIds(new Set())}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectButton, selectedSeats.length === 0 && styles.selectButtonDisabled]}
            activeOpacity={0.8}
            disabled={selectedSeats.length === 0}
            onPress={() => {
              if (selectedSeats.length === 0) return;
              router.push({
                pathname: `/buy/${concertId}/confirm`,
                params: {
                  sectionId,
                  sectionName,
                  seatIds: selectedSeats.map((s) => s.id).join(','),
                  seatLabels: selectedSeats.map((s) => s.seat?.label || '').join(','),
                  seatPrices: selectedSeats.map((s) => String(s.price)).join(','),
                },
              });
            }}
          >
            <Text style={styles.selectText}>Select</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
          </Text>
          <Text style={styles.summaryTotal}>${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.continueButton, selectedSeats.length === 0 && styles.continueButtonDisabled]}
          onPress={() => {
            if (selectedSeats.length === 0) return;
            router.push({
              pathname: `/buy/${concertId}/confirm`,
              params: {
                sectionId,
                sectionName,
                seatIds: selectedSeats.map((s) => s.id).join(','),
                seatLabels: selectedSeats.map((s) => s.seat?.label || '').join(','),
                seatPrices: selectedSeats.map((s) => String(s.price)).join(','),
              },
            });
          }}
          disabled={selectedSeats.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  sectionName: { ...Fonts.bold, fontSize: 16 },
  sectionPrice: { ...Fonts.medium, color: Colors.primary },
  legend: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendLabel: { ...Fonts.caption, fontSize: 11 },
  priceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  priceInfoText: { ...Fonts.caption, color: Colors.textSecondary },
  priceInfoValue: { ...Fonts.bold, color: Colors.primary, fontSize: 14 },
  stageContainer: { alignItems: 'center', paddingVertical: Spacing.md },
  stage: {
    width: 200, paddingVertical: 8,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  stageText: { ...Fonts.caption, fontFamily: Fonts.bold.fontFamily, letterSpacing: 2 },
  seatMap: { flex: 1, paddingHorizontal: Spacing.md },
  seatRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: SEAT_GAP, justifyContent: 'center',
  },
  rowLabel: { width: 28, textAlign: 'center', ...Fonts.caption, fontFamily: Fonts.medium.fontFamily },
  seatsContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: SEAT_GAP, marginHorizontal: Spacing.sm,
  },
  seatMapContent: {
    paddingBottom: 160,
  },
  seat: {
    width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  seatLabel: { fontSize: 10, fontFamily: Fonts.bold.fontFamily, color: Colors.white },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: Spacing.md, paddingBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  resetButton: {
    flex: 1,
    minHeight: ComponentSizes.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  resetText: { ...Fonts.medium, color: Colors.text, fontSize: 14 },
  selectButton: {
    flex: 1,
    minHeight: ComponentSizes.inputHeight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  selectButtonDisabled: { opacity: 0.5 },
  selectText: { ...Fonts.bold, color: Colors.white, fontSize: 14 },
  summaryText: { ...Fonts.medium, color: Colors.textSecondary },
  summaryTotal: { ...Fonts.bold, fontSize: 20, color: Colors.primary },
  continueButton: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  continueButtonDisabled: { opacity: 0.5 },
  continueButtonText: { ...Fonts.bold, color: Colors.white, fontSize: 16 },
});
