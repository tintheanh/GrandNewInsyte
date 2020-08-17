import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Loading } from '../../components';
import { PlaceList } from './private_components';
import { distance } from '../../utils/functions';
import { Colors, Layout, FontAwesome5, MaterialIcons } from '../../constants';
import { Place } from '../../models';
import { AppState } from '../../redux/store';
import { fetchPlaces } from '../../redux/places/actions';

const CARD_WIDTH = 158;
const { width, height } = Layout.window;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

interface MapScreenProps {
  places: Array<Place>;
  loading: boolean;
  error: Error | null;

  onFetchPlaces: (geopoint: { lat: number; lng: number }) => void;
}

interface MapScreenState {
  currentLocation: {
    coords: {
      latitude: number;
      longitude: number;
    };
    type: 'my-location' | 'default-location';
  } | null;
  zoom: {
    latitudeDelta: number;
    longitudeDelta: number;
  };
  lastSearchedLocation: {
    latitude: number;
    longitude: number;
  } | null;
  newLocation: {
    latitude: number;
    longitude: number;
  } | null;
  triggerSearchCurrentLocation: boolean;
}

class MapScreen extends Component<MapScreenProps, MapScreenState> {
  /**
   * @var mapRef MapView ref used to control the map component
   */
  private mapRef: React.RefObject<MapView>;
  private animation: Animated.Value;
  private timeout: NodeJS.Timeout | null;
  private index: number;

  constructor(props: MapScreenProps) {
    super(props);
    this.state = {
      currentLocation: null,
      lastSearchedLocation: null,
      newLocation: null,
      zoom: {
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      triggerSearchCurrentLocation: false,
    };
    this.animation = new Animated.Value(0);
    this.mapRef = createRef();
    this.timeout = null;
    this.index = 0;
  }

  componentDidMount() {
    this.setCurrentLocation();

    this.animation.addListener(({ value }) => {
      const { places } = this.props;
      let index = Math.floor(value / CARD_WIDTH + 0.3);
      if (index >= places.length) {
        index = places.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      this.timeout = setTimeout(() => {
        if (this.index !== index) {
          this.index = index;
          const { zoom } = this.state;
          const { location } = places[index];
          this.mapRef.current?.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: zoom.latitudeDelta,
            longitudeDelta: zoom.longitudeDelta,
          });
        }
      }, 10);
    });
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  /**
   * Method set current location
   */
  setCurrentLocation = () => {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (info) => {
          this.setState({
            currentLocation: {
              coords: {
                latitude: info.coords.latitude,
                longitude: info.coords.longitude,
              },
              type: 'my-location',
            },
            zoom: {
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },
          });
        },
        (_) => {
          // couldn't get current location, use default
          this.setState({
            currentLocation: {
              coords: {
                latitude: 37.33233141,
                longitude: -122.0312186,
              },
              type: 'default-location',
            },
            zoom: {
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },
          });
        },
      );
      resolve();
    });
  };

  /**
   * Method move map to current location
   */
  animateToCurrentLocation = () => {
    this.setCurrentLocation().then(() => {
      const { currentLocation, zoom } = this.state;
      if (currentLocation) {
        this.mapRef.current?.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: zoom.latitudeDelta,
          longitudeDelta: zoom.longitudeDelta,
        });
      }
    });
  };

  /**
   * Method set new location
   * @param region New location to set
   */
  onRegionChange = (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    this.setState(
      {
        newLocation: {
          latitude: region.latitude,
          longitude: region.longitude,
        },
        zoom: {
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        },
      },
      () => {
        const {
          currentLocation,
          lastSearchedLocation,
          newLocation,
        } = this.state;
        let chosenLocation;
        if (lastSearchedLocation) {
          chosenLocation = lastSearchedLocation;
        } else {
          chosenLocation = currentLocation!.coords;
        }
        const d = distance(chosenLocation, newLocation!);
        if (d >= 2) {
          this.setState({ triggerSearchCurrentLocation: true });
        } else {
          this.setState({ triggerSearchCurrentLocation: false });
        }
      },
    );
  };

  performSearchOnThisLocation = () => {
    this.setState(
      {
        lastSearchedLocation: this.state.newLocation,
      },
      async () => {
        const { lastSearchedLocation } = this.state;
        if (lastSearchedLocation) {
          await this.props.onFetchPlaces({
            lat: lastSearchedLocation.latitude,
            lng: lastSearchedLocation.longitude,
          });
          this.setState({ triggerSearchCurrentLocation: false });
        }
      },
    );
  };

  renderMarkers = () => {
    const { places } = this.props;
    if (places.length === 0) {
      return null;
    }
    const interpolations = places.map((_, index) => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        (index + 1) * CARD_WIDTH,
      ];
      const scale = this.animation.interpolate({
        inputRange,
        outputRange: [1, 1.4, 1],
        extrapolate: 'clamp',
      });
      const opacity = this.animation.interpolate({
        inputRange,
        outputRange: [0.6, 1, 0.6],
        extrapolate: 'clamp',
      });
      return { scale, opacity };
    });

    return places.map((place, index) => {
      const scaleStyle = {
        transform: [
          {
            scale: interpolations[index].scale,
          },
        ],
      };
      const opacityStyle = {
        opacity: interpolations[index].opacity,
      };
      return (
        <Marker
          key={place.id}
          coordinate={{
            latitude: place.location.latitude,
            longitude: place.location.longitude,
          }}>
          <AnimatedIcon
            name="location-on"
            size={28}
            color={Colors.markerDark}
            style={[scaleStyle, opacityStyle]}
          />
        </Marker>
      );
    });
  };

  render() {
    const { currentLocation, triggerSearchCurrentLocation } = this.state;
    const { places, loading } = this.props;

    if (!currentLocation) {
      return <Loading />;
    }
    return (
      <View style={styles.container}>
        <View style={styles.searchWrapper}>
          <FontAwesome5
            name="search-location"
            size={14}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search places"
            autoCorrect={false}
            style={styles.searchBox}
            // onSubmitEditing={() => this.setState({ search: true })}
          />
        </View>
        {triggerSearchCurrentLocation ? (
          <View style={styles.searchCurrentBtnWrapper}>
            <TouchableOpacity
              disabled={loading}
              style={styles.searchCurrentBtn}
              onPress={this.performSearchOnThisLocation}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="black"
                  style={{ transform: [{ scale: 0.5 }] }}
                />
              ) : (
                <Text style={styles.searchCurrentBtnLabel}>
                  Search this area
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
        <MapView
          ref={this.mapRef}
          style={styles.mapView}
          initialRegion={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          onRegionChangeComplete={this.onRegionChange}>
          {currentLocation.type === 'my-location' ? (
            <Marker
              coordinate={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              }}
            />
          ) : null}
          {this.renderMarkers()}
        </MapView>
        {places.length ? (
          <PlaceList places={places} animation={this.animation} />
        ) : null}
        {currentLocation.type === 'my-location' ? (
          <TouchableOpacity
            onPress={this.animateToCurrentLocation}
            style={styles.locationBtn}>
            <MaterialIcons
              name="my-location"
              size={20}
              color="rgba(0, 0, 0, 0.7)"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: { flex: 1 },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 200,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    position: 'absolute',
    top: 42,
    width: '100%',
  },
  searchBox: {
    width: '90%',
    paddingLeft: 26,
    paddingRight: 8,
    height: 38,
    fontSize: 12,
    borderRadius: 40,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  locationBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  searchCurrentBtnWrapper: {
    position: 'absolute',
    top: 92,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCurrentBtn: {
    backgroundColor: 'white',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  searchCurrentBtnLabel: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 13,
    paddingTop: 1,
    paddingBottom: 1,
  },
});

const mapStateToProps = (state: AppState) => ({
  places: state.allPlaces.places,
  loading: state.allPlaces.loading,
  error: state.allPlaces.error,
});

const mapDispatchToProps = {
  onFetchPlaces: fetchPlaces,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);
