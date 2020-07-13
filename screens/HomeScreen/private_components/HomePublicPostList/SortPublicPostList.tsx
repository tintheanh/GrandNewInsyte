import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  Entypo,
  MaterialCommunityIcons,
  AntDesign,
} from '../../../../constants';
import { connect } from 'react-redux';
import {
  fetchPublicHotPosts,
  fetchPublicNewPosts,
  setPublicHotTime,
  setPublicFeedChoice,
} from '../../../../redux/posts/actions';
import { AppState } from '../../../../redux/store';
import { oneWeek, oneMonth, oneYear } from '../../../../constants';

function SortPublicPostList(props: any) {
  const selectPostFilter = () => {
    Alert.alert(
      '',
      'Sort posts by',
      [
        {
          text: 'New',
          onPress: () => {
            if (props.feedChoice !== 'new') {
              props.onSetPublicFeedChoice('new');
              props.onFetchPublicNewPosts();
            }
          },
        },
        {
          text: 'Hot',
          onPress: () => {
            if (props.feedChoice !== 'hot') {
              props.onSetPublicFeedChoice('hot');
              props.onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const selectTimeFilter = () => {
    Alert.alert(
      '',
      'Sort hot posts by',
      [
        {
          text: 'This week',
          onPress: () => {
            if (props.timeChoice !== oneWeek) {
              props.onSetPublicHotTime(oneWeek);
              props.onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'This month',
          onPress: () => {
            if (props.timeChoice !== oneMonth) {
              props.onSetPublicHotTime(oneMonth);
              props.onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'This year',
          onPress: () => {
            if (props.timeChoice !== oneYear) {
              props.onSetPublicHotTime(oneYear);
              props.onFetchPublicHotPosts();
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  let timeLabel = '';
  switch (props.timeChoice) {
    case oneWeek:
      timeLabel = 'this week';
      break;
    case oneMonth:
      timeLabel = 'this month';
      break;
    default:
      timeLabel = 'this year';
      break;
  }

  if (props.feedChoice === 'new') {
    return (
      <TouchableOpacity
        onPress={selectPostFilter}
        style={{ alignSelf: 'flex-start' }}>
        <View style={styles.btnContainer}>
          <Entypo name="new" size={13} color="white" />
          <Text style={styles.label}>New</Text>
          <AntDesign name="caretdown" size={11} color="white" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={selectPostFilter}
        style={{ alignSelf: 'flex-start' }}>
        <View style={styles.btnContainer}>
          <MaterialCommunityIcons name="fire" size={15} color="white" />
          <Text style={styles.label}>Hot</Text>
          <AntDesign name="caretdown" size={11} color="white" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={selectTimeFilter}
        style={{ alignSelf: 'flex-start' }}>
        <View style={styles.btnContainer}>
          <Entypo name="back-in-time" size={13} color="white" />
          <Text style={styles.label}>{timeLabel}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  label: {
    color: 'white',
    fontSize: 10,
    paddingLeft: 6,
    paddingRight: 6,
    marginTop: 1,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

const mapStateToProps = (state: AppState) => ({
  feedChoice: state.allPosts.public.feedChoice,
  timeChoice: state.allPosts.public.hotTime,
});

const mapDispatchToProps = {
  onFetchPublicHotPosts: fetchPublicHotPosts,
  onFetchPublicNewPosts: fetchPublicNewPosts,
  onSetPublicHotTime: setPublicHotTime,
  onSetPublicFeedChoice: setPublicFeedChoice,
};

export default connect(mapStateToProps, mapDispatchToProps)(SortPublicPostList);
