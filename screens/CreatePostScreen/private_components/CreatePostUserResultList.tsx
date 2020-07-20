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
import { checkUserResultListChanged } from '../../../utils/functions';
import { List, UserResultCard } from '../../../components';
import { UserResult } from '../../../models';
import {
  fetchUserResults,
  fetchNewUserResults,
} from '../../../redux/tag/actions';
import { AppState } from '../../../redux/store';

interface CreatePostUserResultListProps {
  tagQuery: string;
  userTags: Array<UserResult>;
  loading: boolean;
  onFetchUserResults: (tagQuery: string) => void;
  onFetchNewUserResults: (tagQuery: string) => void;
}

class CreatePostUserResultList extends Component<
  CreatePostUserResultListProps
> {
  shouldComponentUpdate(nextProps: CreatePostUserResultListProps) {
    // if (!checkUserResultListChanged(this.props.userTags, nextProps.userTags)) {
    //   return false;
    // }
    if (this.props.tagQuery !== nextProps.tagQuery) {
      return true;
    }
    if (this.props.loading !== nextProps.loading) {
      return true;
    }
    if (checkUserResultListChanged(this.props.userTags, nextProps.userTags)) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.props.onFetchNewUserResults(this.props.tagQuery);
  }

  componentDidUpdate(prevProps: CreatePostUserResultListProps) {
    // console.log('update', this.props.tagQuery);
    if (
      this.props.tagQuery !== prevProps.tagQuery &&
      this.props.loading === false &&
      prevProps.loading === false
    ) {
      this.props.onFetchNewUserResults(this.props.tagQuery);
    }
  }

  performFetchUserTag = () => {
    this.props.onFetchUserResults(this.props.tagQuery);
  };

  render() {
    // console.log('render');
    // console.log(this.props.tagQuery);
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
      <List
        data={userTags}
        card={UserResultCard as React.ReactNode}
        onEndReached={this.performFetchUserTag}
        initialNumToRender={5}
        onEndReachedThreshold={0.1}
        checkChangesToUpdate={checkUserResultListChanged}
        maxToRenderPerBatch={undefined}
        windowSize={undefined}
      />
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  userTags: state.tag.createPost.users,
  loading: state.tag.createPost.loading,
});

const mapDispatchToProps = {
  onFetchUserResults: fetchUserResults,
  onFetchNewUserResults: fetchNewUserResults,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreatePostUserResultList);
