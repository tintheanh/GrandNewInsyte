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
} from '../../../../redux/posts/actions';
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

const height = Layout.window.height;

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
  loading: boolean;

  error: Error | null;

  /**
   * Current feed selection, either 'new' or 'hot
   */
  feedChoice: string;

  /**
   * Current time selection for hot feed
   * Either 1 week, 1 month, or 1 year in epoch
   */
  timeChoice: number;

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
   * Optional props index of current tab
   * Some lists in certain screens may not have tabs
   */
  currentTabIndex?: number;
}

class HomePublicPostList extends Component<HomePublicPostListProps, any> {
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
    if (checkPostListChanged(this.props.posts, nextProps.posts)) {
      return true;
    }

    if (this.props.currentTabIndex !== nextProps.currentTabIndex) {
      return true;
    }
    if (this.props.loading !== nextProps.loading) {
      return true;
    }
    if (this.props.pullLoading !== nextProps.pullLoading) {
      return true;
    }

    if (this.props.error !== nextProps.error) {
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

  performSelectTimeFilter = () => {
    const {
      timeChoice,
      onSetPublicHotTime,
      onFetchPublicHotPosts,
    } = this.props;
    Alert.alert(
      '',
      'Sort hot posts by',
      [
        {
          text: 'This week',
          onPress: () => {
            if (timeChoice !== oneWeek) {
              onSetPublicHotTime(oneWeek);
              onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'This month',
          onPress: () => {
            if (timeChoice !== oneMonth) {
              onSetPublicHotTime(oneMonth);
              onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'This year',
          onPress: () => {
            if (timeChoice !== oneYear) {
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
   * Method render list item
   * @param item
   * @param index
   */
  renderItem = ({ item, index }: { item: Post; index: number }) => {
    const { navigation, currentTabIndex } = this.props;
    const isTabFocused = currentTabIndex ? currentTabIndex === 0 : true;
    return (
      <HomePostCardWrapper
        index={index}
        data={item}
        addScreenListener={navigation.addListener}
        isTabFocused={isTabFocused}
        performLikePost={() => console.log('like')}
        performUnlikePost={() => console.log('unlike')}
        navigateWhenPressOnPostOrComment={this.navigateToPostScreen(item)}
        navigateWhenPressOnUsernameOrAvatar={this.navigateToUserScreen(
          item.user,
        )}
      />
    );
  };

  render() {
    const {
      posts,
      onFetchPublicNewPosts,
      onFetchPublicHotPosts,
      onPullToFetchPublicNewPosts,
      onPullToFetchPublicHotPosts,
      pullLoading,
      timeChoice,
      currentTabIndex,
      loading,
      feedChoice,
      error,
    } = this.props;
    // console.log('home list', posts);

    let timeLabel = '';
    switch (timeChoice) {
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

    const sortHeader = (
      <SortPostListHeader
        sortBy={feedChoice as 'new' | 'hot'}
        timeChoice={timeLabel as 'this week' | 'this month' | 'this year'}
        selectPostFilter={this.performSelectPostFilter}
        selectTimeFilter={this.performSelectTimeFilter}
      />
    );

    if (error) {
      return (
        <View style={styles.container}>
          {sortHeader}
          <ErrorView errorText={error.message} handle={onFetchPublicNewPosts} />
        </View>
      );
    }

    if (loading && posts.length === 0) {
      return (
        <View style={styles.container}>
          {sortHeader}
          <Loading />
        </View>
      );
    }
    if (posts.length === 0) {
      return (
        <View style={styles.container}>
          {sortHeader}
          <NothingView handle={onFetchPublicNewPosts} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={{ zIndex: 100 }}>
          <List
            data={posts}
            renderItem={this.renderItem}
            onViewableItemsChanged={this.onViewableItemsChanged}
            viewabilityConfig={this.viewabilityConfig}
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
            refreshing={pullLoading}
            listHeaderComponent={sortHeader}
            listFooterComponent={
              <View style={{ paddingBottom: height / 10 }} />
            }
            checkChangesToUpdate={checkPostListChanged}
            isFocused={currentTabIndex ? currentTabIndex === 0 : true}
          />
        </View>
        <View style={styles.loadingWrapper}>
          <FooterLoading loading={loading} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    currentUID: state.auth.user?.id,
    pullLoading: state.allPosts.public.pullLoading,
    loading: state.allPosts.public.loading,
    error: state.allPosts.public.error,
    posts: state.allPosts.public.posts,
    feedChoice: state.allPosts.public.feedChoice,
    timeChoice: state.allPosts.public.hotTime,
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
