import {
  SET_CURRENT_HOMELISTPOST_INDEX,
  SET_CURRENT_USERLISTPOST_INDEX,
  SET_CURRENT_USERTAGGEDSLISTPOST_INDEX,
  SetIndexAction,
} from './types';

export const setCurrentHomeListPostIndex = (index: number) => (
  dispatch: (action: SetIndexAction) => void,
) => {
  dispatch({
    type: SET_CURRENT_HOMELISTPOST_INDEX,
    payload: index,
  });
};

export const setCurrentUserListPostIndex = (index: number) => (
  dispatch: (action: SetIndexAction) => void,
) => {
  dispatch({
    type: SET_CURRENT_USERLISTPOST_INDEX,
    payload: index,
  });
};

export const setCurrentUserTaggedListPostIndex = (index: number) => (
  dispatch: (action: SetIndexAction) => void,
) => {
  dispatch({
    type: SET_CURRENT_USERTAGGEDSLISTPOST_INDEX,
    payload: index,
  });
};
