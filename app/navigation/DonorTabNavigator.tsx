import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { DonorTabParamList, DonorHomeStackParamList, MessagesStackParamList, ProfileStackParamList } from './types';
import { Colors } from '../constants/colors';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useMessagesStore } from '../store/messagesStore';
import { MyListingsScreen } from '../screens/donor/MyListingsScreen';
import { CreateStep1Screen } from '../screens/donor/CreateStep1Screen';
import { CreateStep2Screen } from '../screens/donor/CreateStep2Screen';
import { CreateStep3Screen } from '../screens/donor/CreateStep3Screen';
import { ListingSuccessScreen } from '../screens/donor/ListingSuccessScreen';
import { MarkCollectedScreen } from '../screens/donor/MarkCollectedScreen';
import { MessageInboxScreen } from '../screens/shared/MessageInboxScreen';
import { ChatThreadScreen } from '../screens/shared/ChatThreadScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { CommunityGuidelinesScreen } from '../screens/profile/CommunityGuidelinesScreen';
import { PremiumScreen } from '../screens/shared/PremiumScreen';
import { SupportScreen } from '../screens/shared/SupportScreen';
import { DeleteAccountScreen } from '../screens/profile/DeleteAccountScreen';

const Tab = createBottomTabNavigator<DonorTabParamList>();
const HomeStack = createNativeStackNavigator<DonorHomeStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function DonorHomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primaryYellow }, headerTintColor: Colors.darkBrown, headerShadowVisible: false }}>
      <HomeStack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'My Listings' }} />
      <HomeStack.Screen name="CreateStep1" component={CreateStep1Screen} options={{ title: 'Post food (1/3)' }} />
      <HomeStack.Screen name="CreateStep2" component={CreateStep2Screen} options={{ title: 'Post food (2/3)' }} />
      <HomeStack.Screen name="CreateStep3" component={CreateStep3Screen} options={{ title: 'Post food (3/3)' }} />
      <HomeStack.Screen name="ListingSuccess" component={ListingSuccessScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="MarkCollected" component={MarkCollectedScreen} options={{ title: 'Mark collected' }} />
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
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
      <ProfileStack.Screen name="CommunityGuidelines" component={CommunityGuidelinesScreen} options={{ title: 'Community Guidelines' }} />
      <ProfileStack.Screen name="Premium" component={PremiumScreen} options={{ title: 'Business Plan' }} />
      <ProfileStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support FoodLodge' }} />
      <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete Account' }} />
    </ProfileStack.Navigator>
  );
}

export function DonorTabNavigator() {
  const unread = useUnreadCount();
  const { triggerRefetch } = useMessagesStore();

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
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStackNavigator}
        listeners={{ focus: triggerRefetch }}
        options={{ title: 'Messages', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>, tabBarBadge: unread > 0 ? unread : undefined }}
      />
      <Tab.Screen
        name="PostFoodTab"
        component={DonorHomeStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('DonorHomeTab', { screen: 'CreateStep1' });
          },
        })}
        options={{ title: 'Post Food', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text> }}
      />
      <Tab.Screen name="AlertsTab" component={NotificationsScreen} options={{ title: 'Alerts', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔔</Text> }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}
