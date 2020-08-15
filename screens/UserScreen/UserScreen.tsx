import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import {
  BigAvatar,
  UserStats,
  UserInfo,
  List,
  FooterLoading,
  ErrorView,
  Loading,
} from '../../components';
import { UserPostCardWrapper } from './private_components';
import { Colors, Layout, MaterialCommunityIcons } from '../../constants';
import { AppState } from '../../redux/store';
import {
  fetchUser,
  popUserLayer,
  setCurrentViewableListIndex,
  fetchMorePostsFromUser,
  followUser,
  unfollowUser,
  clearFollowError,
  clearUnfollowError,
  increaseLikes,
  decreaseLikes,
} from '../../redux/user_stack/actions';
import {
  likePost,
  unlikePost,
  clearLikePostError,
  clearUnlikePostError,
} from '../../redux/posts/actions';
import { pushCommentLayer } from '../../redux/comment_stack/actions';
import {
  increaseFollowingByOne,
  decreaseFollowingByOne,
} from '../../redux/auth/actions';
import {
  delay,
  checkPostListChanged,
  alertDialog,
} from '../../utils/functions';
import { Post, CurrentTabScreen } from '../../models';

interface UserScreenProps {
  navigation: any;

  route: {
    params: {
      user: {
        id: string;
        username: string;
        avatar: string;
      };
      currentTabScreen: CurrentTabScreen;
    };
  };
  isAuthed: boolean;
  name: string;
  bio: string;
  following: number;
  followers: number;
  totalPosts: number;
  isFollowed: boolean;
  fetchError: Error | null;
  followError: Error | null;
  unfollowError: Error | null;
  likePostError: Error | null;
  unlikePostError: Error | null;
  loading: boolean;
  posts: Array<Post>;

  onFetchUser: (userID: string) => void;
  onPopUserLayer: () => void;
  onSetCurrentViewableListIndex: (index: number) => void;
  onFetchMorePostsFromUser: (userID: string, isFollowed: boolean) => void;
  onFollowUser: (followingUserID: string) => void;
  onUnfollowUser: (unfollowingUserID: string) => void;
  onIncreaseFollowingByOneForMyself: () => void;
  onDecreaseFollowingByOneForMyself: () => void;
  onClearFollowError: () => void;
  onClearUnfollowError: () => void;
  onPushCommentLayer: (postID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
  onIncreaseLikes: (postID: string) => void;
  onDecreaseLikes: (postID: string) => void;
  onClearLikePostError: () => void;
  onClearUnlikePostError: () => void;
}

interface UserScreenState {
  likedPostID: string;
  unlikedPostID: string;
}

class UserScreen extends Component<UserScreenProps, UserScreenState> {
  private detectScreenGoBackUnsubscriber: () => void = () => {};
  private viewabilityConfig: {};
  constructor(props: UserScreenProps) {
    super(props);
    this.state = {
      likedPostID: '',
      unlikedPostID: '',
    };
    this.viewabilityConfig = {
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
  }

  shouldComponentUpdate(
    nextProps: UserScreenProps,
    nextState: UserScreenState,
  ) {
    const {
      loading,
      fetchError,
      followError,
      unfollowError,
      likePostError,
      unlikePostError,
      posts,
      followers,
      isFollowed,
    } = this.props;
    const { likedPostID, unlikedPostID } = this.state;
    if (likedPostID !== nextState.likedPostID) {
      return true;
    }
    if (unlikedPostID !== nextState.unlikedPostID) {
      return true;
    }
    if (loading !== nextProps.loading) {
      return true;
    }
    if (isFollowed !== nextProps.isFollowed) {
      return true;
    }
    if (followers !== nextProps.followers) {
      return true;
    }
    if (checkPostListChanged(posts, nextProps.posts)) {
      return true;
    }
    if (fetchError !== nextProps.fetchError) {
      return true;
    }
    if (followError !== nextProps.followError) {
      return true;
    }
    if (unfollowError !== nextProps.unfollowError) {
      return true;
    }
    if (likePostError !== nextProps.likePostError) {
      return true;
    }
    if (unlikePostError !== nextProps.unlikePostError) {
      return true;
    }
    return false;
  }

  async componentDidMount() {
    const { navigation, route, onPopUserLayer, onFetchUser } = this.props;
    this.detectScreenGoBackUnsubscriber = navigation.addListener(
      'beforeRemove',
      () => {
        onPopUserLayer();
      },
    );
    await delay(500);
    onFetchUser(route.params.user.id);
  }

  componentWillUnmount() {
    this.detectScreenGoBackUnsubscriber();
  }

  onViewableItemsChanged = ({ viewableItems, _ }: any) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
      this.props.onSetCurrentViewableListIndex(viewableItems[0].index);
    }
  };

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

  performFetchMorePosts = () => {
    const { route, isFollowed, onFetchMorePostsFromUser } = this.props;
    onFetchMorePostsFromUser(route.params.user.id, isFollowed);
  };

  /**
   * Method perform like post
   * @param postID post's ID to like
   */
  performLikePost = (postID: string) => () => {
    const { onLikePost, onIncreaseLikes } = this.props;
    onLikePost(postID);
    onIncreaseLikes(postID);
    this.setState({ likedPostID: postID });
  };

  /**
   * Method perform unlike post
   * @param postID post's ID to unlike
   */
  performUnlikePost = (postID: string) => () => {
    const { onUnlikePost, onDecreaseLikes } = this.props;
    onUnlikePost(postID);
    onDecreaseLikes(postID);
    this.setState({ unlikedPostID: postID });
  };

  renderItem = ({ item, index }: { item: Post; index: number }) => {
    const { route, navigation } = this.props;
    return (
      <UserPostCardWrapper
        index={index}
        currentTabScreen={route.params.currentTabScreen}
        data={item}
        addScreenListener={navigation.addListener}
        performLikePost={this.performLikePost(item.id)}
        performUnlikePost={this.performUnlikePost(item.id)}
        navigateWhenPressOnPostOrComment={this.navigateToPostScreen(item)}
      />
    );
  };

  performFollow = () => {
    const {
      route,
      onFollowUser,
      onIncreaseFollowingByOneForMyself,
    } = this.props;
    onFollowUser(route.params.user.id);
    onIncreaseFollowingByOneForMyself();
  };

  performUnfollow = () => {
    const {
      route,
      onUnfollowUser,
      onDecreaseFollowingByOneForMyself,
    } = this.props;
    onUnfollowUser(route.params.user.id);
    onDecreaseFollowingByOneForMyself();
  };

  renderUserSection = () => {
    const { user } = this.props.route.params;
    const {
      isAuthed,
      name,
      bio,
      loading,
      posts,
      isFollowed,
      totalPosts,
      followers,
      following,
    } = this.props;

    return (
      <View>
        <View style={styles.header}>
          <View style={styles.avatarAndStats}>
            <BigAvatar avatar={user.avatar} />

            {loading && posts.length === 0 ? (
              <View style={styles.statWrapper}>
                <UserStats postNum={0} followersNum={0} followingNum={0} />
                {isAuthed ? (
                  <TouchableWithoutFeedback disabled>
                    <View
                      style={[
                        styles.followBtn,
                        {
                          backgroundColor: isFollowed
                            ? Colors.brightColor
                            : Colors.btnColor,
                        },
                      ]}>
                      <Text style={styles.followBtnLabel}>Follow</Text>
                    </View>
                  </TouchableWithoutFeedback>
                ) : null}
              </View>
            ) : (
              <View style={styles.statWrapper}>
                <UserStats
                  postNum={totalPosts}
                  followersNum={followers}
                  followingNum={following}
                />
                {isAuthed ? (
                  <TouchableWithoutFeedback
                    onPress={
                      isFollowed ? this.performUnfollow : this.performFollow
                    }>
                    <View
                      style={[
                        styles.followBtn,
                        {
                          backgroundColor: isFollowed
                            ? Colors.brightColor
                            : Colors.btnColor,
                        },
                      ]}>
                      <Text style={styles.followBtnLabel}>
                        {isFollowed ? 'Unfollow' : 'Follow'}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                ) : null}
              </View>
            )}
          </View>
          <UserInfo name={name} bio={bio} />
        </View>
        <View style={styles.divider}>
          <MaterialCommunityIcons
            name="card-text-outline"
            size={20}
            color="white"
          />
        </View>
      </View>
    );
  };

  renderEmptyListComponent = () => {
    const { fetchError, loading, posts } = this.props;
    if (fetchError) {
      return (
        <View style={styles.emptyWrapper}>
          <ErrorView errorText={fetchError.message} />
        </View>
      );
    }
    if (loading && posts.length === 0) {
      return (
        <View style={styles.emptyWrapper}>
          <Loading />
        </View>
      );
    }
    return undefined;
  };

  performClearFollowError = () => {
    const {
      onClearFollowError,
      onDecreaseFollowingByOneForMyself,
    } = this.props;
    onClearFollowError();
    onDecreaseFollowingByOneForMyself();
  };

  performClearUnfollowError = () => {
    const {
      onClearUnfollowError,
      onIncreaseFollowingByOneForMyself,
    } = this.props;
    onClearUnfollowError();
    onIncreaseFollowingByOneForMyself();
  };

  performClearLikePostError = () => {
    const { onClearLikePostError, onDecreaseLikes } = this.props;
    onClearLikePostError();
    onDecreaseLikes(this.state.likedPostID);
    this.setState({ likedPostID: '' });
  };

  performClearUnlikePostError = () => {
    const { onClearUnlikePostError, onIncreaseLikes } = this.props;
    onClearUnlikePostError();
    onIncreaseLikes(this.state.unlikedPostID);
    this.setState({ unlikedPostID: '' });
  };

  componentDidUpdate() {
    if (this.props.likePostError) {
      this.performClearLikePostError();
    }
    if (this.props.unlikePostError) {
      this.performClearUnlikePostError();
    }
  }

  render() {
    const {
      posts,
      loading,
      followers,
      followError,
      unfollowError,
    } = this.props;

    if (followError) {
      alertDialog(followError.message, this.performClearFollowError);
    }

    if (unfollowError) {
      alertDialog(unfollowError.message, this.performClearUnfollowError);
    }

    return (
      <View style={styles.container}>
        <List
          data={posts}
          renderItem={this.renderItem}
          onViewableItemsChanged={this.onViewableItemsChanged}
          onEndReached={this.performFetchMorePosts}
          viewabilityConfig={this.viewabilityConfig}
          listEmptyComponent={this.renderEmptyListComponent()}
          listHeaderComponent={this.renderUserSection()}
          listFooterComponent={
            <View style={{ paddingBottom: Layout.window.height / 10 }} />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          onEndReachedThreshold={0.1}
          checkChangesToUpdate={checkPostListChanged}
          extraData={{ loading, followers }}
        />
        {posts.length > 0 ? (
          <View style={styles.loadingWrapper}>
            <FooterLoading loading={loading} />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brightColor,
  },
  header: {
    width: '100%',
    padding: 12,
    backgroundColor: Colors.darkColor,
  },
  avatarAndStats: {
    width: '100%',
    flexDirection: 'row',
  },
  statWrapper: {
    flexShrink: 1,
    alignItems: 'center',
  },
  followBtn: {
    width: '80%',
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  followBtnLabel: {
    textAlign: 'center',
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  divider: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.darkColor,
    borderBottomColor: Colors.brightColor,
    borderBottomWidth: 2,
    paddingTop: 8,
    paddingBottom: 8,
  },
  emptyWrapper: { paddingTop: 12, paddingBottom: 12 },
  loadingWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -100,
  },
});

const mapStateToProps = (state: AppState, ownProps: UserScreenProps) => {
  const { currentTabScreen } = ownProps.route.params;
  return {
    isAuthed: state.auth.user ? true : false,
    name: state.usersStack[currentTabScreen].top()?.name ?? '',
    bio: state.usersStack[currentTabScreen].top()?.bio ?? '',
    following: state.usersStack[currentTabScreen].top()?.following ?? 0,
    followers: state.usersStack[currentTabScreen].top()?.followers ?? 0,
    totalPosts: state.usersStack[currentTabScreen].top()?.totalPosts ?? 0,
    isFollowed: state.usersStack[currentTabScreen].top()?.isFollowed ?? false,
    fetchError:
      state.usersStack[currentTabScreen].top()?.errors.fetchError ?? null,
    followError:
      state.usersStack[currentTabScreen].top()?.errors.followError ?? null,
    unfollowError:
      state.usersStack[currentTabScreen].top()?.errors.unfollowError ?? null,
    likePostError: state.allPosts.likePost.error,
    unlikePostError: state.allPosts.unlikePost.error,
    loading: state.usersStack[currentTabScreen].top()?.loading ?? false,
    posts: state.usersStack[currentTabScreen].top()?.posts ?? [],
  };
};

const mapDispatchToProps = {
  onFetchUser: fetchUser,
  onPopUserLayer: popUserLayer,
  onSetCurrentViewableListIndex: setCurrentViewableListIndex,
  onFetchMorePostsFromUser: fetchMorePostsFromUser,
  onFollowUser: followUser,
  onUnfollowUser: unfollowUser,
  onIncreaseFollowingByOneForMyself: increaseFollowingByOne,
  onDecreaseFollowingByOneForMyself: decreaseFollowingByOne,
  onClearFollowError: clearFollowError,
  onClearUnfollowError: clearUnfollowError,
  onPushCommentLayer: pushCommentLayer,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
  onIncreaseLikes: increaseLikes,
  onDecreaseLikes: decreaseLikes,
  onClearLikePostError: clearLikePostError,
  onClearUnlikePostError: clearUnlikePostError,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserScreen);
