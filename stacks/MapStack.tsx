import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { MapScreen } from '../screens';
import { Colors } from '../constants';

const Stack = createStackNavigator();

export default function MapStack() {
  return (
    <Stack.Navigator
      initialRouteName="Map"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
