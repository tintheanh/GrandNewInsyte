import React from 'react';
import { TouchableWithoutFeedback, Text, View, StyleSheet } from 'react-native';
import { FontAwesome5, AntDesign } from '../../../constants';

export default React.memo(
  function PrivacySelection({
    label,
    onSetPrivacy,
  }: {
    label: string;
    onSetPrivacy: () => void;
  }) {
    let iconPrivacy = '';
    switch (label) {
      case 'public':
        iconPrivacy = 'globe';
        break;
      case 'followers':
        iconPrivacy = 'users';
        break;
      default:
        iconPrivacy = 'lock';
        break;
    }
    return (
      <TouchableWithoutFeedback onPress={onSetPrivacy}>
        <View style={styles.privacyWrapper}>
          <FontAwesome5 name={iconPrivacy} size={11} color="white" />
          <Text style={styles.privacyText}>{label}</Text>
          <AntDesign name="caretdown" size={11} color="white" />
        </View>
      </TouchableWithoutFeedback>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.label !== nextProps.label) {
      return false;
    }
    return true;
  },
);

const styles = StyleSheet.create({
  privacyWrapper: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 12,
    alignSelf: 'flex-start',
    justifyContent: 'space-between',
  },
  privacyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingLeft: 4,
    paddingRight: 4,
  },
});
