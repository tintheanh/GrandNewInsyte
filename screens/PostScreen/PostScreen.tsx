import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { Layout, Colors, MaterialIcons } from '../../constants';
import { CommentCard, List, Loading, ErrorView } from '../../components';
import {
  delay,
  checkPostCommentListChanged,
  checkPostChanged,
  alertDialog,
} from '../../utils/functions';
import { PostSection, CommentInput } from './private_components';
import {
  fetchNewComments,
  fetchTopComments,
  popCommentsLayer,
  likeComment,
  unlikeComment,
  clearCreateCommentError,
  clearDeleteCommentError,
  clearInteractCommentError,
  deleteComment,
} from '../../redux/commentsStack/actions';
import {
  likePost,
  unlikePost,
  deletePost,
  decreaseCommentsBy,
  increaseCommentsBy,
} from '../../redux/posts/actions';
import { AppState } from '../../redux/store';
import { Post, Comment } from '../../models';

interface PostScreenProps {
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
      data: Post;
    };
  };

  // redux states
  currentUID: string | undefined;
  comments: Array<Comment>;
  sortCommentsBy: 'all' | 'top';
  loading: boolean;
  error: Error | null;
  createCommentError: Error | null;
  deleteCommentError: Error | null;
  interactCommentError: Error | null;
  likePostError: Error | null;
  unlikePostError: Error | null;

  // redux dispatches
  onFetchNewComments: (postID: string) => void;
  onFetchTopComments: (postID: string) => void;
  onLikeComment: (commentID: string) => void;
  onUnlikeComment: (commentID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
  onDeletePost: (postID: string) => void;
  onDeleteComment: (commentID: string, numberOfReplies: number) => void;
  onPopCommentsLayer: () => void;
  onClearCreateCommentError: () => void;
  onClearDeleteCommentError: () => void;
  onClearInteractCommentError: () => void;
  onDecreaseCommentsForHomeScreenBy: (
    postID: string,
    numberOfReplies: number,
  ) => void;
  onIncreaseCommentsForHomeScreen: (
    postID: string,
    numberOfReplies: number,
  ) => void;
}

interface PostScreenState {
  post: Post;
  numberOfRepliesAndCommentDeleted: number;
}

class PostScreen extends Component<PostScreenProps, PostScreenState> {
  private unsubscribeDetectScreenGoBack: any;
  constructor(props: PostScreenProps) {
    super(props);
    this.state = {
      post: this.props.route.params.data,
      numberOfRepliesAndCommentDeleted: 0,
    };
  }

  shouldComponentUpdate(
    nextProps: PostScreenProps,
    nextState: PostScreenState,
  ) {
    const {
      comments,
      sortCommentsBy,
      loading,
      error,
      createCommentError,
      deleteCommentError,
      interactCommentError,
      likePostError,
      unlikePostError,
    } = this.props;
    if (loading !== nextProps.loading) {
      return true;
    }
    if (sortCommentsBy !== nextProps.sortCommentsBy) {
      return true;
    }
    if (error !== nextProps.error) {
      return true;
    }
    if (createCommentError !== nextProps.createCommentError) {
      return true;
    }
    if (deleteCommentError !== nextProps.deleteCommentError) {
      return true;
    }
    if (interactCommentError !== nextProps.interactCommentError) {
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
    this.unsubscribeDetectScreenGoBack = navigation.addListener(
      'beforeRemove',
      () => {
        onPopCommentsLayer();
      },
    );
    const postID = this.state.post.id;
    await delay(500);
    onFetchNewComments(postID);
  }

  componentWillUnmount() {
    this.unsubscribeDetectScreenGoBack();
  }

  toUserScreen = () => {
    // const { navigation, route } = this.props;
    // const post = route.params.data;
    // const { post } = this.state;
    // this.props.navigation.push('User', {
    //   title: post.user.username,
    //   avatar: post.user.avatar,
    // });
    console.log('to user screen');
  };

  /* -------------------- post methods -------------------- */

  performLikePost = async () => {
    const postID = this.state.post.id;
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        likes: prevState.post.likes + 1,
        isLiked: true,
      },
    }));
    await this.props.onLikePost(postID);
    if (this.props.likePostError !== null) {
      this.setState((prevState) => ({
        post: {
          ...prevState.post,
          likes: prevState.post.likes - 1,
          isLiked: false,
        },
      }));
    }
  };

  performUnlikePost = async () => {
    const postID = this.state.post.id;
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        likes: prevState.post.likes - 1,
        isLiked: false,
      },
    }));
    await this.props.onUnlikePost(postID);
    if (this.props.unlikePostError !== null) {
      this.setState((prevState) => ({
        post: {
          ...prevState.post,
          likes: prevState.post.likes + 1,
          isLiked: true,
        },
      }));
    }
  };

  performDeletePost = async () => {
    const { navigation, onPopCommentsLayer, onDeletePost } = this.props;
    const postID = this.state.post.id;
    navigation.goBack();
    onPopCommentsLayer();
    await delay(500);
    onDeletePost(postID);
  };

  increaseCommentsForPostScreenBy = (by: number) => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        comments: prevState.post.comments + by,
      },
    }));
  };

  decreaseCommentsForPostScreenBy = (numberOfReplies: number) => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        comments: prevState.post.comments - numberOfReplies,
      },
      numberOfRepliesAndCommentDeleted: numberOfReplies,
    }));
  };

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
    this.decreaseCommentsForPostScreenBy(numberOfReplies + 1);
    onDecreaseCommentsForHomeScreenBy(postID, numberOfReplies + 1);
    this.setState({ numberOfRepliesAndCommentDeleted: numberOfReplies + 1 });
    onDeleteComment(commentID, numberOfReplies + 1);
  };

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
    const {
      sortCommentsBy,
      onFetchNewComments,
      onFetchTopComments,
    } = this.props;
    const postID = this.state.post.id;
    if (sortCommentsBy === 'all') {
      onFetchNewComments(postID);
    } else {
      onFetchTopComments(postID);
    }
  };

  emptyHandler = () => {
    const postID = this.state.post.id;
    this.props.onFetchNewComments(postID);
  };

  performLikeComment = (commentID: string) => () => {
    this.props.onLikeComment(commentID);
  };

  performUnlikeComment = (commentID: string) => () => {
    this.props.onUnlikeComment(commentID);
  };

  performClearCreateCommentError = () => {
    const { post } = this.state;
    const {
      onClearCreateCommentError,
      onDecreaseCommentsForHomeScreenBy,
    } = this.props;
    onClearCreateCommentError();
    this.decreaseCommentsForPostScreenBy(1);
    onDecreaseCommentsForHomeScreenBy(post.id, 1);
  };

  performClearDeleteCommentError = () => {
    const postID = this.state.post.id;
    const {
      onClearDeleteCommentError,
      onIncreaseCommentsForHomeScreen,
    } = this.props;
    onClearDeleteCommentError();
    this.increaseCommentsForPostScreenBy(
      this.state.numberOfRepliesAndCommentDeleted,
    );
    onIncreaseCommentsForHomeScreen(
      postID,
      this.state.numberOfRepliesAndCommentDeleted,
    );
  };

  /* ----------------- end comment methods ---------------- */

  renderItem = ({ item, index }: { item: Comment; index: number }) => {
    const { currentUID } = this.props;
    return (
      <CommentCard
        id={item.id}
        user={item.user}
        content={item.content}
        datePosted={item.datePosted}
        likes={item.likes}
        isLiked={item.isLiked}
        replies={item.replies}
        userControl={
          currentUID === item.user.id
            ? this.userControlForComment(item.id, item.replies)
            : undefined
        }
        likeComment={this.performLikeComment(item.id)}
        unlikeComment={this.performUnlikeComment(item.id)}
        decreaseCommentsForPostScreenBy={this.decreaseCommentsForPostScreenBy}
        increaseCommentsForPostScreenBy={this.increaseCommentsForPostScreenBy}
      />
    );
  };

  render() {
    const { post } = this.state;
    const {
      comments,
      error,
      createCommentError,
      deleteCommentError,
      interactCommentError,
      loading,
      currentUID,
      onClearInteractCommentError,
    } = this.props;
    // console.log('post screen', this.state.post);

    const postSection = (
      <PostSection
        post={post}
        likePost={this.performLikePost}
        unLikePost={this.performUnlikePost}
        navigateWhenClickOnUsernameOrAvatar={this.toUserScreen}
        userControl={
          post.user.id === currentUID ? this.userControlForPost : undefined
        }
      />
    );

    const commentInput = (
      <CommentInput
        increaseCommentsForPostScreenBy={this.increaseCommentsForPostScreenBy}
        increaseCommentsForHomeScreen={
          this.props.onIncreaseCommentsForHomeScreen
        }
      />
    );

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
    if (interactCommentError) {
      alertDialog(interactCommentError.message, onClearInteractCommentError);
    }

    if (error) {
      return (
        <View style={styles.container}>
          {postSection}
          <ErrorView errorText={error.message} handle={this.emptyHandler} />
        </View>
      );
    }

    if (loading && comments.length === 0) {
      return (
        <View style={styles.container}>
          {postSection}
          <Loading />
          {currentUID !== undefined ? commentInput : null}
        </View>
      );
    }
    if (comments.length === 0) {
      return (
        <View style={styles.container}>
          {postSection}
          {currentUID !== undefined ? commentInput : null}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <List
          listHeaderComponent={postSection}
          data={comments}
          renderItem={this.renderItem}
          _onEndReachedDuringMomentum={this.fetchMoreComments}
          checkChangesToUpdate={checkPostCommentListChanged}
          initialNumToRender={5}
          onEndReachedThreshold={0.1}
          maxToRenderPerBatch={5}
          windowSize={undefined}
          listFooterComponent={<View style={{ height: 136 }} />}
          extraData={post}
        />
        {currentUID !== undefined ? commentInput : null}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
  },
});

const mapStateToProps = (state: AppState) => {
  const { currentTab } = state.commentsStack;
  return {
    currentUID: state.auth.user?.id,
    comments: state.commentsStack[currentTab].top()?.commentList ?? [],
    loading: state.commentsStack[currentTab].top()?.loading ?? false,
    error: state.commentsStack[currentTab].top()?.error ?? null,
    createCommentError:
      state.commentsStack[currentTab].top()?.createCommentError ?? null,
    deleteCommentError:
      state.commentsStack[currentTab].top()?.deleteCommentError ?? null,
    interactCommentError:
      state.commentsStack[currentTab].top()?.interactCommentError ?? null,
    sortCommentsBy: state.commentsStack[currentTab].top()?.type ?? 'all',
    likePostError: state.allPosts.likePost.error,
    unlikePostError: state.allPosts.unlikePost.error,
  };
};

const mapDispatchToProps = {
  onFetchNewComments: fetchNewComments,
  onFetchTopComments: fetchTopComments,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
  onDeletePost: deletePost,
  onPopCommentsLayer: popCommentsLayer,
  onLikeComment: likeComment,
  onUnlikeComment: unlikeComment,
  onClearCreateCommentError: clearCreateCommentError,
  onClearInteractCommentError: clearInteractCommentError,
  onClearDeleteCommentError: clearDeleteCommentError,
  onDeleteComment: deleteComment,
  onDecreaseCommentsForHomeScreenBy: decreaseCommentsBy,
  onIncreaseCommentsForHomeScreen: increaseCommentsBy,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostScreen);
