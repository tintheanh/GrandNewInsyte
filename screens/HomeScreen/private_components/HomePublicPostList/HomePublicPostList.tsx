import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../../stacks/HomeStack';
import {
  List,
  Loading,
  ErrorView,
  NothingView,
  SortPostListHeader,
  FooterLoading,
} from '../../../../components';
import { setCurrentHomeListPostIndex } from '../../../../redux/curentViewableItem/actions';
import HomePostCardWrapper from '../HomePostCardWrapper';
import {
  fetchPublicNewPosts,
  pullToFetchPublicNewPosts,
  pullToFetchPublicHotPosts,
  fetchPublicHotPosts,
  setPublicFeedChoice,
  setPublicHotTime,
  deletePost,
  likePost,
  unlikePost,
} from '../../../../redux/posts/actions';
import { decreaseTotalPostsByOne } from '../../../../redux/auth/actions';
import { pushCommentsLayer } from '../../../../redux/commentsStack/actions';
import { pushUsersLayer } from '../../../../redux/usersStack/actions';
import { checkPostListChanged } from '../../../../utils/functions';
import { AppState } from '../../../../redux/store';
import {
  Colors,
  Layout,
  oneMonth,
  oneWeek,
  oneYear,
} from '../../../../constants';
import { Post } from '../../../../models';

type HomeScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'HomeScreen'
>;

interface HomePublicPostListProps {
  navigation: HomeScreenNavigationProp;

  /**
   * Current user id, undefined when
   * no user sign in
   */
  currentUID: string | undefined;

  /**
   * Posts fetched from database
   */
  posts: Array<Post>;

  /**
   * Boolean loading props when
   * pull to refresh list
   */
  pullLoading: boolean;

  /**
   * Boolean loading props when
   * first fetch posts
   */
  fetchLoading: boolean;

  error: Error | null;

  /**
   * Current feed selection, either 'new' or 'hot
   */
  feedChoice: 'new' | 'hot';

  /**
   * Current time selection for hot feed
   * Either 1 week, 1 month, or 1 year in epoch
   */
  hotTime: number;

  /**
   * Method set current scrolling index
   * Can't use local state because it'll
   * affect the list
   * @param index
   */
  onSetCurrentViewableIndex: (index: number) => void;

  /**
   * Method fetch new posts from database
   */
  onFetchPublicNewPosts: () => void;

  /**
   * Method fetch hot posts from database
   */
  onFetchPublicHotPosts: () => void;

  /**
   * Method pull to refresh new post list
   */
  onPullToFetchPublicNewPosts: () => void;

  /**
   * Method pull to refresh hot post list
   */
  onPullToFetchPublicHotPosts: () => void;

  /**
   * Method push a new comments layer when
   * navigate to post screen
   * @param postID Each comments layer is a post screen
   * using postID to identify from other layers
   */
  onPushCommentsLayer: (postID: string) => void;

  /**
   * Method push a new users layer when
   * navigate to user screen
   * @param user Hard data passed to user screen
   * so that it doesn't need to refetch them
   */
  onPushUsersLayer: (user: {
    id: string;
    username: string;
    avatar: string;
  }) => void;

  /**
   * Method set fetching posts by new or hot
   * @param sortBy Either sort post list by new or hot
   */
  onSetPublicFeedChoice: (sortBy: 'new' | 'hot') => void;

  /**
   * Method set time for hot feed
   * @param time Either 1 week, 1 month, or 1 year
   * in epoch
   */
  onSetPublicHotTime: (time: number) => void;

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
   * Optional props index of current tab
   * Some lists in certain screens may not have tabs
   */

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

  currentTabIndex?: number;
}

class HomePublicPostList extends Component<HomePublicPostListProps> {
  /**
   * Configuration object for list scrolling
   */
  private viewabilityConfig: {};

  constructor(props: HomePublicPostListProps) {
    super(props);
    this.viewabilityConfig = {
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
  }

  shouldComponentUpdate(nextProps: HomePublicPostListProps) {
    const {
      posts,
      currentTabIndex,
      fetchLoading,
      pullLoading,
      feedChoice,
      hotTime,
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
    if (feedChoice !== nextProps.feedChoice) {
      return true;
    }
    if (hotTime !== nextProps.hotTime) {
      return true;
    }
    if (error !== nextProps.error) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.props.onFetchPublicNewPosts();
  }

  /**
   * Method navigate to post screen
   * @param data Post data used to push new
   * comments layer and pass to post screen
   */
  navigateToPostScreen = (data: Post) => () => {
    const { navigation, onPushCommentsLayer } = this.props;
    onPushCommentsLayer(data.id);
    navigation.push('PostScreen', data);
  };

  /**
   * Method navigate to user/profile screen
   * if currentUID equals posted-by id in post,
   * navigate to profile screen, otherwise
   * to user screen
   * @param data Simplied user data used to pass to
   * user/profile screen
   */
  navigateToUserScreen = (data: {
    id: string;
    username: string;
    avatar: string;
  }) => () => {
    const { currentUID, navigation, onPushUsersLayer } = this.props;
    if (currentUID !== data.id) {
      onPushUsersLayer(data);
      navigation.push('UserScreen', data);
    } else {
      navigation.push('ProfileScreen', data);
    }
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
   * Method alert and perform select sorting filter for post list
   */
  performSelectPostFilter = () => {
    const {
      feedChoice,
      onSetPublicFeedChoice,
      onFetchPublicNewPosts,
      onFetchPublicHotPosts,
    } = this.props;
    Alert.alert(
      '',
      'Sort posts by',
      [
        {
          text: 'New',
          onPress: () => {
            if (feedChoice !== 'new') {
              onSetPublicFeedChoice('new');
              onFetchPublicNewPosts();
            }
          },
        },
        {
          text: 'Hot',
          onPress: () => {
            if (feedChoice !== 'hot') {
              onSetPublicFeedChoice('hot');
              onFetchPublicHotPosts();
            }
          },
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
   * Method alert and perform select time filter for post list
   */
  performSelectTimeFilter = () => {
    const { hotTime, onSetPublicHotTime, onFetchPublicHotPosts } = this.props;
    Alert.alert(
      '',
      'Sort hot posts by',
      [
        {
          text: 'This week',
          onPress: () => {
            if (hotTime !== oneWeek) {
              onSetPublicHotTime(oneWeek);
              onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'This month',
          onPress: () => {
            if (hotTime !== oneMonth) {
              onSetPublicHotTime(oneMonth);
              onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'This year',
          onPress: () => {
            if (hotTime !== oneYear) {
              onSetPublicHotTime(oneYear);
              onFetchPublicHotPosts();
            }
          },
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
    const { navigation, currentTabIndex, currentUID } = this.props;
    const isTabFocused =
      currentTabIndex !== undefined ? currentTabIndex === 0 : true;
    return (
      <HomePostCardWrapper
        index={index}
        data={item}
        addScreenListener={navigation.addListener}
        isTabFocused={isTabFocused}
        performLikePost={this.performLikePost(item.id)}
        performUnlikePost={this.performUnlikePost(item.id)}
        navigateWhenPressOnPostOrComment={this.navigateToPostScreen(item)}
        navigateWhenPressOnUsernameOrAvatar={this.navigateToUserScreen(
          item.user,
        )}
        userPostControl={
          currentUID === item.user.id ? this.userControl(item.id) : undefined
        }
      />
    );
  };

  render() {
    const {
      posts,
      pullLoading,
      hotTime,
      currentTabIndex,
      fetchLoading,
      feedChoice,
      error,
      onFetchPublicNewPosts,
      onFetchPublicHotPosts,
      onPullToFetchPublicNewPosts,
      onPullToFetchPublicHotPosts,
    } = this.props;

    let timeLabel = '';
    switch (hotTime) {
      case oneWeek:
        timeLabel = 'this week';
        break;
      case oneMonth:
        timeLabel = 'this month';
        break;
      default:
        timeLabel = 'this year';
        break;
    }

    let emptyListComponent = null;
    if (error) {
      emptyListComponent = <ErrorView errorText={error.message} />;
    } else if (fetchLoading && posts.length === 0) {
      emptyListComponent = <Loading />;
    } else {
      emptyListComponent = <NothingView />;
    }

    const headerListComponent = (
      <SortPostListHeader
        sortBy={feedChoice as 'new' | 'hot'}
        timeLabel={timeLabel as 'this week' | 'this month' | 'this year'}
        selectPostFilter={this.performSelectPostFilter}
        selectTimeFilter={this.performSelectTimeFilter}
      />
    );

    return (
      <View style={styles.container}>
        <View style={{ zIndex: 100 }}>
          <List
            data={posts}
            renderItem={this.renderItem}
            onViewableItemsChanged={this.onViewableItemsChanged}
            viewabilityConfig={this.viewabilityConfig}
            refreshing={pullLoading}
            listEmptyComponent={emptyListComponent}
            listHeaderComponent={headerListComponent}
            listFooterComponent={
              <View style={{ paddingBottom: Layout.window.height / 10 }} />
            }
            isFocused={
              currentTabIndex !== undefined ? currentTabIndex === 0 : true
            }
            onEndReached={
              feedChoice === 'new'
                ? onFetchPublicNewPosts
                : onFetchPublicHotPosts
            }
            onRefresh={
              feedChoice === 'new'
                ? onPullToFetchPublicNewPosts
                : onPullToFetchPublicHotPosts
            }
            checkChangesToUpdate={checkPostListChanged}
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

const mapStateToProps = (state: AppState) => {
  return {
    currentUID: state.auth.user?.id,
    pullLoading: state.allPosts.public.pullLoading,
    fetchLoading: state.allPosts.public.fetchLoading,
    error: state.allPosts.public.error,
    posts: state.allPosts.public.posts,
    feedChoice: state.allPosts.public.feedChoice,
    hotTime: state.allPosts.public.hotTime,
  };
};

const mapDispatchToProps = {
  onSetCurrentViewableIndex: setCurrentHomeListPostIndex,
  onFetchPublicNewPosts: fetchPublicNewPosts,
  onFetchPublicHotPosts: fetchPublicHotPosts,
  onPullToFetchPublicNewPosts: pullToFetchPublicNewPosts,
  onPullToFetchPublicHotPosts: pullToFetchPublicHotPosts,
  onPushCommentsLayer: pushCommentsLayer,
  onPushUsersLayer: pushUsersLayer,
  onSetPublicFeedChoice: setPublicFeedChoice,
  onSetPublicHotTime: setPublicHotTime,
  onDeletePost: deletePost,
  onDecreaseTotalPostsByOne: decreaseTotalPostsByOne,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
};

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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(function (props: any) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  return <HomePublicPostList {...props} navigation={navigation} />;
});
