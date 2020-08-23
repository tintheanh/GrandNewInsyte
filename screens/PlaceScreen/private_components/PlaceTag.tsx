import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlaceTag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  label: {
    color: 'white',
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
