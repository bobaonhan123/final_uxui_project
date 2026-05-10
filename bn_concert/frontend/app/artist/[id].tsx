import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Fonts } from '../../src/constants/theme';
import { artistApi } from '../../src/api/services';
import { resolveImageUrl } from '../../src/utils/images';
import { ConcertCard, Footer, LoadingScreen } from '../../src/components';
import type { Artist, ArtistVideo, Concert } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 300;

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900',
];

type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  durationSeconds: number;
  coverUrl: string;
};

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${mins}:${remaining.toString().padStart(2, '0')}`;
};

const parseTourName = (concertTitle?: string, artistName?: string | null) => {
  if (!concertTitle) return artistName ? `${artistName} World Tour` : 'World Tour';
  const match = concertTitle.match(/—\s*(.+?)(?:\s*\(|$)/);
  if (match?.[1]) return match[1].trim();
  return artistName ? `${artistName} World Tour` : concertTitle;
};

const formatConcertDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBio, setExpandedBio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoved, setIsLoved] = useState(false);
  const [repeatOne, setRepeatOne] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progressSeconds, setProgressSeconds] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [artistRes, concertsRes] = await Promise.all([artistApi.get(id), artistApi.getConcerts(id)]);
        if (!active) return;
        setArtist(artistRes.data);
        setConcerts(concertsRes.data);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [id]);

  const imageGallery = useMemo(() => {
    const rawGallery = artist?.image_gallery && artist.image_gallery.length > 0
      ? artist.image_gallery
      : Array.from(
        new Set([
          ...concerts
            .map((concert) => concert.image_url)
            .filter((image): image is string => Boolean(image)),
          ...FALLBACK_GALLERY,
        ]),
      ).slice(0, 5);

    return rawGallery
      .map((image) => resolveImageUrl(image) || image)
      .filter((image): image is string => Boolean(image));
  }, [artist?.image_gallery, concerts]);

  const tracks = useMemo<PlayerTrack[]>(() => {
    const coverPool = imageGallery.length > 0 ? imageGallery : FALLBACK_GALLERY;
    const artistName = artist?.name || 'BNConcert Artist';
    return [
      { id: 'track-1', title: 'Speak Now', artist: artistName, durationSeconds: 242, coverUrl: coverPool[0] },
      { id: 'track-2', title: 'Wildest Dreams', artist: artistName, durationSeconds: 234, coverUrl: coverPool[1] || coverPool[0] },
      { id: 'track-3', title: 'Cruel Summer', artist: artistName, durationSeconds: 218, coverUrl: coverPool[2] || coverPool[0] },
    ];
  }, [artist?.name, imageGallery]);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const progressRatio = currentTrack.durationSeconds > 0
    ? Math.min(progressSeconds / currentTrack.durationSeconds, 1)
    : 0;

  useEffect(() => {
    if (currentTrackIndex >= tracks.length) {
      setCurrentTrackIndex(0);
    }
  }, [currentTrackIndex, tracks.length]);

  useEffect(() => {
    setProgressSeconds(0);
  }, [currentTrackIndex]);

  useEffect(() => {
    if (!isPlaying || tracks.length === 0) return;
    const interval = setInterval(() => {
      setProgressSeconds((prev) => {
        const next = prev + 1;
        if (next >= currentTrack.durationSeconds) {
          if (repeatOne) return 0;
          setCurrentTrackIndex((trackIndex) => (trackIndex + 1) % tracks.length);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.durationSeconds, repeatOne, tracks.length]);

  const openUrl = async (url?: string | null) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Unavailable link', 'This social link cannot be opened on this device.');
      return;
    }
    await Linking.openURL(url);
  };

  const socialLinks: Array<{
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    url?: string | null;
  }> = [
    { key: 'facebook', icon: 'logo-facebook', label: 'Facebook', url: artist?.facebook_url },
    { key: 'instagram', icon: 'logo-instagram', label: 'Instagram', url: artist?.instagram_url },
    { key: 'spotify', icon: 'musical-notes-outline', label: 'Spotify', url: artist?.spotify_url },
    { key: 'x', icon: 'logo-twitter', label: 'X', url: artist?.x_url },
  ];

  const tourSummary = useMemo(() => {
    const sortedConcerts = [...concerts].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
    );
    const firstShow = sortedConcerts[0];
    const lastShow = sortedConcerts[sortedConcerts.length - 1];
    const locations = Array.from(
      new Set(
        sortedConcerts
          .map((concert) => [concert.venue?.city, concert.venue?.country].filter(Boolean).join(', '))
          .filter(Boolean),
      ),
    );

    return {
      name: artist?.tour_name || parseTourName(firstShow?.title, artist?.name),
      dateRange: firstShow && lastShow
        ? `${formatConcertDate(firstShow.date)} - ${formatConcertDate(lastShow.date)}`
        : 'Dates coming soon',
      locations: locations.length > 0 ? locations.join(' • ') : 'Global',
      stops: sortedConcerts.length,
    };
  }, [artist?.tour_name, artist?.name, concerts]);

  const fallbackVideoUrl = artist?.spotify_url || artist?.instagram_url || artist?.facebook_url || artist?.x_url;
  const videoGallery = useMemo<ArtistVideo[]>(() => {
    if (artist?.video_gallery && artist.video_gallery.length > 0) {
      return artist.video_gallery;
    }

    return imageGallery.slice(0, 3).map((thumbnail, index) => ({
      id: `video-${index + 1}`,
      title: `${artist?.name || 'Artist'} Greatest Hits ${new Date().getFullYear()}`,
      collection: tourSummary.name,
      thumbnail_url: thumbnail,
      views_label: `${(index + 2) * 8}K views`,
      published_label: `${index + 1} month${index > 0 ? 's' : ''} ago`,
      duration_label: '54:48',
      video_url: fallbackVideoUrl || undefined,
    }));
  }, [artist?.video_gallery, artist?.name, imageGallery, tourSummary.name, fallbackVideoUrl]);

  const switchTrack = (direction: -1 | 1) => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + direction + tracks.length) % tracks.length);
  };

  if (loading) return <LoadingScreen />;
  if (!artist) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Artist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: resolveImageUrl(artist.image_url) || imageGallery[0] || FALLBACK_GALLERY[0] }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.75)', Colors.background]}
            locations={[0, 0.72, 1]}
            style={styles.heroOverlay}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.socialColumn}>
            {socialLinks.map((link) => (
              <TouchableOpacity
                key={link.key}
                style={[styles.socialButton, !link.url && styles.socialButtonDisabled]}
                onPress={() => openUrl(link.url)}
                disabled={!link.url}
              >
                <Ionicons name={link.icon} size={16} color={Colors.white} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{artist.name}</Text>
            <Text style={styles.heroTour}>{tourSummary.name}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.playerCard}>
            <Image source={{ uri: currentTrack.coverUrl }} style={styles.playerCover} />
            <View style={styles.playerBody}>
              <View style={styles.playerHeading}>
                <View style={styles.playerTitleWrap}>
                  <Text style={styles.playerTitle} numberOfLines={1}>{currentTrack.title}</Text>
                  <Text style={styles.playerArtist}>{currentTrack.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsLoved((prev) => !prev)}>
                  <Ionicons
                    name={isLoved ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isLoved ? Colors.primary : Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
              </View>
              <View style={styles.progressMeta}>
                <Text style={styles.progressText}>{formatClock(progressSeconds)}</Text>
                <Text style={styles.progressText}>{formatClock(currentTrack.durationSeconds)}</Text>
              </View>

              <View style={styles.playerControls}>
                <TouchableOpacity onPress={() => setRepeatOne((prev) => !prev)} style={styles.controlButton}>
                  <Ionicons
                    name={repeatOne ? 'repeat' : 'repeat-outline'}
                    size={18}
                    color={repeatOne ? Colors.primary : Colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchTrack(-1)} style={styles.controlButton}>
                  <Ionicons name="play-skip-back-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsPlaying((prev) => !prev)} style={styles.playButton}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={20}
                    color={Colors.white}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchTrack(1)} style={styles.controlButton}>
                  <Ionicons name="play-skip-forward-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <View style={styles.controlButton}>
                  <Ionicons name="musical-notes-outline" size={18} color={Colors.textSecondary} />
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.bioTitle}>{`${artist.name}: From Rising Talent to Global Icon`}</Text>
          <Text style={styles.bioText} numberOfLines={expandedBio ? undefined : 8}>
            {artist.bio || `${artist.name} continues to inspire fans worldwide with genre-defining performances and unforgettable live experiences.`}
          </Text>
          <TouchableOpacity style={styles.readMoreButton} onPress={() => setExpandedBio((prev) => !prev)}>
            <Text style={styles.readMoreText}>{expandedBio ? 'Read less' : 'Read more'}</Text>
          </TouchableOpacity>

          <View style={styles.tourCard}>
            <Text style={styles.tourCardTitle}>{tourSummary.name}</Text>
            <Text style={styles.tourCardDescription}>
              A headline tour celebrating fan-favorite songs, cinematic visuals, and high-energy live moments.
            </Text>
            <Text style={styles.tourCardMeta}>Dates: {tourSummary.dateRange}</Text>
            <Text style={styles.tourCardMeta}>Locations: {tourSummary.locations}</Text>
            <Text style={styles.tourCardMeta}>Stops: {tourSummary.stops}</Text>
            {concerts[0] && (
              <TouchableOpacity
                style={styles.knowMoreButton}
                onPress={() => router.push(`/concert/${concerts[0].id}` as never)}
              >
                <Text style={styles.knowMoreText}>Know more</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Video Gallery</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {videoGallery.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => openUrl(video.video_url)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: resolveImageUrl(video.thumbnail_url) || imageGallery[0] || FALLBACK_GALLERY[0] }}
                  style={styles.videoThumb}
                />
                <View style={styles.videoDurationBadge}>
                  <Text style={styles.videoDurationText}>{video.duration_label || '00:00'}</Text>
                </View>
                <View style={styles.videoPlayOverlay}>
                  <Ionicons name="play" size={18} color={Colors.white} />
                </View>
                <View style={styles.videoContent}>
                  <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                  <Text style={styles.videoMeta}>{video.collection || tourSummary.name}</Text>
                  <Text style={styles.videoMeta}>
                    {video.views_label || '0 views'} · {video.published_label || 'Recently'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Image Gallery</Text>
          </View>
          <View style={styles.imageGrid}>
            {imageGallery.map((image, index) => (
              <Image
                key={`${image}-${index}`}
                source={{ uri: image }}
                style={[styles.galleryImage, index % 3 === 0 ? styles.galleryImageTall : null]}
              />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Concerts</Text>
          </View>
          {concerts.length > 0 ? (
            concerts.slice(0, 3).map((concert) => (
              <ConcertCard
                key={concert.id}
                concert={concert}
                onPress={() => router.push(`/concert/${concert.id}` as never)}
                fullWidth
              />
            ))
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyText}>No upcoming concerts</Text>
            </View>
          )}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { ...Fonts.h3, color: Colors.text },
  heroContainer: { height: HERO_HEIGHT, width: SCREEN_WIDTH },
  heroImage: { width: SCREEN_WIDTH, height: HERO_HEIGHT, resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute',
    top: 56,
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  socialColumn: {
    position: 'absolute',
    top: 118,
    left: Spacing.md,
    gap: Spacing.sm,
  },
  socialButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonDisabled: { opacity: 0.5 },
  heroInfo: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
  },
  heroName: {
    ...Fonts.h1,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  heroTour: {
    ...Fonts.medium,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
  },
  content: { padding: Spacing.md },
  playerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  playerCover: {
    width: '100%',
    height: 172,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  playerBody: { gap: Spacing.sm },
  playerHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerTitleWrap: { flex: 1, marginRight: Spacing.sm },
  playerTitle: { ...Fonts.medium, fontSize: 16 },
  playerArtist: { ...Fonts.caption, color: Colors.secondary },
  progressTrack: {
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    ...Fonts.caption,
    color: Colors.textSecondary,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  bioTitle: {
    ...Fonts.h3,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: Spacing.sm,
  },
  bioText: {
    ...Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xxs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  readMoreText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tourCard: {
    backgroundColor: Colors.text,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tourCardTitle: {
    ...Fonts.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  tourCardDescription: {
    ...Fonts.regular,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  tourCardMeta: {
    ...Fonts.regular,
    color: Colors.white,
    lineHeight: 19,
  },
  knowMoreButton: {
    marginTop: Spacing.md,
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xxs,
  },
  knowMoreText: {
    ...Fonts.medium,
    color: Colors.white,
    fontSize: 14,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Fonts.h3,
    fontSize: 16,
  },
  horizontalList: {
    paddingBottom: Spacing.md,
    paddingRight: Spacing.sm,
  },
  videoCard: {
    width: 242,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  videoThumb: { width: '100%', height: 136 },
  videoDurationBadge: {
    position: 'absolute',
    right: Spacing.sm,
    top: 112,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm - Spacing.xxs,
    paddingVertical: Spacing.xxs,
  },
  videoDurationText: {
    ...Fonts.caption,
    color: Colors.white,
    fontSize: 10,
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 52,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContent: { padding: Spacing.sm },
  videoTitle: {
    ...Fonts.medium,
    fontSize: 13,
    marginBottom: 3,
  },
  videoMeta: {
    ...Fonts.caption,
    color: Colors.textLight,
    fontSize: 11,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  galleryImage: {
    width: (SCREEN_WIDTH - (Spacing.md * 2) - Spacing.sm) / 2,
    height: 140,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  galleryImageTall: {
    height: 186,
  },
  emptySection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Fonts.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
