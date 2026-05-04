import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { TextInput } from '../../components/inputs/TextInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/user.service';
import { storage } from '../../utils/storage';
import { LONDON_BOROUGHS } from '../../constants/boroughs';

export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [borough, setBorough] = useState(user?.borough ?? '');
  const [showBoroughPicker, setShowBoroughPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await userService.updateMe({ name: name.trim(), borough });
      const stored = await storage.loadAuth();
      if (stored) {
        await storage.saveAuth(stored.accessToken, stored.refreshToken, res.user);
        setAuth(res.user, { accessToken: stored.accessToken, refreshToken: stored.refreshToken });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput label="Full name" value={name} onChangeText={setName} placeholder="Your name" error={error} autoCapitalize="words" />

      <Text style={styles.label}>Borough</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowBoroughPicker(!showBoroughPicker)}>
        <Text style={[styles.selectorText, !borough && styles.placeholder]}>{borough || 'Select your borough'}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {showBoroughPicker && (
        <View style={styles.boroughList}>
          {LONDON_BOROUGHS.map((b) => (
            <TouchableOpacity key={b} style={[styles.boroughItem, borough === b && styles.boroughItemActive]} onPress={() => { setBorough(b); setShowBoroughPicker(false); }}>
              <Text style={[styles.boroughItemText, borough === b && styles.boroughItemTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <PrimaryButton label="Save changes" onPress={handleSave} loading={loading} />
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>To change your email or role, please contact support.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '500', color: Colors.darkBrown, marginBottom: 6 },
  selector: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.amberBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectorText: { fontSize: 13, color: Colors.darkBrown },
  placeholder: { color: Colors.deepAmber },
  chevron: { fontSize: 13, color: Colors.deepAmber },
  boroughList: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.amberBorder, maxHeight: 220, marginBottom: 12, overflow: 'hidden' },
  boroughItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.amberBorder },
  boroughItemActive: { backgroundColor: Colors.paleLemon },
  boroughItemText: { fontSize: 13, color: Colors.darkBrown },
  boroughItemTextActive: { fontWeight: '600', color: Colors.goldenAmber },
  note: { marginTop: 16, padding: 12, backgroundColor: Colors.paleLemon, borderRadius: 10 },
  noteText: { fontSize: 12, color: Colors.deepAmber, textAlign: 'center' },
});
