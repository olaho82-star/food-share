import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { OutlineButton } from '../../components/buttons/OutlineButton';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'donor') {
        navigation.replace('DonorTabs');
      } else {
        navigation.replace('RecipientTabs');
      }
    }
  }, [user, isLoading]);

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoPin}>
          <Text style={styles.logoEmoji}>🥦</Text>
        </View>
        <Text style={styles.wordmark}>
          <Text style={styles.food}>Food</Text>
          <Text style={styles.share}>Share</Text>
        </Text>
        <Text style={styles.tagline}>Connecting surplus food with people who need it</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Get started"
          onPress={() => navigation.navigate('Onboarding', { screen: 'RoleSelection' })}
        />
        <View style={styles.gap} />
        <OutlineButton
          label="Sign in"
          onPress={() => navigation.navigate('Onboarding', { screen: 'SignIn' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryYellow,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 60,
  },
  logoArea: {
    alignItems: 'center',
  },
  logoPin: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.goldenAmber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 48,
  },
  wordmark: {
    fontSize: 36,
    marginBottom: 12,
  },
  food: {
    fontWeight: '600',
    color: Colors.darkBrown,
  },
  share: {
    fontWeight: '300',
    color: Colors.goldenAmber,
  },
  tagline: {
    fontSize: 14,
    color: Colors.darkBrown,
    textAlign: 'center',
    opacity: 0.8,
  },
  actions: {
    gap: 12,
  },
  gap: {
    height: 0,
  },
});
