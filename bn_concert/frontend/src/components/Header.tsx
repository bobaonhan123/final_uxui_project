import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, ComponentSizes, BorderRadius } from '../constants/theme';

interface HeaderMenuRow {
  id: string;
  icon: string;
  label: string;
  route?: string;
}

interface HeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onLogoPress?: () => void;
  onSearchPress?: () => void;
  // legacy boolean, 'large' for centered desktop search, or 'inline' to show small search after logo
  showSearch?: boolean | 'large' | 'inline';
  searchPlaceholder?: string;
  containerStyle?: ViewStyle;
  isDesktop?: boolean;
  isAuthenticated?: boolean;
  menuRows?: any[];
  onMenuRowPress?: (row: any) => void;
  onLoginPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onProfilePress,
  onLogoPress,
  onSearchPress,
  showSearch = false,
  searchPlaceholder = 'Search here',
  containerStyle,
  isDesktop = false,
  isAuthenticated = false,
  menuRows = [],
  onMenuRowPress,
}) => {
  const router = useRouter();

  const handleLogoPress = () => {
    if (onLogoPress) {
      onLogoPress();
      return;
    }
    router.replace('/(tabs)' as never);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.headerRow, isDesktop ? styles.headerRowDesktop : styles.headerRowMobile]}>
        <View style={styles.leftGroup}>
          <Pressable hitSlop={8} onPress={handleLogoPress}>
            <Text style={[styles.logoText, isDesktop ? styles.logoTextDesktop : null]}>BNConcert</Text>
          </Pressable>

          {isDesktop && showSearch === 'inline' ? (
            <Pressable style={styles.searchInline} onPress={onSearchPress}>
              <Ionicons name="search-outline" size={16} color={Colors.border} />
              <Text style={styles.searchPlaceholderInline}>{searchPlaceholder}</Text>
            </Pressable>
          ) : null}
        </View>

        {isDesktop ? (
          <View style={styles.desktopNavRow}>
            
            {menuRows
              .filter((r) => r.label !== 'Language')
              .map((row) => (
                <Pressable key={row.id} style={styles.desktopNavItem} onPress={() => onMenuRowPress?.(row)}>
                  {row.icon ? <Ionicons name={row.icon as any} size={18} color={Colors.neutral700} /> : null}
                  <Text style={styles.desktopNavText}>{row.label}</Text>
                </Pressable>
              ))}
            <Pressable style={styles.languageButton} onPress={() => {}}>
              <Text style={styles.languageText}>En</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.neutral700} />
            </Pressable>
            <Pressable style={styles.desktopLoginButton} onPress={isAuthenticated ? onProfilePress : onMenuPress}>
              <Ionicons name="person-outline" size={20} color={Colors.white} />
              <Text style={styles.desktopLoginText}>{isAuthenticated ? 'Account' : 'Login'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.headerIconRow}>
            <Pressable style={styles.profileIconButton} onPress={isAuthenticated ? onProfilePress : onMenuPress}>
              <Ionicons name="person-circle-outline" size={24} color={Colors.neutral700} />
            </Pressable>
            <Pressable style={styles.menuIconButton} onPress={onMenuPress}>
              <Ionicons name="menu-outline" size={24} color={Colors.neutral700} />
            </Pressable>
          </View>
        )}
      </View>

      {/* large search rendered as a centered block under the header row on desktop */}
      {isDesktop && showSearch === 'large' ? (
        <View style={styles.searchLargeWrap}>
          <Pressable style={styles.searchBarLarge} onPress={onSearchPress}>
            <Ionicons name="search-outline" size={18} color={Colors.border} />
            <Text style={styles.searchPlaceholderLarge}>{searchPlaceholder}</Text>
          </Pressable>
        </View>
      ) : null}

      {showSearch && showSearch !== 'large' && !(isDesktop && showSearch === 'inline') ? (
        <Pressable style={styles.searchBar} onPress={onSearchPress}>
          <Ionicons name="search-outline" size={16} color={Colors.border} />
          <Text style={styles.searchPlaceholder}>{searchPlaceholder}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
  },
  headerRowMobile: {
    height: ComponentSizes.headerHeight,
    paddingHorizontal: Spacing.md,
  },
  headerRowDesktop: {
    height: 88,
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
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  searchBar: {
    height: 32,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    fontFamily: Fonts.caption.fontFamily,
    fontSize: Fonts.caption.fontSize,
    lineHeight: Fonts.caption.lineHeight,
    color: Colors.border,
  },
  searchInline: {
    height: 32,
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: Spacing.md,
  },
  searchPlaceholderInline: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: Fonts.body12.fontSize,
    lineHeight: Fonts.body12.lineHeight,
    color: Colors.border,
  },
  searchBarLarge: {
    height: 44,
    width: '100%',
    maxWidth: 720,
    minWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  searchLargeWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  searchPlaceholderLarge: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: Fonts.body12.fontSize,
    lineHeight: Fonts.body12.lineHeight,
    color: Colors.neutral700,
  },
  desktopNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  languageButton: {
    height: 40,
    minWidth: 64,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  languageText: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: Fonts.body12.fontSize,
    lineHeight: Fonts.body12.lineHeight,
    color: Colors.neutral700,
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
});

export default Header;
