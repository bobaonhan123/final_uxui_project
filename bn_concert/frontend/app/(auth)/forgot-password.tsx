import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../src/api/services';
import { Colors } from '../../src/constants/theme';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const AUTH_BACKGROUND_URI =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80';
const HERO_SUBTITLE =
  'Discover millions of concert, get alerts about your favorite artists, teams, plays and more — plus always-secure, effortless ticketing.';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const canSubmit = email.trim().length > 0 && !loading;

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      Alert.alert(
        'Reset Code Sent',
        'Check your email for the password reset code, then continue to reset your password.',
        [
          {
            text: 'Enter Code',
            onPress: () =>
              router.replace({
                pathname: '/(auth)/reset-password',
                params: { email: email.trim() },
              }),
          },
          { text: 'Back to login', onPress: () => router.replace('/(auth)/login') },
        ],
      );
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr?.response?.data?.detail || 'Could not process the request.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ImageBackground source={{ uri: AUTH_BACKGROUND_URI }} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.overlay}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.canvas}>
              <View style={styles.statusBar}>
                <Text style={styles.statusTime}>12:30</Text>
                <View style={styles.statusIcons}>
                  <Ionicons name="cellular" size={12} color={Colors.white} />
                  <Ionicons name="wifi" size={12} color={Colors.white} />
                  <Ionicons name="battery-half" size={14} color={Colors.white} />
                </View>
              </View>

              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back-outline" size={16} color={Colors.white} />
                <Text style={styles.backLabel}>Back</Text>
              </Pressable>

              <View style={styles.heroBlock}>
                <Text style={styles.heroTitle}>Welcome back</Text>
                <Text style={styles.heroSubtitle}>{HERO_SUBTITLE}</Text>
                <View style={styles.heroDivider} />
              </View>

              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Forgot password?</Text>
                  <Text style={styles.cardSubtitle}>
                    Enter your email address and we will send a secure reset code so you can get back to your account.
                  </Text>

                  <View>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputShell, isFocused && styles.inputShellFocused]}>
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor={Colors.textSecondary}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                      />
                    </View>
                  </View>

                  <Pressable
                    style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
                    onPress={handleReset}
                    disabled={!canSubmit}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={[styles.primaryButtonText, !canSubmit && styles.primaryButtonTextDisabled]}>
                        Send reset code
                      </Text>
                    )}
                  </Pressable>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Remembered it already? </Text>
                  <Pressable onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.footerLink}>Sign in</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  canvas: {
    width: '100%',
    maxWidth: 360,
    minHeight: 800,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statusBar: {
    height: 44,
    paddingLeft: 44,
    paddingRight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 16,
    color: Colors.white,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButton: {
    marginTop: 4,
    height: 17,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.white,
  },
  heroBlock: {
    marginTop: 16,
  },
  heroTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.primary,
  },
  heroSubtitle: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.white,
  },
  heroDivider: {
    marginTop: 16,
    width: 159,
    height: 1,
    backgroundColor: Colors.primary,
  },
  card: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: Colors.white,
    padding: 16,
    minHeight: 396,
    justifyContent: 'space-between',
  },
  cardContent: {
    gap: 24,
  },
  cardTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.text,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.neutral700,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  inputShell: {
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.textLight,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputShellFocused: {
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
    paddingVertical: 0,
  },
  primaryButton: {
    height: 40,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  primaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.white,
  },
  primaryButtonTextDisabled: {
    color: Colors.textLight,
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textLight,
  },
  footerLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.primary,
  },
});
