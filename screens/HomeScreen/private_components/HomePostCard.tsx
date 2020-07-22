import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { PostCard } from '../../../components';
import { AppState } from '../../../redux/store';
import { deletePost, likePost, unlikePost } from '../../../redux/posts/actions';
import { checkPostChanged } from '../../../utils/functions';
import { Post } from '../../../models';

interface HomePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  currentUID: string | undefined;
  isTabFocused: boolean;
  onDeletePost: (postID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
}

class HomePostCard extends Component<HomePostCardProps> {
  shouldComponentUpdate(nextProps: HomePostCardProps) {
    const { isTabFocused, currentViewableIndex, index, data } = this.props;

    if (isTabFocused !== nextProps.isTabFocused) {
      return true;
    }

    if (checkPostChanged(data, nextProps.data)) {
      return true;
    }
    if (data.media.length === 0) {
      return false;
    }
    if (data.media.length === 1 && data.media[0].type === 'image') {
      return false;
    }
    if (
      currentViewableIndex === index ||
      nextProps.currentViewableIndex === index
    ) {
      return true;
    }
    return false;
  }

  performDeletePost = () => this.props.onDeletePost(this.props.data.id);

  postControl = () => {
    Alert.alert(
      '',
      'Do you want to delete your post?',
      [
        {
          text: 'Delete',
          onPress: this.performDeletePost,
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  performLikePost = () => {
    this.props.onLikePost(this.props.data.id);
  };

  performUnlikePost = () => {
    this.props.onUnlikePost(this.props.data.id);
  };

  render() {
    const {
      data,
      currentViewableIndex,
      index,
      currentUID,
      isTabFocused,
    } = this.props;

    // console.log('home card', index);
    return (
      <PostCard
        data={data}
        currentViewableIndex={currentViewableIndex}
        index={index}
        isTabFocused={isTabFocused}
        userPostControl={
          data.user.id === currentUID ? this.postControl : undefined
        }
        performLikePost={this.performLikePost}
        performUnlikePost={this.performUnlikePost}
      />
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  currentUID: state.auth.user?.id,
  currentViewableIndex: state.postListIndices.currentHomeListPostIndex,
});

const mapDispathToProps = {
  onDeletePost: deletePost,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
};

export default connect(mapStateToProps, mapDispathToProps)(HomePostCard);
