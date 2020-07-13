import React, { Component } from 'react';
import { Animated, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { checkPostListChanged } from '../../utils/functions';
import Layout from '../../constants/Layout';

const windowHeight = Layout.window.height;

interface ProfilePostListProps {
  onGetRef: (ref: FlatList<any>) => void;
  scrollY: Animated.Value;
  onMomentumScrollBegin: () => void;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;
  onScrollToTop: () => void;
  headerHeight: number;
  tabBarHeight: number;
  currentTabIndex: number;
  onEndReached: () => void;
  onViewableItemsChanged?:
    | ((info: { viewableItems: any[]; changed: any[] }) => void)
    | undefined;
  viewabilityConfig?: {
    minimumViewTime?: number;
    viewAreaCoveragePercentThreshold?: number;
    itemVisiblePercentThreshold?: number;
    waitForInteraction?: boolean;
  };
  onRefresh?: () => void;
  card: React.ComponentClass<any> | React.ReactNode;
  // TODO chage posts type to post type
  posts: any[];
  refreshing?: boolean;
}

export default class ProfilePostList extends Component<ProfilePostListProps> {
  private onEndReachedCalledDuringMomentum: boolean;
  constructor(props: ProfilePostListProps) {
    super(props);
    this.onEndReachedCalledDuringMomentum = false;
  }

  shouldComponentUpdate(nextProps: ProfilePostListProps) {
    // console.log(this.props.data.length, nextProps.data.length);
    if (this.props.refreshing !== nextProps.refreshing) {
      return true;
    }
    // if (this.props.data.length !== nextProps.data.length) return true;
    if (checkPostListChanged(this.props.posts, nextProps.posts)) {
      return true;
    }
    return false;
  }

  _onMomentumScrollBegin = () => {
    this.props.onMomentumScrollBegin();
    this.onEndReachedCalledDuringMomentum = false;
  };

  _onEndReached = () => {
    if (!this.onEndReachedCalledDuringMomentum) {
      // console.log('end');
      this.props.onEndReached();
      this.onEndReachedCalledDuringMomentum = true;
    }
  };

  refresh = () => {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  };

  render() {
    // console.log('profile post list');
    const {
      onGetRef,
      scrollY,
      onScrollEndDrag,
      onMomentumScrollEnd,
      onScrollToTop,
      headerHeight,
      tabBarHeight,
      currentTabIndex,
      onViewableItemsChanged = undefined,
      viewabilityConfig = undefined,
      posts,
      card,
      refreshing = false,
    } = this.props;
    const Card = card as React.ComponentClass<any>;
    return (
      <Animated.FlatList
        style={styles.listStyle}
        scrollToOverflowEnabled={true}
        ref={onGetRef}
        // scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        onMomentumScrollBegin={this._onMomentumScrollBegin}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{
          paddingTop: headerHeight + tabBarHeight,
          minHeight: windowHeight - tabBarHeight,
        }}
        data={posts}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <Card
            index={index}
            data={item}
            isTabFocused={currentTabIndex === 0}
          />
        )}
        onScrollToTop={onScrollToTop}
        keyExtractor={(item: any) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        onEndReached={this._onEndReached}
        onEndReachedThreshold={0.05}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={this.refresh}
            tintColor="#fff"
          />
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  listStyle: {
    zIndex: 100,
  },
});