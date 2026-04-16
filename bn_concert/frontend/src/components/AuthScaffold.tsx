import React, { memo } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Fonts, Spacing, ComponentSizes } from '../constants/theme';

const AUTH_BACKGROUND_URI =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80';

interface AuthScaffoldProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  showHeroBlock?: boolean;
  variant?: 'panel' | 'dialog';
}

function AuthScaffold({
  title,
  subtitle,
  children,
  footer,
  onBack,
  showBackButton = true,
  showHeroBlock = true,
  variant = 'panel',
}: AuthScaffoldProps) {
  const isDialog = variant === 'dialog';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ImageBackground
        source={{ uri: AUTH_BACKGROUND_URI }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.statusBar}>
                <Text style={styles.statusTime}>12:30</Text>
                <View style={styles.statusIcons}>
                  <Ionicons name="cellular" size={12} color={Colors.white} />
                  <Ionicons name="wifi" size={12} color={Colors.white} />
                  <Ionicons name="battery-half" size={14} color={Colors.white} />
                </View>
              </View>

              <View style={[styles.contentStack, isDialog && styles.contentStackDialog]}>
                <View style={styles.topContent}>
                  {showBackButton ? (
                    <Pressable style={styles.backButton} onPress={onBack}>
                      <Ionicons name="arrow-back-outline" size={16} color={Colors.white} />
                      <Text style={styles.backLabel}>Back</Text>
                    </Pressable>
                  ) : null}

                  {showHeroBlock ? (
                    <View style={[styles.heroBlock, !showBackButton && styles.heroBlockWithoutBack]}>
                      <Text style={styles.heroTitle}>{title}</Text>
                      <Text style={styles.heroSubtitle}>{subtitle}</Text>
                      <View style={styles.heroDivider} />
                    </View>
                  ) : null}
                </View>

                <View style={[styles.panel, variant === 'panel' && styles.panelBase, isDialog && styles.dialogPanel]}>
                  {children}
                  {footer ? <View style={styles.footer}>{footer}</View> : null}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: Colors.darkSurface,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayLight,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  statusBar: {
    height: ComponentSizes.statusBarHeight,
    paddingLeft: 44,
    paddingRight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTime: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    lineHeight: 16,
    color: Colors.white,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  contentStack: {
    flexGrow: 1,
    minHeight: 756,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    justifyContent: 'flex-start',
  },
  contentStackDialog: {
    justifyContent: 'center',
  },
  topContent: {
    width: '100%',
    maxWidth: ComponentSizes.modalWidth,
    alignSelf: 'center',
  },
  backButton: {
    marginTop: Spacing.xs,
    height: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: Fonts.button14.fontFamily,
    fontSize: Fonts.button14.fontSize,
    lineHeight: Fonts.button14.lineHeight,
    color: Colors.white,
  },
  heroBlock: {
    marginTop: Spacing.md,
    width: '100%',
  },
  heroBlockWithoutBack: {
    marginTop: 37,
  },
  heroTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.primary,
  },
  heroSubtitle: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.body14.fontFamily,
    fontSize: Fonts.body14.fontSize,
    lineHeight: Fonts.body14.lineHeight,
    color: Colors.white,
  },
  heroDivider: {
    marginTop: Spacing.md,
    width: 159,
    height: 1,
    backgroundColor: Colors.primary,
  },
  panel: {
    width: '100%',
    maxWidth: ComponentSizes.modalWidth,
    alignSelf: 'center',
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
  },
  panelBase: {
    minHeight: 418,
  },
  dialogPanel: {
    marginTop: Spacing.lg,
  },
  footer: {
    marginTop: Spacing.sm,
  },
});

export default memo(AuthScaffold);
