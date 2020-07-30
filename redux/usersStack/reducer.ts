import {
  POP_USERS_LAYER,
  PUSH_USERS_LAYER,
  SET_CURRENT_TAB,
  FETCH_USER_FAILURE,
  FETCH_USER_STARTED,
  FETCH_USER_SUCCESS,
  CurrentTab,
  UsersStackAction,
  UsersStackState,
} from './types';
import { UsersStack } from '../../models';
import { getCurrentUnixTime } from '../../utils/functions';

const initialState: UsersStackState = {
  homeTabStack: new UsersStack(),
  userTabStack: new UsersStack(),
  currentTab: 'homeTabStack',
};

export default function commentsStackReducer(
  state = initialState,
  action: UsersStackAction,
): UsersStackState {
  switch (action.type) {
    case SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTab;
      return newState;
    }
    case PUSH_USERS_LAYER: {
      const newState = { ...state };
      const payload = action.payload as {
        id: string;
        username: string;
        avatar: string;
      };
      const currentTab = state.currentTab;
      const usersLayer = {
        id: payload.id,
        username: payload.username,
        name: '',
        avatar: payload.avatar,
        bio: '',
        following: 0,
        followers: 0,
        totalPosts: 0,
        isFollowed: false,
        error: null,
        loading: false,
        lastVisible: getCurrentUnixTime(),
        posts: [],
      };
      const newStack = UsersStack.clone(state[currentTab]);
      newStack.push(usersLayer);
      newState[currentTab] = newStack;
      return newState;
    }
    case FETCH_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = UsersStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = true;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_USER_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = UsersStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.error = null;
        topLayer.name = action.payload.name;
        topLayer.bio = action.payload.bio;
        topLayer.followers = action.payload.followers;
        topLayer.following = action.payload.following;
        topLayer.totalPosts = action.payload.totalPosts;
        topLayer.isFollowed = action.payload.isFollowed;
        topLayer.lastVisible = action.payload.lastVisible;
        topLayer.posts = action.payload.posts;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = UsersStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.error = action.payload as Error;
      }
      return newState;
    }
    case POP_USERS_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = UsersStack.clone(state[currentTab]);
      newStack.pop();
      newState[currentTab] = newStack;
      return newState;
    }
    default:
      return state;
  }
}
