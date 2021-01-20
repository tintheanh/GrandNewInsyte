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
import { pullToFetchPublicNewPosts } from '../redux/posts/actions';

import { fsDB } from '../config';

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

const mapStateToProps = (state: any) => {
  return {
    currentUID: state.auth.user?.id,
    userID: state.userStack.homeTabStack.top()?.userID ?? '',
  };
};

const mapDispatchToProps = {
  onPopCommentLayer: popCommentLayer,
  pullToFetchPublicNewPosts: pullToFetchPublicNewPosts,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(function HomeStack(props) {
  const block = async (uid: string) => {
    if (props.currentUID === undefined) return;

    await fsDB.collection('block_list').add({
      blocker: props.currentUID,
      blocked: uid,
    });

    // await fsDB
    //   .collection('block_list')
    //   .doc(props.currentUID)
    //   .collection('block_list')
    //   .doc(uid)
    //   .set({ block: true });
  };

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
        options={({ route, navigation }) => ({
          title: route.params.user.username,
          headerBackTitle: '',
          headerRight: () => {
            return props.currentUID !== undefined ? (
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
                        onPress: async () => {
                          Alert.alert('Blocked!', '', [{ text: 'OK' }], {
                            cancelable: false,
                          });
                          navigation.goBack();
                          await block(props.userID);
                          props.pullToFetchPublicNewPosts();
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
            ) : null;
          },
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
