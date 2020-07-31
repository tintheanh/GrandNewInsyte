import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { convertTime } from '../utils/functions';
import { Layout, MaterialCommunityIcons } from '../constants';

interface CommentSectionProps {
  username: string;
  datePosted: number;
  content: string;
  userControl?: undefined | (() => void);
  navigateToUserScreen?: () => void;
}

export default function CommentSection({
  username,
  datePosted,
  content,
  userControl,
  navigateToUserScreen,
}: CommentSectionProps) {
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableWithoutFeedback onPress={navigateToUserScreen}>
          <Text style={styles.username}>{username}</Text>
        </TouchableWithoutFeedback>
        <Text style={styles.date}>{convertTime(datePosted)}</Text>
        {userControl ? (
          <View
            style={{
              flexGrow: 1,
            }}>
            <TouchableWithoutFeedback onPress={userControl}>
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={20}
                color="rgba(255,255,255, 0.6)"
                style={{ alignSelf: 'flex-end' }}
              />
            </TouchableWithoutFeedback>
          </View>
        ) : null}
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
