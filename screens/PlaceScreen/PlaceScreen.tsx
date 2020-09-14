import React, { Component, createRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import faker from 'faker';
import { checkPostListChanged } from '../../utils/functions';
import { PlaceInfo, PlacePostCardWrapper } from './private_components';
import { List, Loading, ErrorView, NothingView } from '../../components';
import { isIPhoneX, Layout, Colors, Feather, Entypo } from '../../constants';
import { Post } from '../../models';

const POSTS: any[] = [];

for (let i = 0; i < 20; i++) {
  POSTS.push({
    id: '3ac68afc' + i,
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    datePosted: parseInt((faker.date.past().getTime() / 1000).toFixed(0)),
    caption: faker.lorem.sentence(),
    privacy: 'friends',
    likes: parseInt(faker.random.number().toFixed(0)),
    comments: parseInt(faker.random.number().toFixed(0)),
    media: [
      {
        id: '1',
        uri: faker.image.image(),
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
        <View style={styles.listWrapper}>
          <List
            data={POSTS}
            renderItem={this.renderItem}
            listEmptyComponent={this.renderEmptyComponent()}
            listHeaderComponent={this.renderHeaderComponent()}
            listFooterComponent={
              <View style={{ paddingBottom: Layout.window.height / 10 }} />
            }
            checkChangesToUpdate={checkPostListChanged}
          />
        </View>
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
