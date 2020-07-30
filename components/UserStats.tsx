import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserStatProps {
  postNum: number;
  followersNum: number;
  followingNum: number;
}

export default function UserStats({
  postNum,
  followersNum,
  followingNum,
}: UserStatProps) {
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
}

const styles = StyleSheet.create({
  followStats: {
    flexDirection: 'row',
    flexGrow: 1,
    width: '100%',
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
