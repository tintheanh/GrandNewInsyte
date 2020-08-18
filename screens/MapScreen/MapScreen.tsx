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
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Loading, Map } from '../../components';
import {
  PlaceList,
  PlaceSearchBar,
  DropdownCategories,
} from './private_components';
import { distance, alertDialog, delay } from '../../utils/functions';
import {
  Colors,
  Layout,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from '../../constants';
import { Place } from '../../models';
import { AppState } from '../../redux/store';
import { fetchPlaces, clearFetchPlacesError } from '../../redux/places/actions';

const CARD_WIDTH = 158;
const { width, height } = Layout.window;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

interface MapScreenProps {
  places: Array<Place>;
  loading: boolean;
  error: Error | null;

  onFetchPlaces: (
    locationForSearch: {
      lat: number;
      lng: number;
    },
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;

  onClearFetchPlacesError: () => void;
}

interface MapScreenState {
  currentLocation: {
    coords: {
      lat: number;
      lng: number;
    };
    type: 'my-location' | 'default-location';
  } | null;
  zoom: {
    latDelta: number;
    lngDelta: number;
  };
  lastSearchedLocation: {
    lat: number;
    lng: number;
  } | null;
  newLocation: {
    lat: number;
    lng: number;
  } | null;
  triggerSearchThisLocation: boolean;
  searchCategory: string;
  searchQuery: string;
  toggleDropdownCategories: boolean;
}

class MapScreen extends Component<MapScreenProps, MapScreenState> {
  /**
   * @var mapRef MapView ref used to control the map component
   */
  private mapRef: React.RefObject<MapView>;
  private animation: Animated.Value;
  private timeout: number;
  private index: number;

  constructor(props: MapScreenProps) {
    super(props);
    this.state = {
      currentLocation: null,
      lastSearchedLocation: null,
      newLocation: null,
      zoom: {
        latDelta: LATITUDE_DELTA,
        lngDelta: LONGITUDE_DELTA,
      },
      triggerSearchThisLocation: false,
      searchCategory: 'bar',
      searchQuery: '',
      toggleDropdownCategories: false,
    };
    this.animation = new Animated.Value(0);
    this.mapRef = createRef();
    this.timeout = -1;
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
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: zoom.latDelta,
            longitudeDelta: zoom.lngDelta,
          });
        }
      }, 10);
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  componentDidUpdate() {
    const { error, onClearFetchPlacesError } = this.props;
    if (error) {
      alertDialog(error.message, onClearFetchPlacesError);
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
                lat: info.coords.latitude,
                lng: info.coords.longitude,
              },
              type: 'my-location',
            },
            zoom: {
              latDelta: LATITUDE_DELTA,
              lngDelta: LONGITUDE_DELTA,
            },
          });
        },
        (_) => {
          // couldn't get current location, use default
          this.setState({
            currentLocation: {
              coords: {
                lat: 37.33233141,
                lng: -122.0312186,
              },
              type: 'default-location',
            },
            zoom: {
              latDelta: LATITUDE_DELTA,
              lngDelta: LONGITUDE_DELTA,
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
          latitude: currentLocation.coords.lat,
          longitude: currentLocation.coords.lng,
          latitudeDelta: zoom.latDelta,
          longitudeDelta: zoom.lngDelta,
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
          lat: region.latitude,
          lng: region.longitude,
        },
        zoom: {
          latDelta: region.latitudeDelta,
          lngDelta: region.longitudeDelta,
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
          this.setState({ triggerSearchThisLocation: true });
        } else {
          this.setState({ triggerSearchThisLocation: false });
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
        const { lastSearchedLocation, zoom, currentLocation } = this.state;
        if (lastSearchedLocation && currentLocation) {
          await this.props.onFetchPlaces(lastSearchedLocation, currentLocation);
          if (this.props.places.length) {
            this.mapRef.current?.animateToRegion({
              latitude: this.props.places[0].location.lat,
              longitude: this.props.places[0].location.lng,
              latitudeDelta: zoom.latDelta,
              longitudeDelta: zoom.lngDelta,
            });
          }
          this.setState({ triggerSearchThisLocation: false });
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
            latitude: place.location.lat,
            longitude: place.location.lng,
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

  onSearchQueryChange = (text: string) => {
    this.setState({ searchQuery: text });
  };

  onSearchCategorySelect = (category: string) => {
    this.setState({
      searchCategory: category,
      toggleDropdownCategories: false,
    });
  };

  openDropdownCategories = () => {
    this.setState({ toggleDropdownCategories: true });
  };

  clearSearchQuery = () => {
    this.setState({ searchQuery: '', toggleDropdownCategories: false });
  };

  render() {
    const {
      currentLocation,
      triggerSearchThisLocation,
      toggleDropdownCategories,
      searchQuery,
      zoom,
    } = this.state;
    const { places, loading } = this.props;

    if (!currentLocation) {
      return <Loading />;
    }
    return (
      <View style={styles.container}>
        <PlaceSearchBar
          searchQuery={searchQuery}
          onChangeText={this.onSearchQueryChange}
          openDropdownCategories={this.openDropdownCategories}
          clearSearch={this.clearSearchQuery}
          isDropdownOpen={toggleDropdownCategories}
          submitSearch={() => console.log('ok submit')}
        />
        {toggleDropdownCategories ? (
          <DropdownCategories
            categories={['bar', 'restaurant']}
            onSelectCategory={this.onSearchCategorySelect}
          />
        ) : null}

        {triggerSearchThisLocation ? (
          <View style={styles.searchThisBtnWrapper}>
            <TouchableOpacity
              disabled={loading}
              style={styles.searchThisBtn}
              onPress={this.performSearchOnThisLocation}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="black"
                  style={{ transform: [{ scale: 0.5 }] }}
                />
              ) : (
                <Text style={styles.searchThisBtnLabel}>Search this area</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
        {/* <MapView
          ref={this.mapRef}
          style={styles.mapView}
          initialRegion={{
            latitude: currentLocation.coords.lat,
            longitude: currentLocation.coords.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          onRegionChangeComplete={this.onRegionChange}>
          {currentLocation.type === 'my-location' ? (
            <Marker
              coordinate={{
                latitude: currentLocation.coords.lat,
                longitude: currentLocation.coords.lng,
              }}
            />
          ) : null}
          {this.renderMarkers()}
        </MapView> */}
        <Map
          ref={this.mapRef}
          currentLocation={currentLocation}
          zoom={zoom}
          renderMarkers={this.renderMarkers}
          onRegionChange={this.onRegionChange}
        />
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
    position: 'relative',
    left: 28,
    zIndex: 200,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
    position: 'absolute',
    top: 42,
    width: '90%',
    alignSelf: 'center',
  },
  searchBox: {
    width: '100%',
    paddingLeft: 30,
    paddingRight: 30,
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
  closeIconWrapper: {
    position: 'relative',
    right: 26,
    zIndex: 200,
  },
  closeIcon: {
    justifyContent: 'center',
    height: 28,
  },
  dropdownListWrapper: {
    zIndex: 100,
    position: 'absolute',
    top: 62,
    width: '90%',
    alignSelf: 'center',
  },
  dropdownList: {
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  dropdownItem: {
    fontSize: 14,
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
  searchThisBtnWrapper: {
    position: 'absolute',
    top: 92,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchThisBtn: {
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
  searchThisBtnLabel: {
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
  onClearFetchPlacesError: clearFetchPlacesError,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);
