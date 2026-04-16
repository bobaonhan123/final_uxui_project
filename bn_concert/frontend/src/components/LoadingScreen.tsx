import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, BorderRadius, ComponentSizes } from '../constants/theme';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = 'This might take a few seconds...' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.text}>{message}</Text>
        <Ionicons name="refresh-outline" size={24} color={Colors.text} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.loadingOverlay,
  },
  card: {
    width: ComponentSizes.modalWidth,
    height: 120,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Fonts.heading16.fontFamily,
    fontSize: Fonts.heading16.fontSize,
    lineHeight: Fonts.heading16.lineHeight,
    color: Colors.text,
  },
});
