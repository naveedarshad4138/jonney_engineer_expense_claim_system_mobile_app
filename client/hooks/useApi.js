// hooks/useApi.js
import { useState } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { getToken, setToken, removeToken } from '../utils/customFunctions';
import Toast from 'react-native-toast-message';

const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || (
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000'
);
const useApi = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const showAlert = (message, type = 'info') => {
    Toast.show({
    type: type === 'error' ? 'error' : 'success',
    text1: message || 'Something went wrong!',
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 60,
  });
  };

  const apiClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Token injection
  apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  });

  // Token expiration handling
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await removeToken();
        showAlert('Session expired. Please log in again.', 'error');
        navigation.navigate('Login');
      }
      return Promise.reject(error);
    }
  );

  // GET
  const fetchData = async (endpoint, successMessage = 'Fetched!', errorMessage = 'Fetch failed!') => {
    setLoading(true);
    try {
      const response = await apiClient.get(endpoint);
      setData(response.data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || errorMessage;
      setError(msg);
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // POST
  const postData = async (endpoint, newData, successMessage = 'Created!', errorMessage = 'Create failed!', isMultipart = false) => {
    setLoading(true);
    const config = {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
    };
    try {
      const response = await apiClient.post(endpoint, newData, config);
      setData(response.data);
      showAlert(response.data?.message || successMessage, 'info');
      return response.data;
    } catch (err) {
        console.log(err)
      const msg = err.response?.data?.message || errorMessage;
      setError(msg);
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // PUT
  const updateData = async (endpoint, updatedData, successMessage = 'Updated!', errorMessage = 'Update failed!') => {
    setLoading(true);
    try {
      const response = await apiClient.put(endpoint, updatedData);
      setData(response.data);
      showAlert(successMessage, 'info');
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || errorMessage;
      setError(msg);
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const deleteData = async (endpoint, successMessage = 'Deleted!', errorMessage = 'Delete failed!') => {
    setLoading(true);
    try {
      const response = await apiClient.delete(endpoint);
      console.log(response)
      setData(response.data);
      showAlert(response.data?.message || successMessage, 'info');
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || errorMessage;
      setError(msg);
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    status,
    setStatus,
    fetchData,
    postData,
    updateData,
    deleteData,
    setToken,
    removeToken,
  };
};

export default useApi;
