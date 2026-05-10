import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Footer, Header } from '../../../src/components';
import { concertApi, orderApi } from '../../../src/api/services';
import { BorderRadius, Colors, Fonts, Spacing } from '../../../src/constants/theme';
import type { Order, Ticket } from '../../../src/types';

const CONFETTI = [
  [20, 118], [75, 105], [132, 119], [198, 108], [263, 121], [319, 108],
  [12, 230], [58, 258], [293, 239], [336, 260], [31, 337], [103, 369],
  [203, 354], [292, 382], [330, 354],
] as const;

export default function SuccessScreen() {
  const {
    orderId,
    customerEmail,
    concertTitle: initialConcertTitle,
    ticketCount: initialTicketCount,
  } = useLocalSearchParams<{
    orderId?: string;
    customerEmail?: string;
    concertTitle?: string;
    ticketCount?: string;
  }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [concertTitle, setConcertTitle] = useState(initialConcertTitle || 'Concert');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const loadSummary = async () => {
      try {
        const [{ data: orderData }, { data: ticketData }] = await Promise.all([
          orderApi.get(orderId),
          orderApi.getTickets(orderId),
        ]);

        setOrder(orderData);
        setTickets(ticketData);

        try {
          const { data: concert } = await concertApi.get(orderData.concert_id);
          setConcertTitle(concert.title);
        } catch {
          setConcertTitle(initialConcertTitle || 'Concert');
        }
      } catch {
        setOrder(null);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [initialConcertTitle, orderId]);

  const email = order?.customer_snapshot?.customer_email || customerEmail || 'prototype.user@example.com';
  const prototypeTicketCount = Number(initialTicketCount || 0);
  const ticketCount = tickets.length || order?.items.length || (Number.isFinite(prototypeTicketCount) ? prototypeTicketCount : 0);

  const message = useMemo(() => {
    if (ticketCount > 0) return `Your ${ticketCount} ticket${ticketCount > 1 ? 's are' : ' is'} in your mailbox`;
    return 'Your tickets are in your mailbox';
  }, [ticketCount]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header showSearch />

      <View style={styles.messageStage}>
        {CONFETTI.map(([left, top], index) => (
          <View key={`${left}-${top}-${index}`} style={[styles.confetti, { left, top, transform: [{ rotate: `${index * 17}deg` }] }]} />
        ))}

        <View style={styles.thankRow}>
          <Text style={styles.thankTitle}>Thank you!</Text>
          <Ionicons name="happy-outline" size={18} color={Colors.success} />
        </View>
        <Text style={styles.successTitle}>Your purchase was successful</Text>
        <Text style={styles.successSubtitle}>{message}</Text>
        <Text style={styles.emailText}>{email}</Text>
        <Text numberOfLines={1} style={styles.concertText}>{concertTitle}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.replace({
              pathname: '/dashboard/tickets',
              params: {
                prototype: '1',
                concertTitle,
                ticketCount: String(ticketCount || 2),
              },
            })
          }
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Download Your Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.replace('/(tabs)')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Back to Homepage</Text>
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
    maxWidth: '100%',
    width: 360,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  messageStage: {
    alignItems: 'center',
    height: 405,
    position: 'relative',
  },
  confetti: {
    backgroundColor: Colors.success,
    height: 6,
    opacity: 0.7,
    position: 'absolute',
    width: 6,
  },
  thankRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 92,
  },
  thankTitle: {
    ...Fonts.heading18,
    color: Colors.success,
  },
  successTitle: {
    ...Fonts.heading18,
    color: Colors.success,
    marginTop: 22,
    textAlign: 'center',
  },
  successSubtitle: {
    ...Fonts.body12,
    color: Colors.success,
    marginTop: 18,
    textAlign: 'center',
  },
  emailText: {
    ...Fonts.body12,
    color: Colors.success,
    textAlign: 'center',
  },
  concertText: {
    ...Fonts.body10,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    maxWidth: 260,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 40,
    justifyContent: 'center',
    marginTop: 34,
    width: 202,
  },
  primaryButtonText: {
    ...Fonts.button14,
    color: Colors.white,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: Colors.neutral700,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginTop: 16,
    width: 202,
  },
  secondaryButtonText: {
    ...Fonts.button14,
    color: Colors.neutral700,
  },
  footer: {
    marginTop: 0,
  },
});
