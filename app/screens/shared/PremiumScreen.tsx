import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Colors } from '../../constants/colors';
import { premiumService } from '../../services/premium.service';
import { useAuthStore } from '../../store/authStore';

const FEATURES = [
  { icon: '⭐', title: 'Verified Business Badge', desc: 'Stand out with a badge on all your listings and profile.' },
  { icon: '🏆', title: 'Priority Listing Placement', desc: 'Your listings appear at the top of the map and list view.' },
  { icon: '📊', title: 'Donation Analytics', desc: 'See total donations received across all listings.' },
  { icon: '🔔', title: 'Priority Notifications', desc: 'Get notified instantly when recipients claim your food.' },
  { icon: '💼', title: 'Business Profile', desc: 'Showcase your business commitment to reducing food waste.' },
];

export function PremiumScreen({ navigation }: any) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, setAuth, tokens } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const isPremium = (user as any)?.isPremium;

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { clientSecret, subscriptionId } = await premiumService.subscribe(999);

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

      await premiumService.confirm(subscriptionId);

      if (user && tokens) {
        setAuth({ ...user, isPremium: true } as any, tokens);
      }

      Alert.alert('Welcome to Business! 🎉', 'Your premium subscription is now active. Your listings will appear at the top.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Subscription failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    Alert.alert('Cancel subscription', 'Are you sure? You will lose all premium benefits.', [
      { text: 'Keep premium', style: 'cancel' },
      {
        text: 'Cancel subscription', style: 'destructive',
        onPress: async () => {
          try {
            await premiumService.cancel();
            if (user && tokens) {
              setAuth({ ...user, isPremium: false } as any, tokens);
            }
            Alert.alert('Cancelled', 'Your subscription has been cancelled.');
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>⭐</Text>
        <Text style={styles.heroTitle}>FoodLodge Business</Text>
        <Text style={styles.heroPrice}>£9.99 / month</Text>
        <Text style={styles.heroSub}>Help reduce food waste at scale</Text>
      </View>

      <View style={styles.featureList}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {isPremium ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeText}>✅ Business plan active</Text>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelLink}>Cancel subscription</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator color={Colors.goldenAmber} style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe}>
          <Text style={styles.subscribeBtnText}>Subscribe for £9.99/month</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.note}>Cancel anytime. No hidden fees.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 28, backgroundColor: Colors.primaryYellow, borderRadius: 20, marginBottom: 24 },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: Colors.darkBrown },
  heroPrice: { fontSize: 20, fontWeight: '600', color: Colors.darkBrown, marginTop: 4 },
  heroSub: { fontSize: 13, color: Colors.deepAmber, marginTop: 6 },
  featureList: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.amberBorder, padding: 16, gap: 16, marginBottom: 24 },
  featureRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureIcon: { fontSize: 24, width: 32 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: Colors.deepAmber, lineHeight: 18 },
  subscribeBtn: { backgroundColor: Colors.darkBrown, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  subscribeBtnText: { fontSize: 16, fontWeight: '700', color: Colors.primaryYellow },
  activeBox: { backgroundColor: Colors.paleLemon, borderRadius: 14, padding: 16, alignItems: 'center', gap: 10, marginBottom: 12 },
  activeText: { fontSize: 15, fontWeight: '600', color: Colors.darkBrown },
  cancelLink: { fontSize: 13, color: Colors.darkRed, textDecorationLine: 'underline' },
  note: { fontSize: 12, color: Colors.deepAmber, textAlign: 'center' },
});