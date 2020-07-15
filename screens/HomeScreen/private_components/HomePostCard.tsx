import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../../components';
import { AppState } from '../../../redux/store';
import { Post } from '../../../models';

interface HomePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  navigation: any;
}

class HomePostCard extends Component<HomePostCardProps> {
  shouldComponentUpdate(nextProps: HomePostCardProps) {
    const { currentViewableIndex, index, data } = this.props;

    if (
      data.id !== nextProps.data.id ||
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

  render() {
    const { data, currentViewableIndex, index, navigation } = this.props;
    // console.log('home card', index);
    return (
      <PostCard
        data={data}
        currentViewableIndex={currentViewableIndex}
        index={index}
        navigation={navigation}
        navigateWhenClickOnPostOrComment={this.navigateToPost}
        navigateWhenClickOnUsernameOrAvatar={this.navigateToUserProfile}
      />
    );
  }
}

interface HOCHomePostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
}

const mapStateToProps = (state: AppState) => ({
  currentViewableIndex: state.postListIndices.currentHomeListPostIndex,
});

export default connect(mapStateToProps)(
  React.memo(
    function (props: HOCHomePostCardProps) {
      const navigation = useNavigation();
      // console.log('home card ', props.index);

      return <HomePostCard {...props} navigation={navigation} />;
    },
    (prevProps, nextProps) => {
      if (
        prevProps.data.id !== nextProps.data.id ||
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
