import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Divider } from '../../components/layout/Divider';
import { DestructiveButton } from '../../components/buttons/DestructiveButton';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/user.service';
import { storage } from '../../utils/storage';
import { LONDON_BOROUGHS } from '../../constants/boroughs';

const FOOD_CATEGORIES = [
  { key: 'bakery', label: 'Bakery' },
  { key: 'fruit-veg', label: 'Fruit & Veg' },
  { key: 'dairy', label: 'Dairy' },
  { key: 'cooked', label: 'Cooked Food' },
  { key: 'other', label: 'Other' },
];

const RADIUS_OPTIONS = [1, 2, 5, 10, 15, 20];

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, setAuth, clearAuth } = useAuthStore();
  const [anonymousDonations, setAnonymousDonations] = useState(user?.anonymousDonations ?? false);
  const [searchRadius, setSearchRadius] = useState(user?.searchRadiusMiles ?? 5);
  const [foodPreferences, setFoodPreferences] = useState<string[]>(user?.foodPreferences ?? []);
  const [saving, setSaving] = useState(false);

  async function toggleAnonymous(val: boolean) {
    setAnonymousDonations(val);
    try {
      const res = await userService.updateMe({ anonymousDonations: val });
      setAuth(res.user, { accessToken: (await storage.loadAuth())?.accessToken ?? '', refreshToken: (await storage.loadAuth())?.refreshToken ?? '' });
    } catch { setAnonymousDonations(!val); }
  }

  async function updateRadius(r: number) {
    setSearchRadius(r);
    try {
      await userService.updateMe({ searchRadiusMiles: r });
    } catch { setSearchRadius(searchRadius); }
  }

  async function toggleFoodPref(key: string) {
    const updated = foodPreferences.includes(key)
      ? foodPreferences.filter((k) => k !== key)
      : [...foodPreferences, key];
    setFoodPreferences(updated);
    try {
      await userService.updateMe({ foodPreferences: updated });
    } catch { setFoodPreferences(foodPreferences); }
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => {
          await storage.clearAuth();
          clearAuth();
        },
      },
    ]);
  }

  if (!user) return null;

  const isDonor = user.role === 'donor';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{isDonor ? '🍞 Donor' : '🙌 Recipient'}</Text>
        {user.rating > 0 && (
          <Text style={styles.rating}>⭐ {user.rating.toFixed(1)} ({user.ratingCount} ratings)</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        {isDonor ? (
          <>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user.donationsCount}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
          </>
        ) : (
          <>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user.collectionsCount}</Text>
              <Text style={styles.statLabel}>Collections</Text>
            </View>
          </>
        )}
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user.foodSavedKg}kg</Text>
          <Text style={styles.statLabel}>Food saved</Text>
        </View>
      </View>

      {isDonor && (
        <View style={styles.donationCard}>
          <Text style={styles.donationEmoji}>💛</Text>
          <View style={styles.donationInfo}>
            <Text style={styles.donationAmount}>
              £{((user.totalDonationsReceived ?? 0) / 100).toFixed(2)}
            </Text>
            <Text style={styles.donationLabel}>received in voluntary donations</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{user.name}</Text>
        </View>
        <Divider />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        <Divider />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Borough</Text>
          <Text style={styles.infoValue}>{user.borough || 'Not set'}</Text>
        </View>
        <Divider />
        <TouchableOpacity style={styles.editLink} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editLinkText}>Edit profile →</Text>
        </TouchableOpacity>
      </View>

      {isDonor && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donation preferences</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Keep my name anonymous</Text>
              <Text style={styles.toggleDesc}>Donations show as "An anonymous donor"</Text>
            </View>
            <Switch value={anonymousDonations} onValueChange={toggleAnonymous} trackColor={{ true: Colors.goldenAmber }} thumbColor={Colors.white} />
          </View>
        </View>
      )}

      {!isDonor && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search radius</Text>
            <Text style={styles.sectionDesc}>How far to look for listings near you</Text>
            <View style={styles.radiusRow}>
              {RADIUS_OPTIONS.map((r) => (
                <TouchableOpacity key={r} style={[styles.radiusBtn, searchRadius === r && styles.radiusBtnActive]} onPress={() => updateRadius(r)}>
                  <Text style={[styles.radiusBtnText, searchRadius === r && styles.radiusBtnTextActive]}>{r}mi</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food preferences</Text>
            <Text style={styles.sectionDesc}>Get notified about these types of food</Text>
            <View style={styles.prefRow}>
              {FOOD_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.prefChip, foodPreferences.includes(c.key) && styles.prefChipActive]}
                  onPress={() => toggleFoodPref(c.key)}
                >
                  <Text style={[styles.prefChipText, foodPreferences.includes(c.key) && styles.prefChipTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {isDonor && (
        <TouchableOpacity
          style={[(user as any).isPremium ? styles.premiumActiveBanner : styles.premiumBanner]}
          onPress={() => navigation.navigate('Premium')}
        >
          <Text style={styles.premiumBannerEmoji}>{(user as any).isPremium ? '⭐' : '🚀'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumBannerTitle}>
              {(user as any).isPremium ? 'Business Plan Active' : 'Upgrade to Business'}
            </Text>
            <Text style={styles.premiumBannerSub}>
              {(user as any).isPremium ? 'Manage your subscription' : 'Priority listings · Verified badge · £9.99/mo'}
            </Text>
          </View>
          <Text style={styles.supportChevron}>›</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.supportRow} onPress={() => navigation.navigate('CommunityGuidelines')}>
          <Text style={styles.supportLabel}>Community guidelines</Text>
          <Text style={styles.supportChevron}>›</Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.supportRow} onPress={() => navigation.navigate('Support')}>
          <Text style={styles.supportLabel}>💚 Support FoodLodge</Text>
          <Text style={styles.supportChevron}>›</Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.supportRow}>
          <Text style={styles.supportLabel}>Contact support</Text>
          <Text style={styles.supportChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <DestructiveButton label="Sign out" onPress={handleSignOut} />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: Spacing.screenPaddingHorizontal },
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryYellow, borderWidth: 2, borderColor: Colors.goldenAmber, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 32, fontWeight: '700', color: Colors.darkBrown },
  name: { fontSize: 20, fontWeight: '700', color: Colors.darkBrown, marginBottom: 4 },
  role: { fontSize: 13, color: Colors.deepAmber, marginBottom: 4 },
  rating: { fontSize: 13, color: Colors.deepAmber },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.primaryYellow, borderRadius: 14, padding: 16, marginBottom: 20, justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700', color: Colors.darkBrown },
  statLabel: { fontSize: 11, color: Colors.deepAmber, marginTop: 2 },
  statDivider: { width: 0.5, height: 32, backgroundColor: Colors.goldenAmber },
  section: { backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.amberBorder, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.darkBrown, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionDesc: { fontSize: 12, color: Colors.deepAmber, marginBottom: 12, marginTop: -8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 13, color: Colors.deepAmber },
  infoValue: { fontSize: 13, fontWeight: '500', color: Colors.darkBrown },
  editLink: { paddingTop: 10 },
  editLinkText: { fontSize: 13, color: Colors.goldenAmber, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: 13, fontWeight: '500', color: Colors.darkBrown },
  toggleDesc: { fontSize: 11, color: Colors.deepAmber, marginTop: 2 },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  radiusBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.amberBorder, backgroundColor: Colors.lightCream },
  radiusBtnActive: { backgroundColor: Colors.primaryYellow, borderColor: Colors.goldenAmber },
  radiusBtnText: { fontSize: 12, color: Colors.deepAmber, fontWeight: '500' },
  radiusBtnTextActive: { color: Colors.darkBrown },
  prefRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prefChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.amberBorder, backgroundColor: Colors.lightCream },
  prefChipActive: { backgroundColor: Colors.primaryYellow, borderColor: Colors.goldenAmber },
  prefChipText: { fontSize: 12, color: Colors.deepAmber, fontWeight: '500' },
  prefChipTextActive: { color: Colors.darkBrown },
  supportRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  supportLabel: { fontSize: 13, color: Colors.darkBrown },
  supportChevron: { fontSize: 18, color: Colors.deepAmber },
  premiumBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.goldenAmber, borderRadius: 14, padding: 14, marginBottom: 14, gap: 12 },
  premiumActiveBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryYellow, borderRadius: 14, padding: 14, marginBottom: 14, gap: 12, borderWidth: 1.5, borderColor: Colors.goldenAmber },
  premiumBannerEmoji: { fontSize: 28 },
  premiumBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.darkBrown, marginBottom: 2 },
  premiumBannerSub: { fontSize: 11, color: Colors.deepAmber },
  donationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryYellow, borderRadius: 14, padding: 16, marginBottom: 14, gap: 14 },
  donationEmoji: { fontSize: 36 },
  donationInfo: { flex: 1 },
  donationAmount: { fontSize: 28, fontWeight: '700', color: Colors.darkBrown },
  donationLabel: { fontSize: 12, color: Colors.deepAmber, marginTop: 2 },
});
