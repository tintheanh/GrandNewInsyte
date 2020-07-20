import React, { Component } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { Colors } from '../../../constants';
import { checkUserTagsChanged } from '../../../utils/functions';
import { TagList, Loading } from '../../../components';
import { UserResult } from '../../../models';
import { createPostTag, createPostTagNew } from '../../../redux/tag/actions';
import { AppState } from '../../../redux/store';

interface CreatePostUserTagProps {
  tagQuery: string;
  userTags: Array<UserResult>;
  loading: boolean;
  onCreatePostTag: (tagQuery: string) => void;
  onCreatePostTagNew: (tagQuery: string) => void;
}

class CreatePostUserTag extends Component<CreatePostUserTagProps> {
  shouldComponentUpdate(nextProps: CreatePostUserTagProps) {
    // if (!checkUserTagsChanged(this.props.userTags, nextProps.userTags)) {
    //   return false;
    // }
    if (this.props.tagQuery !== nextProps.tagQuery) {
      return true;
    }
    if (this.props.loading !== nextProps.loading) {
      return true;
    }
    if (checkUserTagsChanged(this.props.userTags, nextProps.userTags)) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.props.onCreatePostTagNew(this.props.tagQuery);
  }

  componentDidUpdate(prevProps: CreatePostUserTagProps) {
    // console.log('update', this.props.tagQuery);
    if (
      this.props.tagQuery !== prevProps.tagQuery &&
      this.props.loading === false &&
      prevProps.loading === false
    ) {
      this.props.onCreatePostTagNew(this.props.tagQuery);
    }
  }

  performFetchUserTag = () => {
    this.props.onCreatePostTag(this.props.tagQuery);
  };

  render() {
    // console.log('render');
    console.log(this.props.tagQuery);
    const { loading, userTags, tagQuery } = this.props;
    console.log(userTags);
    if (loading && userTags.length === 0) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="white" />
        </View>
      );
    }
    if (userTags.length === 0 || tagQuery === '') {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.4)' }}>No result</Text>
        </View>
      );
    }

    return (
      <TagList userTags={userTags} onEndReached={this.performFetchUserTag} />
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  userTags: state.tag.createPost.users,
  loading: state.tag.createPost.loading,
});

const mapDispatchToProps = {
  onCreatePostTag: createPostTag,
  onCreatePostTagNew: createPostTagNew,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePostUserTag);
