import React from 'react';
import {
  createStackNavigator,
  HeaderBackButton,
} from '@react-navigation/stack';
import { connect } from 'react-redux';
import { HomeScreen, PostScreen, ReplyScreen, UserScreen } from '../screens';
import { Colors } from '../constants';
import { popPostLayer } from '../redux/postComments/actions';

const Stack = createStackNavigator();

const mapDispatchToProps = {
  onPopPostLayer: popPostLayer,
};

export default connect(
  null,
  mapDispatchToProps,
)(function HomeStack(props: any) {
  const goBackAndPopPostStack = (goBack: () => void, pop: () => void) => () => {
    goBack();
    pop();
  };

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
        options={({ navigation, route }: any) => ({
          title: route.params.title,
          avatar: route.params.avatar,
          headerLeft: (headerProps) => (
            <HeaderBackButton
              {...headerProps}
              onPress={goBackAndPopPostStack(
                navigation.goBack,
                props.onPopPostLayer,
              )}
            />
          ),
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
});
