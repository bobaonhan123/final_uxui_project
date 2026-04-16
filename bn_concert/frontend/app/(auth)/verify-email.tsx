import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const tokenValue = useMemo(() => (Array.isArray(params.token) ? params.token[0] : params.token), [params.token]);
  const emailValue = useMemo(() => (Array.isArray(params.email) ? params.email[0] : params.email), [params.email]);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  useEffect(() => {
    if (!tokenValue) return;

    let active = true;
    const verifyWithToken = async () => {
      setIsAutoVerifying(true);
      try {
        await authApi.verifyEmail({ token: tokenValue });
        router.replace('/(tabs)');
      } catch (err) {
        if (!active) return;
        const apiErr = err as ApiError;
        const msg = apiErr?.response?.data?.detail || 'Verification failed. Please try again.';
        Alert.alert('Error', msg);
      } finally {
        if (active) {
          setIsAutoVerifying(false);
        }
      }
    };

    void verifyWithToken();
    return () => {
      active = false;
    };
  }, [tokenValue]);

  const handleClickHere = () => {
    if (emailValue) {
      router.replace({ pathname: '/(auth)/register', params: { email: emailValue } });
      return;
    }
    router.replace('/(auth)/register');
  };

  return (
    <ImageBackground source={{ uri: AUTH_BACKGROUND_URI }} style={styles.background} imageStyle={styles.backgroundImage}>
      <View style={styles.overlay}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
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

            <View style={styles.heroBlock}>
              <Text style={styles.heroTitle}>Welcome back</Text>
              <Text style={styles.heroSubtitle}>{HERO_SUBTITLE}</Text>
              <View style={styles.heroDivider} />
            </View>

            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>Verify your email address</Text>
              <Text style={styles.dialogBody}>
                To complete your account setup, please verify your email address. We’ve sent a verification link to your
                email. Please check your inbox and click the link to activate your account.
              </Text>
              <Text style={styles.dialogBody}>
                <Text style={styles.dialogLink} onPress={handleClickHere}>
                  Click here
                </Text>
                <Text>
                  {' '}
                  if you did not receive an email or would like to change the email address you registered with.
                </Text>
              </Text>
              {isAutoVerifying ? (
                <View style={styles.autoVerifyRow}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.autoVerifyText}>Verifying link...</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  heroBlock: {
    marginTop: 37,
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
  dialogCard: {
    marginTop: 87,
    borderRadius: 16,
    backgroundColor: Colors.white,
    padding: 16,
    gap: 24,
  },
  dialogTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    lineHeight: 32,
    color: Colors.text,
    textAlign: 'center',
  },
  dialogBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.neutral700,
    textAlign: 'center',
  },
  dialogLink: {
    color: Colors.info,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  autoVerifyRow: {
    marginTop: -8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  autoVerifyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
});
