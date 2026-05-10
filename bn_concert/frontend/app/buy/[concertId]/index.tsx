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
const FAKE_MAP_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='656' height='538' viewBox='0 0 656 538'%3E%3Crect width='656' height='538' fill='%23F5F6F8'/%3E%3Cg stroke='%23D8DBE2' stroke-width='3' opacity='.95'%3E%3Cpath d='M0 92H656'/%3E%3Cpath d='M0 188H656'/%3E%3Cpath d='M0 284H656'/%3E%3Cpath d='M0 380H656'/%3E%3Cpath d='M98 0V538'/%3E%3Cpath d='M218 0V538'/%3E%3Cpath d='M338 0V538'/%3E%3Cpath d='M458 0V538'/%3E%3Cpath d='M578 0V538'/%3E%3C/g%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cpath d='M-40 420C88 322 206 340 314 272S504 142 696 80' stroke='%23F7C3DD' stroke-width='34'/%3E%3Cpath d='M-20 120C124 172 186 238 306 236S510 186 682 252' stroke='%23B9C6E8' stroke-width='26'/%3E%3Cpath d='M126 560C154 422 216 340 278 274S378 142 390 -20' stroke='%23DDE2EA' stroke-width='22'/%3E%3Cpath d='M20 474C178 446 308 414 438 366S588 294 680 284' stroke='%23DDE2EA' stroke-width='18'/%3E%3C/g%3E%3Cg fill='%23FFFFFF' stroke='%23C9CDD6' stroke-width='2'%3E%3Crect x='72' y='52' width='90' height='54' rx='10'/%3E%3Crect x='428' y='72' width='128' height='70' rx='12'/%3E%3Crect x='62' y='294' width='126' height='82' rx='12'/%3E%3Crect x='466' y='404' width='116' height='78' rx='12'/%3E%3C/g%3E%3Ccircle cx='356' cy='246' r='31' fill='%23FFFFFF' opacity='.9'/%3E%3Cpath d='M356 176c-39 0-70 31-70 70 0 52 70 116 70 116s70-64 70-116c0-39-31-70-70-70z' fill='%23FF0082'/%3E%3Ccircle cx='356' cy='246' r='25' fill='%23FFFFFF'/%3E%3Ccircle cx='356' cy='246' r='12' fill='%232F32A6'/%3E%3C/svg%3E";
const FALLBACK_ADDRESS = '1 MetLife Stadium Dr, East Rutherford, NJ 07073, USA';

const REVIEW_CARDS = [
  {
    id: 'review-linh',
    name: 'Linh Tran',
    date: '28 June 2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    rating: 5,
    body: 'Amazing sound, clear entry flow, and the lighting made every seat feel close to the stage.',
  },
  {
    id: 'review-minh',
    name: 'Minh Nguyen',
    date: '29 June 2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    rating: 4,
    body: 'The venue map was easy to follow and staff helped us reach the VIP Front gate quickly.',
  },
] as const;

const SUGGESTION_IMAGES = [
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80',
] as const;

type DateCardOption = Concert & {
  displayKey: string;
  routeId: string;
};

function addDays(dateValue: string, days: number) {
  const date = new Date(dateValue);
  const safeDate = Number.isNaN(date.getTime()) ? new Date('2026-06-25T20:00:00Z') : date;
  safeDate.setDate(safeDate.getDate() + days);
  return safeDate.toISOString();
}

function buildDateOptions(concerts: Concert[], representativeConcert: Concert): DateCardOption[] {
  const baseOptions = concerts.map((concert) => ({
    ...concert,
    displayKey: concert.id,
    routeId: concert.id,
  }));

  if (baseOptions.length >= 4) return baseOptions;

  const fallbackOptions = [1, 2, 3]
    .slice(0, 4 - baseOptions.length)
    .map((dayOffset, index) => ({
      ...representativeConcert,
      date: addDays(representativeConcert.date, dayOffset),
      displayKey: `${representativeConcert.id}-mock-date-${dayOffset}`,
      routeId: representativeConcert.id,
      status: index === 1 ? 'sold_out' : 'available',
    }));

  return [...baseOptions, ...fallbackOptions];
}

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

  const dateOptions = buildDateOptions(displayConcerts, representativeConcert);
  const venueAddress = [
    representativeConcert.venue?.address,
    representativeConcert.venue?.city,
    representativeConcert.venue?.country,
  ].filter(Boolean).join(', ');
  const addressText = `Address: ${venueAddress || FALLBACK_ADDRESS}`;
  const bannerImage = resolveImageUrl(representativeConcert.image_url) || BUY_TICKET_BANNER;
  const suggestionCards = [
    {
      id: 'more-main',
      title: representativeConcert.artist?.name || representativeConcert.title,
      subtitle: representativeConcert.title,
      image: bannerImage,
    },
    {
      id: 'more-live',
      title: 'Live Pop Night',
      subtitle: 'Exclusive summer stadium show',
      image: SUGGESTION_IMAGES[0],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Image
        source={{ uri: bannerImage }}
        style={styles.bannerImage}
      />

      {dateOptions.map((c) => {
        const dateObj = new Date(c.date);
        const isSoldOut = c.status === 'sold_out' || c.status === 'sold';
        const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return (
          <TouchableOpacity
            key={c.displayKey}
            style={styles.dateCard}
            onPress={() => router.push(`/buy/${c.routeId}/section`)}
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
                <Text numberOfLines={2} style={styles.ticketTitle}>{c.title}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="ticket-outline" size={16} color={Colors.neutral700} />
                  <Text style={styles.metaText}>Status: </Text>
                  <Text style={[styles.statusText, isSoldOut ? styles.soldOutText : styles.availableText]}>
                    {isSoldOut ? 'Sold Out' : 'Available'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="cash-outline" size={16} color={Colors.neutral700} />
                  <Text numberOfLines={1} style={styles.metaText}>Price: ${c.min_price.toFixed(0)}-{c.max_price.toFixed(0)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.neutral700} />
                  <Text numberOfLines={1} style={styles.metaText}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })} {timeLabel}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={18} color={Colors.neutral700} />
                  <Text numberOfLines={1} style={styles.metaText}>{c.venue?.city || 'New York'}</Text>
                </View>
              </View>
              <View style={[styles.viewButton, isSoldOut && styles.viewButtonDisabled]}>
                <Text style={[styles.viewButtonText, isSoldOut && styles.viewButtonTextDisabled]}>View</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.addressText}>{addressText}</Text>

      <View style={styles.mapFrame}>
        <Image source={{ uri: FAKE_MAP_IMAGE }} style={styles.mapImage} resizeMode="cover" />
        <View style={styles.mapBadge}>
          <Ionicons name="location" size={16} color={Colors.white} />
          <Text numberOfLines={1} style={styles.mapBadgeText}>
            {representativeConcert.venue?.name || 'Concert Stadium'}
          </Text>
        </View>
      </View>

      <Text style={styles.reviewsTitle}>Top reviews on this concert</Text>
      <TouchableOpacity activeOpacity={0.75} style={styles.reviewFilter}>
        <Text style={styles.reviewFilterText}>All reviews</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.neutral700} />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.reviewScroller}
        contentContainerStyle={styles.reviewScrollerContent}
      >
        {REVIEW_CARDS.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
              <View style={styles.reviewMeta}>
                <Text numberOfLines={1} style={styles.reviewName}>{review.name}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons
                  key={`${review.id}-star-${index}`}
                  name={index < review.rating ? 'star' : 'star-outline'}
                  size={16}
                  color="#F5A623"
                />
              ))}
            </View>
            <Text style={styles.reviewBody}>{review.body}</Text>
            <View style={styles.reviewActions}>
              <View style={styles.reviewActionGroup}>
                <Ionicons name="thumbs-up-outline" size={16} color={Colors.neutral700} />
                <Text style={styles.reviewActionText}>24</Text>
              </View>
              <View style={styles.reviewActionGroup}>
                <Ionicons name="chatbubble-outline" size={16} color={Colors.neutral700} />
                <Text style={styles.reviewActionText}>Reply</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.suggestionsTitle}>More suggestions for you</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestionScroller}
        contentContainerStyle={styles.suggestionScrollerContent}
      >
        {suggestionCards.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.76} style={styles.suggestionCard}>
            <Image source={{ uri: item.image }} style={styles.suggestionImage} resizeMode="cover" />
            <View style={styles.suggestionOverlay}>
              <Text numberOfLines={1} style={styles.suggestionTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.suggestionSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Footer containerStyle={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: {
    alignSelf: 'center',
    maxWidth: '100%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 0,
    width: 360,
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
    flex: 1,
    flexShrink: 1,
    gap: 4,
    minWidth: 0,
    paddingRight: Spacing.sm,
  },
  ticketTitle: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    lineHeight: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: {
    flexShrink: 1,
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
    flexShrink: 0,
    width: 82,
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
    marginTop: 40,
  },
  addressText: {
    ...Fonts.body12,
    color: Colors.neutral700,
    lineHeight: 16,
    marginTop: 8,
  },
  mapFrame: {
    borderRadius: BorderRadius.lg,
    height: 269,
    marginTop: 16,
    overflow: 'hidden',
    width: '100%',
  },
  mapImage: {
    height: '100%',
    width: '100%',
  },
  mapBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    bottom: 14,
    flexDirection: 'row',
    gap: 4,
    left: 14,
    maxWidth: 230,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
  },
  mapBadgeText: {
    ...Fonts.body12,
    color: Colors.white,
    flexShrink: 1,
    lineHeight: 14,
  },
  reviewsTitle: {
    ...Fonts.heading16,
    color: Colors.text,
    marginTop: 36,
  },
  reviewFilter: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 32,
    marginTop: 18,
    paddingHorizontal: 14,
  },
  reviewFilterText: {
    ...Fonts.body12,
    color: Colors.neutral700,
  },
  reviewScroller: {
    marginHorizontal: -Spacing.md,
    marginTop: 20,
  },
  reviewScrollerContent: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    height: 240,
    padding: 16,
    width: 242,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  reviewAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  reviewMeta: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  reviewName: {
    ...Fonts.body14,
    color: Colors.text,
    lineHeight: 18,
  },
  reviewDate: {
    ...Fonts.body10,
    color: Colors.textLight,
    lineHeight: 14,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 16,
  },
  reviewBody: {
    ...Fonts.body12,
    color: Colors.neutral700,
    flex: 1,
    lineHeight: 18,
    marginTop: 14,
  },
  reviewActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    marginTop: 12,
  },
  reviewActionGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  reviewActionText: {
    ...Fonts.body10,
    color: Colors.neutral700,
    lineHeight: 12,
  },
  suggestionsTitle: {
    ...Fonts.heading16,
    color: Colors.text,
    marginTop: 24,
  },
  suggestionScroller: {
    marginHorizontal: -Spacing.md,
    marginTop: 8,
  },
  suggestionScrollerContent: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  suggestionCard: {
    borderRadius: BorderRadius.lg,
    height: 190,
    overflow: 'hidden',
    width: 242,
  },
  suggestionImage: {
    height: '100%',
    width: '100%',
  },
  suggestionOverlay: {
    backgroundColor: Colors.overlay,
    bottom: 0,
    left: 0,
    padding: 14,
    position: 'absolute',
    right: 0,
  },
  suggestionTitle: {
    ...Fonts.heading16,
    color: Colors.white,
    lineHeight: 20,
  },
  suggestionSubtitle: {
    ...Fonts.body12,
    color: Colors.white,
    lineHeight: 16,
    marginTop: 3,
  },
});
