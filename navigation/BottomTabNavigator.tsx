import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
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
import { Colors } from '../constants';
import { CurrentTabScreen } from '../models';

const BottomTab = createBottomTabNavigator();

const ModalPlaceHolder = () => (
  <View style={{ flex: 1, backgroundColor: 'red' }} />
);

class BottomTabNavigator extends Component<any> {
  private isAuthTabPressed = false;

  shouldComponentUpdate(nextProps: any) {
    if (this.props.user !== nextProps.user) {
      return true;
    }
    if (this.props.createPostLoading !== nextProps.createPostLoading) {
      return true;
    }
    return false;
  }

  setCurrentTabScreen = (currentTabScreen: CurrentTabScreen) => {
    const {
      onSetCurrentTabForCommentStack,
      onSetCurrentTabForReplyStack,
      onSetCurrentTabForUserStack,
    } = this.props;
    onSetCurrentTabForCommentStack(currentTabScreen);
    onSetCurrentTabForReplyStack(currentTabScreen);
    onSetCurrentTabForUserStack(currentTabScreen);
  };

  empty = () => {
    return (
      <View>
        <Text>Nothing</Text>
      </View>
    );
  };

  clearAllStacks = () => {
    const {
      onClearCommentStack,
      onClearReplyStack,
      onClearUserStack,
    } = this.props;
    onClearCommentStack();
    onClearReplyStack();
    onClearUserStack();
  };

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
          listeners={({ route }) => ({
            focus: (_) => this.setCurrentTabScreen('homeTabStack'),
            state: (_) => {
              if (route.state && route.state.index === 0) {
                this.clearAllStacks();
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
            component={this.empty}
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
          listeners={({ navigation }) => ({
            focus: (_) => this.setCurrentTabScreen('userTabStack'),
            blur: (_) => {
              this.isAuthTabPressed = false;
            },
            tabPress: (_) => {
              if (!this.isAuthTabPressed) {
                this.isAuthTabPressed = true;
              } else {
                const temp = console.error;
                console.error = () => {};
                navigation.popToTop();
                console.error = temp;
                this.clearAllStacks();
              }
            },
          })}
        />
      </BottomTab.Navigator>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  createPostLoading: state.allPosts.createPost.loading,
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
