import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { orderApi } from '../../src/api/services';
import { LoadingScreen } from '../../src/components';
import type { Order, Ticket } from '../../src/types';

interface TicketDisplay extends Ticket {
  concertTitle?: string;
  sectionName?: string;
  seatLabel?: string;
}

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<TicketDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const { data: orders } = await orderApi.list({ status: 'paid' });
      const allTickets: TicketDisplay[] = [];

      for (const order of orders) {
        try {
          const { data: orderTickets } = await orderApi.getTickets(order.id);
          const items = order.items ?? [];
          orderTickets.forEach((t, i) => {
            allTickets.push({
              ...t,
              concertTitle: `Order #${order.id.slice(0, 8)}`,
              sectionName: items[i]?.section_name ?? 'General',
              seatLabel: items[i]?.seat_label ?? 'N/A',
            });
          });
        } catch {
          // skip
        }
      }
      setTickets(allTickets);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, [fetchTickets]);

  const renderTicket = ({ item }: { item: TicketDisplay }) => (
    <View style={styles.ticket}>
      {/* Left cutout */}
      <View style={styles.cutoutLeft} />
      <View style={styles.cutoutRight} />

      <View style={styles.ticketTop}>
        <Text style={styles.concertTitle} numberOfLines={1}>{item.concertTitle}</Text>
        {item.is_used && (
          <View style={styles.usedBadge}>
            <Text style={styles.usedText}>Used</Text>
          </View>
        )}
      </View>

      <View style={styles.dashedLine} />

      <View style={styles.ticketBody}>
        <View style={styles.ticketInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Section</Text>
            <Text style={styles.infoValue}>{item.sectionName}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Seat</Text>
            <Text style={styles.infoValue}>{item.seatLabel}</Text>
          </View>
        </View>

        {item.holder_name && (
          <View style={styles.holderRow}>
            <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.holderName}>{item.holder_name}</Text>
          </View>
        )}

        <View style={styles.qrSection}>
          <Ionicons name="qr-code-outline" size={40} color={item.is_used ? Colors.textLight : Colors.primary} />
          <Text style={styles.qrText} numberOfLines={1}>{item.qr_code}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="ticket-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Tickets</Text>
            <Text style={styles.emptySubtitle}>Tickets from your paid orders will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  list: { padding: Spacing.md },
  ticket: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  cutoutLeft: {
    position: 'absolute',
    left: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    zIndex: 1,
  },
  cutoutRight: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    zIndex: 1,
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary,
  },
  concertTitle: { fontSize: 15, fontWeight: '700', color: Colors.white, flex: 1 },
  usedBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginLeft: 8,
  },
  usedText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  dashedLine: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderLight,
    borderStyle: 'dashed',
    marginHorizontal: Spacing.lg,
  },
  ticketBody: { padding: Spacing.md },
  ticketInfo: { flexDirection: 'row', gap: Spacing.xl },
  infoBlock: {},
  infoLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 2 },
  holderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  holderName: { fontSize: 13, color: Colors.textSecondary },
  qrSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 4,
  },
  qrText: { fontSize: 11, color: Colors.textLight, fontFamily: 'monospace' },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
