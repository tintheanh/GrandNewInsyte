import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../constants';
import { NotifScreen } from '../screens';

const Stack = createStackNavigator();

export default function NotifStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="NotifScreen"
        component={NotifScreen}
        options={{
          title: 'Notifications',
        }}
      />
    </Stack.Navigator>
  );
}
