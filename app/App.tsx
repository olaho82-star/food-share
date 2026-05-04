import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { storage } from './utils/storage';
import { registerForPushNotifications } from './utils/notifications';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export default function App() {
  const { setAuth, setLoading } = useAuthStore();

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
    registerForPushNotifications();
  }, []);

  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </StripeProvider>
  );
}
