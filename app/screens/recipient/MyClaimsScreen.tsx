import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { listingService } from '../../services/listing.service';
import { Listing } from '../../types';

type Tab = 'active' | 'collected' | 'missed';

const TABS: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'collected', label: 'Collected' },
  { key: 'missed', label: 'Missed' },
];

const STATUS_MAP: Record<Tab, string> = {
  active: 'claimed,pending-confirmation',
  collected: 'completed,auto-completed',
  missed: 'expired',
};

export function MyClaimsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  async function fetchClaims(refresh = false) {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await listingService.getMyListings(STATUS_MAP[tab]);
      setListings(res.listings);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchClaims(); }, [tab]));

  async function handleConfirm(listingId: string) {
    setConfirming(listingId);
    try {
      await listingService.confirmCollection(listingId);
      fetchClaims();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setConfirming(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.goldenAmber} style={styles.loader} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchClaims(true)} tintColor={Colors.goldenAmber} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.cardMeta}>📅 {new Date(item.pickupDate).toLocaleDateString('en-GB')}  🕐 {item.pickupFrom} – {item.pickupUntil}</Text>
              <Text style={styles.cardMeta}>📍 {item.borough}</Text>
              {item.status === 'pending-confirmation' && (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmHint}>The donor has marked this as collected. Please confirm you received it.</Text>
                  <PrimaryButton
                    label={confirming === item._id ? '...' : 'Confirm collection'}
                    onPress={() => handleConfirm(item._id)}
                    disabled={confirming === item._id}
                  />
                </View>
              )}
              {item.status === 'claimed' && (
                <TouchableOpacity onPress={() => navigation.navigate('RecipientHomeTab', { screen: 'ListingDetail', params: { listingId: item._id } })}>
                  <Text style={styles.viewLink}>View listing →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No {tab} claims</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.amberBorder, backgroundColor: Colors.white },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.goldenAmber },
  tabLabel: { fontSize: 13, color: Colors.deepAmber },
  tabLabelActive: { color: Colors.darkBrown, fontWeight: '600' },
  list: { padding: Spacing.screenPaddingHorizontal, paddingTop: 12 },
  loader: { marginTop: 40 },
  card: { backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.amberBorder, padding: 14, marginBottom: 10, gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.darkBrown, flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 12, color: Colors.deepAmber },
  confirmBox: { marginTop: 8, gap: 8, padding: 12, backgroundColor: Colors.paleLemon, borderRadius: 10 },
  confirmHint: { fontSize: 12, color: Colors.deepAmber, lineHeight: 18 },
  viewLink: { fontSize: 12, color: Colors.goldenAmber, fontWeight: '600', marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: Colors.deepAmber },
});
