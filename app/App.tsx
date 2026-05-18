import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import Purchases from 'react-native-purchases';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { storage } from './utils/storage';
import { registerForPushNotifications } from './utils/notifications';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { OfflineBanner } from './components/layout/OfflineBanner';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

const REVENUECAT_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? '';

export default function App() {
  const { setAuth, setLoading, user } = useAuthStore();

  useEffect(() => {
    Purchases.configure({ apiKey: REVENUECAT_KEY });
  }, []);

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
      <StripeProvider publishableKey={STRIPE_KEY}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
          <OfflineBanner />
        </View>
      </SafeAreaProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
