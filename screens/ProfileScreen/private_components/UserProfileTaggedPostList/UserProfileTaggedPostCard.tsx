import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../../../components';
import { AppState } from '../../../../redux/store';
import { likePost, unlikePost } from '../../../../redux/posts/actions';
import { checkPostChanged } from '../../../../utils/functions';
import { Post } from '../../../../models';

interface UserProfileTaggedPostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  navigation: any;
  isTabFocused: boolean;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
}

class UserProfileTaggedPostCard extends Component<
  UserProfileTaggedPostCardProps
> {
  shouldComponentUpdate(nextProps: UserProfileTaggedPostCardProps) {
    const { currentViewableIndex, index, data, isTabFocused } = this.props;

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
    if (isTabFocused !== nextProps.isTabFocused) {
      return true;
    }
    return false;
  }

  navigateToPost = () => {
    const { navigation, data } = this.props;
    navigation.push('PostScreen', {
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
      isTabFocused,
    } = this.props;
    // console.log('taged post card ', index);
    return (
      <PostCard
        data={data}
        currentViewableIndex={currentViewableIndex}
        index={index}
        navigation={navigation}
        isTabFocused={isTabFocused}
        navigateWhenPressOnPostOrComment={this.navigateToPost}
        navigateWhenPressOnUsernameOrAvatar={this.navigateToUserProfile}
        performLikePost={this.performLikePost}
        performUnlikePost={this.performUnlikePost}
      />
    );
  }
}

interface HOCHomePostCardProps {
  // TODO make data as Post type
  data: any;
  currentViewableIndex: number;
  index: number;
  isTabFocused: boolean;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
}

const mapStateToProps = (state: AppState) => ({
  currentViewableIndex: state.postListIndices.currentUserTaggedListPostIndex,
});

const mapDispathToProps = {
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
      // console.log('user card out ', props.index);

      return <UserProfileTaggedPostCard {...props} navigation={navigation} />;
    },
    (prevProps, nextProps) => {
      if (checkPostChanged(prevProps.data, nextProps.data)) {
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
      if (prevProps.isTabFocused !== nextProps.isTabFocused) {
        return false;
      }
      return true;
    },
  ),
);
