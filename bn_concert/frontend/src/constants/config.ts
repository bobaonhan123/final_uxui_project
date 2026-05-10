import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};
const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? 'http://localhost:8000/api';

const getExpoHost = () => {
  const constants = Constants as typeof Constants & {
    manifest?: { debuggerHost?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };
  const hostUri =
    Constants.expoConfig?.hostUri ??
    constants.manifest?.debuggerHost ??
    constants.manifest2?.extra?.expoClient?.hostUri;

  return typeof hostUri === 'string' ? hostUri.split(':')[0] : null;
};

const normalizeApiUrl = (apiUrl: string) => {
  if (Platform.OS === 'web') {
    return apiUrl;
  }

  const expoHost = getExpoHost();
  if (!expoHost) {
    return apiUrl;
  }

  return apiUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1)(?=:)/, `http://${expoHost}`);
};

export const API_URL = normalizeApiUrl(configuredApiUrl);
