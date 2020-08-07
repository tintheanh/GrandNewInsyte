import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import { connect } from 'react-redux';
import { Layout, Colors } from '../../constants';
import {
  CommentCard,
  List,
  Loading,
  ErrorView,
  FooterLoading,
} from '../../components';
import {
  delay,
  checkPostCommentListChanged,
  checkPostChanged,
  alertDialog,
} from '../../utils/functions';
import { PostSection, CommentInput } from './private_components';
import {
  fetchNewComments,
  popCommentsLayer,
  likeComment,
  unlikeComment,
  clearCreateCommentError,
  clearDeleteCommentError,
  clearLikeCommentError,
  clearUnlikeCommentError,
  deleteComment,
} from '../../redux/commentsStack/actions';
import { pushRepliesLayer } from '../../redux/repliesStack/actions';
import {
  likePost,
  unlikePost,
  deletePost,
  decreaseCommentsBy,
  increaseCommentsBy,
} from '../../redux/posts/actions';
import { pushUsersLayer } from '../../redux/usersStack/actions';
import { AppState } from '../../redux/store';
import { Post, Comment, CurrentTabScreen } from '../../models';

interface PostScreenProps {
  navigation: any;

  /**
   * Payload receive after navigating
   */
  route: {
    params: { post: Post; currentTabScreen: CurrentTabScreen };
  };

  /**
   * Current user's id
   */
  currentUID: string | undefined;

  /**
   * Comment list fetched from database
   */
  comments: Array<Comment>;

  /**
   * Loading from fetching comments
   */
  loading: boolean;

  /**
   * Error from fetching comments failure
   */
  fetchError: Error | null;

  /**
   * Error from like post failure
   */
  likePostError: Error | null;

  /**
   * Error from unlike post failure
   */
  unlikePostError: Error | null;

  /**
   * Error from create comment failure
   */
  createCommentError: Error | null;

  /**
   * Error from delete comment failure
   */
  deleteCommentError: Error | null;

  /**
   * Error from like comment failure
   */
  likeCommentError: Error | null;

  /**
   * Error from unlike comment failure
   */
  unlikeCommentError: Error | null;

  /**
   * Method like post
   */
  onLikePost: (postID: string) => void;

  /**
   * Method unlike post
   */
  onUnlikePost: (postID: string) => void;

  /**
   * Method delete post
   */
  onDeletePost: (postID: string) => void;

  /**
   * Method fetch comments
   */
  onFetchNewComments: (postID: string) => void;

  /**
   * Method like comment
   */
  onLikeComment: (postID: string, commentID: string) => void;

  /**
   * Method unlike comment
   */
  onUnlikeComment: (postID: string, commentID: string) => void;

  /**
   * Method delete comment
   */
  onDeleteComment: (
    postID: string,
    commentID: string,
    numberOfReplies: number,
  ) => void;

  /**
   * Method pop comments stack when screen going back
   */
  onPopCommentsLayer: () => void;

  /**
   * Method clear error from create comment failure
   */
  onClearCreateCommentError: () => void;

  /**
   * Method clear error from delete comment failure
   */
  onClearDeleteCommentError: () => void;

  /**
   * Method clear error from like comment failure
   */
  onClearLikeCommentError: () => void;

  /**
   * Method clear error from unlike comment failure
   */
  onClearUnlikeCommentError: () => void;

  /**
   * Method decrease post's number of comments for home screen.
   * Used when delete comment and create new comment failure
   */
  onDecreaseCommentsForHomeScreenBy: (
    postID: string,
    numberOfReplies: number,
  ) => void;

  /**
   * Method decrease post's number of comments for home screen.
   * Used when create comment and delete comment failure
   */
  onIncreaseCommentsForHomeScreen: (
    postID: string,
    numberOfReplies: number,
  ) => void;

  /**
   * Method push new user layer when navigating to user screen
   */
  onPushUsersLayer: ({
    id,
    username,
    avatar,
  }: {
    id: string;
    username: string;
    avatar: string;
  }) => void;

  /**
   * Method push new reply layer when navigating to reply screen
   */
  onPushRepliesLayer: (commentID: string) => void;
}

/**
 * Local state
 */
interface PostScreenState {
  /**
   * State mapped from post props data passed by navigation.
   * Used in changing post's number of likes and comments of post screen
   */
  post: Post;

  /**
   * State to keep track of numbers of replies + the parent comment
   * to recover when delete comment fails
   */
  numberOfRepliesAndCommentDeleted: number;

  /**
   * State to check when the video should play
   * when screen is focused or not focused
   */
  shouldPlayMedia: boolean;
}

class PostScreen extends Component<PostScreenProps, PostScreenState> {
  private detectScreenGoBackUnsubscriber: () => void = () => {};
  private blurUnsubcriber: () => void = () => {};
  private focusUnsubcriber: () => void = () => {};

  constructor(props: PostScreenProps) {
    super(props);
    this.state = {
      post: this.props.route.params.post,
      numberOfRepliesAndCommentDeleted: 0,
      shouldPlayMedia: true,
    };
  }

  shouldComponentUpdate(
    nextProps: PostScreenProps,
    nextState: PostScreenState,
  ) {
    const {
      comments,
      loading,
      fetchError,
      createCommentError,
      deleteCommentError,
      likeCommentError,
      unlikeCommentError,
      likePostError,
      unlikePostError,
    } = this.props;

    if (this.state.shouldPlayMedia !== nextState.shouldPlayMedia) {
      return true;
    }
    if (loading !== nextProps.loading) {
      return true;
    }
    if (fetchError !== nextProps.fetchError) {
      return true;
    }
    if (createCommentError !== nextProps.createCommentError) {
      return true;
    }
    if (deleteCommentError !== nextProps.deleteCommentError) {
      return true;
    }
    if (likeCommentError !== nextProps.likeCommentError) {
      return true;
    }
    if (unlikeCommentError !== nextProps.unlikeCommentError) {
      return true;
    }
    if (likePostError !== nextProps.likePostError) {
      return true;
    }
    if (unlikePostError !== nextProps.unlikePostError) {
      return true;
    }
    if (checkPostChanged(this.state.post, nextState.post)) {
      return true;
    }
    if (checkPostCommentListChanged(comments, nextProps.comments)) {
      return true;
    }
    if (
      this.state.numberOfRepliesAndCommentDeleted !==
      nextState.numberOfRepliesAndCommentDeleted
    ) {
      return true;
    }

    return false;
  }

  async componentDidMount() {
    const { navigation, onFetchNewComments, onPopCommentsLayer } = this.props;
    this.detectScreenGoBackUnsubscriber = navigation.addListener(
      'beforeRemove',
      () => {
        onPopCommentsLayer();
      },
    );
    this.blurUnsubcriber = navigation.addListener('blur', () => {
      this.setState({ shouldPlayMedia: false });
    });
    this.focusUnsubcriber = navigation.addListener('focus', () => {
      this.setState({ shouldPlayMedia: true });
    });

    // delay before fetching comments to provide smoother experience
    await delay(500);
    onFetchNewComments(this.state.post.id);
  }

  componentWillUnmount() {
    this.detectScreenGoBackUnsubscriber();
    this.blurUnsubcriber();
    this.focusUnsubcriber();
  }

  toUserScreen = (user: {
    id: string;
    username: string;
    avatar: string;
  }) => () => {
    // const { currentUID, navigation } = this.props;
    // if (currentUID !== user.id) {
    //   this.props.onPushUsersLayer({
    //     id: user.id,
    //     username: user.username,
    //     avatar: user.avatar,
    //   });
    //   navigation.push('UserScreen', {
    //     title: user.username,
    //     user,
    //   });
    // } else {
    //   navigation.push('ProfileScreen', {
    //     title: user.username,
    //     user,
    //   });
    // }
  };

  /**
   * Method navigate to reply screen
   * @param comment Comment payload passed to reply screen
   */
  navigateToReplyScreen = (comment: Comment) => () => {
    const { onPushRepliesLayer, navigation } = this.props;
    onPushRepliesLayer(comment.id);
    navigation.push('ReplyScreen', {
      comment,
      decreaseCommentsForPostScreenBy: this.decreaseCommentsForPostScreenBy,
      increaseCommentsForPostScreenBy: this.increaseCommentsForPostScreenBy,
    });
  };

  /* -------------------- post methods -------------------- */

  /**
   * Method perform like post
   */
  performLikePost = async () => {
    // increase post's number of likes
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        likes: prevState.post.likes + 1,
        isLiked: true,
      },
    }));

    // perform like post
    await this.props.onLikePost(this.state.post.id);

    // wait until done
    if (this.props.likePostError !== null) {
      // if there's error, revert post's number of likes back
      this.setState((prevState) => ({
        post: {
          ...prevState.post,
          likes: prevState.post.likes - 1,
          isLiked: false,
        },
      }));
    }
  };

  /**
   * Method perform unlike post
   */
  performUnlikePost = async () => {
    // decrease post's number of likes
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        likes: prevState.post.likes - 1,
        isLiked: false,
      },
    }));

    // perform unlike post
    await this.props.onUnlikePost(this.state.post.id);

    // wait until done
    if (this.props.unlikePostError !== null) {
      // if there's error, revert post's number of likes back
      this.setState((prevState) => ({
        post: {
          ...prevState.post,
          likes: prevState.post.likes + 1,
          isLiked: true,
        },
      }));
    }
  };

  /**
   * Method perform delete post
   */
  performDeletePost = async () => {
    const { navigation, onPopCommentsLayer, onDeletePost } = this.props;
    navigation.goBack();
    onPopCommentsLayer();
    await delay(500);
    onDeletePost(this.state.post.id);
  };

  /**
   * Method to increase post's number of comments.
   * Used in create new comment and delete comment failure
   * @param numberOfReplies Number of comments + replies to increase to.
   * This could be the comment itself + all the replies associated
   */
  increaseCommentsForPostScreenBy = (numberOfReplies: number) => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        comments: prevState.post.comments + numberOfReplies,
      },
    }));
  };

  /**
   * Method to decrease post's number of comments.
   * Used in delete comment and create new comment failure
   * @param numberOfReplies Number of comment + replies to increase to.
   * This could be the comment itself + all the replies associated
   */
  decreaseCommentsForPostScreenBy = (numberOfReplies: number) => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        comments: prevState.post.comments - numberOfReplies,
      },
      numberOfRepliesAndCommentDeleted: numberOfReplies,
    }));
  };

  /**
   * User control for delete post
   */
  userControlForPost = () => {
    Alert.alert(
      '',
      'Do you want to delete your post?',
      [
        {
          text: 'Delete',
          onPress: this.performDeletePost,
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  /* ------------------ end post methods ------------------ */

  /* ------------------- comment methods ------------------ */

  performDeleteComment = (commentID: string, numberOfReplies: number) => () => {
    const { onDecreaseCommentsForHomeScreenBy, onDeleteComment } = this.props;
    const postID = this.state.post.id;

    // decrease number of comments + replies for post and home screen
    this.decreaseCommentsForPostScreenBy(numberOfReplies + 1);
    onDecreaseCommentsForHomeScreenBy(postID, numberOfReplies + 1);

    // keep track of the comment and number of replies along with it
    // in case delete comment fails
    this.setState({ numberOfRepliesAndCommentDeleted: numberOfReplies + 1 });

    // perform delete the comment
    onDeleteComment(postID, commentID, numberOfReplies);
  };

  /**
   * User control for delete comment
   * @param commentID Comment's ID to delete
   * @param numberOfReplies Number of replies associated to the comment
   */
  userControlForComment = (
    commentID: string,
    numberOfReplies: number,
  ) => () => {
    Alert.alert(
      '',
      'Do you want to delete your comment?',
      [
        {
          text: 'Delete',
          onPress: this.performDeleteComment(commentID, numberOfReplies),
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  fetchMoreComments = () => {
    this.props.onFetchNewComments(this.state.post.id);
  };

  /**
   * Method perform like comment
   * @param commentID Comment's ID to like
   */
  performLikeComment = (commentID: string) => () => {
    this.props.onLikeComment(this.state.post.id, commentID);
  };

  /**
   * Method perform unlike comment
   * @param commentID Comment's ID to unlike
   */
  performUnlikeComment = (commentID: string) => () => {
    this.props.onUnlikeComment(this.state.post.id, commentID);
  };

  /**
   * Method clear error from create comment failure
   */
  performClearCreateCommentError = () => {
    const {
      onClearCreateCommentError,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;

    // clear error
    onClearCreateCommentError();

    // decrease post's number of comments for post screen by 1 due to failure
    this.decreaseCommentsForPostScreenBy(1);

    // decrease post's number of comments for home screen by 1 due to failure
    onDecreaseCommentsForHomeScreenBy(this.state.post.id, 1);
  };

  /**
   * Method clear error from delete comment failure
   */
  performClearDeleteCommentError = () => {
    const { post, numberOfRepliesAndCommentDeleted } = this.state;
    const {
      onClearDeleteCommentError,
      onIncreaseCommentsForHomeScreen,
    } = this.props;

    // clear error
    onClearDeleteCommentError();

    // increase post's number of comments for post screen by 1 due to failure
    this.increaseCommentsForPostScreenBy(numberOfRepliesAndCommentDeleted);

    // increase post's number of comments for home screen by 1 due to failure
    onIncreaseCommentsForHomeScreen(post.id, numberOfRepliesAndCommentDeleted);
  };

  /* ----------------- end comment methods ---------------- */

  /**
   * Method render comment for comment list
   */
  renderItem = ({ item, index }: { item: Comment; index: number }) => {
    const { currentUID } = this.props;
    return (
      <CommentCard
        data={item}
        userControl={
          currentUID === item.user.id
            ? this.userControlForComment(item.id, item.replies)
            : undefined
        }
        likeComment={this.performLikeComment(item.id)}
        unlikeComment={this.performUnlikeComment(item.id)}
        navigateToReplyScreen={this.navigateToReplyScreen(item)}
        navigateToUserScreen={this.toUserScreen(item.user)}
      />
    );
  };

  render() {
    const { post, shouldPlayMedia } = this.state;
    const {
      comments,
      fetchError,
      loading,
      currentUID,
      createCommentError,
      deleteCommentError,
      likeCommentError,
      unlikeCommentError,
      onClearLikeCommentError,
      onClearUnlikeCommentError,
    } = this.props;

    if (createCommentError) {
      alertDialog(
        createCommentError.message,
        this.performClearCreateCommentError,
      );
    }

    if (deleteCommentError) {
      alertDialog(
        deleteCommentError.message,
        this.performClearDeleteCommentError,
      );
    }

    if (likeCommentError) {
      alertDialog(likeCommentError.message, onClearLikeCommentError);
    }

    if (unlikeCommentError) {
      alertDialog(unlikeCommentError.message, onClearUnlikeCommentError);
    }

    const postSection = (
      <PostSection
        post={post}
        likePost={this.performLikePost}
        unLikePost={this.performUnlikePost}
        navigateWhenPressOnUsernameOrAvatar={this.toUserScreen(post.user)}
        userControl={
          post.user.id === currentUID ? this.userControlForPost : undefined
        }
        shouldPlayMedia={this.state.shouldPlayMedia}
      />
    );

    const commentInput = (
      <CommentInput
        postID={post.id}
        increaseCommentsForPostScreenBy={this.increaseCommentsForPostScreenBy}
        increaseCommentsForHomeScreen={
          this.props.onIncreaseCommentsForHomeScreen
        }
      />
    );

    let emptyListComponent = null;
    if (fetchError) {
      emptyListComponent = (
        <View style={styles.emptyWrapper}>
          <ErrorView errorText={fetchError.message} />
        </View>
      );
    } else if (loading && comments.length === 0) {
      emptyListComponent = (
        <View style={styles.emptyWrapper}>
          <Loading />
        </View>
      );
    } else {
      emptyListComponent = undefined;
    }

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <List
          listHeaderComponent={postSection}
          listEmptyComponent={emptyListComponent}
          data={comments}
          renderItem={this.renderItem}
          onEndReached={this.fetchMoreComments}
          checkChangesToUpdate={checkPostCommentListChanged}
          initialNumToRender={5}
          onEndReachedThreshold={0.1}
          maxToRenderPerBatch={8}
          windowSize={7}
          listFooterComponent={<View style={{ height: 136 }} />}
          extraData={{ post, shouldPlayMedia }}
        />
        {currentUID !== undefined ? commentInput : null}
        {comments.length > 0 ? (
          <View style={styles.loadingWrapper}>
            <FooterLoading loading={loading} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brightColor,
    height: Layout.window.height,
  },
  loadingWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 44,
    zIndex: -1,
  },
  emptyWrapper: { paddingTop: 12, paddingBottom: 12 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
  },
});

const mapStateToProps = (state: AppState, ownProps: PostScreenProps) => {
  const { currentTabScreen } = ownProps.route.params;
  return {
    currentUID: state.auth.user?.id,
    comments: state.commentsStack[currentTabScreen].top()?.commentList ?? [],
    loading:
      state.commentsStack[currentTabScreen].top()?.loadings.fetchLoading ??
      false,
    fetchError:
      state.commentsStack[currentTabScreen].top()?.errors.fetchError ?? null,
    likePostError: state.allPosts.likePost.error,
    unlikePostError: state.allPosts.unlikePost.error,
    createCommentError:
      state.commentsStack[currentTabScreen].top()?.errors.createCommentError ??
      null,
    deleteCommentError:
      state.commentsStack[currentTabScreen].top()?.errors.deleteCommentError ??
      null,
    likeCommentError:
      state.commentsStack[currentTabScreen].top()?.errors.likeCommentError ??
      null,
    unlikeCommentError:
      state.commentsStack[currentTabScreen].top()?.errors.unlikeCommentError ??
      null,
  };
};

const mapDispatchToProps = {
  onFetchNewComments: fetchNewComments,
  // onFetchTopComments: fetchTopComments,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
  onDeletePost: deletePost,
  onPopCommentsLayer: popCommentsLayer,
  onLikeComment: likeComment,
  onUnlikeComment: unlikeComment,
  onClearCreateCommentError: clearCreateCommentError,
  onClearLikeCommentError: clearLikeCommentError,
  onClearUnlikeCommentError: clearUnlikeCommentError,
  onClearDeleteCommentError: clearDeleteCommentError,
  onDeleteComment: deleteComment,
  onDecreaseCommentsForHomeScreenBy: decreaseCommentsBy,
  onIncreaseCommentsForHomeScreen: increaseCommentsBy,
  onPushUsersLayer: pushUsersLayer,
  onPushRepliesLayer: pushRepliesLayer,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostScreen);
