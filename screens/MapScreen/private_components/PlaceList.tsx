import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PlaceCard } from '../../../components';
import { Place } from '../../../models';

const CARD_WIDTH = 158;

interface PlaceListProps {
  places: Array<Place>;
  animation: Animated.Value;
}

export default function PlaceList({ places, animation }: PlaceListProps) {
  return (
    <Animated.ScrollView
      horizontal
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      style={styles.placeResults}
      snapToInterval={CARD_WIDTH}
      contentContainerStyle={styles.endPadding}
      onScroll={Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: {
                x: animation,
              },
            },
          },
        ],
        { useNativeDriver: true },
      )}>
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          thumbnail={place.media.length ? place.media[0].url : ''}
          name={place.name}
          distance={place.distance}
        />
      ))}
      <View style={{ width: CARD_WIDTH }} />
      <View style={{ width: CARD_WIDTH }} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  placeResults: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  endPadding: {
    paddingRight: 2,
  },
});
