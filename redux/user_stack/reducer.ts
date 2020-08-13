import { DispatchTypes, UserStackAction, UserStackState } from './types';
import {
  Post,
  CurrentTabScreen,
  NavigationStack,
  UserStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

const initialState: UserStackState = {
  homeTabStack: new NavigationStack<UserStackLayer>(),
  userTabStack: new NavigationStack<UserStackLayer>(),
  currentTab: 'homeTabStack',
  currentLoadingInTab: '',
};

const untouchedState: UserStackState = {
  homeTabStack: new NavigationStack<UserStackLayer>(),
  userTabStack: new NavigationStack<UserStackLayer>(),
  currentTab: 'homeTabStack',
  currentLoadingInTab: '',
};

export default function commentsStackReducer(
  state = initialState,
  action: UserStackAction,
): UserStackState {
  switch (action.type) {
    /* -------------------- utility cases ------------------- */

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
      newState[currentTab].push(usersLayer);
      return newState;
    }
    case DispatchTypes.POP_USERS_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab].pop();
      return newState;
    }
    case DispatchTypes.CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new NavigationStack<UserStackLayer>();
      return newState;
    }
    case DispatchTypes.CLEAR_FOLLOW_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.errors.followError = null;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_UNFOLLOW_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.errors.unfollowError = null;
      }
      return newState;
    }
    case DispatchTypes.RESET_ALL_STACKS:
      return untouchedState;

    /* ------------------ end utility cases ----------------- */

    /* ------------------ fetch user cases ------------------ */

    case DispatchTypes.FETCH_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.loading = true;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.FETCH_USER_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        name: string;
        bio: string;
        following: number;
        followers: number;
        totalPosts: number;
        isFollowed: boolean;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
        posts: Array<Post>;
      };
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = null;
        topLayer.name = payload.name;
        topLayer.bio = payload.bio;
        topLayer.followers = payload.followers;
        topLayer.following = payload.following;
        topLayer.totalPosts = payload.totalPosts;
        topLayer.isFollowed = payload.isFollowed;
        topLayer.lastVisible = payload.lastVisible;
        topLayer.posts = payload.posts;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = '';
      }
      return newState;
    }
    case DispatchTypes.FETCH_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = action.payload as Error;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = '';
      }
      return newState;
    }

    /* ---------------- end fetch user cases ---------------- */

    /* ------------- fetch more user posts cases ------------ */

    case DispatchTypes.FETCH_MORE_POSTS_FROM_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.loading = true;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.FETCH_MORE_POSTS_FROM_USER_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = null;
        topLayer.posts = topLayer.posts.concat(payload.posts);
        topLayer.lastVisible = payload.lastVisible;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = '';
      }
      return newState;
    }
    case DispatchTypes.FETCH_MORE_POSTS_FROM_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = action.payload as Error;
        topLayer.posts = [];
        topLayer.lastVisible = null;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = '';
      }
      return newState;
    }

    /* ----------- end fetch more user posts cases ---------- */

    /* ------------------ follow user cases ----------------- */

    case DispatchTypes.FOLLOW_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.isFollowed = true;
        topLayer.followers += 1;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.FOLLOW_USER_SUCCESS: {
      return state;
    }
    case DispatchTypes.FOLLOW_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.errors.followError = action.payload as Error;
        topLayer.isFollowed = false;
        topLayer.followers -= 1;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = '';
      }
      return newState;
    }

    /* ---------------- end follow user cases --------------- */

    /* ------------------- unfollow cases ------------------- */

    case DispatchTypes.UNFOLLOW_USER_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.isFollowed = false;
        topLayer.followers -= 1;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.UNFOLLOW_USER_SUCCESS: {
      return state;
    }
    case DispatchTypes.UNFOLLOW_USER_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[currentTab].top();
      if (topLayer) {
        topLayer.errors.unfollowError = action.payload as Error;
        topLayer.isFollowed = true;
        topLayer.followers += 1;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = '';
      }
      return newState;
    }

    /* ----------------- end unfollow cases ----------------- */

    default:
      return state;
  }
}
