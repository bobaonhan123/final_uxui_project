import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ListRenderItem, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Breakpoints, Colors, ComponentSizes, Layout, Overlays, Spacing } from '../../src/constants/theme';
import { Footer } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';

const SIDE_PADDING = Spacing.md;

const HERO_IMAGE = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80';
const BLOG_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80';
const CATEGORY_FOLK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80';
const CATEGORY_CLASSIC_IMAGE = 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80';
const CATEGORY_POP_IMAGE = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80';
const CATEGORY_JAZZ_IMAGE = 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=500&q=80';
const CATEGORY_ROCK_IMAGE = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=500&q=80';
const ARTIST_1 = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80';
const ARTIST_2 = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80';
const ARTIST_3 = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80';
const ARTIST_4 = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const ARTIST_5 = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80';
const ARTIST_6 = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
const CARD_IMAGE_1 = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&q=80';
const CARD_IMAGE_2 = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80';
const CARD_IMAGE_3 = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80';
const CARD_IMAGE_4 = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=700&q=80';
const CARD_IMAGE_5 = 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=700&q=80';
const CARD_IMAGE_6 = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=700&q=80';
const REVIEW_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

type CarouselCard = {
  id: string;
  title: string;
  city: string;
  date: string;
  image: string;
};

type CategoryCard = {
  id: string;
  title: string;
  image: string;
  isPrimary?: boolean;
};

type ArtistCard = {
  id: string;
  image: string;
};

type ReviewCard = {
  id: string;
  name: string;
  body: string;
  image: string;
};

type BlogPreviewCard = {
  id: string;
  title: string;
  body: string;
  comments: string;
  views: string;
  image: string;
};

type ReviewModalMode = 'hidden' | 'empty' | 'filled' | 'success';

type MenuRow = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
};

const UPCOMING_CONCERTS: CarouselCard[] = [
  { id: 'upcoming-1', title: 'Taylor Swift', city: 'San Diego', date: 'Dec 14, 2026', image: CARD_IMAGE_1 },
  { id: 'upcoming-2', title: 'Celine Dion', city: 'New York City', date: 'Dec 13, 2026', image: CARD_IMAGE_2 },
  { id: 'upcoming-3', title: 'Bui Cong Nam', city: 'Seattle', date: 'Dec 12, 2026', image: CARD_IMAGE_3 },
  { id: 'upcoming-4', title: 'Zach Bryan', city: 'Miami', date: 'Dec 08, 2026', image: CARD_IMAGE_4 },
];

const POPULAR_CONCERTS: CarouselCard[] = [
  { id: 'popular-1', title: 'Bui Cong Nam', city: 'TP, Ho Chi Minh', date: 'Dec 12, 2026', image: CARD_IMAGE_5 },
  { id: 'popular-2', title: 'Thai Le Minh HIeu', city: 'TP. HO chi Minh', date: 'Dec 08, 2026', image: CARD_IMAGE_6 },
  { id: 'popular-3', title: 'Celine Dion', city: 'New York City', date: 'Dec 13, 2026', image: CARD_IMAGE_2 },
  { id: 'popular-4', title: 'Taylor Swift', city: 'San Diego', date: 'Dec 14, 2026', image: CARD_IMAGE_1 },
];

const CATEGORY_CARDS: CategoryCard[] = [
  { id: 'category-folk', title: 'Folk', image: CATEGORY_FOLK_IMAGE, isPrimary: true },
  { id: 'category-classic', title: 'Classic', image: CATEGORY_CLASSIC_IMAGE },
  { id: 'category-pop', title: 'Pop', image: CATEGORY_POP_IMAGE },
  { id: 'category-jazz', title: 'Jazz', image: CATEGORY_JAZZ_IMAGE },
  { id: 'category-rock', title: 'Rock', image: CATEGORY_ROCK_IMAGE },
];

const ARTIST_CARDS: ArtistCard[] = [
  { id: 'artist-1', image: ARTIST_1 },
  { id: 'artist-2', image: ARTIST_2 },
  { id: 'artist-3', image: ARTIST_3 },
  { id: 'artist-4', image: ARTIST_4 },
  { id: 'artist-5', image: ARTIST_5 },
  { id: 'artist-6', image: ARTIST_6 },
  { id: 'artist-7', image: ARTIST_3 },
  { id: 'artist-8', image: ARTIST_5 },
  { id: 'artist-9', image: ARTIST_2 },
  { id: 'artist-10', image: ARTIST_6 },
];

const HOME_BLOGS: BlogPreviewCard[] = [
  {
    id: 'blog-1',
    title: 'Ariana Grande: A Pop Sensation Redefining the Music Industry',
    body: 'Ariana Grande has become a household name, dominating the music industry with powerful vocals and charismatic persona.',
    comments: '105 Comments',
    views: '100K',
    image: BLOG_IMAGE,
  },
  {
    id: 'blog-2',
    title: 'Rihanna Performs First Concert in Eight Years at Pre-Wedding Party in India',
    body: 'Rihanna hit the stage at a lavish pre-wedding event in India to perform her first concert in nearly eight years.',
    comments: '35 Comments',
    views: '10K',
    image: CARD_IMAGE_1,
  },
  {
    id: 'blog-3',
    title: 'Azealia Banks Announces Back To The Union Jack UK Tour For September',
    body: 'The New York singer and rapper will kick off her Back To The Union Jack Tour at London venues before more stops.',
    comments: '85 Comments',
    views: '15K',
    image: CARD_IMAGE_6,
  },
];

const CUSTOMER_REVIEWS: ReviewCard[] = [
  {
    id: 'review-1',
    name: 'Sousan Cruse',
    body: 'I highly recommended! Here I can send my friends gift cards so they can buy their favourite concerts! This is how I surprised my gf <3 <3',
    image: ARTIST_5,
  },
  {
    id: 'review-2',
    name: 'Paula Green',
    body: 'I have bought my tickets from BNConcert many times, the experience is smooth and easy, having the ticket saved in my application was calming, plus I can easily save or share my favourite concerts! recommended!',
    image: REVIEW_AVATAR,
  },
  {
    id: 'review-3',
    name: 'Alastair Bard',
    body: 'Buying and searching for tickets has never been easier! The website had the best prices compared to other ticket selling platforms.',
    image: ARTIST_6,
  },
];

const MENU_ROWS: MenuRow[] = [
  { id: 'menu-contact', icon: 'call-outline', label: 'Contact us', route: '/dashboard/contact' },
  { id: 'menu-tickets', icon: 'ticket-outline', label: 'Tickets', route: '/(tabs)/tickets' },
  { id: 'menu-blog', icon: 'document-text-outline', label: 'Blog', route: '/(tabs)/blog' },
  { id: 'menu-language', icon: 'information-circle-outline', label: 'Language' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [reviewModalMode, setReviewModalMode] = useState<ReviewModalMode>('hidden');
  const isDesktop = width >= Breakpoints.desktop;
  const contentWidth = isDesktop
    ? Math.min(Layout.maxContentWidth, Math.max(0, width - Layout.desktopHorizontalPadding * 2))
    : width;
  const desktopConcertCardWidth = Math.max(0, (contentWidth - Spacing.lg * 3) / 4);
  const desktopReviewCardWidth = Math.max(0, (contentWidth - Spacing.lg * 2 - Spacing.xxl * 2) / 3);
  const desktopHeroImageWidth = isDesktop
    ? Math.max(contentWidth * 0.52, width - Math.max(0, (width - contentWidth) / 2) - contentWidth * 0.49)
    : 0;
  const contentShellStyle: StyleProp<ViewStyle> = [
    styles.contentShell,
    isDesktop ? { width: contentWidth } : null,
  ];
  const reviewFormWidth = Math.min(ComponentSizes.modalWidth, Math.max(0, width - SIDE_PADDING * 2));
  const desktopConcertCardStyle: StyleProp<ViewStyle> = isDesktop
    ? { width: desktopConcertCardWidth }
    : null;
  const desktopReviewCardStyle: StyleProp<ViewStyle> = isDesktop ? { width: desktopReviewCardWidth } : null;
  const horizontalListContentStyle = isDesktop
    ? styles.horizontalListContentDesktop
    : styles.horizontalListContent;
  const categoryListContentStyle = isDesktop ? styles.categoryListContentDesktop : styles.categoryListContent;
  const artistListContentStyle = isDesktop ? styles.artistListContentDesktop : styles.artistListContent;

  const onOpenReview = useCallback(() => {
    setReviewModalMode('empty');
  }, []);

  const onCloseReview = useCallback(() => {
    setReviewModalMode('hidden');
  }, []);

  const onPromoteReview = useCallback(() => {
    setReviewModalMode((previousMode) => (previousMode === 'empty' ? 'filled' : previousMode));
  }, []);

  const onSubmitReview = useCallback(() => {
    setReviewModalMode((previousMode) => (previousMode === 'filled' ? 'success' : 'filled'));
  }, []);

  const onSeeAllTickets = useCallback(() => {
    router.push('/(tabs)/tickets' as never);
  }, [router]);

  const onSeeAllBlogs = useCallback(() => {
    router.push('/(tabs)/blog' as never);
  }, [router]);

  const onSearch = useCallback(() => {
    router.push('/(tabs)/search' as never);
  }, [router]);

  const onOpenBanner = useCallback(() => {
    router.push('/(tabs)/tickets' as never);
  }, [router]);

  const onOpenProfile = useCallback(() => {
    router.push('/(tabs)/profile' as never);
  }, [router]);

  const onOpenLogin = useCallback(() => {
    router.push('/(auth)/login' as never);
  }, [router]);

  const onMenuRowPress = useCallback(
    (row: MenuRow) => {
      setMenuVisible(false);
      if (row.route) {
        router.push(row.route as never);
      }
    },
    [router],
  );

  const renderConcertCardNode = (item: CarouselCard, cardStyle?: StyleProp<ViewStyle>) => (
    <Pressable style={[styles.concertCard, cardStyle]} onPress={onSeeAllTickets}>
      <Image source={{ uri: item.image }} style={styles.concertImage} />
      <View style={styles.concertOverlayWrapper}>
        <Image source={{ uri: item.image }} style={styles.concertOverlayBlurImage} blurRadius={50} />
        <View style={styles.concertOverlayGlass}>
          <View style={styles.concertOverlayCurveBack} />
          <View style={styles.concertOverlayCurveFront} />
        </View>
        <View style={styles.concertTextWrapper}>
          <Text style={styles.concertTitle}>{item.title}</Text>
          <Text style={styles.concertCity}>{item.city}</Text>
          <Text style={styles.concertDate}>{item.date}</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderConcertCard: ListRenderItem<CarouselCard> = ({ item }) => renderConcertCardNode(item);

  const renderCategoryCard: ListRenderItem<CategoryCard> = ({ item }) => (
    <Pressable style={[styles.categoryCard, isDesktop ? styles.categoryCardDesktop : null]} onPress={onSeeAllTickets}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryLabelOverlay}>
        <Text style={[styles.categoryLabel, item.isPrimary ? styles.categoryLabelPrimary : null]}>{item.title}</Text>
      </View>
    </Pressable>
  );

  const renderArtistCard: ListRenderItem<ArtistCard> = ({ item }) => (
    <Pressable style={styles.artistCard} onPress={onSeeAllTickets}>
      <Image source={{ uri: item.image }} style={styles.artistImage} />
    </Pressable>
  );

  const renderBlogPreviewCard = (item: BlogPreviewCard, cardStyle?: StyleProp<ViewStyle>) => (
    <Pressable style={[styles.blogCard, cardStyle]} onPress={onSeeAllBlogs}>
      <Image source={{ uri: item.image }} style={styles.blogCardImage} />
      <View style={styles.blogCardBody}>
        <View style={styles.blogMetaRow}>
          <Text style={styles.blogMetaText}>{item.comments}</Text>
          <View style={styles.blogViewRow}>
            <Ionicons name="eye-outline" size={16} color={Colors.textLight} />
            <Text style={styles.blogMetaText}>{item.views}</Text>
          </View>
        </View>
        <Text style={styles.blogCardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {isDesktop ? (
          <Text style={styles.blogCardExcerpt} numberOfLines={3}>
            {item.body}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );

  const renderReviewCardNode = (item: ReviewCard, cardStyle?: StyleProp<ViewStyle>) => (
    <View style={[styles.reviewCard, cardStyle]}>
      <View style={styles.reviewCardHeader}>
        <Text style={styles.reviewCardName}>{item.name}</Text>
        <Image source={{ uri: item.image }} style={styles.reviewCardAvatar} />
      </View>
      <Text style={styles.reviewQuoteIcon}>“</Text>
      <Text numberOfLines={6} style={styles.reviewCardBody}>
        {item.body}
      </Text>
      <Text style={[styles.reviewQuoteIcon, styles.reviewQuoteIconBottom]}>”</Text>
    </View>
  );

  const renderReviewCard: ListRenderItem<ReviewCard> = ({ item }) => renderReviewCardNode(item);

  const reviewFilled = reviewModalMode === 'filled';
  const reviewStars = Array.from({ length: 5 }, (_, index) => (
    <Ionicons
      key={index}
      name={reviewFilled ? 'star' : 'star-outline'}
      size={isDesktop ? 32 : 28}
      color={Colors.primary}
      style={styles.reviewStarIcon}
    />
  ));

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} translucent={false} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBleed}>
          <View style={contentShellStyle}>
            <View style={[styles.headerRow, isDesktop ? styles.headerRowDesktop : styles.headerRowMobile]}>
              <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)' as never)}>
                <Text style={[styles.logoText, isDesktop ? styles.logoTextDesktop : null]}>BNConcert</Text>
              </Pressable>
              {isDesktop ? (
                <View style={styles.desktopNavRow}>
                  {MENU_ROWS.map((row) => (
                    <Pressable key={row.id} style={styles.desktopNavItem} onPress={() => onMenuRowPress(row)}>
                      {row.label === 'Language' ? null : (
                        <Ionicons name={row.icon} size={18} color={Colors.neutral700} />
                      )}
                      <Text style={styles.desktopNavText}>{row.label === 'Language' ? 'En' : row.label}</Text>
                      {row.label === 'Language' ? (
                        <Ionicons name="chevron-down-outline" size={18} color={Colors.neutral700} />
                      ) : null}
                    </Pressable>
                  ))}
                  <Pressable
                    style={styles.desktopLoginButton}
                    onPress={isAuthenticated ? onOpenProfile : onOpenLogin}
                  >
                    <Ionicons name="person-outline" size={20} color={Colors.white} />
                    <Text style={styles.desktopLoginText}>{isAuthenticated ? 'Account' : 'Login'}</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.headerIconRow}>
                  <Pressable style={styles.profileIconButton} onPress={isAuthenticated ? onOpenProfile : onOpenLogin}>
                    <Ionicons name="person-circle-outline" size={24} color={Colors.neutral700} />
                  </Pressable>
                  <Pressable style={styles.menuIconButton} onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu-outline" size={24} color={Colors.neutral700} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        {isDesktop ? (
          <View style={styles.heroSearchAreaDesktop}>
            <View style={styles.searchDarkBandDesktop} />
            <View style={[styles.heroSearchInnerDesktop, { width: contentWidth }]}>
              <View style={styles.heroLeftColumnDesktop}>
                <View style={styles.heroTextBlockDesktop}>
                  <Text style={[styles.bannerTitle, styles.bannerTitleDesktop]}>Beyoncé Live in Concert!</Text>
                  <Text style={[styles.bannerSubtitle, styles.bannerSubtitleDesktop]}>A Night to Remember!</Text>
                  <Text style={[styles.bannerDescription, styles.bannerDescriptionDesktop]}>
                    Get ready for an extraordinary night with Beyoncé's phenomenal and unforgettable moments.
                  </Text>
                  <Pressable style={styles.bannerDesktopButton} onPress={onOpenBanner}>
                    <Text style={styles.bannerDesktopButtonText}>Get Ticket</Text>
                  </Pressable>
                </View>

                <View style={styles.searchBlockDesktop}>
                  <Text style={styles.searchTitle}>Find your favorite concert</Text>
                  <Pressable style={[styles.searchBox, styles.searchBoxDesktop]} onPress={onSearch}>
                    <Ionicons name="search-outline" size={22} color={Colors.textLight} />
                    <Text style={[styles.searchBoxText, styles.searchBoxTextDesktop]}>
                      Search by Artist, Event or Venue
                    </Text>
                  </Pressable>
                  <View style={[styles.searchTagRow, styles.searchTagRowDesktop]}>
                    {['#Summer', '#Jazz', '#TaylorSwift', '#NewYork'].map((tag) => (
                      <View key={tag} style={[styles.searchTag, styles.searchTagDesktop]}>
                        <Text style={[styles.searchTagText, styles.searchTagTextDesktop]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <Pressable style={[styles.heroImageBleedDesktop, { width: desktopHeroImageWidth }]} onPress={onOpenBanner}>
                <Image source={{ uri: HERO_IMAGE }} style={styles.bannerDesktopImage} />
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={contentShellStyle}>
            <Pressable
              style={[styles.bannerCard, styles.bannerCardMobile]}
              onPress={onOpenBanner}
            >
              <Image source={{ uri: HERO_IMAGE }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerTextBlock}>
                <Text style={styles.bannerTitle}>Beyoncé Live in Concert!</Text>
                <Text style={styles.bannerSubtitle}>A Night to Remember!</Text>
              </View>
            </Pressable>
            </View>

            <View style={[styles.searchSection, styles.searchSectionMobile]}>
              <Pressable style={styles.searchBox} onPress={onSearch}>
                <Ionicons name="search-outline" size={16} color={Colors.textLight} />
                <Text style={styles.searchBoxText}>Search by Artist, Event or Venue</Text>
              </Pressable>
              <View style={styles.searchTagRow}>
                {['#Summer', '#Jazz', '#TaylorSwift'].map((tag) => (
                  <View key={tag} style={styles.searchTag}>
                    <Text style={styles.searchTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={contentShellStyle}>
            <View style={[styles.sectionHeader, isDesktop ? styles.sectionHeaderDesktop : styles.sectionHeaderMobile]}>
              <Text style={styles.sectionHeaderTitle}>Upcoming concerts</Text>
              <Pressable onPress={onSeeAllTickets}>
                <Text style={styles.sectionHeaderAction}>See All</Text>
              </Pressable>
            </View>
            {isDesktop ? (
              <View style={styles.desktopConcertGrid}>
                {UPCOMING_CONCERTS.map((item) => (
                  <View key={item.id} style={styles.desktopConcertGridCell}>
                    {renderConcertCardNode(item, desktopConcertCardStyle)}
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                horizontal
                data={UPCOMING_CONCERTS}
                keyExtractor={(item) => item.id}
                renderItem={renderConcertCard}
                contentContainerStyle={styles.horizontalListContent}
                ItemSeparatorComponent={() => <View style={styles.space16} />}
                showsHorizontalScrollIndicator={false}
              />
            )}

            <View style={[styles.sectionHeader, isDesktop ? styles.sectionHeaderDesktop : styles.sectionHeaderMobile]}>
              <Text style={styles.sectionHeaderTitle}>Popular near you</Text>
              <Pressable onPress={onSeeAllTickets}>
                <Text style={styles.sectionHeaderAction}>See All</Text>
              </Pressable>
            </View>
            {isDesktop ? (
              <View style={styles.desktopConcertGrid}>
                {POPULAR_CONCERTS.map((item) => (
                  <View key={item.id} style={styles.desktopConcertGridCell}>
                    {renderConcertCardNode(item, desktopConcertCardStyle)}
                  </View>
                ))}
              </View>
            ) : (
              <FlatList
                horizontal
                data={POPULAR_CONCERTS}
                keyExtractor={(item) => item.id}
                renderItem={renderConcertCard}
                contentContainerStyle={horizontalListContentStyle}
                ItemSeparatorComponent={() => <View style={styles.space16} />}
                showsHorizontalScrollIndicator={false}
              />
            )}

            <View style={[styles.singleHeader, isDesktop ? styles.sectionHeaderDesktop : styles.sectionHeaderMobile]}>
              <Text style={styles.sectionHeaderTitle}>Explore by category</Text>
            </View>
            <FlatList
              horizontal
              data={CATEGORY_CARDS}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryCard}
              contentContainerStyle={categoryListContentStyle}
              ItemSeparatorComponent={() => <View style={isDesktop ? styles.space24 : styles.space17} />}
              showsHorizontalScrollIndicator={false}
            />

            <View style={[styles.singleHeader, isDesktop ? styles.sectionHeaderDesktop : styles.sectionHeaderMobile]}>
              <Text style={styles.sectionHeaderTitle}>Artists</Text>
            </View>
            <View style={isDesktop ? styles.artistCarouselDesktop : null}>
              {isDesktop ? (
                <Pressable style={[styles.artistArrow, styles.artistArrowLeft]} onPress={onSeeAllTickets}>
                  <Ionicons name="chevron-back-outline" size={32} color={Colors.neutral700} />
                </Pressable>
              ) : null}
              <FlatList
                horizontal
                data={ARTIST_CARDS}
                keyExtractor={(item) => item.id}
                renderItem={renderArtistCard}
                contentContainerStyle={artistListContentStyle}
                ItemSeparatorComponent={() => <View style={styles.space24} />}
                showsHorizontalScrollIndicator={false}
              />
              {isDesktop ? (
                <Pressable style={[styles.artistArrow, styles.artistArrowRight]} onPress={onSeeAllTickets}>
                  <Ionicons name="chevron-forward-outline" size={32} color={Colors.neutral700} />
                </Pressable>
              ) : null}
            </View>

        </View>

        <View style={[styles.blogSection, isDesktop ? styles.blogSectionDesktop : null]}>
          <View style={[styles.blogInner, isDesktop ? { width: contentWidth } : null]}>
              <View style={styles.blogSectionHeader}>
                <View>
                  <Text style={[styles.blogSectionTitle, isDesktop ? null : styles.blogSectionTitleMobile]}>
                    The latest in music, tours & artists
                  </Text>
                  {isDesktop ? (
                    <Text style={styles.blogSectionSubtitle}>
                      Uncovering the hottest music, breaking tour news, and artist spotlights
                    </Text>
                  ) : null}
                </View>
                {isDesktop ? (
                  <Pressable onPress={onSeeAllBlogs}>
                    <Text style={styles.blogExploreButtonText}>Explore All</Text>
                  </Pressable>
                ) : null}
              </View>
              {isDesktop ? (
                <View style={styles.blogGrid}>
                  {HOME_BLOGS.map((item) => (
                    <React.Fragment key={item.id}>{renderBlogPreviewCard(item, styles.blogCardDesktop)}</React.Fragment>
                  ))}
                </View>
              ) : (
                renderBlogPreviewCard(HOME_BLOGS[0])
              )}
              {isDesktop ? null : (
                <Pressable style={styles.blogExploreButton} onPress={onSeeAllBlogs}>
                  <Text style={styles.blogExploreButtonText}>Explore All</Text>
                </Pressable>
              )}
            </View>
          </View>

        <View style={contentShellStyle}>

            <View style={[styles.customerSection, isDesktop ? styles.customerSectionDesktop : null]}>
              <Text style={styles.customerTitle}>What our customers say</Text>
              <Text style={styles.customerSubtitle}>Real reviews from concert enthusiasts who love our service</Text>
            </View>
            {isDesktop ? (
              <View style={styles.reviewCarouselDesktop}>
                <Pressable style={[styles.reviewArrow, styles.reviewArrowLeft]} onPress={onOpenReview}>
                  <Ionicons name="chevron-back-outline" size={32} color={Colors.neutral700} />
                </Pressable>
                <View style={styles.reviewGridDesktop}>
                  {CUSTOMER_REVIEWS.map((item) => (
                    <React.Fragment key={item.id}>{renderReviewCardNode(item, desktopReviewCardStyle)}</React.Fragment>
                  ))}
                </View>
                <Pressable style={[styles.reviewArrow, styles.reviewArrowRight]} onPress={onOpenReview}>
                  <Ionicons name="chevron-forward-outline" size={32} color={Colors.neutral700} />
                </Pressable>
              </View>
            ) : (
              <FlatList
                horizontal
                data={CUSTOMER_REVIEWS}
                keyExtractor={(item) => item.id}
                renderItem={renderReviewCard}
                contentContainerStyle={styles.reviewListContent}
                ItemSeparatorComponent={() => <View style={styles.space16} />}
                showsHorizontalScrollIndicator={false}
              />
            )}

            <Pressable style={styles.reviewTriggerButton} onPress={onOpenReview}>
              <Text style={styles.reviewTriggerText}>Have a Thought?</Text>
              <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
            </Pressable>
        </View>

        <Footer containerStyle={styles.footer} />
      </ScrollView>

      {menuVisible ? (
        <View style={[styles.menuOverlay, { paddingTop: insets.top }]}> 
          <View style={styles.menuTopRow}>
            <Pressable style={styles.menuBackButton} onPress={() => setMenuVisible(false)}>
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)' as never)}>
              <Text style={styles.logoText}>BNConcert</Text>
            </Pressable>
          </View>

          <Pressable style={styles.menuLoginCard} onPress={onOpenLogin}>
            <Text style={styles.menuLoginText}>Log in</Text>
          </Pressable>

          <View style={styles.menuCard}>
            {MENU_ROWS.map((row, index) => (
              <Pressable
                key={row.id}
                style={[styles.menuCardRow, index === MENU_ROWS.length - 1 ? styles.menuCardRowLast : null]}
                onPress={() => onMenuRowPress(row)}
              >
                <View style={styles.menuCardRowLeft}>
                  <Ionicons name={row.icon} size={18} color={Colors.neutral700} />
                  <Text style={styles.menuCardRowText}>{row.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.neutral700} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {reviewModalMode !== 'hidden' ? (
        <View style={[styles.reviewOverlay, isDesktop ? styles.reviewOverlayDesktop : null]}>
          {reviewModalMode === 'success' ? (
            <View style={[styles.reviewSuccessCard, isDesktop ? styles.reviewSuccessCardDesktop : null]}>
              <Ionicons
                name={isDesktop ? 'star' : 'checkmark-circle'}
                size={isDesktop ? 64 : 48}
                color={Colors.primary}
                style={styles.reviewSuccessIcon}
              />
              <Text style={styles.reviewSuccessText}>Thank you for submitting your review!</Text>
              <Pressable
                style={[styles.reviewSubmitButton, isDesktop ? styles.reviewSubmitButtonDesktop : null]}
                onPress={onCloseReview}
              >
                <Text style={styles.reviewSubmitButtonText}>Keep Browsing</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.reviewFormCard, isDesktop ? styles.reviewFormCardDesktop : null]}>
              <Text style={[styles.reviewTitle, { width: isDesktop ? 420 : reviewFormWidth - Spacing.xl }]}>
                Leave a Review for BNConcert
              </Text>
              <Text style={styles.reviewSubtitle}>How would you rate for BNConcert ?</Text>

              <Pressable style={styles.reviewStarsButton} onPress={onPromoteReview}>
                <View style={styles.reviewStarsRow}>{reviewStars}</View>
              </Pressable>

              <Pressable style={styles.reviewField} onPress={onPromoteReview}>
                <Text style={styles.reviewFieldLabel}>First name</Text>
                <View style={styles.reviewFieldInput}>
                  <Text style={reviewFilled ? styles.reviewValueText : styles.reviewPlaceholderText}>
                    {reviewFilled ? 'Sylvie' : 'Enter Input'}
                  </Text>
                  {isDesktop ? null : <Ionicons name="eye-off-outline" size={16} color={Colors.textSecondary} />}
                </View>
              </Pressable>

              <Pressable style={styles.reviewField} onPress={onPromoteReview}>
                <Text style={styles.reviewFieldLabel}>Last name</Text>
                <View style={styles.reviewFieldInput}>
                  <Text style={reviewFilled ? styles.reviewValueText : styles.reviewPlaceholderText}>
                    {reviewFilled ? 'Van Bleek' : 'Enter Input'}
                  </Text>
                  {isDesktop ? null : <Ionicons name="eye-off-outline" size={16} color={Colors.textSecondary} />}
                </View>
              </Pressable>

              <Pressable style={styles.reviewField} onPress={onPromoteReview}>
                {isDesktop ? <Text style={styles.reviewFieldLabel}>Review</Text> : null}
                <View style={[styles.reviewTextArea, isDesktop ? styles.reviewTextAreaDesktop : null]}>
                  <Text style={reviewFilled ? styles.reviewTextAreaValue : styles.reviewTextAreaPlaceholder}>
                    {reviewFilled
                      ? 'BNConcert is a website I check regularly to find out about new concerts around my location...'
                      : isDesktop ? 'Write your review' : 'Write a review....'}
                  </Text>
                  {isDesktop ? null : <Ionicons name="eye-off-outline" size={16} color={Colors.textSecondary} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.reviewSubmitButton, isDesktop ? styles.reviewSubmitButtonDesktop : null]}
                onPress={onSubmitReview}
              >
                <Text style={styles.reviewSubmitButtonText}>Submit Review</Text>
              </Pressable>

              <Text style={styles.reviewDisclaimer}>
                All reviews on Cool Co. Reviews are verified within 48 hours before posting to ensure authenticity and
                accuracy.
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    backgroundColor: Colors.white,
  },
  contentShell: {
    width: '100%',
    alignSelf: 'center',
  },
  headerBleed: {
    width: '100%',
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
  },
  headerRowMobile: {
    height: ComponentSizes.headerHeight,
    paddingHorizontal: SIDE_PADDING,
  },
  headerRowDesktop: {
    height: ComponentSizes.headerHeightDesktop,
  },
  logoText: {
    fontFamily: 'DrSugiyama_400Regular',
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.8,
    color: Colors.primary,
  },
  logoTextDesktop: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 1.2,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  desktopNavItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  desktopNavText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.neutral700,
  },
  desktopLoginButton: {
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  desktopLoginText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.white,
  },
  profileIconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuIconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCard: {
    overflow: 'hidden',
    zIndex: 3,
    elevation: 3,
  },
  heroSearchAreaDesktop: {
    position: 'relative',
    width: '100%',
    height: 580,
    backgroundColor: Colors.white,
    overflow: 'visible',
  },
  searchDarkBandDesktop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    backgroundColor: Colors.neutral700,
  },
  heroSearchInnerDesktop: {
    position: 'relative',
    alignSelf: 'center',
    height: '100%',
    overflow: 'visible',
  },
  heroLeftColumnDesktop: {
    position: 'relative',
    width: '49%',
    height: '100%',
    zIndex: 2,
  },
  heroTextBlockDesktop: {
    paddingTop: 72,
    paddingRight: Spacing.xl,
  },
  searchBlockDesktop: {
    position: 'absolute',
    left: 0,
    bottom: 50,
    width: '100%',
  },
  heroImageBleedDesktop: {
    position: 'absolute',
    left: '49%',
    paddingRight: 200,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  bannerCardMobile: {
    marginTop: Spacing.md,
    marginHorizontal: SIDE_PADDING,
    height: 312,
    borderRadius: BorderRadius.lg,
  },
  bannerCardDesktop: {
    height: 472,
    borderRadius: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    zIndex: 4,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerDesktopTextBlock: {
    width: '49%',
    paddingTop: 80,
    paddingLeft: 0,
    paddingRight: Spacing.xl,
    justifyContent: 'flex-start',
  },
  bannerDesktopImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 91,
    backgroundColor: Overlays.banner,
  },
  bannerTextBlock: {
    position: 'absolute',
    left: SIDE_PADDING,
    right: SIDE_PADDING,
    bottom: 14,
    zIndex: 4,
    elevation: 4,
  },
  bannerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: Colors.text,
  },
  bannerTitleDesktop: {
    fontSize: 36,
    lineHeight: 44,
  },
  bannerSubtitle: {
    marginTop: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  bannerSubtitleDesktop: {
    marginTop: Spacing.md,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
  },
  bannerDescription: {
    marginTop: Spacing.md,
    maxWidth: 388,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  bannerDescriptionDesktop: {
    marginTop: Spacing.md,
    maxWidth: 520,
    fontSize: 16,
    lineHeight: 24,
  },
  bannerDesktopButton: {
    marginTop: Spacing.xl,
    width: 176,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerDesktopButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.white,
  },
  searchSection: {
    backgroundColor: Colors.neutral700,
    zIndex: 1,
    elevation: 1,
    width: '100%',
  },
  searchSectionMobile: {
    marginTop: -53,
    height: 168,
    paddingTop: 69,
    paddingHorizontal: SIDE_PADDING,
  },
  searchSectionDesktop: {
    marginTop: -220,
    height: 220,
    paddingTop: 36,
    paddingHorizontal: 0,
  },
  searchInner: {
    width: '100%',
    alignSelf: 'center',
  },
  searchTitle: {
    marginBottom: Spacing.lg,
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    lineHeight: 28,
    color: Colors.white,
  },
  searchBox: {
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.textMuted,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBoxDesktop: {
    width: 440,
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    width: 16,
    height: 16,
  },
  searchBoxText: {
    marginLeft: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.textLight,
  },
  searchBoxTextDesktop: {
    marginLeft: Spacing.sm,
    fontSize: 16,
    lineHeight: 22,
  },
  searchTagRow: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  searchTagRowDesktop: {
    marginTop: Spacing.md,
  },
  searchTag: {
    backgroundColor: Colors.textMuted,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + Spacing.xs,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  searchTagDesktop: {
    marginLeft: 0,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  searchTagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.textLight,
  },
  searchTagTextDesktop: {
    fontSize: 14,
    lineHeight: 18,
  },
  sectionHeader: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderMobile: {
    paddingHorizontal: SIDE_PADDING,
  },
  sectionHeaderDesktop: {
    paddingHorizontal: 0,
  },
  singleHeader: {
    marginTop: 24,
  },
  sectionHeaderTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.text,
  },
  sectionHeaderAction: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.neutral950,
  },
  horizontalListContent: {
    marginTop: 16,
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
  },
  horizontalListContentDesktop: {
    marginTop: Spacing.md,
  },
  desktopConcertGrid: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  desktopConcertGridCell: {
    paddingHorizontal: Spacing.sm,
  },
  concertCard: {
    width: 242,
    height: 258,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  concertImage: {
    width: '100%',
    height: 190,
    borderRadius: BorderRadius.lg,
  },
  concertOverlayWrapper: {
    marginTop: -48,
    height: 116,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  concertOverlayBlurImage: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.08 }],
  },
  concertOverlayGlass: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  concertOverlayCurveBack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -108,
    height: 124,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  concertOverlayCurveFront: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -8,
    height: 124,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  concertTextWrapper: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  concertTitle: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text,
  },
  concertCity: {
    width: '100%',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.neutral700,
  },
  concertDate: {
    width: '100%',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.neutral700,
  },
  categoryListContent: {
    marginTop: 16,
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
  },
  categoryListContentDesktop: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  categoryCard: {
    width: 156,
    height: 136,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  categoryCardDesktop: {
    width: 225,
    height: 152,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryLabelOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 46,
    paddingVertical: 4,
    backgroundColor: Overlays.category,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.white,
    textAlign: 'center',
  },
  categoryLabelPrimary: {
    fontSize: 24,
    lineHeight: 32,
  },
  artistListContent: {
    marginTop: 16,
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
  },
  artistListContentDesktop: {
    marginTop: Spacing.md,
    paddingLeft: Spacing.xxl,
    paddingRight: Spacing.xxl,
    alignItems: 'center',
  },
  artistCarouselDesktop: {
    position: 'relative',
  },
  artistArrow: {
    position: 'absolute',
    top: 60,
    zIndex: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistArrowLeft: {
    left: 0,
  },
  artistArrowRight: {
    right: 0,
  },
  artistCard: {
    width: 119,
    height: 119,
    borderRadius: 60,
    overflow: 'hidden',
  },
  artistImage: {
    width: '100%',
    height: '100%',
  },
  blogSection: {
    marginTop: 24,
    height: 385,
    backgroundColor: Colors.darkSurface,
    paddingTop: 16,
    width: '100%',
  },
  blogSectionDesktop: {
    height: 488,
    marginTop: Spacing.xl,
    paddingHorizontal: 0,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  blogInner: {
    width: '100%',
    alignSelf: 'center',
  },
  blogSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  blogSectionTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.white,
  },
  blogSectionTitleMobile: {
    marginHorizontal: SIDE_PADDING,
  },
  blogSectionSubtitle: {
    marginTop: Spacing.sm,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: Colors.textLight,
  },
  blogGrid: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  blogCard: {
    marginTop: 16,
    marginHorizontal: SIDE_PADDING,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  blogCardDesktop: {
    marginHorizontal: 0,
    marginTop: 0,
    width: 360,
  },
  blogCardImage: {
    width: '100%',
    height: 184,
  },
  blogCardBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.borderLight,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 8,
    paddingBottom: 12,
  },
  blogCardExcerpt: {
    marginTop: Spacing.md,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.neutral700,
  },
  blogMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogViewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogEyeIcon: {
    width: 16,
    height: 16,
  },
  blogMetaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  blogCardTitle: {
    marginTop: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.neutral700,
  },
  blogExploreButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  blogExploreButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.white,
  },
  customerSection: {
    marginTop: 24,
    paddingHorizontal: SIDE_PADDING,
  },
  customerSectionDesktop: {
    paddingHorizontal: 0,
    marginTop: Spacing.xl,
  },
  customerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.text,
  },
  customerSubtitle: {
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.text,
  },
  reviewListContent: {
    marginTop: 16,
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
  },
  reviewListContentDesktop: {
    marginTop: Spacing.md,
  },
  reviewCarouselDesktop: {
    position: 'relative',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
  },
  reviewGridDesktop: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  reviewArrow: {
    position: 'absolute',
    top: 48,
    zIndex: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewArrowLeft: {
    left: 0,
  },
  reviewArrowRight: {
    right: 0,
  },
  reviewCard: {
    width: 242,
    minHeight: 174,
    borderWidth: 1,
    borderColor: Colors.neutral700,
    borderRadius: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 26,
  },
  reviewCardName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: Colors.neutral700,
  },
  reviewCardAvatar: {
    position: 'absolute',
    top: -52,
    right: 4,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  reviewQuoteIcon: {
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    lineHeight: 28,
    color: Colors.primary,
  },
  reviewCardBody: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.text,
  },
  reviewQuoteIconBottom: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  reviewTriggerButton: {
    marginTop: 24,
    alignSelf: 'center',
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewTriggerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginRight: 4,
    textTransform: 'capitalize',
  },
  reviewTriggerIcon: {
    width: 18,
    height: 18,
  },
  footer: {
    marginTop: 24,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    zIndex: 20,
  },
  menuTopRow: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBackButton: {
    position: 'absolute',
    left: SIDE_PADDING,
    top: 10,
  },
  menuLoginCard: {
    marginTop: 7,
    marginHorizontal: SIDE_PADDING,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingHorizontal: SIDE_PADDING,
  },
  menuLoginText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.success,
  },
  menuCard: {
    marginTop: 32,
    marginHorizontal: SIDE_PADDING,
    borderRadius: 16,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  menuCardRow: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuCardRowLast: {
    borderBottomWidth: 0,
  },
  menuCardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuRowIcon: {
    width: 18,
    height: 18,
  },
  menuCardRowText: {
    marginLeft: 8,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.neutral700,
  },
  menuRowArrowIcon: {
    width: 18,
    height: 18,
  },
  reviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Overlays.modal,
    zIndex: 30,
  },
  reviewOverlayDesktop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewFormCard: {
    marginTop: 90,
    marginHorizontal: SIDE_PADDING,
    minHeight: 620,
    borderRadius: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 24,
    paddingBottom: 20,
  },
  reviewFormCardDesktop: {
    width: 506,
    minHeight: 650,
    marginTop: 0,
    marginHorizontal: 0,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  reviewTitle: {
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.text,
  },
  reviewSubtitle: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text,
  },
  reviewStarsButton: {
    marginTop: 19,
    alignItems: 'center',
  },
  reviewStarsRow: {
    width: 226,
    minHeight: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewStarIcon: {
    marginHorizontal: 4,
  },
  reviewField: {
    marginTop: 16,
  },
  reviewFieldLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.text,
    marginBottom: 8,
  },
  reviewFieldInput: {
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.textLight,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewEyeIcon: {
    width: 16,
    height: 16,
  },
  reviewPlaceholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.textSecondary,
  },
  reviewValueText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.text,
  },
  reviewTextArea: {
    height: 172,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.textLight,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewTextAreaDesktop: {
    height: 146,
  },
  reviewTextAreaPlaceholder: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginRight: 12,
  },
  reviewTextAreaValue: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.text,
    marginRight: 12,
  },
  reviewSubmitButton: {
    marginTop: 24,
    height: 40,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewSubmitButtonDesktop: {
    borderRadius: BorderRadius.sm,
  },
  reviewSubmitButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.white,
  },
  reviewDisclaimer: {
    marginTop: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 10,
    color: Colors.neutral700,
  },
  reviewSuccessCard: {
    marginTop: 283,
    marginHorizontal: SIDE_PADDING,
    height: 215,
    borderRadius: 16,
    backgroundColor: Colors.white,
    paddingTop: 24,
    paddingHorizontal: SIDE_PADDING,
  },
  reviewSuccessCardDesktop: {
    width: 470,
    height: 225,
    marginTop: 0,
    marginHorizontal: 0,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  reviewSuccessIcon: {
    width: 48,
    height: 48,
    alignSelf: 'center',
  },
  reviewSuccessText: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 32,
    color: Colors.text,
  },
  space12: {
    width: 12,
  },
  space16: {
    width: 16,
  },
  space17: {
    width: 17,
  },
  space24: {
    width: 24,
  },
});
