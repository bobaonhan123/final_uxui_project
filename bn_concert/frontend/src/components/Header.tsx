import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '../constants/theme';

interface HeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onLogoPress?: () => void;
  onSearchPress?: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  containerStyle?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onProfilePress,
  onLogoPress,
  onSearchPress,
  showSearch = false,
  searchPlaceholder = 'Search here',
  containerStyle,
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
      <View style={styles.topRow}>
        <Pressable style={styles.logoContainer} hitSlop={8} onPress={handleLogoPress}>
          <Text style={styles.logoText}>BNConcert</Text>
        </Pressable>
        <View style={styles.centerSpacer} />
        <View style={styles.iconsContainer}>
          <Pressable onPress={onProfilePress} hitSlop={8} style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={24} color={Colors.neutral700} />
          </Pressable>
          <Pressable onPress={onMenuPress} hitSlop={8} style={styles.iconButton}>
            <Ionicons name="menu-outline" size={24} color={Colors.neutral700} />
          </Pressable>
        </View>
      </View>

      {showSearch ? (
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
  topRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  logoContainer: {
    width: 64,
    height: 19,
    justifyContent: 'center',
  },
  logoText: {
    ...Fonts.logo,
    textAlign: 'center',
  },
  centerSpacer: {
    width: 98,
    height: 19,
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  iconButton: {
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
});

export default Header;
