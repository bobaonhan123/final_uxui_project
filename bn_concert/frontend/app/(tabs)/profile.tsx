import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Fonts, Spacing } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingScreen } from '../../src/components';

type DashboardRoute =
  | '/dashboard/profile'
  | '/dashboard/settings'
  | '/dashboard/orders'
  | '/dashboard/gift-cards'
  | '/dashboard/help'
  | '/dashboard/contact';

const PRIMARY_MENU_ITEMS: ReadonlyArray<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: DashboardRoute;
}> = [
  { label: 'My Profile', icon: 'person-outline', route: '/dashboard/profile' },
  { label: 'Order History', icon: 'receipt-outline', route: '/dashboard/orders' },
  { label: 'Gift Cards', icon: 'gift-outline', route: '/dashboard/gift-cards' },
  { label: 'Settings', icon: 'settings-outline', route: '/dashboard/settings' },
  { label: 'Help', icon: 'help-circle-outline', route: '/dashboard/help' },
];

function getActiveDashboardRoute(pathname: string): DashboardRoute {
  if (pathname === '/dashboard/contact' || pathname.startsWith('/dashboard/contact/')) {
    return '/dashboard/contact';
  }
  if (pathname === '/dashboard/help' || pathname.startsWith('/dashboard/help/')) {
    return '/dashboard/help';
  }
  if (pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')) {
    return '/dashboard/settings';
  }
  if (pathname === '/dashboard/gift-cards' || pathname.startsWith('/dashboard/gift-cards/')) {
    return '/dashboard/gift-cards';
  }
  if (
    pathname === '/dashboard/orders' ||
    pathname.startsWith('/dashboard/orders/') ||
    pathname === '/dashboard/order' ||
    pathname.startsWith('/dashboard/order/')
  ) {
    return '/dashboard/orders';
  }
  return '/dashboard/profile';
}

export default function ProfileScreen() {
  const { user, logout, refreshUser, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [refreshing, setRefreshing] = React.useState(false);
  const activeRoute = getActiveDashboardRoute(pathname);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  }, [refreshUser]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="person-circle-outline" size={80} color={Colors.textSecondary} />
        <Text style={styles.loginPrompt}>Sign in to access your profile</Text>
        <Pressable style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginBtnText}>Sign In</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();
  const fullName = `${user.first_name} ${user.last_name}`.trim();

  const renderMenuItem = (
    item: { label: string; icon: keyof typeof Ionicons.glyphMap; route: DashboardRoute },
    isLast: boolean,
    compact = false,
    isActive = false
  ) => (
    <Pressable
      key={item.route + item.label}
      style={[
        styles.menuItem,
        compact && styles.menuItemCompact,
        isActive && styles.menuItemActive,
        !isLast && styles.menuBorder,
      ]}
      onPress={() => {
        router.push(item.route as never);
      }}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={item.icon} size={18} color={isActive ? Colors.primary : Colors.text} />
        <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={isActive ? Colors.primary : Colors.textSecondary} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        bounces={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.push('/(tabs)' as never)}>
          <Ionicons name="chevron-back" size={14} color={Colors.text} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)' as never)}>
          <Text style={styles.logo}>BNConcert</Text>
        </Pressable>

        <View style={styles.profileBlock}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          )}
          <Text style={styles.name}>{fullName}</Text>
        </View>

        <View style={styles.menuGroup}>
          {PRIMARY_MENU_ITEMS.map((item, index) =>
            renderMenuItem(
              item,
              index === PRIMARY_MENU_ITEMS.length - 1,
              false,
              activeRoute === item.route
            )
          )}
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  loginPrompt: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  loginBtnText: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    color: Colors.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    minHeight: 17,
  },
  backLabel: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    lineHeight: 14,
    color: Colors.darkSurface,
  },
  logo: {
    alignSelf: 'center',
    marginTop: 8,
    ...Fonts.logo,
  },
  profileBlock: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 24,
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.white,
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 26,
  },
  name: {
    marginTop: 8,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    lineHeight: 18,
    color: Colors.neutral700,
  },
  menuGroup: {
    backgroundColor: Colors.white,
    width: '100%',
    maxWidth: 328,
    alignSelf: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 312,
    alignSelf: 'center',
    minHeight: 42,
    paddingHorizontal: Spacing.md,
  },
  menuItemActive: {
    backgroundColor: Colors.selectedSurface,
  },
  menuItemCompact: { minHeight: 30 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    color: Colors.text,
  },
  menuLabelActive: {
    color: Colors.primary,
    fontFamily: Fonts.medium.fontFamily,
  },
  logoutBtn: {
    width: '100%',
    maxWidth: 328,
    alignSelf: 'center',
    marginTop: Spacing.lg,
    minHeight: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  logoutText: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    color: Colors.error,
  },
});
