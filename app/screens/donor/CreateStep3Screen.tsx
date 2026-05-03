import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DonorHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { CategoryTag } from '../../components/badges/CategoryTag';
import { useCreateListingStore } from '../../store/createListingStore';
import { listingService } from '../../services/listing.service';
import { Listing } from '../../types';

type Props = NativeStackScreenProps<DonorHomeStackParamList, 'CreateStep3'>;

const DISCLAIMER = 'FoodShare connects donors and recipients but does not verify food safety or quality. All food exchanges are made in good faith. FoodShare accepts no liability for illness, injury or harm resulting from food exchanged on this platform.';

export function CreateStep3Screen({ navigation }: Props) {
  const store = useCreateListingStore();
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePublish() {
    if (!safetyAccepted) { setError('Please confirm the food safety checkbox'); return; }
    setError('');
    setLoading(true);
    try {
      await listingService.createListing({
        title: store.title,
        description: store.description,
        category: store.category as Listing['category'],
        quantity: store.quantity,
        servesCount: store.servesCount,
        photoUrl: '',
        borough: store.borough,
        fullAddress: store.fullAddress,
        pickupDate: store.pickupDate.toISOString(),
        pickupFrom: store.pickupFrom,
        pickupUntil: store.pickupUntil,
        expiryDate: store.expiryDate.toISOString(),
        acceptsDonations: store.acceptsDonations,
        donorAnonymous: store.donorAnonymous,
      } as unknown as Partial<Listing>);
      store.reset();
      navigation.replace('ListingSuccess');
    } catch (err: any) {
      Alert.alert('Failed to publish', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.step}>Step 3 of 3 — Review & publish</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{store.title}</Text>
        <CategoryTag category={store.category as Listing['category']} />
        <Text style={styles.row}><Text style={styles.rowLabel}>Quantity: </Text>{store.quantity}</Text>
        <Text style={styles.row}><Text style={styles.rowLabel}>Serves: </Text>{store.servesCount}</Text>
        <Text style={styles.row}><Text style={styles.rowLabel}>Borough: </Text>{store.borough}</Text>
        <Text style={styles.row}><Text style={styles.rowLabel}>Address: </Text>{store.fullAddress}</Text>
        <Text style={styles.row}><Text style={styles.rowLabel}>Pick-up date: </Text>{store.pickupDate.toLocaleDateString('en-GB')}</Text>
        <Text style={styles.row}><Text style={styles.rowLabel}>Pick-up time: </Text>{store.pickupFrom} – {store.pickupUntil}</Text>
        <Text style={styles.row}><Text style={styles.rowLabel}>Expiry: </Text>{store.expiryDate.toLocaleDateString('en-GB')}</Text>
        <Text style={styles.row}><Text style={styles.rowLabel}>Accepts donations: </Text>{store.acceptsDonations ? 'Yes' : 'No'}</Text>
        {store.acceptsDonations && <Text style={styles.row}><Text style={styles.rowLabel}>Anonymous: </Text>{store.donorAnonymous ? 'Yes' : 'No'}</Text>}
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Food safety reminder</Text>
        <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
        <TouchableOpacity style={styles.checkRow} onPress={() => setSafetyAccepted(!safetyAccepted)}>
          <View style={[styles.checkbox, safetyAccepted && styles.checkboxChecked]}>
            {safetyAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>I confirm this food is safe to share</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <PrimaryButton label="Publish listing" onPress={handlePublish} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: 16, paddingBottom: 40 },
  step: { fontSize: 12, color: Colors.deepAmber, marginBottom: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.amberBorder, padding: 16, marginBottom: 16, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: Colors.darkBrown, marginBottom: 4 },
  row: { fontSize: 13, color: Colors.deepAmber },
  rowLabel: { fontWeight: '600', color: Colors.darkBrown },
  disclaimerBox: { backgroundColor: Colors.paleLemon, borderRadius: 12, borderWidth: 1, borderColor: Colors.amberBorder, padding: 14, marginBottom: 20 },
  disclaimerTitle: { fontSize: 13, fontWeight: '600', color: Colors.darkBrown, marginBottom: 6 },
  disclaimerText: { fontSize: 12, color: Colors.deepAmber, lineHeight: 18, marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.goldenAmber, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: Colors.goldenAmber },
  checkmark: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 12, color: Colors.darkBrown, lineHeight: 18 },
  errorText: { fontSize: 11, color: Colors.errorText, marginTop: 6 },
});
