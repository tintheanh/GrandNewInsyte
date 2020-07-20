import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { checkUserTagsChanged } from '../utils/functions';
import { UserResult } from '../models';

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
];

interface TagListProps {
  userTags: Array<UserResult>;
  onEndReached: () => void;
}

export default React.memo(
  function TagList({ userTags, onEndReached }: TagListProps) {
    const _onEndReached = ({
      distanceFromEnd,
    }: {
      distanceFromEnd: number;
    }) => {
      if (distanceFromEnd < 0) {
        return;
      }
      console.log('end');
      onEndReached();
    };

    return (
      <SafeAreaView>
        <FlatList
          data={userTags}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Image
                source={
                  item.avatar.length
                    ? { uri: item.avatar }
                    : require('../assets/user.png')
                }
                defaultSource={require('../assets/user.png')}
                style={styles.avatar}
              />
              <View style={styles.nameWrapper}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </View>
          )}
          removeClippedSubviews={false}
          onEndReached={_onEndReached}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          // maxToRenderPerBatch={1}
          onEndReachedThreshold={0.1}
          // windowSize={3}
        />
      </SafeAreaView>
    );
  },
  (prevProps, nextProps) => {
    if (checkUserTagsChanged(prevProps.userTags, nextProps.userTags)) {
      return false;
    }
    return true;
  },
);

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
