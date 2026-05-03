import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Listing } from '../../types';

type Status = Listing['status'];

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  available: { bg: Colors.successGreen, text: Colors.successText, label: 'Available' },
  claimed: { bg: Colors.primaryYellow, text: Colors.darkBrown, label: 'Claimed' },
  'pending-confirmation': { bg: Colors.paleLemon, text: Colors.deepAmber, label: 'Pending' },
  completed: { bg: Colors.successGreen, text: Colors.successText, label: 'Completed' },
  expired: { bg: Colors.errorRed, text: Colors.errorText, label: 'Expired' },
};

interface Props {
  status: Status;
}

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
