import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { TouchableWithoutFeedback, Alert } from 'react-native';
import {
  HomeScreen,
  PostScreen,
  ReplyScreen,
  UserScreen,
  ProfileScreen,
} from '../screens';
import { Colors, MaterialIcons } from '../constants';
import SearchBar from '../screens/HomeScreen/private_components/SearchBar';
import { popCommentLayer } from '../redux/comment_stack/actions';
import { Post, CurrentTabScreen } from '../models';

export type HomeStackParamList = {
  HomeScreen: undefined;
  PostScreen: { post: Post; currentTabScreen: CurrentTabScreen };
  ReplyScreen: { currentTabScreen: CurrentTabScreen };
  UserScreen: {
    user: {
      id: string;
      username: string;
      avatar: string;
    };
    currentTabScreen: CurrentTabScreen;
  };
  ProfileScreen: {
    title: string;
  };
};

const Stack = createStackNavigator<HomeStackParamList>();

const mapDispatchToProps = {
  onPopCommentLayer: popCommentLayer,
};

export default connect(
  null,
  mapDispatchToProps,
)(function HomeStack() {
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
        options={({ navigation }) => ({
          headerTitle: (props) => (
            <SearchBar {...props} navigation={navigation} />
          ),
          title: 'Home',
        })}
      />
      <Stack.Screen
        name="PostScreen"
        component={PostScreen}
        initialParams={{ currentTabScreen: 'homeTabStack' }}
        options={({ route }) => {
          return {
            title: `${route.params.post.user.username}'s post`,
          };
        }}
      />
      <Stack.Screen
        name="ReplyScreen"
        component={ReplyScreen}
        initialParams={{ currentTabScreen: 'homeTabStack' }}
        options={{ headerTitle: '' }}
      />
      <Stack.Screen
        name="UserScreen"
        component={UserScreen}
        initialParams={{ currentTabScreen: 'homeTabStack' }}
        options={({ route }) => ({
          title: route.params.user.username,
          headerBackTitle: '',
          headerRight: () => (
            <TouchableWithoutFeedback
              onPress={() => {
                Alert.alert(
                  'This user contains offended content?',
                  '',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Block this user',
                      onPress: () => {
                        Alert.alert('Block!', '', [{ text: 'OK' }], {
                          cancelable: false,
                        });
                      },
                    },
                    {
                      text: 'Report this user',
                      onPress: () => {
                        Alert.alert('Reported!', '', [{ text: 'OK' }], {
                          cancelable: false,
                        });
                      },
                    },
                  ],
                  { cancelable: true },
                );
              }}>
              <MaterialIcons
                name="report"
                size={20}
                color="white"
                style={{ marginRight: 14 }}
              />
            </TouchableWithoutFeedback>
          ),
        })}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={({ route }) => ({
          title: route.params.title,
        })}
      />
    </Stack.Navigator>
  );
});
