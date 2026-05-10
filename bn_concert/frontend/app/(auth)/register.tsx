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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../src/api/services';
import { getPasswordStrengthError } from '../../src/constants/auth';
import { Colors } from '../../src/constants/theme';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const AUTH_BACKGROUND_URI =
  'https://www.figma.com/api/mcp/asset/d021dfbc-b191-4362-bcc1-1948cc94831c';
const HERO_SUBTITLE =
  'Discover millions of concert, get alerts about your favorite artists, teams, plays and more - plus always-secure, effortless ticketing.';

type FocusedField = 'email' | 'firstName' | 'lastName' | 'phone' | 'password' | 'confirmPassword' | null;

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = Array.isArray(params.email) ? params.email[0] : params.email;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail ?? '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNextStep = () => {
    if (step === 1) {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
      }
    } else if (step === 2) {
      if (!firstName.trim()) {
        Alert.alert('Error', 'Please enter your first name.');
        return;
      }
      if (!lastName.trim()) {
        Alert.alert('Error', 'Please enter your last name.');
        return;
      }
    }
    setStep((previous) => previous + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  };

  const validatePasswords = () => {
    const passwordError = getPasswordStrengthError(password);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      await authApi.register({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
      });

      Alert.alert('Success', 'Account created successfully. Redirecting to verification...', [
        {
          text: 'OK',
          onPress: () => {
            router.replace({
              pathname: '/(auth)/verify-email',
              params: { email: email.trim() },
            });
          },
        },
      ]);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr?.response?.data?.detail || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <View>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputShell, focusedField === 'email' && styles.inputShellFocused]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!initialEmail}
              style={styles.input}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>
      );
    }

    if (step === 2) {
      return (
        <>
          <View>
            <Text style={styles.label}>First Name</Text>
            <View style={[styles.inputShell, focusedField === 'firstName' && styles.inputShellFocused]}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
          <View>
            <Text style={styles.label}>Last Name</Text>
            <View style={[styles.inputShell, focusedField === 'lastName' && styles.inputShellFocused]}>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </>
      );
    }

    if (step === 3) {
      return (
        <View>
          <Text style={styles.label}>Phone (Optional)</Text>
          <View style={[styles.inputShell, focusedField === 'phone' && styles.inputShellFocused]}>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
              style={styles.input}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>
      );
    }

    return (
      <>
        <View>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputShell, focusedField === 'password' && styles.inputShellFocused]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry={!showPassword}
              style={styles.input}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={16}
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputShell, focusedField === 'confirmPassword' && styles.inputShellFocused]}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={16}
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </>
    );
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Create your account';
      case 2:
        return 'Tell us about yourself';
      case 3:
        return 'Add contact information';
      case 4:
        return 'Set your password';
      default:
        return 'Create account';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return 'Enter your email address to get started.';
      case 2:
        return 'Help us know who you are.';
      case 3:
        return 'So we can reach you when needed.';
      case 4:
        return 'Choose a secure password for your account.';
      default:
        return '';
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

              {step > 1 ? (
                <Pressable style={styles.backButton} onPress={handlePreviousStep}>
                  <Ionicons name="chevron-back-outline" size={16} color={Colors.white} />
                  <Text style={styles.backLabel}>Back</Text>
                </Pressable>
              ) : null}

              <View style={styles.heroBlock}>
                <Text style={styles.heroTitle}>Welcome</Text>
                <Text style={styles.heroSubtitle}>{HERO_SUBTITLE}</Text>
                <View style={styles.heroDivider} />
              </View>

              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View>
                    <View style={styles.stepIndicator}>
                      {[1, 2, 3, 4].map((s) => (
                        <View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive]} />
                      ))}
                    </View>
                    <Text style={styles.cardTitle}>{getStepTitle()}</Text>
                    <Text style={styles.cardSubtitle}>{getStepSubtitle()}</Text>
                  </View>

                  <View style={styles.fieldsGroup}>{renderStepContent()}</View>
                </View>

                <View style={styles.buttonRow}>
                  {step > 1 ? (
                    <Pressable style={styles.secondaryButton} onPress={handlePreviousStep}>
                      <Text style={styles.secondaryButtonText}>Back</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    style={[styles.primaryButton, step > 1 && styles.primaryButtonFlexed]}
                    onPress={step === 4 ? handleRegister : handleNextStep}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>{step === 4 ? 'Complete' : 'Next'}</Text>
                    )}
                  </Pressable>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Already have an account? </Text>
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
    minHeight: 418,
    justifyContent: 'space-between',
  },
  cardContent: {
    gap: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  cardTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.text,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  fieldsGroup: {
    gap: 16,
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
    color: Colors.text,
    paddingVertical: 0,
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral700,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.neutral700,
  },
  primaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonFlexed: {
    flex: 1,
  },
  primaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    color: Colors.white,
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
