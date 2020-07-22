import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { List, Loading, ErrorView, NothingView } from '../../../../components';
import { setCurrentHomeListPostIndex } from '../../../../redux/curentViewableItem/actions';
import HomePostCard from '../HomePostCard';
import HomePublicPostListLoading from './HomePublicPostListLoading';
import SortPublicPostList from './SortPublicPostList';
import {
  fetchPublicNewPosts,
  pullToFetchPublicNewPosts,
  pullToFetchPublicHotPosts,
  fetchPublicHotPosts,
  clear,
} from '../../../../redux/posts/actions';
import { checkPostListChanged } from '../../../../utils/functions';
import { AppState } from '../../../../redux/store';
import { Colors, Layout } from '../../../../constants';
import { Post } from '../../../../models';

const height = Layout.window.height;

interface HomePublicPostListProps {
  posts: Array<Post>;
  onSetCurrentViewableIndex: (index: number) => void;
  onFetchPublicNewPosts: () => void;
  onFetchPublicHotPosts: () => void;
  onPullToFetchPublicNewPosts: () => void;
  onPullToFetchPublicHotPosts: () => void;
  onClear: () => void;
  currentTabIndex?: number;
  pullLoading: boolean;
  loading: boolean;
  error: Error | null;
  feedChoice: string;
}

class HomePublicPostList extends Component<HomePublicPostListProps> {
  private viewabilityConfig: {};
  constructor(props: HomePublicPostListProps) {
    super(props);
    this.viewabilityConfig = {
      // waitForInteraction: true,
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
  }

  shouldComponentUpdate(nextProps: HomePublicPostListProps) {
    // console.log(checkPostListChanged(this.props.posts, nextProps.posts));
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
    this.props.onFetchPublicNewPosts();
  }

  emptyHandler = () => {
    // TODO work with this
    // this.props.onClear();
    this.props.onFetchPublicNewPosts();
  };

  render() {
    const {
      posts,
      onFetchPublicNewPosts,
      onFetchPublicHotPosts,
      onPullToFetchPublicNewPosts,
      onPullToFetchPublicHotPosts,
      pullLoading,
      loading,
      currentTabIndex,
      feedChoice,
      error,
    } = this.props;
    // console.log('home list', posts);

    if (error) {
      return (
        <View style={styles.container}>
          <SortPublicPostList />
          <ErrorView
            errorText={this.props.error.message}
            handle={this.emptyHandler}
          />
        </View>
      );
    }

    if (loading && posts.length === 0) {
      return (
        <View style={styles.container}>
          <SortPublicPostList />
          <Loading />
        </View>
      );
    }
    if (posts.length === 0) {
      return (
        <View style={styles.container}>
          <SortPublicPostList />
          <NothingView handle={this.emptyHandler} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={{ zIndex: 100 }}>
          <List
            data={posts}
            card={HomePostCard as React.ReactNode}
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
            isTabFocused={currentTabIndex ? currentTabIndex === 0 : true}
            refreshing={pullLoading}
            listHeaderComponent={<SortPublicPostList />}
            listFooterComponent={
              <View style={{ paddingBottom: height / 10 }} />
            }
            checkChangesToUpdate={checkPostListChanged}
          />
        </View>
        <View style={styles.loadingWrapper}>
          <HomePublicPostListLoading />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    pullLoading: state.allPosts.public.pullLoading,
    loading: state.allPosts.public.loading,
    error: state.allPosts.public.error,
    posts: state.allPosts.public.posts,
    feedChoice: state.allPosts.public.feedChoice,
  };
};

const mapDispatchToProps = {
  onSetCurrentViewableIndex: setCurrentHomeListPostIndex,
  onFetchPublicNewPosts: fetchPublicNewPosts,
  onFetchPublicHotPosts: fetchPublicHotPosts,
  onPullToFetchPublicNewPosts: pullToFetchPublicNewPosts,
  onPullToFetchPublicHotPosts: pullToFetchPublicHotPosts,
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
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(HomePublicPostList);
