import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Fonts, ComponentSizes } from '../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  required?: boolean;
  helperText?: string;
  containerStyle?: ViewStyle;
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  error,
  isPassword,
  required,
  helperText,
  containerStyle,
  style,
  editable = true,
  multiline,
  onFocus,
  onBlur,
  showPasswordToggle = false,
  ...rest
}: Props) {
  const [secure, setSecure] = useState(Boolean(isPassword));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setSecure(Boolean(isPassword));
  }, [isPassword]);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.requiredMark}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          !editable && styles.inputDisabled,
          error && styles.inputError,
          focused && !error && styles.inputFocus,
        ]}
      >
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={secure}
          multiline={multiline}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {isPassword && showPasswordToggle ? (
          <Pressable onPress={() => setSecure((prev) => !prev)} style={styles.eyeBtn}>
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color={Colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Fonts.body12.fontFamily,
    fontSize: Fonts.body12.fontSize,
    lineHeight: Fonts.body12.lineHeight,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  requiredMark: {
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.textLight,
    minHeight: ComponentSizes.inputHeight,
    paddingHorizontal: Spacing.md,
  },
  inputContainerMultiline: {
    minHeight: ComponentSizes.textareaMinHeight,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputDisabled: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputFocus: {
    borderColor: Colors.info,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: Fonts.body12.fontSize,
    lineHeight: 16,
    fontFamily: Fonts.body12.fontFamily,
    color: Colors.text,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  eyeBtn: {
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  error: {
    fontFamily: Fonts.body10.fontFamily,
    fontSize: Fonts.body10.fontSize,
    lineHeight: Fonts.body10.lineHeight,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  helper: {
    fontFamily: Fonts.body10.fontFamily,
    fontSize: Fonts.body10.fontSize,
    lineHeight: Fonts.body10.lineHeight,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
