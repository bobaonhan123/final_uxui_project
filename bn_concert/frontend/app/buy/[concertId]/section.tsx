import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { concertApi } from '../../../src/api/services';
import { Footer, LoadingScreen } from '../../../src/components';
import StadiumSectionMap from '../../../src/components/StadiumSectionMap';
import { BorderRadius, Colors, Fonts, Spacing } from '../../../src/constants/theme';
import type { Concert, Section } from '../../../src/types';

const HOLD_TIME_LABEL = '14:59';

function getDateParts(dateValue: string) {
  const date = new Date(dateValue);

  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric' }),
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

function formatPrice(value: number) {
  return `$${value.toFixed(0)}`;
}

export default function SectionSelectionScreen() {
  const { concertId } = useLocalSearchParams<{ concertId: string }>();
  const router = useRouter();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!concertId) {
      setLoading(false);
      return;
    }

    Promise.all([concertApi.get(concertId), concertApi.getSections(concertId)])
      .then(([concertRes, sectionsRes]) => {
        setConcert(concertRes.data);
        setSections(sectionsRes.data);
        setSelectedSectionId(null);
      })
      .finally(() => setLoading(false));
  }, [concertId]);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? null,
    [sections, selectedSectionId],
  );

  const priceRange = useMemo(() => {
    if (sections.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = sections.map((section) => section.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [sections]);

  const selectedPrice = selectedSection?.price ?? priceRange.min;
  const rangeSpan = Math.max(priceRange.max - priceRange.min, 1);
  const priceProgress = Math.min(Math.max((selectedPrice - priceRange.min) / rangeSpan, 0), 1);

  if (loading) return <LoadingScreen />;

  if (!concert || sections.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No sections available</Text>
        <Text style={styles.emptySubtitle}>Please try another concert date.</Text>
      </View>
    );
  }

  const dateParts = getDateParts(concert.date);
  const venueLabel = concert.venue?.city || concert.venue?.name || 'New York';
  const canContinue = !!selectedSection && selectedSection.available_count > 0;

  const goToSeats = () => {
    if (!canContinue || !selectedSection) return;

    router.push({
      pathname: `/buy/${concertId}/seats`,
      params: {
        sectionId: selectedSection.id,
        sectionName: selectedSection.name,
        sectionPrice: String(selectedSection.price),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.dateCard}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateText}>{dateParts.day}</Text>
          <Text style={styles.dateText}>{dateParts.month}</Text>
          <Text style={styles.dateText}>{dateParts.year}</Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketCopy}>
            <Text numberOfLines={2} style={styles.ticketTitle}>{concert.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color={Colors.neutral700} />
              <Text numberOfLines={1} style={styles.metaText}>Time left: {HOLD_TIME_LABEL}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.neutral700} />
              <Text numberOfLines={1} style={styles.metaText}>{dateParts.weekday} {dateParts.time}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={18} color={Colors.neutral700} />
              <Text numberOfLines={1} style={styles.metaText}>{venueLabel}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push(`/buy/${concertId}`)}
            style={styles.changeButton}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stepper}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleDone]}>
            <Ionicons name="checkmark" size={16} color={Colors.white} />
          </View>
          <Text style={styles.stepLabel}>Location & date</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Seat</Text>
        </View>
      </View>

      <View style={styles.pricePanel}>
        <View style={styles.priceHeader}>
          <Text style={styles.priceTitle}>Price Range</Text>
          <Text style={styles.priceValue}>
            {selectedSection ? formatPrice(selectedSection.price) : `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`}
          </Text>
        </View>

        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${priceProgress * 100}%` }]} />
          <View style={[styles.sliderThumb, { left: `${priceProgress * 100}%` }]} />
        </View>

        <View style={styles.priceTicks}>
          <Text style={styles.priceTickText}>{formatPrice(priceRange.min)}</Text>
          <Text style={styles.priceTickText}>{formatPrice(priceRange.max)}</Text>
        </View>
      </View>

      <StadiumSectionMap
        sections={sections}
        selectedSectionId={selectedSectionId}
        onSelectSection={setSelectedSectionId}
      />

      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push(`/buy/${concertId}`)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Change Date</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!canContinue}
          onPress={goToSeats}
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
        >
          <Text style={[styles.primaryButtonText, !canContinue && styles.primaryButtonTextDisabled]}>
            Continue
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
    alignSelf: 'center',
    maxWidth: 430,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    width: '100%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
  },
  emptyTitle: {
    ...Fonts.h3,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Fonts.caption,
    textAlign: 'center',
  },
  dateCard: {
    flexDirection: 'row',
    height: 135,
    marginBottom: 24,
    width: '100%',
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
  ticketCard: {
    alignItems: 'flex-end',
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
    paddingBottom: 14,
    paddingLeft: 20,
    paddingRight: 14,
    paddingTop: 14,
  },
  ticketCopy: {
    flex: 1,
    flexShrink: 1,
    gap: 5,
    minWidth: 0,
    paddingRight: Spacing.sm,
  },
  ticketTitle: {
    ...Fonts.medium,
    fontSize: 14,
    lineHeight: 14,
    marginBottom: 2,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metaText: {
    ...Fonts.body12,
    color: Colors.neutral700,
    flexShrink: 1,
    lineHeight: 14,
  },
  changeButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    width: 82,
  },
  changeButtonText: {
    ...Fonts.button14,
    color: Colors.white,
  },
  stepper: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 26,
  },
  stepItem: {
    alignItems: 'center',
    minWidth: 92,
  },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    marginBottom: 4,
    width: 20,
  },
  stepCircleDone: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    ...Fonts.body12,
    color: Colors.neutral700,
    fontSize: 11,
    lineHeight: 12,
  },
  stepLabel: {
    ...Fonts.body12,
    color: Colors.neutral700,
    textAlign: 'center',
  },
  stepLine: {
    backgroundColor: Colors.primary,
    height: 1,
    marginTop: 10,
    width: 84,
  },
  pricePanel: {
    marginBottom: 26,
  },
  priceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  priceTitle: {
    ...Fonts.heading16,
    color: Colors.text,
  },
  priceValue: {
    ...Fonts.body12,
    color: Colors.neutral700,
  },
  sliderTrack: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    height: 4,
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderFill: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 4,
  },
  sliderThumb: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderWidth: 3,
    height: 16,
    marginLeft: -8,
    marginTop: -6,
    position: 'absolute',
    top: 0,
    width: 16,
  },
  priceTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  priceTickText: {
    ...Fonts.body12,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    marginRight: Spacing.md,
    minWidth: 0,
  },
  secondaryButtonText: {
    ...Fonts.button14,
    color: Colors.primary,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    minWidth: 0,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  primaryButtonText: {
    ...Fonts.button14,
    color: Colors.white,
  },
  primaryButtonTextDisabled: {
    color: Colors.textLight,
  },
  footer: {
    marginHorizontal: -Spacing.md,
    marginTop: 60,
  },
});
