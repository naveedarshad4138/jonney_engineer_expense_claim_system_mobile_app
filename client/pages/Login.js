import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert as RNAlert,
} from 'react-native';
import useApi from '../hooks/useApi';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { jwtDecode } from 'jwt-decode';


export const Login = ({ setUserData }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { postData, setToken, status, loading } = useApi();
    const navigation = useNavigation();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        const loginData = { email, password };

        const response = await postData(
            'auth/login',
            loginData,
            'Login successful!',
            'Email or Password invalid!'
        );
        if (response && response.token) {
            await setToken(response.token, response.expiresIn);
            // const decoded = response.token;
            const decoded = jwtDecode(response.token);
            const payload = decoded?.user;

            if (payload) {
                setUserData({
                    username: payload.username || '',
                    role: payload.role || '',
                });
                navigation.navigate('Dashboard');
            }
            Toast.show({
                type: 'success',
                text1: 'Login Successful',
            });
        } else if (status?.message) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: status.message,
            });
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#7C3AED' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* <View style={styles.leftPanel}>
          <Text style={styles.logo}>Hello, Steddy</Text>
          <Text style={styles.tagline}>
            Streamline deal submission and underwriting with Steddy’s powerful AI
          </Text>
          <View style={styles.features}>
            {[
              'AI based underwriting and background',
              'Quick and reliable information at your fingertips',
              'AI Deep search and discovery',
              'Steady funds, Steady growth, always',
            ].map((item, idx) => (
              <Text key={idx} style={styles.featureItem}>
                ✓ {item}
              </Text>
            ))}
          </View>
        </View> */}

                <View style={styles.rightPanel}>
                    <Text style={styles.headerTitle}>Welcome Back</Text>
                    <Text style={styles.headerSubtitle}>Sign in to access your dashboard</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your business email"
                            placeholderTextColor="#888"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#888"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading} Steddy
                            />
                            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggle}>
                                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')} style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginBtnText}>{loading ? 'Processing...' : 'Login'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>
                            Don't have an account? Sign Up
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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

    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },

    forgotPasswordText: {
        color: '#7C3AED',
        fontWeight: '500',
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
