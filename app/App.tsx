import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { storage } from './utils/storage';
import { registerForPushNotifications } from './utils/notifications';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { OfflineBanner } from './components/layout/OfflineBanner';

export default function App() {
  const { setAuth, setLoading, user } = useAuthStore();

  useEffect(() => {
    async function restoreAuth() {
      try {
        const saved = await storage.loadAuth();
        if (saved) {
          setAuth(saved.user, {
            accessToken: saved.accessToken,
            refreshToken: saved.refreshToken,
          });
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }
    restoreAuth();
  }, []);

  // Register for push notifications once the user is authenticated
  useEffect(() => {
    if (user) {
      registerForPushNotifications();
    }
  }, [user]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <View style={styles.root}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
          <OfflineBanner />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
