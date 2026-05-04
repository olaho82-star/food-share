import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OutlineButton } from '../../components/buttons/OutlineButton';
import { exchangeService } from '../../services/exchange.service';

type Props = NativeStackScreenProps<RecipientHomeStackParamList, 'RateExchange'>;

export function RateExchangeScreen({ route, navigation }: Props) {
  const { exchangeId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) { Alert.alert('Select a rating', 'Please tap a star to rate this exchange.'); return; }
    setLoading(true);
    try {
      await exchangeService.submitRating(exchangeId, rating, comment.trim() || undefined);
      navigation.popToTop();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⭐</Text>
      <Text style={styles.title}>Rate this exchange</Text>
      <Text style={styles.subtitle}>How was your experience collecting this food?</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      {rating > 0 && (
        <Text style={styles.ratingLabel}>
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
        </Text>
      )}

      <TextInput
        style={styles.commentInput}
        value={comment}
        onChangeText={setComment}
        placeholder="Leave an optional comment..."
        placeholderTextColor={Colors.deepAmber}
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <View style={styles.actions}>
        <PrimaryButton label="Submit rating" onPress={handleSubmit} loading={loading} disabled={rating === 0} />
        <OutlineButton label="Skip" onPress={() => navigation.popToTop()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.darkBrown, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  stars: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  star: { fontSize: 44, color: Colors.amberBorder },
  starActive: { color: Colors.primaryYellow },
  ratingLabel: { fontSize: 16, fontWeight: '600', color: Colors.darkBrown, marginBottom: 24 },
  commentInput: { width: '100%', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.amberBorder, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.darkBrown, textAlignVertical: 'top', height: 110, marginBottom: 24 },
  actions: { width: '100%', gap: 12 },
});
