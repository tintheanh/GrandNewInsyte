import { DispatchTypes, PlaceStackAction, PlaceStackState } from './types';
import {
  Post,
  CurrentTabScreen,
  NavigationStack,
  PlaceStackLayer,
  PlaceCategory,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

const initialState: PlaceStackState = {
  homeTabStack: new NavigationStack<PlaceStackLayer>(),
  userTabStack: new NavigationStack<PlaceStackLayer>(),
  placeTabStack: new NavigationStack<PlaceStackLayer>(),
  currentTab: 'homeTabStack',
  currentLoadingInTab: '',
};

export default function placeStackReducer(
  state = initialState,
  action: PlaceStackAction,
): PlaceStackState {
  const untouchedState: PlaceStackState = {
    homeTabStack: new NavigationStack<PlaceStackLayer>(),
    userTabStack: new NavigationStack<PlaceStackLayer>(),
    placeTabStack: new NavigationStack<PlaceStackLayer>(),
    currentTab: 'homeTabStack',
    currentLoadingInTab: '',
  };

  switch (action.type) {
    /* -------------------- utility cases ------------------- */

    case DispatchTypes.SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTabScreen;
      return newState;
    }
    case DispatchTypes.SET_CURRENT_VIEWABLE_OWNPOST_INDEX: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = state[currentTab].top();
      if (topLayer) {
        topLayer.currentViewableOwnPostIndex = action.payload as number;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.SET_CURRENT_VIEWABLE_CHECKINPOST_INDEX: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = state[currentTab].top();
      if (topLayer) {
        topLayer.currentViewableCheckinPostIndex = action.payload as number;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.PUSH_PLACE_LAYER: {
      const newState = { ...state };
      const payload = action.payload as {
        placeID: string;
        name: string;
        avatar: string;
      };
      const currentTab = state.currentTab;
      const placeLayer = {
        placeID: payload.placeID,
        placeData: {
          id: payload.placeID,
          avatar: payload.avatar,
          name: payload.name,
          bio: '',
          category: 'bar' as PlaceCategory,
          location: null,
          address: '',
          openTime: [],
          distance: 0,
          isOpen: false,
          isFollowed: false,
          followers: 0,
          following: 0,
          ownPosts: [],
          checkinPosts: [],
        },
        errors: {
          fetchError: null,
          followError: null,
          unfollowError: null,
        },
        loading: false,
        lastOwnPostVisible: null,
        lastCheckinPostVisible: null,
        currentViewableOwnPostIndex: 0,
        currentViewableCheckinPostIndex: 0,
      };
      newState[currentTab].push(placeLayer);
      return newState;
    }
    case DispatchTypes.POP_PLACE_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab].pop();
      return newState;
    }

    /* ------------------ end utility cases ----------------- */

    /* ------------------ fetch place cases ----------------- */

    case DispatchTypes.FETCH_PLACE_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[currentTab].top() as PlaceStackLayer | null;
      if (topLayer) {
        topLayer.loading = true;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.FETCH_PLACE_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        avatar: string;
        name: string;
        bio: string;
        category: PlaceCategory;
        address: string;
        openTime: Array<string>;
        followers: number;
        following: number;
        isFollowed: boolean;
        totalPosts: number;
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
      };

      const topLayer = newState[
        currentTab
      ].getTopClone() as PlaceStackLayer | null;

      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = null;
        topLayer.placeData.avatar = payload.avatar;
        topLayer.placeData.name = payload.name;
        topLayer.placeData.bio = payload.bio;
        topLayer.placeData.distance = payload.distance;
        topLayer.placeData.address = payload.address;
        topLayer.placeData.followers = payload.followers;
        topLayer.placeData.category = payload.category;
        topLayer.placeData.following = payload.following;
        topLayer.placeData.totalPosts = payload.totalPosts;
        topLayer.placeData.isFollowed = payload.isFollowed;
        topLayer.placeData.isOpen = payload.isOpen;
        topLayer.placeData.openTime = payload.openTime;
        topLayer.placeData.location = payload.location;
        topLayer.lastOwnPostVisible = payload.lastOwnPostVisible;
        topLayer.lastCheckinPostVisible = payload.lastCheckinPostVisible;
        topLayer.placeData.ownPosts = payload.ownPosts;
        topLayer.placeData.checkinPosts = payload.checkinPosts;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.FETCH_PLACE_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[
        currentTab
      ].getTopClone() as PlaceStackLayer | null;
      if (topLayer) {
        topLayer.loading = false;
        topLayer.errors.fetchError = action.payload as Error;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }
    /* ---------------- end fetch place cases --------------- */

    default:
      return state;
  }
}
