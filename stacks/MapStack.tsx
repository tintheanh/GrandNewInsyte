import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MapScreen, PlaceScreen } from '../screens';
import { Colors } from '../constants';

const Stack = createStackNavigator();

export default function MapStack() {
  return (
    <Stack.Navigator
      initialRouteName="MapScreen"
      screenOptions={{
        title: 'Map',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlaceScreen"
        component={PlaceScreen}
        initialParams={{ currentTabScreen: 'placeTabStack' }}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
