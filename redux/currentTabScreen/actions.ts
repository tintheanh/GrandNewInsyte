import {
  SET_CURRENT_TAB_SCREEN,
  CurrentTabScreenAction,
  CurrentTab,
} from './types';

export const setCurrentTabScreen = (tab: CurrentTab) => (
  dispatch: (action: CurrentTabScreenAction) => void,
) => {
  dispatch({
    type: SET_CURRENT_TAB_SCREEN,
    payload: tab,
  });
};
