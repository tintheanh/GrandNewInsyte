import {
  SET_CURRENT_TAB,
  CurrentTab,
  RepliesStackState,
  RepliesStackAction,
} from './types';
import { RepliesStack, Reply } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';

const initialState: RepliesStackState = {
  homeTabStack: new RepliesStack(),
  userTabStack: new RepliesStack(),
  currentTab: 'homeTabStack',
};

export default function commentsStackReducer(
  state = initialState,
  action: RepliesStackAction,
): RepliesStackState {
  switch (action.type) {
    case SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTab;
      return newState;
    }

    default:
      return state;
  }
}
