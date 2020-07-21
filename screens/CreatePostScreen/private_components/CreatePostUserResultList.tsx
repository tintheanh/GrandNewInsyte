import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { checkUserResultListChanged } from '../../../utils/functions';
import { List, UserResultCard } from '../../../components';
import { UserResult } from '../../../models';
import {
  fetchUserResults,
  fetchNewUserResults,
} from '../../../redux/tag/actions';
import { AppState } from '../../../redux/store';

interface CreatePostUserResultListProps {
  searchQuery: string;
  userTags: Array<UserResult>;
  loading: boolean;
  onFetchUserResults: (searchQuery: string) => void;
  onFetchNewUserResults: (searchQuery: string) => void;
  onSelectUserResult: ({
    id,
    username,
  }: {
    id: string;
    username: string;
  }) => void;
}

class CreatePostUserResultList extends Component<
  CreatePostUserResultListProps
> {
  private timeout: NodeJS.Timeout | null;
  constructor(props: CreatePostUserResultListProps) {
    super(props);
    this.timeout = null;
  }

  shouldComponentUpdate(nextProps: CreatePostUserResultListProps) {
    // if (!checkUserResultListChanged(this.props.userTags, nextProps.userTags)) {
    //   return false;
    // }
    if (this.props.searchQuery !== nextProps.searchQuery) {
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
    this.props.onFetchNewUserResults(this.props.searchQuery);
  }

  componentDidUpdate(prevProps: CreatePostUserResultListProps) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    // console.log('update', this.props.searchQuery);
    if (
      this.props.searchQuery !== prevProps.searchQuery &&
      this.props.loading === false &&
      prevProps.loading === false
    ) {
      this.timeout = setTimeout(() => {
        this.props.onFetchNewUserResults(this.props.searchQuery);
      }, 500);
    }
  }

  performFetchMoreUserResults = () => {
    this.props.onFetchUserResults(this.props.searchQuery);
  };

  render() {
    const { loading, userTags, searchQuery, onSelectUserResult } = this.props;
    // console.log(userTags);
    if (loading && userTags.length === 0) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="white" />
        </View>
      );
    }
    if (userTags.length === 0 || searchQuery === '') {
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
        onEndReached={this.performFetchMoreUserResults}
        initialNumToRender={5}
        onEndReachedThreshold={0.05}
        checkChangesToUpdate={checkUserResultListChanged}
        maxToRenderPerBatch={undefined}
        windowSize={undefined}
        keyboardShouldPersistTaps="always"
        onSelectCard={onSelectUserResult}
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
