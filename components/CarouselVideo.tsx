import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons, Layout } from '../constants';

const square = Layout.window.width;

interface CarouselVideoProps {
  videoUri: string;
  shouldPlay: boolean;
}

export default function CarouselVideo({
  videoUri,
  shouldPlay,
}: CarouselVideoProps) {
  const [mute, setMute] = useState(true);

  const onSetMute = () => setMute(!mute);

  return (
    <TouchableWithoutFeedback onPress={onSetMute}>
      <View>
        <Video
          source={{ uri: videoUri }}
          posterSource={require('../assets/img-empty.png')}
          rate={1.0}
          volume={1.0}
          isMuted={mute}
          resizeMode={Video.RESIZE_MODE_CONTAIN}
          shouldPlay={shouldPlay}
          isLooping
          style={styles.video}
        />
        <View style={styles.muteIcon}>
          <Ionicons
            name={mute ? 'md-volume-off' : 'md-volume-high'}
            size={12}
            color="white"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  video: {
    width: square,
    height: square,
  },
  muteIcon: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 40,
  },
});
