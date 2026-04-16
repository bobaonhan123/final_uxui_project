import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../../../src/constants/theme';
import { Button } from '../../../src/components';
import { concertApi, orderApi } from '../../../src/api/services';
import type { Order, Ticket } from '../../../src/types';

export default function SuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [concertTitle, setConcertTitle] = useState<string>('Concert');
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
          setConcertTitle('Concert');
        }
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [orderId]);

  const seatSummary = useMemo(() => {
    const labels = order?.items
      ?.map((item) => item.seat_label)
      .filter((value): value is string => Boolean(value));
    if (!labels || labels.length === 0) return 'Seats assigned at venue';
    return labels.join(', ');
  }, [order?.items]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={64} color={Colors.white} />
        </View>
      </View>

      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.subtitle}>Your order is confirmed and your e-tickets are ready.</Text>

      {orderId ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Order ID</Text>
          <Text style={styles.orderId}>{orderId}</Text>
          {!!order?.created_at && (
            <Text style={styles.metaText}>
              {new Date(order.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Concert</Text>
          <Text style={styles.summaryValue}>{concertTitle}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tickets</Text>
          <Text style={styles.summaryValue}>{order?.items.length ?? tickets.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Seats</Text>
          <Text style={styles.summaryValue}>{seatSummary}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValue}>{order?.payment_method || 'Completed'}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>${order?.total.toFixed(2) ?? '0.00'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>E-Ticket Info</Text>
        <Text style={styles.ticketDescription}>
          Your e-tickets can be accessed from Dashboard → Tickets.
        </Text>
        {tickets.length > 0 ? (
          tickets.slice(0, 3).map((ticket, index) => (
            <View key={ticket.id} style={styles.ticketRow}>
              <Ionicons name="ticket-outline" size={16} color={Colors.primary} />
              <Text style={styles.ticketText}>
                Ticket {index + 1}: {ticket.qr_code}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.ticketEmpty}>Your tickets will appear shortly.</Text>
        )}
        {order?.customer_snapshot?.customer_email ? (
          <Text style={styles.ticketMeta}>
            Confirmation sent to: {order.customer_snapshot.customer_email}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button title="View Tickets" onPress={() => router.replace('/dashboard/tickets')} />
        <Button title="Back to Home" onPress={() => router.replace('/(tabs)')} variant="outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.md },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { ...Fonts.h1, textAlign: 'center' },
  subtitle: {
    ...Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  cardLabel: { ...Fonts.caption, marginBottom: 4 },
  orderId: { ...Fonts.bold, fontSize: 13, color: Colors.primary },
  metaText: { ...Fonts.caption, marginTop: Spacing.xs },
  sectionTitle: { ...Fonts.bold, fontSize: 15, marginBottom: Spacing.sm },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    gap: Spacing.md,
  },
  summaryLabel: { ...Fonts.caption, fontSize: 13 },
  summaryValue: { ...Fonts.medium, flex: 1, textAlign: 'right', fontSize: 14 },
  totalRow: { marginTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  totalLabel: { ...Fonts.bold, fontSize: 15 },
  totalValue: { ...Fonts.bold, fontSize: 18, color: Colors.primary },
  ticketDescription: { ...Fonts.caption, marginBottom: Spacing.sm, fontSize: 13 },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  ticketText: { ...Fonts.caption, color: Colors.text, flex: 1, fontSize: 13 },
  ticketMeta: { ...Fonts.caption, marginTop: Spacing.sm, fontSize: 12 },
  ticketEmpty: { ...Fonts.caption, color: Colors.textSecondary },
  actions: { marginTop: Spacing.md, gap: Spacing.sm },
});
