import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { Colors, Spacing, Fonts, Breakpoints } from '../../../src/constants/theme';
import { Header } from '../../../src/components';

const STEPS = [
  { label: 'Date' },
  { label: 'Section' },
  { label: 'Seats' },
  { label: 'Confirm' },
  { label: 'Payment' },
];

function StepIndicator() {
  const pathname = usePathname();
  const currentStep = (() => {
    if (pathname.includes('/payment')) return 4;
    if (pathname.includes('/confirm')) return 3;
    if (pathname.includes('/seats')) return 2;
    if (pathname.includes('/section')) return 1;
    return 0;
  })();

  return (
    <View style={styles.stepContainer}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step.label}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
                index < currentStep && styles.stepCircleCompleted,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  index <= currentStep && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentStep && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentStep && styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function BuyLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.desktop;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        header: ({ options }) => (
          // show the compact header only on mobile; on desktop we render our full Header inside pages
          isDesktop ? null : (
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <Header showSearch searchPlaceholder="Search here" />
            </View>
          )
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Select Date' }} />
      <Stack.Screen name="section" options={{ title: 'Select Section' }} />
      <Stack.Screen name="seats" options={{ title: 'Choose Seats' }} />
      <Stack.Screen name="confirm" options={{ title: 'Confirm Order' }} />
      <Stack.Screen name="payment" options={{ title: 'Payment' }} />
      <Stack.Screen
        name="success"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="failed"
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 0,
  },
  headerTop: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  headerTitle: { ...Fonts.h3 },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  stepItem: { alignItems: 'center' },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepNumber: { fontFamily: Fonts.bold.fontFamily, fontSize: 10, color: Colors.textSecondary },
  stepNumberActive: { color: Colors.white },
  stepLabel: { ...Fonts.caption, fontSize: 10, lineHeight: 12, marginTop: 4 },
  stepLabelActive: { color: Colors.primary, fontFamily: Fonts.bold.fontFamily },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 0,
    marginBottom: 16,
  },
  stepLineActive: { backgroundColor: Colors.success },
});
