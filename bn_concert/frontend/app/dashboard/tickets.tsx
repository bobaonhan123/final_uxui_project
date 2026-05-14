import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, Header } from '../../src/components';
import { concertApi, orderApi } from '../../src/api/services';
import { BorderRadius, Colors, Fonts, Spacing, Breakpoints, Layout } from '../../src/constants/theme';
import { resolveImageUrl } from '../../src/utils/images';
import type { Concert, OrderItem, Ticket } from '../../src/types';
import { useAuth } from '../../src/context/AuthContext';

const DEFAULT_TICKET_IMAGE =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80';
const QR_PATTERN = [0, 1, 2, 4, 5, 7, 9, 10, 12, 13, 15, 17, 18, 20, 21, 22, 24];

type TicketCardData = {
  id: string;
  title: string;
  category: string;
  dateTime: string;
  price: string;
  gate: string;
  row: string;
  seat: string;
  imageUri: string;
};

const formatTicketDate = (value?: string | null) => {
  if (!value) return '25 Jun 2025  21:00';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '25 Jun 2025  21:00';
  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart}  ${timePart}`;
};

const getRowFromSeat = (seatLabel?: string | null) => {
  if (!seatLabel) return '23';
  const match = seatLabel.match(/^[A-Za-z0-9]+/);
  return match?.[0] ?? '23';
};

const getSeatNumber = (seatLabel?: string | null, index = 0) => {
  const match = seatLabel?.match(/\d+$/);
  return match?.[0] ?? String(175 + index);
};

const buildPrototypeTickets = (title?: string, countParam?: string): TicketCardData[] => {
  const parsedCount = Number(countParam || 2);
  const count = Math.min(2, Math.max(2, Number.isFinite(parsedCount) ? parsedCount : 2));

  return Array.from({ length: count }).map((_, index) => ({
    id: `prototype-ticket-${index + 1}`,
    title: title || 'Taylor Swift Concert',
    category: 'Live Music',
    dateTime: '25 Jun 2025  21:00',
    price: '$ 200',
    gate: 'Gate 02',
    row: '23',
    seat: String(175 + index),
    imageUri: DEFAULT_TICKET_IMAGE,
  }));
};

const MENU_ROWS = [
  { id: 'menu-contact', icon: 'call-outline', label: 'Contact us', route: '/dashboard/contact' },
  { id: 'menu-tickets', icon: 'ticket-outline', label: 'Tickets', route: '/(tabs)/tickets' },
  { id: 'menu-blog', icon: 'document-text-outline', label: 'Blog', route: '/(tabs)/blog' },
  { id: 'menu-language', icon: 'information-circle-outline', label: 'Language' },
];

const toTicketCard = (
  ticket: Ticket,
  item: OrderItem | undefined,
  concert: Concert | null,
  index: number,
): TicketCardData => ({
  id: ticket.id,
  title: concert?.title || 'Taylor Swift Concert',
  category: concert?.artist?.genre || 'Live Music',
  dateTime: formatTicketDate(concert?.date),
  price: `$ ${Math.round(item?.price ?? concert?.min_price ?? 200)}`,
  gate: 'Gate 02',
  row: getRowFromSeat(item?.seat_label),
  seat: getSeatNumber(item?.seat_label, index),
  imageUri: resolveImageUrl(concert?.image_url) || DEFAULT_TICKET_IMAGE,
});

export default function MyTicketsScreen() {
  const { concertTitle, ticketCount } = useLocalSearchParams<{
    prototype?: string;
    concertTitle?: string;
    ticketCount?: string;
  }>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<TicketCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const { data: orders } = await orderApi.list({ status: 'paid' });
      const allTickets: TicketCardData[] = [];

      for (const order of orders) {
        let concert: Concert | null = null;
        let orderTickets: Ticket[] = order.tickets ?? [];

        try {
          const { data } = await concertApi.get(order.concert_id);
          concert = data;
        } catch {
          concert = null;
        }

        try {
          const { data } = await orderApi.getTickets(order.id);
          orderTickets = data;
        } catch {
          orderTickets = order.tickets ?? [];
        }

        orderTickets.forEach((ticket, index) => {
          allTickets.push(toTicketCard(ticket, order.items?.[index], concert, index));
        });
      }

      setTickets(
        allTickets.length > 0
          ? allTickets
          : buildPrototypeTickets(concertTitle, ticketCount),
      );
    } catch {
      setTickets(buildPrototypeTickets(concertTitle, ticketCount));
    } finally {
      setLoading(false);
    }
  }, [concertTitle, ticketCount]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, [fetchTickets]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {isDesktop ? (
          <View style={styles.headerFullWidth}>
            <Header
              containerStyle={{ maxWidth: Layout.maxContentWidth, alignSelf: 'center' }}
              isDesktop={isDesktop}
              isAuthenticated={isAuthenticated}
              menuRows={MENU_ROWS}
              onMenuRowPress={(row) => row.route ? router.push(row.route) : undefined}
              onMenuPress={() => {}}
              showSearch={'inline'}
              searchPlaceholder={'Search here'}
              onProfilePress={() => router.push('/(tabs)/profile' as never)}
              onLoginPress={() => router.push('/(auth)/login' as never)}
            />
          </View>
        ) : (
          <Header
            showSearch
            onSearchPress={() => router.push('/(tabs)/search' as never)}
            onProfilePress={() => router.push('/(tabs)/profile' as never)}
          />
        )}

        <View style={[styles.contentWrapper, isDesktop ? styles.contentWrapperDesktop : styles.contentWrapperMobile]}>
          <View style={styles.ticketStack}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : (
              tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
            )}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(tabs)' as never)}
              style={({ pressed }) => [styles.actionButton, styles.homeButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.homeButtonText}>Back to homepage</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.actionButton, styles.printButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.printButtonText}>Print Tickets</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footerWrapper}>
          <Footer containerStyle={styles.footer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TicketCard({ ticket }: { ticket: TicketCardData }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;
  const meta = `${ticket.gate}  |  Row ${ticket.row}  |  Seat ${ticket.seat}`;

  return (
    <View style={[styles.ticketCard, isDesktop ? styles.ticketCardDesktop : null]}>
      <ImageBackground
        source={{ uri: ticket.imageUri }}
        imageStyle={[styles.ticketImage, isDesktop ? styles.ticketImageDesktop : null]}
        style={[styles.ticketMain, isDesktop ? styles.ticketMainDesktop : null]}
      >
        <LinearGradient
          colors={['rgba(255,0,153,0.95)', 'rgba(255,255,255,0.04)']}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.ticketBrandBlock, isDesktop ? styles.ticketBrandBlockDesktop : null]}>
          <Text style={styles.ticketCategory}>{ticket.category}</Text>
          <Text style={styles.ticketSite}>www.BNConcert.com</Text>
        </View>
        <QrGlyph />
        <View style={[styles.ticketEventBlock, isDesktop ? styles.ticketEventBlockDesktop : null]}>
          <Text numberOfLines={1} style={[styles.ticketTitle, isDesktop ? styles.ticketTitleDesktop : null]}>{ticket.title}</Text>
          <Text style={[styles.ticketDate, isDesktop ? styles.ticketDateDesktop : null]}>{ticket.dateTime}</Text>
        </View>
        <View style={[styles.ticketBottom, isDesktop ? styles.ticketBottomDesktop : null]}>
          <Text numberOfLines={1} style={[styles.ticketMeta, isDesktop ? styles.ticketMetaDesktop : null]}>{meta}</Text>
          <View style={[styles.pricePill, isDesktop ? styles.pricePillDesktop : null]}>
            <Text style={styles.priceText}>{ticket.price}</Text>
          </View>
        </View>
      </ImageBackground>

      <LinearGradient
        colors={['#4651C9', '#221F92']}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={[styles.ticketStub, isDesktop ? styles.ticketStubDesktop : null]}
      >
        <Text numberOfLines={1} style={styles.stubCategory}>{ticket.category}</Text>
        <Text numberOfLines={1} style={styles.stubTitle}>{ticket.title}</Text>
        <Text numberOfLines={1} style={styles.stubDate}>{ticket.dateTime}</Text>
        <View style={styles.stubPricePill}>
          <Text style={styles.stubPriceText}>{ticket.price}</Text>
        </View>
        <Text numberOfLines={1} style={styles.stubMeta}>{meta}</Text>
        <Text style={styles.stubSite}>www.BNConcert.com</Text>
      </LinearGradient>
      <View style={[styles.ticketDivider, isDesktop ? styles.ticketDividerDesktop : null]} />
    </View>
  );
}

function QrGlyph() {
  return (
    <View style={styles.qrBox}>
      {Array.from({ length: 25 }).map((_, index) => (
        <View
          key={index}
          style={[styles.qrCell, QR_PATTERN.includes(index) && styles.qrCellDark]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  contentWrapperDesktop: {
    paddingHorizontal: 0,
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
  contentWrapperMobile: {
    alignSelf: 'center',
    maxWidth: 430,
    paddingHorizontal: Spacing.md,
  },
  headerFullWidth: {
    width: '100%',
    backgroundColor: Colors.white,
  },
  ticketStack: {
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 252,
  },
  loader: {
    marginTop: 48,
  },
  ticketCard: {
    alignSelf: 'center',
    flexDirection: 'row',
    height: 118,
    overflow: 'hidden',
    position: 'relative',
    width: 328,
  },
  ticketCardDesktop: {
    width: 720,
    height: 200,
  },
  ticketMain: {
    height: 118,
    overflow: 'hidden',
    width: 224,
  },
  ticketMainDesktop: {
    width: 520,
    height: 200,
  },
  ticketImage: {
    borderBottomLeftRadius: BorderRadius.lg,
    borderTopLeftRadius: BorderRadius.lg,
  },
  ticketImageDesktop: {
    borderBottomLeftRadius: BorderRadius.lg,
    borderTopLeftRadius: BorderRadius.lg,
  },
  ticketBrandBlock: {
    left: 16,
    position: 'absolute',
    top: 12,
  },
  ticketBrandBlockDesktop: { left: 20, top: 18 },
  ticketCategory: {
    ...Fonts.body12,
    color: Colors.white,
    lineHeight: 12,
  },
  ticketSite: {
    color: '#D9D9D9',
    fontFamily: Fonts.h3.fontFamily,
    fontSize: 4,
    lineHeight: 8,
    marginLeft: 4,
    marginTop: 2,
  },
  ticketEventBlock: {
    left: 16,
    position: 'absolute',
    top: 57,
    width: 148,
  },
  ticketEventBlockDesktop: { left: 24, top: 80, width: 320 },
  ticketTitle: {
    ...Fonts.body14,
    color: Colors.white,
    lineHeight: 18,
  },
  ticketDate: {
    color: Colors.white,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 8,
    lineHeight: 13,
    marginTop: 2,
  },
  ticketBottom: {
    alignItems: 'center',
    backgroundColor: 'rgba(47,50,166,0.72)',
    bottom: 0,
    flexDirection: 'row',
    height: 22,
    justifyContent: 'space-between',
    left: 0,
    paddingLeft: 18,
    paddingRight: 6,
    position: 'absolute',
    width: 224,
  },
  ticketBottomDesktop: { width: 520, height: 34, paddingLeft: 24, paddingRight: 12 },
  ticketTitleDesktop: {
    ...Fonts.body16,
    color: Colors.white,
    lineHeight: 22,
  },
  ticketDateDesktop: {
    color: Colors.white,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  ticketMetaDesktop: {
    color: Colors.white,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    maxWidth: 360,
  },
  ticketMeta: {
    color: Colors.white,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 6,
    lineHeight: 8,
    maxWidth: 151,
  },
  pricePill: {
    alignItems: 'center',
    backgroundColor: '#373EB2',
    borderRadius: 8,
    height: 15,
    justifyContent: 'center',
    minWidth: 31,
    paddingHorizontal: 4,
  },
  pricePillDesktop: { minWidth: 44, height: 22 },
  priceText: {
    color: Colors.white,
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 6,
    lineHeight: 8,
  },
  qrBox: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 40,
    padding: 3,
    position: 'absolute',
    right: 12,
    top: 11,
    width: 40,
  },
  qrCell: {
    backgroundColor: Colors.white,
    height: 6,
    width: 6,
  },
  qrCellDark: {
    backgroundColor: Colors.neutral950,
  },
  ticketStub: {
    alignItems: 'center',
    borderBottomRightRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    gap: Spacing.sm,
    height: 118,
    overflow: 'hidden',
    padding: 6,
    width: 104,
  },
  ticketStubDesktop: { height: 200, width: 200 },
  stubCategory: {
    color: Colors.white,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 8,
    lineHeight: 13,
  },
  stubTitle: {
    color: Colors.white,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 8,
    lineHeight: 13,
    width: 92,
    textAlign: 'center',
  },
  stubDate: {
    color: '#C8CBEF',
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 6,
    lineHeight: 8,
    textAlign: 'center',
    width: 92,
  },
  stubPricePill: {
    alignItems: 'center',
    backgroundColor: '#7E87DE',
    borderRadius: 8,
    height: 15,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: 4,
  },
  stubPriceText: {
    color: Colors.white,
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 6,
    lineHeight: 8,
  },
  stubMeta: {
    color: Colors.white,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 5,
    lineHeight: 8,
    textAlign: 'center',
    width: 92,
  },
  stubSite: {
    color: '#D9D9D9',
    fontFamily: Fonts.h3.fontFamily,
    fontSize: 4,
    lineHeight: 7,
  },
  ticketDivider: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    height: 118,
    left: 224,
    position: 'absolute',
    top: 0,
    width: 1,
  },
  ticketDividerDesktop: { left: 520, height: 200 },
  actionRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    maxWidth: 360,
    paddingHorizontal: 23,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  homeButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.neutral700,
    borderWidth: 1,
    minWidth: 139,
  },
  printButton: {
    backgroundColor: Colors.primary,
    minWidth: 139,
  },
  homeButtonText: {
    ...Fonts.button12,
    color: Colors.neutral700,
  },
  printButtonText: {
    ...Fonts.button12,
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  footer: {
    marginTop: 0,
  },
  footerWrapper: {
    width: '100%',
    marginTop: 56,
  },
});
