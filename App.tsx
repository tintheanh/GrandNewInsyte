import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import store from './redux/store';
import RootStack from './stacks/RootStack';

// declare const global: { HermesInternal: null | {} };

function App() {
  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" translucent={true} />
      <RootStack />
    </Provider>
  );
}

export default App;
