import {
  SET_CURRENT_TAB_SCREEN,
  CurrentTabScreenAction,
  CurrentTabScreenState,
} from './types';

const initialState: CurrentTabScreenState = {
  screen: 'homeTabStack',
};

export default function currentTabScreenReducer(
  state = initialState,
  action: CurrentTabScreenAction,
): CurrentTabScreenState {
  switch (action.type) {
    case SET_CURRENT_TAB_SCREEN:
      return { ...state, screen: action.payload };
    default:
      return state;
  }
}
