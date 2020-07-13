import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen, PostScreen, ReplyScreen, UserScreen } from '../screens';
import { Colors } from '../constants';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: 'Home' }}
      />
      <Stack.Screen
        name="Post"
        component={PostScreen}
        options={({ route }: any) => ({
          title: route.params.title,
          avatar: route.params.avatar,
        })}
      />
      <Stack.Screen
        name="Reply"
        component={ReplyScreen}
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="User"
        component={UserScreen}
        options={({ route }: any) => ({
          title: route.params.title,
          headerBackTitle: '',
        })}
      />
    </Stack.Navigator>
  );
}
