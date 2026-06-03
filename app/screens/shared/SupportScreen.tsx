import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Linking, Alert } from 'react-native';
import { Colors } from '../../constants/colors';

export function SupportScreen({ }: any) {
  async function handleShare() {
    try {
      await Share.share({
        message: 'I\'ve been using FoodLodge to share surplus food with people in London. Check it out! https://www.foodlodge.co.uk',
        title: 'FoodLodge — Share surplus food',
      });
    } catch {}
  }

  function handleReview() {
    Linking.openURL('https://apps.apple.com/app/id6746783586')
      .catch(() => Alert.alert('Could not open App Store', 'Search for FoodLodge on the App Store to leave a review.'));
  }

  function handleContact() {
    Linking.openURL('mailto:hello@foodlodge.co.uk?subject=FoodLodge Feedback')
      .catch(() => Alert.alert('Could not open email', 'Email us at hello@foodlodge.co.uk'));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💚</Text>
      <Text style={styles.title}>Support FoodLodge</Text>
      <Text style={styles.subtitle}>
        FoodLodge is free for everyone. The best way to support us is to spread the word and help reduce food waste in London.
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Share the app</Text>
            <Text style={styles.actionDesc}>Tell friends and local businesses about FoodLodge</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleReview}>
          <Text style={styles.actionIcon}>⭐</Text>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Leave a review</Text>
            <Text style={styles.actionDesc}>Rate FoodLodge on the App Store</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleContact}>
          <Text style={styles.actionIcon}>✉️</Text>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Send us feedback</Text>
            <Text style={styles.actionDesc}>We read every message and love hearing from you</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24 },
  emoji: { fontSize: 56, textAlign: 'center', marginTop: 32, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.darkBrown, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  actions: { gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.amberBorder, padding: 16, gap: 14 },
  actionIcon: { fontSize: 28 },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: Colors.darkBrown, marginBottom: 2 },
  actionDesc: { fontSize: 12, color: Colors.deepAmber, lineHeight: 18 },
});