import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../../components';
import { AppState } from '../../../redux/store';
import { Post } from '../../../models';

interface UserProfilePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  navigation: any;
  isTabFocused: boolean;
}

class UserProfilePostCard extends Component<UserProfilePostCardProps> {
  shouldComponentUpdate(nextProps: UserProfilePostCardProps) {
    const { currentViewableIndex, index, data, isTabFocused } = this.props;

    if (
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
    if (isTabFocused !== nextProps.isTabFocused) {
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

  render() {
    const {
      data,
      currentViewableIndex,
      index,
      navigation,
      isTabFocused,
    } = this.props;
    // console.log('user post card ', index);
    return (
      <PostCard
        data={data}
        currentViewableIndex={currentViewableIndex}
        index={index}
        navigation={navigation}
        isTabFocused={isTabFocused}
        navigateWhenClickOnPostOrComment={this.navigateToPost}
        navigateWhenClickOnUsernameOrAvatar={this.navigateToUserProfile}
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
}

const mapStateToProps = (state: AppState) => ({
  currentViewableIndex: state.postListIndices.currentUserListPostIndex,
});

export default connect(mapStateToProps)(
  React.memo(
    function (props: HOCHomePostCardProps) {
      const navigation = useNavigation();
      // console.log('user card out ', props.index);

      return <UserProfilePostCard {...props} navigation={navigation} />;
    },
    (prevProps, nextProps) => {
      if (
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
      if (prevProps.isTabFocused !== nextProps.isTabFocused) {
        return false;
      }
      return true;
    },
  ),
);
