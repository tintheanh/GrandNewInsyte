import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import faker from 'faker';
import { PlaceImageCarousel } from './private_components';

const IMAGES: any[] = [];

for (let i = 0; i < 10; i++) {
  IMAGES.push({
    id: faker.random.uuid(),
    url: faker.image.nightlife(),
    width: 640,
    height: 480,
  });
}

export default class PlaceScreen extends Component {
  render() {
    return (
      <View>
        <View style={styles.imagesAndName}>
          <PlaceImageCarousel items={IMAGES} />
          <Text style={styles.name}>Leblanc Cafe</Text>
        </View>
        <Text>test</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imagesAndName: {},
  name: {
    position: 'relative',
    bottom: 44,
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
  },
});
