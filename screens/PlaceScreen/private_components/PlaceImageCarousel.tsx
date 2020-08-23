import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Layout, Colors } from '../../../constants';

const WIDTH = Layout.window.width;
const HEIGHT = WIDTH / 1.4;

interface PlaceImageCarouselProps {
  items: Array<{
    id: string;
    url: string;
    width: number;
    height: number;
  }>;
}

interface PlaceImageCarouselState {
  active: number;
}

class PlaceImageCarousel extends Component<
  PlaceImageCarouselProps,
  PlaceImageCarouselState
> {
  constructor(props: PlaceImageCarouselProps) {
    super(props);
    this.state = {
      active: 0,
    };
  }

  // shouldComponentUpdate(
  //   _: PlaceImageCarouselProps,
  //   nextState: PlaceImageCarouselState,
  // ) {
  //   if (nextState.active !== this.state.active) {
  //     return true;
  //   }
  //   return true;
  // }

  onChangeActive = ({ nativeEvent }: any) => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
    );

    if (slide !== this.state.active) {
      this.setState({ active: slide });
    }
  };

  render() {
    const { items } = this.props;
    return (
      <View style={styles.container}>
        {items.length > 1 ? (
          <ScrollView
            style={styles.scrollView}
            horizontal
            onScroll={this.onChangeActive}
            scrollEventThrottle={200}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast">
            {items.map((item) => (
              <View key={item.id} style={styles.overlay}>
                <Image
                  source={{ uri: item.url }}
                  defaultSource={require('../../../assets/img-empty.png')}
                  resizeMode="cover"
                  style={styles.image}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.overlay}>
            <Image
              source={{ uri: items[0].url }}
              defaultSource={require('../../../assets/img-empty.png')}
              resizeMode="cover"
              style={styles.image}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    height: HEIGHT,
  },
  scrollView: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: Colors.darkColor,
  },
  image: {
    width: WIDTH,
    height: HEIGHT,
  },
  overlay: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: 'black',
    opacity: 0.8,
    zIndex: 100,
  },
});

export default PlaceImageCarousel;
