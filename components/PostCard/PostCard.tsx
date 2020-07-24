import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  Colors,
  MaterialCommunityIcons,
  pendingDeletePostFlag,
  pendingPostID,
} from '../../constants';
import Carousel from '../Carousel';
import { UserSection, Caption, InteractionSection } from './private_components';
import { checkPostChanged } from '../../utils/functions';
import { pushPostLayer } from '../../redux/postComments/actions';
import { Post } from '../../models';

interface PostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  navigation: any;
  isTabFocused?: boolean;
  userPostControl?: () => void;
  performLikePost: () => void;
  performUnlikePost: () => void;
  onPushPostLayer: (postID: string) => void;
}

class PostCard extends Component<PostCardProps> {
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

  shouldComponentUpdate(nextProps: PostCardProps, nextState: any) {
    const { data, currentViewableIndex, index, isTabFocused } = this.props;

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
    if (isTabFocused !== nextProps.isTabFocused) {
      return true;
    }
    if (currentViewableIndex === nextProps.currentViewableIndex) {
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

  navigateWhenClickOnPostOrComment = () => {
    const { navigation, data, onPushPostLayer } = this.props;
    onPushPostLayer(data.id);
    navigation.push('Post', {
      data,
      title: `${data.user.username}'s post`,
    });
  };

  navigateWhenClickOnUsernameOrAvatar = () => {
    //   const { navigation, data } = this.props;
    //   navigation.push('User', {
    //     title: data.user.username,
    //     avatar: data.user.avatar,
    //   });
  };

  // processMedia = () => this.props.data.media.map((md) => ({ url: md.url }));

  render() {
    const {
      data,
      currentViewableIndex,
      index,
      isTabFocused = true,
      userPostControl = undefined,
      performLikePost,
      performUnlikePost,
    } = this.props;

    // console.log('card ', index);
    let iconPrivacy = '';
    switch (data.privacy) {
      case 'public':
        iconPrivacy = 'globe';
        break;
      case 'followers':
        iconPrivacy = 'users';
        break;
      default:
        iconPrivacy = 'lock';
        break;
    }
    return (
      <View
        pointerEvents={
          data.id === pendingPostID || data.id.includes(pendingDeletePostFlag)
            ? 'none'
            : 'auto'
        }
        style={{
          ...styles.container,
          opacity:
            data.id === pendingPostID || data.id.includes(pendingDeletePostFlag)
              ? 0.4
              : 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 12,
            paddingRight: 12,
          }}>
          <View style={{ flexGrow: 1 }}>
            <UserSection
              avatar={data.user.avatar}
              username={data.user.username}
              timeLabel={data.timeLabel}
              iconPrivacy={iconPrivacy}
              navigateWhenClickOnPostOrComment={
                this.navigateWhenClickOnPostOrComment
              }
              navigateWhenClickOnUsernameOrAvatar={
                this.navigateWhenClickOnUsernameOrAvatar
              }
            />
          </View>
          {data.id === pendingPostID ||
          data.id.includes(pendingDeletePostFlag) ? (
            <View>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : userPostControl ? (
            <TouchableWithoutFeedback onPress={userPostControl}>
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={20}
                color="rgba(255,255,255, 0.6)"
                style={{ marginTop: -5 }}
              />
            </TouchableWithoutFeedback>
          ) : null}
        </View>
        <Caption
          caption={data.caption}
          navigateWhenClickOnPostOrComment={
            this.navigateWhenClickOnPostOrComment
          }
        />
        {data.media.length ? (
          <Carousel
            items={data.media}
            shouldPlayMedia={
              this.state.shouldPlayMedia &&
              currentViewableIndex === index &&
              isTabFocused
            }
          />
        ) : null}
        <InteractionSection
          isLiked={data.isLiked}
          likes={data.likes}
          comments={data.comments}
          performLikePost={performLikePost}
          performUnlikePost={performUnlikePost}
          navigateWhenClickOnPostOrComment={
            this.navigateWhenClickOnPostOrComment
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkColor,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomColor: Colors.brightColor,
    borderBottomWidth: 2,
  },
});

interface HOCPostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  isTabFocused?: boolean;
  userPostControl?: () => void;
  performLikePost: () => void;
  performUnlikePost: () => void;
  onPushPostLayer: (postID: string) => void;
}

const mapDispatchToProps = {
  onPushPostLayer: pushPostLayer,
};

export default connect(
  null,
  mapDispatchToProps,
)(
  React.memo(
    function (props: HOCPostCardProps) {
      const navigation = useNavigation();
      // console.log('card ', props.index);
      return <PostCard {...props} navigation={navigation} />;
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

      if (prevProps.isTabFocused !== nextProps.isTabFocused) {
        return false;
      }
      if (prevProps.currentViewableIndex === nextProps.currentViewableIndex) {
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
