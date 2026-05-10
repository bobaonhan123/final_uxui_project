import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Fonts } from '../../src/constants/theme';
import { userApi } from '../../src/api/services';
import { useAuth } from '../../src/context/AuthContext';
import { Button, Input } from '../../src/components';
import { getPasswordStrengthError, PASSWORD_RULES_TEXT } from '../../src/constants/auth';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const INCLUDE_ITEMS = ['Newsletter BNConcert', 'Personal offers', 'Concert information'];

export default function SettingsScreen() {
  const { user, refreshUser, logout } = useAuth();

  const [newsletter, setNewsletter] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNewsletter(user.newsletter ?? false);
    setNotificationsEnabled(user.notifications_enabled ?? false);
  }, [user]);

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await userApi.updateSettings({
        newsletter,
        notifications_enabled: notificationsEnabled,
      });
      await refreshUser();
      Alert.alert('Success', 'Preferences updated');
    } catch {
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const passwordError = getPasswordStrengthError(newPassword);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }

    setChangingPassword(true);
    try {
      await userApi.changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (err) {
      const apiErr = err as ApiError;
      Alert.alert('Error', apiErr?.response?.data?.detail || 'Could not update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userApi.deleteAccount();
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              await logout();
              router.replace('/(auth)/login');
            } catch {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Dear {user?.first_name || 'Friend'},</Text>
      <Text style={styles.pageSubtitle}>Here you can find all your settings</Text>

      <Text style={styles.sectionHeading}>Newsletter and notifications</Text>
      <Text style={styles.activationTitle}>Activation</Text>

      <View style={styles.toggleRow}>
        <Switch
          value={newsletter}
          onValueChange={setNewsletter}
          trackColor={{ false: Colors.border, true: Colors.success }}
          thumbColor={Colors.white}
        />
        <Text style={styles.toggleLabel}>
          {newsletter ? 'Newsletter activated' : 'Newsletter disabled'}
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: Colors.border, true: Colors.success }}
          thumbColor={Colors.white}
        />
        <Text style={styles.toggleLabel}>
          {notificationsEnabled ? 'Notifications activated' : 'Notifications disabled'}
        </Text>
      </View>

      <Text style={styles.includeTitle}>Include</Text>
      <View style={styles.includeList}>
        {INCLUDE_ITEMS.map((item) => (
          <View key={item} style={styles.includeRow}>
            <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
            <Text style={styles.includeLabel}>{item}</Text>
          </View>
        ))}
      </View>

      <Button title="Save Preferences" onPress={handleSavePreferences} loading={savingPreferences} />

      <Text style={[styles.sectionHeading, styles.passwordHeading]}>Change password</Text>
      <Input
        label="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter your password"
        isPassword
      />
      <Input
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        isPassword
        helperText={PASSWORD_RULES_TEXT}
      />
      <Input
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        isPassword
      />
      <Button
        title="Save Password"
        onPress={handleChangePassword}
        loading={changingPassword}
        style={styles.savePasswordButton}
      />

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
        <Text style={styles.deleteText}>Delete my Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  greeting: {
    ...Fonts.heading20,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    ...Fonts.heading16,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    ...Fonts.heading20,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  activationTitle: {
    ...Fonts.heading18,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  toggleLabel: {
    ...Fonts.body14,
    color: Colors.neutral700,
  },
  includeTitle: {
    ...Fonts.heading18,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  includeList: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  includeLabel: {
    ...Fonts.body14,
    color: Colors.neutral700,
  },
  passwordHeading: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  savePasswordButton: {
    alignSelf: 'flex-end',
    minWidth: 150,
  },
  deleteButton: {
    marginTop: Spacing.lg,
    minHeight: 40,
    justifyContent: 'center',
  },
  deleteText: {
    ...Fonts.medium,
    color: Colors.error,
  },
});
