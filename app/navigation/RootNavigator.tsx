import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingNavigator } from './OnboardingNavigator';
import { DonorTabNavigator } from './DonorTabNavigator';
import { RecipientTabNavigator } from './RecipientTabNavigator';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === 'donor' ? (
          <Stack.Screen name="DonorTabs" component={DonorTabNavigator} />
        ) : (
          <Stack.Screen name="RecipientTabs" component={RecipientTabNavigator} />
        )
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}
