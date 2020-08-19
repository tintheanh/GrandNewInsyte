import React, { Component } from 'react';
import { Picker } from '@react-native-community/picker';
import { TouchableHighlight, StyleSheet } from 'react-native';
import { delay, capitalize } from '../../../utils/functions';

interface DropdownCategoriesProps {
  /**
   * Current selected category
   */
  selectedValue: string;

  /**
   * All categories
   */
  categories: Array<string>;

  /**
   * Method select a category
   */
  onSelectCategory: (category: string) => void;
}

interface DropdownCategoriesState {
  /**
   * Current selected category on scroll
   */
  value: string;
}

export default class DropdownCategoryList extends Component<
  DropdownCategoriesProps,
  DropdownCategoriesState
> {
  constructor(props: DropdownCategoriesProps) {
    super(props);
    this.state = {
      value: this.props.selectedValue,
    };
  }

  shouldComponentUpdate(
    nextProps: DropdownCategoriesProps,
    nextState: DropdownCategoriesState,
  ) {
    if (this.state.value !== nextState.value) {
      return true;
    }
    if (
      this.checkCategoriesChanged(this.props.categories, nextProps.categories)
    ) {
      return true;
    }
    return false;
  }

  checkCategoriesChanged = (oldVal: Array<string>, newVal: Array<string>) => {
    if (oldVal.length !== newVal.length) {
      return true;
    }
    for (let i = 0; i < oldVal.length; i++) {
      if (oldVal[i] !== newVal[i]) {
        return true;
      }
    }

    return false;
  };

  renderCategories = () => {
    return this.props.categories.map((cat, i) => (
      <Picker.Item key={i} label={capitalize(cat)} value={cat} />
    ));
  };

  onValueChange = (itemValue: React.ReactText, _: number) => {
    this.setState({ value: itemValue.toString() });
  };

  performSelectCategory = () => {
    delay(400).then(() => this.props.onSelectCategory(this.state.value));
  };

  render() {
    return (
      <TouchableHighlight
        style={styles.dropdownListWrapper}
        onPress={this.performSelectCategory}>
        <Picker
          selectedValue={this.state.value}
          onValueChange={this.onValueChange}
          style={styles.dropdownList}
          itemStyle={styles.dropdownItem}>
          {this.renderCategories()}
        </Picker>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  dropdownListWrapper: {
    zIndex: 200,
    position: 'absolute',
    top: 62,
    width: '90%',
    alignSelf: 'center',
  },
  dropdownList: {
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  dropdownItem: {
    fontSize: 14,
  },
});
