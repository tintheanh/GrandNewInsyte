import {
  NavigationStack,
  CurrentTabScreen,
  UserStackLayer,
  Post,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SET_CURRENT_TAB = 'SET_CURRENT_TAB',
  SET_CURRENT_VIEWABLE_POST_INDEX = 'SET_CURRENT_VIEWABLE_POST_INDEX',
  PUSH_USERS_LAYER = 'PUSH_USERS_LAYER',
  POP_USERS_LAYER = 'POP_USERS_LAYER',
  CLEAR_STACK = 'CLEAR_STACK',
  RESET_ALL_STACKS = 'RESET_ALL_STACKS',
  CLEAR_FOLLOW_ERROR = 'CLEAR_FOLLOW_ERROR',
  CLEAR_UNFOLLOW_ERROR = 'CLEAR_UNFOLLOW_ERROR',

  FETCH_USER_STARTED = 'FETCH_USER_STARTED',
  FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS',
  FETCH_USER_FAILURE = 'FETCH_USER_FAILURE',

  FETCH_MORE_POSTS_FROM_USER_STARTED = 'FETCH_MORE_POSTS_FROM_USER_STARTED',
  FETCH_MORE_POSTS_FROM_USER_SUCCESS = 'FETCH_MORE_POSTS_FROM_USER_SUCCESS',
  FETCH_MORE_POSTS_FROM_USER_FAILURE = 'FETCH_MORE_POSTS_FROM_USER_FAILURE',

  FOLLOW_USER_STARTED = 'FOLLOW_USER_STARTED',
  FOLLOW_USER_SUCCESS = 'FOLLOW_USER_SUCCESS',
  FOLLOW_USER_FAILURE = 'FOLLOW_USER_FAILURE',

  UNFOLLOW_USER_STARTED = 'UNFOLLOW_USER_STARTED',
  UNFOLLOW_USER_SUCCESS = 'UNFOLLOW_USER_SUCCESS',
  UNFOLLOW_USER_FAILURE = 'UNFOLLOW_USER_FAILURE',
}

export interface UserStackAction {
  type: string;
  payload:
    | {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      }
    | {
        userID: string;
        username: string;
        avatar: string;
      }
    | {
        name: string;
        bio: string;
        following: number;
        followers: number;
        totalPosts: number;
        isFollowed: boolean;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
        posts: Array<Post>;
      }
    | number
    | Error
    | CurrentTabScreen
    | null;
}

export interface UserStackState {
  homeTabStack: NavigationStack<UserStackLayer>;
  userTabStack: NavigationStack<UserStackLayer>;
  currentTab: CurrentTabScreen;
  currentLoadingInTab: CurrentTabScreen | '';
}
