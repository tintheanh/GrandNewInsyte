import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { FontAwesome5 } from '../../../constants';
import HomePublicPostList from './HomePublicPostList/HomePublicPostList';
import HomeFollowingPostList from './HomeFollowingPostList/HomeFollowingPostList';
import Layout from '../../../constants/Layout';
import Colors from '../../../constants/Colors';

const initialLayout = { width: Layout.window.width };

export default function HomeAuth() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
  ]);

  const FirstRoute = () => <HomePublicPostList currentTabIndex={index} />;

  const SecondRoute = () => <HomeFollowingPostList currentTabIndex={index} />;

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const renderLabel = ({ route, focused }: any) => {
    return route.key === 'first' ? (
      <FontAwesome5
        name="globe"
        size={16}
        color="white"
        style={{ opacity: focused ? 1 : 0.5 }}
      />
    ) : (
      <FontAwesome5
        name="users"
        size={16}
        color="white"
        style={{ opacity: focused ? 1 : 0.5 }}
      />
    );
  };

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        style={styles.tab}
        tabStyle={{ minHeight: 30 }}
        renderLabel={renderLabel}
        indicatorStyle={styles.indicator}
      />
    );
  };

  // console.log('home auth');
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      lazy
    />
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  tab: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: Colors.darkColor,
  },
  indicator: { backgroundColor: 'white', height: 1 },
});
