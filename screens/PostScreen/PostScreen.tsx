import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import { Colors } from '../../constants';
import { CommentCard, List, Loading, ErrorView } from '../../components';
import { delay, checkPostCommentListChanged } from '../../utils/functions';
import { PostSection, CommentInput } from './private_components';
import {
  fetchNewComments,
  fetchTopComments,
} from '../../redux/postComments/actions';
import { AppState } from '../../redux/store';

class PostScreen extends Component<any> {
  shouldComponentUpdate(nextProps: any) {
    if (checkPostCommentListChanged(this.props.comments, nextProps.comments)) {
      return true;
    }
    if (
      !checkPostCommentListChanged(this.props.comments, nextProps.comments) &&
      (this.props.comments.length !== 0 || nextProps.comments.length !== 0)
    ) {
      return false;
    }
    if (this.props.type !== nextProps.type) {
      return true;
    }
    if (this.props.loading !== nextProps.loading) {
      return true;
    }
    if (this.props.error !== nextProps.error) {
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
    if (this.props.type === 'new') {
      this.props.onFetchNewComments(postID);
    } else {
      this.props.onFetchTopComments(postID);
    }
  };

  emptyHandler = () => {
    const postID = this.props.route.params.data.id;
    this.props.onFetchNewComments(postID);
  };

  render() {
    const post = this.props.route.params.data;
    const { comments, error, loading } = this.props;
    console.log('post screen', comments);

    let iconPrivacy = '';
    switch (post.privacy) {
      case 'public':
        iconPrivacy = 'globe';
        break;
      case 'friends':
        iconPrivacy = 'users';
        break;
      default:
        iconPrivacy = 'lock';
        break;
    }

    const postSection = (
      <PostSection
        id={post.id}
        avatar={post.user.avatar}
        username={post.user.username}
        datePosted={post.datePosted}
        iconPrivacy={iconPrivacy}
        caption={post.caption}
        media={post.media}
        likes={post.likes}
        comments={post.comments}
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
        </View>
      );
    }
    if (comments.length === 0) {
      return <View style={styles.container}>{postSection}</View>;
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
  type: state.postComments.stack.top()?.type ?? 'new',
});

const mapDispatchToProps = {
  onFetchNewComments: fetchNewComments,
  onFetchTopComments: fetchTopComments,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostScreen);
