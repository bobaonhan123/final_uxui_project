import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../../../src/constants/theme';
import { concertApi } from '../../../src/api/services';
import { resolveImageUrl } from '../../../src/utils/images';
import { Footer, LoadingScreen } from '../../../src/components';
import type { Concert } from '../../../src/types';

const BUY_TICKET_BANNER =
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80';

export default function DateSelectionScreen() {
  const { concertId } = useLocalSearchParams<{ concertId: string }>();
  const router = useRouter();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [currentConcert, setCurrentConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!concertId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    setLoading(true);
    Promise.allSettled([concertApi.getDates(concertId), concertApi.get(concertId)])
      .then(([datesResult, concertResult]) => {
        if (!isMounted) return;

        setConcerts(datesResult.status === 'fulfilled' ? datesResult.value.data : []);
        setCurrentConcert(concertResult.status === 'fulfilled' ? concertResult.value.data : null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [concertId]);

  if (loading) return <LoadingScreen />;

  const displayConcerts = concerts.length > 0 ? concerts : currentConcert ? [currentConcert] : [];

  // The first concert fetched should be representative for the image and title.
  const representativeConcert = displayConcerts.find(c => c.id === concertId) || displayConcerts[0];

  if (!representativeConcert) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Concert not found</Text>
        <Text style={styles.emptyText}>Please go back and choose another concert.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Image
        source={{ uri: resolveImageUrl(representativeConcert.image_url) || BUY_TICKET_BANNER }}
        style={styles.bannerImage}
      />

      {displayConcerts.map((c) => {
        const dateObj = new Date(c.date);
        const isCurrent = c.id === concertId;
        const isSoldOut = c.status === 'sold_out' || c.status === 'sold';
        const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return (
          <TouchableOpacity
            key={c.id}
            style={styles.dateCard}
            onPress={() => router.push(`/buy/${c.id}/section`)}
            activeOpacity={0.7}
            disabled={isSoldOut}
          >
            <View style={[styles.dateBlock, isSoldOut && styles.dateBlockSoldOut]}>
              <Text style={[styles.dateBlockText, isSoldOut && styles.dateBlockTextSoldOut]}>
                {dateObj.toLocaleDateString('en-US', { day: 'numeric' })}
              </Text>
              <Text style={[styles.dateBlockText, isSoldOut && styles.dateBlockTextSoldOut]}>
                {dateObj.toLocaleDateString('en-US', { month: 'long' })}
              </Text>
              <Text style={[styles.dateBlockText, isSoldOut && styles.dateBlockTextSoldOut]}>
                {dateObj.toLocaleDateString('en-US', { year: 'numeric' })}
              </Text>
            </View>

            <View style={styles.ticketInfoCard}>
              <View style={styles.ticketInfoText}>
                <Text style={styles.ticketTitle}>{c.title}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="ticket-outline" size={16} color={Colors.neutral700} />
                  <Text style={styles.metaText}>Status: </Text>
                  <Text style={[styles.statusText, isSoldOut ? styles.soldOutText : styles.availableText]}>
                    {isSoldOut ? 'Sold Out' : 'Available'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="cash-outline" size={16} color={Colors.neutral700} />
                  <Text style={styles.metaText}>Price: ${c.min_price.toFixed(0)}-{c.max_price.toFixed(0)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.neutral700} />
                  <Text style={styles.metaText}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })} {timeLabel}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={18} color={Colors.neutral700} />
                  <Text style={styles.metaText}>{c.venue?.city || 'New York'}</Text>
                </View>
              </View>
              <View style={[styles.viewButton, isSoldOut && styles.viewButtonDisabled]}>
                <Text style={[styles.viewButtonText, isSoldOut && styles.viewButtonTextDisabled]}>View</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <Footer containerStyle={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 0,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: {
    ...Fonts.h3,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Fonts.caption,
    textAlign: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 221,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.borderLight,
  },
  dateCard: {
    width: '100%',
    height: 135,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateBlock: {
    width: 70,
    height: 135,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dateBlockSoldOut: {
    backgroundColor: Colors.border,
  },
  dateBlockText: {
    fontFamily: Fonts.body16.fontFamily,
    fontSize: Fonts.body16.fontSize,
    lineHeight: 18,
    color: Colors.white,
    textAlign: 'center',
  },
  dateBlockTextSoldOut: {
    color: Colors.neutral700,
  },
  ticketInfoCard: {
    flex: 1,
    height: 135,
    marginLeft: -1,
    borderWidth: 1,
    borderColor: '#D1D1D7',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  ticketInfoText: {
    gap: 4,
  },
  ticketTitle: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    lineHeight: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: Fonts.body12.fontSize,
    lineHeight: 14,
    color: Colors.neutral700,
  },
  statusText: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: Fonts.body12.fontSize,
    lineHeight: 14,
  },
  availableText: {
    color: Colors.success,
  },
  soldOutText: {
    color: Colors.error,
  },
  viewButton: {
    height: 32,
    minWidth: 82,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  viewButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  viewButtonText: {
    fontFamily: Fonts.button14.fontFamily,
    fontSize: Fonts.button14.fontSize,
    lineHeight: Fonts.button14.lineHeight,
    color: Colors.white,
  },
  viewButtonTextDisabled: {
    color: Colors.textLight,
  },
  footer: {
    marginHorizontal: -Spacing.md,
    marginTop: 64,
  },
});
