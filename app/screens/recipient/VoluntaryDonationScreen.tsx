import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OutlineButton } from '../../components/buttons/OutlineButton';
import { api } from '../../services/api';
import { exchangeService } from '../../services/exchange.service';

type Props = NativeStackScreenProps<RecipientHomeStackParamList, 'VoluntaryDonation'>;

const PRESET_AMOUNTS = [
  { label: '£1', pence: 100 },
  { label: '£5', pence: 500 },
  { label: '£10', pence: 1000 },
];

export function VoluntaryDonationScreen({ route, navigation }: Props) {
  const { exchangeId } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);

  function getAmountPence(): number | null {
    if (selected !== null) return selected;
    const parsed = parseFloat(custom);
    if (!isNaN(parsed) && parsed >= 1) return Math.round(parsed * 100);
    return null;
  }

  async function handleDonate() {
    const amountPence = getAmountPence();
    if (!amountPence) { Alert.alert('Enter an amount', 'Please select or enter a donation amount of at least £1.'); return; }

    setLoading(true);
    try {
      const { clientSecret } = await api.post<{ clientSecret: string }>(
        `/api/exchanges/${exchangeId}/payment-intent`,
        { amount: amountPence }
      );

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'FoodShare',
        style: 'automatic',
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') throw new Error(presentError.message);
        return;
      }

      const pi = clientSecret.split('_secret_')[0];
      await exchangeService.submitDonation(exchangeId, amountPence, pi);

      navigation.replace('RateExchange', { exchangeId });
    } catch (err: any) {
      Alert.alert('Payment failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  const amountPence = getAmountPence();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💛</Text>
      <Text style={styles.title}>Leave a voluntary donation</Text>
      <Text style={styles.subtitle}>This is completely optional. 100% goes directly to the donor.</Text>

      <View style={styles.presetRow}>
        {PRESET_AMOUNTS.map((a) => (
          <TouchableOpacity
            key={a.pence}
            style={[styles.presetBtn, selected === a.pence && styles.presetBtnActive]}
            onPress={() => { setSelected(a.pence); setCustom(''); }}
          >
            <Text style={[styles.presetLabel, selected === a.pence && styles.presetLabelActive]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customRow}>
        <Text style={styles.customPrefix}>£</Text>
        <TextInput
          style={styles.customInput}
          value={custom}
          onChangeText={(v) => { setCustom(v); setSelected(null); }}
          placeholder="Custom amount"
          placeholderTextColor={Colors.deepAmber}
          keyboardType="decimal-pad"
        />
      </View>

      {amountPence && (
        <Text style={styles.summary}>
          You're donating <Text style={styles.summaryAmount}>£{(amountPence / 100).toFixed(2)}</Text>
        </Text>
      )}

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator color={Colors.goldenAmber} />
        ) : (
          <>
            <PrimaryButton label={`Donate${amountPence ? ` £${(amountPence / 100).toFixed(2)}` : ''}`} onPress={handleDonate} disabled={!amountPence} />
            <OutlineButton label="Skip donation" onPress={() => navigation.replace('RateExchange', { exchangeId })} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.darkBrown, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  presetRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  presetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.amberBorder, alignItems: 'center', backgroundColor: Colors.white },
  presetBtnActive: { backgroundColor: Colors.primaryYellow, borderColor: Colors.goldenAmber },
  presetLabel: { fontSize: 18, fontWeight: '600', color: Colors.deepAmber },
  presetLabelActive: { color: Colors.darkBrown },
  customRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.amberBorder, borderRadius: 10, backgroundColor: Colors.white, paddingHorizontal: 12, width: '100%', marginBottom: 16 },
  customPrefix: { fontSize: 18, fontWeight: '600', color: Colors.darkBrown, marginRight: 4 },
  customInput: { flex: 1, fontSize: 16, color: Colors.darkBrown, paddingVertical: 12 },
  summary: { fontSize: 14, color: Colors.deepAmber, marginBottom: 24 },
  summaryAmount: { fontWeight: '700', color: Colors.darkBrown },
  actions: { width: '100%', gap: 12 },
});
