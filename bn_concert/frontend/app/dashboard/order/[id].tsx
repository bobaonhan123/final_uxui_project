import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../../src/constants/theme';
import { concertApi, orderApi } from '../../../src/api/services';
import { Button, LoadingScreen } from '../../../src/components';
import type { Concert, Order, Ticket } from '../../../src/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: '#D1FAE5', text: Colors.success },
  pending: { bg: '#FEF3C7', text: Colors.warning },
  cancelled: { bg: '#FEE2E2', text: Colors.error },
  failed: { bg: '#FEE2E2', text: Colors.error },
  refunded: { bg: '#E0E7FF', text: '#6366F1' },
};

const getRowFromSeat = (seatLabel?: string | null) => {
  if (!seatLabel) return 'N/A';
  const match = seatLabel.match(/^[A-Za-z]+/);
  return match?.[0] ?? 'N/A';
};

const formatPaymentMethod = (paymentMethod?: string | null) => {
  if (!paymentMethod) return 'Not specified';
  const normalized = paymentMethod.toLowerCase();
  if (normalized === 'ideal') return 'iDeal';
  if (normalized.startsWith('saved_card_')) return `Saved card ending ${paymentMethod.slice(-4)}`;
  if (normalized.startsWith('new_card_')) return `Card ending ${paymentMethod.slice(-4)}`;
  return paymentMethod.replace(/_/g, ' ');
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrderDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const { data: orderData } = await orderApi.get(id);
        if (!isMounted) return;
        setOrder(orderData);

        try {
          const { data: concertData } = await concertApi.get(orderData.concert_id);
          if (isMounted) {
            setConcert(concertData);
          }
        } catch {
          if (isMounted) {
            setConcert(null);
          }
        }
      } catch {
        if (isMounted) {
          setOrder(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          setCancelling(true);
          try {
            const { data } = await orderApi.cancel(id);
            setOrder(data);
          } catch {
            Alert.alert('Error', 'Failed to cancel order');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const handleTicketDownload = async (ticket: Ticket) => {
    setDownloadingTicketId(ticket.id);
    try {
      const { data } = await orderApi.requestTicketDownloadToken(ticket.id);
      const downloadUrl = orderApi.getTicketDownloadUrl(ticket.id, data.download_token);
      const supported = await Linking.canOpenURL(downloadUrl);
      if (!supported) {
        Alert.alert('Download unavailable', 'This device cannot open the ticket download link.');
        return;
      }
      await Linking.openURL(downloadUrl);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        Alert.alert('Session expired', 'Please sign in again to download your ticket.');
        return;
      }
      Alert.alert('Download failed', 'Unable to download your e-ticket right now.');
    } finally {
      setDownloadingTicketId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const ticketSnapshot = useMemo(() => {
    if (!order) {
      return { rows: 'N/A', seats: 'N/A', ticketPriceLabel: 'N/A' };
    }
    const seatLabels = order.items.map((item) => item.seat_label).filter(Boolean) as string[];
    const rowLabels = Array.from(new Set(seatLabels.map((seatLabel) => getRowFromSeat(seatLabel))));
    const uniqueTicketPrices = Array.from(
      new Set(
        order.items
          .map((item) => Number(item.price))
          .filter((price) => Number.isFinite(price))
          .map((price) => price.toFixed(2)),
      ),
    );
    const ticketPriceLabel =
      uniqueTicketPrices.length > 0
        ? uniqueTicketPrices.map((price) => `$${price}`).join(', ')
        : 'N/A';
    return {
      rows: rowLabels.length > 0 ? rowLabels.join(', ') : 'N/A',
      seats: seatLabels.length > 0 ? seatLabels.join(', ') : 'N/A',
      ticketPriceLabel,
    };
  }, [order]);

  if (loading) return <LoadingScreen />;
  if (!order) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const statusStyle = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
  const customerSnapshot = order.customer_snapshot;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ticket Information</Text>
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Artist</Text>
            <Text style={styles.detailValue}>{concert?.artist?.name ?? 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Row</Text>
            <Text style={styles.detailValue}>{ticketSnapshot.rows}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Seats</Text>
            <Text style={styles.detailValue}>{ticketSnapshot.seats}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price each</Text>
            <Text style={styles.detailValue}>{ticketSnapshot.ticketPriceLabel}</Text>
          </View>
        </View>
        <Text style={styles.metaText}>{concert?.title ?? `Concert #${order.concert_id.slice(0, 8)}`}</Text>
        {concert?.date && <Text style={styles.metaSubText}>{formatDate(concert.date)}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Name</Text>
          <Text style={styles.summaryValue}>{customerSnapshot?.customer_name ?? 'N/A'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email</Text>
          <Text style={styles.summaryValue}>{customerSnapshot?.customer_email ?? 'N/A'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phone</Text>
          <Text style={styles.summaryValue}>{customerSnapshot?.customer_phone ?? 'N/A'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Address</Text>
          <Text style={[styles.summaryValue, styles.addressValue]}>
            {customerSnapshot?.customer_address ?? 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValue}>{formatPaymentMethod(order.payment_method)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Paid</Text>
          <Text style={styles.summaryValue}>${order.total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order ID</Text>
          <Text style={styles.summaryValue}>#{order.id.slice(0, 8)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
        </View>
        {order.insurance_fee > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Insurance</Text>
            <Text style={styles.summaryValue}>${order.insurance_fee.toFixed(2)}</Text>
          </View>
        )}
        {order.gift_card_discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gift Card Discount</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              -${order.gift_card_discount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
        </View>
      </View>

      {order.status === 'paid' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>E-Tickets</Text>
          {order.tickets.length === 0 ? (
            <Text style={styles.emptyTicketText}>Your tickets are being prepared. Please refresh shortly.</Text>
          ) : (
            order.tickets.map((ticket, index) => (
              <Button
                key={ticket.id}
                title={`Download E-Ticket${order.tickets.length > 1 ? ` #${index + 1}` : ''}`}
                onPress={() => handleTicketDownload(ticket)}
                loading={downloadingTicketId === ticket.id}
                icon={downloadingTicketId !== ticket.id ? <Ionicons name="download-outline" size={18} color={Colors.white} /> : undefined}
                style={index > 0 ? { marginTop: Spacing.sm } : undefined}
              />
            ))
          )}
        </View>
      )}

      <View style={styles.actions}>
        {order.status === 'paid' && (
          <Button
            title="View Tickets"
            onPress={() => router.push('/dashboard/tickets')}
            icon={<Ionicons name="ticket-outline" size={18} color={Colors.white} />}
          />
        )}
        {order.status === 'pending' && (
          <Button
            title="Cancel Order"
            variant="outline"
            onPress={handleCancel}
            loading={cancelling}
            style={{ borderColor: Colors.error }}
            textStyle={{ color: Colors.error }}
            icon={!cancelling ? <Ionicons name="close-circle-outline" size={18} color={Colors.error} /> : undefined}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.md, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  errorText: { fontSize: 16, color: Colors.textSecondary },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 13, fontWeight: '600' },
  dateText: { fontSize: 13, color: Colors.textSecondary },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: { fontSize: 15, fontWeight: '600', color: Colors.text },
  metaText: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: Spacing.xs },
  metaSubText: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: Spacing.sm,
  },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, color: Colors.text, fontWeight: '500', textAlign: 'right', flex: 1 },
  addressValue: { maxWidth: '70%' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  emptyTicketText: { fontSize: 13, color: Colors.textSecondary },
  actions: { gap: Spacing.sm, marginTop: Spacing.sm },
});
