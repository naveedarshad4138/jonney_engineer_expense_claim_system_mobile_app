import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getToken, removeToken } from '../utils/customFunctions';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2; // two columns with margin

const dashboardItems = [
  { id: '1', title: 'Profile', icon: 'account-circle', screen: 'Profile' },
  { id: '2', title: 'Change Password', icon: 'lock', screen: 'Settings' },
//   { id: '3', title: 'Messages', icon: 'message-text', screen: 'Messages', badge: 3 },
//   { id: '4', title: 'Notifications', icon: 'bell', screen: 'Notifications', badge: 7 },
//   { id: '5', title: 'Analytics', icon: 'chart-line', screen: 'Analytics' },
  { id: '6', title: 'Logout', icon: 'logout', screen: 'Logout' },
];

export const Dashboard = ({ user }) => {
  const navigation = useNavigation();
    
  
    useEffect(() => {
      const checkToken = async () => {
        try {
          const token = await getToken();
          if (token==null) {
              navigate.navigate('Login');
          }
        } catch (err) {
          console.error('Token check error:', err);
          navigate.navigate('Login');
        }
      };
  
      checkToken();
    }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={async () => {
    if (item.screen === 'Logout') {
      // Clear token from AsyncStorage
      await removeToken();

      // Show toast
      Toast.show({
        type: 'success',
        text1: 'Logout Successful',
      });
      // Reset navigation stack to Login
      navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
    } else {
      navigation.navigate(item.screen);
    }
  }}
  style={styles.card}
  activeOpacity={0.7}

    >
      <View style={styles.iconWrapper}>
        <Icon name={item.icon} size={40} color="#7C3AED" />
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );



  return (
    <View style={styles.container}>
      {/* User Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back{user ? `, ${user.username}` : ''}!</Text>
          <Text style={styles.subGreeting}>Here's your dashboard</Text>
        </View>
        {/* <Image
          source={{ uri: user?.avatar || 'https://i.pravatar.cc/100' }}
          style={styles.avatar}
        /> */}
      </View>

      {/* Dashboard Grid */}
      <FlatList
  data={dashboardItems}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  numColumns={2}        // or any dynamic value
  key={`numColumns-${2}`}  // Use the numColumns value here to force re-render
  contentContainerStyle={styles.list}
  columnWrapperStyle={styles.row}
  showsVerticalScrollIndicator={false}
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9fb',
  },
  header: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b3b3b',
  },
  subGreeting: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  list: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    textAlign:'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    textAlign:'center',
    fontWeight: '600',
    color: '#4b4b4b',
  },
});
