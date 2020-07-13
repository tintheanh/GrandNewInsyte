import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { convertTime } from '../../../utils/functions';
import Layout from '../../../constants/Layout';

interface CommentSectionProps {
  username: string;
  datePosted: number;
  content: string;
}

export default function CommentSection({
  username,
  datePosted,
  content,
}: CommentSectionProps) {
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableWithoutFeedback
          onPress={() => console.log('to user profile')}>
          <Text style={styles.username}>{username}</Text>
        </TouchableWithoutFeedback>
        <Text style={styles.date}>{convertTime(datePosted)}</Text>
      </View>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: Layout.window.width - 40 - 14 - 20,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
});
