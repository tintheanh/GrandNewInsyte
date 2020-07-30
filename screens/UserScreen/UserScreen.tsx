// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Animated,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
// } from 'react-native';
// import { TabView, TabBar } from 'react-native-tab-view';
// import {
//   MaterialCommunityIcons,
//   FontAwesome5,
//   Colors,
//   Layout,
// } from '../../constants';
// import {
//   UserAvatar,
//   UserStats,
//   UserInfo,
//   UserListPost,
//   UserTaggedListPost,
// } from './private_components';

// // TODO a bug on tab bar when tap on top to scroll to

// // const tab1ItemSize = (Layout.window.width - 30) / 2;
// // const tab2ItemSize = (Layout.window.width - 40) / 3;
// const TabBarHeight = 36;

// const DATA = [
//   {
//     id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
//     user: {
//       username: 'ss1st',
//       avatar:
//         'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
//     },
//     datePosted: 1593110020,
//     caption: 'test capt 1111',
//     privacy: 'public',
//     likes: 23,
//     comments: 54,
//     media: [
//       {
//         id: '1',
//         uri:
//           'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
//         type: 'image',
//       },
//       {
//         id: '2',
//         uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
//         type: 'video',
//       },
//       {
//         id: '3',
//         uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
//         type: 'video',
//       },
//     ],
//   },
//   {
//     id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
//     user: {
//       username: 'test',
//       avatar:
//         'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
//     },
//     datePosted: 1593113184,
//     caption: 'test caption 2',
//     privacy: 'friends',
//     likes: 23,
//     comments: 54,
//     media: [
//       {
//         id: '1',
//         uri:
//           'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
//         type: 'image',
//       },
//       {
//         id: '2',
//         uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
//         type: 'video',
//       },
//     ],
//   },
//   {
//     id: '58694a0f-3da1-471f-bd96-145571e29d72',
//     user: {
//       username: 'test',
//       avatar:
//         'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
//     },
//     datePosted: 1583110020,
//     caption:
//       'test caption at 3 test caption at 3 test caption at 3 test caption at 3 test caption at 3 test caption at 3 test caption at 3',
//     privacy: 'private',
//     likes: 23,
//     comments: 54,
//     media: [],
//   },
//   {
//     id: '3ac68afc-c605-48d3-a4f8-fbd91af63',
//     user: {
//       username: 'test',
//       avatar:
//         'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
//     },
//     datePosted: 1593113184,
//     caption: 'test caption 4',
//     privacy: 'friends',
//     likes: 23,
//     comments: 54,
//     media: [
//       {
//         id: '1',
//         uri:
//           'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
//         type: 'image',
//       },
//       {
//         id: '2',
//         uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
//         type: 'video',
//       },
//     ],
//   },
// ];

// // for (let i = 0; i < 100; i++) {
// //   DATA.push({
// //     id: '3ac68afc' + i,
// //     user: {
// //       username: faker.internet.userName(),
// //       avatar: faker.image.avatar(),
// //     },
// //     datePosted: parseInt((faker.date.past().getTime() / 1000).toFixed(0)),
// //     caption: faker.lorem.sentence(),
// //     privacy: 'friends',
// //     likes: parseInt(faker.random.number().toFixed(0)),
// //     comments: parseInt(faker.random.number().toFixed(0)),
// //     media: [
// //       {
// //         id: '1',
// //         uri: faker.image.image(),
// //         type: 'image',
// //       },
// //     ],
// //   });
// // }

// const UserScreen = (props: any) => {
//   const [routes] = useState([
//     { key: 'tab1', title: 'Tab1' },
//     { key: 'tab2', title: 'Tab2' },
//   ]);
//   const [tabIndex, setIndex] = useState(0);
//   const [headerHeight, setHeaderHeight] = useState(0);
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const listRefArr = useRef([] as Array<{ key: string; value: FlatList }>);
//   const listOffset = useRef({} as { [key: string]: number });
//   const isListGliding = useRef(false);

//   useEffect(() => {
//     scrollY.addListener(({ value }) => {
//       const curRoute = routes[tabIndex].key;
//       listOffset.current[curRoute] = value;
//     });
//     return () => {
//       scrollY.removeAllListeners();
//     };
//   }, [routes, tabIndex]);

//   const syncScrollOffset = () => {
//     const curRouteKey = routes[tabIndex].key;
//     listRefArr.current.forEach((item) => {
//       if (item.key !== curRouteKey) {
//         if (
//           (scrollY as any)._value < headerHeight &&
//           (scrollY as any)._value >= 0
//         ) {
//           if (item.value) {
//             item.value.scrollToOffset({
//               offset: (scrollY as any)._value,
//               animated: false,
//             });
//             listOffset.current[item.key] = (scrollY as any)._value;
//           }
//         } else if ((scrollY as any)._value >= headerHeight) {
//           if (
//             listOffset.current[item.key] < headerHeight ||
//             listOffset.current[item.key] == null
//           ) {
//             if (item.value) {
//               item.value.scrollToOffset({
//                 offset: headerHeight,
//                 animated: false,
//               });
//               listOffset.current[item.key] = headerHeight;
//             }
//           }
//         }
//       }
//     });
//   };

//   const onMomentumScrollBegin = () => {
//     isListGliding.current = true;
//   };

//   const onMomentumScrollEnd = () => {
//     isListGliding.current = false;
//     syncScrollOffset();
//   };

//   const onScrollEndDrag = () => {
//     syncScrollOffset();
//   };

//   const scrollToTop = () => {
//     listRefArr.current.forEach((item) => {
//       item.value.scrollToOffset({
//         offset: 0,
//         animated: false,
//       });
//     });
//   };

//   const renderHeader = () => {
//     const y = scrollY.interpolate({
//       inputRange: [0, headerHeight],
//       outputRange: [0, -headerHeight],
//       extrapolateRight: 'clamp',
//     });
//     return (
//       <Animated.View
//         style={[styles.header, { transform: [{ translateY: y }] }]}>
//         <View
//           onLayout={(event) =>
//             setHeaderHeight(event.nativeEvent.layout.height + 24)
//           }>
//           <View style={styles.avatarAndStats}>
//             <UserAvatar avatar={data.avatar} />
//             <UserStats postNum={222} followersNum={222} followingNum={222} />
//           </View>
//           <UserInfo
//             name="Terry Crews"
//             bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed blandit
//           augue quis elit ultricies volutpat."
//           />
//         </View>
//       </Animated.View>
//     );
//   };

//   // const renderTab1Item = ({ item, index }: any) => {
//   //   return (
//   //     <View
//   //       style={{
//   //         borderRadius: 16,
//   //         marginLeft: index % 2 === 0 ? 0 : 10,
//   //         width: tab1ItemSize,
//   //         height: tab1ItemSize,
//   //         backgroundColor: '#aaa',
//   //         justifyContent: 'center',
//   //         alignItems: 'center',
//   //       }}>
//   //       <Text>{index}</Text>
//   //     </View>
//   //   );
//   // };

//   // const renderTab2Item = ({ item, index }: any) => {
//   //   return (
//   //     <View
//   //       style={{
//   //         marginLeft: index % 3 === 0 ? 0 : 10,
//   //         borderRadius: 16,
//   //         width: tab2ItemSize,
//   //         height: tab2ItemSize,
//   //         backgroundColor: '#aaa',
//   //         justifyContent: 'center',
//   //         alignItems: 'center',
//   //       }}>
//   //       <Text>{index}</Text>
//   //     </View>
//   //   );
//   // };

//   const renderLabel = ({ route, focused }: any) => {
//     return route.key === 'tab1' ? (
//       <MaterialCommunityIcons
//         name="card-text-outline"
//         size={16}
//         color="white"
//         style={{ opacity: focused ? 1 : 0.5 }}
//       />
//     ) : (
//       <FontAwesome5
//         name="user-tag"
//         size={16}
//         color="white"
//         style={{ opacity: focused ? 1 : 0.5 }}
//       />
//     );
//   };

//   const renderScene = ({ route }: any) => {
//     // let numCols: number;
//     // let data;
//     // let renderItem;
//     // switch (route.key) {
//     //   case 'tab1':
//     //     numCols = 2;
//     //     data = tab1Data;
//     //     renderItem = renderTab1Item;
//     //     break;
//     //   case 'tab2':
//     //     numCols = 3;
//     //     data = tab2Data;
//     //     renderItem = renderTab2Item;
//     //     break;
//     //   default:
//     //     return null;
//     // }
//     // return (
//     //   <TabScene
//     //     numCols={numCols}
//     //     data={data}
//     //     renderItem={renderItem}
//     //     scrollY={scrollY}
//     //     onMomentumScrollBegin={onMomentumScrollBegin}
//     //     onScrollEndDrag={onScrollEndDrag}
//     //     onMomentumScrollEnd={onMomentumScrollEnd}
//     //     headerHeight={headerHeight}
//     //     onGetRef={(ref: any) => {
//     //       if (ref) {
//     //         const found = listRefArr.current.find(
//     //           (e: any) => e.key === route.key
//     //         );
//     //         if (!found) {
//     //           listRefArr.current.push({
//     //             key: route.key,
//     //             value: ref,
//     //           });
//     //         }
//     //       }
//     //     }}
//     //   />
//     // );
//     if (route.key === 'tab1') {
//       return (
//         <UserListPost
//           data={DATA}
//           scrollY={scrollY}
//           onMomentumScrollBegin={onMomentumScrollBegin}
//           onScrollEndDrag={onScrollEndDrag}
//           onMomentumScrollEnd={onMomentumScrollEnd}
//           onScrollToTop={scrollToTop}
//           headerHeight={headerHeight}
//           tabBarHeight={TabBarHeight}
//           currentTabIndex={tabIndex}
//           onGetRef={(ref: any) => {
//             if (ref) {
//               const found = listRefArr.current.find(
//                 (e: any) => e.key === route.key,
//               );
//               if (!found) {
//                 listRefArr.current.push({
//                   key: route.key,
//                   value: ref,
//                 });
//               }
//             }
//           }}
//         />
//       );
//     }
//     return (
//       <UserTaggedListPost
//         data={DATA}
//         scrollY={scrollY}
//         onMomentumScrollBegin={onMomentumScrollBegin}
//         onScrollEndDrag={onScrollEndDrag}
//         onMomentumScrollEnd={onMomentumScrollEnd}
//         onScrollToTop={scrollToTop}
//         headerHeight={headerHeight}
//         tabBarHeight={TabBarHeight}
//         currentTabIndex={tabIndex}
//         onGetRef={(ref: any) => {
//           if (ref) {
//             const found = listRefArr.current.find(
//               (e: any) => e.key === route.key,
//             );
//             if (!found) {
//               listRefArr.current.push({
//                 key: route.key,
//                 value: ref,
//               });
//             }
//           }
//         }}
//       />
//     );
//   };

//   const renderTabBar = (props: any) => {
//     const y = scrollY.interpolate({
//       inputRange: [0, headerHeight],
//       outputRange: [headerHeight, 0],
//       extrapolateRight: 'clamp',
//     });
//     return (
//       <Animated.View
//         style={{
//           top: 0,
//           zIndex: 1,
//           position: 'absolute',
//           transform: [{ translateY: y }],
//           width: '100%',
//         }}>
//         <TabBar
//           {...props}
//           onTabPress={({ preventDefault }) => {
//             if (isListGliding.current) {
//               preventDefault();
//             }
//           }}
//           style={styles.tab}
//           tabStyle={{ minHeight: 30 }}
//           renderLabel={renderLabel}
//           indicatorStyle={styles.indicator}
//         />
//       </Animated.View>
//     );
//   };

//   const renderTabView = () => {
//     return (
//       <TabView
//         onIndexChange={(index) => setIndex(index)}
//         navigationState={{ index: tabIndex, routes }}
//         renderScene={renderScene}
//         renderTabBar={renderTabBar}
//         initialLayout={{
//           height: 0,
//           width: Layout.window.width,
//         }}
//       />
//     );
//   };

//   // console.log('user screen');
//   const data = props.route.params;
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkColor }}>
//       <View style={{ flex: 1 }}>
//         {renderHeader()}
//         {headerHeight !== 0 ? renderTabView() : null}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.darkColor,
//   },
//   header: {
//     top: 0,
//     width: '100%',
//     position: 'absolute',
//     padding: 12,
//   },
//   avatarAndStats: {
//     width: '100%',
//     flexDirection: 'row',
//   },
//   tab: {
//     elevation: 0,
//     shadowOpacity: 0,
//     backgroundColor: Colors.darkColor,
//   },
//   indicator: { backgroundColor: 'white', height: 1 },
// });

// export default UserScreen;

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { connect } from 'react-redux';
import { BigAvatar, UserStats, UserInfo, List } from '../../components';
import { UserPostCard } from './private_components';
import { Colors, MaterialCommunityIcons } from '../../constants';
import { AppState } from '../../redux/store';
import {
  fetchUser,
  popUsersLayer,
  setCurrentViewableListIndex,
} from '../../redux/usersStack/actions';
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
    this.props.onFetchUser(this.props.route.params.user.id);
  }

  componentWillUnmount() {
    this.unsubscribeDetectScreenGoBack();
  }

  onViewableItemsChanged = ({ viewableItems, _ }: any) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
      this.props.onSetCurrentViewableListIndex(viewableItems[0].index);
    }
  };

  renderItem = ({ item, index }: { item: Post; index: number }) => {
    const { currentTabIndex } = this.props;
    return (
      <UserPostCard
        index={index}
        data={item}
        isTabFocused={currentTabIndex ? currentTabIndex === 0 : true}
      />
    );
  };

  render() {
    const { user } = this.props.route.params;
    const { userLayer } = this.props;
    console.log('user screen render');
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
              <TouchableWithoutFeedback>
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

    if (userLayer.loading) {
      return (
        <View style={styles.container}>
          <View>
            <View style={styles.header}>
              <View style={styles.avatarAndStats}>
                <BigAvatar avatar={user.avatar} />
                <View style={styles.statWrapper}>
                  <UserStats postNum={0} followersNum={0} followingNum={0} />
                  <TouchableWithoutFeedback>
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

    return (
      <View style={styles.container}>
        <List
          data={userLayer.posts}
          renderItem={this.renderItem}
          onViewableItemsChanged={this.onViewableItemsChanged}
          onEndReached={() => console.log('end')}
          viewabilityConfig={this.viewabilityConfig}
          listHeaderComponent={header}
          checkChangesToUpdate={checkPostListChanged}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkColor },
  header: {
    width: '100%',
    padding: 12,
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
    borderBottomColor: Colors.brightColor,
    borderBottomWidth: 2,
    paddingTop: 8,
    paddingBottom: 8,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(UserScreen);
