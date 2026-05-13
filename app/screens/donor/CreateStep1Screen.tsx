import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DonorHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { TextInput } from '../../components/inputs/TextInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { CategoryTag } from '../../components/badges/CategoryTag';
import { useCreateListingStore } from '../../store/createListingStore';
import { Listing } from '../../types';

type Props = NativeStackScreenProps<DonorHomeStackParamList, 'CreateStep1'>;
type Category = Listing['category'];
const CATEGORIES: Category[] = ['bakery', 'fruit-veg', 'dairy', 'cooked', 'other'];

export function CreateStep1Screen({ navigation }: Props) {
  const store = useCreateListingStore();
  const [photoUri, setPhotoUri] = useState(store.photoUri);
  const [title, setTitle] = useState(store.title);
  const [category, setCategory] = useState<Category | ''>(store.category);
  const [quantity, setQuantity] = useState(store.quantity);
  const [servesCount, setServesCount] = useState(store.servesCount);
  const [description, setDescription] = useState(store.description);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!category) e.category = 'Please select a category';
    if (!quantity.trim()) e.quantity = 'Quantity is required';
    if (!servesCount.trim()) e.servesCount = 'Number of servings is required';
    if (!description.trim()) e.description = 'Description is required';
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    store.setStep1({ photoUri, title, category: category as Category, quantity, servesCount, description });
    navigation.navigate('CreateStep2');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.step}>Step 1 of 3 — Food details</Text>

      <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoEmoji}>📷</Text>
            <Text style={styles.photoHint}>Tap to add a photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Leftover sourdough loaves" error={errors.title} />
      <TextInput label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="e.g. 3 loaves" error={errors.quantity} />
      <TextInput label="Serves" value={servesCount} onChangeText={setServesCount} placeholder="e.g. 4–6 people" error={errors.servesCount} />
      <TextInput label="Description" value={description} onChangeText={setDescription} placeholder="Describe the food, any allergens, how it's stored..." error={errors.description} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} />

      <Text style={styles.catLabel}>Category</Text>
      <View style={styles.catRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)}>
            <CategoryTag category={c} active={category === c} />
          </TouchableOpacity>
        ))}
      </View>
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      <View style={styles.footer}>
        <PrimaryButton label="Next →" onPress={handleNext} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: 16, paddingBottom: 40 },
  step: { fontSize: 12, color: Colors.deepAmber, marginBottom: 16 },
  photoBox: { borderRadius: 12, overflow: 'hidden', marginBottom: 16, height: 180, backgroundColor: Colors.paleLemon, borderWidth: 1, borderColor: Colors.amberBorder },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoEmoji: { fontSize: 40 },
  photoHint: { fontSize: 13, color: Colors.deepAmber },
  catLabel: { fontSize: 12, fontWeight: '500', color: Colors.darkBrown, marginBottom: 8 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  errorText: { fontSize: 11, color: Colors.errorText, marginBottom: 12 },
  footer: { marginTop: 24 },
});
