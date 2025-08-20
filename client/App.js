import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {jwtDecode} from 'jwt-decode';
import Toast from 'react-native-toast-message';

import { getToken } from './utils/customFunctions';
import { Login } from './pages/Login';
import { ForgetPassword } from './pages/ForgetPassword';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AddExpenseClaim } from './pages/AddExpenseClaim';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [userData, setUserData] = useState(null);
  

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          const decoded = jwtDecode(token);
          const payload = decoded?.user;

          if (payload) {
            setUserData({
              username: payload.username || '',
              role: payload.role || '',
            });
            setInitialRoute('Dashboard');
          } else {
            setInitialRoute('Login');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (err) {
        console.error('Token check error:', err);
        setInitialRoute('Login');
      }
    };

    checkToken();
  }, []);

  if (!initialRoute) return null;

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ForgetPassword" component={ ForgetPassword } />
          <Stack.Screen name="Login" children={(props) => <Login {...props} setUserData={setUserData}  /> } />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Dashboard" children={(props) => <Dashboard {...props} user={userData} setUserData={setUserData} />} />
          <Stack.Screen name="ExpenseClaimForm" component={AddExpenseClaim} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast position="top" topOffset={50} />
    </>
  );
}
