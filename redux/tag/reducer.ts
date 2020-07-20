import {
  FETCH_USER_RESULTS_FAILURE,
  FETCH_USER_RESULTS_STARTED,
  FETCH_USER_RESULTS_SUCCESS,
  FETCH_USER_RESULTS_END,
  FETCH_NEW_USER_RESULTS_END,
  FETCH_NEW_USER_RESULTS_FAILURE,
  FETCH_NEW_USER_RESULTS_STARTED,
  FETCH_NEW_USER_RESULTS_SUCCESS,
  CLEAR,
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
      const filterDuplicates = removeDuplicatesFromUserResultsArray(newUsers);
      newState.createPost.error = null;
      newState.createPost.loading = false;
      newState.createPost.lastVisible = payload.lastVisible;
      newState.createPost.users = filterDuplicates;
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
      const filterDuplicates = removeDuplicatesFromUserResultsArray(
        payload.users,
      );
      newState.createPost.error = null;
      newState.createPost.loading = false;
      newState.createPost.lastVisible = payload.lastVisible;
      newState.createPost.users = filterDuplicates;
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
    case CLEAR: {
      return {
        createPost: {
          loading: false,
          users: [],
          lastVisible: null,
          error: null,
        },
      };
    }
    default:
      return state;
  }
}
