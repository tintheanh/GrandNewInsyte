import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserInfo({ name, bio }: { name: string; bio: string }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.bio}>{bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  bio: {
    color: 'white',
  },
});
