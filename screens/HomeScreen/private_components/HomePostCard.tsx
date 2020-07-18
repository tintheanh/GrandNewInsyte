import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../../components';
import { AppState } from '../../../redux/store';
import { deletePost, likePost, unlikePost } from '../../../redux/posts/actions';
import { Post } from '../../../models';

interface HomePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  currentUID: string | undefined;
  navigation: any;
  onDeletePost: (postID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
}

class HomePostCard extends Component<HomePostCardProps> {
  shouldComponentUpdate(nextProps: HomePostCardProps) {
    const { currentViewableIndex, index, data } = this.props;

    if (
      data.isLiked !== nextProps.data.isLiked ||
      data.timeLabel !== nextProps.data.timeLabel ||
      data.id !== nextProps.data.id ||
      data.caption !== nextProps.data.caption ||
      data.likes !== nextProps.data.likes ||
      data.comments !== nextProps.data.comments ||
      data.user.avatar !== nextProps.data.user.avatar
    ) {
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

  navigateToPost = () => {
    const { navigation, data } = this.props;
    navigation.push('Post', {
      data,
      title: `${data.user.username}'s post`,
    });
  };

  navigateToUserProfile = () => {
    const { navigation, data } = this.props;
    navigation.push('User', {
      title: data.user.username,
      avatar: data.user.avatar,
    });
  };

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
      navigation,
      currentUID,
    } = this.props;

    // console.log('home card', data);
    // console.log('home card', index);
    return (
      <PostCard
        data={data}
        currentViewableIndex={currentViewableIndex}
        index={index}
        navigation={navigation}
        navigateWhenClickOnPostOrComment={this.navigateToPost}
        navigateWhenClickOnUsernameOrAvatar={this.navigateToUserProfile}
        userPostControl={
          data.user.id === currentUID ? this.postControl : undefined
        }
        performLikePost={this.performLikePost}
        performUnlikePost={this.performUnlikePost}
      />
    );
  }
}

interface HOCHomePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  currentUID: string | undefined;
  onDeletePost: (postID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
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

export default connect(
  mapStateToProps,
  mapDispathToProps,
)(
  React.memo(
    function (props: HOCHomePostCardProps) {
      const navigation = useNavigation();
      // console.log('home card ', props.index);

      return <HomePostCard {...props} navigation={navigation} />;
    },
    (prevProps, nextProps) => {
      if (
        prevProps.data.isLiked !== nextProps.data.isLiked ||
        prevProps.data.timeLabel !== nextProps.data.timeLabel ||
        prevProps.data.id !== nextProps.data.id ||
        prevProps.data.caption !== nextProps.data.caption ||
        prevProps.data.likes !== nextProps.data.likes ||
        prevProps.data.comments !== nextProps.data.comments ||
        prevProps.data.user.avatar !== nextProps.data.user.avatar
      ) {
        return false;
      }
      if (prevProps.data.media.length === 0) {
        return true;
      }
      if (
        prevProps.data.media.length === 1 &&
        prevProps.data.media[0].type === 'image'
      ) {
        return true;
      }
      if (
        prevProps.currentViewableIndex === prevProps.index ||
        nextProps.currentViewableIndex === prevProps.index
      ) {
        return false;
      }
      return true;
    },
  ),
);
