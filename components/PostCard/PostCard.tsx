import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {
  Colors,
  MaterialCommunityIcons,
  pendingDeletePostFlag,
  pendingPostID,
} from '../../constants';
import Carousel from '../Carousel';
import { UserSection, Caption, InteractionSection } from './private_components';
import { checkPostChanged } from '../../utils/functions';
import { Post } from '../../models';

interface PostCardProps {
  data: Post;

  /**
   * Index of post card
   */
  index: number;

  /**
   * Current scrolling index of the list
   */
  currentViewableIndex: number;

  /**
   * Determine if post card should play videos
   */
  shouldPlayMedia: boolean;

  /**
   * Method navigate to post screen
   * when pressing on empty remaining
   * space or comment icon
   */
  navigateWhenPressOnPostOrComment: () => void;

  /**
   * Optional props detect if current tab is focused
   * Some lists in certain screens may not have tabs
   */
  isTabFocused?: boolean;

  /**
   * Method like post
   */
  performLikePost: () => void;

  /**
   * Method unlike post
   */
  performUnlikePost: () => void;

  /**
   * Optional method delete post
   * Only posts belong to current user can have this
   */
  userPostControl?: () => void;

  /**
   * Optional method navigate to user screen
   * when pressing username or avatar
   * Do nothing if post of post card is already
   * appeared in its owner user screen
   */
  navigateWhenPressOnUsernameOrAvatar?: () => void;
}

export default class PostCard extends Component<PostCardProps> {
  shouldComponentUpdate(nextProps: PostCardProps) {
    const {
      data,
      currentViewableIndex,
      index,
      isTabFocused,
      shouldPlayMedia,
    } = this.props;

    // component re-render when next post data is changed
    if (checkPostChanged(data, nextProps.data)) {
      return true;
    }

    if (isTabFocused !== nextProps.isTabFocused) {
      return true;
    }
    if (shouldPlayMedia !== nextProps.shouldPlayMedia) {
      return true;
    }

    // when current scrolling index equals to post card index
    // re-render only when post having > 1 media
    // or the only one media has to be a video
    if (
      currentViewableIndex === index ||
      nextProps.currentViewableIndex === index
    ) {
      if (currentViewableIndex !== nextProps.currentViewableIndex) {
        if (data.media.length > 1) {
          return true;
        }
        if (data.media.length === 1 && data.media[0].type === 'video') {
          return true;
        }
      }
    }

    return false;
  }

  render() {
    const {
      data,
      currentViewableIndex,
      index,
      isTabFocused = true,
      shouldPlayMedia,
      userPostControl,
      performLikePost,
      performUnlikePost,
      navigateWhenPressOnPostOrComment,
      navigateWhenPressOnUsernameOrAvatar,
    } = this.props;

    // console.log('post card', index);

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
          // disable interaction when post card is being added or deleted
          data.id === pendingPostID || data.id.includes(pendingDeletePostFlag)
            ? 'none'
            : 'auto'
        }
        style={[
          styles.container,
          {
            opacity:
              data.id === pendingPostID ||
              data.id.includes(pendingDeletePostFlag)
                ? 0.4
                : 1,
          },
        ]}>
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
              navigateWhenPressOnPostOrComment={
                navigateWhenPressOnPostOrComment
              }
              navigateWhenPressOnUsernameOrAvatar={
                navigateWhenPressOnUsernameOrAvatar
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
          navigateWhenPressOnPostOrComment={navigateWhenPressOnPostOrComment}
        />
        {data.media.length ? (
          <Carousel
            items={data.media}
            shouldPlayMedia={
              shouldPlayMedia && currentViewableIndex === index && isTabFocused
            }
          />
        ) : null}
        <InteractionSection
          isLiked={data.isLiked}
          likes={data.likes}
          comments={data.comments}
          performLikePost={performLikePost}
          performUnlikePost={performUnlikePost}
          navigateWhenPressOnPostOrComment={navigateWhenPressOnPostOrComment}
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
