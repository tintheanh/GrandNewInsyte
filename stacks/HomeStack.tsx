import React from 'react';
import {
  createStackNavigator,
  HeaderBackButton,
} from '@react-navigation/stack';
import { connect } from 'react-redux';
import {
  HomeScreen,
  PostScreen,
  ReplyScreen,
  UserScreen,
  ProfileScreen,
} from '../screens';
import { Colors } from '../constants';
import SearchBar from '../screens/HomeScreen/private_components/SearchBar';
import { popCommentsLayer } from '../redux/commentsStack/actions';

const Stack = createStackNavigator();

const mapDispatchToProps = {
  onPopCommentsLayer: popCommentsLayer,
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
        options={{
          headerTitle: (props) => <SearchBar {...props} />,
          title: 'Home',
        }}
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
          //       props.onPopCommentsLayer,
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
        name="UserScreen"
        component={UserScreen}
        options={({ route }: any) => ({
          title: route.params.title,
          headerBackTitle: '',
        })}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={({ route }: any) => ({
          title: route.params.title,
        })}
      />
    </Stack.Navigator>
  );
});
