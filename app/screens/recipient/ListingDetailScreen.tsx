import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OutlineButton } from '../../components/buttons/OutlineButton';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { CategoryTag } from '../../components/badges/CategoryTag';
import { Divider } from '../../components/layout/Divider';
import { listingService } from '../../services/listing.service';
import { useAuthStore } from '../../store/authStore';
import { Listing } from '../../types';

type Props = NativeStackScreenProps<RecipientHomeStackParamList, 'ListingDetail'>;

const DISCLAIMER = 'FoodLodge connects donors and recipients but does not verify food safety or quality. All food exchanges are made in good faith. FoodLodge accepts no liability for illness, injury or harm resulting from food exchanged on this platform. Recipients should use their own judgement before consuming any items collected through FoodLodge.';

export function ListingDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const { user } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchListing();
  }, []);

  async function fetchListing() {
    try {
      const res = await listingService.getListing(listingId);
      setListing(res.listing);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    if (!listing) return;
    setClaiming(true);
    try {
      await listingService.claimListing(listing._id);
      navigation.replace('ClaimConfirmed', { listingId: listing._id });
    } catch (err: any) {
      Alert.alert('Could not claim', err.message);
    } finally {
      setClaiming(false);
    }
  }

  if (loading) return <ActivityIndicator color={Colors.goldenAmber} style={styles.loader} />;
  if (!listing) return null;

  const isClaimedByMe = listing.claimedBy === user?._id;
  const canClaim = listing.status === 'available';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {listing.photoUrl ? (
        <Image source={{ uri: listing.photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoEmoji}>🍱</Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{listing.title}</Text>
          <StatusBadge status={listing.status} />
        </View>

        <View style={styles.tagRow}>
          <CategoryTag category={listing.category} />
          <Text style={styles.borough}>{listing.borough}</Text>
        </View>

        <Divider />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <Text style={styles.infoValue}>{listing.quantity}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Serves</Text>
            <Text style={styles.infoValue}>{listing.servesCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pick-up date</Text>
            <Text style={styles.infoValue}>{new Date(listing.pickupDate).toLocaleDateString('en-GB')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pick-up time</Text>
            <Text style={styles.infoValue}>{listing.pickupFrom} – {listing.pickupUntil}</Text>
          </View>
        </View>

        {isClaimedByMe && listing.fullAddress && (
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>📍 Pick-up address</Text>
            <Text style={styles.addressValue}>{listing.fullAddress}</Text>
          </View>
        )}

        <Divider />

        <Text style={styles.descLabel}>About this food</Text>
        <Text style={styles.description}>{listing.description}</Text>

        <Divider />

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚠️ Food safety disclaimer</Text>
          <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
        </View>

        {canClaim && (
          <PrimaryButton label="Claim this listing" onPress={handleClaim} loading={claiming} />
        )}
        {isClaimedByMe && (
          <OutlineButton label="Message donor" onPress={() => {}} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { paddingBottom: 40 },
  loader: { flex: 1, marginTop: 60 },
  photo: { width: '100%', height: 220 },
  photoPlaceholder: { backgroundColor: Colors.paleLemon, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 60 },
  body: { padding: Spacing.screenPaddingHorizontal, gap: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 20, fontWeight: '600', color: Colors.darkBrown, flex: 1 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  borough: { fontSize: 12, color: Colors.deepAmber },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: { width: '45%' },
  infoLabel: { fontSize: 11, color: Colors.deepAmber, marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '500', color: Colors.darkBrown },
  addressBox: { backgroundColor: Colors.paleLemon, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.amberBorder },
  addressLabel: { fontSize: 12, fontWeight: '600', color: Colors.darkBrown, marginBottom: 4 },
  addressValue: { fontSize: 13, color: Colors.deepAmber },
  descLabel: { fontSize: 13, fontWeight: '600', color: Colors.darkBrown },
  description: { fontSize: 13, color: Colors.deepAmber, lineHeight: 20 },
  disclaimerBox: { backgroundColor: Colors.paleLemon, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.amberBorder },
  disclaimerTitle: { fontSize: 12, fontWeight: '600', color: Colors.darkBrown, marginBottom: 6 },
  disclaimerText: { fontSize: 11, color: Colors.deepAmber, lineHeight: 17 },
});
