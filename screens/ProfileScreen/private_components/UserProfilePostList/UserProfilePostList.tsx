import React, { Component } from 'react';
import { Animated, FlatList, Alert, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../../../stacks/ProfileStack';
import { setCurrentUserListPostIndex } from '../../../../redux/curent_viewable_item/actions';
import {
  fetchOwnPosts,
  pullToFetchOwnPosts,
  deletePost,
  likePost,
  unlikePost,
} from '../../../../redux/posts/actions';
import {
  ErrorView,
  NothingView,
  Loading,
  ProfilePostList,
  FooterLoading,
} from '../../../../components';
import {
  decreaseTotalPostsByOne,
  refreshProfile,
} from '../../../../redux/auth/actions';
import { pushUserLayer } from '../../../../redux/user_stack/actions';
import { pushCommentLayer } from '../../../../redux/comment_stack/actions';
import UserProfilePostCardWrapper from '../UserProfilePostCardWrapper';
import { Colors, Layout } from '../../../../constants';
import { AppState } from '../../../../redux/store';
import { Post } from '../../../../models';

type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'ProfileScreen'
>;

interface UserProfilePostListProps {
  navigation: ProfileScreenNavigationProp;

  /**
   * Posts fetched from database
   */
  posts: Array<Post>;

  /**
   * Current focused tab screen index
   */
  currentTabIndex: number;

  error: Error | null;

  /**
   * Boolean loading props when
   * first fetch posts
   */
  fetchLoading: boolean;

  /**
   * Boolean loading props when
   * pull to refresh list
   */
  pullLoading: boolean;

  /**
   * Required props value for vertical animation
   */
  scrollY: Animated.Value;

  /**
   * Required props for setting contentContainerStyle
   */
  headerHeight: number;

  /**
   * Required props for setting contentContainerStyle
   */
  tabBarHeight: number;

  /**
   * Required method get reference of the list.
   * Used in animation
   */
  onGetRef: (ref: FlatList<any>) => void;

  /**
   * Required method detect when the list starting to move.
   * Used in animation
   */
  onMomentumScrollBegin: () => void;

  /**
   * Required method synchronize list's movement with
   * the header
   */
  onScrollEndDrag: () => void;

  /**
   * Required method detect when the list stop moving.
   * Used in animation
   */
  onMomentumScrollEnd: () => void;

  /**
   * Method scroll the list to top with the header
   */
  onScrollToTop: () => void;

  /**
   * Method set current scrolling index
   * Can't use local state because it'll
   * affect the list
   * @param index
   */
  onSetCurrentViewableIndex: (index: number) => void;

  /**
   * Method fetch user posts
   */
  onFetchOwnPosts: () => void;

  /**
   * Method pull down list to refresh the list
   */
  onPullToFetchOwnPosts: () => void;

  /**
   * Method delete a post
   * @param postID Post's ID to delete
   */
  onDeletePost: (postID: string) => void;

  /**
   * Method decrease total posts of current user
   * when successfully delete a post
   */
  onDecreaseTotalPostsByOne: () => void;

  /**
   * Method like a post
   * @param postID Post's ID to like
   */
  onLikePost: (postID: string) => void;

  /**
   * Method like a post
   * @param postID Post's ID to like
   */
  onUnlikePost: (postID: string) => void;

  /**
   * Method refresh profile when pulling down list
   */
  onRefreshProfile: () => void;

  /**
   * Method push a new comments layer when
   * navigate to post screen
   * @param postID Each comments layer is a post screen
   * using postID to identify from other layers
   */
  onPushCommentLayer: (postID: string) => void;

  /**
   * Method push a new user layer when
   * navigate to user screen
   * @param user Preloaded user passed to user screen
   */
  onPushUserLayer: (user: {
    userID: string;
    username: string;
    avatar: string;
  }) => void;
}

class UserProfilePostList extends Component<UserProfilePostListProps> {
  /**
   * Configuration object for list scrolling
   */
  private viewabilityConfig: {};
  constructor(props: UserProfilePostListProps) {
    super(props);
    this.viewabilityConfig = {
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
  }

  // shouldComponentUpdate(nextProps: UserProfilePostListProps) {
  //   const { currentTabIndex, fetchLoading, pullLoading, error } = this.props;

  //   if (currentTabIndex !== nextProps.currentTabIndex) {
  //     return true;
  //   }
  //   if (fetchLoading !== nextProps.fetchLoading) {
  //     return true;
  //   }
  //   if (pullLoading !== nextProps.pullLoading) {
  //     return true;
  //   }
  //   if (error !== nextProps.error) {
  //     return true;
  //   }
  //   return false;
  // }

  componentDidMount() {
    this.props.onFetchOwnPosts();
  }

  /**
   * Method navigate to post screen
   * @param data Post data used to push new
   * comments layer and pass to post screen
   */
  navigateToPostScreen = (data: Post) => () => {
    const { navigation, onPushCommentLayer } = this.props;
    onPushCommentLayer(data.id);
    navigation.push('PostScreen', { post: data });
  };

  /**
   * Method navigate when pressing on user's tag
   * @param user Preloaded user passed to new screen
   */
  navigateWhenPressOnTag = (user: {
    id: string;
    username: string;
    avatar: string;
  }) => () => {
    const { navigation, onPushUserLayer } = this.props;
    onPushUserLayer({
      userID: user.id,
      username: user.username,
      avatar: user.avatar,
    });
    navigation.push('UserScreen', { user });
  };

  /**
   * Method set current scrolling index
   * @param viewableItems Array of items thich are
   * currently visible on the screen
   */
  onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: Array<{
      index: number;
      item: Post;
      key: string;
    }>;
  }) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
      this.props.onSetCurrentViewableIndex(viewableItems[0].index);
    }
  };

  /**
   * Method perform delete post
   */
  performDeletePost = (postID: string) => () => {
    const { onDecreaseTotalPostsByOne, onDeletePost } = this.props;
    onDeletePost(postID);
    onDecreaseTotalPostsByOne();
  };

  /**
   * Method prompt to delete post
   */
  userControl = (postID: string) => () => {
    console.log('click');
    Alert.alert(
      '',
      'Do you want to delete this post?',
      [
        {
          text: 'Delete',
          onPress: this.performDeletePost(postID),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  /**
   * Method perform like post
   * @param postID post's ID to like
   */
  performLikePost = (postID: string) => () => {
    this.props.onLikePost(postID);
  };

  /**
   * Method perform unlike post
   * @param postID post's ID to unlike
   */
  performUnlikePost = (postID: string) => () => {
    this.props.onUnlikePost(postID);
  };

  /**
   * Method render list item
   * @param item
   * @param index
   */
  renderItem = ({ item, index }: { item: Post; index: number }) => {
    const { navigation, currentTabIndex } = this.props;
    const isTabFocused = currentTabIndex === 0;

    return (
      <UserProfilePostCardWrapper
        index={index}
        data={item}
        addScreenListener={navigation.addListener}
        isTabFocused={isTabFocused}
        performLikePost={this.performLikePost(item.id)}
        performUnlikePost={this.performUnlikePost(item.id)}
        navigateWhenPressOnPostOrComment={this.navigateToPostScreen(item)}
        userPostControl={this.userControl(item.id)}
        navigateWhenPressOnTag={this.navigateWhenPressOnTag}
      />
    );
  };

  performRefresh = () => {
    const { onPullToFetchOwnPosts, onRefreshProfile } = this.props;
    onPullToFetchOwnPosts();
    onRefreshProfile();
  };

  renderEmptyComponent = () => {
    const { error, fetchLoading, posts } = this.props;
    if (error) {
      return (
        <View style={styles.emptyWrapper}>
          <ErrorView errorText={error.message} />
        </View>
      );
    }
    if (fetchLoading && posts.length === 0) {
      return (
        <View style={styles.emptyWrapper}>
          <Loading />
        </View>
      );
    }
    return (
      <View style={styles.emptyWrapper}>
        <NothingView />
      </View>
    );
  };

  render() {
    const {
      scrollY,
      headerHeight,
      tabBarHeight,
      posts,
      fetchLoading,
      error,
      pullLoading,
      currentTabIndex,
      onGetRef,
      onMomentumScrollBegin,
      onScrollEndDrag,
      onMomentumScrollEnd,
      onFetchOwnPosts,
      onScrollToTop,
    } = this.props;

    return (
      <View style={styles.container}>
        <View style={{ zIndex: 100 }}>
          <ProfilePostList
            posts={posts}
            renderItem={this.renderItem}
            onGetRef={onGetRef}
            scrollY={scrollY}
            listEmptyComponent={this.renderEmptyComponent()}
            onMomentumScrollBegin={onMomentumScrollBegin}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            headerHeight={headerHeight}
            tabBarHeight={tabBarHeight}
            onScrollToTop={onScrollToTop}
            onViewableItemsChanged={this.onViewableItemsChanged}
            viewabilityConfig={this.viewabilityConfig}
            listFooterComponent={
              <View style={{ paddingBottom: Layout.window.height / 10 }} />
            }
            onEndReached={onFetchOwnPosts}
            isTabFocused={currentTabIndex === 0}
            refreshing={pullLoading}
            onRefresh={this.performRefresh}
            extraData={{ fetchLoading, error }}
          />
        </View>
        {posts.length > 0 ? (
          <View style={styles.loadingWrapper}>
            <FooterLoading loading={fetchLoading} />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brightColor,
    flex: 1,
  },
  loadingWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrapper: {
    marginTop: 28,
  },
});

const mapStateToProps = (state: AppState) => ({
  posts: state.allPosts.own.posts,
  fetchLoading: state.allPosts.own.fetchLoading,
  pullLoading: state.allPosts.own.pullLoading,
  error: state.allPosts.own.error,
});

const mapDispatchToProps = {
  onSetCurrentViewableIndex: setCurrentUserListPostIndex,
  onFetchOwnPosts: fetchOwnPosts,
  onPullToFetchOwnPosts: pullToFetchOwnPosts,
  onDeletePost: deletePost,
  onDecreaseTotalPostsByOne: decreaseTotalPostsByOne,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
  onRefreshProfile: refreshProfile,
  onPushCommentLayer: pushCommentLayer,
  onPushUserLayer: pushUserLayer,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(function (props: any) {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  return <UserProfilePostList {...props} navigation={navigation} />;
});
