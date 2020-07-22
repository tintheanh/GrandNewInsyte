import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { List, Loading, ErrorView, NothingView } from '../../../../components';
import { setCurrentHomeListPostIndex } from '../../../../redux/curentViewableItem/actions';
import HomePostCard from '../HomePostCard';
import HomeFollowingPostListLoading from './HomeFollowingPostListLoading';
import SortFollowingPostList from './SortFollowingPostList';
import {
  fetchFollowingNewPosts,
  fetchFollowingHotPosts,
  pullToFetchFollowingNewPosts,
  pullToFetchFollowingHotPosts,
  clear,
} from '../../../../redux/posts/actions';
import { checkPostListChanged } from '../../../../utils/functions';
import { AppState } from '../../../../redux/store';
import { Colors } from '../../../../constants';
import { Post } from '../../../../models';

interface HomeFollowingPostListProps {
  posts: Array<Post>;
  onSetCurrentViewableIndex: (index: number) => void;
  onFetchFollowingNewPosts: () => void;
  onFetchFollowingHotPosts: () => void;
  onPullToFetchFollowingNewPosts: () => void;
  onPullToFetchFollowingHotPosts: () => void;
  onClear: () => void;
  pullLoading: boolean;
  currentTabIndex?: number;
  loading: boolean;
  error: Error | null;
  feedChoice: string;
}

class HomeFollowingPostList extends Component<HomeFollowingPostListProps> {
  private viewabilityConfig: {};
  constructor(props: HomeFollowingPostListProps) {
    super(props);
    this.viewabilityConfig = {
      // waitForInteraction: true,
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
  }

  shouldComponentUpdate(nextProps: HomeFollowingPostListProps) {
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
    this.props.onFetchFollowingNewPosts();
  }

  emptyHandler = () => {
    // this.props.onClear();
    this.props.onFetchFollowingNewPosts();
  };

  renderItem = ({ item, index }: { item: Post; index: number }) => {
    const { currentTabIndex } = this.props;
    return (
      <HomePostCard
        index={index}
        data={item}
        isTabFocused={currentTabIndex ? currentTabIndex === 1 : false}
      />
    );
  };

  render() {
    const {
      posts,
      onFetchFollowingNewPosts,
      onFetchFollowingHotPosts,
      onPullToFetchFollowingNewPosts,
      onPullToFetchFollowingHotPosts,
      pullLoading,
      currentTabIndex,
      loading,
      feedChoice,
      error,
    } = this.props;
    // console.log('home list');

    if (error) {
      return (
        <View style={styles.container}>
          <SortFollowingPostList />
          <ErrorView errorText={error.message} handle={this.emptyHandler} />
        </View>
      );
    }

    if (loading && posts.length === 0) {
      return (
        <View style={styles.container}>
          <SortFollowingPostList />
          <Loading />
        </View>
      );
    }
    if (posts.length === 0) {
      return (
        <View style={styles.container}>
          <SortFollowingPostList />
          <NothingView handle={this.emptyHandler} />
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
                ? onFetchFollowingNewPosts
                : onFetchFollowingHotPosts
            }
            onRefresh={
              feedChoice === 'new'
                ? onPullToFetchFollowingNewPosts
                : onPullToFetchFollowingHotPosts
            }
            refreshing={pullLoading}
            listHeaderComponent={<SortFollowingPostList />}
            checkChangesToUpdate={checkPostListChanged}
            isFocused={currentTabIndex ? currentTabIndex === 1 : false}
          />
        </View>
        <View style={styles.loadingWrapper}>
          <HomeFollowingPostListLoading />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  pullLoading: state.allPosts.following.pullLoading,
  loading: state.allPosts.following.loading,
  error: state.allPosts.following.error,
  posts: state.allPosts.following.posts,
  feedChoice: state.allPosts.following.feedChoice,
});

const mapDispatchToProps = {
  onSetCurrentViewableIndex: setCurrentHomeListPostIndex,
  onFetchFollowingNewPosts: fetchFollowingNewPosts,
  onFetchFollowingHotPosts: fetchFollowingHotPosts,
  onPullToFetchFollowingNewPosts: pullToFetchFollowingNewPosts,
  onPullToFetchFollowingHotPosts: pullToFetchFollowingHotPosts,
  onClear: clear,
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
    paddingTop: 14,
    paddingBottom: 14,
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeFollowingPostList);
