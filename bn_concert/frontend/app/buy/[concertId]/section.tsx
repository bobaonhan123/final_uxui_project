import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../../../src/constants/theme';
import { concertApi } from '../../../src/api/services';
import { LoadingScreen } from '../../../src/components';
import type { Concert, Section } from '../../../src/types';

const SECTION_CARD_WIDTH = 144;

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
        const firstAvailable = sectionsRes.data.find((section) => section.available_count > 0);
        if (firstAvailable) {
          setSelectedSectionId(firstAvailable.id);
        }
      })
      .finally(() => setLoading(false));
  }, [concertId]);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? null,
    [sections, selectedSectionId],
  );

  if (loading) return <LoadingScreen />;

  if (!concert || sections.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No sections available</Text>
        <Text style={styles.emptySubtitle}>Please try another concert date.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.concertHeader}>
          <Text style={styles.concertTitle}>{concert.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {new Date(concert.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          {concert.venue && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {concert.venue.name}, {concert.venue.city}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.sectionTitle}>Choose Section</Text>
          <Text style={styles.sectionSubtitle}>
            Select an area from the venue map. Sold out sections are disabled.
          </Text>

          <View style={styles.mapGrid}>
            {sections.map((section) => {
              const isSelected = section.id === selectedSectionId;
              const isSoldOut = section.available_count === 0;
              const sectionColor = section.color || Colors.primary;

              return (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    styles.sectionCard,
                    isSelected && styles.sectionCardSelected,
                    isSoldOut && styles.sectionCardDisabled,
                  ]}
                  activeOpacity={0.8}
                  disabled={isSoldOut}
                  onPress={() => setSelectedSectionId(section.id)}
                >
                  <View style={styles.sectionCardTop}>
                    <View style={[styles.colorDot, { backgroundColor: isSoldOut ? Colors.border : sectionColor }]} />
                    <Text style={styles.sectionName}>{section.name}</Text>
                  </View>
                  <Text style={styles.sectionAvailability}>
                    {section.available_count}/{section.total_count} seats available
                  </Text>
                  <Text style={styles.sectionPrice}>${section.price.toFixed(2)}</Text>
                  {isSoldOut && <Text style={styles.soldOutText}>Sold out</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {selectedSection ? (
          <Text style={styles.selectedInfo}>
            {selectedSection.name} • ${selectedSection.price.toFixed(2)} per seat
          </Text>
        ) : (
          <Text style={styles.selectedInfo}>Select a section to continue</Text>
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedSection || selectedSection.available_count === 0) && styles.continueButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={!selectedSection || selectedSection.available_count === 0}
          onPress={() => {
            if (!selectedSection) return;
            router.push({
              pathname: `/buy/${concertId}/seats`,
              params: {
                sectionId: selectedSection.id,
                sectionName: selectedSection.name,
                sectionPrice: String(selectedSection.price),
              },
            });
          }}
        >
          <Text style={styles.continueButtonText}>Continue to Seats</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 140 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  emptyTitle: { ...Fonts.h3, marginBottom: Spacing.xs },
  emptySubtitle: { ...Fonts.caption, textAlign: 'center' },
  concertHeader: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  concertTitle: { ...Fonts.bold, fontSize: 17, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaText: { ...Fonts.caption, fontSize: 13 },
  mapCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: { ...Fonts.h3, marginBottom: 6 },
  sectionSubtitle: { ...Fonts.caption, marginBottom: Spacing.md },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  sectionCard: {
    width: SECTION_CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.selectedSurface,
  },
  sectionCardDisabled: {
    opacity: 0.6,
  },
  sectionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionName: { ...Fonts.bold, fontSize: 14 },
  sectionAvailability: { ...Fonts.caption, marginBottom: 6 },
  sectionPrice: { ...Fonts.bold, color: Colors.primary, fontSize: 16 },
  soldOutText: { ...Fonts.caption, color: Colors.error, marginTop: 4 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedInfo: { ...Fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.sm },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
  },
  continueButtonDisabled: { opacity: 0.5 },
  continueButtonText: { ...Fonts.bold, color: Colors.white, fontSize: 16 },
});
