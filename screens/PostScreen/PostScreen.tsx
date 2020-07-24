import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { Colors, MaterialIcons } from '../../constants';
import { CommentCard, List, Loading, ErrorView } from '../../components';
import {
  delay,
  checkPostCommentListChanged,
  checkPostChanged,
} from '../../utils/functions';
import { PostSection, CommentInput } from './private_components';
import {
  fetchNewComments,
  fetchTopComments,
  popPostLayer,
} from '../../redux/postComments/actions';
import { likePost, unlikePost, deletePost } from '../../redux/posts/actions';
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
  likePostError: Error | null;
  unlikePostError: Error | null;
  onFetchNewComments: (postID: string) => void;
  onFetchTopComments: (postID: string) => void;
  onLikePost: (postID: string) => void;
  onUnlikePost: (postID: string) => void;
  onDeletePost: (postID: string) => void;
  onPopPostLayer: () => void;
}

class PostScreen extends Component<PostScreenProps> {
  private detectGoBack: any;
  shouldComponentUpdate(nextProps: PostScreenProps) {
    const {
      route,
      comments,
      sortCommentsBy,
      loading,
      error,
      likePostError,
      unlikePostError,
    } = this.props;
    if (loading !== nextProps.loading) {
      return true;
    }
    if (checkPostChanged(route.params.data, nextProps.route.params.data)) {
      return true;
    }
    if (checkPostCommentListChanged(comments, nextProps.comments)) {
      return true;
    }
    if (
      !checkPostCommentListChanged(comments, nextProps.comments) &&
      (comments.length !== 0 || nextProps.comments.length !== 0)
    ) {
      return false;
    }
    if (sortCommentsBy !== nextProps.sortCommentsBy) {
      return true;
    }
    if (error !== nextProps.error) {
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
    const {
      navigation,
      route,
      onFetchNewComments,
      onPopPostLayer,
    } = this.props;
    this.detectGoBack = navigation.addListener('beforeRemove', () => {
      onPopPostLayer();
    });
    const postID = route.params.data.id;
    await delay(500);
    onFetchNewComments(postID);
  }

  componentWillUnmount() {
    this.detectGoBack();
  }

  toUserScreen = () => {
    const { navigation, route } = this.props;
    const post = route.params.data;
    navigation.push('User', {
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
        replies={item.replies}
        userControl={
          currentUID === item.user.id ? this.performDeleteComment : undefined
        }
      />
    );
  };

  performDeleteComment = () => {
    Alert.alert(
      '',
      'Do you want to delete your comment?',
      [
        {
          text: 'Delete',
          onPress: () => console.log('delete'),
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
      route,
      sortCommentsBy,
      onFetchNewComments,
      onFetchTopComments,
    } = this.props;
    const postID = route.params.data.id;
    if (sortCommentsBy === 'new') {
      onFetchNewComments(postID);
    } else {
      onFetchTopComments(postID);
    }
  };

  emptyHandler = () => {
    const { route, onFetchNewComments } = this.props;
    const postID = route.params.data.id;
    onFetchNewComments(postID);
  };

  performLikePost = async () => {
    const { onLikePost, navigation, route } = this.props;
    const { data } = route.params;
    navigation.setParams({
      data: {
        ...data,
        likes: data.likes + 1,
        isLiked: true,
      },
    });
    const postID = data.id;
    await onLikePost(postID);
    if (this.props.likePostError !== null) {
      this.props.navigation.setParams({
        data: {
          ...this.props.route.params.data,
          likes: this.props.route.params.data.likes - 1,
          isLiked: false,
        },
      });
    }
  };

  performUnlikePost = async () => {
    const { onUnlikePost, navigation, route } = this.props;
    const { data } = route.params;
    navigation.setParams({
      data: {
        ...data,
        likes: data.likes - 1,
        isLiked: false,
      },
    });
    const postID = data.id as string;
    await onUnlikePost(postID);
    if (this.props.unlikePostError !== null) {
      this.props.navigation.setParams({
        data: {
          ...this.props.route.params.data,
          likes: this.props.route.params.data.likes + 1,
          isLiked: true,
        },
      });
    }
  };

  performDeletePost = async () => {
    const { navigation, onPopPostLayer, onDeletePost, route } = this.props;
    const postID = route.params.data.id;
    navigation.goBack();
    onPopPostLayer();
    await delay(500);
    onDeletePost(postID);
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
    const post = this.props.route.params.data;
    const { comments, error, loading, currentUID } = this.props;
    // console.log('post screen', comments);

    const postSection = (
      <PostSection
        post={post}
        likePost={this.performLikePost}
        unLikePost={this.performUnlikePost}
        navigateWhenClickOnUsernameOrAvatar={this.toUserScreen}
        userControl={post.user.id === currentUID ? this.userControl : undefined}
      />
    );

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
          {currentUID !== undefined ? <CommentInput /> : null}
        </View>
      );
    }
    if (comments.length === 0) {
      return (
        <View style={styles.container}>
          {postSection}
          {currentUID !== undefined ? <CommentInput /> : null}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <List
          listHeaderComponent={postSection}
          data={comments}
          renderItem={this.renderItem}
          onEndReached={this.fetchMoreComments}
          checkChangesToUpdate={checkPostCommentListChanged}
          initialNumToRender={5}
          onEndReachedThreshold={0.15}
          maxToRenderPerBatch={5}
          windowSize={undefined}
          listFooterComponent={<View style={{ height: 136 }} />}
          extraData={this.props.route.params.data.likes}
        />
        {currentUID !== undefined ? <CommentInput /> : null}
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
};

export default connect(mapStateToProps, mapDispatchToProps)(PostScreen);
