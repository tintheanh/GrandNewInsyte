import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { FontAwesome5 } from '../../../constants';
import HomePublicPostList from './HomePublicPostList/HomePublicPostList';
import HomeFollowingPostList from './HomeFollowingPostList/HomeFollowingPostList';
import Layout from '../../../constants/Layout';
import Colors from '../../../constants/Colors';

const initialLayout = { width: Layout.window.width };

export default function HomeAuth() {
  const [tabIndex, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
  ]);

  const renderScene = ({ route }: any) => {
    if (route.key === 'first') {
      return <HomePublicPostList currentTabIndex={tabIndex} />;
    }
    return <HomeFollowingPostList currentTabIndex={tabIndex} />;
  };

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
      navigationState={{ index: tabIndex, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={(index) => setIndex(index)}
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
