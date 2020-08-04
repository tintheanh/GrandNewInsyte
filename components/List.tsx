import React, { Component } from 'react';
import { SafeAreaView, FlatList, RefreshControl } from 'react-native';

interface ListProps {
  data: Array<any>;

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
   * Optional props rendering header component for the list
   */
  listHeaderComponent?: JSX.Element;

  /**
   * Optional props rendering footer component for the list
   */
  listFooterComponent?: JSX.Element;

  /**
   * Optional props rendering component when the list is empty
   */
  listEmptyComponent?: JSX.Element;

  /**
   * Optional props setting threshold in pixels for calling onEndReached
   */
  onEndReachedThreshold?: number;

  /**
   * Optional props determining when the
   * keyboard should stay visible after a tap
   */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';

  /**
   * Optional props indicating that the list is being refreshed
   */
  refreshing?: boolean;

  /**
   * Optional props detect if the list is being focused by current tab screen.
   * Some screen may not have tabs
   */
  isFocused?: boolean;

  /**
   * Optional props telling the list to re-render when it is changed
   */
  extraData?: any;

  /**
   * Method render each item for list
   */
  renderItem: ({ item, index }: { item: any; index: number }) => JSX.Element;

  /**
   * Method check if the list needs to re-render
   */
  checkChangesToUpdate: (
    prevProps: Array<any>,
    nextProps: Array<any>,
  ) => boolean;

  /**
   * Optional method get curent viewable item
   */
  onViewableItemsChanged?: (info: {
    viewableItems: any[];
    changed: any[];
  }) => void;

  /**
   * Optional method refresh the list when it's being pulled down
   */
  onRefresh?: () => void;

  /**
   * Optional method updating the list when it reaches the last item
   */
  onEndReached?: () => void;

  /**
   * Optional method update the list when
   * it reaches the last item but only when
   * the list is being interacted by user
   */
  onEndReachedDuringMomentum?: () => void;
}

export default class List extends Component<ListProps> {
  /**
   * @var onEndReachedCalledDuringMomentum detect when the list is being interacted by
   * user. Used in onEndReachedDuringMomentum()
   */
  private onEndReachedCalledDuringMomentum: boolean;
  constructor(props: ListProps) {
    super(props);
    this.onEndReachedCalledDuringMomentum = true;
  }

  shouldComponentUpdate(nextProps: ListProps) {
    const {
      checkChangesToUpdate,
      data,
      refreshing,
      isFocused,
      extraData,
    } = this.props;

    if (checkChangesToUpdate(data, nextProps.data)) {
      return true;
    }
    if (refreshing !== nextProps.refreshing) {
      return true;
    }
    if (isFocused !== nextProps.isFocused) {
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
    this.props.onEndReached!();
  };

  onEndReachedDuringMomentum = () => {
    if (!this.onEndReachedCalledDuringMomentum) {
      this.props.onEndReachedDuringMomentum!();
      this.onEndReachedCalledDuringMomentum = true;
    }
  };

  onMomentumScrollBegin = () => {
    this.onEndReachedCalledDuringMomentum = false;
  };

  refresh = () => {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  };

  render() {
    const {
      data,
      viewabilityConfig,
      keyboardShouldPersistTaps = 'never',
      initialNumToRender = 1,
      maxToRenderPerBatch = 1,
      windowSize = 3,
      listHeaderComponent,
      onEndReachedThreshold = 0.5,
      listFooterComponent,
      refreshing = false,
      listEmptyComponent,
      extraData,
      renderItem,
      onRefresh,
      onViewableItemsChanged,
      onEndReached,
    } = this.props;

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
          onEndReached={
            onEndReached ? this.onEndReached : this.onEndReachedDuringMomentum
          }
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onEndReachedThreshold={onEndReachedThreshold}
          ListHeaderComponent={listHeaderComponent}
          ListFooterComponent={listFooterComponent}
          ListEmptyComponent={listEmptyComponent}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.refresh}
                tintColor="white"
              />
            ) : undefined
          }
          extraData={extraData}
        />
      </SafeAreaView>
    );
  }
}
