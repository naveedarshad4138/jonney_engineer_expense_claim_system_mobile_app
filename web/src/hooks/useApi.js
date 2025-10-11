import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, setToken, removeToken } from '../utils/customFunctions'; // Adjust the import path as necessary
const useApi = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get the base URL from environment variables or use a fallback
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';




  // Function to show alerts
  const showAlert = (message, type = 'info') => {
    setStatus({
      message,
      type,
    });
  };

  // Create an Axios instance with default headers
  const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add a request interceptor to include the token in headers
  apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  });

  // Add a response interceptor to handle token expiration
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token is expired or invalid
        removeToken(); // Clear the token
        navigate('/login'); // Redirect to the login page
        showAlert('Your session has expired. Please log in again.', 'error');
      }
      return Promise.reject(error);
    }
  );

  // Fetch data
  const fetchData = async (endpoint, successMessage = 'Data fetched successfully!', errorMessage = 'Failed to fetch data!') => {
    setLoading(true);
    try {
      const response = await apiClient.get(endpoint);
      // console.log(response)
      setData(response.data);
      // showAlert(response.data.message || successMessage, true);
      return response.data;
    } catch (err) {
      console.log(err.response.data);
      setError(err.response.data.message || err.message);
      showAlert(err.response.data.message, false);
    } finally {
      setLoading(false);
    }
  };

  // Create data
  // const postData = async (endpoint, newData, successMessage = 'Data created successfully!', errorMessage = 'Failed to create data!') => {
  //   setLoading(true);
  //   if(newData?.password && newData?.cpassword && newData?.password !== newData?.cpassword) {
  //     showAlert('Passwords do not match!', 'danger');
  //     setLoading(false);
  //     return;
  //   }
  //   try {
  //     const response = await apiClient.post(endpoint, newData);
  //     setData(response.data);
  //     showAlert(response.data.message || successMessage, true);
  //     return response.data;
  //   } catch (err) {
  //     console.log(err.response.data);
  //     setError(err.response.data.message || err.message);
  //     showAlert(err.response.data.message, false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const postData = async (
  endpoint,
  newData,
  successMessage = 'Data created successfully!',
  errorMessage = 'Failed to create data!',
  isMultipart = false
) => {
  setLoading(true);

  // Axios config
  const config = {
    headers: {},
  };

  if (isMultipart) {
    // Let browser set the Content-Type for FormData
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  try {
    const response = await apiClient.post(endpoint, newData, config);
    setData(response.data);
    showAlert(response.data.message || successMessage, true);
    return response.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    setError(err.response?.data?.message || err.message);
    showAlert(err.response?.data?.message || errorMessage, false);
  } finally {
    setLoading(false);
  }
};


  // Update data
  const updateData = async (endpoint, updatedData, successMessage = 'Data updated successfully!', errorMessage = 'Failed to update data!') => {
    setLoading(true);
    try {
      const response = await apiClient.put(endpoint, updatedData);
      setData(response.data);
      showAlert(successMessage, true);
    } catch (err) {
      setError(err.message);
      showAlert(errorMessage, false);
    } finally {
      setLoading(false);
    }
  };

  // Delete data
  const deleteData = async (endpoint, successMessage = 'Data deleted successfully!', errorMessage = 'Failed to delete data!') => {
    setLoading(true);
    try {
      const response = await apiClient.delete(endpoint);
      setData(response.data);
      showAlert(successMessage, 'success');
    } catch (err) {
      setError(err.message);
      showAlert(errorMessage, 'error');
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