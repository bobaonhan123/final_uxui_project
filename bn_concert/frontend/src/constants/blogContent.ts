import type { Blog, Comment } from '../types';

export type StaticNewsCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  commentsLabel: string;
  viewsLabel: string;
  views: number;
  publishedAtISO: string;
  imageUrl: string;
};

export type StaticReviewComment = Comment & {
  userType: string;
  likes: number;
  dislikes: number;
  dateLabel: string;
};

export type StaticBlogDetail = {
  slug: string;
  title: string;
  tags: string[];
  publishedLabel: string;
  viewsLabel: string;
  views: number;
  heroImageUrl: string;
  leadParagraphs: string[];
  closingParagraphs: string[];
  inlineGalleryImages: { imageUrl: string; caption: string }[];
  topReviews: StaticReviewComment[];
  similarPosts: StaticNewsCard[];
};

export const BLOG_HERO_STORY = {
  slug: 'taylor-swift-billionaire',
  title: 'Taylor Swift Is Now a Billionaire',
  author: 'Liz Dowell',
  postedLabel: 'Posted: May 15, 2026 / 02:38 PM CDT',
  updatedLabel: 'Updated: May 15, 2026 / 02:41 PM CDT',
  excerpt:
    'Taylor Swift has officially joined the billionaire club, becoming one of the wealthiest musicians in the world. Her earnings from touring, masters, and global partnerships continue to reshape the modern music business.',
  imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1400',
};

export const BLOG_NEWS_CARDS: StaticNewsCard[] = [
  {
    id: 'blog-card-1',
    slug: 'taylor-swift-world-tour-boston',
    title: 'Taylor Swift announces world tour with stop in Boston',
    excerpt:
      'The international tour expansion includes new North American dates, with Boston confirmed as a major stadium stop. Fans can expect surprise acoustic segments and an updated stage program.',
    category: 'Tour News',
    author: 'Marcus Chen',
    commentsLabel: '125 Comments',
    viewsLabel: '100K',
    views: 100000,
    publishedAtISO: '2026-05-14T10:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1400',
  },
  {
    id: 'blog-card-2',
    slug: 'justin-bieber-justice-uk-dates',
    title: "Justin Bieber Adds 2023 UK Tour Dates To 'Justice' World Tour",
    excerpt:
      'Additional UK and Ireland dates were added after overwhelming demand. Presale opens this week, and organizers expect a full sell-out in under 24 hours.',
    category: 'Tour Announcements',
    author: 'Sarah Mitchell',
    commentsLabel: '305 Comments',
    viewsLabel: '120K',
    views: 120000,
    publishedAtISO: '2026-05-13T09:15:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1400',
  },
  {
    id: 'blog-card-3',
    slug: 'brad-paisley-tennessean-year',
    title: "Brad Paisley 'completely honored' to be named Tennessean of the year",
    excerpt:
      'The country music icon received statewide recognition for his contributions to music and philanthropy. Paisley called the award one of the most meaningful in his career.',
    category: 'Awards',
    author: 'James Rodriguez',
    commentsLabel: '20 Comments',
    viewsLabel: '5K',
    views: 5000,
    publishedAtISO: '2026-05-12T08:40:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400',
  },
  {
    id: 'blog-card-4',
    slug: 'olivia-rodrigo-album-year',
    title: 'Olivia Rodrigo wins Album of the Year at International Music Awards',
    excerpt:
      'Her second album took top honors after a record-breaking opening month. The 22-year-old artist delivered an emotional acceptance speech dedicated to fans.',
    category: 'Awards',
    author: 'Emma Watson',
    commentsLabel: '89 Comments',
    viewsLabel: '75K',
    views: 75000,
    publishedAtISO: '2026-05-16T11:20:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400',
  },
  {
    id: 'blog-card-5',
    slug: 'billie-eilish-intimate-arenas',
    title: 'Billie Eilish announces intimate arena shows for North American fans',
    excerpt:
      'Limited-capacity shows will bring a closer stage experience to 15 cities. Fan-club members get early access before general release next week.',
    category: 'Tour News',
    author: 'Derek Thompson',
    commentsLabel: '212 Comments',
    viewsLabel: '98K',
    views: 98000,
    publishedAtISO: '2026-05-15T12:30:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400',
  },
];

const PRIMARY_DETAIL_SLUG = 'taylor-swift-confirms-eras-tour-end';

export const STATIC_BLOG_DETAILS: Record<string, StaticBlogDetail> = {
  [PRIMARY_DETAIL_SLUG]: {
    slug: PRIMARY_DETAIL_SLUG,
    title: "Taylor Swift Confirms the Eras Tour Will End in December: 'It Feels Like We Just Played Our First Show'",
    tags: ['#Celebrity', '#TaylorSwift', '#Concert'],
    publishedLabel: 'Published Jun 21, 2026 at 3:54 AM EDT',
    viewsLabel: '5K',
    views: 5000,
    heroImageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400',
    leadParagraphs: [
      'Taylor Swift has officially announced that her record-breaking Eras Tour will come to a close in December. The tour, which has been a global phenomenon since its inception, has taken fans on an extraordinary journey through the diverse and dynamic stages of Swift\'s musical career, celebrating each unique era that has defined her as an artist.',
      'Since its spectacular launch, the Eras Tour has been nothing short of a cultural event. With elaborate stage designs, stunning visual effects, and a meticulously curated setlist that spans Swift\'s entire discography, each concert has been a feast for the senses. Fans have been treated to an immersive experience that vividly brings to life the evolution of Swift\'s sound and persona, from the country charm of Fearless and Red to the pop mastery of 1989 and the reflective tones of folklore and evermore.',
      'The tour has not only been a celebration of Swift\'s musical versatility but also a testament to her prowess as a performer and storyteller. Each night, Swift has delivered electrifying renditions of fan favorites, often peppered with acoustic surprises, deep cuts, and special guest appearances that have thrilled audiences. Highlights have included emotional performances of tracks like All Too Well, the nostalgia of Love Story, and the anthemic energy of Shake It Off.',
      'Beyond the music, the Eras Tour has been marked by its deep emotional resonance and personal connections. Swift\'s heartfelt interactions with fans, many of whom have followed her journey through both personal triumphs and challenges, have created an intimate atmosphere despite the grandeur of the venues. Fans have shared countless stories of how Swift\'s music has impacted their lives, making each concert a communal experience of shared memories and emotions.',
    ],
    closingParagraphs: [
      'The tour\'s influence has extended beyond the concert venues, with significant cultural and economic impacts in each city it has visited. Swift\'s performances have boosted local economies, increased tourism, and created countless jobs, showcasing the far-reaching effects of her star power. Social media has been abuzz with viral moments from the tour, further amplifying its reach and solidifying Swift\'s status as a global icon.',
      'As the tour enters its final months, anticipation is at an all-time high. Fans and critics alike are eagerly speculating about what surprises Swift might have in store for the grand finale. Many expect unforgettable moments, possible new music revelations, and emotional farewells that will mark the end of this historic tour. Swift\'s ability to continually reinvent her performances and connect with her audience ensures that the concluding shows will be nothing short of spectacular.',
      'The conclusion of the Eras Tour will mark the end of a significant chapter in Taylor Swift\'s career, but it also sets the stage for new beginnings. The legacy of the Eras Tour will undoubtedly endure, remembered as one of the most ambitious, heartfelt, and successful tours in modern music history. As Swift prepares to close this remarkable journey, fans around the world are left with memories of an unforgettable celebration of music, growth, and the indomitable spirit of Taylor Swift.',
    ],
    inlineGalleryImages: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1400',
        caption: 'A sold-out stadium lit up as the opening set began.',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1400',
        caption: 'Crowd energy peaked during the acoustic surprise segment.',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1400',
        caption: 'Production crews transformed the stage between eras in minutes.',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1400',
        caption: 'A final encore moment that wrapped the night in emotion.',
      },
    ],
    topReviews: [
      {
        id: 'review-1',
        author_name: 'Alyssa Tran',
        content:
          'Taylor Swift\'s concert was absolutely phenomenal and lived up to all the hype. The production was top-notch, with stunning visuals and flawless sound quality that made the experience truly immersive.',
        created_at: '2026-06-21T00:00:00.000Z',
        likes: 21,
        dislikes: 3,
        userType: 'BNConcert user',
        dateLabel: '21, June, 2026',
      },
      {
        id: 'review-2',
        author_name: 'Samuel Garcia',
        content:
          'The vibe in the concert hall tonight was electric. The lighting, the acoustics, and the excited crowd all came together to make it a truly unforgettable night.',
        created_at: '2026-06-21T00:00:00.000Z',
        likes: 6,
        dislikes: 0,
        userType: 'BNConcert user',
        dateLabel: '21, June, 2026',
      },
      {
        id: 'review-3',
        author_name: 'Paula Green',
        content:
          'The music and choir group tonight were absolutely fantastic. Their voices and instruments blended beautifully, and you could really feel their passion for every song.',
        created_at: '2026-06-21T00:00:00.000Z',
        likes: 4,
        dislikes: 0,
        userType: 'BNConcert user',
        dateLabel: '21, June, 2026',
      },
      {
        id: 'review-4',
        author_name: 'Nas Rashid',
        content:
          'Technically impressive, but I still felt parts of the show were overhyped. The production value was excellent, though the performance did not exceed my expectations.',
        created_at: '2026-06-21T00:00:00.000Z',
        likes: 58,
        dislikes: 20,
        userType: 'BNConcert user',
        dateLabel: '21, June, 2026',
      },
    ],
    similarPosts: BLOG_NEWS_CARDS.slice(0, 3),
  },
};

export const BLOG_DETAIL_ROUTE_MAP: Record<string, string> = {
  'taylor-swift-billionaire': PRIMARY_DETAIL_SLUG,
  'taylor-swift-world-tour-boston': PRIMARY_DETAIL_SLUG,
  'justin-bieber-justice-uk-dates': PRIMARY_DETAIL_SLUG,
  'brad-paisley-tennessean-year': PRIMARY_DETAIL_SLUG,
  'olivia-rodrigo-album-year': PRIMARY_DETAIL_SLUG,
  'billie-eilish-intimate-arenas': PRIMARY_DETAIL_SLUG,
};

export const toBlogType = (card: StaticNewsCard): Blog => ({
  id: card.id,
  title: card.title,
  slug: card.slug,
  excerpt: card.excerpt,
  image_url: card.imageUrl,
  author_name: card.author,
  category: card.category,
  tags: [],
  views: card.views,
  created_at: card.publishedAtISO,
});

export const getStaticDetailFromSlug = (slug: string): StaticBlogDetail | null => {
  const resolvedSlug = BLOG_DETAIL_ROUTE_MAP[slug] || slug;
  return STATIC_BLOG_DETAILS[resolvedSlug] || null;
};
