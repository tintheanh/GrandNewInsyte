import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Layout from '../constants/Layout';

const CARD_HEIGHT = Layout.window.height / 3.5;

interface PlaceCardProps {
  thumbnail: string;
  name: string;
  distance: number;
}

export default function PlaceCard({
  thumbnail,
  name,
  distance,
}: PlaceCardProps) {
  return (
    <View style={styles.card}>
      <TouchableWithoutFeedback onPress={() => console.log('to place')}>
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
          <Text numberOfLines={1} style={styles.cardDescription}>
            {`${distance} mi away`}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: '#FFF',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    width: 158,
    overflow: 'hidden',
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
