import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../../components';
import { likePost, unlikePost } from '../../../redux/posts/actions';
import { pushCommentsLayer } from '../../../redux/commentsStack/actions';
import { AppState } from '../../../redux/store';
import { Post } from '../../../models';
import { checkPostChanged } from '../../../utils/functions';

interface UserPostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  navigation: any;
  isTabFocused: boolean;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
  onPushCommentsLayer: (postID: string) => void;
}

class UserPostCard extends Component<UserPostCardProps> {
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

  shouldComponentUpdate(nextProps: UserPostCardProps, nextState: any) {
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
    if (this.state.shouldPlayMedia !== nextState.shouldPlayMedia) {
      return true;
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
    this.props.onPushCommentsLayer(data.id);
    navigation.push('PostScreen', {
      data,
      title: `${data.user.username}'s post`,
    });
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
        performLikePost={this.performLikePost}
        performUnlikePost={this.performUnlikePost}
        navigateWhenClickOnPostOrComment={this.navigateToPost}
      />
    );
  }
}

interface HOCHomePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  isTabFocused: boolean;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
  onPushCommentsLayer: (postID: string) => void;
}

const mapStateToProps = (state: AppState) => {
  const { currentTab } = state.usersStack;
  return {
    currentViewableIndex:
      state.usersStack[currentTab].top()?.currentViewableIndex ?? 0,
    onLikePost: likePost,
    onUnlikePost: unlikePost,
  };
};

const mapDispatchToProps = {
  onPushCommentsLayer: pushCommentsLayer,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  React.memo(
    function (props: HOCHomePostCardProps) {
      const navigation = useNavigation();
      // console.log('user card out ', props.index);

      return <UserPostCard {...props} navigation={navigation} />;
    },
    (prevProps, nextProps) => {
      if (prevProps.isTabFocused !== nextProps.isTabFocused) {
        return false;
      }

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
      return true;
    },
  ),
);
