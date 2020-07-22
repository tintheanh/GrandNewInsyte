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
  id: string;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
  content: string;
  datePosted: number;
  likes: number;
  replies: number;
  // firstReply: {
  //   avatar: string;
  //   username: string;
  //   content: string;
  //   datePosted: number;
  //   likes: number;
  // } | null;
}

export default class CommentCard extends PureComponent<CommentCardProps> {
  render() {
    const { user, content, datePosted, likes } = this.props;

    return (
      <View style={styles.container}>
        <Avatar avatar={user.avatar} />
        <View style={{ marginLeft: 12 }}>
          <CommentSection
            username={user.username}
            datePosted={datePosted}
            content={content}
          />
          <InteractionSection likes={likes} />
          {/* {firstReply ? (
            <ReplySection
              avatar={firstReply.avatar}
              username={firstReply.username}
              datePosted={firstReply.datePosted}
              content={firstReply.content}
              likes={firstReply.likes}
              totalReplies={totalReplies}
            />
          ) : null} */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkColor,
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
