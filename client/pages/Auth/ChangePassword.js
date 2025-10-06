import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import useApi from '../../hooks/useApi';
import {removeToken} from '../../utils/customFunctions';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
export const ChangePassword = () => {
  const [crpassword, setCrPassword] = useState('');
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

  const { updateData, loading } = useApi();
  const navigation = useNavigation();

  const isFormValid = () =>
    Object.values(requirements).every(Boolean) && password === cpassword;

  const handlePasswordUpdate = async () => {
    const data = {
      currentPassword: crpassword,
      newPassword: password,
    };
        let results = await updateData(
            'auth/user/password/update',
        data
    );
        if(results?.status==200){
            removeToken();
            setCrPassword('');
            setPassword('');
            setCPassword('');
            navigation.navigate('Login');
        }
    
  };

  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  }, [password]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
       {/* Back to Home Button */}
      <TouchableOpacity
  style={styles.backButton}
  onPress={() => navigation.goBack()} // or navigation.navigate('Dashboard') if you want to go to a specific screen
>
  <Icon name="arrow-left" size={28} color="#333" />
</TouchableOpacity>
      <Text style={styles.title}>Reset Your Password</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
          placeholderTextColor="#999"
            style={styles.input}
            value={crpassword}
            onChangeText={setCrPassword}
            secureTextEntry={!showPassword}
            placeholder="Enter current password"
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Text style={styles.toggle}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
          placeholderTextColor="#999"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Enter new password"
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Text style={styles.toggle}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.requirements}>
          <Text style={getReqStyle(requirements.length)}>• At least 8 characters</Text>
          <Text style={getReqStyle(requirements.uppercase)}>• One uppercase letter</Text>
          <Text style={getReqStyle(requirements.lowercase)}>• One lowercase letter</Text>
          <Text style={getReqStyle(requirements.number)}>• One number</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
          placeholderTextColor="#999"
            style={styles.input}
            value={cpassword}
            onChangeText={setCPassword}
            secureTextEntry={!showCPassword}
            placeholder="Confirm new password"
          />
          <TouchableOpacity onPress={() => setShowCPassword((prev) => !prev)}>
            <Text style={styles.toggle}>{showCPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        {cpassword.length > 0 && password !== cpassword && (
          <Text style={styles.error}>Passwords do not match</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handlePasswordUpdate}
        disabled={!isFormValid() || loading}
        style={[styles.button, (!isFormValid() || loading) && styles.buttonDisabled]}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const getReqStyle = (valid) => ({
  color: valid ? 'green' : '#aaa',
  marginVertical: 2,
  fontSize: 13,
});

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop:20,
    paddingBottom: 50
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3b3b3b',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    
  },
  input: {
    flex: 1,
    height: 45,
    color: '#000',
   
  },
  toggle: {
    fontSize: 18,
    padding: 6,
  },
  requirements: {
    marginTop: 6,
    paddingLeft: 6,
  },
  error: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
