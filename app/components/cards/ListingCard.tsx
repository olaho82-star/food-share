import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Listing } from '../../types';
import { StatusBadge } from '../badges/StatusBadge';
import { CategoryTag } from '../badges/CategoryTag';

interface Props {
  listing: Listing;
  onPress: () => void;
}

export function ListingCard({ listing, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {listing.photoUrl ? (
        <Image source={{ uri: listing.photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoEmoji}>🍱</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
          <StatusBadge status={listing.status} />
        </View>
        <View style={styles.tagRow}>
          <CategoryTag category={listing.category} />
          <Text style={styles.borough}>{listing.borough}</Text>
        </View>
        <Text style={styles.pickup}>
          Pick-up: {listing.pickupFrom} – {listing.pickupUntil}
        </Text>
        <Text style={styles.serves}>Serves {listing.servesCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.amberBorder,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  photo: { width: 90, height: 90 },
  photoPlaceholder: {
    backgroundColor: Colors.paleLemon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 32 },
  content: { flex: 1, padding: 10, gap: 5 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown, flex: 1, marginRight: 8 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  borough: { fontSize: 11, color: Colors.deepAmber },
  pickup: { fontSize: 11, color: Colors.deepAmber },
  serves: { fontSize: 11, color: Colors.deepAmber },
});
