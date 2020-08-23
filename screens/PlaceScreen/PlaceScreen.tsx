import React, { Component, createRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import faker from 'faker';
import {
  PlaceImageCarousel,
  BackBtn,
  PlaceTag,
  Directions,
} from './private_components';
import { BigAvatar, Map } from '../../components';
import { isIPhoneX, Layout, Colors, Feather, Entypo } from '../../constants';
import apiKeys from '../../api-keys.json';

const ASPECT_RATIO = Layout.window.width / 200;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

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

export default class PlaceScreen extends Component<any> {
  private mapRef: React.RefObject<MapView>;
  constructor(props: any) {
    super(props);
    this.mapRef = createRef();
  }

  goBack = () => {
    this.props.navigation.goBack();
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
          {this.renderBtns()}
        </View>
        <View style={styles.divider} />

        <View style={{ height: 200 }}>
          <Directions
            origin={{ lat: 37.771707, lng: -122.4053769 }}
            destination={place.location}
            width={WIDTH}
            height={200}
          />
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

// import React, { Component } from 'react';
// import { Dimensions, StyleSheet } from 'react-native';
// import MapView from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';

// const { width, height } = Dimensions.get('window');
// const ASPECT_RATIO = width / height;
// const LATITUDE = 37.771707;
// const LONGITUDE = -122.4053769;
// const LATITUDE_DELTA = 0.0922;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// const GOOGLE_MAPS_APIKEY = 'AIzaSyCtAYRx8qvgLtXXTqX-HbmUe0bdg4BNYCo';

// class Example extends Component {
//   constructor(props) {
//     super(props);

//     // AirBnB's Office, and Apple Park
//     this.state = {
//       coordinates: [
//         {
//           latitude: 37.3317876,
//           longitude: -122.0054812,
//         },
//         {
//           latitude: 37.771707,
//           longitude: -122.4053769,
//         },
//       ],
//     };

//     this.mapView = null;
//   }

//   onMapPress = (e) => {
//     this.setState({
//       coordinates: [...this.state.coordinates, e.nativeEvent.coordinate],
//     });
//   };

//   render() {
//     return (
//       <MapView
//         initialRegion={{
//           latitude: LATITUDE,
//           longitude: LONGITUDE,
//           latitudeDelta: LATITUDE_DELTA,
//           longitudeDelta: LONGITUDE_DELTA,
//         }}
//         style={StyleSheet.absoluteFill}
//         ref={(c) => (this.mapView = c)}
//         onPress={this.onMapPress}>
//         {this.state.coordinates.map((coordinate, index) => (
//           <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} />
//         ))}
//         {this.state.coordinates.length >= 2 && (
//           <MapViewDirections
//             origin={this.state.coordinates[0]}
//             waypoints={this.state.coordinates.slice(1, -1)}
//             destination={
//               this.state.coordinates[this.state.coordinates.length - 1]
//             }
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={3}
//             strokeColor="hotpink"
//             optimizeWaypoints={true}
//             onStart={(params) => {
//               console.log(
//                 `Started routing between "${params.origin}" and "${params.destination}"`,
//               );
//             }}
//             onReady={(result) => {
//               console.log(`Distance: ${result.distance} km`);
//               console.log(`Duration: ${result.duration} min.`);

//               this.mapView.fitToCoordinates(result.coordinates, {
//                 edgePadding: {
//                   right: width / 20,
//                   bottom: height / 20,
//                   left: width / 20,
//                   top: height / 20,
//                 },
//               });
//             }}
//             onError={(errorMessage) => {
//               // console.log('GOT AN ERROR');
//             }}
//           />
//         )}
//       </MapView>
//     );
//   }
// }

// export default Example;
