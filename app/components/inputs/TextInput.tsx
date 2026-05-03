import React from 'react';
import { TextInput as RNTextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={Colors.deepAmber}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.darkBrown,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.amberBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.darkBrown,
  },
  inputError: {
    borderColor: Colors.darkRed,
  },
  error: {
    fontSize: 11,
    color: Colors.errorText,
    marginTop: 4,
  },
});
