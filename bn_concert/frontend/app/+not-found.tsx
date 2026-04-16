import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, Colors, Fonts, Spacing } from '../src/constants/theme';

const DECORATION_BLOCKS = [
  { top: 132, left: 106, color: Colors.background, rotate: '-26deg' },
  { top: 191, left: 40, color: Colors.borderMedium, rotate: '-12deg' },
  { top: 220, left: 278, color: Colors.border, rotate: '-32deg' },
  { top: 284, left: 291, color: Colors.border, rotate: '-22deg' },
  { top: 313, left: 52, color: Colors.border, rotate: '-28deg' },
  { top: 411, left: 39, color: Colors.border, rotate: '-30deg' },
  { top: 515, left: 27, color: Colors.borderMedium, rotate: '-14deg' },
  { top: 578, left: 116, color: Colors.borderMedium, rotate: '-35deg' },
  { top: 691, left: 74, color: Colors.background, rotate: '-13deg' },
  { top: 575, left: 289, color: Colors.background, rotate: '-16deg' },
  { top: 642, left: 183, color: Colors.background, rotate: '-29deg' },
  { top: 742, left: 166, color: Colors.background, rotate: '-12deg' },
];

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.logoText}>BNConcert</Text>
          </Pressable>
          <View style={styles.headerIconsRow}>
            <Ionicons name="person-circle-outline" size={24} color={Colors.neutral700} />
            <Ionicons name="menu" size={24} color={Colors.neutral700} />
          </View>
        </View>

        <Pressable style={styles.searchBox} onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search-outline" size={16} color={Colors.border} />
          <Text style={styles.searchText}>Search here</Text>
        </Pressable>

        {DECORATION_BLOCKS.map((item, index) => (
          <View
            key={`block-${index}`}
            style={[
              styles.decorationBlock,
              {
                top: item.top,
                left: item.left,
                backgroundColor: item.color,
                transform: [{ rotate: item.rotate }],
              },
            ]}
          />
        ))}

        <View style={styles.centerContent}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.errorTitle}>OOPS! Page not found</Text>

          <Pressable style={styles.reportButton} onPress={() => router.push('/dashboard/help')}>
            <Text style={styles.reportButtonText}>Report the Problem</Text>
          </Pressable>

          <Pressable style={styles.homeButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.homeButtonText}>Back to Homepage</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    height: 40,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    ...Fonts.logo,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  searchBox: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    height: 32,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchText: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.border,
  },
  decorationBlock: {
    position: 'absolute',
    width: 8,
    height: 10,
  },
  centerContent: {
    marginTop: 170,
    alignItems: 'center',
  },
  errorCode: {
    fontFamily: 'Inter_900Black',
    fontSize: 48,
    lineHeight: 48,
    color: Colors.textMuted,
  },
  errorTitle: {
    marginTop: Spacing.md,
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 16,
    lineHeight: 32,
    color: Colors.neutral700,
  },
  reportButton: {
    marginTop: Spacing.md,
    height: 32,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral700,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
  },
  reportButtonText: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: 12,
    lineHeight: 12,
    color: Colors.textSecondary,
  },
  homeButton: {
    marginTop: Spacing.sm,
    height: 32,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
  },
  homeButtonText: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: 12,
    lineHeight: 12,
    color: Colors.white,
  },
});
