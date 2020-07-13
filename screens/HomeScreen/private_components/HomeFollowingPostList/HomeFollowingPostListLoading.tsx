import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '../../../../constants';
import { connect } from 'react-redux';
import { AppState } from '../../../../redux/store';

function HomeFollowingostListLoading({ loading }: { loading?: boolean }) {
  return loading ? (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="white" />
    </View>
  ) : (
    <View style={styles.container}>
      <MaterialIcons name="done" size={22} color="rgba(255, 255, 255, 0.6)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
  },
});

const mapStateToProps = (state: AppState) => ({
  loading: state.allPosts.following.loading,
});

export default connect(mapStateToProps, null)(HomeFollowingostListLoading);
