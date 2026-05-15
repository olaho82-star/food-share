import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DonorHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ListingCard } from '../../components/cards/ListingCard';
import { listingService } from '../../services/listing.service';
import { Listing } from '../../types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<DonorHomeStackParamList, 'MyListings'>;
type Tab = 'active' | 'completed' | 'expired';

const TABS: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'expired', label: 'Expired' },
];

export function MyListingsScreen({ }: Props) {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);

  async function handleMarkCollected(listingId: string) {
    Alert.alert('Mark as collected', 'Has the recipient collected this food?', [
      { text: 'Not yet', style: 'cancel' },
      {
        text: 'Yes, mark collected', onPress: async () => {
          setMarking(listingId);
          try {
            await listingService.markCollected(listingId);
            fetchListings();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setMarking(null);
          }
        },
      },
    ]);
  }

  async function fetchListings(refresh = false) {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const statusMap: Record<Tab, string> = {
        active: 'available,claimed,pending-confirmation',
        completed: 'completed',
        expired: 'expired',
      };
      const res = await listingService.getMyListings(statusMap[tab]);
      setListings(res.listings);
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchListings(); }, [tab]));

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user?.donationsCount ?? 0}</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user?.foodSavedKg ?? 0}kg</Text>
          <Text style={styles.statLabel}>Food saved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{user?.rating?.toFixed(1) ?? '—'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchListings(true)} tintColor={Colors.goldenAmber} />}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ListingCard listing={item} onPress={() => {}} />
              {item.status === 'claimed' && (
                <TouchableOpacity
                  style={[styles.actionBtn, marking === item._id && styles.actionBtnDisabled]}
                  onPress={() => handleMarkCollected(item._id)}
                  disabled={marking === item._id}
                >
                  <Text style={styles.actionBtnText}>
                    {marking === item._id ? 'Marking…' : '📦 Mark as collected'}
                  </Text>
                </TouchableOpacity>
              )}
              {item.status === 'pending-confirmation' && (
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingText}>⏳ Waiting for recipient to confirm collection</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No {tab} listings</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream },
  statsBar: { flexDirection: 'row', backgroundColor: Colors.primaryYellow, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '600', color: Colors.darkBrown },
  statLabel: { fontSize: 10, color: Colors.deepAmber, marginTop: 2 },
  statDivider: { width: 0.5, height: 30, backgroundColor: Colors.goldenAmber },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.amberBorder },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.goldenAmber },
  tabLabel: { fontSize: 13, color: Colors.deepAmber, fontWeight: '400' },
  tabLabelActive: { color: Colors.darkBrown, fontWeight: '600' },
  list: { padding: Spacing.screenPaddingHorizontal, paddingTop: 12 },
  loader: { marginTop: 40 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: Colors.deepAmber },
  cardWrapper: { marginBottom: 10 },
  actionBtn: { backgroundColor: Colors.primaryYellow, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.darkBrown },
  pendingBox: { backgroundColor: Colors.paleLemon, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 6, borderWidth: 1, borderColor: Colors.amberBorder },
  pendingText: { fontSize: 12, color: Colors.deepAmber },
});
