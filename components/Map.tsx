import React, { forwardRef } from 'react';
import MapView, { Marker } from 'react-native-maps';

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
  ref?: React.RefObject<MapView>;

  onRegionChange?: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;

  renderMarkers: () => Array<JSX.Element> | null;
}

export default forwardRef(
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
