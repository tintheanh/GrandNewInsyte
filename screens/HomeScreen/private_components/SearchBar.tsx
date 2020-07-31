import React, { Component } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Layout, Colors } from '../../../constants';

export default class SearchBar extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          width: Layout.window.width,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 4,
        }}>
        <TextInput
          placeholder="Search users"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: Colors.brightColor,
            width: '100%',
            height: 28,
            borderRadius: 4,
            paddingLeft: 16,
            paddingRight: 16,
            color: 'white',
          }}
        />
      </View>
    );
  }
}
