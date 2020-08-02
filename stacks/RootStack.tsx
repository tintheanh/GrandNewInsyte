import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { Loading } from '../components';
import { checkAuth } from '../redux/auth/actions';
import { AppState } from '../redux/store';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import CreatePostStack from './CreatePostStack';

const Stack = createStackNavigator();

interface RootStackProps {
  loading: boolean;

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
    if (this.props.loading) {
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
  loading: state.auth.loadings.checkAuthLoading,
});

const mapDispatchToProps = {
  onCheckAuth: checkAuth,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootStack);
