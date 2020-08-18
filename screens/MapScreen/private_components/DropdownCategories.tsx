import React, { Component } from 'react';
import { Picker } from '@react-native-community/picker';
import { TouchableHighlight, StyleSheet } from 'react-native';
import { delay } from '../../../utils/functions';

interface DropdownCategoriesProps {
  categories: Array<string>;
  onSelectCategory: (category: string) => void;
}

interface DropdownCategoriesState {
  value: string;
}

export default class DropdownCategories extends Component<
  DropdownCategoriesProps,
  DropdownCategoriesState
> {
  constructor(props: DropdownCategoriesProps) {
    super(props);
    this.state = {
      value: this.props.categories.length ? this.props.categories[0] : '',
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

  capitalize = (str: string) => {
    if (typeof str !== 'string') {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  renderCategories = () => {
    return this.props.categories.map((cat, i) => (
      <Picker.Item key={i} label={this.capitalize(cat)} value={cat} />
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
    zIndex: 100,
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