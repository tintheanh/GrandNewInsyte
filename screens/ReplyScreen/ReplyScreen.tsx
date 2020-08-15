import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import { connect } from 'react-redux';
import { CommentSectionForReplyScreen, ReplyInput } from './private_components';
import {
  popReplyLayer,
  fetchReplies,
  deleteReply,
  likeReply,
  unlikeReply,
  clearCreateReplyError,
  clearDeleteReplyError,
  clearLikeReplyError,
  clearUnlikeReplyError,
} from '../../redux/reply_stack/actions';
import {
  decreaseCommentsBy,
  increaseCommentsBy,
} from '../../redux/posts/actions';
import {
  likeComment,
  unlikeComment,
  deleteComment,
  increaseRepliesBy,
  decreaseRepliesBy,
  clearLikeCommentError,
  clearUnlikeCommentError,
} from '../../redux/comment_stack/actions';
import { AppState } from '../../redux/store';
import { Reply, Comment, CurrentTabScreen } from '../../models';
import {
  ReplyCard,
  List,
  ErrorView,
  Loading,
  FooterLoading,
} from '../../components';
import { Colors, Layout } from '../../constants';
import {
  delay,
  checkPostReplyListChanged,
  checkCommentChanged,
  alertDialog,
} from '../../utils/functions';

interface ReplyScreenProps {
  navigation: {
    push: (screen: string, options: any) => void;
    setParams: (params: any) => void;
    goBack: () => void;
    addListener: (
      type: 'focus' | 'blur' | 'beforeRemove' | 'state',
      callback: () => void,
    ) => any;
  };

  /**
   * Payload receive after navigating
   */
  route: {
    params: {
      comment: Comment;
      currentTabScreen: CurrentTabScreen;
      decreaseCommentsForPostScreenBy: (numberOfReplies: number) => void;
      increaseCommentsForPostScreenBy: (numberOfReplies: number) => void;
    };
  };

  /**
   * Current user's id
   */
  currentUID: string | undefined;

  /**
   * Parent post's ID of the replies
   */
  postID: string;

  /**
   * Reply list fetched from database
   */
  replies: Array<Reply>;

  /**
   * Loading from fetching replies
   */
  loading: boolean;

  /**
   * Error from fetching replies failure
   */
  fetchError: Error | null;

  /**
   * Error from create reply failure
   */
  createReplyError: Error | null;

  /**
   * Error from delete reply failure
   */
  deleteReplyError: Error | null;

  /**
   * Error from like reply failure
   */
  likeReplyError: Error | null;

  /**
   * Error from unlike reply failure
   */
  unlikeReplyError: Error | null;

  /**
   * Error from like comment failure
   */
  likeCommentError: Error | null;

  /**
   * Error from unlike comment failure
   */
  unlikeCommentError: Error | null;

  /**
   * Method pop replies stack when screen going back
   */
  onPopReplyLayer: () => void;

  /**
   * Method fetch replies from database
   * @param commentID Parent comment's ID to which replies belong
   */
  onFetchReplies: (commentID: string) => void;

  /**
   * Method like comment
   * @param postID Parent post's ID to which comment belongs
   * @param commentID Comment's ID to like
   */
  onLikeComment: (postID: string, commentID: string) => void;

  /**
   * Method unlike comment
   * @param postID Parent post's ID to which comment belongs
   * @param commentID Comment's ID to unlike
   */
  onUnlikeComment: (postID: string, commentID: string) => void;

  /**
   * Method delete a comment
   * @param postID Parent post's ID to which comment belongs
   * @param commentID Comment's ID to delete
   * @param numberOfReplies Number of replies belong to the comment
   */
  onDeleteComment: (
    postID: string,
    commentID: string,
    numberOfReplies: number,
  ) => void;

  /**
   * Method delete a reply
   * @param commentID Parent comment's ID to which reply belongs
   * @param replyID Reply's ID to delete
   */
  onDeleteReply: (commentID: string, replyID: string) => void;

  /**
   * Method like a reply
   * @param commentID Parent comment's ID to which reply belongs
   * @param replyID Reply's ID to like
   */
  onLikeReply: (commentID: string, replyID: string) => void;

  /**
   * Method unlike a reply
   * @param commentID Parent comment's ID to which reply belongs
   * @param replyID Reply's ID to unlike
   */
  onUnlikeReply: (commentID: string, replyID: string) => void;

  /**
   * Method clear create reply error
   */
  onClearCreateReplyError: () => void;

  /**
   * Method clear delete reply error
   */
  onClearDeleteReplyError: () => void;

  /**
   * Method clear like reply error
   */
  onClearLikeReplyError: () => void;

  /**
   * Method clear unlike reply error
   */
  onClearUnlikeReplyError: () => void;

  /**
   * Method clear like comment error
   */
  onClearLikeCommentError: () => void;

  /**
   * Method clear unlike comment error
   */
  onClearUnlikeCommentError: () => void;

  /**
   * Method increase number of replies for a comment in post screen
   * @param commentID Parent comment's to which replies belong
   * @param numberOfReplies Number of comment + replies to increase to.
   * This could be the comment itself + all the replies associated
   */
  onIncreaseRepliesForPostScreenBy: (
    commentID: string,
    numberOfReplies: number,
  ) => void;

  /**
   * Method decrease number of replies for a comment in post screen
   * @param commentID Parent comment's to which replies belong
   * @param numberOfReplies Number of comment + replies to decrease to.
   * This could be the comment itself + all the replies associated
   */
  onDecreaseRepliesForPostScreenBy: (
    commentID: string,
    numberOfReplies: number,
  ) => void;

  /**
   * Method increase number of comments for a post in home screen
   * @param postID Parent post's ID to which comments belong to
   * @param numberOfComments Number of comment + replies to increase to
   */
  onDecreaseCommentsForHomeScreenBy: (
    postID: string,
    numberOfComments: number,
  ) => void;

  /**
   * Method decrease number of comments for a post in home screen
   * @param postID Parent post's ID to which comments belong to
   * @param numberOfComments Number of comment + replies to decrease to
   */
  onIncreaseCommentsForHomeScreenBy: (
    postID: string,
    numberOfComments: number,
  ) => void;
}

/**
 * Local state
 */
interface ReplyScreenState {
  /**
   * State mapped from comment props data passed by navigation.
   * Used in changing comment's number of likes and replies of reply screen
   */
  comment: Comment;
}

class ReplyScreen extends Component<ReplyScreenProps, ReplyScreenState> {
  private detectScreenGoBackUnsubscriber: () => void = () => {};

  constructor(props: ReplyScreenProps) {
    super(props);
    this.state = {
      comment: this.props.route.params.comment,
    };
  }

  shouldComponentUpdate(
    nextProps: ReplyScreenProps,
    nextState: ReplyScreenState,
  ) {
    const {
      replies,
      loading,
      fetchError,
      likeReplyError,
      unlikeReplyError,
      createReplyError,
      deleteReplyError,
      likeCommentError,
      unlikeCommentError,
    } = this.props;
    if (loading !== nextProps.loading) {
      return true;
    }
    if (fetchError !== nextProps.fetchError) {
      return true;
    }
    if (likeReplyError !== nextProps.likeReplyError) {
      return true;
    }
    if (unlikeReplyError !== nextProps.unlikeReplyError) {
      return true;
    }
    if (createReplyError !== nextProps.createReplyError) {
      return true;
    }
    if (deleteReplyError !== nextProps.deleteReplyError) {
      return true;
    }
    if (likeCommentError !== nextProps.likeCommentError) {
      return true;
    }
    if (unlikeCommentError !== nextProps.unlikeCommentError) {
      return true;
    }
    if (checkCommentChanged(this.state.comment, nextState.comment)) {
      return true;
    }
    if (checkPostReplyListChanged(replies, nextProps.replies)) {
      return true;
    }

    return false;
  }

  async componentDidMount() {
    const { navigation, onPopReplyLayer, onFetchReplies } = this.props;
    const { comment } = this.state;
    this.detectScreenGoBackUnsubscriber = navigation.addListener(
      'beforeRemove',
      () => {
        onPopReplyLayer();
      },
    );

    // delay before fetching replies to provide smoother experience
    await delay(500);
    onFetchReplies(comment.id);
  }

  componentWillUnmount() {
    this.detectScreenGoBackUnsubscriber();
  }

  componentDidUpdate() {
    const {
      createReplyError,
      deleteReplyError,
      likeCommentError,
      unlikeCommentError,
      likeReplyError,
      unlikeReplyError,
      onClearLikeCommentError,
      onClearUnlikeCommentError,
      onClearLikeReplyError,
      onClearUnlikeReplyError,
    } = this.props;

    if (createReplyError) {
      alertDialog(createReplyError.message, this.performClearCreateReplyError);
    }

    if (deleteReplyError) {
      alertDialog(deleteReplyError.message, this.performClearDeleteReplyError);
    }

    if (likeCommentError) {
      alertDialog(likeCommentError.message, onClearLikeCommentError);
    }

    if (unlikeCommentError) {
      alertDialog(unlikeCommentError.message, onClearUnlikeCommentError);
    }

    if (likeReplyError) {
      alertDialog(likeReplyError.message, onClearLikeReplyError);
    }

    if (unlikeReplyError) {
      alertDialog(unlikeReplyError.message, onClearUnlikeReplyError);
    }
  }

  /* ------------------- comment methods ------------------ */

  /**
   * Method perform like comment
   */
  performLikeComment = async () => {
    // increase comment's number of likes
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        likes: prevState.comment.likes + 1,
        isLiked: true,
      },
    }));

    // perform like comment
    await this.props.onLikeComment(this.props.postID, this.state.comment.id);

    // wait until done
    if (this.props.likeCommentError !== null) {
      // if there's error, revert comment's number of likes back
      this.setState((prevState) => ({
        comment: {
          ...prevState.comment,
          likes: prevState.comment.likes - 1,
          isLiked: false,
        },
      }));
    }
  };

  /**
   * Method perform unlike comment
   */
  performUnlikeComment = async () => {
    // increase comment's number of likes
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        likes: prevState.comment.likes - 1,
        isLiked: false,
      },
    }));

    // perform unlike comment
    await this.props.onUnlikeComment(this.props.postID, this.state.comment.id);

    // wait until done
    if (this.props.unlikeCommentError !== null) {
      // if there's error, revert comment's number of likes back
      this.setState((prevState) => ({
        comment: {
          ...prevState.comment,
          likes: prevState.comment.likes + 1,
          isLiked: true,
        },
      }));
    }
  };

  /**
   * Method perform delete comment
   */
  performDeleteComment = async () => {
    const {
      postID,
      navigation,
      route,
      onPopReplyLayer,
      onDeleteComment,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;
    const { comment } = this.state;
    navigation.goBack();
    onPopReplyLayer();
    await delay(500);

    // perform delete comment
    onDeleteComment(postID, comment.id, comment.replies + 1);

    // decrease post's number of comment + replies for home screen
    onDecreaseCommentsForHomeScreenBy(postID, comment.replies + 1);

    // decrease post's number of comment + replies for post screen
    route.params.decreaseCommentsForPostScreenBy(comment.replies + 1);
  };

  /**
   * User control for delete comment
   */
  userControlForComment = () => {
    Alert.alert(
      '',
      'Do you want to delete your comment?',
      [
        {
          text: 'Delete',
          onPress: this.performDeleteComment,
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  /* ----------------- end comment methods ---------------- */

  /* -------------------- reply methods ------------------- */

  fetchMoreReplies = () => {
    this.props.onFetchReplies(this.state.comment.id);
  };

  /**
   * Method increase number of replies for reply screen
   * @param numberOfReplies Number of replies to increase to
   */
  increaseRepliesForReplyScreenBy = (numberOfReplies: number) => {
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        replies: prevState.comment.replies + numberOfReplies,
      },
    }));
  };

  /**
   * Method decrease number of replies for reply screen
   * @param numberOfReplies Number of replies to decrease to
   */
  decreaseRepliesForReplyScreenBy = (numberOfReplies: number) => {
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        replies: prevState.comment.replies - numberOfReplies,
      },
    }));
  };

  /**
   * Method clear error from create reply failure
   */
  performClearCreateReplyError = () => {
    const {
      postID,
      route,
      onClearCreateReplyError,
      onDecreaseRepliesForPostScreenBy,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;

    // clear error
    onClearCreateReplyError();

    // decrease reply number for reply screen due to error
    this.decreaseRepliesForReplyScreenBy(1);

    // decrease reply number for post screen due to error
    onDecreaseRepliesForPostScreenBy(this.state.comment.id, 1);

    // decrease comment number for post screen due to error
    route.params.decreaseCommentsForPostScreenBy(1);

    // decrease comment number for home screen due to error
    onDecreaseCommentsForHomeScreenBy(postID, 1);
  };

  increaseRepliesForPostScreen = () => {
    this.props.onIncreaseRepliesForPostScreenBy(this.state.comment.id, 1);
  };

  increaseCommentsForHomeScreen = () => {
    this.props.onIncreaseCommentsForHomeScreenBy(this.props.postID, 1);
  };

  increaseCommentsForPostScreen = () => {
    this.props.route.params.increaseCommentsForPostScreenBy(1);
  };

  /**
   * Method perform delete reply
   * @param replyID Reply's ID to delete
   */
  performDeleteReply = (replyID: string) => () => {
    const {
      postID,
      route,
      onDeleteReply,
      onDecreaseRepliesForPostScreenBy,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;

    // decrease reply number for reply screen
    this.decreaseRepliesForReplyScreenBy(1);

    // decrease reply number for post screen
    onDecreaseRepliesForPostScreenBy(this.state.comment.id, 1);

    // decrease comment number for post screen
    route.params.decreaseCommentsForPostScreenBy(1);

    // decrease comment number for home screen
    onDecreaseCommentsForHomeScreenBy(postID, 1);

    // perform delete reply
    onDeleteReply(this.state.comment.id, replyID);
  };

  /**
   * User control for delete reply
   * @param replyID Reply's ID to delete
   */
  userControlForReply = (replyID: string) => () => {
    Alert.alert(
      '',
      'Do you want to delete your reply?',
      [
        {
          text: 'Delete',
          onPress: this.performDeleteReply(replyID),
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  /**
   * Method clear error from delete reply failure
   */
  performClearDeleteReplyError = () => {
    const {
      postID,
      route,
      onIncreaseRepliesForPostScreenBy,
      onIncreaseCommentsForHomeScreenBy,
      onClearDeleteReplyError,
    } = this.props;

    // clear error
    onClearDeleteReplyError();

    // increase reply number for reply screen due to error
    this.increaseRepliesForReplyScreenBy(1);

    // increase reply number for post screen due to error
    onIncreaseRepliesForPostScreenBy(this.state.comment.id, 1);

    // increase comment number for post screen due to error
    route.params.increaseCommentsForPostScreenBy(1);

    // increase comment number for home screen due to error
    onIncreaseCommentsForHomeScreenBy(postID, 1);
  };

  /**
   * Method like reply
   * @param replyID Reply's ID to like
   */
  performLikeReply = (replyID: string) => () => {
    this.props.onLikeReply(this.state.comment.id, replyID);
  };

  /**
   * Method unlike reply
   * @param replyID Reply's ID to unlike
   */
  performUnlikeReply = (replyID: string) => () => {
    this.props.onUnlikeReply(this.state.comment.id, replyID);
  };

  /* ------------------ end reply methods ----------------- */

  /**
   * Method render reply for reply list
   */
  renderItem = ({ item, index }: { item: Reply; index: number }) => {
    return (
      <ReplyCard
        data={item}
        likeReply={this.performLikeReply(item.id)}
        unlikeReply={this.performUnlikeReply(item.id)}
        userControl={
          item.user.id === this.props.currentUID
            ? this.userControlForReply(item.id)
            : undefined
        }
      />
    );
  };

  renderCommentSection = () => {
    const { comment } = this.state;
    return (
      <CommentSectionForReplyScreen
        comment={comment}
        likeComment={this.performLikeComment}
        unlikeComment={this.performUnlikeComment}
        userControl={
          comment.user.id === this.props.currentUID
            ? this.userControlForComment
            : undefined
        }
      />
    );
  };

  renderEmptyListComponent = () => {
    const { fetchError, loading, replies } = this.props;
    if (fetchError) {
      return (
        <View style={styles.emptyWrapper}>
          <ErrorView errorText={fetchError.message} />
        </View>
      );
    }
    if (loading && replies.length === 0) {
      return (
        <View style={styles.emptyWrapper}>
          <Loading />
        </View>
      );
    }
    return undefined;
  };

  renderReplyInput = () => {
    return (
      <ReplyInput
        commentID={this.state.comment.id}
        increaseRepliesForReplyScreenBy={this.increaseRepliesForReplyScreenBy}
        increaseRepliesForPostScreen={this.increaseRepliesForPostScreen}
        increaseCommentsForPostScreen={this.increaseCommentsForPostScreen}
        increaseCommentsForHomeScreen={this.increaseCommentsForHomeScreen}
      />
    );
  };

  render() {
    const { comment } = this.state;
    const { replies, loading, currentUID } = this.props;

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <List
          listHeaderComponent={this.renderCommentSection()}
          listEmptyComponent={this.renderEmptyListComponent()}
          data={replies}
          renderItem={this.renderItem}
          onEndReached={this.fetchMoreReplies}
          checkChangesToUpdate={checkPostReplyListChanged}
          initialNumToRender={5}
          onEndReachedThreshold={0.2}
          maxToRenderPerBatch={5}
          windowSize={7}
          listFooterComponent={<View style={{ height: 136 }} />}
          extraData={{ comment, loading }}
        />
        {currentUID !== undefined ? this.renderReplyInput() : null}
        {replies.length > 0 ? (
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
    backgroundColor: Colors.brightColor,
    flex: 1,
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

const mapStateToProps = (state: AppState, ownProps: ReplyScreenProps) => {
  const { currentTabScreen } = ownProps.route.params;
  return {
    currentUID: state.auth.user?.id,
    postID: state.commentStack[currentTabScreen].top()?.postID ?? '',
    replies: state.replyStack[currentTabScreen].top()?.replies ?? [],
    loading:
      state.replyStack[currentTabScreen].top()?.loadings.fetchLoading ?? false,
    fetchError:
      state.replyStack[currentTabScreen].top()?.errors.fetchError ?? null,
    createReplyError:
      state.replyStack[currentTabScreen].top()?.errors.createReplyError ?? null,
    deleteReplyError:
      state.replyStack[currentTabScreen].top()?.errors.deleteReplyError ?? null,
    likeReplyError:
      state.replyStack[currentTabScreen].top()?.errors.likeReplyError ?? null,
    unlikeReplyError:
      state.replyStack[currentTabScreen].top()?.errors.unlikeReplyError ?? null,
    likeCommentError:
      state.commentStack[currentTabScreen].top()?.errors.likeCommentError ??
      null,
    unlikeCommentError:
      state.commentStack[currentTabScreen].top()?.errors.unlikeCommentError ??
      null,
  };
};

const mapDispatchToProps = {
  onPopReplyLayer: popReplyLayer,
  onFetchReplies: fetchReplies,
  onLikeComment: likeComment,
  onUnlikeComment: unlikeComment,
  onDeleteComment: deleteComment,
  onClearCreateReplyError: clearCreateReplyError,
  onClearDeleteReplyError: clearDeleteReplyError,
  onClearLikeReplyError: clearLikeReplyError,
  onClearUnlikeReplyError: clearUnlikeReplyError,
  onClearLikeCommentError: clearLikeCommentError,
  onClearUnlikeCommentError: clearUnlikeCommentError,
  onIncreaseRepliesForPostScreenBy: increaseRepliesBy,
  onDecreaseRepliesForPostScreenBy: decreaseRepliesBy,
  onDecreaseCommentsForHomeScreenBy: decreaseCommentsBy,
  onIncreaseCommentsForHomeScreenBy: increaseCommentsBy,
  onDeleteReply: deleteReply,
  onLikeReply: likeReply,
  onUnlikeReply: unlikeReply,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyScreen);
