import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import { FontAwesome5, Colors } from '../constants';
import { ProfileScreen, PostScreen, ReplyScreen, UserScreen } from '../screens';
import { AppState } from '../redux/store';
import { Post, CurrentTabScreen } from '../models';

export type ProfileStackParamList = {
  ProfileScreen: {
    title: string;
  };
  PostScreen: { post: Post; currentTabScreen: CurrentTabScreen };
  ReplyScreen: { currentTabScreen: CurrentTabScreen };
  UserScreen: {
    user: {
      id: string;
      username: string;
      avatar: string;
    };
    currentTabScreen: CurrentTabScreen;
  };
};

const Stack = createStackNavigator<ProfileStackParamList>();

function ProfileStack({ username }: { username: string }) {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: username,
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <FontAwesome5 name="bars" color="white" size={20} />
            </TouchableOpacity>
          ),
          headerRightContainerStyle: { paddingRight: 12 },
        })}
      />
      <Stack.Screen
        name="PostScreen"
        component={PostScreen}
        initialParams={{ currentTabScreen: 'userTabStack' }}
        options={({ route }) => {
          return {
            title: `${route.params.post.user.username}'s post`,
          };
        }}
      />
      <Stack.Screen
        name="ReplyScreen"
        component={ReplyScreen}
        initialParams={{ currentTabScreen: 'userTabStack' }}
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="UserScreen"
        component={UserScreen}
        initialParams={{ currentTabScreen: 'userTabStack' }}
        options={({ route }) => ({
          title: route.params.user.username,
          headerBackTitle: '',
        })}
      />
    </Stack.Navigator>
  );
}

const mapStateToProps = (state: AppState) => ({
  username: state.auth.user?.username,
});

export default connect(mapStateToProps, null)(ProfileStack);
