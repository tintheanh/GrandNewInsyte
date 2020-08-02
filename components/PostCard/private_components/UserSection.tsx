import React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet, Text } from 'react-native';
import { FontAwesome5 } from '../../../constants';
import Avatar from '../../../components/Avatar';

interface UserSectionProps {
  avatar: string;
  username: string;
  timeLabel: string;
  iconPrivacy: string;
  navigateWhenPressOnPostOrComment?: () => void;
  navigateWhenPressOnUsernameOrAvatar?: () => void;
  userPostControl?: () => void;
}

export default function UserSection({
  avatar,
  username,
  timeLabel,
  iconPrivacy,
  navigateWhenPressOnUsernameOrAvatar,
  navigateWhenPressOnPostOrComment,
}: UserSectionProps) {
  return (
    <View style={styles.userWrapper}>
      {/* <TouchableWithoutFeedback onPress={navigateWhenPressOnUsernameOrAvatar}>
        <Image
          style={styles.avatar}
          source={
            avatar ? { uri: avatar } : require('../../../assets/user.png')
          }
          defaultSource={require('../../../assets/user.png')}
        />
      </TouchableWithoutFeedback> */}
      <Avatar avatar={avatar} onPress={navigateWhenPressOnUsernameOrAvatar!} />
      <View style={styles.usernameAndTimeWrapper}>
        <TouchableWithoutFeedback onPress={navigateWhenPressOnUsernameOrAvatar}>
          <Text style={styles.username}>{username}</Text>
        </TouchableWithoutFeedback>
        <View style={styles.timeAndPrivacyWrapper}>
          <Text style={styles.time}>{timeLabel}</Text>
          <FontAwesome5
            name={iconPrivacy}
            size={9}
            color="white"
            style={{ marginTop: 1 }}
          />
        </View>
      </View>
      {/* remaining space for pressing */}
      <TouchableWithoutFeedback onPress={navigateWhenPressOnPostOrComment}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
  },
  usernameAndTimeWrapper: {
    flexDirection: 'column',
    marginLeft: 6,
    marginTop: -3,
  },
  username: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  timeAndPrivacyWrapper: {
    flexDirection: 'row',
  },
  time: {
    color: 'white',
    fontSize: 10,
    marginRight: 4,
  },
  iconDown: {
    marginTop: -5,
  },
});
