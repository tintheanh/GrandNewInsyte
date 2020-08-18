import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { List } from '../../../components';
import { Place } from '../../../models';
import { checkPlaceListChanged } from '../../../utils/functions';
import { Layout } from '../../../constants';

interface PlaceListProps {
  places: Array<any>;
}

export default function PlaceList({ places }: PlaceListProps) {
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.place}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeDistance}>{item.distance} mi away</Text>
      </View>
    );
  };

  return (
    <View style={styles.placeList}>
      <List
        data={places}
        renderItem={renderItem}
        listHeaderComponent={<View style={{ height: 20 }} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        checkChangesToUpdate={checkPlaceListChanged}
        onEndReached={() => console.log('end')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeList: {
    zIndex: 100,
    position: 'absolute',
    top: 62,
    height: Layout.window.height / 3.5,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  place: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  placeName: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: 13,
  },
  placeDistance: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 12,
  },
});
