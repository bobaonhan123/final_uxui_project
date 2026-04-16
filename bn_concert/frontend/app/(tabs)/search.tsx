import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Fonts } from '../../src/constants/theme';
import { concertApi, blogApi } from '../../src/api/services';
import ConcertCard from '../../src/components/ConcertCard';
import BlogCard from '../../src/components/BlogCard';
import type { Concert, Blog } from '../../src/types';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setConcerts([]);
      setBlogs([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const [concertRes, blogRes] = await Promise.all([
        concertApi.list({ search: text, limit: 10 }),
        blogApi.list({ search: text, limit: 10 }),
      ]);
      setConcerts(Array.isArray(concertRes.data) ? concertRes.data : []);
      setBlogs(Array.isArray(blogRes.data) ? blogRes.data : []);

      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== text.trim());
        return [text.trim(), ...filtered].slice(0, 8);
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(text), 500);
  };

  const handleClear = () => {
    setQuery('');
    setConcerts([]);
    setBlogs([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleRecentPress = (text: string) => {
    setQuery(text);
    performSearch(text);
    Keyboard.dismiss();
  };

  const hasResults = concerts.length > 0 || blogs.length > 0;

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />;
    }

    if (!searched && !query.trim()) {
      return (
        <View style={styles.idleContainer}>
          {recentSearches.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((s) => (
                <TouchableOpacity key={s} style={styles.recentItem} onPress={() => handleRecentPress(s)}>
                  <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.recentText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyTitle}>Search concerts & blogs</Text>
              <Text style={styles.emptyText}>Find your next experience</Text>
            </View>
          )}
        </View>
      );
    }

    if (searched && !hasResults) {
      return (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try a different search term</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={[]}
        renderItem={null}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.results}
        ListHeaderComponent={
          <>
            {/* Concerts section */}
            {concerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Concerts ({concerts.length})</Text>
                <FlatList
                  data={concerts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.horizontalCard}>
                      <ConcertCard concert={item} onPress={() => router.push(`/concert/${item.id}`)} />
                    </View>
                  )}
                  contentContainerStyle={{ paddingRight: Spacing.lg }}
                />
              </View>
            )}

            {/* Blogs section */}
            {blogs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Blog Posts ({blogs.length})</Text>
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} onPress={() => router.push(`/blog/${blog.slug}`)} />
                ))}
              </View>
            )}
          </>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={handleChangeText}
            placeholder="Search concerts, blog posts..."
            placeholderTextColor={Colors.textLight}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Fonts.body16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  idleContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  recentText: {
    ...Fonts.body14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    ...Fonts.h3,
    marginTop: Spacing.md,
  },
  emptyText: {
    ...Fonts.body14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  results: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Fonts.h3,
    marginBottom: Spacing.sm,
  },
  horizontalCard: {
    width: 180,
    marginRight: Spacing.sm,
  },
});
