import React, { Component } from 'react';
import { Text, View, TextInput, StyleSheet, ScrollView } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
import { Loading, PlaceCard } from '../../components';
import { Colors, FontAwesome5 } from '../../constants';

// const LOCATION = [
//   {
//     id: faker.random.uuid(),
//     thumbnail: faker.image.nightlife(),
//     name: faker.company.companyName(),
//     distance: 2,
//   },
// ];

export default class MapScreen extends Component<any, any> {
  // constructor(props: any) {
  //   super(props);
  //   this.state = { location: null, search: false };
  //   for (let i = 0; i < 5; i++) {
  //     LOCATION.push({
  //       id: faker.random.uuid(),
  //       thumbnail: faker.image.nightlife(),
  //       name: faker.company.companyName(),
  //       distance: i,
  //     });
  //   }
  // }

  // async componentDidMount() {
  //   const { status } = await Location.requestPermissionsAsync();
  //   if (status !== 'granted') {
  //     console.log('location denied');
  //   }
  //   const location = await Location.getCurrentPositionAsync({});
  //   this.setState({ location });
  // }

  render() {
    // if (this.state.location) {
    return (
      <View style={styles.container}>
        {/* <View style={styles.searchWrapper}>
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
              onSubmitEditing={() => this.setState({ search: true })}
            />
          </View>
          <MapView
            style={styles.mapView}
            initialRegion={{
              latitude: this.state.location!.coords.latitude,
              longitude: this.state.location!.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            // onRegionChange={(region: any) => console.log(region)}
          >
            <Marker
              coordinate={{
                latitude: this.state.location!.coords.latitude,
                longitude: this.state.location!.coords.longitude,
              }}
            />
          </MapView>
          {this.state.search ? (
            <ScrollView
              horizontal
              scrollEventThrottle={1}
              showsHorizontalScrollIndicator={false}
              style={styles.placeResults}
              contentContainerStyle={styles.endPadding}
            >
              {LOCATION.map((location) => (
                <PlaceCard
                  key={location.id}
                  thumbnail={location.thumbnail}
                  name={location.name}
                  distance={location.distance}
                />
              ))}
            </ScrollView>
          ) : null} */}
        <Text>Map</Text>
      </View>
    );
    // }
    // return <Loading />;
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
  placeResults: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  endPadding: {
    paddingRight: 2,
  },
});
