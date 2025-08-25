import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';

import { decodeBase64, getToken } from './utils/customFunctions';
import { Login } from './pages/Auth/Login';
import { ForgetPassword } from './pages/Auth/ForgetPassword';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard';
import { AddExpenseClaim } from './pages/Claims/AddExpenseClaim';
import { AllExpenseClaimsList } from './pages/Claims/AllExpenseClaimsList';
import { ChangePassword } from './pages/Auth/ChangePassword';

import { navigationRef, navigate } from './components/navigationRef'; // ✅ Import navigation ref and helper
import { ResetPassword } from './pages/Auth/ResetPassword';
import useApi from './hooks/useApi';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const gToken = await getToken();
        if (gToken) {
          let decoded = JSON.parse(decodeBase64(gToken));
          decoded = jwtDecode(decoded?.token);
          const payload = decoded?.user;

          if (payload) {
            console.log(payload)
            setUserData(payload);
            setInitialRoute('Dashboard');
            navigate('Dashboard'); // ✅ Navigate to Dashboard
          } else {
            setInitialRoute('Login');
            navigate('Login'); // fallback
          }
        } else {
          setInitialRoute('Login');
          navigate('Login');
        }
      } catch (err) {
        console.log('Token check error:', err);
        setInitialRoute('Login');
        navigate('Login');
      }
    };

    checkToken();
  }, []);

      // const { fetchData, loading, status } = useApi();
      //   useEffect(() => {
      //     const checkToken = async () => {
      //       try {
      //         const user = await fetchData('auth/user');
      //         setUserData(user?.results || null);
      //          setInitialRoute('Dashboard');
      //         navigate('Dashboard'); // ✅ Navigate to Dashboard
              
      //       } catch (err) {
      //         console.log(err)
      //         console.log('Session expired! Please log in again.');
      //         // navigate('Login');
      //         setInitialRoute('Login');
      //         navigate('Login'); // ✅ Navigate to Dashboard
      //       }
      //     };
      
      //     checkToken();
      //   }, []);

  if (!initialRoute) return null;

  return (
    <>
      <NavigationContainer ref={navigationRef}> {/* ✅ Attach ref */}
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="Login" children={(props) => <Login {...props} setUserData={setUserData} setInitialRoute={setInitialRoute}/>} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Dashboard" children={(props) => <Dashboard {...props} user={userData} setUserData={setUserData} />} />
          <Stack.Screen name="AddExpenseClaim" component={AddExpenseClaim} />
          <Stack.Screen name="AllExpenseClaimsList" component={AllExpenseClaimsList} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast position="top" topOffset={50} />
    </>
  );
}
