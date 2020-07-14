import React, { Component } from 'react';
import { Animated, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { Layout } from '../../../constants';
import { setCurrentUserTaggedListPostIndex } from '../../../redux/curentViewableItem/actions';
import UserProfileTaggedPostCard from './UserProfileTaggedPostCard';
import { Post } from '../../../models';

const windowHeight = Layout.window.height;

interface UserProfileTaggedPostListProps {
  onGetRef: (ref: FlatList<any>) => void;
  scrollY: Animated.Value;
  onMomentumScrollBegin: () => void;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;
  onScrollToTop: () => void;
  headerHeight: number;
  tabBarHeight: number;
  onSetCurrentViewableIndex: (index: number) => void;
  currentTabIndex: number;
  data: Array<Post>;
}

class UserProfileTaggedPostList extends Component<
  UserProfileTaggedPostListProps
> {
  private viewabilityConfig: {};
  constructor(props: UserProfileTaggedPostListProps) {
    super(props);
    this.viewabilityConfig = {
      // waitForInteraction: true,
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
  }

  shouldComponentUpdate(nextProps: UserProfileTaggedPostListProps, _: any) {
    if (this.props.headerHeight !== nextProps.headerHeight) {
      return true;
    }
    if (this.props.currentTabIndex !== nextProps.currentTabIndex) {
      return true;
    }
    return false;
  }

  onViewableItemsChanged = ({ viewableItems, _ }: any) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
      this.props.onSetCurrentViewableIndex(viewableItems[0].index);
    }
  };

  render() {
    // console.log('user tagged list');
    const {
      onGetRef,
      scrollY,
      onMomentumScrollBegin,
      onScrollEndDrag,
      onMomentumScrollEnd,
      headerHeight,
      tabBarHeight,
      data,
      currentTabIndex,
      onScrollToTop,
    } = this.props;
    return (
      <Animated.FlatList
        scrollToOverflowEnabled={true}
        ref={onGetRef}
        // scrollEventThrottle={16}
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
        data={[]}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <UserProfileTaggedPostCard
            index={index}
            data={item}
            isTabFocused={currentTabIndex === 1}
          />
        )}
        onScrollToTop={onScrollToTop}
        keyExtractor={(item: any) => item.id}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
      />
    );
  }
}

const mapDispatchToProps = {
  onSetCurrentViewableIndex: setCurrentUserTaggedListPostIndex,
};

export default connect(null, mapDispatchToProps)(UserProfileTaggedPostList);
