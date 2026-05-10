import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Fonts, Spacing } from '../constants/theme';

export default function VirtualAssistant() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const panelWidth = Math.min(328, width - Spacing.lg * 2);
  const panelHeight = Math.min(420, height - insets.top - insets.bottom - 96);

  return (
    <>
      {visible ? (
        <>
          <Pressable
            accessibilityLabel="Close virtual assistant"
            accessibilityRole="button"
            onPress={() => setVisible(false)}
            style={styles.backdrop}
          />
          <View
            style={[
              styles.panel,
              {
                height: panelHeight,
                left: Math.max(Spacing.md, (width - panelWidth) / 2),
                top: Math.max(insets.top + 56, (height - panelHeight) / 2),
                width: panelWidth,
              },
            ]}
          >
            <View style={styles.panelHeader}>
              <Text style={styles.title}>Virtual Assistant</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>

            <View style={styles.panelBody}>
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>
                  Hello Sylvie, I can help you quickly. Otherwise I will forward you to the right person at here or our partners. How can I help you?
                </Text>
              </View>
            </View>

            <View style={styles.composerBar}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Ask anything..."
                placeholderTextColor={Colors.textLight}
                style={styles.input}
              />
              <Pressable accessibilityRole="button" style={styles.sendButton} onPress={() => setMessage('')}>
                <Ionicons name="chevron-forward" size={16} color={Colors.white} />
              </Pressable>
            </View>
          </View>
        </>
      ) : null}

      {!visible ? (
        <Pressable
          accessibilityLabel="Open virtual assistant"
          accessibilityRole="button"
          onPress={() => setVisible(true)}
          style={({ pressed }) => [
            styles.floatingButton,
            { bottom: Math.max(132, insets.bottom + 116) },
            pressed && styles.floatingButtonPressed,
          ]}
        >
          <View style={styles.sparkleDot}>
            <Ionicons name="sparkles" size={13} color={Colors.info} />
          </View>
          <Ionicons name="sparkles-outline" size={20} color={Colors.info} />
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    elevation: 8,
    flexDirection: 'row',
    gap: 2,
    height: 40,
    justifyContent: 'center',
    paddingLeft: 9,
    paddingRight: 12,
    position: 'absolute',
    right: -6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    width: 56,
    zIndex: 50,
  },
  floatingButtonPressed: {
    opacity: 0.78,
  },
  sparkleDot: {
    alignItems: 'center',
    backgroundColor: '#EEF7FF',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 48,
  },
  panel: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    elevation: 10,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    zIndex: 49,
  },
  panelHeader: {
    backgroundColor: Colors.primary,
    height: 72,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: Fonts.medium.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.white,
  },
  onlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  onlineDot: {
    backgroundColor: Colors.success,
    borderRadius: 3,
    height: 6,
    marginRight: 6,
    width: 6,
  },
  onlineText: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 10,
    lineHeight: 12,
    color: Colors.white,
  },
  panelBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  messageBubble: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minHeight: 80,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  messageText: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 8,
    lineHeight: 10,
    color: Colors.neutral700,
  },
  composerBar: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    color: Colors.text,
    flex: 1,
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 8,
    height: 22,
    lineHeight: 10,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    height: 22,
    justifyContent: 'center',
    marginLeft: 12,
    width: 22,
  },
});
