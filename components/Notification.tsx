import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import {
  SimpleLineIcons,
  AntDesign,
  MaterialIcons,
  Entypo,
  Colors,
} from '../constants';
import { convertTime } from '../utils/functions';

interface NotificationProps {
  username: string;
  avatar: string;
  type: 'like' | 'comment' | 'reply';
  target: 'post' | 'comment' | 'reply';
  time: number;
}

export default function Notification({
  username,
  avatar,
  type,
  target,
  time,
}: NotificationProps) {
  let icon;
  let text;
  switch (type) {
    case 'like':
      icon = <AntDesign name="like1" size={14} color={Colors.tintColor} />;
      text = 'liked';
      break;
    case 'comment':
      icon = (
        <MaterialIcons name="mode-comment" size={16} color={Colors.tintColor} />
      );
      text = 'commented';
      break;
    default:
      icon = <Entypo name="reply" size={16} color={Colors.tintColor} />;
      text = 'replied';
      break;
  }

  return (
    <View style={styles.container}>
      <Avatar avatar={avatar} />
      <View style={styles.textWrapper}>
        <Text style={styles.text}>
          <Text style={styles.username}>{username}</Text> {text} your {target}
        </Text>
        <View style={styles.timeWrapper}>
          {/* <AntDesign name="like1" size={14} color={Colors.tintColor} /> */}
          {/* <MaterialIcons
            name="mode-comment"
            size={18}
            color={Colors.tintColor}
          /> */}
          {icon}
          <Text style={styles.time}>{convertTime(time)} ago</Text>
        </View>
      </View>
      <View style={styles.icon}>
        <SimpleLineIcons name="arrow-right" size={16} color="white" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.darkColor,
    flexDirection: 'row',
    marginBottom: 1,
  },
  textWrapper: {
    marginLeft: 12,
  },
  timeWrapper: {
    flexDirection: 'row',
    marginTop: 6,
  },
  time: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
  },
  text: {
    color: 'white',
  },
  username: {
    fontWeight: 'bold',
  },
  icon: {
    position: 'absolute',
    right: 12,
    alignSelf: 'center',
  },
});
