import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../buttons/PrimaryButton';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>The app ran into an unexpected error. Please restart.</Text>
          <PrimaryButton label="Try again" onPress={() => this.setState({ hasError: false, message: '' })} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.darkBrown, marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
});
