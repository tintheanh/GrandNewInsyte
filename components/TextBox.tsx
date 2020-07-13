import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface TextBoxProps {
  icon: JSX.Element;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  placeholder?: string;
  value: string;
  type?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad'
    | 'decimal-pad'
    | 'visible-password'
    | 'ascii-capable'
    | 'numbers-and-punctuation'
    | 'url'
    | 'name-phone-pad'
    | 'twitter'
    | 'web-search'
    | undefined;
  onChangeText: ((text: string) => void) | undefined;
  onWatchFocus?: (...args: any) => void | any;
  onWatchBlur?: (...args: any) => void | any;
}

const TextBox = ({
  icon,
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry = false,
  placeholder = '',
  value = 'default',
  type,
  onChangeText,
  onWatchFocus,
  onWatchBlur,
}: TextBoxProps) => {
  const [isFocused, setFocus] = useState(false);

  const onFocus = () => {
    setFocus(true);
    if (onWatchFocus) {
      onWatchFocus();
    }
  };

  const onBlur = () => {
    setFocus(false);
    if (onWatchBlur) {
      onWatchBlur();
    }
  };

  return (
    <View style={styles.textBoxWrapper}>
      <View style={styles.icon}>{icon}</View>
      <TextInput
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={type}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#a6a9b4"
        value={value}
        onChangeText={onChangeText}
        style={{
          ...styles.textBox,
          borderColor: isFocused ? '#bbaf80' : '#737583',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textBoxWrapper: {
    width: '70%',
    flexDirection: 'column',
  },
  textBox: {
    width: '100%',
    height: 40,
    paddingLeft: 28,
    color: 'white',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: 1.5,
  },
  icon: {
    position: 'relative',
    top: 30,
  },
});

export default TextBox;
