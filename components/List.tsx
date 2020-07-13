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
  onEndReached: () => void;
  listHeaderComponent?: JSX.Element;
  listFooterComponent?: JSX.Element;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default class List extends Component<ListProps> {
  private onEndReachedCalledDuringMomentum: boolean;
  constructor(props: ListProps) {
    super(props);
    this.onEndReachedCalledDuringMomentum = false;
  }

  shouldComponentUpdate(nextProps: ListProps) {
    // console.log(this.props.data.length, nextProps.data.length);
    if (this.props.refreshing !== nextProps.refreshing) {
      return true;
    }
    // if (this.props.data.length !== nextProps.data.length) return true;
    if (checkPostListChanged(this.props.data, nextProps.data)) {
      return true;
    }
    return false;
  }

  _onMomentumScrollBegin = () => {
    this.onEndReachedCalledDuringMomentum = false;
  };

  _onEndReached = () => {
    if (!this.onEndReachedCalledDuringMomentum) {
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
    // console.log('list');
    const {
      data,
      card,
      onViewableItemsChanged = undefined,
      viewabilityConfig = undefined,
      initialNumToRender = 1,
      maxToRenderPerBatch = 1,
      windowSize = 3,
      listHeaderComponent = undefined,
      listFooterComponent = undefined,
      refreshing = false,
    } = this.props;
    const Card = card as React.ComponentClass<any>;
    return (
      <SafeAreaView style={{ height: '100%' }}>
        <FlatList
          data={data}
          renderItem={({ item, index }) => <Card index={index} data={item} />}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          initialNumToRender={initialNumToRender}
          maxToRenderPerBatch={maxToRenderPerBatch}
          windowSize={windowSize}
          viewabilityConfig={viewabilityConfig}
          removeClippedSubviews={false}
          onMomentumScrollBegin={this._onMomentumScrollBegin}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={listHeaderComponent}
          ListFooterComponent={listFooterComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.refresh}
              tintColor="#fff"
            />
          }
        />
      </SafeAreaView>
    );
  }
}
