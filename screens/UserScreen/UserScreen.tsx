import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { connect } from 'react-redux';
import {
  BigAvatar,
  UserStats,
  UserInfo,
  List,
  FooterLoading,
  NothingView,
} from '../../components';
import { UserPostCard } from './private_components';
import { Colors, Layout, MaterialCommunityIcons } from '../../constants';
import { AppState } from '../../redux/store';
import {
  fetchUser,
  popUsersLayer,
  setCurrentViewableListIndex,
  fetchMorePostsFromUser,
  followUser,
  unfollowUser,
} from '../../redux/usersStack/actions';
import {
  increaseFollowingByOne,
  decreaseFollowingByOne,
} from '../../redux/auth/actions';
import { delay, checkPostListChanged } from '../../utils/functions';
import { Post } from '../../models';

class UserScreen extends Component<any, any> {
  private unsubscribeDetectScreenGoBack: any;
  private viewabilityConfig: {};
  constructor(props: any) {
    super(props);
    this.viewabilityConfig = {
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 80,
    };
  }

  shouldComponentUpdate(nextProps: any) {
    const { userLayer } = this.props;
    if (userLayer && nextProps.userLayer) {
      if (
        (userLayer.posts.length === 0 ||
          nextProps.userLayer.posts.length === 0) &&
        userLayer.loading !== nextProps.userLayer.loading
      ) {
        return true;
      }
      if (userLayer.loading !== nextProps.userLayer.loading) {
        return true;
      }
      if (userLayer.isFollowed !== nextProps.userLayer.isFollowed) {
        return true;
      }
      if (userLayer.followers !== nextProps.userLayer.followers) {
        return true;
      }
      if (checkPostListChanged(userLayer.posts, nextProps.userLayer.posts)) {
        return true;
      }
      if (userLayer.error !== nextProps.userLayer.error) {
        return true;
      }
    }
    return false;
  }

  async componentDidMount() {
    this.unsubscribeDetectScreenGoBack = this.props.navigation.addListener(
      'beforeRemove',
      () => {
        this.props.onPopUsersLayer();
      },
    );
    await delay(500);
    this.props.onFetchUser(this.props.route.params.id);
  }

  componentWillUnmount() {
    this.unsubscribeDetectScreenGoBack();
  }

  onViewableItemsChanged = ({ viewableItems, _ }: any) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
      this.props.onSetCurrentViewableListIndex(viewableItems[0].index);
    }
  };

  performFetchMorePosts = () => {
    const user = this.props.route.params;
    this.props.onFetchMorePostsFromUser(
      user.id,
      this.props.userLayer.isFollowed,
    );
  };

  renderItem = ({ item, index }: { item: Post; index: number }) => {
    return <UserPostCard index={index} data={item} />;
  };

  emptyHandler = () => {
    const user = this.props.route.params;
    this.props.onFetchMorePostsFromUser(
      user.id,
      this.props.userLayer.isFollowed,
    );
  };

  pullLoading = () => {
    this.props.onFetchUser(this.props.route.params.id);
  };

  performFollow = () => {
    this.props.onFollowUser(this.props.route.params.id);
    this.props.onIncreaseFollowingByOne();
  };

  performUnfollow = () => {
    this.props.onUnfollowUser(this.props.route.params.id);
    this.props.onDecreaseFollowingByOne();
  };

  render() {
    const user = this.props.route.params;
    const { userLayer } = this.props;
    // console.log('user screen render', userLayer.posts);
    if (!userLayer) {
      return <View style={styles.container} />;
    }

    const header = (
      <View>
        <View style={styles.header}>
          <View style={styles.avatarAndStats}>
            <BigAvatar avatar={user.avatar} />
            <View style={styles.statWrapper}>
              <UserStats
                postNum={userLayer.totalPosts}
                followersNum={userLayer.followers}
                followingNum={userLayer.following}
              />
              <TouchableWithoutFeedback
                onPress={
                  userLayer.isFollowed
                    ? this.performUnfollow
                    : this.performFollow
                }>
                <View
                  style={[
                    styles.followBtn,
                    {
                      backgroundColor: userLayer.isFollowed
                        ? Colors.brightColor
                        : Colors.btnColor,
                    },
                  ]}>
                  <Text style={styles.followBtnLabel}>
                    {userLayer.isFollowed ? 'Unfollow' : 'Follow'}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <UserInfo name={userLayer.name} bio={userLayer.bio} />
        </View>
        <View style={styles.divider}>
          <MaterialCommunityIcons
            name="card-text-outline"
            size={20}
            color="white"
          />
        </View>
      </View>
    );

    if (userLayer.loading && userLayer.posts.length === 0) {
      return (
        <View style={styles.container}>
          <View>
            <View style={styles.header}>
              <View style={styles.avatarAndStats}>
                <BigAvatar avatar={user.avatar} />
                <View style={styles.statWrapper}>
                  <UserStats postNum={0} followersNum={0} followingNum={0} />
                  <TouchableWithoutFeedback disabled>
                    <View
                      style={[
                        styles.followBtn,
                        {
                          backgroundColor: userLayer.isFollowed
                            ? Colors.brightColor
                            : Colors.btnColor,
                        },
                      ]}>
                      <Text style={styles.followBtnLabel}>Follow</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginTop: 14 }}
              />
            </View>
            <View style={styles.divider}>
              <MaterialCommunityIcons
                name="card-text-outline"
                size={20}
                color="white"
              />
            </View>
          </View>
        </View>
      );
    }

    if (userLayer.posts.length === 0) {
      return (
        <View style={styles.container}>
          {header}
          <NothingView handle={this.emptyHandler} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <List
          data={userLayer.posts}
          renderItem={this.renderItem}
          onViewableItemsChanged={this.onViewableItemsChanged}
          onEndReached={this.performFetchMorePosts}
          viewabilityConfig={this.viewabilityConfig}
          listHeaderComponent={header}
          listFooterComponent={
            <View style={{ paddingBottom: Layout.window.height / 10 }} />
          }
          refreshing={userLayer.loading}
          onRefresh={this.pullLoading}
          checkChangesToUpdate={checkPostListChanged}
          extraData={userLayer}
        />
        <View style={styles.loadingWrapper}>
          <FooterLoading loading={userLayer.loading} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brightColor,
  },
  header: {
    width: '100%',
    padding: 12,
    backgroundColor: Colors.darkColor,
  },
  avatarAndStats: {
    width: '100%',
    flexDirection: 'row',
  },
  statWrapper: {
    flexShrink: 1,
    alignItems: 'center',
  },
  followBtn: {
    width: '80%',
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  followBtnLabel: {
    textAlign: 'center',
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  divider: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.darkColor,
    borderBottomColor: Colors.brightColor,
    borderBottomWidth: 2,
    paddingTop: 8,
    paddingBottom: 8,
  },
  loadingWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -100,
  },
});

const mapStateToProps = (state: AppState) => {
  const { currentTab } = state.usersStack;
  return {
    userLayer: state.usersStack[currentTab].top(),
  };
};

const mapDispatchToProps = {
  onFetchUser: fetchUser,
  onPopUsersLayer: popUsersLayer,
  onSetCurrentViewableListIndex: setCurrentViewableListIndex,
  onFetchMorePostsFromUser: fetchMorePostsFromUser,
  onFollowUser: followUser,
  onUnfollowUser: unfollowUser,
  onIncreaseFollowingByOne: increaseFollowingByOne,
  onDecreaseFollowingByOne: decreaseFollowingByOne,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserScreen);
