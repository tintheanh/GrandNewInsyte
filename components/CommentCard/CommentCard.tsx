import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import {
  Avatar,
  CommentSection,
  InteractionSection,
  ReplySection,
} from './private_components';

interface CommentCardProps {
  avatar: string;
  username: string;
  content: string;
  datePosted: number;
  likes: number;
  firstReply: {
    avatar: string;
    username: string;
    content: string;
    datePosted: number;
    likes: number;
  } | null;
  totalReplies: number;
}

export default class CommentCard extends PureComponent<CommentCardProps> {
  render() {
    const {
      avatar,
      username,
      content,
      datePosted,
      likes,
      firstReply,
      totalReplies,
    } = this.props;

    return (
      <View style={styles.container}>
        <Avatar avatar={avatar} />
        <View style={{ marginLeft: 12 }}>
          <CommentSection
            username={username}
            datePosted={datePosted}
            content={content}
          />
          <InteractionSection likes={likes} />
          {firstReply ? (
            <ReplySection
              avatar={firstReply.avatar}
              username={firstReply.username}
              datePosted={firstReply.datePosted}
              content={firstReply.content}
              likes={firstReply.likes}
              totalReplies={totalReplies}
            />
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brightColor,
  },
});
