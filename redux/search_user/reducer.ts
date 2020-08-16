import { DispatchTypes, SearchUserAction, SearchUserState } from './types';
import { FirebaseFirestoreTypes } from '../../config';
import { UserResult } from '../../models';

const initialState: SearchUserState = {
  results: [],
  lastVisible: null,
  loading: false,
  error: null,
};

export default function searchUserReducer(
  state = initialState,
  action: SearchUserAction,
): SearchUserState {
  const untouchedState: SearchUserState = {
    results: [],
    lastVisible: null,
    loading: false,
    error: null,
  };
  switch (action.type) {
    case DispatchTypes.CLEAR_SEARCH_USER:
      return untouchedState;
    case DispatchTypes.FETCH_NEW_USER_RESULTS_STARTED:
    case DispatchTypes.FETCH_MORE_USER_RESULTS_STARTED: {
      const newState = { ...state };
      newState.loading = true;
      return newState;
    }
    case DispatchTypes.FETCH_NEW_USER_RESULTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        results: Array<UserResult>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      newState.loading = false;
      newState.error = null;
      newState.results = payload.results;
      newState.lastVisible = payload.lastVisible;
      return newState;
    }
    case DispatchTypes.FETCH_MORE_USER_RESULTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        results: Array<UserResult>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      };
      newState.loading = false;
      newState.error = null;
      newState.results = newState.results.concat(payload.results);
      if (payload.lastVisible) {
        newState.lastVisible = payload.lastVisible;
      }
      return newState;
    }
    case DispatchTypes.FETCH_NEW_USER_RESULTS_FAILURE:
    case DispatchTypes.FETCH_MORE_USER_RESULTS_FAILURE: {
      const newState = { ...state };
      newState.loading = false;
      newState.results = [];
      newState.error = action.payload as Error;
      return newState;
    }
    default:
      return state;
  }
}
