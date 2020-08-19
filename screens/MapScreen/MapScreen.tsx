import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import {
  Text,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Loading, Map } from '../../components';
import {
  PlaceScrollView,
  PlaceSearchBar,
  DropdownCategories,
  PlaceList,
} from './private_components';
import {
  distance,
  alertDialog,
  delay,
  capitalize,
} from '../../utils/functions';
import { Colors, Layout, MaterialIcons } from '../../constants';
import { Place } from '../../models';
import { AppState } from '../../redux/store';
import {
  searchPlacesAround,
  clearFetchPlacesError,
  clearSurroundPlaces,
  searchNewPlacesByName,
  searchMorePlacesByName,
  clearPlaceList,
  selectPlaceFromPlaceList,
  searchPlacesAroundByCategory,
} from '../../redux/places/actions';

const { width, height } = Layout.window;
const CARD_HEIGHT = height / 3.5;
const CARD_WIDTH = CARD_HEIGHT / 1.5 + 12;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

const CATEGORIES = ['bar', 'restaurant'];

const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

interface MapScreenProps {
  surroundPlaces: Array<Place>;
  placeList: Array<Place>;
  searchAroundLoading: boolean;
  searchByInputLoading: boolean;
  error: Error | null;

  onSearchPlacesAround: (
    locationForSearch: {
      lat: number;
      lng: number;
    },
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;

  onSearchPlacesAroundByCategory: (
    category: string,
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;
  onSearchNewPlacesByName: (
    searchQuery: string,
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;
  onSearchMorePlacesByName: (
    searchQuery: string,
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;
  onSelectPlaceFromPlaceList: (place: Place) => void;

  onClearFetchPlacesError: () => void;
  onClearPlaceList: () => void;
  onClearSurroundPlaces: () => void;
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
      searchCategory: CATEGORIES[0],
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
      const { surroundPlaces } = this.props;
      let index = Math.floor(value / CARD_WIDTH + 0.3);
      if (index >= surroundPlaces.length) {
        index = surroundPlaces.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      this.timeout = setTimeout(() => {
        if (this.index !== index) {
          this.index = index;
          const { zoom } = this.state;
          const { location } = surroundPlaces[index];
          this.animateToRegion({
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
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
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
   * Method move map to desire region
   * @param region Region to move to
   */
  animateToRegion = (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    this.mapRef.current?.animateToRegion(region);
  };

  /**
   * Method move map to current location
   */
  animateToCurrentLocation = () => {
    this.setCurrentLocation().then(() => {
      const { currentLocation, zoom } = this.state;
      if (currentLocation) {
        this.animateToRegion({
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
          await this.props.onSearchPlacesAround(
            lastSearchedLocation,
            currentLocation,
          );
          if (this.props.surroundPlaces.length) {
            this.animateToRegion({
              latitude: this.props.surroundPlaces[0].location.lat,
              longitude: this.props.surroundPlaces[0].location.lng,
              latitudeDelta: zoom.latDelta,
              longitudeDelta: zoom.lngDelta,
            });
          }
          this.setState({ triggerSearchThisLocation: false });
        }
      },
    );
  };

  performSearchMorePlacesByName = () => {
    const { searchQuery, currentLocation } = this.state;
    if (currentLocation) {
      this.props.onSearchMorePlacesByName(searchQuery, currentLocation);
    }
  };

  renderMarkers = () => {
    const { surroundPlaces } = this.props;
    if (surroundPlaces.length === 0) {
      return null;
    }
    const interpolations = surroundPlaces.map((_, index) => {
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

    return surroundPlaces.map((place, index) => {
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
    this.setState({ searchQuery: text }, () => {
      delay(500).then(() => {
        const { searchQuery, currentLocation } = this.state;
        if (currentLocation) {
          this.props.onSearchNewPlacesByName(searchQuery, currentLocation);
        }
      });
    });
  };

  onSearchCategorySelect = (category: string) => {
    this.setState(
      {
        searchCategory: category,
        searchQuery: capitalize(category),
        toggleDropdownCategories: false,
      },
      async () => {
        const { currentLocation, zoom } = this.state;
        if (currentLocation) {
          await this.props.onSearchPlacesAroundByCategory(
            category,
            currentLocation,
          );
          if (this.props.surroundPlaces.length) {
            const firstPlace = this.props.surroundPlaces[0].location;
            this.animateToRegion({
              latitude: firstPlace.lat,
              longitude: firstPlace.lng,
              latitudeDelta: zoom.latDelta,
              longitudeDelta: zoom.lngDelta,
            });
          }
        }
      },
    );
  };

  openDropdownCategories = () => {
    this.setState({ toggleDropdownCategories: true });
  };

  clearSearchQuery = () => {
    this.setState({ searchQuery: '', toggleDropdownCategories: false }, () => {
      const { onClearSurroundPlaces, onClearPlaceList } = this.props;
      onClearPlaceList();
      onClearSurroundPlaces();
    });
  };

  performSelectPlaceFromPlaceList = (place: Place) => {
    const { onSelectPlaceFromPlaceList, onClearPlaceList } = this.props;
    onSelectPlaceFromPlaceList(place);
    onClearPlaceList();
    this.setState({ searchQuery: place.name });
    const { location } = place;
    const { zoom } = this.state;
    this.animateToRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: zoom.latDelta,
      longitudeDelta: zoom.lngDelta,
    });
  };

  render() {
    const {
      currentLocation,
      triggerSearchThisLocation,
      toggleDropdownCategories,
      searchQuery,
      searchCategory,
      zoom,
    } = this.state;
    const {
      surroundPlaces,
      placeList,
      searchAroundLoading,
      searchByInputLoading,
    } = this.props;

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
          isPlaceListOpen={placeList.length > 0}
          loading={searchByInputLoading}
        />
        {placeList.length ? (
          <PlaceList
            places={placeList}
            onSelect={this.performSelectPlaceFromPlaceList}
            onLoadMore={this.performSearchMorePlacesByName}
          />
        ) : null}
        {toggleDropdownCategories ? (
          <DropdownCategories
            selectedValue={searchCategory}
            categories={CATEGORIES}
            onSelectCategory={this.onSearchCategorySelect}
          />
        ) : null}
        {triggerSearchThisLocation ? (
          <View style={styles.searchThisBtnWrapper}>
            <TouchableOpacity
              disabled={searchAroundLoading}
              style={styles.searchThisBtn}
              onPress={this.performSearchOnThisLocation}>
              {searchAroundLoading ? (
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
        <Map
          ref={this.mapRef}
          currentLocation={currentLocation}
          zoom={zoom}
          places={surroundPlaces}
          renderMarkers={this.renderMarkers}
          onRegionChange={this.onRegionChange}
        />
        {surroundPlaces.length ? (
          <PlaceScrollView places={surroundPlaces} animation={this.animation} />
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
  surroundPlaces: state.allPlaces.results.surroundPlaces,
  placeList: state.allPlaces.results.placeList,
  searchAroundLoading: state.allPlaces.loadings.searchAroundLoading,
  searchByInputLoading: state.allPlaces.loadings.searchByInputLoading,
  error: state.allPlaces.error,
});

const mapDispatchToProps = {
  onSearchPlacesAround: searchPlacesAround,
  onClearFetchPlacesError: clearFetchPlacesError,
  onSearchNewPlacesByName: searchNewPlacesByName,
  onClearSurroundPlaces: clearSurroundPlaces,
  onSearchMorePlacesByName: searchMorePlacesByName,
  onSelectPlaceFromPlaceList: selectPlaceFromPlaceList,
  onClearPlaceList: clearPlaceList,
  onSearchPlacesAroundByCategory: searchPlacesAroundByCategory,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);
