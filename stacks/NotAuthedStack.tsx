import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SignInScreen, SignUpScreen } from '../screens';
import { Colors } from '../constants';

/**
 * Type checking for each screen in NotAuthedStack
 * 'undefined' means the screen needs no params
 */
export type NotAuthedStackParamList = {
  SignInScreen: undefined;
  SignUpScreen: undefined;
};

const Stack = createStackNavigator<NotAuthedStackParamList>();

export default function NotAuthedStack() {
  return (
    <Stack.Navigator
      initialRouteName="SignInScreen"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="SignInScreen"
        component={SignInScreen}
        options={{ headerTitle: 'Sign In' }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{ headerTitle: 'Sign Up' }}
      />
    </Stack.Navigator>
  );
}
