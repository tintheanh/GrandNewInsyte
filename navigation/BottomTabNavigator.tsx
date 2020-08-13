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
import {
  setCurrentTabForCommentStack,
  clearCommentStack,
} from '../redux/comment_stack/actions';
import {
  setCurrentTabForReplyStack,
  clearReplyStack,
} from '../redux/reply_stack/actions';
import {
  setCurrentTabForUserStack,
  clearUserStack,
} from '../redux/user_stack/actions';
import { AppState } from '../redux/store';
import { checkAuth } from '../redux/auth/actions';
import { delay } from '../utils/functions';
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
    const {
      onClearCommentStack,
      onClearReplyStack,
      onClearUserStack,
    } = this.props;

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
          // listeners={{
          //   tabPress: (e) => {
          //     this.props.onSetCurrentTabForCommentStack('homeTabStack');
          //     // this.props.onSetCurrentTabForReplyStack('homeTabStack');
          //     // this.props.onSetCurrentTabForUserStack('homeTabStack');
          //   },
          // }}

          listeners={({ route }) => ({
            tabPress: (e) => {
              this.props.onSetCurrentTabForCommentStack('homeTabStack');
            },
            state: (_) => {
              if (route.state && route.state.index === 0) {
                console.log('ok clear');
                onClearCommentStack();
                onClearReplyStack();
                onClearUserStack();
              }
            },
          })}
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
              this.props.onSetCurrentTabForCommentStack('userTabStack');
              // this.props.onSetCurrentTabForReplyStack('userTabStack');
              // this.props.onSetCurrentTabForUserStack('userTabStack');
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
  onSetCurrentTabForCommentStack: setCurrentTabForCommentStack,
  onSetCurrentTabForReplyStack: setCurrentTabForReplyStack,
  onSetCurrentTabForUserStack: setCurrentTabForUserStack,
  onClearCommentStack: clearCommentStack,
  onClearReplyStack: clearReplyStack,
  onClearUserStack: clearUserStack,
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomTabNavigator);
