import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Colors } from '../../constants/colors';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isConnected ? -40 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [isConnected]);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>📡 No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.darkRed,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 999,
  },
  text: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
});
