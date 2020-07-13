import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Image } from 'react-native';
import Layout from '../constants/Layout';
import CarouselVideo from './CarouselVideo';

const square = Layout.window.width;

interface CarouselProps {
  items: Array<{
    id: string;
    uri: string;
    type: string;
  }>;
  shouldPlayMedia: boolean;
}

class Carousel extends Component<CarouselProps> {
  state = { active: 0 };

  shouldComponentUpdate(_: CarouselProps, nextState: any) {
    if (nextState.active !== this.state.active) {
      return true;
    }
    if (this.props.items[nextState.active].type === 'image') {
      return false;
    }
    return true;
  }

  onChangeActive = ({ nativeEvent }: any) => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
    );

    if (slide !== this.state.active) {
      this.setState({ active: slide });
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
            {items.map((item: any, index: number) => {
              return item.type === 'image' ? (
                <Image
                  key={item.id}
                  source={{ uri: item.uri }}
                  defaultSource={require('../assets/img-empty.png')}
                  resizeMode="cover"
                  style={styles.image}
                />
              ) : (
                <CarouselVideo
                  key={item.id}
                  videoUri={item.uri}
                  shouldPlay={
                    shouldPlayMedia ? this.state.active === index : false
                  }
                />
              );
            })}
          </ScrollView>
        ) : (
          <View>
            {items[0].type === 'image' ? (
              <Image
                key={items[0].id}
                source={{ uri: items[0].uri }}
                defaultSource={require('../assets/img-empty.png')}
                resizeMode="cover"
                style={styles.image}
              />
            ) : (
              <CarouselVideo
                key={items[0].id}
                videoUri={items[0].uri}
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
                  color: this.state.active === index ? 'white' : 'gray',
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

export default Carousel;
