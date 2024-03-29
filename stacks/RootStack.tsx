import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Loading } from '../components';
import { checkAuth } from '../redux/auth/actions';
import { AppState } from '../redux/store';
import {
  clearCreatePostError,
  clearDeletePostError,
  clearLikePostError,
  clearUnlikePostError,
} from '../redux/posts/actions';
import {
  decreaseTotalPostsByOne,
  increaseTotalPostsByOne,
} from '../redux/auth/actions';
import { User } from '../models';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import CreatePostStack from './CreatePostStack';
import NotAuthedStack from './NotAuthedStack';
import { alertDialog } from '../utils/functions';

const Stack = createStackNavigator();

interface RootStackProps {
  user: User | null | undefined;

  /**
   * Error from creating post
   */
  createPostError: Error | null;

  /**
   * Error from deleting post
   */
  deletePostError: Error | null;

  /**
   * Error from liking a post
   */
  likePostError: Error | null;

  /**
   * Error from unliking a post
   */
  unlikePostError: Error | null;

  /**
   * Method check if user signed in
   */
  onCheckAuth: () => void;

  /**
   * Method decrease number of posts of current user
   * when failed to create post
   * Used in clearing create post error
   */
  onDecreaseTotalPostsByOne: () => void;

  /**
   * Method increase number of posts of current user
   * when failed to delete post
   * Used in clearing delete post error
   */
  onIncreaseTotalPostsByOne: () => void;

  /**
   * Method clear create post error
   */
  onClearCreatePostError: () => void;

  /**
   * Method clear delete post error
   */
  onClearDeletePostError: () => void;

  /**
   * Method clear like post error
   */
  onClearLikePostError: () => void;

  /**
   * Method clear unlike post error
   */
  onClearUnlikePostError: () => void;
}

class RootStack extends Component<RootStackProps> {
  componentDidMount() {
    this.props.onCheckAuth();
  }

  componentDidUpdate() {
    const {
      createPostError,
      deletePostError,
      likePostError,
      unlikePostError,
      onClearLikePostError,
      onClearUnlikePostError,
    } = this.props;

    if (createPostError) {
      alertDialog(createPostError.message, this.performClearCreatePostError);
    }

    if (deletePostError) {
      alertDialog(deletePostError.message, this.performClearDeletePostError);
    }

    if (likePostError) {
      alertDialog(likePostError.message, onClearLikePostError);
    }

    if (unlikePostError) {
      alertDialog(unlikePostError.message, onClearUnlikePostError);
    }
  }

  /**
   * Method clear create post error
   */
  performClearCreatePostError = () => {
    const { onDecreaseTotalPostsByOne, onClearCreatePostError } = this.props;
    onDecreaseTotalPostsByOne();
    onClearCreatePostError();
  };

  /**
   * Method clear delete post error
   */
  performClearDeletePostError = () => {
    const { onIncreaseTotalPostsByOne, onClearDeletePostError } = this.props;
    onIncreaseTotalPostsByOne();
    onClearDeletePostError();
  };

  render() {
    const { user } = this.props;
    if (user === undefined) {
      return <Loading />;
    } else if (user === null) {
      return (
        <NavigationContainer>
          <StatusBar barStyle="light-content" translucent={true} />
          <Stack.Navigator headerMode="none" mode="modal">
            <Stack.Screen name="Root" component={NotAuthedStack} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    } else {
      return (
        <NavigationContainer>
          <StatusBar barStyle="light-content" translucent={true} />
          <Stack.Navigator headerMode="none" mode="modal">
            <Stack.Screen name="Root" component={BottomTabNavigator} />
            <Stack.Screen name="Add" component={CreatePostStack} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
  }
}

const mapStateToProps = (state: AppState) => ({
  user: state.auth.user,
  createPostError: state.allPosts.createPost.error,
  deletePostError: state.allPosts.deletePost.error,
  likePostError: state.allPosts.likePost.error,
  unlikePostError: state.allPosts.unlikePost.error,
});

const mapDispatchToProps = {
  onCheckAuth: checkAuth,
  onDecreaseTotalPostsByOne: decreaseTotalPostsByOne,
  onIncreaseTotalPostsByOne: increaseTotalPostsByOne,
  onClearCreatePostError: clearCreatePostError,
  onClearDeletePostError: clearDeletePostError,
  onClearLikePostError: clearLikePostError,
  onClearUnlikePostError: clearUnlikePostError,
};

export default connect(mapStateToProps, mapDispatchToProps)(RootStack);
