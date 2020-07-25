import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import {
  Avatar,
  CommentSection,
  InteractionSection,
  ReplySection,
} from './private_components';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';

interface CommentCardProps {
  id: string;
  user: {
    id: string;
    avatar: string;
    username: string;
  };
  isLiked: boolean;
  content: string;
  datePosted: number;
  likes: number;
  replies: number;
  likeComment: () => void;
  unlikeComment: () => void;
  userControl?: () => void;
  // firstReply: {
  //   avatar: string;
  //   username: string;
  //   content: string;
  //   datePosted: number;
  //   likes: number;
  // } | null;
}

export default class CommentCard extends Component<CommentCardProps> {
  shouldComponentUpdate(nextProps: CommentCardProps) {
    if (this.props.likes !== nextProps.likes) {
      return true;
    }
    if (this.props.replies !== nextProps.replies) {
      return true;
    }
    return false;
  }

  render() {
    const {
      id,
      user,
      content,
      userControl = undefined,
      likeComment,
      unlikeComment,
      datePosted,
      repliable,
      likes,
      isLiked,
    } = this.props;
    return (
      <View
        style={[
          styles.container,
          {
            opacity:
              id === pendingCommentID || id.includes(pendingDeleteCommentFlag)
                ? 0.4
                : 1,
          },
        ]}>
        <Avatar avatar={user.avatar} />
        <View style={{ marginLeft: 12 }}>
          <CommentSection
            username={user.username}
            datePosted={datePosted}
            content={content}
            userControl={userControl}
          />
          <InteractionSection
            likes={likes}
            isLiked={isLiked}
            likeComment={likeComment}
            unlikeComment={unlikeComment}
          />
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
