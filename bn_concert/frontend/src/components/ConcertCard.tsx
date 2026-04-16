import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Fonts } from '../constants/theme';
import type { Concert } from '../types';

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2;
const TICKETS_CARD_WIDTH = 156;

interface Props {
  concert: Concert;
  onPress: () => void;
  fullWidth?: boolean;
  variant?: 'default' | 'tickets';
}

export default function ConcertCard({ concert, onPress, fullWidth, variant = 'default' }: Props) {
  const isTicketsVariant = variant === 'tickets';
  const width = fullWidth ? '100%' : isTicketsVariant ? TICKETS_CARD_WIDTH : CARD_WIDTH;

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
        source={{ uri: concert.image_url || 'https://via.placeholder.com/300x200/FF0082/ffffff?text=Concert' }}
        style={[
          styles.image,
          fullWidth && styles.imageFull,
          isTicketsVariant && styles.imageTickets,
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
