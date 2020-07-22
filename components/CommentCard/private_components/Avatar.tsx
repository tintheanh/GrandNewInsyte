import React from 'react';
import { Image, TouchableWithoutFeedback } from 'react-native';

interface AvatarProps {
  avatar: string;
}

export default function Avatar({ avatar }: AvatarProps) {
  return (
    <TouchableWithoutFeedback onPress={() => console.log('to user profile')}>
      <Image
        source={
          avatar.length ? { uri: avatar } : require('../../../assets/user.png')
        }
        defaultSource={require('../../../assets/user.png')}
        style={{
          width: 40,
          height: 40,
          borderRadius: 40 / 2,
        }}
      />
    </TouchableWithoutFeedback>
  );
}
