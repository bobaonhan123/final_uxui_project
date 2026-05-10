import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, Colors, Fonts, Spacing } from '../constants/theme';
import type { Concert } from '../types';

const SEAT_MAP_IMAGE = require('../../assets/seat-section-map.png');

const STEP_LABELS = ['Location & date', 'Seat', 'Order Overview', 'Payment', 'Download'];
const PRICE_MARKS = [200, 300, 400, 500, 600, 700, 800];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDateParts(dateValue?: string) {
  const date = dateValue ? new Date(dateValue) : new Date();

  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric' }),
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export function formatMoney(value: number) {
  return `$${value.toFixed(0)}`;
}

export function BuyTicketDateCard({
  concert,
  quantity = 2,
  price,
  timeLeft = '06:34',
  onChangeDate,
}: {
  concert?: Concert | null;
  quantity?: number;
  price?: number;
  timeLeft?: string;
  onChangeDate: () => void;
}) {
  const dateParts = getDateParts(concert?.date);
  const venueLabel = concert?.venue?.city || concert?.venue?.name || 'New York';
  const displayPrice = typeof price === 'number' && !Number.isNaN(price) ? price : concert?.min_price ?? 400;

  return (
    <View style={styles.dateCard}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateText}>{dateParts.day}</Text>
        <Text style={styles.dateText}>{dateParts.month}</Text>
        <Text style={styles.dateText}>{dateParts.year}</Text>
        <View style={styles.dateCheck}>
          <Ionicons name="checkmark" size={12} color={Colors.white} />
        </View>
      </View>

      <View style={styles.ticketInfoCard}>
        <View style={styles.ticketCopy}>
          <Text numberOfLines={1} style={styles.ticketTitle}>
            {concert?.artist?.name || concert?.title || 'Taylor Swift'}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="ticket-outline" size={12} color={Colors.neutral700} />
            <Text numberOfLines={1} style={styles.metaText}>Quantity: {quantity}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="cash-outline" size={12} color={Colors.neutral700} />
            <Text numberOfLines={1} style={styles.metaText}>Price: {formatMoney(displayPrice)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.neutral700} />
            <Text numberOfLines={1} style={styles.metaText}>{dateParts.weekday} {dateParts.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={Colors.neutral700} />
            <Text numberOfLines={1} style={styles.metaText}>{venueLabel}</Text>
          </View>
        </View>

        <View style={styles.dateActions}>
          <View style={styles.timePill}>
            <Text style={styles.timeText}>Time left </Text>
            <Text style={styles.timeValue}>{timeLeft}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.75} onPress={onChangeDate} style={styles.changeDateButton}>
            <Text style={styles.changeDateText}>Change Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function BuyStepper({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.stepper}>
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, isComplete && styles.stepCircleDone, isCurrent && styles.stepCircleCurrent]}>
                {isComplete ? (
                  <Ionicons name="checkmark" size={11} color={Colors.white} />
                ) : (
                  <Text style={[styles.stepNumber, isCurrent && styles.stepNumberCurrent]}>{step}</Text>
                )}
              </View>
              <Text numberOfLines={2} style={styles.stepLabel}>{label}</Text>
            </View>
            {index < STEP_LABELS.length - 1 ? (
              <View style={[styles.stepLine, isComplete && styles.stepLineDone]} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export function BuyPriceSlider({ price }: { price: number }) {
  const normalizedPrice = clamp(price || 600, 200, 800);
  const progress = ((normalizedPrice - 200) / 600) * 100;

  return (
    <View style={styles.priceRange}>
      <View style={styles.sliderWrap}>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${progress}%` }]} />
          <View style={[styles.sliderThumb, { left: `${progress}%` }]} />
        </View>
      </View>
      <View style={styles.priceTooltip}>
        <Text style={styles.priceTooltipText}>Price {formatMoney(normalizedPrice)}</Text>
      </View>
      <View style={styles.priceMarks}>
        {PRICE_MARKS.map((mark) => (
          <Text key={mark} style={styles.priceMarkText}>{formatMoney(mark)}</Text>
        ))}
      </View>
    </View>
  );
}

export function FigmaSeatMap({
  seats,
  selectedIds,
  onToggleSeat,
  disabled = false,
}: {
  seats: Array<{ id: string; status: string; seat?: { row: string; number: number; label: string } | null }>;
  selectedIds: Set<string>;
  onToggleSeat?: (seatId: string) => void;
  disabled?: boolean;
}) {
  const { width } = useWindowDimensions();
  const mapWidth = clamp(width - 32, 300, 328);
  const scale = mapWidth / 328;
  const mapHeight = 193 * scale;

  const sortedRows = [...new Set(seats.map((item) => item.seat?.row).filter(Boolean) as string[])].sort();
  const rowIndexByName = new Map(sortedRows.map((row, index) => [row, index]));

  const positionSeat = (seat: { seat?: { row: string; number: number } | null }) => {
    const rowIndex = rowIndexByName.get(seat.seat?.row || '') ?? 0;
    const colIndex = Math.max((seat.seat?.number || 1) - 1, 0);
    const seatsPerRow = 20;
    const gridLeft = 30;
    const gridTop = 76;
    const gridWidth = 268;
    const gridHeight = 84;
    const seatWidth = 9;
    const seatHeight = 6;
    const xGap = (gridWidth - seatWidth) / Math.max(seatsPerRow - 1, 1);
    const yGap = (gridHeight - seatHeight) / Math.max(Math.max(sortedRows.length, 10) - 1, 1);

    return {
      left: (gridLeft + Math.min(colIndex, seatsPerRow - 1) * xGap) * scale,
      top: (gridTop + rowIndex * yGap) * scale,
      width: seatWidth * scale,
      height: seatHeight * scale,
    };
  };

  return (
    <View style={[styles.seatMap, { width: mapWidth, height: mapHeight }]}>
      <Image source={SEAT_MAP_IMAGE} resizeMode="stretch" style={[styles.seatMapImage, { width: mapWidth, height: mapHeight }]} />

      {seats.map((seat) => {
        const selected = selectedIds.has(seat.id);
        if (!selected && disabled) return null;

        const position = positionSeat(seat);

        return (
          <TouchableOpacity
            key={seat.id}
            activeOpacity={seat.status === 'available' ? 0.65 : 1}
            disabled={disabled || seat.status !== 'available'}
            hitSlop={6}
            onPress={() => onToggleSeat?.(seat.id)}
            style={[
              styles.seatHotspot,
              position,
              selected && styles.seatSelected,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dateCard: {
    alignSelf: 'center',
    flexDirection: 'row',
    height: 135,
    marginTop: Spacing.md,
    width: 328,
  },
  dateBlock: {
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    height: 135,
    justifyContent: 'center',
    paddingHorizontal: 12,
    width: 70,
  },
  dateText: {
    ...Fonts.body16,
    color: Colors.white,
    lineHeight: 18,
    textAlign: 'center',
  },
  dateCheck: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    marginTop: 6,
    width: 18,
  },
  ticketInfoCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: '#D1D1D7',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 135,
    justifyContent: 'space-between',
    marginLeft: -1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  ticketCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
    paddingRight: 6,
  },
  ticketTitle: {
    ...Fonts.medium,
    fontSize: 12,
    lineHeight: 14,
    marginBottom: 2,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  metaText: {
    ...Fonts.body10,
    color: Colors.neutral700,
    flexShrink: 1,
    lineHeight: 13,
  },
  dateActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 92,
    width: 98,
  },
  timePill: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  timeText: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 10,
  },
  timeValue: {
    ...Fonts.body10,
    color: Colors.error,
    lineHeight: 10,
  },
  changeDateButton: {
    alignItems: 'center',
    borderColor: Colors.neutral700,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 97,
  },
  changeDateText: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 12,
  },
  stepper: {
    alignItems: 'flex-start',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    width: 328,
  },
  stepItem: {
    alignItems: 'center',
    width: 48,
  },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    marginBottom: 5,
    width: 16,
  },
  stepCircleDone: {
    backgroundColor: Colors.primary,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.border,
  },
  stepNumber: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 10,
  },
  stepNumberCurrent: {
    color: Colors.white,
  },
  stepLabel: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 10,
    textAlign: 'center',
  },
  stepLine: {
    backgroundColor: Colors.borderMedium,
    height: 1,
    marginHorizontal: -2,
    marginTop: 8,
    width: 25,
  },
  stepLineDone: {
    backgroundColor: Colors.primary,
  },
  priceRange: {
    alignSelf: 'center',
    marginTop: 18,
    minHeight: 65,
    width: 328,
  },
  sliderWrap: {
    height: 22,
    justifyContent: 'center',
  },
  sliderTrack: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    height: 4,
    position: 'relative',
  },
  sliderFill: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.full,
    height: 4,
  },
  sliderThumb: {
    backgroundColor: Colors.white,
    borderColor: Colors.secondary,
    borderRadius: 11,
    borderWidth: 4,
    height: 22,
    marginLeft: -11,
    marginTop: -9,
    position: 'absolute',
    top: 0,
    width: 22,
  },
  priceTooltip: {
    alignItems: 'center',
    height: 16,
  },
  priceTooltipText: {
    ...Fonts.body10,
    color: Colors.secondary,
    lineHeight: 12,
  },
  priceMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  priceMarkText: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 12,
  },
  seatMap: {
    alignSelf: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  seatMapImage: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  seatHotspot: {
    backgroundColor: 'transparent',
    borderRadius: 2,
    position: 'absolute',
  },
  seatSelected: {
    backgroundColor: Colors.primary,
  },
});
