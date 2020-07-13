import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CreatePostScreen } from '../screens';

const Stack = createStackNavigator();

export default function CreatePostStack() {
  return (
    <Stack.Navigator
      initialRouteName="AddPost"
      screenOptions={{
        headerTintColor: 'white',
        headerShown: false,
      }}>
      <Stack.Screen name="AddPost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
}
