import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '../../../constants';

interface MediaInputProps {
  onOpenPhotoLibrary: () => void;
  onOpenPhotoCamera: () => void;
  onOpenVideoCamera: () => void;
}

export default function MediaInput(props: MediaInputProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 12,
        marginBottom: 20,
      }}>
      <TouchableOpacity onPress={props.onOpenPhotoLibrary}>
        <Ionicons name="ios-images" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={props.onOpenPhotoCamera}
        style={{ marginLeft: 12 }}>
        <FontAwesome5 name="camera" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={props.onOpenVideoCamera}
        style={{ marginLeft: 12 }}>
        <FontAwesome5 name="video" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
