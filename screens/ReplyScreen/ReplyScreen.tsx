import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { CommentSectionForReplyScreen, ReplyInput } from './private_components';
import {
  popRepliesLayer,
  fetchReplies,
  deleteReply,
  likeReply,
  unlikeReply,
  clearCreateReplyError,
  clearDeleteReplyError,
  clearInteractReplyError,
} from '../../redux/repliesStack/actions';
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
} from '../../redux/commentsStack/actions';
import { AppState } from '../../redux/store';
import { Reply, Comment } from '../../models';
import { ReplyCard, List, ErrorView, Loading } from '../../components';
import { Colors, Layout, MaterialIcons } from '../../constants';
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
  route: {
    params: {
      comment: Comment;
      decreaseCommentsForPostScreenBy: (numberOfReplies: number) => void;
      increaseCommentsForPostScreenBy: (numberOfReplies: number) => void;
    };
  };

  // redux states
  currentUID: string | undefined;
  postID: string;
  replies: Array<Reply>;
  loading: boolean;
  error: Error | null;
  createReplyError: Error | null;
  deleteReplyError: Error | null;
  interactReplyError: Error | null;
  interactCommentError: Error | null;

  // redux dispatches
  onPopRepliesLayer: () => void;
  onFetchReplies: (commentID: string) => void;
  onLikeComment: (commentID: string) => void;
  onUnlikeComment: (commentID: string) => void;
  onDeleteComment: (commentID: string, numberOfReplies: number) => void;
  onDeleteReply: (replyID: string) => void;
  onLikeReply: (replyID: string) => void;
  onUnlikeReply: (replyID: string) => void;
  onClearCreateReplyError: () => void;
  onClearDeleteReplyError: () => void;
  onClearInteractReplyError: () => void;
  onIncreaseRepliesForPostScreenBy: (commentID: string, by: number) => void;
  onDecreaseRepliesForPostScreenBy: (commentID: string, by: number) => void;
  onDecreaseCommentsForHomeScreenBy: (postID: string, by: number) => void;
  onIncreaseCommentsForHomeScreenBy: (postID: string, by: number) => void;
}

interface ReplyScreenState {
  comment: Comment;
}

class ReplyScreen extends Component<ReplyScreenProps, ReplyScreenState> {
  private unsubscribeDetectScreenGoBack: any;
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
      error,
      createReplyError,
      deleteReplyError,
      interactReplyError,
      interactCommentError,
    } = this.props;
    if (loading !== nextProps.loading) {
      return true;
    }
    if (error !== nextProps.error) {
      return true;
    }
    if (createReplyError !== nextProps.createReplyError) {
      return true;
    }
    if (deleteReplyError !== nextProps.deleteReplyError) {
      return true;
    }
    if (interactReplyError !== nextProps.interactReplyError) {
      return true;
    }
    if (interactCommentError !== nextProps.interactCommentError) {
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
    const { navigation, onPopRepliesLayer, onFetchReplies } = this.props;
    const { comment } = this.state;
    this.unsubscribeDetectScreenGoBack = navigation.addListener(
      'beforeRemove',
      () => {
        onPopRepliesLayer();
      },
    );
    await delay(500);
    onFetchReplies(comment.id);
  }

  componentWillUnmount() {
    this.unsubscribeDetectScreenGoBack();
  }

  /* ------------------- comment methods ------------------ */

  performLikeComment = async () => {
    const { id } = this.state.comment;
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        likes: prevState.comment.likes + 1,
        isLiked: true,
      },
    }));
    await this.props.onLikeComment(id);
    if (this.props.interactCommentError !== null) {
      this.setState((prevState) => ({
        comment: {
          ...prevState.comment,
          likes: prevState.comment.likes - 1,
          isLiked: false,
        },
      }));
    }
  };

  performUnlikeComment = async () => {
    const { id } = this.state.comment;
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        likes: prevState.comment.likes - 1,
        isLiked: false,
      },
    }));
    await this.props.onUnlikeComment(id);
    if (this.props.interactCommentError !== null) {
      this.setState((prevState) => ({
        comment: {
          ...prevState.comment,
          likes: prevState.comment.likes + 1,
          isLiked: true,
        },
      }));
    }
  };

  performDeleteComment = async () => {
    const {
      postID,
      navigation,
      onPopRepliesLayer,
      onDeleteComment,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;
    const { comment } = this.state;
    navigation.goBack();
    onPopRepliesLayer();
    await delay(500);
    onDeleteComment(comment.id, comment.replies + 1);
    onDecreaseCommentsForHomeScreenBy(postID, comment.replies + 1);
    this.props.route.params.decreaseCommentsForPostScreenBy(
      comment.replies + 1,
    );
  };

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

  emptyHandler = () => {
    this.props.onFetchReplies(this.state.comment.id);
  };

  increaseRepliesForReplyScreenBy = (numberOfReplies: number) => {
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        replies: prevState.comment.replies + numberOfReplies,
      },
    }));
  };

  decreaseRepliesForReplyScreenBy = (numberOfReplies: number) => {
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        replies: prevState.comment.replies - numberOfReplies,
      },
    }));
  };

  performClearCreateReplyError = () => {
    const {
      postID,
      onClearCreateReplyError,
      onDecreaseRepliesForPostScreenBy,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;
    onClearCreateReplyError();
    this.decreaseRepliesForReplyScreenBy(1);
    onDecreaseRepliesForPostScreenBy(this.state.comment.id, 1);
    this.props.route.params.decreaseCommentsForPostScreenBy(1);
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

  performDeleteReply = (replyID: string) => () => {
    const {
      postID,
      route,
      onDeleteReply,
      onDecreaseRepliesForPostScreenBy,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;
    onDeleteReply(replyID);
    this.decreaseRepliesForReplyScreenBy(1);
    onDecreaseRepliesForPostScreenBy(this.state.comment.id, 1);
    route.params.decreaseCommentsForPostScreenBy(1);
    onDecreaseCommentsForHomeScreenBy(postID, 1);
  };

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

  performClearDeleteReplyError = () => {
    const {
      postID,
      route,
      onIncreaseRepliesForPostScreenBy,
      onIncreaseCommentsForHomeScreenBy,
      onClearDeleteReplyError,
    } = this.props;
    onClearDeleteReplyError();
    this.increaseRepliesForReplyScreenBy(1);
    onIncreaseRepliesForPostScreenBy(this.state.comment.id, 1);
    route.params.increaseCommentsForPostScreenBy(1);
    onIncreaseCommentsForHomeScreenBy(postID, 1);
  };

  performLikeReply = (replyID: string) => () => {
    this.props.onLikeReply(replyID);
  };

  performUnlikeReply = (replyID: string) => () => {
    this.props.onUnlikeReply(replyID);
  };

  /* ------------------ end reply methods ----------------- */

  renderItem = ({ item, index }: { item: Reply; index: number }) => {
    return (
      <ReplyCard
        id={item.id}
        user={item.user}
        content={item.content}
        datePosted={item.datePosted}
        likes={item.likes}
        isLiked={item.isLiked}
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

  render() {
    const { comment } = this.state;
    const {
      replies,
      createReplyError,
      deleteReplyError,
      interactReplyError,
      error,
      loading,
      currentUID,
      onClearInteractReplyError,
    } = this.props;
    const commentSection = (
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

    const replyInput = (
      <ReplyInput
        increaseRepliesForReplyScreenBy={this.increaseRepliesForReplyScreenBy}
        increaseRepliesForPostScreen={this.increaseRepliesForPostScreen}
        increaseCommentsForPostScreen={this.increaseCommentsForPostScreen}
        increaseCommentsForHomeScreen={this.increaseCommentsForHomeScreen}
      />
    );

    if (createReplyError) {
      alertDialog(createReplyError.message, this.performClearCreateReplyError);
    }
    if (deleteReplyError) {
      alertDialog(deleteReplyError.message, this.performClearDeleteReplyError);
    }
    if (interactReplyError) {
      alertDialog(interactReplyError.message, onClearInteractReplyError);
    }

    if (error) {
      return (
        <View style={styles.container}>
          {commentSection}
          <ErrorView errorText={error.message} handle={this.emptyHandler} />
        </View>
      );
    }

    if (loading && replies.length === 0) {
      return (
        <View style={styles.container}>
          {commentSection}
          <Loading />
          {currentUID !== undefined ? replyInput : null}
        </View>
      );
    }

    if (replies.length === 0) {
      return (
        <View style={styles.container}>
          {commentSection}
          {currentUID !== undefined ? replyInput : null}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <List
          listHeaderComponent={commentSection}
          data={replies}
          renderItem={this.renderItem}
          _onEndReachedDuringMomentum={this.fetchMoreReplies}
          checkChangesToUpdate={checkPostReplyListChanged}
          initialNumToRender={5}
          onEndReachedThreshold={0.1}
          maxToRenderPerBatch={5}
          windowSize={undefined}
          listFooterComponent={<View style={{ height: 136 }} />}
          extraData={this.state.comment}
        />
        {currentUID !== undefined ? replyInput : null}
        <View style={styles.loadingWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <MaterialIcons
                name="done"
                size={22}
                color="rgba(255, 255, 255, 0.6)"
              />
            </View>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
  },
});

const mapStateToProps = (state: AppState) => {
  const currentTabForReplies = state.repliesStack.currentTab;
  const currentTabForComments = state.commentsStack.currentTab;
  return {
    currentUID: state.auth.user?.id,
    postID: state.commentsStack[currentTabForComments].top()?.postID ?? '',
    replies: state.repliesStack[currentTabForReplies].top()?.replyList ?? [],
    loading: state.repliesStack[currentTabForReplies].top()?.loading ?? false,
    error: state.repliesStack[currentTabForReplies].top()?.error ?? null,
    createReplyError:
      state.repliesStack[currentTabForReplies].top()?.createReplyError ?? null,
    deleteReplyError:
      state.repliesStack[currentTabForReplies].top()?.deleteReplyError ?? null,
    interactReplyError:
      state.repliesStack[currentTabForReplies].top()?.interactReplyError ??
      null,
    interactCommentError:
      state.commentsStack[currentTabForComments].top()?.interactCommentError ??
      null,
  };
};

const mapDispatchToProps = {
  onPopRepliesLayer: popRepliesLayer,
  onFetchReplies: fetchReplies,
  onLikeComment: likeComment,
  onUnlikeComment: unlikeComment,
  onDeleteComment: deleteComment,
  onClearCreateReplyError: clearCreateReplyError,
  onClearDeleteReplyError: clearDeleteReplyError,
  onClearInteractReplyError: clearInteractReplyError,
  onIncreaseRepliesForPostScreenBy: increaseRepliesBy,
  onDecreaseRepliesForPostScreenBy: decreaseRepliesBy,
  onDecreaseCommentsForHomeScreenBy: decreaseCommentsBy,
  onIncreaseCommentsForHomeScreenBy: increaseCommentsBy,
  onDeleteReply: deleteReply,
  onLikeReply: likeReply,
  onUnlikeReply: unlikeReply,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyScreen);
