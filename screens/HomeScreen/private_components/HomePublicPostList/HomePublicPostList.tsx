import React, { Component } from 'react';
import { connect } from 'react-redux';
import faker from 'faker';
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
import { setCurrentHomeListPostIndex } from '../../../../redux/curent_viewable_item/actions';
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
import { pushCommentLayer } from '../../../../redux/comment_stack/actions';
import { pushUserLayer } from '../../../../redux/user_stack/actions';
import { checkPostListChanged, convertTime } from '../../../../utils/functions';
import { AppState } from '../../../../redux/store';
import {
  Colors,
  Layout,
  oneMonth,
  oneWeek,
  oneYear,
} from '../../../../constants';
import { Post } from '../../../../models';

const POSTS = [];
for (let i = 0; i < 20; i++) {
  const date = faker.date.between('2020-10-08', '2020-10-11').getTime();
  POSTS.push({
    id: `${i}`,
    caption: faker.lorem.sentence(),
    datePosted: date,
    timeLabel: convertTime(date),
    likes: faker.random.number(100),
    comments: faker.random.number(100),
    media: [
      {
        id: '169',
        url:
          'https://www.thebalancesmb.com/thmb/21M3XWPlH8QML9kbou1VhSx_C2M=/1920x1280/filters:fill(auto,1)/restaurant-1284351_1920-581279e25f9b58564c10d1ac.jpg',
        type: 'image',
        width: 640,
        height: 480,
      },
    ],
    user: {
      id: `${i}`,
      avatar: faker.image.avatar(),
      username: faker.internet.userName(),
    },
    taggedUsers: [],
    isLiked: false,
    privacy: 'public',
  });
}

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
  onPushCommentLayer: (postID: string) => void;

  /**
   * Method push a new users layer when
   * navigate to user screen
   * @param user Hard data passed to user screen
   * so that it doesn't need to refetch them
   */
  onPushUserLayer: (user: {
    userID: string;
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
   * Optional props index of current tab
   * Some lists in certain screens may not have tabs
   */
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

  // shouldComponentUpdate(nextProps: HomePublicPostListProps) {
  //   const {
  //     currentTabIndex,
  //     fetchLoading,
  //     pullLoading,
  //     feedChoice,
  //     hotTime,
  //     error,
  //   } = this.props;

  //   if (currentTabIndex !== nextProps.currentTabIndex) {
  //     return true;
  //   }
  //   if (fetchLoading !== nextProps.fetchLoading) {
  //     return true;
  //   }
  //   if (pullLoading !== nextProps.pullLoading) {
  //     return true;
  //   }
  //   if (feedChoice !== nextProps.feedChoice) {
  //     return true;
  //   }
  //   if (hotTime !== nextProps.hotTime) {
  //     return true;
  //   }
  //   if (error !== nextProps.error) {
  //     return true;
  //   }
  //   return false;
  // }

  componentDidMount() {
    this.props.onFetchPublicNewPosts();
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
   * Method navigate to user/profile screen
   * if currentUID equals posted-by id in post,
   * navigate to profile screen, otherwise
   * to user screen
   * @param data Simplied user data used to pass to
   * user/profile screen
   */
  navigateToUserScreen = (user: {
    id: string;
    username: string;
    avatar: string;
  }) => () => {
    const { currentUID, navigation, onPushUserLayer } = this.props;
    if (currentUID !== user.id) {
      onPushUserLayer({
        userID: user.id,
        username: user.username,
        avatar: user.avatar,
      });
      navigation.push('UserScreen', { user });
    } else {
      navigation.navigate('ProfileScreen', {
        title: user.username,
      });
    }
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
    const { currentUID, navigation, onPushUserLayer } = this.props;
    if (currentUID === user.id) {
      navigation.navigate('ProfileScreen', {
        title: user.username,
      });
    } else {
      onPushUserLayer({
        userID: user.id,
        username: user.username,
        avatar: user.avatar,
      });
      navigation.push('UserScreen', { user });
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

  guessControl = () => {
    Alert.alert(
      'This post contains offended content?',
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Report this post',
          onPress: () => {
            Alert.alert('Reported!', '', [{ text: 'OK' }], {
              cancelable: false,
            });
          },
        },
      ],
      { cancelable: true },
    );
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
        guessControl={this.guessControl}
        navigateWhenPressOnTag={this.navigateWhenPressOnTag}
      />
    );
  };

  renderEmptyComponent = () => {
    const { error, fetchLoading, posts } = this.props;
    if (error) {
      return <ErrorView errorText={error.message} />;
    }
    if (fetchLoading && posts.length === 0) {
      return <Loading />;
    }
    return <NothingView />;
  };

  renderHeaderComponent = () => {
    const { hotTime, feedChoice } = this.props;
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
    return (
      <SortPostListHeader
        sortBy={feedChoice as 'new' | 'hot'}
        timeLabel={timeLabel as 'this week' | 'this month' | 'this year'}
        selectPostFilter={this.performSelectPostFilter}
        selectTimeFilter={this.performSelectTimeFilter}
      />
    );
  };

  render() {
    const {
      posts,
      pullLoading,
      currentTabIndex,
      fetchLoading,
      feedChoice,
      error,
      onFetchPublicNewPosts,
      onFetchPublicHotPosts,
      onPullToFetchPublicNewPosts,
      onPullToFetchPublicHotPosts,
    } = this.props;

    return (
      <View style={styles.container}>
        <View style={{ zIndex: 100 }}>
          <List
            data={posts}
            renderItem={this.renderItem}
            onViewableItemsChanged={this.onViewableItemsChanged}
            viewabilityConfig={this.viewabilityConfig}
            refreshing={pullLoading}
            listEmptyComponent={this.renderEmptyComponent()}
            listHeaderComponent={this.renderHeaderComponent()}
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
    posts: POSTS,
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
  onPushCommentLayer: pushCommentLayer,
  onPushUserLayer: pushUserLayer,
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
