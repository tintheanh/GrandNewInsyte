import React from 'react';
import {
  createStackNavigator,
  HeaderBackButton,
} from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
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
  // const navigation = useNavigation();
  // React.useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', (e) => {
  //     // Prevent default behavior
  //     e.preventDefault();
  //     console.log('home');
  //     // Do something manually
  //     // ...
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  // const goBackAndPopPostStack = (goBack: () => void, pop: () => void) => () => {
  //   goBack();
  //   pop();
  // };

  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
        // gestureEnabled: false,
      }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerTitle: 'Home' }}
      />
      <Stack.Screen
        name="PostScreen"
        component={PostScreen}
        options={({ route }: any) => ({
          title: route.params.title,
          avatar: route.params.avatar,
          // headerLeft: (headerProps) => (
          //   <HeaderBackButton
          //     {...headerProps}
          //     onPress={goBackAndPopPostStack(
          //       navigation.goBack,
          //       props.onPopPostLayer,
          //     )}
          //   />
          // ),
        })}
      />
      <Stack.Screen
        name="ReplyScreen"
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
