import { FirebaseFirestoreTypes } from '../../config';

export const FETCH_USER_RESULTS_STARTED = 'FETCH_USER_RESULTS_STARTED';
export const FETCH_USER_RESULTS_SUCCESS = 'FETCH_USER_RESULTS_SUCCESS';
export const FETCH_USER_RESULTS_FAILURE = 'FETCH_USER_RESULTS_FAILURE';
export const FETCH_USER_RESULTS_END = 'FETCH_USER_RESULTS_END';

export const FETCH_NEW_USER_RESULTS_STARTED = 'FETCH_NEW_USER_RESULTS_STARTED';
export const FETCH_NEW_USER_RESULTS_SUCCESS = 'FETCH_NEW_USER_RESULTS_SUCCESS';
export const FETCH_NEW_USER_RESULTS_FAILURE = 'FETCH_NEW_USER_RESULTS_FAILURE';
export const FETCH_NEW_USER_RESULTS_END = 'FETCH_NEW_USER_RESULTS_END';

export const CLEAR = 'CLEAR';

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
    lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
    error: Error | null;
  };
}
