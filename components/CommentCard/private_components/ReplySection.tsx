import React from 'react';
import { View, TouchableWithoutFeedback, Text, StyleSheet } from 'react-native';
import { convertTime } from '../../../utils/functions';
import Avatar from './Avatar';
import InteractionSection from './InteractionSection';
import Layout from '../../../constants/Layout';

interface ReplySectionProps {
  avatar: string;
  username: string;
  datePosted: number;
  content: string;
  likes: number;
  totalReplies: number;
}

export default function ReplySection({
  avatar,
  username,
  datePosted,
  content,
  likes,
  totalReplies,
}: ReplySectionProps) {
  return (
    <View style={styles.replySection}>
      <Avatar avatar={avatar} />
      <View style={{ marginLeft: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableWithoutFeedback
            onPress={() => console.log('to user profile')}>
            <Text style={styles.username}>{username}</Text>
          </TouchableWithoutFeedback>
          <Text style={styles.date}>{convertTime(datePosted)}</Text>
        </View>
        <Text style={styles.content}>{content}</Text>
        <InteractionSection likes={likes} />
        {totalReplies > 1 ? (
          <TouchableWithoutFeedback onPress={() => console.log('to reply')}>
            <Text
              style={{
                color: 'white',
                fontSize: 10,
                fontWeight: 'bold',
                marginTop: 4,
              }}>
              {`View ${totalReplies - 1} ${
                totalReplies > 2 ? 'replies' : 'reply'
              }`}
            </Text>
          </TouchableWithoutFeedback>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  replySection: {
    flexDirection: 'row',
    marginTop: 8,
  },
  replyContent: {
    color: 'white',
    width: Layout.window.width - 40 - 40 - 14 - 36,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
  },
  date: {
    color: '#82858F',
    marginLeft: 8,
    marginTop: 1,
    fontSize: 12,
  },
  content: {
    color: 'white',
    width: Layout.window.width - 40 - 40 - 14 - 20,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
