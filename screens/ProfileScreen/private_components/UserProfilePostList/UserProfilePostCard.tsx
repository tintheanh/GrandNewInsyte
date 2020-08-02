import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../../../components';
import { AppState } from '../../../../redux/store';
import {
  deletePost,
  likePost,
  unlikePost,
} from '../../../../redux/posts/actions';
import { decreaseTotalPostsByOne } from '../../../../redux/auth/actions';
import { checkPostChanged } from '../../../../utils/functions';
import { Post } from '../../../../models';

interface UserProfilePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  navigation: any;
  isTabFocused: boolean;
  onDeletePost: (postID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
  onDecreaseTotalPostsByOne: () => void;
}

class UserProfilePostCard extends Component<UserProfilePostCardProps> {
  state = { shouldPlayMedia: true };
  private onBlur: () => void = () => {};
  private onFocus: () => void = () => {};

  componentDidMount() {
    const { navigation } = this.props;
    this.onBlur = navigation.addListener('blur', () => {
      this.setState({ shouldPlayMedia: false });
    });
    this.onFocus = navigation.addListener('focus', () => {
      this.setState({ shouldPlayMedia: true });
    });
  }

  componentWillUnmount() {
    this.onBlur();
    this.onFocus();
  }

  shouldComponentUpdate(nextProps: UserProfilePostCardProps, nextState: any) {
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
    if (this.state.shouldPlayMedia !== nextState.shouldPlayMedia) {
      return true;
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

  performDeletePost = () => {
    this.props.onDeletePost(this.props.data.id);
    this.props.onDecreaseTotalPostsByOne();
  };

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
    const { data, currentViewableIndex, index, isTabFocused } = this.props;
    // console.log('user post card ', index);
    return (
      <PostCard
        data={data}
        currentViewableIndex={currentViewableIndex}
        index={index}
        isTabFocused={isTabFocused}
        shouldPlayMedia={this.state.shouldPlayMedia}
        navigateWhenPressOnPostOrComment={this.navigateToPost}
        navigateWhenPressOnUsernameOrAvatar={this.navigateToUserProfile}
        userPostControl={this.postControl}
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
  isTabFocused: boolean;
  onDeletePost: (postID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
  onDecreaseTotalPostsByOne: () => void;
}

const mapStateToProps = (state: AppState) => ({
  currentViewableIndex: state.postListIndices.currentUserListPostIndex,
});

const mapDispathToProps = {
  onDeletePost: deletePost,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
  onDecreaseTotalPostsByOne: decreaseTotalPostsByOne,
};

export default connect(
  mapStateToProps,
  mapDispathToProps,
)(
  React.memo(
    function (props: HOCHomePostCardProps) {
      const navigation = useNavigation();
      // console.log('user card out ', props.index);

      return <UserProfilePostCard {...props} navigation={navigation} />;
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
