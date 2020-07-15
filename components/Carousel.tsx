import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Layout } from '../constants';
import CarouselVideo from './CarouselVideo';

const square = Layout.window.width;

interface CarouselProps {
  items: Array<{
    id: string;
    url: string;
    type: string;
    width: number;
    height: number;
  }>;
  shouldPlayMedia: boolean;
}

interface CarouselState {
  active: number;
  imgTraversalIndices: Array<number>;
  showModal: boolean;
}

class Carousel extends Component<CarouselProps, CarouselState> {
  constructor(props: CarouselProps) {
    super(props);
    this.state = {
      active: 0,
      imgTraversalIndices: this.createImgTraversalIndices(),
      showModal: false,
    };
  }

  createImgTraversalIndices = () => {
    const { items } = this.props;
    const imgTraversalIndices = [];
    let i = 0;
    for (const md of items) {
      if (md.type === 'image') {
        imgTraversalIndices.push(i);
        i += 1;
      } else {
        imgTraversalIndices.push(-1);
      }
    }
    return imgTraversalIndices;
  };

  shouldComponentUpdate(_: CarouselProps, nextState: CarouselState) {
    if (this.state.showModal !== nextState.showModal) {
      return true;
    }
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

  showModal = () => {
    if (!this.state.showModal) {
      this.setState({ showModal: true });
    }
  };

  closeModal = () => {
    if (this.state.showModal) {
      this.setState({ showModal: false });
    }
  };

  processMediaForImagesModal = () => {
    return this.props.items.filter((md) => {
      if (md.type !== 'video') {
        return { url: md.url, width: md.width, height: md.height };
      }
    });
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
            {items.map((item, index: number) => {
              return item.type === 'image' ? (
                <TouchableWithoutFeedback
                  key={item.id}
                  onPress={() => this.setState({ showModal: true })}>
                  <Image
                    source={{ uri: item.url }}
                    defaultSource={require('../assets/img-empty.png')}
                    resizeMode="cover"
                    style={styles.image}
                  />
                </TouchableWithoutFeedback>
              ) : (
                <CarouselVideo
                  key={item.id}
                  videoUrl={item.url}
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
              <TouchableWithoutFeedback
                key={items[0].id}
                onPress={this.showModal}>
                <Image
                  source={{ uri: items[0].url }}
                  defaultSource={require('../assets/img-empty.png')}
                  resizeMode="cover"
                  style={styles.image}
                />
              </TouchableWithoutFeedback>
            ) : (
              <CarouselVideo
                key={items[0].id}
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
                  color: this.state.active === index ? 'white' : 'gray',
                  opacity: 0.6,
                }}>
                &bull;
              </Text>
            ))}
          </View>
        ) : null}
        <Modal visible={this.state.showModal}>
          <ImageViewer
            imageUrls={this.processMediaForImagesModal()}
            index={this.state.imgTraversalIndices[this.state.active]}
            enableImageZoom
            useNativeDriver
            enableSwipeDown
            onCancel={this.closeModal}
          />
        </Modal>
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
