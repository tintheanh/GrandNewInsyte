import React, { forwardRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Place } from '../models';
import { checkPlaceListChanged } from '../utils/functions';

interface MapProps {
  currentLocation: {
    coords: {
      lat: number;
      lng: number;
    };
    type: 'my-location' | 'default-location';
  };
  zoom: {
    latDelta: number;
    lngDelta: number;
  };
  places: Array<Place>;
  ref?: React.RefObject<MapView>;

  onRegionChange?: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;

  renderMarkers: () => Array<JSX.Element> | null;
}

const Map = forwardRef(
  ({ currentLocation, zoom, onRegionChange, renderMarkers }: MapProps, ref) => {
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
  if (checkPlaceListChanged(prevProps.places, nextProps.places)) {
    return false;
  }

  return true;
});
