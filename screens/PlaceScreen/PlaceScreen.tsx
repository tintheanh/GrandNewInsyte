import React, { Component, createRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import faker from 'faker';
import { checkPostListChanged, convertTime } from '../../utils/functions';
import { PlaceInfo, PlacePostCardWrapper } from './private_components';
import { List, Loading, ErrorView, NothingView } from '../../components';
import { isIPhoneX, Layout, Colors, Feather, Entypo } from '../../constants';
import { Post } from '../../models';

const POSTS: any[] = [];

for (let i = 0; i < 20; i++) {
  const date = parseInt(
    faker.date.between('2020-09-20', '2020-09-23').getTime().toFixed(0),
  );
  POSTS.push({
    id: '3ac68afc' + i,
    user: {
      username: 'Leblanc Cafe',
      avatar: 'https://content3.jdmagicbox.com/comp/kolkata/p8/033pxx33.xx33.140704150425.m2p8/catalogue/chinese-cafe-isi-kolkata-home-delivery-restaurants-nqpfmafdql.jpg',
    },
    datePosted: date,
    timeLabel: convertTime(date),
    caption: faker.lorem.sentence(),
    privacy: 'public',
    likes: parseInt(faker.random.number().toFixed(0)),
    comments: parseInt(faker.random.number().toFixed(0)),
    media: [
      {
        id: '1',
        url: 'https://content3.jdmagicbox.com/comp/kolkata/p8/033pxx33.xx33.140704150425.m2p8/catalogue/chinese-cafe-isi-kolkata-home-delivery-restaurants-nqpfmafdql.jpg',
        type: 'image',
      },
    ],
  });
}

export default class PlaceScreen extends Component<any> {
  renderEmptyComponent = () => {
    return <NothingView />;
  };

  renderHeaderComponent = () => {
    return <PlaceInfo goBack={this.props.navigation.goBack} />;
  };

  renderItem = ({ item, index }: { item: Post; index: number }) => {
    const { route, navigation } = this.props;
    return (
      <PlacePostCardWrapper
        index={index}
        currentTabScreen={route.params.currentTabScreen}
        data={item}
        addScreenListener={navigation.addListener}
        // performLikePost={this.performLikePost(item.id)}
        // performUnlikePost={this.performUnlikePost(item.id)}
        // navigateWhenPressOnPostOrComment={this.navigateToPostScreen(item)}
        // navigateWhenPressOnTag={this.navigateWhenPressOnTag}
      />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent={true} />
        <List
          data={[]}
          renderItem={this.renderItem}
          listEmptyComponent={this.renderEmptyComponent()}
          listHeaderComponent={this.renderHeaderComponent()}
          listFooterComponent={
            <View style={{ paddingBottom: Layout.window.height / 10 }} />
          }
          checkChangesToUpdate={checkPostListChanged}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brightColor,
    flex: 1,
  },
  listWrapper: {
    position: 'absolute',
    top: isIPhoneX() ? -44 : -20,
  },
  loadingWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
