import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { DonorTabParamList, DonorHomeStackParamList, MessagesStackParamList, ProfileStackParamList } from './types';
import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator<DonorTabParamList>();
const HomeStack = createNativeStackNavigator<DonorHomeStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function DonorHomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primaryYellow }, headerTintColor: Colors.darkBrown, headerShadowVisible: false }}>
      <HomeStack.Screen name="MyListings" options={{ title: 'My Listings' }} children={() => <PlaceholderScreen name="My Listings" />} />
      <HomeStack.Screen name="CreateStep1" options={{ title: 'Post food (1/3)' }} children={() => <PlaceholderScreen name="Create Listing — Details" />} />
      <HomeStack.Screen name="CreateStep2" options={{ title: 'Post food (2/3)' }} children={() => <PlaceholderScreen name="Create Listing — Pick-up" />} />
      <HomeStack.Screen name="CreateStep3" options={{ title: 'Post food (3/3)' }} children={() => <PlaceholderScreen name="Create Listing — Review" />} />
      <HomeStack.Screen name="ListingSuccess" options={{ headerShown: false }} children={() => <PlaceholderScreen name="Listing Published" />} />
      <HomeStack.Screen name="MarkCollected" options={{ title: 'Mark collected' }} children={() => <PlaceholderScreen name="Mark Collected" />} />
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

export function DonorTabNavigator() {
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
      <Tab.Screen name="DonorHomeTab" component={DonorHomeStackNavigator} options={{ title: 'Home', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }} />
      <Tab.Screen name="MessagesTab" component={MessagesStackNavigator} options={{ title: 'Messages', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text> }} />
      <Tab.Screen name="PostFoodTab" component={DonorHomeStackNavigator} options={{ title: 'Post Food', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text> }} />
      <Tab.Screen name="AlertsTab" options={{ title: 'Alerts', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔔</Text> }} children={() => <PlaceholderScreen name="Notifications" />} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}
