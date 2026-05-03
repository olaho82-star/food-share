import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import { Colors } from '../constants/colors';
import { RoleSelectionScreen } from '../screens/onboarding/RoleSelectionScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetSentScreen } from '../screens/auth/ResetSentScreen';

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
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create account' }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign in' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset password' }} />
      <Stack.Screen name="ResetSent" component={ResetSentScreen} options={{ title: 'Check your inbox' }} />
    </Stack.Navigator>
  );
}
