import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { RecipientTabParamList, RecipientHomeStackParamList, MessagesStackParamList, ProfileStackParamList } from './types';
import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { Colors } from '../constants/colors';
import { HomeScreen } from '../screens/recipient/HomeScreen';
import { ListingDetailScreen } from '../screens/recipient/ListingDetailScreen';
import { ClaimConfirmedScreen } from '../screens/recipient/ClaimConfirmedScreen';
import { VoluntaryDonationScreen } from '../screens/recipient/VoluntaryDonationScreen';
import { RateExchangeScreen } from '../screens/recipient/RateExchangeScreen';
import { MyClaimsScreen } from '../screens/recipient/MyClaimsScreen';
import { MessageInboxScreen } from '../screens/shared/MessageInboxScreen';
import { ChatThreadScreen } from '../screens/shared/ChatThreadScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

const Tab = createBottomTabNavigator<RecipientTabParamList>();
const HomeStack = createNativeStackNavigator<RecipientHomeStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function RecipientHomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primaryYellow }, headerTintColor: Colors.darkBrown, headerShadowVisible: false }}>
      <HomeStack.Screen name="HomeMap" component={HomeScreen} options={{ title: 'Find food near you' }} />
      <HomeStack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing' }} />
      <HomeStack.Screen name="ClaimConfirmed" component={ClaimConfirmedScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="VoluntaryDonation" component={VoluntaryDonationScreen} options={{ title: 'Leave a donation' }} />
      <HomeStack.Screen name="RateExchange" component={RateExchangeScreen} options={{ title: 'Rate this exchange' }} />
    </HomeStack.Navigator>
  );
}

function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primaryYellow }, headerTintColor: Colors.darkBrown, headerShadowVisible: false }}>
      <MessagesStack.Screen name="MessageInbox" component={MessageInboxScreen} options={{ title: 'Messages' }} />
      <MessagesStack.Screen name="ChatThread" component={ChatThreadScreen} options={({ route }) => ({ title: (route.params as any)?.listingTitle || 'Chat' })} />
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
      <Tab.Screen name="MyClaimsTab" component={MyClaimsScreen} options={{ title: 'My Claims', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📦</Text> }} />
      <Tab.Screen name="AlertsTab" component={NotificationsScreen} options={{ title: 'Alerts', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔔</Text> }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}
