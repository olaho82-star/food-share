import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { TextInput } from '../../components/inputs/TextInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { authService } from '../../services/auth.service';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email.trim()) { setError('Email is required'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      navigation.navigate('ResetSent', { email });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.subtitle}>Enter the email address for your account and we'll send you a reset link.</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <PrimaryButton label="Send reset link" onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 16, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: '600', color: Colors.darkBrown, marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.deepAmber, lineHeight: 20, marginBottom: 28 },
});
