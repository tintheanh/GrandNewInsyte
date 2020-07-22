import React, { Component } from 'react';
import { Animated, FlatList, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Layout from '../../../../constants/Layout';
import { setCurrentUserListPostIndex } from '../../../../redux/curentViewableItem/actions';
import {
  fetchUserPosts,
  pullToFetchUserPosts,
} from '../../../../redux/posts/actions';
import UserProfilePostCard from './UserProfilePostCard';
import {
  ErrorView,
  NothingView,
  Loading,
  ProfilePostList,
} from '../../../../components';
import UserProfilePostListLoading from './UserProfilePostListLoading';
import { checkPostListChanged } from '../../../../utils/functions';
import { Colors } from '../../../../constants';
import { AppState } from '../../../../redux/store';
import { Post } from '../../../../models';

const windowHeight = Layout.window.height;

interface UserProfilePostListProps {
  onGetRef: (ref: FlatList<any>) => void;
  scrollY: Animated.Value;
  onMomentumScrollBegin: () => void;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;
  onScrollToTop: () => void;
  headerHeight: number;
  tabBarHeight: number;
  onSetCurrentViewableIndex: (index: number) => void;
  onFetchUserPosts: () => void;
  onPullToFetchUserPosts: () => void;
  currentTabIndex: number;
  posts: Array<Post>;
  error: Error | null;
  loading: boolean;
  pullLoading: boolean;
}

class UserProfilePostList extends Component<UserProfilePostListProps> {
  private viewabilityConfig: {};
  // private onEndReachedCalledDuringMomentum: boolean;
  constructor(props: UserProfilePostListProps) {
    super(props);
    this.viewabilityConfig = {
      // waitForInteraction: true,
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
    // this.onEndReachedCalledDuringMomentum = false;
  }

  shouldComponentUpdate(nextProps: UserProfilePostListProps, _: any) {
    if (this.props.headerHeight !== nextProps.headerHeight) {
      return true;
    }
    if (this.props.currentTabIndex !== nextProps.currentTabIndex) {
      return true;
    }

    if (
      (this.props.posts.length === 0 || nextProps.posts.length === 0) &&
      this.props.loading !== nextProps.loading
    ) {
      return true;
    }
    if (this.props.pullLoading !== nextProps.pullLoading) {
      return true;
    }
    if (checkPostListChanged(this.props.posts, nextProps.posts)) {
      return true;
    }
    if (this.props.error !== nextProps.error) {
      return true;
    }
    return false;
  }

  onViewableItemsChanged = ({ viewableItems, _ }: any) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
      this.props.onSetCurrentViewableIndex(viewableItems[0].index);
    }
  };

  componentDidMount() {
    this.props.onFetchUserPosts();
  }

  emptyHandler = () => {
    this.props.onFetchUserPosts();
  };

  render() {
    // console.log('user list');

    const {
      onGetRef,
      scrollY,
      onMomentumScrollBegin,
      onScrollEndDrag,
      onMomentumScrollEnd,
      headerHeight,
      tabBarHeight,
      posts,
      loading,
      error,
      currentTabIndex,
      onFetchUserPosts,
      onScrollToTop,
      onPullToFetchUserPosts,
      pullLoading,
    } = this.props;

    // console.log('profile list post', posts);

    if (error) {
      return (
        <View
          style={{
            paddingTop: headerHeight + tabBarHeight,
            minHeight: windowHeight - tabBarHeight,
          }}>
          <ErrorView errorText={error.message} handle={this.emptyHandler} />
        </View>
      );
    }

    if (loading && posts.length === 0) {
      return (
        <View
          style={{
            paddingTop: headerHeight + tabBarHeight,
            minHeight: windowHeight - tabBarHeight,
          }}>
          <Loading />
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <View
          style={{
            paddingTop: headerHeight + tabBarHeight,
            minHeight: windowHeight - tabBarHeight,
          }}>
          <NothingView handle={this.emptyHandler} />
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: Colors.brightColor }}>
        <ProfilePostList
          onGetRef={onGetRef}
          scrollY={scrollY}
          onMomentumScrollBegin={onMomentumScrollBegin}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          headerHeight={headerHeight}
          tabBarHeight={tabBarHeight}
          posts={posts}
          card={UserProfilePostCard}
          onScrollToTop={onScrollToTop}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={this.viewabilityConfig}
          onEndReached={onFetchUserPosts}
          isTabFocused={currentTabIndex === 0}
          refreshing={pullLoading}
          onRefresh={onPullToFetchUserPosts}
        />
        <View style={styles.loadingWrapper}>
          <UserProfilePostListLoading />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
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

const mapStateToProps = (state: AppState) => ({
  posts: state.allPosts.userPosts.posts,
  loading: state.allPosts.userPosts.loading,
  error: state.allPosts.userPosts.error,
  pullLoading: state.allPosts.userPosts.pullLoading,
});

const mapDispatchToProps = {
  onSetCurrentViewableIndex: setCurrentUserListPostIndex,
  onFetchUserPosts: fetchUserPosts,
  onPullToFetchUserPosts: pullToFetchUserPosts,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserProfilePostList);
