import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BorderRadius, Colors, Fonts, Overlays, Spacing } from '../../src/constants/theme';
import { Button, Footer } from '../../src/components';
import { BLOG_DETAIL_ROUTE_MAP, BLOG_HERO_STORY, BLOG_NEWS_CARDS } from '../../src/constants/blogContent';

const INITIAL_VISIBLE = 3;

export default function BlogScreen() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleCards = useMemo(() => BLOG_NEWS_CARDS.slice(0, visibleCount), [visibleCount]);
  const hasMore = visibleCount < BLOG_NEWS_CARDS.length;

  const openBlogDetail = (slug: string) => {
    const routedSlug = BLOG_DETAIL_ROUTE_MAP[slug] || slug;
    router.push(`/blog/${routedSlug}` as never);
  };

  const renderItem = ({ item }: { item: (typeof BLOG_NEWS_CARDS)[number] }) => (
    <Pressable
      style={styles.blogCard}
      onPress={() => openBlogDetail(item.slug)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.blogImage}
      />
      <View style={styles.blogBody}>
        <View style={styles.blogMetaTopRow}>
          <Text style={styles.blogMetaTopText}>{item.commentsLabel}</Text>
          <View style={styles.blogViewsRow}>
            <Ionicons name="eye-outline" size={14} color={Colors.textLight} />
            <Text style={styles.blogMetaTopText}>{item.viewsLabel}</Text>
          </View>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.blogMeta} numberOfLines={3}>
          By {item.author} Posted {new Date(item.publishedAtISO).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>
    </Pressable>
  );

  const renderFooter = () =>
    visibleCards.length > 0 ? (
      <View style={styles.footerWrap}>
        {hasMore ? (
          <Button
            title="See More"
            onPress={() => setVisibleCount((previous) => Math.min(previous + 2, BLOG_NEWS_CARDS.length))}
            size="sm"
            style={styles.loadMoreButton}
          />
        ) : null}
        <View style={styles.footerContainer}>
          <Footer containerStyle={styles.footer} />
        </View>
      </View>
    ) : null;

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)' as never)}>
          <Text style={styles.logo}>BNConcert</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.heroStory}
        onPress={() => openBlogDetail(BLOG_HERO_STORY.slug)}
      >
        <Image source={{ uri: BLOG_HERO_STORY.imageUrl }} style={styles.heroImage} />
        <View style={styles.heroArrow}>
          <Ionicons name="arrow-back" size={16} color={Colors.white} />
        </View>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle} numberOfLines={3}>{BLOG_HERO_STORY.title}</Text>
          <Text style={styles.heroMeta} numberOfLines={4}>
            By: {BLOG_HERO_STORY.author}{'\n'}{BLOG_HERO_STORY.postedLabel}{'\n'}{BLOG_HERO_STORY.updatedLabel}
          </Text>
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>Music news and events</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleCards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    ...Fonts.logo,
  },
  heroStory: {
    width: 328,
    height: 459,
    alignSelf: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
  },
  heroArrow: {
    position: 'absolute',
    left: 10,
    top: 203,
    width: 24,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Overlays.category,
    borderRadius: BorderRadius.full,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm + Spacing.xxs,
    paddingBottom: Spacing.md + Spacing.xxs,
    backgroundColor: Overlays.modal,
  },
  heroTitle: {
    ...Fonts.h2,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  heroMeta: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.white,
    opacity: 0.84,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    marginLeft: Spacing.md,
    ...Fonts.heading20,
    color: Colors.text,
  },
  list: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  blogCard: {
    width: 328,
    height: 272,
    alignSelf: 'center',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  blogImage: {
    width: '100%',
    height: 154,
    backgroundColor: Colors.surface,
  },
  blogBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + Spacing.xxs,
    paddingBottom: Spacing.sm + Spacing.xxs,
  },
  blogMetaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  blogViewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  blogMetaTopText: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    color: Colors.textLight,
  },
  blogTitle: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    lineHeight: 18,
    color: Colors.neutral700,
    marginBottom: Spacing.sm + Spacing.xxs,
  },
  blogMeta: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  footerWrap: {
    marginTop: Spacing.sm,
  },
  loadMoreButton: {
    width: 159,
    height: 48,
    paddingVertical: 0,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: 56,
  },
  footer: {
    paddingHorizontal: 0,
    marginTop: 0,
  },
  footerContainer: {
    marginHorizontal: -Spacing.md,
  },
});
