import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

const FEATURES = [
  { icon: '⭐', title: 'Verified Business Badge', desc: 'Stand out with a badge on all your listings and profile.' },
  { icon: '🏆', title: 'Priority Listing Placement', desc: 'Your listings appear at the top of the map and list view.' },
  { icon: '📊', title: 'Donation Analytics', desc: 'See total donations received across all listings.' },
  { icon: '🔔', title: 'Priority Notifications', desc: 'Get notified instantly when recipients claim your food.' },
  { icon: '💼', title: 'Business Profile', desc: 'Showcase your business commitment to reducing food waste.' },
];

export function PremiumScreen({ }: any) {
  const { user } = useAuthStore();
  const isPremium = (user as any)?.isPremium;

  function handleContact() {
    Linking.openURL('mailto:hello@foodlodge.app?subject=FoodLodge Business Plan&body=Hi, I would like to subscribe to the FoodLodge Business Plan (£9.99/month) for my business.')
      .catch(() => Alert.alert('Could not open email', 'Please email us at hello@foodlodge.app to subscribe.'));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>⭐</Text>
        <Text style={styles.heroTitle}>FoodLodge Business</Text>
        <Text style={styles.heroPrice}>£9.99 / month</Text>
        <Text style={styles.heroSub}>For restaurants, cafes, supermarkets & caterers</Text>
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
          <Text style={styles.activeNote}>To manage your subscription, contact hello@foodlodge.app</Text>
        </View>
      ) : (
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Ready to upgrade?</Text>
          <Text style={styles.ctaBody}>
            FoodLodge Business is available for businesses. Tap below to contact us and get set up.
          </Text>
          <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
            <Text style={styles.contactBtnText}>📧 Contact us to subscribe</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>We'll get back to you within 24 hours.</Text>
        </View>
      )}

      <Text style={styles.note}>£9.99/month. Cancel anytime by contacting hello@foodlodge.app</Text>
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
  heroSub: { fontSize: 13, color: Colors.deepAmber, marginTop: 6, textAlign: 'center', paddingHorizontal: 16 },
  featureList: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.amberBorder, padding: 16, gap: 16, marginBottom: 24 },
  featureRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureIcon: { fontSize: 24, width: 32 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: Colors.deepAmber, lineHeight: 18 },
  ctaBox: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.amberBorder, padding: 20, alignItems: 'center', gap: 12, marginBottom: 16 },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: Colors.darkBrown },
  ctaBody: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20 },
  contactBtn: { backgroundColor: Colors.darkBrown, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  contactBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primaryYellow },
  ctaNote: { fontSize: 12, color: Colors.deepAmber },
  activeBox: { backgroundColor: Colors.paleLemon, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, marginBottom: 12 },
  activeText: { fontSize: 15, fontWeight: '600', color: Colors.darkBrown },
  activeNote: { fontSize: 12, color: Colors.deepAmber, textAlign: 'center' },
  note: { fontSize: 11, color: Colors.deepAmber, textAlign: 'center', lineHeight: 16, marginTop: 8 },
});