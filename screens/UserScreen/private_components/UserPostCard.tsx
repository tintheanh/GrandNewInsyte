import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../../components';
import { AppState } from '../../../redux/store';

interface UserPostCardProps {
  // TODO make data as Post type
  data: any;
  currentViewableIndex: number;
  index: number;
  navigation: any;
  isTabFocused: boolean;
}

class UserPostCard extends Component<UserPostCardProps> {
  shouldComponentUpdate(nextProps: UserPostCardProps) {
    const { currentViewableIndex, index, data, isTabFocused } = this.props;

    if (data.media.length === 0) {
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

      return <UserPostCard {...props} navigation={navigation} />;
    },
    (prevProps, nextProps) => {
      if (prevProps.data.media.length === 0) {
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
