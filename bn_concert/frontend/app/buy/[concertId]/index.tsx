import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../../../src/constants/theme';
import { concertApi } from '../../../src/api/services';
import { LoadingScreen } from '../../../src/components';
import type { Concert } from '../../../src/types';

export default function DateSelectionScreen() {
  const { concertId } = useLocalSearchParams<{ concertId: string }>();
  const router = useRouter();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!concertId) return;
    concertApi.getDates(concertId)
      .then(({ data }) => setConcerts(data))
      .finally(() => setLoading(false));
  }, [concertId]);

  if (loading) return <LoadingScreen />;

  if (concerts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={Fonts.h3}>No dates available</Text>
      </View>
    );
  }

  // The first concert fetched should be representative for the image and title.
  const representativeConcert = concerts.find(c => c.id === concertId) || concerts[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Concert Mini Header */}
      <View style={styles.concertHeader}>
        <Image
          source={{ uri: representativeConcert.image_url || 'https://via.placeholder.com/80/6C63FF/ffffff?text=C' }}
          style={styles.concertImage}
        />
        <View style={styles.concertInfo}>
          <Text style={styles.concertTitle} numberOfLines={2}>{representativeConcert.title}</Text>
          {representativeConcert.artist && (
            <Text style={styles.concertArtist}>{representativeConcert.artist.name}</Text>
          )}
        </View>
      </View>

      {/* Dates */}
      <Text style={styles.sectionTitle}>Select a Date</Text>

      {concerts.map((c) => {
        const dateObj = new Date(c.date);
        const isCurrent = c.id === concertId;

        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.dateCard, isCurrent && styles.dateCardActive]}
            onPress={() => router.push(`/buy/${c.id}/section`)}
            activeOpacity={0.7}
          >
            <View style={styles.dateLeft}>
              <View style={[styles.calendarIcon, isCurrent && { backgroundColor: Colors.primary }]}>
                <Text style={[styles.calendarMonth, isCurrent && { color: Colors.white }]}>
                  {dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.calendarDay, isCurrent && { color: Colors.white }]}>
                  {dateObj.toLocaleDateString('en-US', { day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateText}>
                  {dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                </Text>
                {c.venue && (
                  <Text style={styles.venueText}>{c.venue.name}, {c.venue.city}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isCurrent ? Colors.primary : Colors.textSecondary} />
          </TouchableOpacity>
        );
      })}

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  concertHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  concertImage: { width: 70, height: 70, borderRadius: BorderRadius.sm },
  concertInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center' },
  concertTitle: { ...Fonts.bold, fontSize: 16 },
  concertArtist: { ...Fonts.caption, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: { ...Fonts.h3, marginBottom: Spacing.md },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.selectedSurface,
  },
  dateLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  calendarIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  calendarMonth: { ...Fonts.caption, color: Colors.primary, fontFamily: Fonts.bold.fontFamily },
  calendarDay: { ...Fonts.bold, fontSize: 16, color: Colors.text },
  dateInfo: { flex: 1 },
  dateText: { ...Fonts.medium, color: Colors.text },
  venueText: { ...Fonts.caption, color: Colors.textSecondary, marginTop: 2 },
});
