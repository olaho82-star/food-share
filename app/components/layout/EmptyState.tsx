import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../buttons/PrimaryButton';

interface Props {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', color: Colors.darkBrown, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  action: { width: '100%' },
});
