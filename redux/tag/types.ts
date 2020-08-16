import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  SET_SELECTED_USER_RESULTS = 'SET_SELECTED_USER_RESULTS',
  CLEAR_BUT_KEEP_SELECTED = 'CLEAR_BUT_KEEP_SELECTED',
  CLEAR_ALL = 'CLEAR_ALL',

  FETCH_NEW_TAG_USER_RESULTS_STARTED = 'FETCH_NEW_TAG_USER_RESULTS_STARTED',
  FETCH_NEW_TAG_USER_RESULTS_SUCCESS = 'FETCH_NEW_TAG_USER_RESULTS_SUCCESS',
  FETCH_NEW_TAG_USER_RESULTS_FAILURE = 'FETCH_NEW_TAG_USER_RESULTS_FAILURE',

  FETCH_MORE_TAG_USER_RESULTS_STARTED = 'FETCH_MORE_TAG_USER_RESULTS_STARTED',
  FETCH_MORE_TAG_USER_RESULTS_SUCCESS = 'FETCH_MORE_TAG_USER_RESULTS_SUCCESS',
  FETCH_MORE_TAG_USER_RESULTS_FAILURE = 'FETCH_MORE_TAG_USER_RESULTS_FAILURE',
}

export interface TagAction {
  type: string;
  payload:
    | {
        users: Array<{
          id: string;
          avatar: string;
          username: string;
          name: string;
        }>;
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
      }
    | Array<string>
    | Error
    | null;
}

export interface TagState {
  createPost: {
    loading: boolean;
    users: Array<{
      id: string;
      avatar: string;
      username: string;
      name: string;
    }>;
    selected: Array<string>;
    lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
    error: Error | null;
  };
}
