import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface BigButtonProps {
  label: string;
  loading: boolean;
  onPress: () => void;
}

export default React.memo(
  function BigButton({ label, loading, onPress }: BigButtonProps) {
    const renderBtnLabel = () => {
      if (loading) {
        return <ActivityIndicator size="small" color="white" />;
      }
      return <Text style={styles.btnText}>{label}</Text>;
    };

    return (
      <TouchableOpacity
        disabled={loading}
        onPress={onPress}
        style={[
          styles.btn,
          { backgroundColor: loading ? '#606475' : '#22242c' },
        ]}>
        {renderBtnLabel()}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.loading !== nextProps.loading) {
      return false;
    }
    return true;
  },
);

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
