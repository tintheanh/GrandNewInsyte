import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Layout from '../constants/Layout';

export const CARD_HEIGHT = Layout.window.height / 3.5;
export const CARD_WIDTH = CARD_HEIGHT / 1.5;

interface PlaceCardProps {
  thumbnail: string;
  name: string;
  distance: number;

  navigateToPlaceScreen: () => void;
}

export default function PlaceCard({
  thumbnail,
  name,
  distance,
  navigateToPlaceScreen,
}: PlaceCardProps) {
  return (
    <View style={styles.card}>
      <TouchableWithoutFeedback onPress={navigateToPlaceScreen}>
        <View>
          <Image
            source={
              thumbnail
                ? { uri: thumbnail }
                : require('../assets/img-empty.png')
            }
            defaultSource={require('../assets/img-empty.png')}
            resizeMode="cover"
            style={styles.cardImage}
          />
          <Text numberOfLines={1} style={styles.cardName}>
            {name}
          </Text>
          {distance !== -1 ? (
            <Text numberOfLines={1} style={styles.cardDescription}>
              {`${distance.toFixed(1)} mi away`}
            </Text>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    backgroundColor: '#FFF',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    width: CARD_WIDTH,
    justifyContent: 'space-between',
  },
  touchStyle: {
    height: '65%',
  },
  cardImage: {
    width: '100%',
    height: CARD_HEIGHT - 100,
    alignSelf: 'center',
  },
  textContent: {
    paddingTop: 12,
  },
  cardName: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#444',
    paddingTop: 5,
  },
});
