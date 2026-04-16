import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Fonts, ComponentSizes } from '../../src/constants/theme';
import { blogApi } from '../../src/api/services';
import { BlogCard, Footer, LoadingScreen } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import {
  BLOG_DETAIL_ROUTE_MAP,
  getStaticDetailFromSlug,
  toBlogType,
} from '../../src/constants/blogContent';
import type { Blog, Comment as BlogComment } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 280;
const DEFAULT_TAGS = ['#Celebrity', '#TaylorSwift', '#Concert'];

type ReviewComment = BlogComment & {
  likes: number;
  dislikes: number;
  userType?: string;
  dateLabel?: string;
};

const FALLBACK_REVIEWS: ReviewComment[] = [
  {
    id: 'fallback-review-1',
    author_name: 'Samuel Garcia',
    content:
      'The vibe in the concert hall tonight was electric. The lighting, acoustics, and crowd energy made this an unforgettable night.',
    created_at: '2026-06-21T00:00:00.000Z',
    likes: 6,
    dislikes: 0,
  },
  {
    id: 'fallback-review-2',
    author_name: 'Paula Green',
    content:
      'The performance was magical. Every song felt personal, and the production quality was on another level.',
    created_at: '2026-06-21T00:00:00.000Z',
    likes: 4,
    dislikes: 0,
  },
  {
    id: 'fallback-review-3',
    author_name: 'Nas Rashid',
    content:
      'Technically impressive with great visuals and strong vocals. It was a very solid live show from start to finish.',
    created_at: '2026-06-21T00:00:00.000Z',
    likes: 58,
    dislikes: 20,
  },
];

const formatDate = (dateStr: string, compact = false) =>
  new Date(dateStr).toLocaleDateString('en-US', compact
    ? { month: 'short', day: 'numeric', year: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' });

const toParagraphs = (text: string) => {
  if (!text.trim()) return [];
  const normalized = text
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .trim();

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

const toReviewComments = (comments: BlogComment[]) => {
  if (comments.length === 0) return FALLBACK_REVIEWS;
  return comments.map((comment, index) => ({
    ...comment,
    likes: Math.max(2, (comment.content.length + index * 3) % 60),
    dislikes: (comment.content.length + index) % 9,
  }));
};

const toBlogFromStaticDetail = (slug: string) => {
  const detail = getStaticDetailFromSlug(slug);
  if (!detail) return null;

  const articleContent = [...detail.leadParagraphs, ...detail.closingParagraphs]
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join('');

  return {
    blog: {
      id: `static-${detail.slug}`,
      title: detail.title,
      slug: detail.slug,
      excerpt: detail.leadParagraphs[0] || '',
      image_url: detail.heroImageUrl,
      author_name: 'BNConcert Editorial',
      category: 'Artists',
      tags: detail.tags,
      views: detail.views,
      created_at: '2026-06-21T03:54:00.000Z',
      content: articleContent,
    } as Blog,
    comments: detail.topReviews.map(({ likes: _likes, dislikes: _dislikes, userType: _userType, dateLabel: _dateLabel, ...comment }) => comment),
    relatedPosts: detail.similarPosts.map(toBlogType),
    detail,
  };
};

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resolvedSlug = useMemo(() => (Array.isArray(slug) ? slug[0] : slug) || '', [slug]);
  const staticPayload = useMemo(() => (resolvedSlug ? toBlogFromStaticDetail(resolvedSlug) : null), [resolvedSlug]);
  const routedSlug = useMemo(() => (resolvedSlug ? (BLOG_DETAIL_ROUTE_MAP[resolvedSlug] || resolvedSlug) : ''), [resolvedSlug]);

  useEffect(() => {
    if (!resolvedSlug) return;
    let active = true;

    const loadData = async () => {
      setLoading(true);

      if (staticPayload) {
        if (!active) return;
        setBlog(staticPayload.blog);
        setComments(staticPayload.comments);
        setRelatedPosts(staticPayload.relatedPosts);
        setLoading(false);
        return;
      }

      try {
        const [blogRes, commentsRes] = await Promise.all([
          blogApi.get(routedSlug),
          blogApi.getComments(routedSlug),
        ]);

        if (!active) return;

        const loadedBlog = blogRes.data;
        setBlog(loadedBlog);
        setComments(commentsRes.data);

        const relatedFromDetail = (loadedBlog.related_posts || []).filter(
          (post) => post.slug !== loadedBlog.slug,
        );

        if (relatedFromDetail.length > 0) {
          setRelatedPosts(relatedFromDetail.slice(0, 3));
        } else {
          try {
            const { data } = await blogApi.list({
              category: loadedBlog.category || undefined,
              limit: 6,
            });
            if (!active) return;
            setRelatedPosts(data.filter((post) => post.slug !== loadedBlog.slug).slice(0, 3));
          } catch {
            setRelatedPosts([]);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [resolvedSlug, routedSlug, staticPayload]);

  const handleAddComment = async () => {
    if (!resolvedSlug || !commentText.trim()) return;

    if (staticPayload) {
      const localComment: BlogComment = {
        id: `local-${Date.now()}`,
        author_name: 'You',
        content: commentText.trim(),
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [localComment, ...prev]);
      setCommentText('');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await blogApi.addComment(routedSlug, commentText.trim());
      setComments((prev) => [data as BlogComment, ...prev]);
      setCommentText('');
    } catch {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const tags = useMemo(() => {
    if (staticPayload) {
      return staticPayload.detail.tags;
    }
    if (!blog?.tags || blog.tags.length === 0) return DEFAULT_TAGS;
    return blog.tags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
  }, [blog?.tags, staticPayload]);

  const dynamicParagraphs = useMemo(
    () => toParagraphs(blog?.content || blog?.excerpt || ''),
    [blog?.content, blog?.excerpt],
  );

  const leadParagraphs = staticPayload ? staticPayload.detail.leadParagraphs : dynamicParagraphs;
  const closingParagraphs = staticPayload ? staticPayload.detail.closingParagraphs : [];
  const inlineGallery = staticPayload ? staticPayload.detail.inlineGalleryImages : [];
  const reviewComments = useMemo<ReviewComment[]>(
    () => (staticPayload ? staticPayload.detail.topReviews : toReviewComments(comments)),
    [comments, staticPayload],
  );

  if (loading) return <LoadingScreen />;
  if (!blog) {
    return (
      <View style={styles.center}>
        <Text style={Fonts.h3}>Article not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={{
              uri:
                (staticPayload ? staticPayload.detail.heroImageUrl : blog.image_url) ||
                'https://via.placeholder.com/600x280/6C63FF/ffffff?text=Blog',
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.75)', Colors.background]}
            locations={[0, 0.72, 1]}
            style={styles.heroOverlay}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{blog.title}</Text>

          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {staticPayload ? staticPayload.detail.publishedLabel : `Published ${formatDate(blog.created_at, true)}`}
            </Text>
            <View style={styles.metaViews}>
              <Ionicons name="eye-outline" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{staticPayload ? staticPayload.detail.viewsLabel : `${blog.views} views`}</Text>
            </View>
          </View>

          {leadParagraphs.length > 0 ? (
            leadParagraphs.map((paragraph, index) => (
              <Text key={`${index}-${paragraph.slice(0, 20)}`} style={styles.bodyText}>
                {paragraph}
              </Text>
            ))
          ) : (
            <Text style={styles.bodyText}>{blog.excerpt}</Text>
          )}

          {inlineGallery.length > 0 ? (
            <View style={styles.inlineGallery}>
              {inlineGallery.map((galleryItem) => (
                <View key={galleryItem.imageUrl} style={styles.inlineGalleryItem}>
                  <Image source={{ uri: galleryItem.imageUrl }} style={styles.inlineGalleryImage} />
                  <Text style={styles.inlineGalleryCaption}>{galleryItem.caption}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {closingParagraphs.map((paragraph, index) => (
            <Text key={`closing-${index}-${paragraph.slice(0, 20)}`} style={styles.bodyText}>
              {paragraph}
            </Text>
          ))}

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Top reviews on this blog post</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsScroller}
            >
              {reviewComments.map((comment) => (
                <View key={comment.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {(comment.author_name || 'A').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewAuthor}>{comment.author_name || 'Anonymous'}</Text>
                      <Text style={styles.reviewUserType}>{comment.userType || 'BNConcert user'}</Text>
                    </View>
                  </View>

                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Ionicons key={`${comment.id}-star-${index}`} name="star" size={14} color={Colors.warning} />
                    ))}
                  </View>

                  <Text style={styles.reviewContent} numberOfLines={6}>
                    {comment.content}
                  </Text>
                  <Text style={styles.reviewDate}>{comment.dateLabel || formatDate(comment.created_at, true)}</Text>

                  <View style={styles.reviewActions}>
                    <View style={styles.reviewAction}>
                      <Ionicons name="thumbs-up-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.reviewActionText}>{comment.likes}</Text>
                    </View>
                    <View style={styles.reviewAction}>
                      <Ionicons name="thumbs-down-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.reviewActionText}>{comment.dislikes}</Text>
                    </View>
                    <View style={styles.reviewAction}>
                      <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.reviewActionText}>Reply</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {isAuthenticated ? (
            <View style={styles.addComment}>
              <Text style={styles.sectionTitle}>Add a comment</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Write your comment..."
                placeholderTextColor={Colors.textLight}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, (!commentText.trim() || submitting) && styles.sendButtonDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim() || submitting}
              >
                <Ionicons name="send" size={18} color={Colors.white} />
                <Text style={styles.sendButtonText}>{submitting ? 'Posting...' : 'Post comment'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.signInHint}>Sign in to join the discussion.</Text>
          )}

          {relatedPosts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>Similar posts</Text>
              {relatedPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  blog={post}
                  onPress={() => router.push(`/blog/${post.slug}` as never)}
                />
              ))}
            </View>
          )}
        </View>
        <Footer />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: SCREEN_WIDTH, height: HERO_HEIGHT, resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute',
    top: 56,
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: { padding: Spacing.md },
  title: {
    ...Fonts.h2,
    marginBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tagBadge: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  tagText: {
    ...Fonts.caption,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metaViews: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { ...Fonts.caption, color: Colors.textLight },
  bodyText: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  inlineGallery: {
    marginBottom: Spacing.md,
  },
  inlineGalleryItem: {
    marginBottom: Spacing.md,
  },
  inlineGalleryImage: {
    width: '100%',
    height: 212,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
  },
  inlineGalleryCaption: {
    ...Fonts.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  commentsSection: { marginTop: Spacing.sm },
  sectionTitle: {
    ...Fonts.h3,
    marginBottom: Spacing.md,
  },
  reviewsScroller: { paddingRight: Spacing.md },
  reviewCard: {
    width: 252,
    minHeight: 230,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginRight: Spacing.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  reviewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    ...Fonts.bold,
    color: Colors.white,
    fontSize: 14,
  },
  reviewMeta: { marginLeft: Spacing.sm, flex: 1 },
  reviewAuthor: { ...Fonts.medium, fontSize: 14 },
  reviewUserType: { ...Fonts.caption, color: Colors.success },
  starsRow: { flexDirection: 'row', gap: Spacing.xxs, marginBottom: Spacing.sm },
  reviewContent: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    minHeight: 78,
  },
  reviewDate: {
    ...Fonts.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reviewActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  reviewAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  reviewActionText: { ...Fonts.caption, color: Colors.textSecondary },
  addComment: { marginTop: Spacing.lg },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: ComponentSizes.textareaMinHeight,
    textAlignVertical: 'top',
    ...Fonts.regular,
    color: Colors.text,
  },
  sendButton: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 44,
  },
  sendButtonText: {
    ...Fonts.medium,
    color: Colors.white,
    fontSize: 14,
  },
  sendButtonDisabled: { opacity: 0.6 },
  signInHint: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  relatedSection: { marginTop: Spacing.lg },
});
