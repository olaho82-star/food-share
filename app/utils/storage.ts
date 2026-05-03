import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@foodshare/access_token',
  REFRESH_TOKEN: '@foodshare/refresh_token',
  USER: '@foodshare/user',
};

export const storage = {
  async saveAuth(accessToken: string, refreshToken: string, user: object) {
    await AsyncStorage.multiSet([
      [KEYS.ACCESS_TOKEN, accessToken],
      [KEYS.REFRESH_TOKEN, refreshToken],
      [KEYS.USER, JSON.stringify(user)],
    ]);
  },
  async loadAuth() {
    const [[, access], [, refresh], [, user]] = await AsyncStorage.multiGet([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER,
    ]);
    if (!access || !refresh || !user) return null;
    return { accessToken: access, refreshToken: refresh, user: JSON.parse(user) };
  },
  async clearAuth() {
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]);
  },
};
