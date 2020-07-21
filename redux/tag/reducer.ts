import {
  FETCH_USER_RESULTS_FAILURE,
  FETCH_USER_RESULTS_STARTED,
  FETCH_USER_RESULTS_SUCCESS,
  FETCH_USER_RESULTS_END,
  FETCH_NEW_USER_RESULTS_END,
  FETCH_NEW_USER_RESULTS_FAILURE,
  FETCH_NEW_USER_RESULTS_STARTED,
  FETCH_NEW_USER_RESULTS_SUCCESS,
  SET_SELECTED_USER_RESULTS,
  CLEAR_BUT_KEEP_SELECTED,
  CLEAR_ALL,
  TagState,
  TagAction,
} from './types';
import { FirebaseFirestoreTypes } from '../../config';
import { removeDuplicatesFromUserResultsArray } from '../../utils/functions';

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
    case FETCH_NEW_USER_RESULTS_STARTED:
    case FETCH_USER_RESULTS_STARTED: {
      const newState = { ...state };
      newState.createPost.loading = true;
      newState.createPost.error = null;
      return newState;
    }
    case FETCH_USER_RESULTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        users: Array<{
          id: string;
          avatar: string;
          username: string;
          name: string;
        }>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      const users = [...state.createPost.users];
      const newUsers = users.concat(payload.users);
      const removedDuplicates = removeDuplicatesFromUserResultsArray(newUsers);
      const filteredSelected = removedDuplicates.filter(
        (result) => !newState.createPost.selected.includes(result.id),
      );

      newState.createPost.error = null;
      newState.createPost.loading = false;
      newState.createPost.lastVisible = payload.lastVisible;
      newState.createPost.users = filteredSelected;
      return newState;
    }
    case FETCH_NEW_USER_RESULTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        users: Array<{
          id: string;
          avatar: string;
          username: string;
          name: string;
        }>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      const removedDuplicates = removeDuplicatesFromUserResultsArray(
        payload.users,
      );
      const filteredSelected = removedDuplicates.filter(
        (result) => !newState.createPost.selected.includes(result.id),
      );
      newState.createPost.error = null;
      newState.createPost.loading = false;
      newState.createPost.lastVisible = payload.lastVisible;
      newState.createPost.users = filteredSelected;
      return newState;
    }
    case FETCH_USER_RESULTS_END: {
      const newState = { ...state };
      newState.createPost.loading = false;
      return newState;
    }
    case FETCH_NEW_USER_RESULTS_END: {
      const newState = { ...state };
      newState.createPost.loading = false;
      newState.createPost.users = [];
      return newState;
    }
    case FETCH_NEW_USER_RESULTS_FAILURE:
    case FETCH_USER_RESULTS_FAILURE: {
      const newState = { ...state };
      newState.createPost.loading = false;
      newState.createPost.lastVisible = null;
      newState.createPost.users = [];
      return newState;
    }
    case SET_SELECTED_USER_RESULTS: {
      const newState = { ...state };
      newState.createPost.selected = action.payload as Array<string>;
      return newState;
    }
    case CLEAR_BUT_KEEP_SELECTED: {
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
    case CLEAR_ALL: {
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
