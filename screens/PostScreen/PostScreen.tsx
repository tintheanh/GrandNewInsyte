import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import { Colors } from '../../constants';
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
} from '../../redux/postComments/actions';
import { likePost, unlikePost } from '../../redux/posts/actions';
import { AppState } from '../../redux/store';
import { Post, PostComment } from '../../models';

interface PostScreenProps {
  navigation: {
    push: (screen: string, options: any) => void;
    setParams: (params: any) => void;
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
}

class PostScreen extends Component<PostScreenProps> {
  shouldComponentUpdate(nextProps: PostScreenProps) {
    if (
      checkPostChanged(
        this.props.route.params.data,
        nextProps.route.params.data,
      )
    ) {
      return true;
    }
    if (checkPostCommentListChanged(this.props.comments, nextProps.comments)) {
      return true;
    }
    if (
      !checkPostCommentListChanged(this.props.comments, nextProps.comments) &&
      (this.props.comments.length !== 0 || nextProps.comments.length !== 0)
    ) {
      return false;
    }
    if (this.props.sortCommentsBy !== nextProps.sortCommentsBy) {
      return true;
    }
    if (this.props.loading !== nextProps.loading) {
      return true;
    }
    if (this.props.error !== nextProps.error) {
      return true;
    }
    if (this.props.likePostError !== nextProps.likePostError) {
      return true;
    }
    if (this.props.unlikePostError !== nextProps.unlikePostError) {
      return true;
    }

    return false;
  }

  async componentDidMount() {
    const postID = this.props.route.params.data.id;
    await delay(500);
    this.props.onFetchNewComments(postID);
  }

  toUserScreen = () => {
    const post = this.props.route.params.data;
    this.props.navigation.push('User', {
      title: post.user.username,
      avatar: post.user.avatar,
    });
  };

  renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <CommentCard
        id={item.id}
        user={item.user}
        content={item.content}
        datePosted={item.datePosted}
        likes={item.likes}
        replies={item.replies}
      />
    );
  };

  fetchMoreComments = () => {
    const postID = this.props.route.params.data.id;
    if (this.props.sortCommentsBy === 'new') {
      this.props.onFetchNewComments(postID);
    } else {
      this.props.onFetchTopComments(postID);
    }
  };

  emptyHandler = () => {
    const postID = this.props.route.params.data.id as string;
    this.props.onFetchNewComments(postID);
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
    const postID = data.id as string;
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

  render() {
    const post = this.props.route.params.data;
    const { comments, error, loading } = this.props;
    // console.log('post screen', comments);

    const postSection = (
      <PostSection
        post={post}
        likePost={this.performLikePost}
        unLikePost={this.performUnlikePost}
        navigateWhenClickOnUsernameOrAvatar={this.toUserScreen}
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
          <CommentInput />
        </View>
      );
    }
    if (comments.length === 0) {
      return (
        <View style={styles.container}>
          {postSection}
          <CommentInput />
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
          initialNumToRender={10}
          onEndReachedThreshold={0.15}
          maxToRenderPerBatch={5}
          windowSize={undefined}
          listFooterComponent={<View style={{ height: 136 }} />}
          extraData={this.props.route.params.data.likes}
        />
        <CommentInput />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brightColor,
  },
});

const mapStateToProps = (state: AppState) => ({
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
};

export default connect(mapStateToProps, mapDispatchToProps)(PostScreen);
