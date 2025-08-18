import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useApi from '../hooks/useApi';

const { width } = Dimensions.get('window');

export const Register = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');

  const { status, loading, postData, setToken } = useApi();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async () => {
    const registerData = { username, email, password, cpassword };
    const response = await postData('auth/register', registerData, 'Register successful!', 'Register failed!');

    if (response && response.token) {
      setToken(response.token, response.expiresIn);
      navigation.navigate('Dashboard'); // adjust route name as needed
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Right Panel */}
      <View style={styles.rightPanel}>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>Join us to manage your claims seamlessly</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggle}>
              <Text>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              value={cpassword}
              onChangeText={setCPassword}
              placeholder="Confirm password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggle}>
              <Text>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>

        {status?.message && (
          <Text style={[styles.linkText, { color: status.type === 'error' ? 'red' : 'green' }]}>
            {status.message}
          </Text>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login now</Text>
        </TouchableOpacity>
      </View>
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
    minHeight: '100%',
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

  passwordWrapper: {
    position: 'relative',
  },

  passwordToggle: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -12,
    padding: 5,
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


