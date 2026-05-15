import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BorderRadius, Colors, Fonts, Overlays, Spacing, Breakpoints, Layout } from '../../src/constants/theme';
import { Button, Footer, Header } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { BLOG_DETAIL_ROUTE_MAP, BLOG_HERO_STORY, BLOG_NEWS_CARDS } from '../../src/constants/blogContent';

const INITIAL_VISIBLE = 3;

const MENU_ROWS = [
  { id: 'menu-contact', icon: 'call-outline', label: 'Contact us', route: '/dashboard/contact' },
  { id: 'menu-tickets', icon: 'ticket-outline', label: 'Tickets', route: '/(tabs)/tickets' },
  { id: 'menu-blog', icon: 'document-text-outline', label: 'Blog', route: '/(tabs)/blog' },
  { id: 'menu-language', icon: 'information-circle-outline', label: 'Language' },
];

export default function BlogScreen() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;
  // compute desktop 3-column card sizing so cards align with hero
  const contentWidth = Math.min(Layout.maxContentWidth, width);
  const cardWidth = Math.floor((contentWidth - Spacing.md * 4) / 3);
  const cardHeight = 360;
  const { isAuthenticated } = useAuth();

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
      {!isDesktop && (
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)' as never)}>
            <Text style={styles.logo}>BNConcert</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={[styles.heroStory, isDesktop ? styles.heroStoryDesktop : null]}
        onPress={() => openBlogDetail(BLOG_HERO_STORY.slug)}
      >
        <Image source={{ uri: BLOG_HERO_STORY.imageUrl }} style={[styles.heroImage, isDesktop ? styles.heroImageDesktop : null]} />
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
      {isDesktop ? (
        <>
          <View style={styles.headerFullWidth}>
            <Header
              containerStyle={{ maxWidth: Layout.maxContentWidth, alignSelf: 'center' }}
              isDesktop={isDesktop}
              isAuthenticated={isAuthenticated}
              menuRows={MENU_ROWS}
              onMenuPress={() => {}}
              showSearch={'inline'}
              searchPlaceholder={'Search here'}
              onProfilePress={() => router.push('/(tabs)/profile' as never)}
              onLoginPress={() => router.push('/(auth)/login' as never)}
            />
          </View>

          <ScrollView contentContainerStyle={styles.listDesktop} showsVerticalScrollIndicator={false}>
            <View style={styles.heroContainer}>
              <Pressable style={styles.heroStoryDesktop} onPress={() => openBlogDetail(BLOG_HERO_STORY.slug)}>
                <Image source={{ uri: BLOG_HERO_STORY.imageUrl }} style={styles.heroImageDesktop} />
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
            </View>

            <Text style={[styles.sectionTitle, styles.sectionTitleDesktop]}>Music news and events</Text>

            <View style={styles.gridDesktop}>
              {visibleCards.map((item) => (
                <Pressable key={item.id} style={[styles.blogCard, styles.blogCardDesktop]} onPress={() => openBlogDetail(item.slug)}>
                  <Image source={{ uri: item.imageUrl }} style={[styles.blogImage, styles.blogImageDesktop]} />
                  <View style={styles.blogBody}>
                    <View style={styles.blogMetaTopRow}>
                      <Text style={styles.blogMetaTopText}>{item.commentsLabel}</Text>
                      <View style={styles.blogViewsRow}>
                        <Ionicons name="eye-outline" size={14} color={Colors.textLight} />
                        <Text style={styles.blogMetaTopText}>{item.viewsLabel}</Text>
                      </View>
                    </View>
                    <Text style={[styles.blogTitle, styles.blogTitleDesktop]} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.blogMeta} numberOfLines={3}>
                      By {item.author} Posted {new Date(item.publishedAtISO).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

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
          </ScrollView>
        </>
      ) : (
        <FlatList
          data={visibleCards}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    marginTop: 0,
  },
  footerContainer: {
    marginHorizontal: -Spacing.md,
  },
  /* desktop styles */
  headerFullWidth: {
    width: '100%',
    backgroundColor: Colors.white,
  },
  heroContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  heroStoryDesktop: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    height: 460,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroImageDesktop: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
  },
  listDesktop: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: 0,
  },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  blogCardDesktop: {
    width: 380,
    height: 360,
    marginRight: Spacing.md,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  blogImageDesktop: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.surface,
  },
  blogTitleDesktop: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 16,
    lineHeight: 20,
    color: Colors.neutral700,
    marginBottom: Spacing.sm + Spacing.xxs,
  },
  sectionTitleDesktop: {
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.md,
    marginLeft: 0,
  },
});
