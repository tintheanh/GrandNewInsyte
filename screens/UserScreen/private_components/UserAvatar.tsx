import React from 'react';
import { Image } from 'react-native';
import Layout from '../../../constants/Layout';

const dim = Layout.window.width;

export default function UserAvatar({ avatar }: { avatar: string }) {
  return (
    <Image
      source={
        avatar ? { uri: avatar } : require('../../../assets/user-profile.png')
      }
      defaultSource={require('../../../assets/user.png')}
      style={{
        width: dim / 5,
        height: dim / 5,
        borderRadius: dim / 10,
      }}
    />
  );
}
