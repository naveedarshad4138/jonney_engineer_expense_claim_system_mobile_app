// utils/customFunctions.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';  // npm install buffer

// Base64 encode a string (Unicode safe)
const encodeBase64 = (str) => {
  return Buffer.from(str, 'utf8').toString('base64');
};

// Base64 decode a string (Unicode safe)
export const decodeBase64 = (str) => {
  return Buffer.from(str, 'base64').toString('utf8');
};

// Set token with expiration (expiresIn in seconds)
export const setToken = async (token, expiresIn) => {
  const expiresAt = Date.now() + expiresIn * 1000; // milliseconds
  const payload = JSON.stringify({ token, expiresAt });
  const encoded = encodeBase64(payload);
  try {
    await AsyncStorage.setItem('authToken', encoded);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

// Remove token
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (e) {
    console.error('Failed to remove token', e);
  }
};

// Get token and check if expired (more than 1 hour passed)
export const getToken = async () => {
  try {
    const encoded = await AsyncStorage.getItem('authToken');
    if (!encoded) return null;

    const decoded = decodeBase64(encoded);
    const { token, expiresAt } = JSON.parse(decoded);
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000; // milliseconds

    // Check if token expired more than 1 hour ago
    if (currentTime - expiresAt > oneHour) {
      await removeToken();
      return null;
    }

    return token; // return the actual token (not encoded)
  } catch (e) {
    console.error('Invalid token format or AsyncStorage error:', e);
    await removeToken();
    return null;
  }
};
