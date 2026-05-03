import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingNavigator } from './OnboardingNavigator';
import { DonorTabNavigator } from './DonorTabNavigator';
import { RecipientTabNavigator } from './RecipientTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="DonorTabs" component={DonorTabNavigator} />
      <Stack.Screen name="RecipientTabs" component={RecipientTabNavigator} />
    </Stack.Navigator>
  );
}
