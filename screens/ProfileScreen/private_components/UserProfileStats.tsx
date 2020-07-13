import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserProfileStatProps {
  postNum: number;
  followersNum: number;
  followingNum: number;
}

export default React.memo(function UserProfileStats({
  postNum,
  followersNum,
  followingNum,
}: UserProfileStatProps) {
  return (
    <View style={styles.followStats}>
      <View>
        <Text style={styles.statNum}>{postNum}</Text>
        <Text style={styles.statText}>Posts</Text>
      </View>
      <View>
        <Text style={styles.statNum}>{followersNum}</Text>
        <Text style={styles.statText}>Followers</Text>
      </View>
      <View>
        <Text style={styles.statNum}>{followingNum}</Text>
        <Text style={styles.statText}>Following</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  followStats: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  statText: {
    color: 'white',
    fontSize: 12,
  },
  statNum: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
});
