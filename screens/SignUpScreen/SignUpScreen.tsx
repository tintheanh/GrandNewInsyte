import React, { Component } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

import Colors from '../../constants/Colors';
import {
  RetypePasswordTextBox,
  EmailTextBox,
  PasswordTextBox,
  UsernameTextBox,
} from './private_components';
import { SignUpBtn, SignUpErrorText } from './private_components';

const screenHeight = Math.round(Dimensions.get('window').height);

class SignUpScreen extends Component {
  private moveAnimation: Animated.Value;

  constructor(props: any) {
    super(props);
    this.moveAnimation = new Animated.Value(0);
  }

  _move = (value: number) => () => {
    Animated.timing(this.moveAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  _moveUp = () => {
    this._move(-screenHeight / 6)();
  };

  _moveDown = () => {
    this._move(0)();
  };

  render() {
    const animStyle = {
      transform: [
        {
          translateY: this.moveAnimation,
        },
      ],
    };

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.textBoxsWrapper, animStyle]}>
          <UsernameTextBox
            onWatchFocus={this._moveUp}
            onWatchBlur={this._moveDown}
          />
          <EmailTextBox
            onWatchFocus={this._moveUp}
            onWatchBlur={this._moveDown}
          />
          <PasswordTextBox
            onWatchFocus={this._moveUp}
            onWatchBlur={this._moveDown}
          />
          <RetypePasswordTextBox
            onWatchFocus={this._moveUp}
            onWatchBlur={this._moveDown}
          />
          <SignUpErrorText />
          <SignUpBtn callback={this._move(0)} />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brightColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxsWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignUpScreen;
