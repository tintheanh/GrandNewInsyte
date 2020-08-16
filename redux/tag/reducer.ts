import { DispatchTypes, TagState, TagAction } from './types';
import { FirebaseFirestoreTypes } from '../../config';
import { UserResult } from '../../models';

const initialState: TagState = {
  createPost: {
    loading: false,
    users: [],
    lastVisible: null,
    error: null,
    selected: [],
  },
};

export default function tagReducer(
  state = initialState,
  action: TagAction,
): TagState {
  switch (action.type) {
    case DispatchTypes.FETCH_NEW_TAG_USER_RESULTS_STARTED:
    case DispatchTypes.FETCH_MORE_TAG_USER_RESULTS_STARTED: {
      const newState = { ...state };
      newState.createPost.loading = true;
      return newState;
    }
    case DispatchTypes.FETCH_MORE_TAG_USER_RESULTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        users: Array<UserResult>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };

      newState.createPost.error = null;
      newState.createPost.loading = false;
      if (payload.lastVisible) {
        newState.createPost.lastVisible = payload.lastVisible;
      }

      const mergedUsers = newState.createPost.users.concat(payload.users);
      const filteredSelected = mergedUsers.filter(
        (result) => !newState.createPost.selected.includes(result.id),
      );

      newState.createPost.users = filteredSelected;
      return newState;
    }

    case DispatchTypes.FETCH_NEW_TAG_USER_RESULTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        users: Array<UserResult>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      newState.createPost.error = null;
      newState.createPost.loading = false;
      newState.createPost.lastVisible = payload.lastVisible;

      const filteredSelected = payload.users.filter(
        (result) => !newState.createPost.selected.includes(result.id),
      );

      newState.createPost.users = filteredSelected;
      return newState;
    }
    case DispatchTypes.FETCH_NEW_TAG_USER_RESULTS_FAILURE:
    case DispatchTypes.FETCH_MORE_TAG_USER_RESULTS_FAILURE: {
      const newState = { ...state };
      newState.createPost.loading = false;
      newState.createPost.lastVisible = null;
      newState.createPost.users = [];
      return newState;
    }
    case DispatchTypes.SET_SELECTED_USER_RESULTS: {
      const newState = { ...state };
      newState.createPost.selected = action.payload as Array<string>;
      return newState;
    }
    case DispatchTypes.CLEAR_BUT_KEEP_SELECTED: {
      return {
        createPost: {
          loading: false,
          users: [],
          lastVisible: null,
          error: null,
          selected: [...state.createPost.selected],
        },
      };
    }
    case DispatchTypes.CLEAR_ALL: {
      return {
        createPost: {
          loading: false,
          users: [],
          lastVisible: null,
          error: null,
          selected: [],
        },
      };
    }
    default:
      return state;
  }
}
