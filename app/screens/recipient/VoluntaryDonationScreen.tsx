import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';

type Props = NativeStackScreenProps<RecipientHomeStackParamList, 'VoluntaryDonation'>;

export function VoluntaryDonationScreen({ route, navigation }: Props) {
  const { exchangeId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💛</Text>
      <Text style={styles.title}>Collection complete!</Text>
      <Text style={styles.subtitle}>
        Thank you for using FoodLodge. Your donor gave up their time to help reduce food waste in London. Let them know how it went by leaving a rating.
      </Text>
      <PrimaryButton
        label="Leave a rating →"
        onPress={() => navigation.replace('RateExchange', { exchangeId })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.darkBrown, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
});