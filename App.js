import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import store from './redux/store';
import WelcomeScreen from './components/WelcomeScreen';
import LogInScreen from './components/LogInScreen';
import SignUpScreen from './components/SignUpScreen';
import HomeScreen from './components/HomeScreen';
import FoodDetails from './components/FoodDetails';
import FoodType from './components/FoodType';
import CheckoutScreen from './components/CheckOutScreen';
import OrdersScreen from './components/OrdersScreen';
import ContactScreen from './components/ContactScreen';
import UserScreen from './components/UserScreen';
import OrderDetailsScreen from './components/OrdersDetailScreen';

import 'react-native-get-random-values';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LogIn"
            component={LogInScreen}
            options={{ title: 'Log In' }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: 'Sign Up' }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FoodDetails"
            component={FoodDetails}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FoodType"
            component={FoodType}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CheckOut"
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Orders"
            component={OrdersScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Contact"
            component={ContactScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Users"
            component={UserScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderDetails"
            component={OrderDetailsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
