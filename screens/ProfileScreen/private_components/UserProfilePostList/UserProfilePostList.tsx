import React, { Component } from 'react';
import { Animated, FlatList, Alert, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../../../stacks/ProfileStack';
import { setCurrentUserListPostIndex } from '../../../../redux/curentViewableItem/actions';
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
import { decreaseTotalPostsByOne } from '../../../../redux/auth/actions';
import UserProfilePostCardWrapper from '../UserProfilePostCardWrapper';
import { checkPostListChanged } from '../../../../utils/functions';
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

  shouldComponentUpdate(nextProps: UserProfilePostListProps) {
    const {
      posts,
      currentTabIndex,
      fetchLoading,
      pullLoading,
      error,
    } = this.props;

    if (checkPostListChanged(posts, nextProps.posts)) {
      return true;
    }
    if (currentTabIndex !== nextProps.currentTabIndex) {
      return true;
    }
    if (fetchLoading !== nextProps.fetchLoading) {
      return true;
    }
    if (pullLoading !== nextProps.pullLoading) {
      return true;
    }
    if (error !== nextProps.error) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.props.onFetchOwnPosts();
  }

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
        navigateWhenPressOnPostOrComment={() => console.log('to post screen')}
        userPostControl={this.userControl(item.id)}
      />
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
      onPullToFetchOwnPosts,
    } = this.props;

    let emptyListComponent = null;
    if (error) {
      emptyListComponent = (
        <View style={styles.emptyWrapper}>
          <ErrorView errorText={error.message} />
        </View>
      );
    } else if (fetchLoading && posts.length === 0) {
      emptyListComponent = (
        <View style={styles.emptyWrapper}>
          <Loading />
        </View>
      );
    } else {
      emptyListComponent = (
        <View style={styles.emptyWrapper}>
          <NothingView />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={{ zIndex: 100 }}>
          <ProfilePostList
            posts={posts}
            renderItem={this.renderItem}
            onGetRef={onGetRef}
            scrollY={scrollY}
            listEmptyComponent={emptyListComponent}
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
            onRefresh={onPullToFetchOwnPosts}
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
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(function (props: any) {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  return <UserProfilePostList {...props} navigation={navigation} />;
});
