import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DonorHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OutlineButton } from '../../components/buttons/OutlineButton';

type Props = NativeStackScreenProps<DonorHomeStackParamList, 'ListingSuccess'>;

export function ListingSuccessScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Listing published!</Text>
      <Text style={styles.body}>Your food is now visible to recipients in your area. You'll be notified when someone claims it.</Text>

      <View style={styles.actions}>
        <PrimaryButton label="View my listings" onPress={() => navigation.replace('MyListings')} />
        <OutlineButton label="Post another" onPress={() => navigation.replace('CreateStep1')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.darkBrown, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  actions: { width: '100%', gap: 12 },
});
