import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  Linking,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// SafeAreaView not needed here; header/footer render inside ScrollView
import { Colors, Spacing, BorderRadius, Fonts, Breakpoints, Layout, Shadows } from '../../src/constants/theme';
import { supportApi } from '../../src/api/services';
import { useAuth } from '../../src/context/AuthContext';
import { Button, Header, Footer } from '../../src/components';

type ServiceModal = 'email' | 'chat' | 'call' | null;

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const SUPPORT_EMAIL = 'support@bnconcert.com';
const SUPPORT_PHONE = '08822334455';
const CALL_AVAILABILITY = 'Monday to Sunday';
const CALL_HOURS = '8:00 - 00:00';

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Q: When will I get my tickets?',
    answer:
      'Digital tickets are delivered instantly after payment confirmation and can be found in your account. If the event uses delayed delivery, we will notify you by email as soon as your tickets are released.',
  },
  {
    id: 'faq-2',
    question: 'Q: Where is my ticket?',
    answer:
      'Go to My Tickets in your dashboard to view and download all active tickets. If you still cannot find it, contact support with your order number so we can resend it.',
  },
  {
    id: 'faq-3',
    question: 'Q: How and when will I receive my money back?',
    answer:
      'Refunds are issued to your original payment method. Most refunds appear within 10 to 15 business days, depending on your bank processing time.',
  },
  {
    id: 'faq-4',
    question: 'Q: How can I cancel my order?',
    answer:
      'You can request cancellation from your order details page. Eligibility depends on the event organizer policy and how close the event date is.',
  },
  {
    id: 'faq-5',
    question: 'Q: Can I transfer my ticket to someone else?',
    answer:
      'Yes, for supported events you can transfer tickets from your account. Some organizers restrict transfer, so availability may vary by event.',
  },
  {
    id: 'faq-6',
    question: 'Q: What should I do if payment fails?',
    answer:
      'Try again with a stable network and check card details. If the issue continues, use another payment method or contact our support team.',
  },
];

export default function ContactScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;
  const isAuthenticated = !!user;

  const [activeModal, setActiveModal] = useState<ServiceModal>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string>(FAQ_ITEMS[0].id);

  const [firstName, setFirstName] = useState(user?.first_name ?? 'Sylvie');
  const [lastName, setLastName] = useState(user?.last_name ?? 'Van Bleek');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatInput, setChatInput] = useState('Ask anything...');

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  const openExternal = async (url: string, fallbackMessage: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Unavailable', fallbackMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unavailable', fallbackMessage);
    }
  };

  const MENU_ROWS = [
    { id: 'menu-contact', icon: 'call-outline', label: 'Contact us', route: '/dashboard/contact' },
    { id: 'menu-tickets', icon: 'ticket-outline', label: 'Tickets', route: '/(tabs)/tickets' },
    { id: 'menu-blog', icon: 'document-text-outline', label: 'Blog', route: '/(tabs)/blog' },
    { id: 'menu-language', icon: 'information-circle-outline', label: 'Language' },
  ];

  const handleCallNow = async () => {
    await openExternal(`tel:${SUPPORT_PHONE}`, 'Calling is not available on this device.');
  };

  const handleSendEmail = async () => {
    if (!firstName.trim() || !lastName.trim() || !message.trim()) {
      Alert.alert('Error', 'Please complete all required fields.');
      return;
    }

    setSending(true);
    try {
      await supportApi.contact({
        name: fullName,
        email: user?.email || SUPPORT_EMAIL,
        subject: orderNumber.trim() ? `Support request - Order ${orderNumber.trim()}` : 'Support request',
        message: message.trim(),
      });

      Alert.alert('Message Sent', 'Thank you. Our team will contact you shortly.');
      setActiveModal(null);
      setMessage('');
      setOrderNumber('');
    } catch {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const contentWrapperStyle = [styles.contentWrapper, isDesktop ? styles.contentWrapperDesktop : null];

  return (
    <View style={styles.page}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDesktop && (
          <View style={styles.headerFullWidth}>
            <Header
              containerStyle={{ maxWidth: Layout.maxContentWidth, alignSelf: 'center' }}
              isDesktop={isDesktop}
              isAuthenticated={isAuthenticated}
              menuRows={MENU_ROWS}
              onMenuRowPress={(row) => (row.route ? router.push(row.route) : undefined)}
              onMenuPress={() => {}}
              showSearch={'inline'}
              searchPlaceholder={'Search here'}
              onProfilePress={() => router.push('/(tabs)/profile' as never)}
              onLoginPress={() => router.push('/(auth)/login' as never)}
            />
          </View>
        )}

        {!isDesktop && (
          <Header
            showSearch
            onSearchPress={() => router.push('/(tabs)/search' as never)}
            onProfilePress={() => router.push('/(tabs)/profile' as never)}
          />
        )}

        <View style={contentWrapperStyle}>
            <Text style={styles.sectionLabel}>Customer Service</Text>
            <Text style={styles.pageTitle}>How can we help you?</Text>
            <Text style={styles.pageSubtitle}>
              Have a question? We may already have the answer for you! Check out our Frequently Asked Questions (FAQ) section below.
            </Text>

            <Text style={styles.faqSectionTitle}>Frequently asked questions</Text>
            <View style={styles.faqList}>
              {FAQ_ITEMS.map((item) => {
                const expanded = item.id === expandedFaqId;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.faqItem, expanded ? styles.faqItemExpanded : null]}
                    onPress={() => setExpandedFaqId(expanded ? '' : item.id)}
                  >
                    <View style={[styles.faqItemHeader, expanded && styles.faqItemHeaderExpanded]}>
                      <Text style={styles.faqQuestion}>{item.question}</Text>
                      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.neutral700} />
                    </View>
                    {expanded ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
                  </Pressable>
                );
              })}

              <Pressable style={styles.seeMoreButton} onPress={() => router.push('/dashboard/help' as never)}>
                <Text style={styles.seeMoreText}>See More</Text>
              </Pressable>
            </View>

            <Text style={styles.helpTitle}>Can't find what you are looking for?</Text>
            <Text style={styles.helpSubtitle}>Our self-help center is the fastest place to get help.</Text>

            <View style={styles.serviceRow}>
              <Pressable style={styles.serviceCard} onPress={() => setActiveModal('email')}>
                <Ionicons name="mail-outline" size={24} color={Colors.primary} />
                <Text style={styles.serviceText}>Send Us an Email</Text>
              </Pressable>

              <Pressable style={styles.serviceCard} onPress={() => setActiveModal('chat')}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.primary} />
                <Text style={styles.serviceText}>Live Chat</Text>
              </Pressable>

              <Pressable style={styles.serviceCard} onPress={() => setActiveModal('call')}>
                <Ionicons name="call-outline" size={24} color={Colors.primary} />
                <Text style={styles.serviceText}>Call Us</Text>
              </Pressable>
            </View>
          </View>
        {isDesktop && (
          <View style={[styles.footerWrapper, styles.footerWrapperDesktop]}>
            <Footer containerStyle={[styles.footer, styles.footerDesktopContainer]} />
          </View>
        )}
        </ScrollView>

      <Modal visible={activeModal === 'call'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={[styles.chatModalOverlay, isDesktop ? styles.chatModalOverlayDesktop : styles.modalOverlay]} onPress={() => setActiveModal(null)}>
          <Pressable style={[styles.modalCard, isDesktop ? styles.modalCardDesktop : null]} onPress={() => undefined}>
            <Pressable style={styles.modalCloseIcon} onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={16} color={Colors.neutral700} />
            </Pressable>

            <Text style={styles.modalTitle}>Call Us</Text>
            <Text style={styles.modalText}>
              Our customer service is ready to help. The waiting time can be up to 4 minutes. Have your order number at hand.
            </Text>
            <Text style={styles.modalDetail}>{CALL_AVAILABILITY}</Text>
            <Text style={styles.modalDetail}>{CALL_HOURS}</Text>

            <Text style={styles.modalPhoneCentered}>{SUPPORT_PHONE}</Text>

            <Pressable style={{ alignSelf: 'center', marginTop: Spacing.md }}>
              <Button title="Call Now" onPress={handleCallNow} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={activeModal === 'chat'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={[styles.chatModalOverlay, isDesktop ? styles.chatModalOverlayDesktop : null]} onPress={() => setActiveModal(null)}>
          <Pressable style={[styles.chatPanel, isDesktop ? styles.chatPanelDesktop : null]} onPress={() => undefined}>
            <View style={styles.chatPanelHeader}>
              <Text style={styles.chatPanelTitle}>Virtual Assistant</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>

            <View style={styles.chatPanelBody}>
              <View style={styles.chatGreetingBubble}>
                <Text style={styles.chatGreeting}>
                  Hello Sylvie, I can help you quickly. Otherwise I will forward you to the right person at here or our partners. How can I help you?
                </Text>
              </View>
            </View>

            <View style={styles.chatComposerBar}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                style={styles.chatInput}
                placeholder="Ask anything..."
                placeholderTextColor={Colors.textLight}
              />
              <Pressable style={[styles.chatSendButton, isDesktop ? styles.chatSendButtonDesktop : null]}>
                <Ionicons name="chevron-forward" size={16} color={Colors.white} />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={activeModal === 'email'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDesktop ? styles.modalCardDesktop : null]}>
            <Pressable style={styles.modalCloseIcon} onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={16} color={Colors.neutral700} />
            </Pressable>

            <Text style={styles.modalTitle}>Send Us an Email</Text>
            <Text style={styles.modalText}>Complete this form so we can check it for you.</Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>First name</Text>
              <TextInput value={firstName} onChangeText={setFirstName} style={styles.formInput} />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Last name</Text>
              <TextInput value={lastName} onChangeText={setLastName} style={styles.formInput} />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Your phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.formInput}
                placeholder="Enter Input"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Your order nr (Optional)</Text>
              <TextInput
                value={orderNumber}
                onChangeText={setOrderNumber}
                style={styles.formInput}
                placeholder="Enter Input"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Your message</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Enter Input"
                placeholderTextColor={Colors.textLight}
                multiline
              />
            </View>

            <Pressable style={{ alignSelf: 'flex-end' }}>
              <Button title="Send" onPress={handleSendEmail} loading={sending} />
            </Pressable>
          </View>
        </View>
      </Modal>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: Fonts.heading18.fontFamily,
    fontSize: Fonts.heading18.fontSize,
    lineHeight: Fonts.heading18.lineHeight,
    color: Colors.secondary,
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: Fonts.heading16.fontFamily,
    fontSize: Fonts.heading16.fontSize,
    lineHeight: 32,
    color: Colors.text,
    marginBottom: 10,
  },
  pageSubtitle: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: Fonts.body12.fontSize,
    lineHeight: 14,
    color: Colors.text,
    marginBottom: 24,
  },
  faqSectionTitle: {
    fontFamily: Fonts.heading18.fontFamily,
    fontSize: Fonts.heading18.fontSize,
    lineHeight: Fonts.heading18.lineHeight,
    color: Colors.secondary,
    marginBottom: Spacing.md,
  },
  faqList: {
    marginBottom: Spacing.lg,
  },
  faqItem: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  faqItemExpanded: {
    paddingBottom: 0,
  },
  faqItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: Spacing.md,
  },
  faqItemHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  faqQuestion: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 14,
    lineHeight: 14,
    color: '#493D44',
    paddingRight: Spacing.sm,
    flex: 1,
  },
  faqAnswer: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  seeMoreButton: {
    marginTop: 2,
    alignSelf: 'center',
    minWidth: 117,
    height: 40,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreText: {
    fontFamily: Fonts.button14.fontFamily,
    fontSize: Fonts.button14.fontSize,
    lineHeight: Fonts.button14.lineHeight,
    color: Colors.neutral700,
  },
  helpTitle: {
    fontFamily: Fonts.heading16.fontFamily,
    fontSize: 16,
    lineHeight: 32,
    color: Colors.secondary,
    marginBottom: Spacing.md,
  },
  helpSubtitle: {
    fontFamily: Fonts.heading16.fontFamily,
    fontSize: 16,
    lineHeight: 32,
    color: Colors.secondary,
    marginBottom: Spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  serviceCard: {
    flex: 1,
    height: 74,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  serviceText: {
    fontFamily: Fonts.body10.fontFamily,
    fontSize: Fonts.body10.fontSize,
    lineHeight: Fonts.body10.lineHeight,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.loadingOverlay,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  modalCardDesktop: {
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  modalTitle: {
    ...Fonts.h3,
    marginBottom: Spacing.sm,
  },
  modalText: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  modalDetail: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  modalPhone: {
    ...Fonts.h3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalPhoneCentered: {
    ...Fonts.h2,
    marginTop: Spacing.md,
    textAlign: 'center',
    color: Colors.neutral950,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  onlineText: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 10,
    lineHeight: 12,
    color: Colors.white,
  },
  chatModalOverlay: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  chatPanel: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    height: 420,
    maxWidth: 328,
    overflow: 'hidden',
    width: '100%',
  },
  chatModalOverlayDesktop: {
    backgroundColor: Colors.loadingOverlay,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPanelDesktop: {
    width: 560,
    height: 520,
    maxWidth: '90%',
    borderRadius: BorderRadius.lg,
  },
  chatPanelHeader: {
    backgroundColor: Colors.primary,
    height: 72,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chatPanelTitle: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 16,
    lineHeight: 20,
    color: Colors.white,
  },
  chatPanelBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chatGreetingBubble: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chatGreeting: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.neutral700,
  },
  chatComposerBar: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 12,
  },
  chatInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    color: Colors.text,
    flex: 1,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 14,
    height: 40,
    lineHeight: 20,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chatSendButton: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  chatSendButtonDesktop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 16,
  },
  formField: {
    marginBottom: Spacing.sm,
  },
  formLabel: {
    ...Fonts.caption,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  formInput: {
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    ...Fonts.regular,
    color: Colors.text,
  },
  formTextArea: {
    minHeight: 92,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  modalCloseButton: {
    marginTop: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCloseText: {
    ...Fonts.medium,
    color: Colors.text,
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  contentWrapperDesktop: {
    paddingHorizontal: 0,
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
  page: {
    flex: 1,
    backgroundColor: Colors.white,
    width: '100%',
  },
  headerFullWidth: {
    width: '100%',
    backgroundColor: Colors.white,
  },
  footer: {
    width: '100%',
    marginTop: 60,
  },
  footerDesktopContainer: {
    width: '100%',
    backgroundColor: Colors.black,
  },
  footerWrapper: {
    width: '100%',
  },
  footerWrapperDesktop: {
    // cancel the ScrollView content horizontal padding so footer bleeds edge-to-edge
    marginHorizontal: -Spacing.md,
  },
  footerOuter: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});
