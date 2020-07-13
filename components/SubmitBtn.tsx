import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

interface SubmitBtnProps {
  label: string;
  onPress: (...args: any) => void;
  disable?: boolean;
}

const SubmitBtn = ({ label, onPress, disable = false }: SubmitBtnProps) => {
  return (
    <TouchableOpacity
      disabled={disable}
      onPress={onPress}
      style={{
        ...styles.btn,
        backgroundColor: disable ? '#606475' : '#22242c',
      }}>
      {!disable ? (
        <Text style={styles.btnText}>{label}</Text>
      ) : (
        <ActivityIndicator size="small" color="white" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: '70%',
    paddingTop: 18,
    paddingBottom: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.29,
    shadowRadius: 3.65,
    marginTop: 38,
    elevation: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubmitBtn;
