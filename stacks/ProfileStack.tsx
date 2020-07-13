import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import { FontAwesome5, Colors } from '../constants';
import { ProfileScreen } from '../screens';
import { AppState } from '../redux/store';

const Stack = createStackNavigator();

function ProfileStack({ username }: { username: string }) {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: { backgroundColor: Colors.darkColor },
      }}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: username,
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <FontAwesome5 name="bars" color="white" size={20} />
            </TouchableOpacity>
          ),
          headerRightContainerStyle: { paddingRight: 12 },
        })}
      />
    </Stack.Navigator>
  );
}

const mapStateToProps = (state: AppState) => ({
  username: state.auth.user?.username,
});

export default connect(mapStateToProps, null)(ProfileStack);
