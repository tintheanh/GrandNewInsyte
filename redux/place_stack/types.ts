import {
  NavigationStack,
  CurrentTabScreen,
  PlaceStackLayer,
  PlaceCategory,
  Post,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SET_CURRENT_TAB = 'SET_CURRENT_TAB',
  SET_CURRENT_VIEWABLE_OWNPOST_INDEX = 'SET_CURRENT_VIEWABLE_OWNPOST_INDEX',
  SET_CURRENT_VIEWABLE_CHECKINPOST_INDEX = 'SET_CURRENT_VIEWABLE_CHECKINPOST_INDEX',
  PUSH_PLACE_LAYER = 'PUSH_PLACE_LAYER',
  POP_PLACE_LAYER = 'POP_PLACE_LAYER',
  CLEAR_STACK = 'CLEAR_STACK',
  RESET_ALL_STACKS = 'RESET_ALL_STACKS',
  CLEAR_ERROR = 'CLEAR_ERROR',

  FETCH_PLACE_STARTED = 'FETCH_PLACE_STARTED',
  FETCH_PLACE_SUCCESS = 'FETCH_PLACE_SUCCESS',
  FETCH_PLACE_FAILURE = 'FETCH_PLACE_FAILURE',

  FOLLOW_PLACE_STARTED = 'FOLLOW_PLACE_STARTED',
  FOLLOW_PLACE_SUCCESS = 'FOLLOW_PLACE_SUCCESS',
  FOLLOW_PLACE_FAILURE = 'FOLLOW_PLACE_FAILURE',

  UNFOLLOW_PLACE_STARTED = 'UNFOLLOW_PLACE_STARTED',
  UNFOLLOW_PLACE_SUCCESS = 'UNFOLLOW_PLACE_SUCCESS',
  UNFOLLOW_PLACE_FAILURE = 'UNFOLLOW_PLACE_FAILURE',

  FETCH_MORE_POSTS_FROM_PLACE_STARTED = 'FETCH_MORE_POSTS_FROM_PLACE_STARTED',
  FETCH_MORE_POSTS_FROM_PLACE_SUCCESS = 'FETCH_MORE_POSTS_FROM_PLACE_SUCCESS',
  FETCH_MORE_POSTS_FROM_PLACE_FAILURE = 'FETCH_MORE_POSTS_FROM_PLACE_FAILURE',
}

export interface PlaceStackAction {
  type: string;
  payload:
    | {
        placeID: string;
        name: string;
        avatar: string;
      }
    | {
        avatar: string;
        name: string;
        bio: string;
        category: PlaceCategory;
        address: string;
        openTime: Array<string>;
        followers: number;
        following: number;
        totalPosts: number;
        isFollowed: boolean;
        isOpen: boolean;
        distance: number;
        location: {
          lat: number;
          lng: number;
        };
        lastOwnPostVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
        lastCheckinPostVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
        ownPosts: Array<Post>;
        checkinPosts: Array<Post>;
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
