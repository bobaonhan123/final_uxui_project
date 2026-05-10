import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Fonts } from '../../src/constants/theme';
import { concertApi } from '../../src/api/services';
import { resolveImageUrl } from '../../src/utils/images';
import { LoadingScreen, Footer } from '../../src/components';
import type { Concert } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 320;
const DEFAULT_CONCERT_IMAGE =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80';
const DEFAULT_ARTIST_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

export default function ConcertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    concertApi.get(id).then(({ data }) => setConcert(data)).finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!concert) return;
    await Share.share({ message: `Check out ${concert.title}!`, title: concert.title });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return null;
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingScreen />;
  if (!concert) {
    return (
      <View style={styles.center}>
        <Text style={{ fontFamily: Fonts.h3.fontFamily, fontSize: 20 }}>Concert not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: resolveImageUrl(concert.image_url) || DEFAULT_CONCERT_IMAGE }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)', Colors.background]}
            locations={[0, 0.7, 1]}
            style={styles.heroOverlay}
          />
          <TouchableOpacity style={[styles.backButton, { top: insets.top + Spacing.sm }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareButton, { top: insets.top + Spacing.sm }]} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.heroInfo}>
            <View style={styles.badgeRow}>
               <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{concert.status ? concert.status.toUpperCase() : 'UPCOMING'}</Text>
              </View>
            </View>
            <Text style={styles.title}>{concert.title}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Action Cards Grid */}
          <View style={styles.actionGrid}>
            <View style={styles.actionItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionTitle}>{formatDate(concert.date)}</Text>
              {concert.show_start && <Text style={styles.actionSub}>Show: {formatTime(concert.show_start)}</Text>}
            </View>
            
            {concert.venue && (
              <View style={styles.actionItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.actionTitle}>{concert.venue.name}</Text>
                <Text style={styles.actionSub} numberOfLines={1}>{concert.venue.city}</Text>
              </View>
            )}
          </View>

          {/* Artist Mapping */}
          {concert.artist && (
            <TouchableOpacity
              style={styles.artistCard}
              onPress={() => router.push(`/artist/${concert.artist!.id}` as never)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: resolveImageUrl(concert.artist.image_url) || DEFAULT_ARTIST_IMAGE }}
                style={styles.artistImage}
              />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.artistName}>{concert.artist.name}</Text>
                {concert.artist.genre && (
                  <Text style={styles.artistGenre}>{concert.artist.genre}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Description */}
          {concert.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this Event</Text>
              <Text style={styles.description}>{concert.description}</Text>
            </View>
          )}

          {/* Price Range */}
          <LinearGradient
            colors={['#fff4f9', '#ffffff']}
            style={styles.priceCard}
          >
            <View style={styles.priceIcon}>
              <Ionicons name="pricetag" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.priceLabel}>Tickets Starting From</Text>
              <Text style={styles.priceText}>
                ${concert.min_price.toFixed(2)} – ${concert.max_price.toFixed(2)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Footer />
      </ScrollView>

      {/* Fixed Buy Button Floating */}
      <LinearGradient
        colors={['transparent', Colors.background]}
        locations={[0, 0.4]}
        style={styles.bottomBar}
      >
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => router.push(`/buy/${concert.id}` as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="ticket" size={22} color={Colors.white} />
          <Text style={styles.buyButtonText}>Buy Tickets</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: {
    height: HERO_HEIGHT,
    width: SCREEN_WIDTH,
  },
  heroImage: { width: SCREEN_WIDTH, height: HERO_HEIGHT, resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute', top: 56, left: Spacing.lg,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  shareButton: {
    position: 'absolute', top: 56, right: Spacing.lg,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  heroInfo: { position: 'absolute', bottom: Spacing.xl, left: Spacing.lg, right: Spacing.lg },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  statusBadge: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  statusText: { fontFamily: Fonts.bold.fontFamily, fontSize: 11, color: Colors.white, letterSpacing: 1 },
  title: { fontFamily: Fonts.h1.fontFamily, fontSize: 32, color: Colors.white, marginBottom: Spacing.xs },
  
  content: { padding: Spacing.lg, paddingTop: 0 },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionItem: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 130, 0.1)', // Light primary
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: { fontFamily: Fonts.bold.fontFamily, fontSize: 13, color: Colors.text, textAlign: 'center', marginBottom: 2 },
  actionSub: { fontFamily: Fonts.regular.fontFamily, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  
  artistCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.md, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  artistImage: { width: 64, height: 64, borderRadius: 32 },
  artistName: { fontFamily: Fonts.bold.fontFamily, fontSize: 18, color: Colors.text },
  artistGenre: { fontFamily: Fonts.medium.fontFamily, fontSize: 14, color: Colors.primary, marginTop: 2 },
  
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontFamily: Fonts.h3.fontFamily, fontSize: 22, marginBottom: Spacing.md, color: Colors.text },
  description: { fontFamily: Fonts.regular.fontFamily, fontSize: 16, lineHeight: 26, color: Colors.textSecondary },
  
  priceCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.primary,
    marginBottom: Spacing.xl,
  },
  priceIcon: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 0, 130, 0.1)',
    borderRadius: BorderRadius.lg,
  },
  priceLabel: { fontFamily: Fonts.medium.fontFamily, fontSize: 13, color: Colors.textSecondary },
  priceText: { fontFamily: Fonts.h2.fontFamily, fontSize: 24, color: Colors.primary },
  
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl + 10,
  },
  buyButton: {
    backgroundColor: Colors.primary, 
    borderRadius: BorderRadius.full,
    paddingVertical: 18, 
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  buyButtonText: { fontFamily: Fonts.bold.fontFamily, color: Colors.white, fontSize: 18 },
});
