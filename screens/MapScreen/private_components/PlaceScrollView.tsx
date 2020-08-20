import React, { forwardRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PlaceCard, CARD_WIDTH } from '../../../components';
import { Place } from '../../../models';
import { checkPlaceListChanged } from '../../../utils/functions';

interface PlaceScrollViewProps {
  /**
   * Current surrounding places
   */
  places: Array<Place>;

  /**
   * Animation value for ScrollView snapping
   */
  animation: Animated.Value;

  navigateToPlaceScreen: (placeID: string) => () => void;
}

const PlaceScrollView = forwardRef(
  ({ places, animation, navigateToPlaceScreen }: PlaceScrollViewProps, ref) => {
    return (
      <Animated.ScrollView
        ref={ref}
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        style={styles.placeResults}
        snapToInterval={CARD_WIDTH + 12}
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
            navigateToPlaceScreen={navigateToPlaceScreen(place.id)}
          />
        ))}
        <View style={{ width: CARD_WIDTH }} />
        <View style={{ width: CARD_WIDTH }} />
      </Animated.ScrollView>
    );
  },
);

export default React.memo(
  PlaceScrollView,
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
