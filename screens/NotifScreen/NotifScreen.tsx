import React, { Component } from 'react';
import { View, Text } from 'react-native';
import faker from 'faker';
import { Notification, List } from '../../components';
import { Colors } from '../../constants';

const NOTI = [
  {
    id: '1',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'like',
    target: 'post',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '2',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'like',
    target: 'post',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '3',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'comment',
    target: 'post',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '4',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'reply',
    target: 'comment',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '5',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'like',
    target: 'comment',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '6',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'like',
    target: 'post',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '7',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'like',
    target: 'reply',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '8',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'comment',
    target: 'post',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
  {
    id: '9',
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    type: 'reply',
    target: 'comment',
    time: parseInt(
      faker.date.between('2020-09-23', '2020-09-24').getTime().toFixed(0),
    ),
  },
].sort((b, a) => a.time - b.time);

export default class NotifScreen extends Component {
  renderNotifs = ({ item, index }: { item: any; index: number }) => {
    return (
      <Notification
        key={item.id}
        avatar={item.user.avatar}
        username={item.user.username}
        type={item.type}
        target={item.target}
        time={item.time}
      />
    );
  };

  render() {
    return (
      <View style={{ backgroundColor: Colors.brightColor }}>
        <List
          data={NOTI}
          renderItem={this.renderNotifs}
          checkChangesToUpdate={(prevProps, nextProps) => true}
        />
      </View>
    );
  }
}
