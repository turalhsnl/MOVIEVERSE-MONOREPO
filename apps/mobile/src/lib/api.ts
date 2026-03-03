import Constants from 'expo-constants';export const apiBaseUrl=()=>((Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_API_BASE_URL as string)||'http://localhost:4000';
