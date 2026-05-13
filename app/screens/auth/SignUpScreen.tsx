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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

const DISCLAIMER =
  'FoodLodge connects donors and recipients but does not verify food safety or quality. All food exchanges are made in good faith. FoodLodge accepts no liability for illness, injury or harm resulting from food exchanged on this platform. Recipients should use their own judgement before consuming any items collected through FoodLodge.';

export function SignUpScreen({ route, navigation }: Props) {
  const { role } = route.params;
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!disclaimerAccepted) e.disclaimer = 'You must accept the food safety disclaimer';
    return e;
  }

  async function handleSignUp() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await authService.register({ name, email, password, role, disclaimerAccepted });
      await storage.saveAuth(res.accessToken, res.refreshToken, res.user);
      setAuth(res.user, { accessToken: res.accessToken, refreshToken: res.refreshToken });
    } catch (err: any) {
      Alert.alert('Sign up failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.rolePill}>{role === 'donor' ? '🍞 Donor' : '🙌 Recipient'}</Text>

      <TextInput label="Full name" value={name} onChangeText={setName} placeholder="Your name" error={errors.name} autoCapitalize="words" />
      <TextInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" error={errors.email} keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} placeholder="Min. 8 characters" error={errors.password} secureTextEntry />

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Food safety disclaimer</Text>
        <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
        <TouchableOpacity style={styles.checkRow} onPress={() => setDisclaimerAccepted(!disclaimerAccepted)}>
          <View style={[styles.checkbox, disclaimerAccepted && styles.checkboxChecked]}>
            {disclaimerAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>I have read and accept the food safety disclaimer</Text>
        </TouchableOpacity>
        {errors.disclaimer && <Text style={styles.errorText}>{errors.disclaimer}</Text>}
      </View>

      <PrimaryButton label="Create account" onPress={handleSignUp} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.signInLink}>
        <Text style={styles.signInText}>Already have an account? <Text style={styles.signInBold}>Sign in</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: 16, paddingTop: 32, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '600', color: Colors.darkBrown, marginBottom: 8 },
  rolePill: { alignSelf: 'flex-start', backgroundColor: Colors.paleLemon, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, fontSize: 12, color: Colors.deepAmber, marginBottom: 24 },
  disclaimerBox: { backgroundColor: Colors.paleLemon, borderRadius: 12, borderWidth: 1, borderColor: Colors.amberBorder, padding: 14, marginBottom: 20 },
  disclaimerTitle: { fontSize: 13, fontWeight: '600', color: Colors.darkBrown, marginBottom: 6 },
  disclaimerText: { fontSize: 12, color: Colors.deepAmber, lineHeight: 18, marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.goldenAmber, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: Colors.goldenAmber },
  checkmark: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 12, color: Colors.darkBrown, lineHeight: 18 },
  errorText: { fontSize: 11, color: Colors.errorText, marginTop: 6 },
  signInLink: { alignItems: 'center', marginTop: 16 },
  signInText: { fontSize: 13, color: Colors.deepAmber },
  signInBold: { fontWeight: '600', color: Colors.darkBrown },
});
