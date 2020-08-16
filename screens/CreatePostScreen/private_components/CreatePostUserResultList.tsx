import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { checkUserResultListChanged } from '../../../utils/functions';
import { List, UserResultCard } from '../../../components';
import { UserResult } from '../../../models';
import {
  fetchMoreTagUserResults,
  fetchNewTagUserResults,
} from '../../../redux/tag/actions';
import { AppState } from '../../../redux/store';

interface CreatePostUserResultListProps {
  searchQuery: string;
  userTags: Array<UserResult>;
  loading: boolean;
  onFetchMoreTagUserResults: (searchQuery: string) => void;
  onFetchNewTagUserResults: (searchQuery: string) => void;
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
    const { searchQuery, loading } = this.props;
    if (searchQuery !== nextProps.searchQuery) {
      return true;
    }
    if (loading !== nextProps.loading) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    const { searchQuery, onFetchNewTagUserResults } = this.props;
    onFetchNewTagUserResults(searchQuery);
  }

  componentDidUpdate(prevProps: CreatePostUserResultListProps) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    const { searchQuery, loading, onFetchNewTagUserResults } = this.props;
    if (
      searchQuery !== prevProps.searchQuery &&
      loading === false &&
      prevProps.loading === false
    ) {
      this.timeout = setTimeout(() => {
        onFetchNewTagUserResults(searchQuery);
      }, 500);
    }
  }

  performFetchMoreUserResults = () => {
    const { searchQuery, onFetchMoreTagUserResults } = this.props;
    onFetchMoreTagUserResults(searchQuery);
  };

  performSelectUserResult = (user: UserResult) => () => {
    this.props.onSelectUserResult({ id: user.id, username: user.username });
  };

  renderItem = ({ item, index }: { item: UserResult; index: number }) => {
    return (
      <UserResultCard
        data={item}
        onSelect={this.performSelectUserResult(item)}
      />
    );
  };

  render() {
    const { loading, userTags, searchQuery } = this.props;
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
        onEndReached={this.performFetchMoreUserResults}
        renderItem={this.renderItem}
        initialNumToRender={5}
        onEndReachedThreshold={0.05}
        checkChangesToUpdate={checkUserResultListChanged}
        maxToRenderPerBatch={undefined}
        windowSize={undefined}
        keyboardShouldPersistTaps="always"
      />
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  userTags: state.tag.createPost.users,
  loading: state.tag.createPost.loading,
});

const mapDispatchToProps = {
  onFetchMoreTagUserResults: fetchMoreTagUserResults,
  onFetchNewTagUserResults: fetchNewTagUserResults,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreatePostUserResultList);
