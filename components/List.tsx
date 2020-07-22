import React, { Component } from 'react';
import { SafeAreaView, FlatList, RefreshControl } from 'react-native';

interface ListProps {
  data: Array<any>;
  viewabilityConfig?: {
    minimumViewTime?: number;
    viewAreaCoveragePercentThreshold?: number;
    itemVisiblePercentThreshold?: number;
    waitForInteraction?: boolean;
  };
  renderItem: ({ item, index }: { item: any; index: number }) => JSX.Element;
  onViewableItemsChanged?:
    | ((info: { viewableItems: any[]; changed: any[] }) => void)
    | null
    | undefined;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  onEndReached: () => void;
  listHeaderComponent?: JSX.Element;
  listFooterComponent?: JSX.Element;
  onEndReachedThreshold?: number;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  checkChangesToUpdate: (
    prevProps: Array<any>,
    nextProps: Array<any>,
  ) => boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  isFocused?: boolean;
}

export default class List extends Component<ListProps> {
  shouldComponentUpdate(nextProps: ListProps) {
    // console.log(checkPostListChanged(this.props.data, nextProps.data));
    if (this.props.refreshing !== nextProps.refreshing) {
      return true;
    }
    // if (this.props.data.length !== nextProps.data.length) return true;
    if (this.props.checkChangesToUpdate(this.props.data, nextProps.data)) {
      return true;
    }
    if (this.props.isFocused !== nextProps.isFocused) {
      return true;
    }
    return false;
  }

  _onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
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
      data,
      onViewableItemsChanged = undefined,
      viewabilityConfig = undefined,
      keyboardShouldPersistTaps = 'never',
      initialNumToRender = 1,
      maxToRenderPerBatch = 1,
      windowSize = 3,
      listHeaderComponent = undefined,
      onEndReachedThreshold = 0.5,
      listFooterComponent = undefined,
      refreshing = false,
      renderItem,
      onRefresh,
    } = this.props;
    // console.log(data);
    return (
      <SafeAreaView style={{ height: '100%' }}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          initialNumToRender={initialNumToRender}
          maxToRenderPerBatch={maxToRenderPerBatch}
          windowSize={windowSize}
          viewabilityConfig={viewabilityConfig}
          removeClippedSubviews={false}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          ListHeaderComponent={listHeaderComponent}
          ListFooterComponent={listFooterComponent}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.refresh}
                tintColor="#fff"
              />
            ) : undefined
          }
        />
      </SafeAreaView>
    );
  }
}
