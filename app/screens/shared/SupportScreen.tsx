import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Colors } from '../../constants/colors';
import { premiumService } from '../../services/premium.service';

const PRESET_AMOUNTS = [
  { label: '£1', pence: 100 },
  { label: '£5', pence: 500 },
  { label: '£10', pence: 1000 },
];

export function SupportScreen({ navigation }: any) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [donated, setDonated] = useState(false);

  function getAmountPence(): number | null {
    if (selected !== null) return selected;
    const parsed = parseFloat(custom);
    if (!isNaN(parsed) && parsed >= 1) return Math.round(parsed * 100);
    return null;
  }

  async function handleDonate() {
    const amountPence = getAmountPence();
    if (!amountPence) { Alert.alert('Enter an amount', 'Please select or enter at least £1.'); return; }

    setLoading(true);
    try {
      const { clientSecret } = await premiumService.createSupportIntent(amountPence);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'FoodLodge',
        style: 'automatic',
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') throw new Error(presentError.message);
        return;
      }

      setDonated(true);
    } catch (err: any) {
      Alert.alert('Payment failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  if (donated) {
    return (
      <View style={styles.thanks}>
        <Text style={styles.thanksEmoji}>💛</Text>
        <Text style={styles.thanksTitle}>Thank you!</Text>
        <Text style={styles.thanksBody}>Your support keeps FoodLodge running and helps connect more communities with surplus food.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Back to profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const amountPence = getAmountPence();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💚</Text>
      <Text style={styles.title}>Support FoodLodge</Text>
      <Text style={styles.subtitle}>Help us keep the platform free for everyone. 100% goes to server and development costs.</Text>

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

      {loading ? (
        <ActivityIndicator color={Colors.goldenAmber} style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity
          style={[styles.donateBtn, !amountPence && styles.donateBtnDisabled]}
          onPress={handleDonate}
          disabled={!amountPence}
        >
          <Text style={styles.donateBtnText}>
            {amountPence ? `Donate £${(amountPence / 100).toFixed(2)}` : 'Donate'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.darkBrown, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  presetRow: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  presetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.amberBorder, alignItems: 'center', backgroundColor: Colors.white },
  presetBtnActive: { backgroundColor: Colors.primaryYellow, borderColor: Colors.goldenAmber },
  presetLabel: { fontSize: 18, fontWeight: '600', color: Colors.deepAmber },
  presetLabelActive: { color: Colors.darkBrown },
  customRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.amberBorder, borderRadius: 10, backgroundColor: Colors.white, paddingHorizontal: 12, width: '100%', marginBottom: 24 },
  customPrefix: { fontSize: 18, fontWeight: '600', color: Colors.darkBrown, marginRight: 4 },
  customInput: { flex: 1, fontSize: 16, color: Colors.darkBrown, paddingVertical: 12 },
  donateBtn: { backgroundColor: Colors.darkBrown, borderRadius: 14, paddingVertical: 15, width: '100%', alignItems: 'center' },
  donateBtnDisabled: { opacity: 0.4 },
  donateBtnText: { fontSize: 16, fontWeight: '700', color: Colors.primaryYellow },
  thanks: { flex: 1, backgroundColor: Colors.lightCream, alignItems: 'center', justifyContent: 'center', padding: 32 },
  thanksEmoji: { fontSize: 64, marginBottom: 16 },
  thanksTitle: { fontSize: 26, fontWeight: '700', color: Colors.darkBrown, marginBottom: 12 },
  thanksBody: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  doneBtn: { backgroundColor: Colors.primaryYellow, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 32 },
  doneBtnText: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown },
});