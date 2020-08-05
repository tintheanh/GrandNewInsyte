import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { View } from 'react-native';
import {
  FontAwesome,
  FontAwesome5,
  Foundation,
  Feather,
  Ionicons,
  bottomTabHeight,
} from '../constants';
import { setCurrentTabForCommentsStack } from '../redux/commentsStack/actions';
import { setCurrentTabForRepliesStack } from '../redux/repliesStack/actions';
import { setCurrentTabForUsersStack } from '../redux/usersStack/actions';
import { AppState } from '../redux/store';
import { checkAuth } from '../redux/auth/actions';
import TabBarIcon from '../components/TabBarIcon';
import HomeStack from '../stacks/HomeStack';
import AuthScreen from '../screens/AuthScreen';
import MapStack from '../stacks/MapStack';
import Colors from '../constants/Colors';

const BottomTab = createBottomTabNavigator();

const ModalPlaceHolder = () => (
  <View style={{ flex: 1, backgroundColor: 'red' }} />
);

class BottomTabNavigator extends Component<any> {
  shouldComponentUpdate(nextProps: any) {
    if (this.props.user !== nextProps.user) {
      return true;
    }
    return false;
  }

  render() {
    console.log('bottom');
    return (
      <BottomTab.Navigator
        initialRouteName="Home"
        tabBarOptions={{
          showLabel: false,
          style: {
            backgroundColor: Colors.darkColor,
            height: bottomTabHeight,
          },
        }}>
        <BottomTab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon icon={Foundation} focused={focused} name="home" />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              this.props.onSetCurrentTabForCommentsStack('homeTabStack');
              this.props.onSetCurrentTabForRepliesStack('homeTabStack');
              this.props.onSetCurrentTabForUsersStack('homeTabStack');
            },
          }}
        />
        <BottomTab.Screen
          name="Map"
          component={MapStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                icon={FontAwesome5}
                focused={focused}
                name="map-marked-alt"
              />
            ),
          }}
        />
        {this.props.user ? (
          <BottomTab.Screen
            name="AddPost"
            component={ModalPlaceHolder}
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{ opacity: this.props.createPostLoading ? 0.5 : 1 }}>
                  <TabBarIcon
                    icon={Feather}
                    focused={focused}
                    name="plus-square"
                  />
                </View>
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                if (this.props.createPostLoading) {
                  return;
                }
                navigation.navigate('Add', { screen: 'AddPost' });
              },
            })}
          />
        ) : null}
        {this.props.user ? (
          <BottomTab.Screen
            name="Notif"
            component={MapStack}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabBarIcon
                  icon={Ionicons}
                  focused={focused}
                  name="ios-notifications"
                />
              ),
            }}
          />
        ) : null}

        <BottomTab.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon icon={FontAwesome} focused={focused} name="user" />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              this.props.onSetCurrentTabForCommentsStack('userTabStack');
              this.props.onSetCurrentTabForRepliesStack('userTabStack');
              this.props.onSetCurrentTabForUsersStack('userTabStack');
            },
          }}
        />
      </BottomTab.Navigator>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  user: state.auth.user,
});

const mapDispatchToProps = {
  onCheckAuth: checkAuth,
  onSetCurrentTabForCommentsStack: setCurrentTabForCommentsStack,
  onSetCurrentTabForRepliesStack: setCurrentTabForRepliesStack,
  onSetCurrentTabForUsersStack: setCurrentTabForUsersStack,
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomTabNavigator);
