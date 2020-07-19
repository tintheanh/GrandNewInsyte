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
    if (this.props.tagQuery !== '') {
      this.props.onCreatePostTagNew(this.props.tagQuery);
    }
  }

  componentDidUpdate(prevProps: CreatePostUserTagProps) {
    // console.log('update', this.props.tagQuery);
    if (
      this.props.tagQuery !== prevProps.tagQuery &&
      this.props.tagQuery !== ''
    ) {
      this.props.onCreatePostTagNew(this.props.tagQuery);
    }
  }

  render() {
    // console.log('render');
    const { loading, userTags } = this.props;
    console.log(userTags);
    if (loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="white" />
        </View>
      );
    }
    if (userTags.length === 0) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.4)' }}>No result</Text>
        </View>
      );
    }

    return <TagList userTags={userTags} />;
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
