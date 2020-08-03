import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons, Colors } from '../constants';

export default function NothingView() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.brightColor,
      }}>
      <MaterialIcons name="error" size={24} color="rgba(255, 255, 255, 0.6)" />
      <Text style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 }}>
        Nothing to show here
      </Text>
    </View>
  );
}
