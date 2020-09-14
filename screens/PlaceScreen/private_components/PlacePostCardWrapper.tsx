import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PostCard } from '../../../components';
import { AppState } from '../../../redux/store';
import { Post, CurrentTabScreen } from '../../../models';

interface PlacePostCardWrapperProps {
  data: Post;

  /**
   * Index of post card
   */
  index: number;

  /**
   * Current focused tab screen
   */
  currentTabScreen: CurrentTabScreen;

  /**
   * Current scrolling index of the list
   */
  currentViewableIndex: number;

  /**
   * Method listen to if the current screen is focused
   * Can't do this on the main screen because it'll
   * affect the list
   */
  addScreenListener: (
    event: 'focus' | 'blur',
    callback: () => void,
  ) => () => void;

  /**
   * Method navigate to post screen
   * when pressing on empty remaining
   * space or comment icon
   */
  navigateWhenPressOnPostOrComment: () => void;

  /**
   * Method navigate when pressing on user's tag
   * @param user Preloaded user passed to new screen
   */
  navigateWhenPressOnTag?: (user: {
    id: string;
    username: string;
    avatar: string;
  }) => () => void;

  /**
   * Method like post
   */
  performLikePost: () => void;

  /**
   * Method unlike post
   */
  performUnlikePost: () => void;
}

interface PlacePostCardWrapperState {
  /**
   * Determine if post card should play videos
   */
  shouldPlayMedia: boolean;
}

class PlacePostCardWrapper extends Component<
  PlacePostCardWrapperProps,
  PlacePostCardWrapperState
> {
  private blurUnsubcriber: () => void = () => {};
  private focusUnsubscriber: () => void = () => {};

  state = { shouldPlayMedia: true };

  componentDidMount() {
    const { addScreenListener } = this.props;
    this.blurUnsubcriber = addScreenListener('blur', () => {
      this.setState({ shouldPlayMedia: false });
    });
    this.focusUnsubscriber = addScreenListener('focus', () => {
      this.setState({ shouldPlayMedia: true });
    });
  }

  componentWillUnmount() {
    this.blurUnsubcriber();
    this.focusUnsubscriber();
  }

  render() {
    // eslint-disable-next-line
    const { addScreenListener, ...neededProps } = this.props;
    return (
      <PostCard {...neededProps} shouldPlayMedia={this.state.shouldPlayMedia} />
    );
  }
}

const mapStateToProps = (
  state: AppState,
  ownProps: PlacePostCardWrapperProps,
) => {
  const { currentTabScreen } = ownProps;
  return {
    currentViewableIndex: 0,
    // currentViewableIndex:
    //   state.userStack[currentTabScreen].top()?.currentViewableIndex ?? 0,
  };
};

export default connect(mapStateToProps)(PlacePostCardWrapper);
