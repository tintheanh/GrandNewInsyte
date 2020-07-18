import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, NavigationState } from '@react-navigation/native';
import {
  Colors,
  Entypo,
  pendingDeletePostFlag,
  pendingPostID,
} from '../../constants';
import Carousel from '../Carousel';
import { UserSection, Caption, InteractionSection } from './private_components';
import { checkPostChanged } from '../../utils/functions';
import { Post } from '../../models';

interface PostCardProps {
  data: Post;
  currentViewableIndex: number;
  index: number;
  navigation: NavigationProp<
    Record<string, object | undefined>,
    string,
    NavigationState,
    {},
    {}
  >;
  isTabFocused?: boolean;
  navigateWhenClickOnPostOrComment: () => void;
  navigateWhenClickOnUsernameOrAvatar?: () => void;
  userPostControl?: () => void;
  performLikePost: () => void;
  performUnlikePost: () => void;
}

export default class PostCard extends Component<PostCardProps> {
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

  // processMedia = () => this.props.data.media.map((md) => ({ url: md.url }));

  render() {
    const {
      data,
      currentViewableIndex,
      index,
      isTabFocused = true,
      navigateWhenClickOnPostOrComment,
      navigateWhenClickOnUsernameOrAvatar = undefined,
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
                navigateWhenClickOnPostOrComment
              }
              navigateWhenClickOnUsernameOrAvatar={
                navigateWhenClickOnUsernameOrAvatar
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
              <Entypo
                name="chevron-down"
                size={20}
                color="rgba(255,255,255, 0.6)"
                style={{ marginTop: -5 }}
              />
            </TouchableWithoutFeedback>
          ) : null}
        </View>
        <Caption
          caption={data.caption}
          navigateWhenClickOnPostOrComment={navigateWhenClickOnPostOrComment}
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
          navigateWhenClickOnPostOrComment={navigateWhenClickOnPostOrComment}
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
