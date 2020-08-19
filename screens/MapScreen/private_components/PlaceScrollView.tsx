import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PlaceCard } from '../../../components';
import { Place } from '../../../models';
import { checkPlaceListChanged } from '../../../utils/functions';
import { Layout } from '../../../constants';

const CARD_HEIGHT = Layout.window.height / 3.5;
const CARD_WIDTH = CARD_HEIGHT / 1.5;

interface PlaceScrollViewProps {
  places: Array<Place>;
  animation: Animated.Value;
}

export default React.memo(
  function PlaceScrollView({ places, animation }: PlaceScrollViewProps) {
    return (
      <Animated.ScrollView
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        style={styles.placeResults}
        snapToInterval={CARD_WIDTH + 12}
        // contentContainerStyle={styles.endPadding}
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
  },
  (prevProps: PlaceScrollViewProps, nextProps: PlaceScrollViewProps) => {
    if (checkPlaceListChanged(prevProps.places, nextProps.places)) {
      return false;
    }
    return true;
  },
);

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
