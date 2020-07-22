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
} from '../../../redux/postComments/actions';
import { AntDesign } from '../../../constants';

function SortComments(props: any) {
  const selectCommentFilter = () => {
    Alert.alert(
      '',
      'Sort comments by',
      [
        {
          text: 'New comments',
          onPress: () => {
            props.onSetSortComments('new');
            props.onFetchNewComments(props.postID);
          },
        },
        {
          text: 'Top comments',
          onPress: () => {
            props.onSetSortComments('top');
            props.onFetchTopComments(props.postID);
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
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
          {props.label === 'new' ? 'New comments' : 'Top comment'}{' '}
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

const mapStateToProps = (state: AppState) => ({
  label: state.postComments.stack.top()?.type ?? 'new',
});

const mapDispatchToProps = {
  onSetSortComments: setSortComments,
  onFetchNewComments: fetchNewComments,
  onFetchTopComments: fetchTopComments,
};

export default connect(mapStateToProps, mapDispatchToProps)(SortComments);
