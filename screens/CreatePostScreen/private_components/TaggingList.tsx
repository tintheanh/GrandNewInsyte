import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../constants';

const DATA = [
  {
    id: '1',
    username: 'test',
    name: 'Anh Nguyen',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
  },
  {
    id: '2',
    username: 'test',
    name: 'Anh Nguyen',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
  },
  {
    id: '3',
    username: 'test',
    name: 'Anh Nguyen',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
  },
  {
    id: '4',
    username: 'test',
    name: 'Anh Nguyen',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
  },
  {
    id: '5',
    username: 'test',
    name: 'Anh Nguyen',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
  },
  {
    id: '6',
    username: 'test',
    name: 'Anh Nguyen',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
  },
];

export default function TaggingList() {
  return (
    <SafeAreaView>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <Image
              source={{
                uri: item.avatar.length
                  ? item.avatar
                  : require('../../../assets/user.png'),
              }}
              defaultSource={require('../../../assets/user.png')}
              style={styles.avatar}
            />
            <View style={styles.nameWrapper}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.name}>{item.name}</Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameWrapper: {
    justifyContent: 'space-evenly',
    paddingLeft: 8,
  },
  username: {
    color: 'white',
  },
  name: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
