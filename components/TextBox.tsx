import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface TextBoxProps {
  // Required props
  icon: JSX.Element;
  value: string;

  // Optional props
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  placeholder?: string;
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
    | 'web-search';

  /**
   * Required method set text value for component
   * @param text New text value to set
   */
  onChangeText: (text: string) => void;
}

export default function TextBox({
  icon,
  value,
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry,
  placeholder,
  type = 'default',
  onChangeText,
}: TextBoxProps) {
  /**
   * Local state
   * @var isFocused Boolean state detect when component is focused
   */
  const [isFocused, setFocus] = useState(false);

  const performOnWatchFocus = () => setFocus(true);

  const performOnWatchBlur = () => setFocus(false);

  return (
    <View style={styles.textBoxWrapper}>
      <View style={styles.icon}>{icon}</View>
      <TextInput
        onFocus={performOnWatchFocus}
        onBlur={performOnWatchBlur}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={type}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#a6a9b4"
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.textBox,
          { borderColor: isFocused ? '#bbaf80' : '#737583' },
        ]}
      />
    </View>
  );
}

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
