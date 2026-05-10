import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Fonts, Overlays, Shadows } from '../constants/theme';
import { resolveImageUrl } from '../utils/images';
import type { Blog } from '../types';

interface Props {
  blog: Blog;
  onPress: () => void;
  featured?: boolean;
}

const DEFAULT_BLOG_IMAGE =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80';

export default function BlogCard({ blog, onPress, featured }: Props) {
  if (featured) {
    return (
      <TouchableOpacity style={styles.featured} onPress={onPress} activeOpacity={0.8}>
        <Image
          source={{ uri: resolveImageUrl(blog.image_url) || DEFAULT_BLOG_IMAGE }}
          style={styles.featuredImage}
        />
        <View style={styles.featuredOverlay}>
          {blog.category && <Text style={styles.badge}>{blog.category}</Text>}
          <Text style={styles.featuredTitle}>{blog.title}</Text>
          <Text style={styles.featuredExcerpt} numberOfLines={2}>{blog.excerpt}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: resolveImageUrl(blog.image_url) || DEFAULT_BLOG_IMAGE }}
        style={styles.thumb}
      />
      <View style={styles.content}>
        {blog.category && <Text style={styles.category}>{blog.category}</Text>}
        <Text style={styles.title} numberOfLines={2}>{blog.title}</Text>
        <Text style={styles.meta}>
          {blog.author_name} · {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featured: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  featuredImage: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.surface,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Overlays.modal,
  },
  badge: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: Fonts.caption.fontSize,
    color: Colors.white,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm + Spacing.xxs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  featuredTitle: {
    ...Fonts.heading20,
    color: Colors.white,
    marginBottom: Spacing.sm - Spacing.xxs,
  },
  featuredExcerpt: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  thumb: {
    width: 120,
    height: 100,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  category: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 12,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: Fonts.body14.fontSize,
    lineHeight: Fonts.body14.lineHeight,
    color: Colors.text,
    marginBottom: Spacing.sm - Spacing.xxs,
  },
  meta: {
    fontFamily: Fonts.caption.fontFamily,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
