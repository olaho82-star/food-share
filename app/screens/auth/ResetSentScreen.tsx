import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { OutlineButton } from '../../components/buttons/OutlineButton';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ResetSent'>;

export function ResetSentScreen({ route, navigation }: Props) {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📬</Text>
      <Text style={styles.title}>Check your inbox</Text>
      <Text style={styles.body}>
        We've sent a password reset link to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>
      <Text style={styles.note}>The link expires in 1 hour. Check your spam folder if you don't see it.</Text>

      <OutlineButton label="Back to sign in" onPress={() => navigation.navigate('SignIn')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 16, paddingTop: 60, alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', color: Colors.darkBrown, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  email: { fontWeight: '600', color: Colors.darkBrown },
  note: { fontSize: 12, color: Colors.deepAmber, textAlign: 'center', lineHeight: 18, marginBottom: 32, paddingHorizontal: 16 },
});
