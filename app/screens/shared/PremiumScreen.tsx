import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
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

const PRODUCT_ID = 'app.foodlodge.business.monthly';

export function PremiumScreen({ navigation }: any) {
  const { user, setAuth, tokens } = useAuthStore();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const isPremium = (user as any)?.isPremium;

  useEffect(() => {
    async function loadOfferings() {
      try {
        const offerings = await Purchases.getOfferings();
        const packages = offerings.current?.availablePackages ?? [];
        const found = packages.find((p) => p.product.identifier === PRODUCT_ID);
        setPkg(found ?? packages[0] ?? null);
      } catch (err: any) {
        console.log('RevenueCat offerings error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOfferings();
  }, []);

  async function handleSubscribe() {
    if (!pkg) { Alert.alert('Unavailable', 'Subscription is not available right now. Please try again later.'); return; }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive = customerInfo.entitlements.active['business'] !== undefined
        || Object.keys(customerInfo.activeSubscriptions).length > 0;

      if (isActive) {
        await premiumService.confirmIAP(customerInfo.originalAppUserId);
        if (user && tokens) {
          setAuth({ ...user, isPremium: true } as any, tokens);
        }
        Alert.alert('Welcome to Business! 🎉', 'Your premium subscription is now active. Your listings will appear at the top.');
        navigation.goBack();
      }
    } catch (err: any) {
      if (err.userCancelled) return;
      Alert.alert('Purchase failed', err.message);
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isActive = Object.keys(customerInfo.activeSubscriptions).length > 0;
      if (isActive) {
        await premiumService.confirmIAP(customerInfo.originalAppUserId);
        if (user && tokens) {
          setAuth({ ...user, isPremium: true } as any, tokens);
        }
        Alert.alert('Restored!', 'Your Business subscription has been restored.');
        navigation.goBack();
      } else {
        Alert.alert('No subscription found', 'No active Business subscription was found for your Apple ID.');
      }
    } catch (err: any) {
      Alert.alert('Restore failed', err.message);
    } finally {
      setPurchasing(false);
    }
  }

  async function handleCancel() {
    Alert.alert(
      'Cancel subscription',
      'To cancel, go to iPhone Settings → Apple ID → Subscriptions → FoodLodge Business → Cancel.',
      [{ text: 'OK' }]
    );
  }

  const priceText = pkg ? pkg.product.priceString + '/month' : '£9.99/month';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>⭐</Text>
        <Text style={styles.heroTitle}>FoodLodge Business</Text>
        <Text style={styles.heroPrice}>{priceText}</Text>
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

      {loading ? (
        <ActivityIndicator color={Colors.goldenAmber} style={{ marginTop: 24 }} />
      ) : isPremium ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeText}>✅ Business plan active</Text>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelLink}>Manage subscription</Text>
          </TouchableOpacity>
        </View>
      ) : purchasing ? (
        <ActivityIndicator color={Colors.goldenAmber} style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe}>
            <Text style={styles.subscribeBtnText}>Subscribe for {priceText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
            <Text style={styles.restoreBtnText}>Restore purchases</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.note}>
        Subscription auto-renews monthly. Cancel anytime in iPhone Settings → Subscriptions.
      </Text>
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
  actions: { gap: 12, marginBottom: 12 },
  subscribeBtn: { backgroundColor: Colors.darkBrown, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  subscribeBtnText: { fontSize: 16, fontWeight: '700', color: Colors.primaryYellow },
  restoreBtn: { alignItems: 'center', paddingVertical: 10 },
  restoreBtnText: { fontSize: 13, color: Colors.deepAmber, textDecorationLine: 'underline' },
  activeBox: { backgroundColor: Colors.paleLemon, borderRadius: 14, padding: 16, alignItems: 'center', gap: 10, marginBottom: 12 },
  activeText: { fontSize: 15, fontWeight: '600', color: Colors.darkBrown },
  cancelLink: { fontSize: 13, color: Colors.goldenAmber, textDecorationLine: 'underline' },
  note: { fontSize: 11, color: Colors.deepAmber, textAlign: 'center', lineHeight: 16 },
});