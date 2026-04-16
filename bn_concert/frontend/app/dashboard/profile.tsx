import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, Fonts } from '../../src/constants/theme';
import { Button, Input } from '../../src/components';
import { userApi } from '../../src/api/services';
import { useAuth } from '../../src/context/AuthContext';
import { getPasswordStrengthError, PASSWORD_RULES_TEXT } from '../../src/constants/auth';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function MyProfileScreen() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFirstName(user.first_name ?? '');
    setLastName(user.last_name ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
    setDateOfBirth(user.date_of_birth?.slice(0, 10) ?? '');
    setGender(user.gender ?? '');
    setAddress(user.address ?? '');
    setCity(user.city ?? '');
    setState(user.state ?? '');
    setZipCode(user.zip_code ?? '');
    setCountry(user.country ?? '');
  }, [user]);

  const username = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Error', 'First name, last name, and email are required.');
      return;
    }

    setSavingProfile(true);
    try {
      await userApi.updateMe({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        date_of_birth: dateOfBirth.trim() || null,
        gender: gender.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        zip_code: zipCode.trim() || null,
        country: country.trim() || null,
      });
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      const apiErr = err as ApiError;
      Alert.alert('Error', apiErr?.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    const passwordError = getPasswordStrengthError(newPassword);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }

    setSavingPassword(true);
    try {
      await userApi.changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully.');
    } catch (err) {
      const apiErr = err as ApiError;
      Alert.alert('Error', apiErr?.response?.data?.detail || 'Could not update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello {user?.first_name || 'Friend'},</Text>
      <Text style={styles.subtitle}>Here you can find all information about your profile</Text>

      <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="First name" />
      <Input label="Last name" value={lastName} onChangeText={setLastName} placeholder="Last name" />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
      <Input
        label="Date of birth"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
      />
      <Input label="Gender" value={gender} onChangeText={setGender} placeholder="Gender" />
      <Input label="Street" value={address} onChangeText={setAddress} placeholder="Street address" />
      <Input label="City" value={city} onChangeText={setCity} placeholder="City" />
      <Input label="State" value={state} onChangeText={setState} placeholder="State/Province" />
      <Input label="Zip code" value={zipCode} onChangeText={setZipCode} placeholder="Zip code" />
      <Input label="Country" value={country} onChangeText={setCountry} placeholder="Country" />

      <Button title="Save Changes" onPress={handleSaveProfile} loading={savingProfile} style={styles.saveProfileButton} />

      <Text style={styles.passwordHeading}>Your username and password</Text>
      <Input label="Username" value={username} editable={false} />
      <Input
        label="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter your current password"
        isPassword
      />
      <Input
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter your new password"
        helperText={PASSWORD_RULES_TEXT}
        isPassword
      />
      <Input
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm your new password"
        isPassword
      />
      <Button title="Save Password" onPress={handleSavePassword} loading={savingPassword} style={styles.savePasswordButton} />
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
  subtitle: {
    ...Fonts.heading16,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  saveProfileButton: {
    alignSelf: 'flex-end',
    minWidth: 144,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  passwordHeading: {
    ...Fonts.heading20,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  savePasswordButton: {
    alignSelf: 'flex-end',
    minWidth: 150,
    marginTop: Spacing.xs,
  },
});
