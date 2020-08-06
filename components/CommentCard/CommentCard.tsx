import React from 'react';
import { View, StyleSheet } from 'react-native';
import CommentSection from '../CommentSection';
import Avatar from '../Avatar';
import { Comment } from '../../models';
import InteractionSection from '../InteractionSection';
import {
  Colors,
  pendingCommentID,
  pendingDeleteCommentFlag,
} from '../../constants';

interface CommentCardProps {
  /**
   * Comment data
   */
  data: Comment;

  /**
   * Method like comment
   */
  likeComment: () => void;

  /**
   * Method unlike comment
   */
  unlikeComment: () => void;

  /**
   * Method navigate to reply screen
   */
  navigateToReplyScreen: () => void;

  /**
   * Method navigate to user screen
   */
  navigateToUserScreen: () => void;

  /**
   * Optional method used to delete comment.
   * Only comments that belong to the current user
   * can have this method
   */
  userControl?: () => void;
}

export default React.memo(
  function CommentCard({
    data,
    userControl,
    likeComment,
    unlikeComment,
    navigateToUserScreen,
    navigateToReplyScreen,
  }: CommentCardProps) {
    const { id, user, content, datePosted, replies, likes, isLiked } = data;

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
        <Avatar avatar={user.avatar} onPress={navigateToUserScreen} />
        <View style={{ marginLeft: 12 }}>
          <CommentSection
            username={user.username}
            datePosted={datePosted}
            content={content}
            userControl={userControl}
            navigateToUserScreen={navigateToUserScreen}
          />
          <InteractionSection
            likes={likes}
            replies={replies}
            isLiked={isLiked}
            likeComment={likeComment}
            unlikeComment={unlikeComment}
            toReplyScreen={navigateToReplyScreen}
          />
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.data.likes !== nextProps.data.likes) {
      return false;
    }
    if (prevProps.data.replies !== nextProps.data.replies) {
      return false;
    }
    return true;
  },
);

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
