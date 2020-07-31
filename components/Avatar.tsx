import React from 'react';
import { Image, TouchableWithoutFeedback } from 'react-native';

interface AvatarProps {
  avatar: string;
  onPress?: () => void;
}

export default React.memo(
  function Avatar({ avatar, onPress }: AvatarProps) {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <Image
          source={
            avatar.length ? { uri: avatar } : require('../assets/user.png')
          }
          defaultSource={require('../assets/user.png')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 40 / 2,
          }}
        />
      </TouchableWithoutFeedback>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.avatar !== nextProps.avatar) {
      return false;
    }
    return true;
  },
);
