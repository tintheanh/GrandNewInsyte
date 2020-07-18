import React from 'react';
import { TextInput } from 'react-native';
import { Layout } from '../../../constants';

export default React.memo(
  function TextPostInput({
    value,
    onChangeText,
    onSelectionChange,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    onSelectionChange: (event: any) => void;
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
        onSelectionChange={onSelectionChange}
        placeholder="Your text post"
        placeholderTextColor="#a6a9b4"
        autoCorrect={false}
        multiline
      />
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.value !== nextProps.value) {
      return false;
    }
    return true;
  },
);
