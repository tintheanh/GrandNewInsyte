import {
  NavigationStack,
  CurrentTabScreen,
  PlaceStackLayer,
  Post,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SET_CURRENT_TAB = 'SET_CURRENT_TAB',
  SET_CURRENT_VIEWABLE_POST_INDEX = 'SET_CURRENT_VIEWABLE_POST_INDEX',
  PUSH_PLACE_LAYER = 'PUSH_PLACE_LAYER',
  POP_PLACE_LAYER = 'POP_PLACE_LAYER',
  CLEAR_STACK = 'CLEAR_STACK',
  RESET_ALL_STACKS = 'RESET_ALL_STACKS',
  CLEAR_ERROR = 'CLEAR_ERROR',

  FETCH_PLACE_STARTED = 'FETCH_PLACE_STARTED',
  FETCH_PLACE_SUCCESS = 'FETCH_PLACE_SUCCESS',
  FETCH_PLACE_FAILURE = 'FETCH_PLACE_FAILURE',

  FETCH_MORE_POSTS_FROM_PLACE_STARTED = 'FETCH_MORE_POSTS_FROM_PLACE_STARTED',
  FETCH_MORE_POSTS_FROM_PLACE_SUCCESS = 'FETCH_MORE_POSTS_FROM_PLACE_SUCCESS',
  FETCH_MORE_POSTS_FROM_PLACE_FAILURE = 'FETCH_MORE_POSTS_FROM_PLACE_FAILURE',
}

export interface PlaceStackAction {
  type: string;
  payload:
    | {
        placeID: string;
        username: string;
        name: string;
        avatar: string;
      }
    | number
    | CurrentTabScreen
    | Error
    | null;
}

export interface PlaceStackState {
  homeTabStack: NavigationStack<PlaceStackLayer>;
  userTabStack: NavigationStack<PlaceStackLayer>;
  placeTabStack: NavigationStack<PlaceStackLayer>;
  currentTab: CurrentTabScreen;
  currentLoadingInTab: CurrentTabScreen | '';
}
