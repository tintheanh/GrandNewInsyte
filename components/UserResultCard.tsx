import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface UserResultCardProps {
  data: {
    avatar: string;
    username: string;
    name: string;
  };
}

export default function UserResultCard({ data }: UserResultCardProps) {
  return (
    <View style={styles.cardContainer}>
      <Image
        source={
          data.avatar.length
            ? { uri: data.avatar }
            : require('../assets/user.png')
        }
        defaultSource={require('../assets/user.png')}
        style={styles.avatar}
      />
      <View style={styles.nameWrapper}>
        <Text style={styles.username}>{data.username}</Text>
        <Text style={styles.name}>{data.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameWrapper: {
    justifyContent: 'space-evenly',
    paddingLeft: 8,
  },
  username: {
    color: 'white',
  },
  name: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
