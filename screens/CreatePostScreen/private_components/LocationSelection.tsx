import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const LocationSelection = () => {
  return (
    <TouchableOpacity onPress={() => console.log('location')}>
      <Text style={{ color: 'white' }}>Add location</Text>
    </TouchableOpacity>
  );
};

export default LocationSelection;
