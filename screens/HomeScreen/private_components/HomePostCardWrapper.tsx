import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PostCard } from '../../../components';
import { AppState } from '../../../redux/store';
import { Post } from '../../../models';

interface HomePostCardWrapperProps {
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

  guessControl: () => void;

  /**
   * Optional method navigate to user screen
   * when pressing username or avatar
   * Do nothing if post of post card is already
   * appeared in its owner user screen
   */
  navigateWhenPressOnUsernameOrAvatar?: () => void;

  /**
   * Method navigate when pressing on user's tag
   * @param user Preloaded user passed to new screen
   */
  navigateWhenPressOnTag?: (user: {
    id: string;
    username: string;
    avatar: string;
  }) => () => void;
}

interface HomePostCardWrapperState {
  /**
   * Determine if post card should play videos
   */
  shouldPlayMedia: boolean;
}

class HomePostCardWrapper extends Component<
  HomePostCardWrapperProps,
  HomePostCardWrapperState
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

const mapStateToProps = (state: AppState) => ({
  currentViewableIndex: state.postListIndices.currentHomeListPostIndex,
});

export default connect(mapStateToProps)(HomePostCardWrapper);
