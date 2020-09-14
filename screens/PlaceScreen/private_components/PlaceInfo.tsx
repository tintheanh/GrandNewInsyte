import React, { Component, createRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import faker from 'faker';
import PlaceImageCarousel from './PlaceImageCarousel';
import BackBtn from './BackBtn';
import Directions from './Directions';
import PlaceTag from './PlaceTag';
import { BigAvatar } from '../../../components';
import { isIPhoneX, Layout, Colors, Feather, Entypo } from '../../../constants';

const WIDTH = Layout.window.width;
const HEIGHT = WIDTH / 1.4;

const IMAGES: any[] = [];

for (let i = 0; i < 10; i++) {
  IMAGES.push({
    id: faker.random.uuid(),
    url: faker.image.nightlife(),
    width: 640,
    height: 480,
  });
}

const place = {
  avatar: faker.image.food(),
  media: IMAGES,
  tags: ['bar', 'night club', 'snacks', 'drinks'],
  isOpen: true,
  time: [
    {
      start: '12:00 PM',
      end: '2:00 PM',
    },
    {
      start: '5:00 PM',
      end: '9:00 PM',
    },
  ],
  location: {
    lat: 37.3317876,
    lng: -122.0054812,
  },
};

export default class PlaceInfo extends Component<any> {
  private mapRef: React.RefObject<MapView>;
  constructor(props: any) {
    super(props);
    this.mapRef = createRef();
  }

  goBack = () => {
    this.props.goBack();
  };

  renderPlaceTags = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}>
        {place.tags.map((tag, i) => (
          <View key={i} style={{ marginRight: 8, marginBottom: 6 }}>
            <PlaceTag label={tag} />
          </View>
        ))}
      </View>
    );
  };

  renderTime = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ color: Colors.tintColor, fontWeight: '700' }}>Open</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {place.time.map((time, i) => (
            <Text
              key={i}
              style={{
                color: 'white',
                marginLeft: 6,
              }}>
              {`${time.start} - ${time.end}`}
              {i !== place.time.length - 1 ? ',' : ''}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  renderBtns = () => {
    return (
      <View style={styles.allBtnsWrapper}>
        <View style={styles.btnWrapper}>
          <TouchableWithoutFeedback onPress={() => console.log('reasds')}>
            <View style={styles.iconWrapper}>
              <Feather name="phone-call" color="black" size={22} />
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.btnLabel}>Call</Text>
        </View>

        <View style={styles.btnWrapper}>
          <View style={styles.iconWrapper}>
            <Entypo name="link" color="black" size={22} />
          </View>
          <Text style={styles.btnLabel}>Website</Text>
        </View>
        <View style={styles.btnWrapper}>
          <View style={styles.iconWrapper}>
            <Feather name="info" color="black" size={22} />
          </View>
          <Text style={styles.btnLabel}>More Info</Text>
        </View>
      </View>
    );
  };

  renderMarkers = () => {
    return [1].map(() => (
      <Marker
        key={1}
        coordinate={{
          latitude: place.location.lat,
          longitude: place.location.lng,
        }}
      />
    ));
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkColor }}>
        <View style={styles.imagesAndName}>
          <PlaceImageCarousel items={place.media} />
          <View style={styles.backBtnWrapper}>
            <BackBtn goBack={this.goBack} />
          </View>
          <View style={styles.nameAndAvatarWrapper}>
            <BigAvatar avatar={place.avatar} />
            <View style={styles.nameWrapper}>
              <Text style={styles.name}>Leblanc Cafe</Text>
            </View>
          </View>
          <TouchableWithoutFeedback onPress={() => console.log('ref')}>
            <View style={styles.seeAllBtn}>
              <Text style={styles.seeAllBtnLabel}>
                See All {place.media.length}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{ margin: 12 }}>
          {this.renderPlaceTags()}
          {this.renderTime()}
          {/* {this.renderBtns()} */}
        </View>
        <View style={styles.divider} />

        <View>
          <Directions
            origin={{ lat: 37.771707, lng: -122.4053769 }}
            destination={place.location}
            width={WIDTH}
            height={200}
          />
        </View>

        <View style={{ margin: 12 }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            Posts
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imagesAndName: {
    width: WIDTH,
    height: HEIGHT,
  },
  backBtnWrapper: {
    position: 'absolute',
    top: isIPhoneX() ? 48 : 24,
    zIndex: 100,
  },
  nameAndAvatarWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
  },
  nameWrapper: {
    marginLeft: 12,
    flexGrow: 1,
    justifyContent: 'center',
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  seeAllBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
    borderRadius: 4,
  },
  seeAllBtnLabel: {
    color: 'white',
  },
  iconWrapper: {
    backgroundColor: 'white',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  allBtnsWrapper: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 28,
    paddingBottom: 22,
  },
  btnWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLabel: { color: 'white', textAlign: 'center', marginTop: 12 },
  divider: {
    borderBottomColor: Colors.brightColor,
    borderBottomWidth: 12,
  },
});
