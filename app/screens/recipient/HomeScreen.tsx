import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ListingCard } from '../../components/cards/ListingCard';
import { CategoryTag } from '../../components/badges/CategoryTag';
import { listingService } from '../../services/listing.service';
import { Listing } from '../../types';

type Props = NativeStackScreenProps<RecipientHomeStackParamList, 'HomeMap'>;
type Category = Listing['category'];
const CATEGORIES: Category[] = ['bakery', 'fruit-veg', 'dairy', 'cooked', 'other'];

const LONDON_REGION: Region = {
  latitude: 51.5074,
  longitude: -0.1278,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export function HomeScreen({ navigation }: Props) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [region, setRegion] = useState<Region>(LONDON_REGION);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }
    })();
  }, []);

  async function fetchListings(refresh = false) {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await listingService.getNearby(region.latitude, region.longitude);
      setListings(res.listings);
      setFiltered(res.listings);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchListings(); }, [region.latitude, region.longitude]));

  function filterByCategory(cat: Category | null) {
    setActiveCategory(cat);
    setFiltered(cat ? listings.filter((l) => l.category === cat) : listings);
  }

  function goToDetail(id: string) {
    navigation.navigate('ListingDetail', { listingId: id });
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.viewToggle, viewMode === 'map' && styles.viewToggleActive]} onPress={() => setViewMode('map')}>
          <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>🗺 Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]} onPress={() => setViewMode('list')}>
          <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>☰ List</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        loading ? (
          <ActivityIndicator color={Colors.goldenAmber} style={styles.loader} />
        ) : (
          <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion} showsUserLocation>
            {filtered.map((listing) => (
              <Marker
                key={listing._id}
                coordinate={{ latitude: listing.coords.lat || 51.5074, longitude: listing.coords.lng || -0.1278 }}
                onPress={() => goToDetail(listing._id)}
              >
                <View style={styles.pin}>
                  <Text style={styles.pinText}>🍱</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        )
      ) : (
        <>
          <View style={styles.filterBar}>
            <TouchableOpacity onPress={() => filterByCategory(null)}>
              <View style={[styles.allTag, !activeCategory && styles.allTagActive]}>
                <Text style={[styles.allTagText, !activeCategory && styles.allTagTextActive]}>All</Text>
              </View>
            </TouchableOpacity>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} onPress={() => filterByCategory(c)}>
                <CategoryTag category={c} active={activeCategory === c} />
              </TouchableOpacity>
            ))}
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.goldenAmber} style={styles.loader} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchListings(true)} tintColor={Colors.goldenAmber} />}
              renderItem={({ item }) => <ListingCard listing={item} onPress={() => goToDetail(item._id)} />}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyText}>No food available nearby</Text>
                </View>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream },
  topBar: { flexDirection: 'row', backgroundColor: Colors.primaryYellow, padding: 8, gap: 8, justifyContent: 'center' },
  viewToggle: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  viewToggleActive: { backgroundColor: Colors.white, borderColor: Colors.goldenAmber },
  viewToggleText: { fontSize: 13, color: Colors.deepAmber, fontWeight: '500' },
  viewToggleTextActive: { color: Colors.darkBrown },
  map: { flex: 1 },
  pin: { backgroundColor: Colors.primaryYellow, borderRadius: 20, padding: 6, borderWidth: 2, borderColor: Colors.goldenAmber },
  pinText: { fontSize: 18 },
  filterBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.amberBorder },
  allTag: { backgroundColor: Colors.paleLemon, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  allTagActive: { backgroundColor: Colors.primaryYellow, borderWidth: 1, borderColor: Colors.goldenAmber },
  allTagText: { fontSize: 11, fontWeight: '500', color: Colors.deepAmber },
  allTagTextActive: { color: Colors.darkBrown },
  list: { padding: Spacing.screenPaddingHorizontal, paddingTop: 12 },
  loader: { marginTop: 40 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: Colors.deepAmber },
});
