import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { SignInScreen, SignUpScreen } from '../screens';
import { Colors } from '../constants';

const Stack = createStackNavigator();

export default function NotAuthedStack() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerTitle: 'Sign In' }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerTitle: 'Sign Up' }}
      />
    </Stack.Navigator>
  );
}
