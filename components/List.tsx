import React, { Component } from 'react';
import { SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { checkPostListChanged } from '../utils/functions';

interface ListProps {
  data: Array<any>;
  card: React.ComponentClass<any> | React.ReactNode;
  viewabilityConfig?: {
    minimumViewTime?: number;
    viewAreaCoveragePercentThreshold?: number;
    itemVisiblePercentThreshold?: number;
    waitForInteraction?: boolean;
  };
  onViewableItemsChanged?:
    | ((info: { viewableItems: any[]; changed: any[] }) => void)
    | null
    | undefined;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  onSelectCard?: (arg: any) => void;
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
      card,
      onViewableItemsChanged = undefined,
      viewabilityConfig = undefined,
      keyboardShouldPersistTaps = 'never',
      onSelectCard,
      initialNumToRender = 1,
      maxToRenderPerBatch = 1,
      windowSize = 3,
      listHeaderComponent = undefined,
      onEndReachedThreshold = 0.5,
      listFooterComponent = undefined,
      refreshing = false,
      onRefresh,
    } = this.props;
    // console.log(data);
    const Card = card as React.ComponentClass<any>;
    return (
      <SafeAreaView style={{ height: '100%' }}>
        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <Card index={index} data={item} onSelect={onSelectCard} />
          )}
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
