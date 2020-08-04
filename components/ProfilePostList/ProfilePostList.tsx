import React, { Component } from 'react';
import { Animated, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { checkPostListChanged } from '../../utils/functions';
import { Layout } from '../../constants';
import { Post } from '../../models';

const windowHeight = Layout.window.height;

interface ProfilePostListProps {
  posts: Array<Post>;

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
   * Required props detect if current list is focused by tab
   * Required because the list is only used in profile screen
   * which always have two tabs
   */
  isTabFocused: boolean;

  /**
   * Optional props rendering footer component for the list
   */
  listFooterComponent?: JSX.Element;

  /**
   * Optional props rendering component when the list is empty
   */
  listEmptyComponent?: JSX.Element;

  /**
   * Optional props configuring current viewable item
   */
  viewabilityConfig?: {
    minimumViewTime?: number;
    viewAreaCoveragePercentThreshold?: number;
    itemVisiblePercentThreshold?: number;
    waitForInteraction?: boolean;
  };

  /**
   * Optional props indicating that the list is being refreshed
   */
  refreshing?: boolean;

  /**
   * Optional props telling the list to re-render when it is changed
   */
  extraData?: any;

  /**
   * Optional props setting how many items to render in the initial batch
   * default is 10
   */
  initialNumToRender?: number;

  /**
   * Optional props controlling number of items rendered per batch
   * default is 10
   */
  maxToRenderPerBatch?: number;

  /**
   * Optional props measuring viewport height for each item
   * default is 21, 10 above, 10 below, 1 in between
   */
  windowSize?: number;

  /**
   * Optional props setting threshold in pixels for calling onEndReached
   */
  onEndReachedThreshold?: number;

  /**
   * Required method get reference of the list.
   * Used in animation
   */
  onGetRef: (ref: FlatList<any>) => void;

  /**
   * Required method render each item for list
   */
  renderItem: ({ item, index }: { item: any; index: number }) => JSX.Element;

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
   * Method updating the list when it reaches the last item
   */
  onEndReached: () => void;

  /**
   * Optional method refresh the list when it's being pulled down
   */
  onRefresh?: () => void;

  /**
   * Optional method get curent viewable item
   */
  onViewableItemsChanged?:
    | ((info: { viewableItems: any[]; changed: any[] }) => void)
    | undefined;
}

export default class ProfilePostList extends Component<ProfilePostListProps> {
  shouldComponentUpdate(nextProps: ProfilePostListProps) {
    const { posts, isTabFocused, refreshing, extraData } = this.props;
    if (checkPostListChanged(posts, nextProps.posts)) {
      return true;
    }
    if (isTabFocused !== nextProps.isTabFocused) {
      return true;
    }
    if (refreshing !== nextProps.refreshing) {
      return true;
    }
    if (extraData !== nextProps.extraData) {
      return true;
    }
    return false;
  }

  onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    if (distanceFromEnd < 0) {
      return;
    }
    this.props.onEndReached();
  };

  refresh = () => {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  };

  render() {
    const {
      posts,
      scrollY,
      headerHeight,
      tabBarHeight,
      listFooterComponent,
      initialNumToRender = 1,
      maxToRenderPerBatch = 1,
      windowSize = 3,
      onEndReachedThreshold = 0.05,
      viewabilityConfig,
      listEmptyComponent,
      refreshing = false,
      onGetRef,
      renderItem,
      onScrollEndDrag,
      onMomentumScrollEnd,
      onMomentumScrollBegin,
      onScrollToTop,
      onRefresh,
      onViewableItemsChanged,
    } = this.props;

    return (
      <SafeAreaView style={{ height: '100%' }}>
        <Animated.FlatList
          scrollToOverflowEnabled={true}
          ref={onGetRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          onMomentumScrollBegin={onMomentumScrollBegin}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{
            paddingTop: headerHeight + tabBarHeight,
            minHeight: windowHeight - tabBarHeight,
          }}
          data={posts}
          renderItem={renderItem}
          onScrollToTop={onScrollToTop}
          keyExtractor={(item: any) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={initialNumToRender}
          maxToRenderPerBatch={maxToRenderPerBatch}
          ListFooterComponent={listFooterComponent}
          ListEmptyComponent={listEmptyComponent}
          windowSize={windowSize}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.refresh}
                tintColor="white"
              />
            ) : undefined
          }
        />
      </SafeAreaView>
    );
  }
}
