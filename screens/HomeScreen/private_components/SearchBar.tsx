import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  EmitterSubscription,
} from 'react-native';
import { clearSearchUser } from '../../../redux/search_user/actions';
import { Layout, Colors, Ionicons } from '../../../constants';
import SearchUserResultList from './SearchUserResultList';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface SearchBarState {
  searchQuery: string;
  keyboardHeight: number;
}

class SearchBar extends Component<any, SearchBarState> {
  /**
   * @var keyboardDidShowListener used for detect keyboard is on
   * @var keyboardDidHideListener used for detect keyboard is off
   */
  private keyboardDidShowListener: EmitterSubscription | null;
  private keyboardDidHideListener: EmitterSubscription | null;

  constructor(props: any) {
    super(props);
    this.state = {
      searchQuery: '',
      keyboardHeight: 0,
    };
    this.keyboardDidShowListener = null;
    this.keyboardDidHideListener = null;
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardWillHide,
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener?.remove();
    this.keyboardDidHideListener?.remove();
  }

  componentDidUpdate() {
    if (this.state.searchQuery === '') {
      this.props.onClearSearchUser();
    }
  }

  keyboardDidShow = (event: any) => {
    this.setState({
      keyboardHeight: event.endCoordinates.height,
    });
  };

  keyboardWillHide = () => {
    this.setState({ keyboardHeight: 0 });
  };

  /**
   * Method set new search query
   * @param text New search query to set
   */
  setSearchQuery = (text: string) => this.setState({ searchQuery: text });

  clearSeachQuery = () => {
    this.setState({ searchQuery: '' }, () => {
      this.props.onClearSearchUser();
      Keyboard.dismiss();
    });
  };

  render() {
    const { searchQuery, keyboardHeight } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.searchBarWrapper}>
          <TextInput
            placeholder="Search users"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchBar}
            value={searchQuery}
            onChangeText={this.setSearchQuery}
          />
          {searchQuery ? (
            <View style={styles.iconWrapper}>
              <TouchableWithoutFeedback onPress={this.clearSeachQuery}>
                <View style={styles.closeIcon}>
                  <Ionicons
                    name="ios-close"
                    size={14}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          ) : null}
        </View>
        {searchQuery ? (
          <SearchUserResultList
            navigation={this.props.navigation}
            searchQuery={searchQuery}
            keyboardHeight={keyboardHeight}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Layout.window.width,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 4,
  },
  searchBarWrapper: {
    flexDirection: 'row',
  },
  iconWrapper: {
    position: 'relative',
    right: 26,
  },
  closeIcon: {
    justifyContent: 'center',
    height: 28,
    paddingLeft: 5,
    paddingRight: 5,
  },
  searchBar: {
    backgroundColor: Colors.brightColor,
    width: '100%',
    height: 28,
    borderRadius: 4,
    paddingLeft: 16,
    paddingRight: 16,
    color: 'white',
  },
});

const mapDispatchToProps = {
  onClearSearchUser: clearSearchUser,
};

export default connect(null, mapDispatchToProps)(SearchBar);
