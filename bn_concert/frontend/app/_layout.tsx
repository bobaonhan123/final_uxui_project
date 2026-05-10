import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Appearance, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { DrSugiyama_400Regular } from '@expo-google-fonts/dr-sugiyama';
import { AuthProvider } from '../src/context/AuthContext';
import { Colors } from '../src/constants/theme';
import { VirtualAssistant } from '../src/components';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    DrSugiyama_400Regular,
  });

  useEffect(() => {
    Appearance.setColorScheme?.('light');
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.stackContent,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="concert/[id]" options={{ headerShown: true, title: 'Concert', headerTintColor: Colors.primary }} />
            <Stack.Screen name="artist/[id]" options={{ headerShown: true, title: 'Artist', headerTintColor: Colors.primary }} />
            <Stack.Screen name="blog/[slug]" options={{ headerShown: true, title: 'Blog', headerTintColor: Colors.primary }} />
            <Stack.Screen name="buy/[concertId]" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          </Stack>
          <VirtualAssistant />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stackContent: {
    backgroundColor: Colors.white,
  },
});
