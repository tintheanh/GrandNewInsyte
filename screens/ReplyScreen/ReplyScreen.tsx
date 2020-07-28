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
  clearCreateReplyError,
  clearDeleteReplyError,
  clearInteractReplyError,
} from '../../redux/repliesStack/actions';
import {
  likeComment,
  unlikeComment,
  deleteComment,
  increaseRepliesByOne,
} from '../../redux/commentsStack/actions';
import { AppState } from '../../redux/store';
import { Reply } from '../../models';
import { ReplyCard, List, ErrorView, Loading } from '../../components';
import { Colors, Layout, MaterialIcons } from '../../constants';
import {
  delay,
  checkPostReplyListChanged,
  checkCommentChanged,
  alertDialog,
} from '../../utils/functions';

class ReplyScreen extends Component<any, any> {
  private unsubscribeDetectScreenGoBack: any;
  constructor(props: any) {
    super(props);
    this.state = {
      comment: this.props.route.params.comment,
    };
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    const {
      replies,
      loading,
      error,
      createReplyError,
      deleteReplyError,
      interactReplyError,
      likePostError,
      unlikePostError,
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
    if (likePostError !== nextProps.likePostError) {
      return true;
    }
    if (unlikePostError !== nextProps.unlikePostError) {
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
    if (this.props.likeCommentError !== null) {
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
    if (this.props.likeCommentError !== null) {
      this.setState((prevState) => ({
        comment: {
          ...prevState.comment,
          likes: prevState.comment.likes + 1,
          isLiked: true,
        },
      }));
    }
  };

  increaseReplyNumberForReplyScreen = () => {
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        replies: prevState.comment.replies + 1,
      },
    }));
  };

  decreaseReplyNumberForReplyScreen = () => {
    this.setState((prevState) => ({
      comment: {
        ...prevState.comment,
        replies: prevState.comment.replies - 1,
      },
    }));
  };

  /* ----------------- end comment methods ---------------- */

  renderItem = ({ item, index }: { item: Reply; index: number }) => {
    return (
      <ReplyCard
        id={item.id}
        user={item.user}
        content={item.content}
        datePosted={item.datePosted}
        likes={item.likes}
        isLiked={item.isLiked}
        likeReply={() => console.log('like')}
        unlikeReply={() => console.log('unlike')}
      />
    );
  };

  fetchMoreComments = () => {
    this.props.onFetchReplies(this.state.comment.id);
  };

  emptyHandler = () => {
    this.props.onFetchReplies(this.state.comment.id);
  };

  performClearCreateReplyError = () => {
    this.props.onClearCreateReplyError();
    this.decreaseReplyNumberForReplyScreen();
  };

  performDeleteComment = async () => {
    const { navigation, onPopRepliesLayer, onDeleteComment } = this.props;
    const commentID = this.state.comment.id;
    navigation.goBack();
    onPopRepliesLayer();
    await delay(500);
    onDeleteComment(commentID);
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

  increaseReplyNumberForPostScreen = () => {
    this.props.onIncreaseRepliesByOne(this.state.comment.id);
  };

  render() {
    const { comment } = this.state;
    const { replies } = this.props;
    const commentSection = (
      <CommentSectionForReplyScreen
        comment={comment}
        likeComment={this.performLikeComment}
        unlikeComment={this.performUnlikeComment}
        userControl={
          this.props.currentUID !== undefined
            ? this.userControlForComment
            : undefined
        }
      />
    );

    const replyInput = (
      <ReplyInput
        increaseReplyNumberForReplyScreen={
          this.increaseReplyNumberForReplyScreen
        }
        decreaseReplyNumberForReplyScreen={
          this.decreaseReplyNumberForReplyScreen
        }
        increaseReplyNumberForPostScreen={this.increaseReplyNumberForPostScreen}
      />
    );

    if (this.props.createReplyError) {
      alertDialog(
        this.props.createReplyError.message,
        this.performClearCreateReplyError,
      );
    }
    if (this.props.deleteReplyError) {
      alertDialog(
        this.props.deleteReplyError.message,
        this.props.onClearDeleteReplyError,
      );
    }
    if (this.props.interactReplyError) {
      alertDialog(
        this.props.interactReplyError.message,
        this.props.onClearInteractReplyError,
      );
    }

    if (this.props.error) {
      return (
        <View style={styles.container}>
          {commentSection}
          <ErrorView
            errorText={this.props.error.message}
            handle={this.emptyHandler}
          />
        </View>
      );
    }

    if (this.props.loading && replies.length === 0) {
      return (
        <View style={styles.container}>
          {commentSection}
          <Loading />
          {this.props.currentUID !== undefined ? replyInput : null}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <List
          listHeaderComponent={commentSection}
          data={replies}
          renderItem={this.renderItem}
          _onEndReachedDuringMomentum={this.fetchMoreComments}
          checkChangesToUpdate={checkPostReplyListChanged}
          initialNumToRender={5}
          onEndReachedThreshold={0.1}
          maxToRenderPerBatch={5}
          windowSize={undefined}
          listFooterComponent={<View style={{ height: 136 }} />}
          extraData={this.state.comment}
        />
        {this.props.currentUID !== undefined ? replyInput : null}
        <View style={styles.loadingWrapper}>
          {this.props.loading ? (
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
    likeCommentError:
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
  onIncreaseRepliesByOne: increaseRepliesByOne,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReplyScreen);
