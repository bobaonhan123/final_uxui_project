import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing, ComponentSizes } from '../constants/theme';

interface HeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  containerStyle?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress, onProfilePress, containerStyle }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        style={styles.logoContainer}
        hitSlop={8}
        onPress={() => router.replace('/(tabs)' as never)}
      >
        <Text style={styles.logoText}>BNConcert</Text>
      </Pressable>
      <View style={styles.iconsContainer}>
        <Pressable onPress={onProfilePress} hitSlop={8} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={24} color={Colors.neutral700} />
        </Pressable>
        <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color={Colors.neutral700} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ComponentSizes.headerHeight,
    backgroundColor: Colors.white,
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
    fontFamily: Fonts.logo.fontFamily,
    fontSize: Fonts.logo.fontSize,
    lineHeight: Fonts.logo.lineHeight,
    color: Fonts.logo.color,
    letterSpacing: Fonts.logo.letterSpacing,
    textAlign: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 24,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
