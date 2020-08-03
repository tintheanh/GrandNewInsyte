import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Entypo, MaterialCommunityIcons, AntDesign } from '../constants';

interface SortPostListHeaderProps {
  sortBy: 'new' | 'hot';
  timeLabel: 'this week' | 'this month' | 'this year';

  /**
   * Method sort posts by new or hot
   */
  selectPostFilter: () => void;

  /**
   * Method sort hot posts by time choice
   */
  selectTimeFilter: () => void;
}

function SortPostListHeader({
  sortBy,
  timeLabel,
  selectPostFilter,
  selectTimeFilter,
}: SortPostListHeaderProps) {
  if (sortBy === 'new') {
    return (
      <TouchableOpacity
        onPress={selectPostFilter}
        style={{ alignSelf: 'flex-start' }}>
        <View style={styles.btnContainer}>
          <Entypo name="new" size={13} color="white" />
          <Text style={styles.label}>New</Text>
          <AntDesign name="caretdown" size={11} color="white" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={selectPostFilter}
        style={{ alignSelf: 'flex-start' }}>
        <View style={styles.btnContainer}>
          <MaterialCommunityIcons name="fire" size={15} color="white" />
          <Text style={styles.label}>Hot</Text>
          <AntDesign name="caretdown" size={11} color="white" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={selectTimeFilter}
        style={{ alignSelf: 'flex-start' }}>
        <View style={styles.btnContainer}>
          <Entypo name="back-in-time" size={13} color="white" />
          <Text style={styles.label}>{timeLabel}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  label: {
    color: 'white',
    fontSize: 10,
    paddingLeft: 6,
    paddingRight: 6,
    marginTop: 1,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default SortPostListHeader;
