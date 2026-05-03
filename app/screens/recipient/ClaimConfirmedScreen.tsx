import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OutlineButton } from '../../components/buttons/OutlineButton';
import { listingService } from '../../services/listing.service';
import { Listing } from '../../types';

type Props = NativeStackScreenProps<RecipientHomeStackParamList, 'ClaimConfirmed'>;

export function ClaimConfirmedScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingService.getListing(listingId)
      .then((res) => setListing(res.listing))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color={Colors.goldenAmber} style={{ flex: 1, marginTop: 60 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Listing claimed!</Text>
      <Text style={styles.body}>You've claimed this listing. The pick-up address is now available.</Text>

      {listing && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{listing.title}</Text>
          <Text style={styles.summaryRow}>📅 {new Date(listing.pickupDate).toLocaleDateString('en-GB')}</Text>
          <Text style={styles.summaryRow}>🕐 {listing.pickupFrom} – {listing.pickupUntil}</Text>
          {listing.fullAddress && (
            <Text style={styles.summaryRow}>📍 {listing.fullAddress}</Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <PrimaryButton label="Message donor" onPress={() => {}} />
        <OutlineButton label="View my claims" onPress={() => navigation.navigate('HomeMap')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.darkBrown, marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  summaryCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.amberBorder, padding: 16, gap: 8, marginBottom: 32 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: Colors.darkBrown, marginBottom: 4 },
  summaryRow: { fontSize: 13, color: Colors.deepAmber },
  actions: { width: '100%', gap: 12 },
});
