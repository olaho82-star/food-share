import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { DestructiveButton } from '../../components/buttons/DestructiveButton';
import { api } from '../../services/api';
import { storage } from '../../utils/storage';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DeleteAccount'>;

export function DeleteAccountScreen({ navigation }: Props) {
  const { clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account, all your listings, and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete('/api/users/me');
              await storage.clearAuth();
              clearAuth();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account. Please try again.');
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Delete your account</Text>
      <Text style={styles.body}>
        Deleting your account will permanently remove:
      </Text>
      <View style={styles.list}>
        <Text style={styles.item}>• Your profile and personal details</Text>
        <Text style={styles.item}>• All your food listings</Text>
        <Text style={styles.item}>• Your message history</Text>
        <Text style={styles.item}>• Your ratings and donation history</Text>
      </View>
      <Text style={styles.warning}>This action cannot be undone.</Text>

      {loading ? (
        <ActivityIndicator color={Colors.goldenAmber} style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.actions}>
          <DestructiveButton label="Delete my account" onPress={handleDelete} />
          <PrimaryButton label="Cancel" onPress={() => navigation.goBack()} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.darkBrown, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 14, color: Colors.deepAmber, textAlign: 'center', marginBottom: 16 },
  list: { width: '100%', backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: Colors.amberBorder },
  item: { fontSize: 13, color: Colors.deepAmber },
  warning: { fontSize: 13, fontWeight: '700', color: Colors.darkRed, marginBottom: 32, textAlign: 'center' },
  actions: { width: '100%', gap: 12 },
});