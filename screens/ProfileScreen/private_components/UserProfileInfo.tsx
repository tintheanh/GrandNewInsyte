import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserProfileInfo({
  name,
  bio,
}: {
  name: string;
  bio: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.bio}>{bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  bio: {
    color: 'white',
  },
});
