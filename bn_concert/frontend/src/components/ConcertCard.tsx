import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Fonts } from '../constants/theme';
import { resolveImageUrl } from '../utils/images';
import type { Concert } from '../types';

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2;
const TICKETS_CARD_WIDTH = 156;
const DEFAULT_CONCERT_IMAGE =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80';

interface Props {
  concert: Concert;
  onPress: () => void;
  fullWidth?: boolean;
  variant?: 'default' | 'tickets';
}

export default function ConcertCard({ concert, onPress, fullWidth, variant = 'default' }: Props) {
  const isTicketsVariant = variant === 'tickets';
  const width = fullWidth ? '100%' : isTicketsVariant ? TICKETS_CARD_WIDTH : CARD_WIDTH;
  const imageUri = resolveImageUrl(concert.image_url) || DEFAULT_CONCERT_IMAGE;
  const artistTitle = concert.artist?.name || concert.title.replace(/\s+concert$/i, '');
  const city = concert.venue?.city || concert.venue?.name || 'San Diego';
  const formattedDate = new Date(concert.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isTicketsVariant) {
    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={onPress}
        activeOpacity={0.82}
      >
        <Image source={{ uri: imageUri }} style={styles.ticketImage} />
        <View style={styles.ticketInfoOverlay}>
          <Image source={{ uri: imageUri }} style={styles.ticketOverlayBlur} blurRadius={25} />
          <View style={styles.ticketOverlayTint} />
          <View style={styles.ticketTextBlock}>
            <Text style={styles.ticketTitle} numberOfLines={1}>{artistTitle}</Text>
            <Text style={styles.ticketCity} numberOfLines={1}>{city}</Text>
            <Text style={styles.ticketDate} numberOfLines={1}>{formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isTicketsVariant && styles.ticketsCard,
        { width: fullWidth ? undefined : width },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imageUri }}
        style={[
          styles.image,
          fullWidth && styles.imageFull,
        ]}
      />
      <View style={[styles.info, isTicketsVariant && styles.infoTickets]}>
        <Text style={[styles.title, isTicketsVariant && styles.titleTickets]} numberOfLines={2}>{concert.title}</Text>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.date}>
            {new Date(concert.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        {concert.venue && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.venue} numberOfLines={1}>{concert.venue.name}, {concert.venue.city}</Text>
          </View>
        )}
        <Text style={styles.price}>
          ${concert.min_price.toFixed(0)} - ${concert.max_price.toFixed(0)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ticketCard: {
    width: TICKETS_CARD_WIDTH,
    height: 258,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ticketImage: {
    width: '100%',
    height: 190,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.borderLight,
  },
  ticketInfoOverlay: {
    height: 116,
    marginTop: -48,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  ticketOverlayBlur: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.08 }],
  },
  ticketOverlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ticketTextBlock: {
    height: 95,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketTitle: {
    width: '100%',
    fontFamily: Fonts.body16.fontFamily,
    fontSize: Fonts.body16.fontSize,
    lineHeight: Fonts.body16.lineHeight,
    color: Colors.text,
    textAlign: 'center',
  },
  ticketCity: {
    width: '100%',
    marginTop: Spacing.xs,
    fontFamily: Fonts.body14.fontFamily,
    fontSize: Fonts.body14.fontSize,
    lineHeight: Fonts.body14.lineHeight,
    color: Colors.neutral700,
    textAlign: 'center',
  },
  ticketDate: {
    width: '100%',
    marginTop: Spacing.xs,
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    lineHeight: 18,
    color: Colors.neutral700,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ticketsCard: {
    height: 258,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surface,
  },
  imageTickets: {
    height: 156,
  },
  imageFull: {
    height: 180,
  },
  info: {
    padding: Spacing.md,
  },
  infoTickets: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  titleTickets: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  date: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  venue: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  price: {
    fontFamily: Fonts.bold.fontFamily,
    fontSize: 15,
    color: Colors.primary,
    marginTop: 8,
  },
});
