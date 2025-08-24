import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import useApi from '../../hooks/useApi';

export const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const { loading, postData, status } = useApi();

  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [password]);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') setShowPassword((prev) => !prev);
    else setShowCPassword((prev) => !prev);
  };

  const isFormValid = () =>
    otp.length > 0 &&
    password === cpassword &&
    Object.values(requirements).every(Boolean);

  const handleResetPassword = async () => {
    const response = await postData(
      'auth/verify-otp',
      { email, otp, password, cpassword },
      'Password reset successfully!',
      'Invalid or expired OTP!'
    );

    if (response?.status === 200) {
      navigation.navigate('Login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>Set Your Password</Text>
        <Text style={styles.subtitle}>
          Create a secure password for your account
        </Text>

        <Text style={styles.userInfo}>Resetting password for: {email}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordField}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter new password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => togglePasswordVisibility('password')}>
              <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Password requirements */}
          <View style={styles.requirements}>
            <Text style={[styles.requirement, requirements.length && styles.valid]}>
              • At least 8 characters
            </Text>
            <Text style={[styles.requirement, requirements.uppercase && styles.valid]}>
              • One uppercase letter
            </Text>
            <Text style={[styles.requirement, requirements.lowercase && styles.valid]}>
              • One lowercase letter
            </Text>
            <Text style={[styles.requirement, requirements.number && styles.valid]}>
              • One number
            </Text>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordField}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm new password"
              secureTextEntry={!showCPassword}
              value={cpassword}
              onChangeText={setCPassword}
            />
            <TouchableOpacity onPress={() => togglePasswordVisibility('confirm')}>
              <Text style={styles.eye}>{showCPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {cpassword && password !== cpassword && (
            <Text style={styles.error}>Passwords do not match</Text>
          )}

          {status?.message && (
            <Text style={[styles.error, !status.type && { color: 'red' }]}>
              {status.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !isFormValid() && styles.disabled]}
          onPress={handleResetPassword}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Set Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: 20 }}
        >
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#7C3AED',
    padding: 20,
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
  },
  userInfo: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 30,
    color: '#374151',
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    border: 'none',
    borderColor: '#E5E7EB',
     shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  passwordField: {
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
  eye: {
    fontSize: 18,
    position: 'absolute',
    right: 10,
    top: -12,
  },
  requirements: {
    marginTop: 10,
  },
  requirement: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  valid: {
    color: '#10B981',
  },
  error: {
    fontSize: 13,
    color: 'red',
    marginTop: 5,
  },
  submitBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkText: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 14,
  },
});
