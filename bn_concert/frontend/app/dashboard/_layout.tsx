import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,

      }}
    >
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
      <Stack.Screen name="orders" options={{ title: 'My Orders' }} />
      <Stack.Screen name="tickets" options={{ title: 'My Tickets' }} />
      <Stack.Screen name="gift-cards" options={{ title: 'Gift Cards' }} />
      <Stack.Screen name="payments" options={{ title: 'Payment Methods' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="help" options={{ title: 'Help & FAQ' }} />
      <Stack.Screen name="contact" options={{ headerShown: false }} />
      <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
    </Stack>
  );
}
