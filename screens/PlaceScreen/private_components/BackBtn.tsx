import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '../../../constants';

interface BackBtnProps {
  goBack: () => void;
}

export default function BackBtn({ goBack }: BackBtnProps) {
  return (
    <TouchableOpacity onPress={goBack} style={styles.btn}>
      <Ionicons name="ios-chevron-back-sharp" size={34} color="white" />
      <Text style={styles.btnLabel}>Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
  },
  btnLabel: {
    color: 'white',
    fontSize: 18,
    marginTop: 7,
    marginLeft: -6,
  },
});
