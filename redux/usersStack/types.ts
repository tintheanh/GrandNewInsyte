import { UsersStack } from '../../models';

export const SET_CURRENT_TAB = 'SET_CURRENT_TAB';
export const SET_CURRENT_VIEWABLE_POST_INDEX = 'SET_CURRENT_VIEWABLE_POST_INDEX';
export const PUSH_USERS_LAYER = 'PUSH_USERS_LAYER';
export const POP_USERS_LAYER = 'POP_USERS_LAYER';
export const CLEAR_STACK = 'CLEAR_STACK';

export const FETCH_USER_STARTED = 'FETCH_USER_STARTED';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export interface UsersStackAction {
  type: string;
  payload: any;
}

export type CurrentTab = 'homeTabStack' | 'userTabStack';

export interface UsersStackState {
  homeTabStack: UsersStack;
  userTabStack: UsersStack;
  currentTab: CurrentTab;
}
