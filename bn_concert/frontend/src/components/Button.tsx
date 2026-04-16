import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Fonts, ComponentSizes, Spacing } from '../constants/theme';

const sizeStyles = {
  sm: 'smSize',
  md: 'mdSize',
  lg: 'lgSize',
} as const;

const sizeTextStyles = {
  sm: 'smText',
  md: 'mdText',
  lg: 'lgText',
} as const;

const variantStyles = {
  primary: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
} as const;

const variantTextStyles = {
  primary: 'primaryText',
  secondary: 'secondaryText',
  outline: 'outlineText',
  ghost: 'ghostText',
} as const;

const disabledVariantStyles = {
  primary: 'primaryDisabled',
  secondary: 'secondaryDisabled',
  outline: 'outlineDisabled',
  ghost: 'ghostDisabled',
} as const;

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const getIndicatorColor = (
  variant: NonNullable<Props['variant']>,
  disabled: boolean,
) => {
  if (disabled) {
    return Colors.textLight;
  }
  if (variant === 'outline' || variant === 'ghost') {
    return Colors.neutral700;
  }
  return Colors.white;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[sizeStyles[size]],
        styles[variantStyles[variant]],
        isDisabled && styles[disabledVariantStyles[variant]],
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={getIndicatorColor(variant, isDisabled)} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              styles[sizeTextStyles[size]],
              styles[variantTextStyles[variant]],
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  smSize: {
    minHeight: ComponentSizes.buttonHeightSm,
    paddingHorizontal: Spacing.md,
  },
  mdSize: {
    minHeight: ComponentSizes.buttonHeightMd,
    paddingHorizontal: Spacing.lg,
  },
  lgSize: {
    minHeight: ComponentSizes.buttonHeightLg,
    paddingHorizontal: Spacing.xl,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral700,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  primaryDisabled: {
    backgroundColor: Colors.borderLight,
  },
  secondaryDisabled: {
    backgroundColor: Colors.borderLight,
  },
  outlineDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  ghostDisabled: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.86,
  },
  text: {
    textAlign: 'center',
  },
  smText: {
    fontFamily: Fonts.regular.fontFamily,
    fontSize: 12,
    lineHeight: 12,
  },
  mdText: {
    fontFamily: Fonts.button14.fontFamily,
    fontSize: Fonts.button14.fontSize,
    lineHeight: Fonts.button14.lineHeight,
  },
  lgText: {
    fontFamily: Fonts.button16.fontFamily,
    fontSize: Fonts.button16.fontSize,
    lineHeight: Fonts.button16.lineHeight,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.neutral700,
  },
  ghostText: {
    color: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.textLight,
  },
});
