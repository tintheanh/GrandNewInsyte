import React from 'react';
import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '../../../constants';

interface PlaceSearchBarProps {
  searchQuery: string;
  isDropdownOpen: boolean;
  submitSearch: () => void;
  onChangeText: (text: string) => void;
  clearSearch: () => void;
  openDropdownCategories: () => void;
}

export default React.memo(
  function PlaceSearchBar({
    searchQuery,
    isDropdownOpen,
    submitSearch,
    onChangeText,
    clearSearch,
    openDropdownCategories,
  }: PlaceSearchBarProps) {
    return (
      <View
        style={[
          styles.searchWrapper,
          !isDropdownOpen
            ? {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                elevation: 2,
              }
            : null,
        ]}>
        <FontAwesome5
          name="search-location"
          size={14}
          color="rgba(0, 0, 0, 0.6)"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={
            isDropdownOpen ? 'Search by categories' : 'Search places'
          }
          autoCorrect={false}
          value={searchQuery}
          style={styles.searchBox}
          onChangeText={onChangeText}
          onSubmitEditing={submitSearch}
        />
        <View style={styles.rightIconsWrapper}>
          <View style={styles.downIconWrapper}>
            <TouchableWithoutFeedback onPress={openDropdownCategories}>
              <View style={styles.downIcon}>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color="rgba(0, 0, 0, 0.6)"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.closeIconWrapper}>
            <TouchableWithoutFeedback onPress={clearSearch}>
              <View style={styles.closeIcon}>
                <Ionicons
                  name="ios-close"
                  size={14}
                  color="rgba(0, 0, 0, 0.6)"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    );
  },
  (prevProps: PlaceSearchBarProps, nextProps: PlaceSearchBarProps) => {
    if (prevProps.searchQuery !== nextProps.searchQuery) {
      return false;
    }
    if (prevProps.isDropdownOpen !== nextProps.isDropdownOpen) {
      return false;
    }
    return true;
  },
);

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
    position: 'absolute',
    top: 42,
    width: '90%',
    alignSelf: 'center',
  },
  searchBox: {
    width: '100%',
    paddingLeft: 36,
    paddingRight: 46,
    height: 38,
    fontSize: 12,
    borderRadius: 40,
    backgroundColor: 'white',
  },
  searchIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 200,
  },
  rightIconsWrapper: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
  },
  closeIconWrapper: {
    zIndex: 200,
  },
  closeIcon: {
    justifyContent: 'center',
    height: 28,
  },
  downIconWrapper: {
    zIndex: 200,
  },
  downIcon: {
    justifyContent: 'center',
    height: 28,
  },
});
