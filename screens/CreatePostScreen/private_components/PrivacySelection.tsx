import React from 'react';
import { TouchableWithoutFeedback, Text, View, StyleSheet } from 'react-native';
import { FontAwesome5, AntDesign } from '../../../constants';

export default function PrivacySelection({
  label,
  onSetPrivacy,
}: {
  label: string;
  onSetPrivacy: () => void;
}) {
  return (
    <TouchableWithoutFeedback onPress={onSetPrivacy}>
      <View style={styles.privacyWrapper}>
        {label === 'public' ? (
          <FontAwesome5 name="globe" size={11} color="white" />
        ) : (
          <FontAwesome5 name="users" size={11} color="white" />
        )}
        <Text style={styles.privacyText}>{label}</Text>
        <AntDesign name="caretdown" size={11} color="white" />
      </View>
    </TouchableWithoutFeedback>
  );
}

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
