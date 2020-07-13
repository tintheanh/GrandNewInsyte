import React from 'react';
import { TextInput } from 'react-native';
import { Layout } from '../../../constants';

export default function TextPostInput({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <TextInput
      style={{
        width: '100%',
        height: Layout.window.height / 4,
        color: 'white',
        marginTop: 12,
      }}
      value={value}
      onChangeText={onChangeText}
      placeholder="Your text post"
      placeholderTextColor="#a6a9b4"
      autoCorrect={false}
      multiline
    />
  );
}
