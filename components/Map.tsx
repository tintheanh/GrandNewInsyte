import React, { forwardRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Layout } from '../constants';

const { width, height } = Layout.window;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

interface MapProps {
  children?: any;
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
  zoom?: {
    latDelta: number;
    lngDelta: number;
  };

  places?: Array<{
    lat: number;
    lng: number;
  }>;

  /**
   * Method render all markers
   */
  renderMarkers?: () => Array<JSX.Element> | null;

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
  (
    {
      children,
      currentLocation,
      zoom = {
        latDelta: LATITUDE_DELTA,
        lngDelta: LONGITUDE_DELTA,
      },
      onRegionChange,
      renderMarkers,
    }: MapProps,
    ref,
  ) => {
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
        {renderMarkers ? renderMarkers() : null}
        {children}
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
  if (prevProps.zoom && nextProps.zoom) {
    if (
      prevProps.zoom.latDelta !== nextProps.zoom.latDelta ||
      prevProps.zoom.lngDelta !== nextProps.zoom.lngDelta
    ) {
      return false;
    }
  }

  if (prevProps.places && nextProps.places) {
    if (prevProps.places.length !== nextProps.places.length) {
      return false;
    }
    for (let i = 0; i < prevProps.places.length; i++) {
      const place1 = prevProps.places[i];
      const place2 = nextProps.places[i];
      if (place1.lat !== place2.lat || place1.lng !== place2.lng) {
        return false;
      }
    }
  }

  return true;
});
