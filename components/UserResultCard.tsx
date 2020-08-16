import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

interface UserResultCardProps {
  data: {
    id: string;
    avatar: string;
    username: string;
    name: string;
  };
  onSelect: () => void;
}

export default function UserResultCard(props: UserResultCardProps) {
  const { avatar, username, name } = props.data;
  return (
    <TouchableWithoutFeedback onPress={props.onSelect}>
      <View style={styles.cardContainer}>
        <Image
          source={
            avatar.length ? { uri: avatar } : require('../assets/user.png')
          }
          defaultSource={require('../assets/user.png')}
          style={styles.avatar}
        />
        <View style={styles.nameWrapper}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
