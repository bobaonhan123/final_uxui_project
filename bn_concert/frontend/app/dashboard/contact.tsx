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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Fonts } from '../../src/constants/theme';
import { supportApi } from '../../src/api/services';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components';

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

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
                <View style={styles.faqItemHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.neutral700} />
                </View>
                {expanded ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
              </Pressable>
            );
          })}

          <Pressable style={styles.seeMoreButton} onPress={() => router.push('/dashboard/help' as never)}>
            <Ionicons name="arrow-back" size={16} color={Colors.white} />
            <Text style={styles.seeMoreText}>See More</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
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
      </ScrollView>

      <Modal visible={activeModal === 'call'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Call Us</Text>
            <Text style={styles.modalText}>
              Our customer service is ready to help. The waiting time can be up to 4 minutes. Have your order number at hand.
            </Text>
            <Text style={styles.modalDetail}>{CALL_AVAILABILITY}</Text>
            <Text style={styles.modalDetail}>{CALL_HOURS}</Text>
            <Text style={styles.modalPhone}>{SUPPORT_PHONE}</Text>
            <Button title="Call Now" onPress={handleCallNow} />
            <Pressable style={styles.modalCloseButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === 'chat'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Virtual Assistant</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
            <Text style={styles.chatGreeting}>
              Hello Sylvie, I can help you quickly. Otherwise I will forward you to the right person at here or our partners. How can I help you?
            </Text>
            <View style={styles.chatInputRow}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                style={styles.chatInput}
                placeholder="Ask anything..."
                placeholderTextColor={Colors.textLight}
              />
              <Pressable style={styles.chatSendButton}>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </Pressable>
            </View>
            <Pressable style={styles.modalCloseButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === 'email'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
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

            <Button title="Send" onPress={handleSendEmail} loading={sending} />
            <Pressable style={styles.modalCloseButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Fonts.heading18,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    ...Fonts.h2,
    fontSize: 28,
    lineHeight: 32,
    marginBottom: Spacing.sm,
  },
  pageSubtitle: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  faqSectionTitle: {
    ...Fonts.heading18,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  faqList: {
    marginBottom: Spacing.lg,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginBottom: Spacing.sm,
  },
  faqItemExpanded: {
    paddingBottom: Spacing.md,
  },
  faqItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    ...Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    paddingRight: Spacing.sm,
    flex: 1,
  },
  faqAnswer: {
    ...Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  seeMoreButton: {
    marginTop: Spacing.xs,
    alignSelf: 'center',
    minWidth: 130,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeMoreText: {
    ...Fonts.button14,
    color: Colors.white,
    marginHorizontal: Spacing.sm,
  },
  helpTitle: {
    ...Fonts.medium,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  helpSubtitle: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  serviceCard: {
    flex: 1,
    minHeight: 74,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  serviceText: {
    ...Fonts.caption,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
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
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    marginRight: Spacing.xs,
  },
  onlineText: {
    ...Fonts.caption,
    color: Colors.success,
  },
  chatGreeting: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    ...Fonts.regular,
    color: Colors.text,
  },
  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
});
