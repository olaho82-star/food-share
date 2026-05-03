import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DonorHomeStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { TextInput } from '../../components/inputs/TextInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { useCreateListingStore } from '../../store/createListingStore';
import { LONDON_BOROUGHS } from '../../constants/boroughs';

type Props = NativeStackScreenProps<DonorHomeStackParamList, 'CreateStep2'>;

export function CreateStep2Screen({ navigation }: Props) {
  const store = useCreateListingStore();
  const [borough, setBorough] = useState(store.borough);
  const [showBoroughPicker, setShowBoroughPicker] = useState(false);
  const [fullAddress, setFullAddress] = useState(store.fullAddress);
  const [pickupDate, setPickupDate] = useState(store.pickupDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickupFrom, setPickupFrom] = useState(store.pickupFrom);
  const [pickupUntil, setPickupUntil] = useState(store.pickupUntil);
  const [expiryDate, setExpiryDate] = useState(store.expiryDate);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [acceptsDonations, setAcceptsDonations] = useState(store.acceptsDonations);
  const [donorAnonymous, setDonorAnonymous] = useState(store.donorAnonymous);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!borough) e.borough = 'Please select your borough';
    if (!fullAddress.trim()) e.fullAddress = 'Full address is required';
    if (!pickupFrom.trim()) e.pickupFrom = 'Pick-up start time is required';
    if (!pickupUntil.trim()) e.pickupUntil = 'Pick-up end time is required';
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    store.setStep2({ borough, fullAddress, pickupDate, pickupFrom, pickupUntil, expiryDate, acceptsDonations, donorAnonymous });
    navigation.navigate('CreateStep3');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.step}>Step 2 of 3 — Pick-up details</Text>

      <Text style={styles.label}>Borough</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowBoroughPicker(!showBoroughPicker)}>
        <Text style={[styles.selectorText, !borough && styles.placeholder]}>{borough || 'Select your borough'}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {errors.borough && <Text style={styles.errorText}>{errors.borough}</Text>}
      {showBoroughPicker && (
        <View style={styles.boroughList}>
          {LONDON_BOROUGHS.map((b) => (
            <TouchableOpacity key={b} style={[styles.boroughItem, borough === b && styles.boroughItemActive]} onPress={() => { setBorough(b); setShowBoroughPicker(false); }}>
              <Text style={[styles.boroughItemText, borough === b && styles.boroughItemTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TextInput label="Full address (shown only after claim)" value={fullAddress} onChangeText={setFullAddress} placeholder="House number, street, postcode" error={errors.fullAddress} />

      <Text style={styles.label}>Pick-up date</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.selectorText}>{pickupDate.toLocaleDateString('en-GB')}</Text>
        <Text style={styles.chevron}>📅</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={pickupDate} mode="date" minimumDate={new Date()} onChange={(_, date) => { setShowDatePicker(Platform.OS === 'ios'); if (date) setPickupDate(date); }} />
      )}

      <View style={styles.timeRow}>
        <View style={styles.timeField}>
          <TextInput label="From" value={pickupFrom} onChangeText={setPickupFrom} placeholder="14:00" error={errors.pickupFrom} />
        </View>
        <View style={styles.timeField}>
          <TextInput label="Until" value={pickupUntil} onChangeText={setPickupUntil} placeholder="18:00" error={errors.pickupUntil} />
        </View>
      </View>

      <Text style={styles.label}>Listing expiry date</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowExpiryPicker(true)}>
        <Text style={styles.selectorText}>{expiryDate.toLocaleDateString('en-GB')}</Text>
        <Text style={styles.chevron}>📅</Text>
      </TouchableOpacity>
      {showExpiryPicker && (
        <DateTimePicker value={expiryDate} mode="date" minimumDate={new Date()} onChange={(_, date) => { setShowExpiryPicker(Platform.OS === 'ios'); if (date) setExpiryDate(date); }} />
      )}

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Accept voluntary donations</Text>
          <Text style={styles.toggleDesc}>Recipients can optionally donate after collecting</Text>
        </View>
        <Switch value={acceptsDonations} onValueChange={setAcceptsDonations} trackColor={{ true: Colors.goldenAmber }} thumbColor={Colors.white} />
      </View>

      {acceptsDonations && (
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Keep my name anonymous</Text>
            <Text style={styles.toggleDesc}>Donations show as "Anonymous donor"</Text>
          </View>
          <Switch value={donorAnonymous} onValueChange={setDonorAnonymous} trackColor={{ true: Colors.goldenAmber }} thumbColor={Colors.white} />
        </View>
      )}

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
  label: { fontSize: 12, fontWeight: '500', color: Colors.darkBrown, marginBottom: 6 },
  selector: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.amberBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectorText: { fontSize: 13, color: Colors.darkBrown },
  placeholder: { color: Colors.deepAmber },
  chevron: { fontSize: 13, color: Colors.deepAmber },
  errorText: { fontSize: 11, color: Colors.errorText, marginTop: -8, marginBottom: 10 },
  boroughList: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.amberBorder, maxHeight: 200, marginBottom: 12, overflow: 'hidden' },
  boroughItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.amberBorder },
  boroughItemActive: { backgroundColor: Colors.paleLemon },
  boroughItemText: { fontSize: 13, color: Colors.darkBrown },
  boroughItemTextActive: { fontWeight: '600', color: Colors.goldenAmber },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeField: { flex: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: Colors.amberBorder },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: 13, fontWeight: '500', color: Colors.darkBrown },
  toggleDesc: { fontSize: 11, color: Colors.deepAmber, marginTop: 2 },
  footer: { marginTop: 24 },
});
