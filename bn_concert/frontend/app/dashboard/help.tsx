import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Fonts } from '../../src/constants/theme';
import { faqApi } from '../../src/api/services';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingScreen } from '../../src/components';
import type { FAQ } from '../../src/types';

export default function HelpScreen() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    try {
      const { data } = await faqApi.list(selectedCategory ?? undefined);
      setFaqs(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    fetchFaqs();
  }, [fetchFaqs]);

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    faqs.forEach((f) => { if (f.category) cats.add(f.category); });
    return Array.from(cats);
  }, [faqs]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }, [faqs, search]);

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Dear {user?.first_name || 'Friend'},</Text>
      <Text style={styles.pageTitle}>Help Center</Text>
      <Text style={styles.pageSubtitle}>Our self-help center is the fastest place to get support.</Text>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQ..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsContent}>
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* FAQ List */}
      <Text style={styles.sectionTitle}>Frequently asked questions</Text>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="help-circle-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No FAQs found</Text>
        </View>
      ) : (
        filtered.map((faq) => {
          const isOpen = expandedId === faq.id;
          return (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => setExpandedId(isOpen ? null : faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </View>
              {isOpen && (
                <Text style={styles.answer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Can't find what you are looking for?</Text>
      <Text style={styles.supportSubtitle}>Choose one of our customer support channels.</Text>

      <View style={styles.supportActions}>
        <TouchableOpacity
          style={styles.supportCard}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/dashboard/contact', params: { channel: 'email' } })}
        >
          <Ionicons name="mail-outline" size={22} color={Colors.primary} />
          <Text style={styles.supportCardText}>Send Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.supportCard}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/dashboard/contact', params: { channel: 'chat' } })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={Colors.primary} />
          <Text style={styles.supportCardText}>Live Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.supportCard}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/dashboard/contact', params: { channel: 'call' } })}
        >
          <Ionicons name="call-outline" size={22} color={Colors.primary} />
          <Text style={styles.supportCardText}>Call Us</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Link */}
      <TouchableOpacity
        style={styles.contactLink}
        onPress={() => router.push('/dashboard/contact')}
        activeOpacity={0.7}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
        <Text style={styles.contactText}>Can't find what you're looking for? Contact Support</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.md, paddingBottom: 40 },
  greeting: { ...Fonts.heading20, color: Colors.text, marginBottom: Spacing.xs },
  pageTitle: { ...Fonts.h1, marginBottom: Spacing.xs },
  pageSubtitle: { ...Fonts.regular, color: Colors.textSecondary, marginBottom: Spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: 12, ...Fonts.body14, color: Colors.text },
  chips: { marginBottom: Spacing.md },
  chipsContent: { gap: Spacing.sm },
  sectionTitle: { ...Fonts.h3, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md - Spacing.xxs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Fonts.button14, color: Colors.text },
  chipTextActive: { color: Colors.white },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  question: { ...Fonts.h3, color: Colors.text, flex: 1 },
  answer: { ...Fonts.body14, color: Colors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyText: { ...Fonts.body14, color: Colors.textSecondary },
  supportSubtitle: { ...Fonts.regular, color: Colors.textSecondary, marginBottom: Spacing.sm },
  supportActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  supportCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  supportCardText: { ...Fonts.caption, color: Colors.text },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  contactText: { ...Fonts.button14, flex: 1, color: Colors.primary },
});
