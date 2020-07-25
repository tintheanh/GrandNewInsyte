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
  popPostLayer,
  likeComment,
  unlikeComment,
  clearCreateCommentError,
  clearDeleteCommentError,
  clearInteractCommentError,
  deleteComment,
} from '../../redux/postComments/actions';
import {
  likePost,
  unlikePost,
  deletePost,
  decreaseCommentNumOne,
  increaseCommentNumOne,
} from '../../redux/posts/actions';
import { AppState } from '../../redux/store';
import { Post, PostComment } from '../../models';

interface PostScreenProps {
  currentUID: string | undefined;
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
  comments: Array<PostComment>;
  sortCommentsBy: 'new' | 'top';
  loading: boolean;
  error: Error | null;
  createCommentError: Error | null;
  deleteCommentError: Error | null;
  interactCommentError: Error | null;
  likePostError: Error | null;
  unlikePostError: Error | null;
  onFetchNewComments: (postID: string) => void;
  onFetchTopComments: (postID: string) => void;
  onLikeComment: (commentID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikeComment: (commentID: string) => void;
  onUnlikePost: (postID: string) => void;
  onDeletePost: (postID: string) => void;
  onPopPostLayer: () => void;
  onClearCreateCommentError: () => void;
  onClearDeleteCommentError: () => void;
  onClearInteractCommentError: () => void;
  onDeleteComment: (commentID: string) => void;
  onDecreaseCommentNumberForHomeScreen: (postID: string) => void;
  onIncreaseCommentNumberForHomeScreen: (postID: string) => void;
}

interface PostScreenState {
  post: Post;
}

class PostScreen extends Component<PostScreenProps, PostScreenState> {
  private detectGoBack: any;
  constructor(props: PostScreenProps) {
    super(props);
    this.state = {
      post: this.props.route.params.data,
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
    if (checkPostChanged(this.state.post, nextState.post)) {
      return true;
    }
    if (checkPostCommentListChanged(comments, nextProps.comments)) {
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

    return false;
  }

  async componentDidMount() {
    const { navigation, onFetchNewComments, onPopPostLayer } = this.props;
    this.detectGoBack = navigation.addListener('beforeRemove', () => {
      onPopPostLayer();
    });
    const postID = this.state.post.id;
    await delay(500);
    onFetchNewComments(postID);
  }

  componentWillUnmount() {
    this.detectGoBack();
  }

  toUserScreen = () => {
    // const { navigation, route } = this.props;
    // const post = route.params.data;
    const { post } = this.state;
    this.props.navigation.push('User', {
      title: post.user.username,
      avatar: post.user.avatar,
    });
  };

  renderItem = ({ item, index }: { item: PostComment; index: number }) => {
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
            ? this.userControlForComment(item.id)
            : undefined
        }
        likeComment={this.performLikeComment(item.id)}
        unlikeComment={this.performUnlikeComment(item.id)}
      />
    );
  };

  performDeleteComment = (commentID: string) => async () => {
    const postID = this.state.post.id;
    this.decreaseCommentNumberForPostScreen();
    this.props.onDecreaseCommentNumberForHomeScreen(postID);
    await this.props.onDeleteComment(commentID);
    if (this.props.deleteCommentError) {
      this.increaseCommentNumberForPostScreen();
      this.props.onIncreaseCommentNumberForHomeScreen(postID);
    }
  };

  userControlForComment = (commentID: string) => () => {
    Alert.alert(
      '',
      'Do you want to delete your comment?',
      [
        {
          text: 'Delete',
          onPress: this.performDeleteComment(commentID),
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
    if (sortCommentsBy === 'new') {
      onFetchNewComments(postID);
    } else {
      onFetchTopComments(postID);
    }
  };

  emptyHandler = () => {
    const postID = this.state.post.id;
    this.props.onFetchNewComments(postID);
  };

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

  increaseCommentNumberForPostScreen = () => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        comments: prevState.post.comments + 1,
      },
    }));
  };

  decreaseCommentNumberForPostScreen = () => {
    this.setState((prevState) => ({
      post: {
        ...prevState.post,
        comments: prevState.post.comments - 1,
      },
    }));
  };

  performDeletePost = async () => {
    const { navigation, onPopPostLayer, onDeletePost } = this.props;
    const postID = this.state.post.id;
    navigation.goBack();
    onPopPostLayer();
    await delay(500);
    onDeletePost(postID);
  };

  performLikeComment = (commentID: string) => () => {
    this.props.onLikeComment(commentID);
  };

  performUnlikeComment = (commentID: string) => () => {
    this.props.onUnlikeComment(commentID);
  };

  userControl = () => {
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
      onClearCreateCommentError,
      onClearInteractCommentError,
      onClearDeleteCommentError,
    } = this.props;
    // console.log('post screen', this.state.post);

    const postSection = (
      <PostSection
        post={post}
        likePost={this.performLikePost}
        unLikePost={this.performUnlikePost}
        navigateWhenClickOnUsernameOrAvatar={this.toUserScreen}
        userControl={post.user.id === currentUID ? this.userControl : undefined}
      />
    );

    const commentInput = (
      <CommentInput
        increaseCommentNumberForPostScreen={
          this.increaseCommentNumberForPostScreen
        }
        decreaseCommentNumberForPostScreen={
          this.decreaseCommentNumberForPostScreen
        }
        decreaseCommentNumberForHomeScreen={
          this.props.onDecreaseCommentNumberForHomeScreen
        }
        increaseCommentNumberForHomeScreen={
          this.props.onIncreaseCommentNumberForHomeScreen
        }
      />
    );

    if (createCommentError) {
      alertDialog(createCommentError.message, onClearCreateCommentError);
    }
    if (deleteCommentError) {
      alertDialog(deleteCommentError.message, onClearDeleteCommentError);
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
    // if (comments.length === 0) {
    //   return (
    //     <View style={styles.container}>
    //       {postSection}
    //       {currentUID !== undefined ? (
    //         <CommentInput
    //           increaseCommentNumberForPostScreen={
    //             this.increaseCommentNumberForPostScreen
    //           }
    //           decreaseCommentNumberForPostScreen={
    //             this.decreaseCommentNumberForPostScreen
    //           }
    //         />
    //       ) : null}
    //     </View>
    //   );
    // }

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
        <View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 44,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: -1,
          }}>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
  },
});

const mapStateToProps = (state: AppState) => ({
  currentUID: state.auth.user?.id,
  comments: state.postComments.stack.top()?.commentList ?? [],
  loading: state.postComments.stack.top()?.loading ?? false,
  error: state.postComments.stack.top()?.error ?? null,
  createCommentError:
    state.postComments.stack.top()?.createCommentError ?? null,
  deleteCommentError:
    state.postComments.stack.top()?.deleteCommentError ?? null,
  interactCommentError:
    state.postComments.stack.top()?.interactCommentError ?? null,
  sortCommentsBy: state.postComments.stack.top()?.type ?? 'new',
  likePostError: state.allPosts.likePost.error,
  unlikePostError: state.allPosts.unlikePost.error,
});

const mapDispatchToProps = {
  onFetchNewComments: fetchNewComments,
  onFetchTopComments: fetchTopComments,
  onLikePost: likePost,
  onUnlikePost: unlikePost,
  onDeletePost: deletePost,
  onPopPostLayer: popPostLayer,
  onLikeComment: likeComment,
  onUnlikeComment: unlikeComment,
  onClearCreateCommentError: clearCreateCommentError,
  onClearInteractCommentError: clearInteractCommentError,
  onClearDeleteCommentError: clearDeleteCommentError,
  onDeleteComment: deleteComment,
  onDecreaseCommentNumberForHomeScreen: decreaseCommentNumOne,
  onIncreaseCommentNumberForHomeScreen: increaseCommentNumOne,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostScreen);
