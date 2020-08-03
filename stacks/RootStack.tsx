import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { Loading } from '../components';
import { checkAuth } from '../redux/auth/actions';
import { AppState } from '../redux/store';
import { User } from '../models';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import CreatePostStack from './CreatePostStack';

const Stack = createStackNavigator();

interface RootStackProps {
  user: User | null | undefined;

  /**
   * Method check if user signed in
   */
  onCheckAuth: () => void;
}

class RootStack extends Component<RootStackProps> {
  componentDidMount() {
    this.props.onCheckAuth();
  }

  render() {
    if (this.props.user === undefined) {
      return <Loading />;
    }
    return (
      <NavigationContainer>
        <Stack.Navigator headerMode="none" mode="modal">
          <Stack.Screen name="Root" component={BottomTabNavigator} />
          <Stack.Screen name="Add" component={CreatePostStack} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  user: state.auth.user,
});

const mapDispatchToProps = {
  onCheckAuth: checkAuth,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootStack);
