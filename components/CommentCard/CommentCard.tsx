import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CommentSection from '../CommentSection';
import Avatar from '../Avatar';
import InteractionSection from '../InteractionSection';
import {
  Colors,
  pendingCommentID,
  pendingDeleteCommentFlag,
} from '../../constants';

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
}

export default React.memo(
  function CommentCard(props: CommentCardProps) {
    const navigation = useNavigation<any>();

    const {
      id,
      user,
      content,
      userControl = undefined,
      likeComment,
      unlikeComment,
      datePosted,
      replies,
      likes,
      isLiked,
    } = props;

    const toReplyScreen = () =>
      navigation.push('ReplyScreen', {
        comment: {
          id,
          user,
          content,
          datePosted,
          replies,
          likes,
          isLiked,
        },
      });

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
        <Avatar
          avatar={user.avatar}
          onPress={() => console.log('to user screeen')}
        />
        <View style={{ marginLeft: 12 }}>
          <CommentSection
            username={user.username}
            datePosted={datePosted}
            content={content}
            userControl={userControl}
          />
          <InteractionSection
            likes={likes}
            replies={replies}
            isLiked={isLiked}
            likeComment={likeComment}
            unlikeComment={unlikeComment}
            toReplyScreen={toReplyScreen}
          />
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.likes !== nextProps.likes) {
      return false;
    }
    if (prevProps.replies !== nextProps.replies) {
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
