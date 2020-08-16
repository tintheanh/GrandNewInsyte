import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import {
  fetchMoreUserResults,
  fetchNewUserResults,
} from '../../../redux/search_user/actions';
import { List, UserResultCard } from '../../../components';
import { pushUserLayer } from '../../../redux/user_stack/actions';
import { checkUserResultListChanged } from '../../../utils/functions';
import { Layout, Colors, bottomTabHeight } from '../../../constants';
import { AppState } from '../../../redux/store';
import { UserResult } from '../../../models';

const screenWidth = Layout.window.width;
const screenHeight = Layout.window.height;

interface SearchUserResultListProps {
  navigation: any;
  currentUID: string | undefined;
  searchQuery: string;
  keyboardHeight: number;
  results: Array<UserResult>;
  loading: boolean;
  onFetchMoreUserResults: (searchQuery: string) => void;
  onFetchNewUserResults: (searchQuery: string) => void;
  onPushUserLayer: (userLayer: {
    userID: string;
    username: string;
    avatar: string;
  }) => void;
}

class SearchUserResultList extends Component<SearchUserResultListProps> {
  private timeout: NodeJS.Timeout | null;
  constructor(props: SearchUserResultListProps) {
    super(props);
    this.timeout = null;
  }

  componentDidMount() {
    const { searchQuery, onFetchNewUserResults } = this.props;
    onFetchNewUserResults(searchQuery);
  }

  componentDidUpdate(prevProps: SearchUserResultListProps) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    const { searchQuery, loading, onFetchNewUserResults } = this.props;
    if (
      searchQuery !== prevProps.searchQuery &&
      loading === false &&
      prevProps.loading === false
    ) {
      this.timeout = setTimeout(() => {
        onFetchNewUserResults(searchQuery);
      }, 500);
    }
  }

  performFetchMoreUserResults = () => {
    const { searchQuery, onFetchMoreUserResults } = this.props;
    onFetchMoreUserResults(searchQuery);
  };

  navigateToUserScreen = (user: UserResult) => () => {
    const { currentUID, navigation, onPushUserLayer } = this.props;
    if (currentUID !== user.id) {
      onPushUserLayer({
        userID: user.id,
        username: user.username,
        avatar: user.avatar,
      });
      navigation.push('UserScreen', {
        user,
      });
    } else {
      navigation.navigate('ProfileScreen', {
        title: user.username,
      });
    }
  };

  renderItem = ({ item, index }: { item: UserResult; index: number }) => {
    return (
      <UserResultCard data={item} onSelect={this.navigateToUserScreen(item)} />
    );
  };

  render() {
    const { keyboardHeight, loading, results, searchQuery } = this.props;

    if (loading && results.length === 0) {
      return (
        <View
          style={[
            styles.container,
            {
              height: screenHeight - bottomTabHeight - keyboardHeight,
            },
            { flex: 1, justifyContent: 'center', alignItems: 'center' },
          ]}>
          <ActivityIndicator size="small" color="white" />
        </View>
      );
    }
    if (results.length === 0 || searchQuery === '') {
      return (
        <View
          style={[
            styles.container,
            {
              height: screenHeight - bottomTabHeight - keyboardHeight,
            },
            { flex: 1, justifyContent: 'center', alignItems: 'center' },
          ]}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.4)' }}>No result</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.container,
          {
            height:
              keyboardHeight === 0
                ? screenHeight - 2 * bottomTabHeight
                : screenHeight - bottomTabHeight - keyboardHeight,
          },
        ]}>
        <List
          data={results}
          onEndReached={this.performFetchMoreUserResults}
          listHeaderComponent={<View style={{ marginTop: 12 }} />}
          renderItem={this.renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          onEndReachedThreshold={0.2}
          windowSize={7}
          checkChangesToUpdate={checkUserResultListChanged}
          keyboardShouldPersistTaps="always"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    backgroundColor: Colors.darkColor,
    position: 'absolute',
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
    top: 45,
  },
});

const mapStateToProps = (state: AppState) => ({
  currentUID: state.auth.user?.id,
  results: state.searchUser.results,
  loading: state.searchUser.loading,
});

const mapDispatchToProps = {
  onFetchMoreUserResults: fetchMoreUserResults,
  onFetchNewUserResults: fetchNewUserResults,
  onPushUserLayer: pushUserLayer,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchUserResultList);
