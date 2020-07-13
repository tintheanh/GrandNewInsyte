import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../constants';

interface ErrorTextProps {
  text: string;
}

export default function ErrorText({ text }: ErrorTextProps) {
  return <Text style={styles.errStyle}>{text}</Text>;
}

const styles = StyleSheet.create({
  errStyle: {
    color: Colors.errorColor,
    fontWeight: 'bold',
  },
});
