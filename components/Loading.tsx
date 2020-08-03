import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants';

export default function Loading({
  backgroundColor = Colors.brightColor,
}: {
  backgroundColor?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor,
      }}>
      <ActivityIndicator size="small" color="white" />
    </View>
  );
}
