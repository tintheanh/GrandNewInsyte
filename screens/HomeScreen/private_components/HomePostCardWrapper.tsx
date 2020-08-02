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

  /**
   * Optional method navigate to user screen
   * when pressing username or avatar
   * Do nothing if post of post card is already
   * appeared in its owner user screen
   */
  navigateWhenPressOnUsernameOrAvatar?: () => void;
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

// class HomePostCard extends Component<HomePostCardWrapperProps> {
//   state = { shouldPlayMedia: true };
//   private onBlur: () => void = () => {};
//   private onFocus: () => void = () => {};

//   componentDidMount() {
//     const { navigation } = this.props;
//     this.onBlur = navigation.addListener('blur', () => {
//       this.setState({ shouldPlayMedia: false });
//     });
//     this.onFocus = navigation.addListener('focus', () => {
//       this.setState({ shouldPlayMedia: true });
//     });
//   }

//   componentWillUnmount() {
//     this.onBlur();
//     this.onFocus();
//   }

//   shouldComponentUpdate(nextProps: HomePostCardWrapperProps, nextState: any) {
//     const { isTabFocused, currentViewableIndex, index, data } = this.props;

//     if (isTabFocused !== nextProps.isTabFocused) {
//       return true;
//     }

//     if (checkPostChanged(data, nextProps.data)) {
//       return true;
//     }
//     if (data.media.length === 0) {
//       return false;
//     }
//     if (data.media.length === 1 && data.media[0].type === 'image') {
//       return false;
//     }
//     if (this.state.shouldPlayMedia !== nextState.shouldPlayMedia) {
//       return true;
//     }
//     if (
//       currentViewableIndex === index ||
//       nextProps.currentViewableIndex === index
//     ) {
//       return true;
//     }
//     return false;
//   }

//   performDeletePost = () => {
//     this.props.onDeletePost(this.props.data.id);
//     this.props.onDecreaseTotalPostsByOne();
//   };

//   postControl = () => {
//     Alert.alert(
//       '',
//       'Do you want to delete your post?',
//       [
//         {
//           text: 'Delete',
//           onPress: this.performDeletePost,
//         },

//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//       ],
//       { cancelable: true },
//     );
//   };

//   navigateWhenPressOnPostOrComment = () => {
//     const { navigation, data, onPushCommentsLayer } = this.props;
//     onPushCommentsLayer(data.id);
//     navigation.push('PostScreen', data);
//   };

//   navigateWhenPressOnUsernameOrAvatar = () => {
//     const { data, currentUID, navigation } = this.props;
//     const { user } = data;
//     if (currentUID !== data.user.id) {
//       this.props.onPushUsersLayer({
//         id: data.user.id,
//         username: data.user.username,
//         avatar: data.user.avatar,
//       });
//       navigation.push('UserScreen', user);
//     } else {
//       navigation.push('ProfileScreen', user);
//     }
//   };

//   performLikePost = () => {
//     this.props.onLikePost(this.props.data.id);
//   };

//   performUnlikePost = () => {
//     this.props.onUnlikePost(this.props.data.id);
//   };

//   render() {
//     const {
//       data,
//       currentViewableIndex,
//       index,
//       currentUID,
//       isTabFocused,
//     } = this.props;

//     // console.log('home card', index);
//     return (
//       <PostCard
//         data={data}
//         currentViewableIndex={currentViewableIndex}
//         index={index}
//         isTabFocused={isTabFocused}
//         shouldPlayMedia={this.state.shouldPlayMedia}
//         userPostControl={
//           data.user.id === currentUID ? this.postControl : undefined
//         }
//         performLikePost={this.performLikePost}
//         performUnlikePost={this.performUnlikePost}
//         navigateWhenPressOnPostOrComment={this.navigateWhenPressOnPostOrComment}
//         navigateWhenPressOnUsernameOrAvatar={
//           this.navigateWhenPressOnUsernameOrAvatar
//         }
//       />
//     );
//   }
// }

// const mapStateToProps = (state: AppState) => ({
//   currentUID: state.auth.user?.id,
//   currentViewableIndex: state.postListIndices.currentHomeListPostIndex,
// });

// const mapDispathToProps = {
//   onDeletePost: deletePost,
//   onLikePost: likePost,
//   onUnlikePost: unlikePost,
//   onPushCommentsLayer: pushCommentsLayer,
//   onPushUsersLayer: pushUsersLayer,
//   onDecreaseTotalPostsByOne: decreaseTotalPostsByOne,
// };

// interface HOCHomePostCardProps {
//   data: Post;
//   currentViewableIndex: number;
//   index: number;
//   currentUID: string | undefined;
//   isTabFocused: boolean;
//   onDeletePost: (postID: string) => void;
//   onLikePost: (postID: string) => void;
//   onUnlikePost: (postID: string) => void;
//   onPushCommentsLayer: (postID: string) => void;
//   onDecreaseTotalPostsByOne: () => void;
//   onPushUsersLayer: ({
//     id,
//     username,
//     avatar,
//   }: {
//     id: string;
//     username: string;
//     avatar: string;
//   }) => void;
// }

// export default connect(
//   mapStateToProps,
//   mapDispathToProps,
// )(
//   React.memo(
//     function (props: HOCHomePostCardProps) {
//       const navigation = useNavigation();
//       return <HomePostCard {...props} navigation={navigation} />;
//     },
//     (prevProps, nextProps) => {
//       if (prevProps.isTabFocused !== nextProps.isTabFocused) {
//         return false;
//       }
//       if (checkPostChanged(prevProps.data, nextProps.data)) {
//         return false;
//       }
//       if (prevProps.data.media.length === 0) {
//         return true;
//       }
//       if (
//         prevProps.data.media.length === 1 &&
//         prevProps.data.media[0].type === 'image'
//       ) {
//         return true;
//       }
//       if (
//         prevProps.currentViewableIndex === prevProps.index ||
//         nextProps.currentViewableIndex === prevProps.index
//       ) {
//         return false;
//       }
//       return true;
//     },
//   ),
// );
