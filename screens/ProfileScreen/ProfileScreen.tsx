import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { connect } from 'react-redux';
import { TabView, TabBar } from 'react-native-tab-view';
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Colors,
  Layout,
} from '../../constants';
import {
  UserProfileAvatar,
  UserProfileStats,
  UserProfileInfo,
  UserProfilePostList,
  UserProfileTaggedPostList,
  UserProfileEditBtn,
} from './private_components';
import { AppState } from '../../redux/store';

const TabBarHeight = 36;

const ProfileScreen = (props: any) => {
  const [routes] = useState([
    { key: 'tab1', title: 'Tab1' },
    { key: 'tab2', title: 'Tab2' },
  ]);
  const [tabIndex, setIndex] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const listRefArr = useRef([] as Array<{ key: string; value: FlatList }>);
  const listOffset = useRef({} as { [key: string]: number });
  const isListGliding = useRef(false);

  useEffect(() => {
    scrollY.addListener(({ value }) => {
      const curRoute = routes[tabIndex].key;
      listOffset.current[curRoute] = value;
    });
    return () => {
      scrollY.removeAllListeners();
    };
  }, [routes, tabIndex, scrollY]);

  const syncScrollOffset = () => {
    const curRouteKey = routes[tabIndex].key;
    listRefArr.current.forEach((item) => {
      if (item.key !== curRouteKey) {
        if (
          (scrollY as any)._value < headerHeight &&
          (scrollY as any)._value >= 0
        ) {
          if (item.value) {
            item.value.scrollToOffset({
              offset: (scrollY as any)._value,
              animated: false,
            });
            listOffset.current[item.key] = (scrollY as any)._value;
          }
        } else if ((scrollY as any)._value >= headerHeight) {
          if (
            listOffset.current[item.key] < headerHeight ||
            listOffset.current[item.key] == null
          ) {
            if (item.value) {
              item.value.scrollToOffset({
                offset: headerHeight,
                animated: false,
              });
              listOffset.current[item.key] = headerHeight;
            }
          }
        }
      }
    });
  };

  const onMomentumScrollBegin = () => {
    isListGliding.current = true;
  };

  const onMomentumScrollEnd = () => {
    isListGliding.current = false;
    syncScrollOffset();
  };

  const onScrollEndDrag = () => {
    syncScrollOffset();
  };

  const scrollToTop = () => {
    listRefArr.current.forEach((item) => {
      item.value.scrollToOffset({
        offset: 0,
        animated: false,
      });
    });
  };

  const renderHeader = () => {
    const y = scrollY.interpolate({
      inputRange: [0, headerHeight],
      outputRange: [0, -headerHeight],
      extrapolateRight: 'clamp',
    });
    return (
      <Animated.View
        style={[styles.header, { transform: [{ translateY: y }] }]}>
        <View
          onLayout={(event) =>
            setHeaderHeight(event.nativeEvent.layout.height + 24)
          }>
          <View style={styles.avatarAndStats}>
            <UserProfileAvatar avatar={avatar} />
            <UserProfileStats
              postNum={postNum}
              followersNum={followersNum}
              followingNum={followingNum}
            />
          </View>
          <UserProfileInfo name={name} bio={bio} />
          <UserProfileEditBtn avatar={avatar} name={name} bio={bio} />
        </View>
      </Animated.View>
    );
  };

  const renderLabel = ({ route, focused }: any) => {
    return route.key === 'tab1' ? (
      <MaterialCommunityIcons
        name="card-text-outline"
        size={16}
        color="white"
        style={{ opacity: focused ? 1 : 0.5 }}
      />
    ) : (
      <FontAwesome5
        name="user-tag"
        size={16}
        color="white"
        style={{ opacity: focused ? 1 : 0.5 }}
      />
    );
  };

  const renderScene = ({ route }: any) => {
    if (route.key === 'tab1') {
      return (
        <UserProfilePostList
          scrollY={scrollY}
          onMomentumScrollBegin={onMomentumScrollBegin}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollToTop={scrollToTop}
          headerHeight={headerHeight}
          tabBarHeight={TabBarHeight}
          currentTabIndex={tabIndex}
          onGetRef={(ref: any) => {
            if (ref) {
              const found = listRefArr.current.find(
                (e: any) => e.key === route.key,
              );
              if (!found) {
                listRefArr.current.push({
                  key: route.key,
                  value: ref,
                });
              }
            }
          }}
        />
      );
    }
    return (
      <UserProfileTaggedPostList
        scrollY={scrollY}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToTop={scrollToTop}
        headerHeight={headerHeight}
        tabBarHeight={TabBarHeight}
        currentTabIndex={tabIndex}
        onGetRef={(ref: any) => {
          if (ref) {
            const found = listRefArr.current.find(
              (e: any) => e.key === route.key,
            );
            if (!found) {
              listRefArr.current.push({
                key: route.key,
                value: ref,
              });
            }
          }
        }}
      />
    );
  };

  const renderTabBar = (neededProps: any) => {
    const y = scrollY.interpolate({
      inputRange: [0, headerHeight],
      outputRange: [headerHeight, 0],
      extrapolateRight: 'clamp',
    });
    return (
      <Animated.View
        style={{
          top: 0,
          zIndex: 1,
          position: 'absolute',
          transform: [{ translateY: y }],
          width: '100%',
        }}>
        <TabBar
          {...neededProps}
          onTabPress={({ preventDefault }) => {
            if (isListGliding.current) {
              preventDefault();
            }
          }}
          style={styles.tab}
          tabStyle={{ minHeight: 30 }}
          renderLabel={renderLabel}
          indicatorStyle={styles.indicator}
        />
      </Animated.View>
    );
  };

  const renderTabView = () => {
    return (
      <TabView
        onIndexChange={(index) => setIndex(index)}
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        initialLayout={{
          height: 0,
          width: Layout.window.width,
        }}
      />
    );
  };

  const { avatar, name, bio, postNum, followersNum, followingNum } = props;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkColor }}>
      <View style={{ flex: 1 }}>
        {renderHeader()}
        {headerHeight !== 0 ? renderTabView() : null}
      </View>
    </SafeAreaView>
  );
};

const mapStateToProps = (state: AppState) => ({
  avatar: state.auth.user?.avatar,
  name: state.auth.user?.name,
  bio: state.auth.user?.bio,
  postNum: state.auth.user?.totalPosts,
  followersNum: state.auth.user?.followers,
  followingNum: state.auth.user?.following,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkColor,
  },
  header: {
    top: 0,
    width: '100%',
    position: 'absolute',
    padding: 12,
    zIndex: 200,
    backgroundColor: Colors.darkColor,
  },
  avatarAndStats: {
    width: '100%',
    flexDirection: 'row',
  },
  tab: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: Colors.darkColor,
    borderTopColor: Colors.brightColor,
    borderTopWidth: 1,
  },
  indicator: { backgroundColor: 'white', height: 1 },
});

export default connect(mapStateToProps, null)(ProfileScreen);
