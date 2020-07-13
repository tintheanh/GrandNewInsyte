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

class RootStack extends Component<any> {
  componentDidMount() {
    this.props.onCheckAuth();
  }

  // shouldComponentUpdate(nextProps: any) {
  //   if (!this.props.user && this.props.loading) return false;
  //   if (
  //     nextProps.user !== this.props.user
  //   )
  //     return true;
  //   return false;
  // }

  render() {
    // console.log('root stack');
    if (!this.props.user && this.props.loading) {
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
  loading: state.auth.loading,
});

const mapDispatchToProps = {
  onCheckAuth: checkAuth,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootStack);
