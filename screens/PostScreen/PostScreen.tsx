import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Alert } from 'react-native';
import { Colors } from '../../constants';
import { CommentCard } from '../../components';
import { PostSection } from './private_components';

const comments = [
  {
    id: '1',
    username: 'test',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
    content:
      'thisisacommentthisisacommentthisisacommentthisisacommentthisisacommentthisisacommentthisisacommentthisisacomment',
    firstReply: {
      username: 'lala',
      avatar:
        'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
      content:
        'lit af Pellentesque maximus leo et nibh tempor, vel lacinia purus faucibus',
      likes: 0,
      datePosted: 1593210234,
    },
    totalReplies: 22,
    datePosted: 1593210134,
    likes: 12,
  },
  {
    id: '2',
    username: 'test2',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque maximus leo et nibh tempor, vel lacinia purus faucibus. Aliquam pharetra enim eu lorem fringilla posuere. Sed in augue sem.',
    firstReply: null,
    datePosted: 1593210134,
    totalReplies: 0,
    likes: 4,
  },
  {
    id: '3',
    username: 'test2',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
    content: 'this is shit',
    firstReply: null,
    datePosted: 1593210134,
    totalReplies: 0,
    likes: 4,
  },
  {
    id: '4',
    username: 'test2',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
    content: 'this is shit',
    firstReply: null,
    datePosted: 1593210034,
    totalReplies: 0,
    likes: 4,
  },
  {
    id: '5',
    username: 'test2',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
    content: 'this is shit',
    firstReply: null,
    datePosted: 1593200134,
    totalReplies: 0,
    likes: 4,
  },
  {
    id: '6',
    username: 'test2',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
    content: 'this is shit',
    firstReply: null,
    datePosted: 1593110134,
    totalReplies: 0,
    likes: 4,
  },
];

for (let i = 0; i < 50; i++) {
  comments.push({
    id: '6' + i,
    username: 'test2',
    avatar:
      'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-2.jpg',
    content: 'this is shit',
    firstReply: null,
    datePosted: 1593110134,
    totalReplies: 0,
    likes: 4,
  });
}

export default function PostScreen({ route, navigation }: any) {
  const selectCommentFilter = () => {
    Alert.alert(
      '',
      'Sort comments by',
      [
        {
          text: 'Top comments',
          onPress: () => console.log('top'),
        },
        { text: 'New comments', onPress: () => console.log('new') },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      { cancelable: false },
    );
  };

  const toUserScreen = () =>
    navigation.push('User', {
      title: post.user.username,
      avatar: post.user.avatar,
    });

  const post = route.params.data;
  let iconPrivacy = '';
  switch (post.privacy) {
    case 'public':
      iconPrivacy = 'globe';
      break;
    case 'friends':
      iconPrivacy = 'users';
      break;
    default:
      iconPrivacy = 'lock';
      break;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <FlatList
          ListHeaderComponent={
            <PostSection
              avatar={post.user.avatar}
              username={post.user.username}
              datePosted={post.datePosted}
              iconPrivacy={iconPrivacy}
              caption={post.caption}
              media={post.media}
              likes={post.likes}
              comments={post.comments}
              navigateWhenClickOnUsernameOrAvatar={toUserScreen}
              selectCommentFilter={selectCommentFilter}
            />
          }
          data={comments}
          renderItem={({ item }) => (
            <CommentCard
              avatar={item.avatar}
              username={item.username}
              content={item.content}
              datePosted={item.datePosted}
              likes={item.likes}
              firstReply={item.firstReply}
              totalReplies={item.totalReplies}
            />
          )}
          keyExtractor={(item) => item.id}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkColor,
  },
});