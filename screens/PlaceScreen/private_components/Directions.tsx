import React, { Component, createRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker } from 'react-native-maps';
import { Map } from '../../../components';
import { Ionicons, MaterialCommunityIcons } from '../../../constants';
import { kmToMiles } from '../../../utils/functions';
import apiKeys from '../../../api-keys.json';

interface DirectionsProps {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  width: number;
  height: number;
}

interface DirectionsState {
  distance: number;
  duration: number;
}

export default class Directions extends Component<
  DirectionsProps,
  DirectionsState
> {
  private mapRef: React.RefObject<MapView>;
  constructor(props: DirectionsProps) {
    super(props);
    this.state = {
      distance: -1,
      duration: -1,
    };
    this.mapRef = createRef();
  }

  renderDestinationMarker = () => {
    const { lat, lng } = this.props.destination;
    return [
      <Marker
        key={1}
        coordinate={{
          latitude: lat,
          longitude: lng,
        }}
      />,
    ];
  };

  renderStats = () => {
    const { distance, duration } = this.state;
    if (distance === -1 || duration === -1) {
      return null;
    }

    return (
      <View>
        <View style={styles.statsWrapper}>
          <View>
            <View style={styles.durationAndAddressWrapper}>
              <Ionicons name="car" color="white" size={17} />
              <Text style={styles.duration}>
                {duration.toFixed(1)} min drive
              </Text>
            </View>
            <Text style={styles.address}>
              1655 Jasmine Way, Morgan Hill, CA 95037
            </Text>
          </View>
          <Text style={styles.distance}>
            {kmToMiles(distance).toFixed(1)} mi
          </Text>
        </View>

        <View style={styles.getDirectionsWrapper}>
          <Text style={styles.getDirections}>Get Directions</Text>
          <MaterialCommunityIcons name="directions" color="white" size={20} />
        </View>
      </View>
    );
  };

  render() {
    const { origin, destination, width, height } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <View style={{ width, height }}>
          <Map
            ref={this.mapRef}
            currentLocation={{
              coords: origin,
              type: 'my-location',
            }}
            places={[destination]}
            renderMarkers={this.renderDestinationMarker}>
            <MapViewDirections
              origin={{ latitude: origin.lat, longitude: origin.lng }}
              destination={{
                latitude: destination.lat,
                longitude: destination.lng,
              }}
              apikey={apiKeys.DIRECTIONS_API_KEY}
              strokeWidth={3}
              strokeColor="hotpink"
              optimizeWaypoints={true}
              onReady={(result) => {
                this.setState({
                  distance: result.distance,
                  duration: result.duration,
                });
                this.mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: width / 20,
                    bottom: height / 20,
                    left: width / 20,
                    top: height / 20,
                  },
                });
              }}
            />
          </Map>
        </View>
        {this.renderStats()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    borderBottomColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 0.3,
    paddingTop: 14,
    paddingBottom: 8,
  },
  durationAndAddressWrapper: {
    flexDirection: 'row',
  },
  duration: { color: 'white', fontWeight: 'bold', marginLeft: 4 },
  address: { color: 'white', fontSize: 12, marginTop: 4 },
  distance: { color: 'white' },
  getDirectionsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    borderBottomColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 0.3,
    paddingVertical: 14,
  },
  getDirections: { color: 'white', fontWeight: 'bold' },
});
