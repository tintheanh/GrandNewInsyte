import React, { forwardRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Place } from '../models';
import { checkPlaceListChanged } from '../utils/functions';

interface MapProps {
  /**
   * Current location of the user
   */
  currentLocation: {
    coords: {
      lat: number;
      lng: number;
    };
    type: 'my-location' | 'default-location';
  };

  /**
   * Current zoom level when zooming the map
   */
  zoom: {
    latDelta: number;
    lngDelta: number;
  };
  places: Array<Place>;

  /**
   * Method render all markers
   */
  renderMarkers: () => Array<JSX.Element> | null;

  /**
   * Optional method when the map is moving/zooming
   */
  onRegionChange?: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
}

const Map = forwardRef(
  ({ currentLocation, zoom, onRegionChange, renderMarkers }: MapProps, ref) => {
    /**
     * Method render current location's marker
     */
    const renderCurrentMarker = () => {
      if (currentLocation.type === 'my-location') {
        return (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.lat,
              longitude: currentLocation.coords.lng,
            }}
          />
        );
      }
      return null;
    };

    return (
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.coords.lat,
          longitude: currentLocation.coords.lng,
          latitudeDelta: zoom.latDelta,
          longitudeDelta: zoom.lngDelta,
        }}
        onRegionChangeComplete={onRegionChange}>
        {renderCurrentMarker()}
        {renderMarkers()}
      </MapView>
    );
  },
);

export default React.memo(Map, (prevProps: MapProps, nextProps: MapProps) => {
  if (
    prevProps.currentLocation.coords.lat !==
      nextProps.currentLocation.coords.lat ||
    prevProps.currentLocation.coords.lng !==
      nextProps.currentLocation.coords.lng
  ) {
    return false;
  }
  if (
    prevProps.zoom.latDelta !== nextProps.zoom.latDelta ||
    prevProps.zoom.lngDelta !== nextProps.zoom.lngDelta
  ) {
    return false;
  }
  if (checkPlaceListChanged(prevProps.places, nextProps.places)) {
    return false;
  }

  return true;
});
