import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { storage } from './utils/storage';

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
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
