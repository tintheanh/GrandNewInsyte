import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationProp, NavigationState } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import Carousel from '../Carousel';
import { UserSection, Caption, InteractionSection } from './private_components';

interface PostCardProps {
  // TODO make data as Post type
  data: any;
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

    if (
      data.likes !== nextProps.data.likes ||
      data.comments !== nextProps.data.comments ||
      data.user.avatar !== nextProps.data.user.avatar
    )
      return true;

    if (data.media.length === 0) return false;

    if (data.media.length === 1 && data.media[0].type === 'image') {
      return false;
    }

    if (this.state.shouldPlayMedia !== nextState.shouldPlayMedia) return true;
    if (isTabFocused !== nextProps.isTabFocused) return true;
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

  render() {
    const {
      data,
      currentViewableIndex,
      index,
      isTabFocused = true,
      navigateWhenClickOnPostOrComment,
      navigateWhenClickOnUsernameOrAvatar = undefined,
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
      <View style={styles.container}>
        <UserSection
          avatar={data.user.avatar}
          username={data.user.username}
          datePosted={data.date_posted}
          iconPrivacy={iconPrivacy}
          navigateWhenClickOnPostOrComment={navigateWhenClickOnPostOrComment}
          navigateWhenClickOnUsernameOrAvatar={
            navigateWhenClickOnUsernameOrAvatar
          }
        />
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
          likes={data.likes}
          comments={data.comments}
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
    marginBottom: 2,
  },
});
