import React, { Component } from 'react';
import {
  Animated,
  TextInput,
  Keyboard,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Colors,
  bottomTabHeight,
  MaterialCommunityIcons,
} from '../../../constants';

export default class CommentInput extends Component<any, any> {
  private keyboardWillShowListener: any;
  private keyboardWillHideListener: any;
  private moveAnimation: Animated.Value;

  constructor(props: any) {
    super(props);
    this.moveAnimation = new Animated.Value(0);
    this.state = {
      text: '',
      textInputHeight: 0,
    };
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide,
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  _keyboardWillShow = (event: any) => {
    this._move(-event.endCoordinates.height + bottomTabHeight, 270);
  };

  _keyboardWillHide = () => {
    this._move(0, 100);
  };

  _move = (value: number, duration: number) => {
    Animated.timing(this.moveAnimation, {
      toValue: value,
      duration,
      useNativeDriver: true,
    }).start();
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
      <Animated.View style={[styles.wrapper, animStyle]}>
        <TextInput
          onChangeText={(text) => this.setState({ text })}
          onContentSizeChange={(event) => {
            this.setState({
              textInputHeight: event.nativeEvent.contentSize.height,
            });
          }}
          autoCorrect={false}
          multiline
          placeholder="Write a comment"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={[
            styles.input,
            {
              height: Math.max(30, this.state.textInputHeight),
              maxHeight: 100,
            },
          ]}
        />
        <TouchableWithoutFeedback onPress={() => console.log('submit comment')}>
          <View style={styles.submitBtn}>
            <MaterialCommunityIcons name="send" size={24} color="white" />
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    maxHeight: 116,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: Colors.darkColor,
    borderTopColor: Colors.brightColor,
    borderTopWidth: 1,
  },
  input: {
    color: 'white',
    width: '90%',
    zIndex: 100,
    backgroundColor: Colors.brightColor,
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 18,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 18,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  submitBtn: {
    padding: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
});
