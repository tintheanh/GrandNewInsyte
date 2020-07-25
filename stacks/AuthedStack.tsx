import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { connect } from 'react-redux';
import { Text } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons, Colors, Layout } from '../constants';
import { UserSettingScreen } from '../screens';
import ProfileStack from './ProfileStack';
import { signout } from '../redux/auth/actions';
import { clear } from '../redux/posts/actions';
import { delay } from '../utils/functions';

const Drawer = createDrawerNavigator();

interface AuthedStackProps {
  onSignOut: () => void;
  onClearPosts: () => void;
}

const CustomDrawerContent = (props: AuthedStackProps, navigation: any) => {
  const performSignOut = async () => {
    navigation.closeDrawer();
    // console.log(navigation.dangerouslyGetParent());
    await delay(500);
    navigation.dangerouslyGetParent().dispatch(
      CommonActions.navigate({
        name: 'HomeScreen',
      }),
    );
    props.onSignOut();
    props.onClearPosts();
  };
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        icon={() => <Ionicons name="ios-settings" size={16} color="white" />}
        label={() => (
          <Text
            style={{
              color: 'white',
              position: 'relative',
              right: 22,
            }}>
            Settings
          </Text>
        )}
        onPress={() => navigation.navigate('UserSetting')}
      />
      <DrawerItem
        label={() => (
          <Text
            style={{
              color: 'white',
            }}>
            Sign out
          </Text>
        )}
        onPress={performSignOut}
      />
    </DrawerContentScrollView>
  );
};

const mapDispatchToProps = {
  onSignOut: signout,
  onClearPosts: clear,
};

function AuthedStack(props: AuthedStackProps) {
  return (
    <Drawer.Navigator
      initialRouteName="ProfileStack"
      drawerPosition="right"
      drawerContent={({ navigation }) => CustomDrawerContent(props, navigation)}
      drawerStyle={{
        backgroundColor: Colors.darkColor,
        width: Layout.window.width / 2,
      }}>
      <Drawer.Screen name="ProfileStack" component={ProfileStack} />
      <Drawer.Screen name="UserSetting" component={UserSettingScreen} />
    </Drawer.Navigator>
  );
}

export default connect(null, mapDispatchToProps)(AuthedStack);
