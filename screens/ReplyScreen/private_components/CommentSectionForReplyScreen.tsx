import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Avatar,
  InteractionSection,
  CommentSection,
} from '../../../components';
import { Colors } from '../../../constants';
import { Comment } from '../../../models';

interface Props {
  comment: Comment;
  likeComment: () => void;
  unlikeComment: () => void;
  userControl?: () => void;
}

export default function CommentSectionForReplyScreen({
  comment,
  likeComment,
  unlikeComment,
  userControl,
}: Props) {
  return (
    <View style={styles.commentContainer}>
      <Avatar
        avatar={comment.user.avatar}
        onPress={() => console.log('to user screen')}
      />
      <View style={{ marginLeft: 12 }}>
        <CommentSection
          username={comment.user.username}
          datePosted={comment.datePosted}
          content={comment.content}
          userControl={userControl}
        />
        <InteractionSection
          likes={comment.likes}
          replies={comment.replies}
          isLiked={comment.isLiked}
          likeComment={likeComment}
          unlikeComment={unlikeComment}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    backgroundColor: Colors.darkColor,
    borderBottomColor: Colors.brightColor,
  },
});
