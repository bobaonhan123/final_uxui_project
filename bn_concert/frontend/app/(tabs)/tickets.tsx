import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BorderRadius, Colors, Fonts, Spacing } from '../../src/constants/theme';
import { concertApi, type ConcertDateRange } from '../../src/api/services';
import { Button, ConcertCard, Footer, Header } from '../../src/components';
import type { Concert } from '../../src/types';

type FilterOption = { label: string; value: string };
type DateFilterValue = 'all' | ConcertDateRange;

const PAGE_SIZE = 8;
const DATE_FILTERS: FilterOption[] = [
  { label: 'All Dates', value: 'all' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Next 3 Months', value: 'next_3_months' },
];
const DEFAULT_GENRE_OPTIONS: FilterOption[] = [{ label: 'All Genres', value: 'all' }];
const DEFAULT_LOCATION_OPTIONS: FilterOption[] = [{ label: 'All Locations', value: 'all' }];

export default function TicketsScreen() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [genreFilter, setGenreFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [genreOptions, setGenreOptions] = useState<FilterOption[]>(DEFAULT_GENRE_OPTIONS);
  const [locationOptions, setLocationOptions] = useState<FilterOption[]>(DEFAULT_LOCATION_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const displayConcerts = concerts;

  const fetchFilterOptions = useCallback(async () => {
    try {
      const { data } = await concertApi.getFilters();
      const nextGenres = Array.isArray(data?.genres)
        ? [...new Set(data.genres)]
            .filter(Boolean)
            .map((genre) => ({ label: genre, value: genre }))
        : [];
      const nextLocations = Array.isArray(data?.locations)
        ? [...new Set(data.locations)]
            .filter(Boolean)
            .map((location) => ({ label: location, value: location }))
        : [];

      setGenreOptions([...DEFAULT_GENRE_OPTIONS, ...nextGenres]);
      setLocationOptions([...DEFAULT_LOCATION_OPTIONS, ...nextLocations]);
    } catch {
      setGenreOptions(DEFAULT_GENRE_OPTIONS);
      setLocationOptions(DEFAULT_LOCATION_OPTIONS);
    }
  }, []);

  const fetchConcerts = useCallback(
    async (skip = 0, append = false) => {
      try {
        const params: Parameters<typeof concertApi.list>[0] = {
          skip,
          limit: PAGE_SIZE,
          genre: genreFilter === 'all' ? undefined : genreFilter,
          date_range: dateFilter === 'all' ? undefined : dateFilter,
          location: locationFilter === 'all' ? undefined : locationFilter,
        };

        const { data } = await concertApi.list(params);
        const items = Array.isArray(data) ? data : [];

        if (append) {
          setConcerts((prev) => [...prev, ...items]);
        } else {
          setConcerts(items);
        }
        setHasMore(items.length === PAGE_SIZE);
      } catch {
        // silently fail
      }
    },
    [dateFilter, genreFilter, locationFilter],
  );

  useEffect(() => {
    setLoading(true);
    fetchConcerts(0).finally(() => setLoading(false));
  }, [fetchConcerts]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchConcerts(0), fetchFilterOptions()]);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchConcerts(concerts.length, true);
    setLoadingMore(false);
  };

  const renderItem = ({ item }: { item: Concert }) => (
    <View style={styles.cardWrapper}>
      <ConcertCard
        concert={item}
        variant="tickets"
        onPress={() => router.push(`/concert/${item.id}` as never)}
      />
    </View>
  );

  const renderEmpty = () =>
    !loading ? (
      <View style={styles.empty}>
        <Ionicons name="ticket-outline" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>No concerts found</Text>
        <Text style={styles.emptyText}>Try changing your filter or check back later.</Text>
      </View>
    ) : null;

  const renderFooter = () =>
    displayConcerts.length > 0 ? (
      <View style={styles.footerWrap}>
        {hasMore ? (
          <Button
            title="Load More"
            onPress={handleLoadMore}
            loading={loadingMore}
            style={styles.loadMoreButton}
          />
        ) : null}
        <Footer containerStyle={styles.footer} />
      </View>
    ) : null;

  const renderFilterChips = (
    label: string,
    options: readonly FilterOption[],
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => (
    <Pressable
      style={styles.filterPill}
      onPress={() => {
        const currentIndex = options.findIndex((item) => item.value === selectedValue);
        const nextOption = options[(currentIndex + 1) % options.length] || options[0];
        onSelect(nextOption.value);
      }}
    >
      <Text style={styles.filterPillText}>
        {selectedValue === 'all' ? label : options.find((item) => item.value === selectedValue)?.label || label}
      </Text>
      <Ionicons name="chevron-down" size={16} color={Colors.neutral700} />
    </Pressable>
  );

  const renderHeader = () => (
    <View>
      <Header
        showSearch
        onSearchPress={() => router.push('/(tabs)/search' as never)}
        onProfilePress={() => router.push('/(tabs)/profile' as never)}
      />

      <View style={styles.filters}>
        {renderFilterChips('Location', locationOptions, locationFilter, setLocationFilter)}
        {renderFilterChips('Date', DATE_FILTERS, dateFilter, (value) =>
          setDateFilter(value as DateFilterValue),
        )}
        {renderFilterChips('Category', genreOptions, genreFilter, setGenreFilter)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loaderState}>
          {renderHeader()}
          <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayConcerts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loaderState: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  logo: {
    ...Fonts.logo,
  },
  filters: {
    width: 328,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterPill: {
    width: 106,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.textLight,
  },
  filterPillText: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    lineHeight: 12,
    color: Colors.text,
    maxWidth: 76,
  },
  list: {
    paddingBottom: Spacing.xl,
    flexGrow: 1,
    backgroundColor: Colors.white,
  },
  row: {
    width: 328,
    alignSelf: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    width: 156,
  },
  loader: {
    paddingTop: 120,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 18,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  footerWrap: {
    marginTop: Spacing.sm,
  },
  loadMoreButton: {
    width: 159,
    height: 48,
    paddingVertical: 0,
    alignSelf: 'center',
    marginBottom: 56,
  },
  footer: {
    paddingHorizontal: 0,
    marginTop: 0,
  },
});
