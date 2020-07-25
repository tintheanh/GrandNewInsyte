import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Colors from '../../constants/Colors';
import {
  SignInBtn,
  SignInErrorText,
  EmailTextBox,
  PasswordTextBox,
} from './private_components';

const screenHeight = Math.round(Dimensions.get('window').height);

interface SignInScreenProps {
  navigation?: any;
}

class SignInScreen extends Component<SignInScreenProps> {
  private moveAnimation: Animated.Value;

  constructor(props: SignInScreenProps) {
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

  navigateToSignUp = () => {
    this.props.navigation.navigate('SignUp');
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
          <EmailTextBox
            onWatchFocus={this._moveUp}
            onWatchBlur={this._moveDown}
          />
          <PasswordTextBox
            onWatchFocus={this._moveUp}
            onWatchBlur={this._moveDown}
          />
          <SignInErrorText />
          <SignInBtn
            callback={this._move(0)}
            navigation={this.props.navigation}
          />
          <View style={styles.signupView}>
            <Text style={{ color: 'white' }}>First time here? </Text>
            <TouchableOpacity onPress={this.navigateToSignUp}>
              <Text style={{ color: '#bac9d4', fontWeight: 'bold' }}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
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
  signupView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
});

export default SignInScreen;
