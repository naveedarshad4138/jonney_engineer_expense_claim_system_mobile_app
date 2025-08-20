import React, { useState } from 'react';
import {
    View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';
import useApi from '../hooks/useApi'; // Adjust the path accordingly

export const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const { loading, postData } = useApi();

  const handleSendOtp = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email is required',
      });
      return;
    }

    await postData(
      'auth/send-otp',
      { email },
      'OTP sent successfully!',
      'Failed to send OTP!'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.rightPanel}>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Text style={styles.headerSubtitle}>
          Enter your email to receive a verification code
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your business email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.loginBtn,
            loading ? styles.loginBtnDisabled : null,
          ]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'row',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#7C3AED',
  },

  leftPanel: {
    flex: 1,
    backgroundColor: '#4C1D95',
    padding: 30,
    borderRadius: 20,
    justifyContent: 'center',
    marginRight: 15,
  },

  logo: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 22,
  },

  features: {},

  featureItem: {
    color: '#10B981',
    fontSize: 16,
    marginBottom: 20,
  },

  rightPanel: {
    flex: 1,
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    justifyContent: 'center',
    marginLeft: 15,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 10,
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },

  formGroup: {
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    color: '#000',
  },

  loginBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },

  loginBtnDisabled: {
    opacity: 0.6,
  },

  loginBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },

  linkText: {
    textAlign: 'center',
    color: '#555',
    marginTop: 20,
    fontSize: 14,
  },
});
