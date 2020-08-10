import { DispatchTypes, UsersStackAction, UsersStackState } from './types';
import {
  Post,
  CurrentTabScreen,
  NavigationStack,
  UsersStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { removeDuplicatesFromArray } from '../../utils/functions';

const initialState: UsersStackState = {
  homeTabStack: new NavigationStack<UsersStackLayer>(),
  userTabStack: new NavigationStack<UsersStackLayer>(),
  currentTab: 'homeTabStack',
};

export default function commentsStackReducer(
  state = initialState,
  action: UsersStackAction,
): UsersStackState {
  switch (action.type) {
    case DispatchTypes.SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTabScreen;
      return newState;
    }
    case DispatchTypes.SET_CURRENT_VIEWABLE_POST_INDEX: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = state[currentTab].top();
      if (topLayer) {
        topLayer.currentViewableIndex = action.payload as number;
        state[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.PUSH_USERS_LAYER: {
      const newState = { ...state };
      const payload = action.payload as {
        userID: string;
        username: string;
        avatar: string;
      };
      const currentTab = state.currentTab;
      const usersLayer = {
        userID: payload.userID,
        username: payload.username,
        name: '',
        avatar: payload.avatar,
        bio: '',
        following: 0,
        followers: 0,
        totalPosts: 0,
        isFollowed: false,
        errors: {
          fetchError: null,
          followError: null,
          unfollowError: null,
        },
        loading: false,
        lastVisible: null,
        currentViewableIndex: 0,
        posts: [],
      };
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      newStack.push(usersLayer);
      newState[currentTab] = newStack;
      return newState;
    }
    case DispatchTypes.FETCH_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = true;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FETCH_USER_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = null;
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
    case DispatchTypes.FETCH_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = action.payload as Error;
      }
      return newState;
    }
    case DispatchTypes.FETCH_MORE_POSTS_FROM_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = true;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FETCH_MORE_POSTS_FROM_USER_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = null;
        topLayer.posts = topLayer.posts.concat(payload.posts);
        topLayer.lastVisible = payload.lastVisible;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FETCH_MORE_POSTS_FROM_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = action.payload as Error;
        topLayer.posts = [];
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FOLLOW_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.isFollowed = true;
        topLayer.followers += 1;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FOLLOW_USER_SUCCESS: {
      return state;
    }
    case DispatchTypes.FOLLOW_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.followError = action.payload as Error;
        topLayer.isFollowed = false;
        topLayer.followers -= 1;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.UNFOLLOW_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.isFollowed = false;
        topLayer.followers -= 1;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.UNFOLLOW_USER_SUCCESS: {
      return state;
    }
    case DispatchTypes.UNFOLLOW_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.unfollowError = action.payload as Error;
        topLayer.isFollowed = true;
        topLayer.followers += 1;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.POP_USERS_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<UsersStackLayer>;
      newStack.pop();
      newState[currentTab] = newStack;
      return newState;
    }
    case DispatchTypes.CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new NavigationStack<UsersStackLayer>();
      return newState;
    }
    default:
      return state;
  }
}
