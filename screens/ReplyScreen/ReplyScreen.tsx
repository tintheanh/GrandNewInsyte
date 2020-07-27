import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CommentSection from '../../components/CommentSection';
import Avatar from '../../components/Avatar';
import InteractionSection from '../../components/InteractionSection';
import ReplyCard from '../../components/ReplyCard';
import { Colors } from '../../constants';
import { userInfo } from 'os';

class ReplyScreen extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      comment: this.props.route.params.comment,
    };
  }
  render() {
    const { comment } = this.state;
    const commentSection = (
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
          />
          <InteractionSection
            likes={comment.likes}
            replies={comment.replies}
            isLiked={comment.isLiked}
            likeComment={() => console.log('like')}
            unlikeComment={() => console.log('unlike')}
          />
        </View>
      </View>
    );
    return (
      <View style={styles.container}>
        {commentSection}
        <ReplyCard
          id="test"
          user={comment.user}
          isLiked={false}
          content="test rply"
          datePosted={1595700322000}
          likes={0}
          likeReply={() => console.log('like')}
          unlikeReply={() => console.log('unlike')}
        />
        <ReplyCard
          id="test"
          user={comment.user}
          isLiked={false}
          content="test rply"
          datePosted={1595700322000}
          likes={0}
          likeReply={() => console.log('like')}
          unlikeReply={() => console.log('unlike')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkColor,
    flex: 1,
  },
  commentContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brightColor,
  },
});

export default ReplyScreen;
