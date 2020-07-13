import {
  SET_CURRENT_HOMELISTPOST_INDEX,
  SET_CURRENT_USERLISTPOST_INDEX,
  SET_CURRENT_USERTAGGEDSLISTPOST_INDEX,
  SetIndexAction,
  IndexState,
} from './types';

const initialState: IndexState = {
  currentHomeListPostIndex: 0,
  currentUserListPostIndex: 0,
  currentUserTaggedListPostIndex: 0,
};

export default function currentViewableItemReducer(
  state = initialState,
  action: SetIndexAction,
): IndexState {
  switch (action.type) {
    case SET_CURRENT_HOMELISTPOST_INDEX:
      return { ...state, currentHomeListPostIndex: action.payload };
    case SET_CURRENT_USERLISTPOST_INDEX:
      return { ...state, currentUserListPostIndex: action.payload };
    case SET_CURRENT_USERTAGGEDSLISTPOST_INDEX:
      return { ...state, currentUserTaggedListPostIndex: action.payload };
    default:
      return state;
  }
}
