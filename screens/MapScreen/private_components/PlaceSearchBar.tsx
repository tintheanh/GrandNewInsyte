import React from 'react';
import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '../../../constants';

interface PlaceSearchBarProps {
  /**
   * Current searchQuery value
   */
  searchQuery: string;

  /**
   * If dropdown category list is open
   */
  isDropdownOpen: boolean;

  /**
   * If place results list is open
   */
  isPlaceListOpen: boolean;

  /**
   * If searching is on loading
   */
  loading: boolean;

  /**
   * Method update new searchQuery value
   */
  onChangeText: (text: string) => void;

  /**
   * Method clear results when pressing on close button
   */
  clearSearch: () => void;

  /**
   * Method to open the dropdown category list when pressing on down button
   */
  openDropdownCategories: () => void;
}

export default React.memo(
  function PlaceSearchBar({
    searchQuery,
    isDropdownOpen,
    isPlaceListOpen,
    loading,
    onChangeText,
    clearSearch,
    openDropdownCategories,
  }: PlaceSearchBarProps) {
    return (
      <View
        style={[
          styles.searchWrapper,
          !isDropdownOpen && !isPlaceListOpen
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
            {loading ? (
              <ActivityIndicator
                size="small"
                color="black"
                style={styles.loading}
              />
            ) : (
              <TouchableWithoutFeedback onPress={clearSearch}>
                <View style={styles.closeIcon}>
                  <Ionicons
                    name="ios-close"
                    size={14}
                    color="rgba(0, 0, 0, 0.6)"
                  />
                </View>
              </TouchableWithoutFeedback>
            )}
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
    if (prevProps.isPlaceListOpen !== nextProps.isPlaceListOpen) {
      return false;
    }
    if (prevProps.loading !== nextProps.loading) {
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
    zIndex: 300,
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
    color: 'rgba(0, 0, 0, 0.6)',
  },
  searchIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 310,
  },
  rightIconsWrapper: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
  },
  closeIconWrapper: {
    zIndex: 310,
  },
  closeIcon: {
    justifyContent: 'center',
    height: 28,
  },
  downIconWrapper: {
    zIndex: 310,
  },
  downIcon: {
    justifyContent: 'center',
    height: 28,
  },
  loading: {
    justifyContent: 'center',
    height: 28,
    width: 14,
    transform: [{ scale: 0.5 }],
  },
});
