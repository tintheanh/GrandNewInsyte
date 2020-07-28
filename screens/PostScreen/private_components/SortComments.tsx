import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { AppState } from '../../../redux/store';
import {
  setSortComments,
  fetchNewComments,
  fetchTopComments,
} from '../../../redux/commentsStack/actions';
import { AntDesign } from '../../../constants';

interface SortCommentsProps {
  postID: string;
  onSetSortComments: (type: 'all' | 'top') => void;
  onFetchNewComments: (postID: string) => void;
  onFetchTopComments: (postID: string) => void;
  label: 'all' | 'top';
}

function SortComments({
  postID,
  onFetchNewComments,
  onFetchTopComments,
  onSetSortComments,
  label,
}: SortCommentsProps) {
  const selectCommentFilter = () => {
    Alert.alert(
      '',
      'Sort comments by',
      [
        {
          text: 'All comments',
          onPress: () => {
            onSetSortComments('all');
            onFetchNewComments(postID);
          },
        },
        {
          text: 'Top comments',
          onPress: () => {
            onSetSortComments('top');
            onFetchTopComments(postID);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <TouchableWithoutFeedback onPress={selectCommentFilter}>
      <View style={styles.filterComment}>
        <Text style={styles.filterCommentText}>
          {label === 'all' ? 'All comments' : 'Top comment'}{' '}
        </Text>
        <AntDesign name="caretdown" size={11} color="white" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  filterComment: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 16,
    marginLeft: 16,
    alignSelf: 'flex-start',
  },
  filterCommentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

const mapStateToProps = (state: AppState) => {
  const { currentTab } = state.commentsStack;
  return {
    label: state.commentsStack[currentTab].top()?.type ?? 'all',
  };
};

const mapDispatchToProps = {
  onSetSortComments: setSortComments,
  onFetchNewComments: fetchNewComments,
  onFetchTopComments: fetchTopComments,
};

export default connect(mapStateToProps, mapDispatchToProps)(SortComments);
