import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Image } from 'react-native';
import Layout from '../constants/Layout';
import CarouselVideo from './CarouselVideo';

const square = Layout.window.width;

interface CarouselProps {
  items: Array<{
    url: string;
    type: string;
  }>;
  shouldPlayMedia: boolean;
}

export default class Carousel extends Component<CarouselProps> {
  state = { currentActive: 0 };

  shouldComponentUpdate(
    _: CarouselProps,
    nextState: { currentActive: number },
  ) {
    if (nextState.currentActive !== this.state.currentActive) {
      return true;
    }
    if (this.props.items[nextState.currentActive].type === 'image') {
      return false;
    }
    return true;
  }

  onChangeActive = ({ nativeEvent }: any) => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
    );

    if (slide !== this.state.currentActive) {
      this.setState({ currentActive: slide });
    }
  };

  render() {
    const { items, shouldPlayMedia } = this.props;
    return (
      <View style={styles.container}>
        {items.length > 1 ? (
          <ScrollView
            style={{ width: square, height: square }}
            horizontal
            onScroll={this.onChangeActive}
            scrollEventThrottle={200}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast">
            {items.map(
              (
                item: {
                  url: string;
                  type: string;
                },
                index: number,
              ) => {
                return item.type === 'image' ? (
                  <Image
                    key={item.url}
                    source={{ uri: item.url }}
                    defaultSource={require('../assets/img-empty.png')}
                    resizeMode="cover"
                    style={styles.image}
                  />
                ) : (
                  <CarouselVideo
                    key={item.url}
                    videoUrl={item.url}
                    shouldPlay={
                      shouldPlayMedia
                        ? this.state.currentActive === index
                        : false
                    }
                  />
                );
              },
            )}
          </ScrollView>
        ) : (
          <View>
            {items[0].type === 'image' ? (
              <Image
                key={items[0].url}
                source={{ uri: items[0].url }}
                defaultSource={require('../assets/img-empty.png')}
                resizeMode="cover"
                style={styles.image}
              />
            ) : (
              <CarouselVideo
                key={items[0].url}
                videoUrl={items[0].url}
                shouldPlay={shouldPlayMedia}
              />
            )}
          </View>
        )}

        {items.length > 1 ? (
          <View style={styles.bullets}>
            {items.map((_, index: number) => (
              <Text
                key={index}
                style={{
                  ...styles.bullet,
                  color: this.state.currentActive === index ? 'white' : 'gray',
                  opacity: 0.6,
                }}>
                &bull;
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    width: square,
    height: square,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bullets: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  bullet: {
    paddingHorizontal: 5,
    fontSize: 20,
  },
  image: {
    width: square,
    height: square,
  },
});
