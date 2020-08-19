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
import { Loading, Map, CARD_WIDTH } from '../../components';
import {
  PlaceScrollView,
  PlaceSearchBar,
  DropdownCategoryList,
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
import { ScrollView } from 'react-native-gesture-handler';

const { width, height } = Layout.window;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);
const CATEGORIES = ['bar', 'restaurant'];

const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

interface MapScreenProps {
  /**
   * Surrounding places for places scroll view
   */
  surroundingPlaces: Array<Place>;

  /**
   * Place list for place search results
   */
  placeList: Array<Place>;

  /**
   * Loading when search surrounding places
   */
  searchAroundLoading: boolean;

  /**
   * Loading when search places by input
   */
  searchByInputLoading: boolean;

  /**
   * General error
   */
  error: Error | null;

  /**
   * Method search surrounding places
   * @param locationForSearch Desire location to search
   * @param currentLocation Current location at a point to perform search
   */
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

  /**
   * Method search places by category
   * @param category: Category to search
   * @param currentLocation Current location at a point to perform search
   */
  onSearchPlacesAroundByCategory: (
    category: string,
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;

  /**
   * Method search places by inputting name
   * @param searchQuery Name of place to search
   * @param currentLocation Current location at a point to perform search
   */
  onSearchNewPlacesByName: (
    searchQuery: string,
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;

  /**
   * Method fetch more search results from name search
   * @param searchQuery Name of place to search
   * @param currentLocation Current location at a point to perform search
   */
  onSearchMorePlacesByName: (
    searchQuery: string,
    currentLocation: {
      coords: { lat: number; lng: number };
      type: 'my-location' | 'default-location';
    },
  ) => void;

  /**
   * Method select a place result from result place list.
   * It will replace the current surrounding places by the selected place
   */
  onSelectPlaceFromPlaceList: (place: Place) => void;

  /**
   * Method clear error
   */
  onClearFetchPlacesError: () => void;

  /**
   * Method clear place list when pressing on close button on search bar
   */
  onClearPlaceList: () => void;

  /**
   * Method clear surrounding places when pressing on close button on search bar
   */
  onClearSurroundPlaces: () => void;
}

interface MapScreenState {
  /**
   * Current location of the user. When user does not turn on location service,
   * default location will be used
   */
  currentLocation: {
    coords: {
      lat: number;
      lng: number;
    };
    type: 'my-location' | 'default-location';
  } | null;

  /**
   * Current zoom level when zooming the map
   */
  zoom: {
    latDelta: number;
    lngDelta: number;
  };

  /**
   * Last location that user performed search on this area
   */
  lastSearchedLocation: {
    lat: number;
    lng: number;
  } | null;

  /**
   * Current location when moving the map
   */
  newLocation: {
    lat: number;
    lng: number;
  } | null;

  /**
   * When moving the map far enough, this will trigger search
   * on this area button
   */
  triggerSearchThisLocation: boolean;

  /**
   * Current selected category for search
   */
  searchCategory: string;

  /**
   * Place input for search
   */
  searchQuery: string;

  /**
   * Trigger when to render dropdown category list
   */
  toggleDropdownCategories: boolean;
}

class MapScreen extends Component<MapScreenProps, MapScreenState> {
  /**
   * @var mapRef MapView ref used to control the MapViiew component
   * @var scrollViewRef ScrollView ref used to control the ScrollView component
   * @var animation Animation value
   * @var animationUnsubscriber Animation's id used to unsubscribe its listener when unmounting
   * @var snapIndex Current snapping index of when scrolling the ScrollView
   */
  private mapRef: React.RefObject<MapView>;
  private scrollViewRef: React.RefObject<ScrollView>;
  private animation: Animated.Value;
  private animationUnsubscriber: string;
  private snapIndex: number;

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
    this.scrollViewRef = createRef();
    this.snapIndex = 0;
    this.animationUnsubscriber = '';
  }

  /**
   * Method animation listener when its value changed
   */
  animationListener = ({ value }: { value: number }) => {
    const { surroundingPlaces } = this.props;
    let index = Math.floor(value / (CARD_WIDTH + 12) + 0.3);
    if (index >= surroundingPlaces.length) {
      index = surroundingPlaces.length - 1;
    }
    if (index <= 0) {
      index = 0;
    }

    if (this.snapIndex !== index) {
      this.snapIndex = index;
      const { zoom } = this.state;
      const { location } = surroundingPlaces[index];
      this.animateToRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: zoom.latDelta,
        longitudeDelta: zoom.lngDelta,
      });
    }
  };

  componentDidMount() {
    this.setCurrentLocation();
    this.animationUnsubscriber = this.animation.addListener(
      this.animationListener,
    );
  }

  componentWillUnmount() {
    this.animation.removeListener(this.animationUnsubscriber);
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
   * Method scroll ScrollView to top
   */
  scrollViewScrollToTop = () => {
    this.scrollViewRef.current?.scrollTo({
      x: 0,
      y: 0,
      animated: true,
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
   * Method callback whenever onRegionChange fires
   */
  onRegionChangeCallback = () => {
    const { currentLocation, lastSearchedLocation, newLocation } = this.state;
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
      this.onRegionChangeCallback,
    );
  };

  /**
   * Method perform search on this area
   */
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
          if (this.props.surroundingPlaces.length) {
            this.animateToRegion({
              latitude: this.props.surroundingPlaces[0].location.lat,
              longitude: this.props.surroundingPlaces[0].location.lng,
              latitudeDelta: zoom.latDelta,
              longitudeDelta: zoom.lngDelta,
            });
            this.scrollViewScrollToTop();
          }
          this.setState({ triggerSearchThisLocation: false });
        }
      },
    );
  };

  /**
   * Method fetch more results when scrolling place list
   */
  performSearchMorePlacesByName = () => {
    const { searchQuery, currentLocation } = this.state;
    if (currentLocation) {
      this.props.onSearchMorePlacesByName(searchQuery, currentLocation);
    }
  };

  /**
   * Method render all markers with animation attached
   */
  renderMarkers = () => {
    const { surroundingPlaces } = this.props;
    if (surroundingPlaces.length === 0) {
      return null;
    }
    const interpolations = surroundingPlaces.map((_, index) => {
      const inputRange = [
        (index - 1) * (CARD_WIDTH + 12),
        index * (CARD_WIDTH + 12),
        (index + 1) * (CARD_WIDTH + 12),
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

    return surroundingPlaces.map((place, index) => {
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

  /**
   * Method callback perform search places by name input
   * for every keystroke
   */
  onSearchQueryChangeCallback = () => {
    delay(500).then(() => {
      const { searchQuery, currentLocation } = this.state;
      if (currentLocation) {
        this.props.onSearchNewPlacesByName(searchQuery, currentLocation);
      }
    });
  };

  /**
   * Method set new seach query and perform search by name input
   * for every keystroke
   * @param text New value to set
   */
  onSearchQueryChange = (text: string) => {
    this.setState({ searchQuery: text }, this.onSearchQueryChangeCallback);
  };

  /**
   * Method select category and perform search places by selected category
   * @param category New category to set
   */
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
          if (this.props.surroundingPlaces.length) {
            const firstPlace = this.props.surroundingPlaces[0].location;
            this.animateToRegion({
              latitude: firstPlace.lat,
              longitude: firstPlace.lng,
              latitudeDelta: zoom.latDelta,
              longitudeDelta: zoom.lngDelta,
            });
            this.scrollViewScrollToTop();
          }
        }
      },
    );
  };

  /**
   * Method open dropdown category list
   */
  openDropdownCategories = () => {
    this.setState({ toggleDropdownCategories: true });
  };

  /**
   * Method callback perform clear whenever clearSearchQuery fires
   */
  clearSearchQueryCallback = () => {
    const { onClearSurroundPlaces, onClearPlaceList } = this.props;
    onClearPlaceList();
    onClearSurroundPlaces();
  };

  /**
   * Method clear results when pressing on close button on search bar
   */
  clearSearchQuery = () => {
    this.setState(
      { searchQuery: '', toggleDropdownCategories: false },
      this.clearSearchQueryCallback,
    );
  };

  /**
   * Method select place from place results list. It will replace
   * surround places by the selected place
   * @param place Place to select
   */
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
      surroundingPlaces,
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
          <DropdownCategoryList
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
          places={surroundingPlaces}
          renderMarkers={this.renderMarkers}
          onRegionChange={this.onRegionChange}
        />
        {surroundingPlaces.length ? (
          <PlaceScrollView
            ref={this.scrollViewRef}
            places={surroundingPlaces}
            animation={this.animation}
          />
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
  surroundingPlaces: state.allPlaces.results.surroundingPlaces,
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
