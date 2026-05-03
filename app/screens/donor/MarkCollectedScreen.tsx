import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DonorHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OutlineButton } from '../../components/buttons/OutlineButton';
import { listingService } from '../../services/listing.service';

type Props = NativeStackScreenProps<DonorHomeStackParamList, 'MarkCollected'>;

export function MarkCollectedScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState(false);

  async function handleMarkCollected() {
    setLoading(true);
    try {
      await listingService.markCollected(listingId);
      setMarked(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  if (marked) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⏳</Text>
        <Text style={styles.title}>Waiting for confirmation</Text>
        <Text style={styles.body}>
          The recipient has been notified. Once they confirm collection, the exchange will be marked complete.
        </Text>
        <Text style={styles.note}>If they don't confirm within 24 hours, it will be auto-completed.</Text>
        <OutlineButton label="Back to my listings" onPress={() => navigation.replace('MyListings')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📦</Text>
      <Text style={styles.title}>Mark as collected?</Text>
      <Text style={styles.body}>
        Tap below to confirm the recipient has collected the food. They'll be asked to confirm on their side.
      </Text>
      {loading ? (
        <ActivityIndicator color={Colors.goldenAmber} />
      ) : (
        <View style={styles.actions}>
          <PrimaryButton label="Yes, mark as collected" onPress={handleMarkCollected} />
          <OutlineButton label="Not yet" onPress={() => navigation.goBack()} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', color: Colors.darkBrown, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  note: { fontSize: 12, color: Colors.deepAmber, textAlign: 'center', lineHeight: 18, marginBottom: 32, opacity: 0.7 },
  actions: { width: '100%', gap: 12 },
});
