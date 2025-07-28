import * as Keychain from 'react-native-keychain';

export const storeSecureData = async (key, data) => {
  try {
    await Keychain.setInternetCredentials(
      key,
      key,
      JSON.stringify(data)
    );
    return true;
  } catch (error) {
    console.error('Error storing secure data:', error);
    return false;
  }
};

export const getSecureData = async (key) => {
  try {
    const credentials = await Keychain.getInternetCredentials(key);
    if (credentials && credentials.password) {
      return JSON.parse(credentials.password);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
};

export const removeSecureData = async (key) => {
  try {
    await Keychain.resetInternetCredentials(key);
    return true;
  } catch (error) {
    console.error('Error removing secure data:', error);
    return false;
  }
};

export const storeAuthToken = async (token) => {
  return await storeSecureData('auth_token', token);
};

export const getAuthToken = async () => {
  return await getSecureData('auth_token');
};

export const removeAuthToken = async () => {
  return await removeSecureData('auth_token');
};

export const storeBusinessProfile = async (profile) => {
  return await storeSecureData('business_profile', profile);
};

export const getBusinessProfile = async () => {
  return await getSecureData('business_profile');
};

export const storeUserPreferences = async (preferences) => {
  return await storeSecureData('user_preferences', preferences);
};

export const getUserPreferences = async () => {
  return await getSecureData('user_preferences');
};

export const clearAllSecureData = async () => {
  try {
    const keys = ['auth_token', 'business_profile', 'user_preferences'];
    for (const key of keys) {
      await removeSecureData(key);
    }
    return true;
  } catch (error) {
    console.error('Error clearing secure data:', error);
    return false;
  }
}; 