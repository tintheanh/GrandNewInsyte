import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Colors } from '../constants';

export default function NothingView({ handle }: { handle: () => void }) {
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
      <TouchableOpacity onPress={handle}>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <MaterialIcons
            name="refresh"
            size={22}
            color="rgba(255, 255, 255, 0.6)"
          />
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 18,
            }}>
            Refresh
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
