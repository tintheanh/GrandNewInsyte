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
} from '../constants';
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
    // console.log('bottom');
    return (
      <BottomTab.Navigator
        initialRouteName="Home"
        tabBarOptions={{
          showLabel: false,
          style: {
            backgroundColor: Colors.darkColor,
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
                <TabBarIcon
                  icon={Feather}
                  focused={focused}
                  name="plus-square"
                />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
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
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomTabNavigator);
