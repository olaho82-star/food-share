import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Divider } from '../../components/layout/Divider';

const SECTIONS = [
  {
    title: 'Food safety',
    body: "Only donate food you'd give to a friend. Label allergens clearly. Never donate food that is spoiled, past its use-by date, or improperly stored. Home-cooked food should be clearly described and stored safely before collection.",
  },
  {
    title: 'For donors',
    body: "List food accurately. Be available during your pick-up window. Cancel listings you can no longer fulfil. Treat all recipients with respect regardless of background or circumstance.",
  },
  {
    title: 'For recipients',
    body: "Only claim food you genuinely intend to collect. Arrive within the pick-up window. Confirm collection promptly. Treat donors with kindness — they are sharing out of goodwill.",
  },
  {
    title: 'Conduct & trust',
    body: "Keep all communication on FoodLodge. Never share personal contact details. FoodLodge is not for commercial gain. Repeated no-shows or abusive behaviour may result in account suspension.",
  },
];

export function CommunityGuidelinesScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.intro}>
        FoodLodge is built on trust. These guidelines help keep our community safe, respectful, and effective.
      </Text>

      {SECTIONS.map((section, i) => (
        <View key={section.title}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
          {i < SECTIONS.length - 1 && <Divider />}
        </View>
      ))}

      <View style={styles.reportBox}>
        <Text style={styles.reportTitle}>Report a concern</Text>
        <Text style={styles.reportBody}>
          If you experience or witness behaviour that violates these guidelines, please contact our support team at{' '}
          <Text style={styles.reportEmail}>support@foodlodge.app</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.lightCream },
  container: { padding: Spacing.screenPaddingHorizontal, paddingBottom: 40 },
  intro: { fontSize: 13, color: Colors.deepAmber, lineHeight: 20, marginBottom: 20, marginTop: 8 },
  section: { paddingVertical: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown, marginBottom: 8 },
  sectionBody: { fontSize: 13, color: Colors.deepAmber, lineHeight: 20 },
  reportBox: { marginTop: 24, backgroundColor: Colors.paleLemon, borderRadius: 14, borderWidth: 1, borderColor: Colors.amberBorder, padding: 16 },
  reportTitle: { fontSize: 14, fontWeight: '700', color: Colors.darkBrown, marginBottom: 8 },
  reportBody: { fontSize: 13, color: Colors.deepAmber, lineHeight: 20 },
  reportEmail: { fontWeight: '600', color: Colors.goldenAmber },
});
