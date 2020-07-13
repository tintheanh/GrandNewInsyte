import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';

export default function Loading() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.brightColor,
      }}>
      <ActivityIndicator size="small" color="white" />
    </View>
  );
}
