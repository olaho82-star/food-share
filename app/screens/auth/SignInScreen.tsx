import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { TextInput } from '../../components/inputs/TextInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { authService } from '../../services/auth.service';
import { storage } from '../../utils/storage';
import { useAuthStore } from '../../store/authStore';
import { registerForPushNotifications } from '../../utils/notifications';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    return e;
  }

  async function handleSignIn() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      await storage.saveAuth(res.accessToken, res.refreshToken, res.user);
      setAuth(res.user, { accessToken: res.accessToken, refreshToken: res.refreshToken });
      registerForPushNotifications();
    } catch (err: any) {
      Alert.alert('Sign in failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your FoodLodge account</Text>

      <TextInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" error={errors.email} keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} placeholder="Your password" error={errors.password} secureTextEntry />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <PrimaryButton label="Sign in" onPress={handleSignIn} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')} style={styles.signUpLink}>
        <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpBold}>Get started</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: 16, paddingTop: 32, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '600', color: Colors.darkBrown, marginBottom: 6 },
  subtitle: { fontSize: 13, color: Colors.deepAmber, marginBottom: 28 },
  forgotLink: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 20 },
  forgotText: { fontSize: 12, color: Colors.goldenAmber, fontWeight: '500' },
  signUpLink: { alignItems: 'center', marginTop: 16 },
  signUpText: { fontSize: 13, color: Colors.deepAmber },
  signUpBold: { fontWeight: '600', color: Colors.darkBrown },
});
