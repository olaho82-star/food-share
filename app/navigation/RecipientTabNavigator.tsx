import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { RecipientTabParamList, RecipientHomeStackParamList, MessagesStackParamList, ProfileStackParamList } from './types';
import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator<RecipientTabParamList>();
const HomeStack = createNativeStackNavigator<RecipientHomeStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function RecipientHomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primaryYellow }, headerTintColor: Colors.darkBrown, headerShadowVisible: false }}>
      <HomeStack.Screen name="HomeMap" options={{ title: 'Find food' }} children={() => <PlaceholderScreen name="Home Map" />} />
      <HomeStack.Screen name="ListingDetail" options={{ title: 'Listing' }} children={() => <PlaceholderScreen name="Listing Detail" />} />
      <HomeStack.Screen name="ClaimConfirmed" options={{ headerShown: false }} children={() => <PlaceholderScreen name="Claim Confirmed" />} />
      <HomeStack.Screen name="VoluntaryDonation" options={{ title: 'Leave a donation' }} children={() => <PlaceholderScreen name="Voluntary Donation" />} />
      <HomeStack.Screen name="RateExchange" options={{ title: 'Rate this exchange' }} children={() => <PlaceholderScreen name="Rate Exchange" />} />
    </HomeStack.Navigator>
  );
}

function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primaryYellow }, headerTintColor: Colors.darkBrown, headerShadowVisible: false }}>
      <MessagesStack.Screen name="MessageInbox" options={{ title: 'Messages' }} children={() => <PlaceholderScreen name="Message Inbox" />} />
      <MessagesStack.Screen name="ChatThread" options={{ title: 'Chat' }} children={() => <PlaceholderScreen name="Chat Thread" />} />
    </MessagesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primaryYellow }, headerTintColor: Colors.darkBrown, headerShadowVisible: false }}>
      <ProfileStack.Screen name="Profile" options={{ title: 'Profile' }} children={() => <PlaceholderScreen name="Profile" />} />
      <ProfileStack.Screen name="CommunityGuidelines" options={{ title: 'Community Guidelines' }} children={() => <PlaceholderScreen name="Community Guidelines" />} />
    </ProfileStack.Navigator>
  );
}

export function RecipientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.primaryYellow, borderTopColor: Colors.goldenAmber },
        tabBarActiveTintColor: Colors.darkBrown,
        tabBarInactiveTintColor: Colors.deepAmber,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tab.Screen name="RecipientHomeTab" component={RecipientHomeStackNavigator} options={{ title: 'Home', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🗺️</Text> }} />
      <Tab.Screen name="MessagesTab" component={MessagesStackNavigator} options={{ title: 'Messages', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text> }} />
      <Tab.Screen name="MyClaimsTab" options={{ title: 'My Claims', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📦</Text> }} children={() => <PlaceholderScreen name="My Claims" />} />
      <Tab.Screen name="AlertsTab" options={{ title: 'Alerts', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔔</Text> }} children={() => <PlaceholderScreen name="Notifications" />} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}
