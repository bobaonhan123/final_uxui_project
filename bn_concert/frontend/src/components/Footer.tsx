import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Breakpoints, Colors, Spacing, BorderRadius, Fonts, ComponentSizes, Layout } from '../constants/theme';

interface FooterProps {
  containerStyle?: StyleProp<ViewStyle>;
}

const BN_LINKS = [
  'About us',
  'Careers',
  'Press',
  'Event organizers',
  'Getting there',
  'Privacy policy',
  'Terms & conditions',
] as const;

const HELP_LINKS = ['FAQs', 'Help center', 'Contact us', 'Customer service'] as const;

const MORE_LINKS = [
  'Cancelled concerts',
  'Cancellation insurance',
  'Rescheduled events',
] as const;

type SocialIcon =
  | { key: string; family: 'ionicon'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { key: string; family: 'fa5'; name: React.ComponentProps<typeof FontAwesome5>['name'] };

const SOCIAL_ICONS: SocialIcon[] = [
  { key: 'instagram', family: 'ionicon', name: 'logo-instagram' },
  { key: 'youtube', family: 'ionicon', name: 'logo-youtube' },
  { key: 'twitter', family: 'ionicon', name: 'logo-twitter' },
  { key: 'spotify', family: 'fa5', name: 'spotify' },
  { key: 'facebook', family: 'ionicon', name: 'logo-facebook' },
];

export default function Footer({ containerStyle }: FooterProps) {
  const [email, setEmail] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;
  const contentWidth = isDesktop
    ? Math.min(Layout.maxContentWidth, Math.max(0, width - Layout.desktopHorizontalPadding * 2))
    : Math.min(ComponentSizes.modalWidth, Math.max(244, width - Spacing.md * 2));
  const formWidth = Math.min(ComponentSizes.modalWidth, contentWidth);
  const compact = formWidth < 320;
  const storeButtonWidth = Math.max(112, Math.floor((formWidth - Spacing.sm) / 2));
  const storeIconSize = compact ? 20 : 24;

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop, containerStyle]}>
      <View style={[styles.content, { width: contentWidth }]}>
        <View style={[styles.mainRow, isDesktop && styles.mainRowDesktop]}>
          <View style={[styles.introBlock, { maxWidth: formWidth }, isDesktop && styles.introBlockDesktop]}>
            <Text style={styles.sectionTitle}>Let&apos;s keep in touch</Text>
            <Text style={styles.subtitle}>
              Stay updated with BNConcert&apos;s latest news and exclusive offers!
            </Text>

            <View style={[styles.subscribeBox, { maxWidth: formWidth }]}>
              <TextInput
                style={[styles.subscribeInput, compact && styles.subscribeInputCompact]}
                placeholder="Enter your email address"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Pressable style={[styles.subscribeButton, compact && styles.subscribeButtonCompact]}>
                <Text numberOfLines={1} style={styles.subscribeButtonText}>
                  {compact ? 'Subscribe' : 'Subscribe Now'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.termsText}>
              By subscribing, you agree to our terms &amp; conditions &amp; Privacy policy
            </Text>

            <View style={[styles.storeRow, { maxWidth: formWidth }]}>
              <Pressable style={[styles.storeButton, { width: storeButtonWidth }, compact && styles.storeButtonCompact]}>
                <Ionicons name="logo-google-playstore" size={storeIconSize} color={Colors.primary} />
                <View style={styles.storeTextWrapper}>
                  <Text style={styles.storeLabel}>Download on the</Text>
                  <Text numberOfLines={1} style={[styles.storeName, compact && styles.storeNameCompact]}>
                    Google Play
                  </Text>
                </View>
              </Pressable>

              <Pressable style={[styles.storeButton, { width: storeButtonWidth }, compact && styles.storeButtonCompact]}>
                <Ionicons name="logo-apple" size={storeIconSize} color={Colors.primary} />
                <View style={styles.storeTextWrapper}>
                  <Text style={styles.storeLabel}>Download on the</Text>
                  <Text numberOfLines={1} style={[styles.storeName, compact && styles.storeNameCompact]}>
                    App Store
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[styles.linksWrapper, isDesktop && styles.linksWrapperDesktop]}>
            <View style={[styles.linkSection, isDesktop && styles.linkSectionDesktop]}>
              <Text style={styles.sectionTitle}>BNConcert</Text>
              <View style={styles.linkGroup}>
                {BN_LINKS.map((label) => (
                  <Pressable key={label}>
                    <Text style={styles.linkText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.linkSection, isDesktop && styles.linkSectionDesktop]}>
              <Text style={styles.sectionTitle}>Looking for help</Text>
              <View style={styles.linkGroup}>
                {HELP_LINKS.map((label) => (
                  <Pressable key={label}>
                    <Text style={styles.linkText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.linkSection, isDesktop && styles.linkSectionDesktop]}>
              <Text style={styles.sectionTitle}>Looking for more</Text>
              <View style={styles.linkGroup}>
                {MORE_LINKS.map((label) => (
                  <Pressable key={label}>
                    <Text style={styles.linkText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.socialRow, isDesktop && styles.socialRowDesktop]}>
            {SOCIAL_ICONS.map((icon) => (
              <Pressable key={icon.key}>
                {icon.family === 'fa5' ? (
                  <FontAwesome5 name={icon.name} size={24} color={Colors.white} />
                ) : (
                  <Ionicons name={icon.name} size={24} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.copyrightRow}>
          <Ionicons name="copy-outline" size={18} color={Colors.white} />
          <Text style={styles.copyrightText}>BNConcert All Rights Reserved</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: Colors.black,
    minHeight: ComponentSizes.footerHeight,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    width: '100%',
  },
  containerDesktop: {
    minHeight: ComponentSizes.footerHeightDesktop,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  content: {
    alignSelf: 'center',
    maxWidth: Layout.maxContentWidth,
  },
  mainRow: {
    width: '100%',
  },
  mainRowDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  introBlock: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: ComponentSizes.modalWidth,
  },
  introBlockDesktop: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontFamily: Fonts.heading16.fontFamily,
    fontSize: Fonts.heading16.fontSize,
    lineHeight: Fonts.heading16.lineHeight,
    color: Colors.white,
  },
  subtitle: {
    fontFamily: Fonts.body14.fontFamily,
    fontSize: Fonts.body14.fontSize,
    lineHeight: Fonts.body14.lineHeight,
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  subscribeBox: {
    width: '100%',
    maxWidth: ComponentSizes.modalWidth,
    height: 48,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm + Spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscribeInput: {
    flex: 1,
    maxWidth: 159,
    minWidth: 0,
    padding: 0,
    color: Colors.text,
    fontFamily: Fonts.caption.fontFamily,
    fontSize: Fonts.caption.fontSize,
    lineHeight: Fonts.caption.lineHeight,
  },
  subscribeInputCompact: {
    fontSize: 11,
    maxWidth: 128,
  },
  subscribeButton: {
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButtonCompact: {
    paddingHorizontal: 12,
  },
  subscribeButtonText: {
    fontFamily: Fonts.button12.fontFamily,
    fontSize: Fonts.button12.fontSize,
    lineHeight: Fonts.button12.lineHeight,
    color: Colors.white,
  },
  termsText: {
    marginTop: Spacing.sm + Spacing.xxs,
    fontFamily: Fonts.body10.fontFamily,
    fontSize: Fonts.body10.fontSize,
    lineHeight: Fonts.body10.lineHeight,
    color: Colors.white,
  },
  linkSection: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    maxWidth: ComponentSizes.modalWidth,
    width: '100%',
  },
  linkSectionDesktop: {
    alignSelf: 'flex-start',
    flex: 1,
    marginTop: 0,
    maxWidth: 180,
  },
  linksWrapper: {
    width: '100%',
  },
  linksWrapperDesktop: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: Spacing.xxl,
  },
  linkGroup: {
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  linkText: {
    fontFamily: Fonts.body14.fontFamily,
    fontSize: Fonts.body14.fontSize,
    lineHeight: Fonts.body14.lineHeight,
    color: Colors.white,
  },
  socialRow: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  socialRowDesktop: {
    alignSelf: 'flex-start',
    marginTop: 0,
    flexDirection: 'column',
    gap: Spacing.md,
  },
  storeRow: {
    alignSelf: 'center',
    marginTop: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: ComponentSizes.modalWidth,
  },
  storeButton: {
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  storeButtonCompact: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  storeTextWrapper: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 6,
  },
  storeLabel: {
    fontFamily: Fonts.caption.fontFamily,
    fontSize: 8,
    lineHeight: 16,
    color: Colors.text,
  },
  storeName: {
    fontFamily: Fonts.h3.fontFamily,
    fontSize: 12,
    lineHeight: 26,
    color: Colors.text,
  },
  storeNameCompact: {
    fontSize: 11,
  },
  copyrightRow: {
    marginTop: Spacing.xl + Spacing.xs,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  copyrightText: {
    fontFamily: Fonts.caption.fontFamily,
    fontSize: Fonts.caption.fontSize,
    lineHeight: Fonts.caption.lineHeight,
    color: Colors.white,
  },
});
