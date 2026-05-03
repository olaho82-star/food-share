import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { Colors } from '../constants/colors';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primaryYellow },
        headerTintColor: Colors.darkBrown,
        headerTitleStyle: { fontWeight: '500' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="RoleSelection"
        options={{ title: 'Join FoodShare', headerShown: false }}
        children={() => <PlaceholderScreen name="Role Selection" />}
      />
      <Stack.Screen
        name="SignUp"
        options={{ title: 'Create account' }}
        children={() => <PlaceholderScreen name="Sign Up" />}
      />
      <Stack.Screen
        name="SignIn"
        options={{ title: 'Sign in' }}
        children={() => <PlaceholderScreen name="Sign In" />}
      />
      <Stack.Screen
        name="ForgotPassword"
        options={{ title: 'Reset password' }}
        children={() => <PlaceholderScreen name="Forgot Password" />}
      />
      <Stack.Screen
        name="ResetSent"
        options={{ title: 'Check your inbox' }}
        children={() => <PlaceholderScreen name="Reset Email Sent" />}
      />
    </Stack.Navigator>
  );
}
