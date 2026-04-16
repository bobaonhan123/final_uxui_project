import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Overlays, Spacing } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE_PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2;
const HOME_ROWS = [0];

const HERO_IMAGE = 'https://www.figma.com/api/mcp/asset/d0aecf8e-8df6-4e6f-94f9-a7a86ed833e2';
const BLOG_IMAGE = 'https://www.figma.com/api/mcp/asset/e3319fa3-2512-4307-9f84-8fbee23a34b6';
const ICON_SEARCH = 'https://www.figma.com/api/mcp/asset/ce22bd3c-9b27-4bc0-8932-1274a391520f';
const ICON_EYE = 'https://www.figma.com/api/mcp/asset/72aec204-943b-4115-a93c-bc7ddbf3675c';
const ICON_QUOTE_UP = 'https://www.figma.com/api/mcp/asset/9482a9ec-5fff-4ad7-b35c-deb6b81567ee';
const ICON_QUOTE_DOWN = 'https://www.figma.com/api/mcp/asset/01a1a2b0-7d5c-48a7-950d-41ea98fb06de';
const ICON_EDIT = 'https://www.figma.com/api/mcp/asset/86158519-70ea-4250-8412-a25d4843f864';
const ICON_COPYRIGHT = 'https://www.figma.com/api/mcp/asset/149b1288-f7c3-4830-8c9e-8e2a695b7da9';
const ICON_APPLE = 'https://www.figma.com/api/mcp/asset/bae82c18-fa02-4112-a93c-4107d41446aa';
const ICON_GOOGLE_PLAY = 'https://www.figma.com/api/mcp/asset/ff0d073b-f587-4d6a-a021-ad4600953ec6';
const ICON_INSTAGRAM = 'https://www.figma.com/api/mcp/asset/4e181b93-62fc-4591-9a03-2e69bfbf803a';
const ICON_YOUTUBE = 'https://www.figma.com/api/mcp/asset/7b70c2c5-3e79-486e-a94c-a920375f68e5';
const ICON_X = 'https://www.figma.com/api/mcp/asset/3eb18074-fef5-4920-a4ed-f76001128851';
const ICON_SPOTIFY = 'https://www.figma.com/api/mcp/asset/067965fb-7b7c-4421-96de-37e3f7f3c7bd';
const ICON_FACEBOOK = 'https://www.figma.com/api/mcp/asset/3eb93f39-f55f-4dc6-b8a3-ff6165ce84ec';
const ICON_CALL = 'https://www.figma.com/api/mcp/asset/cd5aaf13-46b9-4419-ad5e-9b13bcbb2f98';
const ICON_TICKET = 'https://www.figma.com/api/mcp/asset/30c0518a-a8f8-4480-9099-ee57359a48c7';
const ICON_DOCUMENT = 'https://www.figma.com/api/mcp/asset/aeb79f15-159e-4c78-ba1d-c303bfa4ead7';
const ICON_INFO = 'https://www.figma.com/api/mcp/asset/cddcb869-74f1-4f0e-9444-13bb88f96fdd';
const ICON_ARROW_RIGHT = 'https://www.figma.com/api/mcp/asset/924d57ea-a2c3-4f99-a0a1-603a2fd3bdb1';
const ICON_EYE_SLASH = 'https://www.figma.com/api/mcp/asset/60a606e6-4306-4737-8955-8cf9ffd85006';
const CATEGORY_FOLK_IMAGE = 'https://www.figma.com/api/mcp/asset/569de5c5-6a27-434e-b857-897920a37828';
const CATEGORY_CLASSIC_IMAGE = 'https://www.figma.com/api/mcp/asset/62fe73fc-4898-4fa6-94f1-30c063eb7116';
const CATEGORY_POP_IMAGE = 'https://www.figma.com/api/mcp/asset/49286d55-615f-47d6-b4bc-a1a019922572';
const CATEGORY_JAZZ_IMAGE = 'https://www.figma.com/api/mcp/asset/d05da422-8334-4da1-95d2-33647e9a8a24';
const CATEGORY_ROCK_IMAGE = 'https://www.figma.com/api/mcp/asset/d7cc5c14-afe0-4120-9d08-ac35de681096';
const ARTIST_1 = 'https://www.figma.com/api/mcp/asset/d2681072-af67-47d0-aa9e-109a1416082d';
const ARTIST_2 = 'https://www.figma.com/api/mcp/asset/e7a3416f-0c3b-4d66-9a49-1fac5696a009';
const ARTIST_3 = 'https://www.figma.com/api/mcp/asset/eacd183d-0b6e-40ce-aae2-46c0c2fdce19';
const ARTIST_4 = 'https://www.figma.com/api/mcp/asset/ba3e7ebe-349d-45c6-877f-98be03340f42';
const ARTIST_5 = 'https://www.figma.com/api/mcp/asset/07a318fd-7b0b-4f59-8c1a-ee42d16c3599';
const ARTIST_6 = 'https://www.figma.com/api/mcp/asset/cd6233ac-03cd-4732-8011-3c537b1f62ab';
const CARD_IMAGE_1 = 'https://www.figma.com/api/mcp/asset/f8ea52fa-d77b-4040-9292-fc522cbf68b7';
const CARD_IMAGE_2 = 'https://www.figma.com/api/mcp/asset/ba0da3dd-4f33-45b6-ab92-a0a8f025b785';
const CARD_IMAGE_3 = 'https://www.figma.com/api/mcp/asset/d3cdd0b5-e7da-4ffe-a4ae-adda25693a7d';
const CARD_IMAGE_4 = 'https://www.figma.com/api/mcp/asset/9b47c905-287d-45f5-a408-e401647261a4';
const CARD_IMAGE_5 = 'https://www.figma.com/api/mcp/asset/9bd45180-eb28-4dae-ae29-87a24541e1e7';
const CARD_IMAGE_6 = 'https://www.figma.com/api/mcp/asset/1033b5fb-958d-4ca2-8ea1-2cb83dcb1842';
const REVIEW_AVATAR = 'https://www.figma.com/api/mcp/asset/e4ae5fa7-9a92-44e3-9c0e-4ef0c97b8583';
const REVIEW_STARS_EMPTY = 'https://www.figma.com/api/mcp/asset/09bfe2b7-81cd-490f-a0ba-300933a63ece';
const REVIEW_STARS_FILLED = 'https://www.figma.com/api/mcp/asset/b7d94cc8-0b56-4635-8cce-f4cb7ac1476b';
const REVIEW_SUCCESS_ICON = 'https://www.figma.com/api/mcp/asset/20529b21-26a7-4e59-bc0d-fade9fc4ec66';

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

type ReviewModalMode = 'hidden' | 'empty' | 'filled' | 'success';

type MenuRow = {
  id: string;
  icon: string;
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
];

const CUSTOMER_REVIEWS: ReviewCard[] = [
  {
    id: 'review-1',
    name: 'Paula Green',
    body: 'I have bought my tickets from BNConcert many times, the experience is smooth and easy, having the ticket saved in my application was calming, plus I can easily save or share my favourite concerts! recommended!',
    image: REVIEW_AVATAR,
  },
  {
    id: 'review-2',
    name: 'Paula Green',
    body: 'I have bought my tickets from BNConcert many times, the experience is smooth and easy, having the ticket saved in my application was calming, plus I can easily save or share my favourite concerts! recommended!',
    image: REVIEW_AVATAR,
  },
];

const MENU_ROWS: MenuRow[] = [
  { id: 'menu-contact', icon: ICON_CALL, label: 'Contact us', route: '/dashboard/contact' },
  { id: 'menu-tickets', icon: ICON_TICKET, label: 'Tickets', route: '/(tabs)/tickets' },
  { id: 'menu-blog', icon: ICON_DOCUMENT, label: 'Blog', route: '/(tabs)/blog' },
  { id: 'menu-language', icon: ICON_INFO, label: 'Language' },
];

const FOOTER_CONCERT_HUB = ['About us', 'Careers', 'Press', 'Event organizers', 'Getting there', 'Privacy policy', 'Terms & conditions'];
const FOOTER_HELP = ['FAQs', 'Help center', 'Contact us', 'Customer service'];
const FOOTER_MORE = ['Cancelled concerts', 'Cancellation insurance', 'Rescheduled events'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [reviewModalMode, setReviewModalMode] = useState<ReviewModalMode>('hidden');

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

  const renderConcertCard: ListRenderItem<CarouselCard> = ({ item }) => (
    <Pressable style={styles.concertCard} onPress={onSeeAllTickets}>
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

  const renderCategoryCard: ListRenderItem<CategoryCard> = ({ item }) => (
    <Pressable style={styles.categoryCard} onPress={onSeeAllTickets}>
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

  const renderReviewCard: ListRenderItem<ReviewCard> = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <Text style={styles.reviewCardName}>{item.name}</Text>
        <Image source={{ uri: item.image }} style={styles.reviewCardAvatar} />
      </View>
      <Image source={{ uri: ICON_QUOTE_UP }} style={styles.reviewQuoteIcon} />
      <Text numberOfLines={6} style={styles.reviewCardBody}>
        {item.body}
      </Text>
      <Image source={{ uri: ICON_QUOTE_DOWN }} style={[styles.reviewQuoteIcon, styles.reviewQuoteIconBottom]} />
    </View>
  );

  const reviewFilled = reviewModalMode === 'filled';
  const reviewStars = reviewFilled ? REVIEW_STARS_FILLED : REVIEW_STARS_EMPTY;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} translucent={false} />
      <FlatList
        data={HOME_ROWS}
        keyExtractor={(item) => item.toString()}
        renderItem={() => (
          <View style={[styles.page, { paddingTop: insets.top }]}> 
            <View style={styles.headerRow}>
              <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)' as never)}>
                <Text style={styles.logoText}>BNConcert</Text>
              </Pressable>
              <View style={styles.headerIconRow}>
                <Pressable style={styles.profileIconButton} onPress={isAuthenticated ? onOpenProfile : onOpenLogin}>
                  <Ionicons name="person-circle-outline" size={24} color={Colors.neutral700} />
                </Pressable>
                <Pressable style={styles.menuIconButton} onPress={() => setMenuVisible(true)}>
                  <Ionicons name="menu-outline" size={24} color={Colors.neutral700} />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.bannerCard} onPress={onOpenBanner}>
              <Image source={{ uri: HERO_IMAGE }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerTextBlock}>
                <Text style={styles.bannerTitle}>Beyoncé Live in Concert!</Text>
                <Text style={styles.bannerSubtitle}>A Night to Remember!</Text>
              </View>
            </Pressable>

            <View style={styles.searchSection}>
              <Pressable style={styles.searchBox} onPress={onSearch}>
                <Image source={{ uri: ICON_SEARCH }} style={styles.searchIcon} />
                <Text style={styles.searchBoxText}>Search by Artist, Event or Venue</Text>
              </Pressable>
              <View style={styles.searchTagRow}>
                {['#Summer', '#jazz', '#taylorSwift'].map((tag) => (
                  <View key={tag} style={styles.searchTag}>
                    <Text style={styles.searchTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>Upcoming concerts</Text>
              <Pressable onPress={onSeeAllTickets}>
                <Text style={styles.sectionHeaderAction}>See All</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={UPCOMING_CONCERTS}
              keyExtractor={(item) => item.id}
              renderItem={renderConcertCard}
              contentContainerStyle={styles.horizontalListContent}
              ItemSeparatorComponent={() => <View style={styles.space16} />}
              showsHorizontalScrollIndicator={false}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>Popular near you</Text>
              <Pressable onPress={onSeeAllTickets}>
                <Text style={styles.sectionHeaderAction}>See All</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={POPULAR_CONCERTS}
              keyExtractor={(item) => item.id}
              renderItem={renderConcertCard}
              contentContainerStyle={styles.horizontalListContent}
              ItemSeparatorComponent={() => <View style={styles.space16} />}
              showsHorizontalScrollIndicator={false}
            />

            <View style={styles.singleHeader}>
              <Text style={styles.sectionHeaderTitle}>Explore by category</Text>
            </View>
            <FlatList
              horizontal
              data={CATEGORY_CARDS}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryCard}
              contentContainerStyle={styles.categoryListContent}
              ItemSeparatorComponent={() => <View style={styles.space17} />}
              showsHorizontalScrollIndicator={false}
            />

            <View style={styles.singleHeader}>
              <Text style={styles.sectionHeaderTitle}>Artist</Text>
            </View>
            <FlatList
              horizontal
              data={ARTIST_CARDS}
              keyExtractor={(item) => item.id}
              renderItem={renderArtistCard}
              contentContainerStyle={styles.artistListContent}
              ItemSeparatorComponent={() => <View style={styles.space12} />}
              showsHorizontalScrollIndicator={false}
            />

            <View style={styles.blogSection}>
              <Text style={styles.blogSectionTitle}>The latest in music, tours & artists</Text>
              <Pressable style={styles.blogCard} onPress={onSeeAllBlogs}>
                <Image source={{ uri: BLOG_IMAGE }} style={styles.blogCardImage} />
                <View style={styles.blogCardBody}>
                  <View style={styles.blogMetaRow}>
                    <Text style={styles.blogMetaText}>105 Comments</Text>
                    <View style={styles.blogViewRow}>
                      <Image source={{ uri: ICON_EYE }} style={styles.blogEyeIcon} />
                      <Text style={styles.blogMetaText}>100K</Text>
                    </View>
                  </View>
                  <Text style={styles.blogCardTitle}>Ariana Grande: A Pop Sensation Redefining the Music Industry</Text>
                </View>
              </Pressable>
              <Pressable style={styles.blogExploreButton} onPress={onSeeAllBlogs}>
                <Text style={styles.blogExploreButtonText}>Explore All</Text>
              </Pressable>
            </View>

            <View style={styles.customerSection}>
              <Text style={styles.customerTitle}>What our customers say</Text>
              <Text style={styles.customerSubtitle}>Real reviews from concert enthusiasts who love our service</Text>
            </View>
            <FlatList
              horizontal
              data={CUSTOMER_REVIEWS}
              keyExtractor={(item) => item.id}
              renderItem={renderReviewCard}
              contentContainerStyle={styles.reviewListContent}
              ItemSeparatorComponent={() => <View style={styles.space16} />}
              showsHorizontalScrollIndicator={false}
            />

            <Pressable style={styles.reviewTriggerButton} onPress={onOpenReview}>
              <Text style={styles.reviewTriggerText}>Have a Thought?</Text>
              <Image source={{ uri: ICON_EDIT }} style={styles.reviewTriggerIcon} />
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerTitle}>Let's keep in touch</Text>
              <Text style={styles.footerSubtitle}>Stay updated with BNConcert's latest news and exclusive offers!</Text>

              <View style={styles.subscribeBox}>
                <Text style={styles.subscribePlaceholder}>Enter your email address</Text>
                <Pressable style={styles.subscribeButton}>
                  <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                </Pressable>
              </View>
              <Text style={styles.subscribeDisclaimer}>By subscribing, you agree to our terms & conditions & Privacy policy.</Text>

              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>BNConcert</Text>
                {FOOTER_CONCERT_HUB.map((item) => (
                  <Text key={item} style={styles.footerLinkText}>
                    {item}
                  </Text>
                ))}
              </View>

              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Looking for help</Text>
                {FOOTER_HELP.map((item) => (
                  <Text key={item} style={styles.footerLinkText}>
                    {item}
                  </Text>
                ))}
              </View>

              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Looking for more</Text>
                {FOOTER_MORE.map((item) => (
                  <Text key={item} style={styles.footerLinkText}>
                    {item}
                  </Text>
                ))}
              </View>

              <View style={styles.socialRow}>
                <Image source={{ uri: ICON_INSTAGRAM }} style={styles.socialIcon} />
                <Image source={{ uri: ICON_YOUTUBE }} style={styles.socialIcon} />
                <Image source={{ uri: ICON_X }} style={styles.socialIcon} />
                <Image source={{ uri: ICON_SPOTIFY }} style={styles.socialIcon} />
                <Image source={{ uri: ICON_FACEBOOK }} style={styles.socialIcon} />
              </View>

              <View style={styles.storeRow}>
                <View style={styles.storeBadge}>
                  <Image source={{ uri: ICON_GOOGLE_PLAY }} style={styles.storeIcon} />
                  <View>
                    <Text style={styles.storeCaption}>Download on the</Text>
                    <Text style={styles.storeLabel}>Google Play</Text>
                  </View>
                </View>
                <View style={styles.storeBadge}>
                  <Image source={{ uri: ICON_APPLE }} style={styles.storeIcon} />
                  <View>
                    <Text style={styles.storeCaption}>Download on the</Text>
                    <Text style={styles.storeLabel}>App Store</Text>
                  </View>
                </View>
              </View>

              <View style={styles.footerCopyright}>
                <Image source={{ uri: ICON_COPYRIGHT }} style={styles.copyrightIcon} />
                <Text style={styles.footerCopyrightText}>BNConcert All Rights Reserved</Text>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

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
                  <Image source={{ uri: row.icon }} style={styles.menuRowIcon} />
                  <Text style={styles.menuCardRowText}>{row.label}</Text>
                </View>
                <Image source={{ uri: ICON_ARROW_RIGHT }} style={styles.menuRowArrowIcon} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {reviewModalMode !== 'hidden' ? (
        <View style={styles.reviewOverlay}>
          {reviewModalMode === 'success' ? (
            <View style={styles.reviewSuccessCard}>
              <Image source={{ uri: REVIEW_SUCCESS_ICON }} style={styles.reviewSuccessIcon} />
              <Text style={styles.reviewSuccessText}>Thank you for submitting your review!</Text>
              <Pressable style={styles.reviewSubmitButton} onPress={onCloseReview}>
                <Text style={styles.reviewSubmitButtonText}>Keep Browsing</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.reviewFormCard}>
              <Text style={styles.reviewTitle}>Leave a Review for Concert Hub</Text>
              <Text style={styles.reviewSubtitle}>How would you rate for BNConcert ?</Text>

              <Pressable style={styles.reviewStarsButton} onPress={onPromoteReview}>
                <Image source={{ uri: reviewStars }} style={styles.reviewStarsImage} resizeMode="contain" />
              </Pressable>

              <Pressable style={styles.reviewField} onPress={onPromoteReview}>
                <Text style={styles.reviewFieldLabel}>First name</Text>
                <View style={styles.reviewFieldInput}>
                  <Text style={reviewFilled ? styles.reviewValueText : styles.reviewPlaceholderText}>
                    {reviewFilled ? 'Sylvie' : 'Enter Input'}
                  </Text>
                  <Image source={{ uri: ICON_EYE_SLASH }} style={styles.reviewEyeIcon} />
                </View>
              </Pressable>

              <Pressable style={styles.reviewField} onPress={onPromoteReview}>
                <Text style={styles.reviewFieldLabel}>Last name</Text>
                <View style={styles.reviewFieldInput}>
                  <Text style={reviewFilled ? styles.reviewValueText : styles.reviewPlaceholderText}>
                    {reviewFilled ? 'Van Bleek' : 'Enter Input'}
                  </Text>
                  <Image source={{ uri: ICON_EYE_SLASH }} style={styles.reviewEyeIcon} />
                </View>
              </Pressable>

              <Pressable style={styles.reviewField} onPress={onPromoteReview}>
                <View style={styles.reviewTextArea}>
                  <Text style={reviewFilled ? styles.reviewTextAreaValue : styles.reviewTextAreaPlaceholder}>
                    {reviewFilled
                      ? 'Concert Hub is a website I check regularly to find out about new concerts around my location...'
                      : 'Write a review....'}
                  </Text>
                  <Image source={{ uri: ICON_EYE_SLASH }} style={styles.reviewEyeIcon} />
                </View>
              </Pressable>

              <Pressable style={styles.reviewSubmitButton} onPress={onSubmitReview}>
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
  page: {
    backgroundColor: Colors.white,
  },
  headerRow: {
    height: 40,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
  },
  logoText: {
    fontFamily: 'DrSugiyama_400Regular',
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.8,
    color: Colors.primary,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 16,
    marginHorizontal: SIDE_PADDING,
    height: 312,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 3,
    elevation: 3,
  },
  bannerImage: {
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
  bannerSubtitle: {
    marginTop: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  searchSection: {
    marginTop: -53,
    height: 168,
    backgroundColor: Colors.neutral700,
    paddingTop: 69,
    paddingHorizontal: SIDE_PADDING,
    zIndex: 1,
    elevation: 1,
  },
  searchBox: {
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.textMuted,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
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
  searchTagRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  searchTag: {
    backgroundColor: Colors.textMuted,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + Spacing.xs,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  searchTagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.textLight,
  },
  sectionHeader: {
    marginTop: 24,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singleHeader: {
    marginTop: 24,
    paddingHorizontal: SIDE_PADDING,
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
  concertCard: {
    width: 242,
    height: 258,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  concertImage: {
    width: '100%',
    height: 190,
    borderRadius: 16,
  },
  concertOverlayWrapper: {
    marginTop: -48,
    height: 116,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  concertOverlayCurveFront: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -8,
    height: 124,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
  categoryCard: {
    width: 156,
    height: 136,
    borderRadius: 16,
    overflow: 'hidden',
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
    minHeight: 32,
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
    fontSize: 20,
    lineHeight: 32,
  },
  artistListContent: {
    marginTop: 16,
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
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
    backgroundColor: Colors.textSecondary,
    paddingTop: 16,
  },
  blogSectionTitle: {
    marginHorizontal: SIDE_PADDING,
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.white,
  },
  blogCard: {
    marginTop: 16,
    marginHorizontal: SIDE_PADDING,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.white,
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
  reviewCard: {
    width: 242,
    borderWidth: 1,
    borderColor: Colors.neutral700,
    borderRadius: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 35,
  },
  reviewCardName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: Colors.neutral700,
  },
  reviewCardAvatar: {
    width: 70,
    height: 70,
  },
  reviewQuoteIcon: {
    marginTop: 8,
    width: 16,
    height: 16,
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
    backgroundColor: Colors.darkSurface,
    paddingTop: 16,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 34,
  },
  footerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 32,
    color: Colors.white,
  },
  footerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.white,
  },
  subscribeBox: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 16,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscribePlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textLight,
  },
  subscribeButton: {
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.white,
  },
  subscribeDisclaimer: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 10,
    color: Colors.white,
  },
  footerColumn: {
    marginTop: 24,
  },
  footerColumnTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 32,
    color: Colors.white,
  },
  footerLinkText: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.white,
  },
  socialRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 4,
  },
  storeRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeBadge: {
    width: (SCREEN_WIDTH - SIDE_PADDING * 2 - 16) / 2,
    height: 40,
    borderRadius: 16,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIcon: {
    width: 24,
    height: 24,
  },
  storeCaption: {
    marginLeft: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    lineHeight: 16,
    color: Colors.text,
  },
  storeLabel: {
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text,
  },
  footerCopyright: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCopyrightText: {
    marginLeft: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.white,
  },
  copyrightIcon: {
    width: 18,
    height: 18,
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
  reviewTitle: {
    width: CONTENT_WIDTH - 32,
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
  reviewStarsImage: {
    width: 226,
    height: 24,
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
});
