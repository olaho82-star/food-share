import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'RoleSelection'>;

export function RoleSelectionScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<'donor' | 'recipient' | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How will you use{'\n'}FoodLodge?</Text>
        <Text style={styles.subtitle}>You can only choose one role. Contact support to change it later.</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, selected === 'donor' && styles.cardActive]}
          onPress={() => setSelected('donor')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>🍞</Text>
          <Text style={styles.cardTitle}>I'm a Donor</Text>
          <Text style={styles.cardDesc}>I have surplus food I'd like to share with people who need it.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selected === 'recipient' && styles.cardActive]}
          onPress={() => setSelected('recipient')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>🙌</Text>
          <Text style={styles.cardTitle}>I'm a Recipient</Text>
          <Text style={styles.cardDesc}>I'd like to collect surplus food shared by donors near me.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={() => selected && navigation.navigate('SignUp', { role: selected })}
          disabled={!selected}
        />
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.signInLink}>
          <Text style={styles.signInText}>Already have an account? <Text style={styles.signInBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 40 },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '600', color: Colors.darkBrown, marginBottom: 8, lineHeight: 34 },
  subtitle: { fontSize: 13, color: Colors.deepAmber, lineHeight: 20 },
  cards: { flex: 1, gap: 14 },
  card: {
    backgroundColor: Colors.paleLemon,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.amberBorder,
    padding: 20,
  },
  cardActive: {
    borderColor: Colors.goldenAmber,
    backgroundColor: Colors.primaryYellow,
  },
  cardEmoji: { fontSize: 36, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: Colors.darkBrown, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: Colors.deepAmber, lineHeight: 20 },
  footer: { gap: 14 },
  signInLink: { alignItems: 'center' },
  signInText: { fontSize: 13, color: Colors.deepAmber },
  signInBold: { fontWeight: '600', color: Colors.darkBrown },
});
