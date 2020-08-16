import { UserResult } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

export enum DispatchTypes {
  CLEAR_SEARCH_USER = 'CLEAR_SEARCH_USER',

  FETCH_NEW_USER_RESULTS_STARTED = 'FETCH_NEW_USER_RESULTS_STARTED',
  FETCH_NEW_USER_RESULTS_SUCCESS = 'FETCH_NEW_USER_RESULTS_SUCCESS',
  FETCH_NEW_USER_RESULTS_FAILURE = 'FETCH_NEW_USER_RESULTS_FAILURE',

  FETCH_MORE_USER_RESULTS_STARTED = 'FETCH_MORE_USER_RESULTS_STARTED',
  FETCH_MORE_USER_RESULTS_SUCCESS = 'FETCH_MORE_USER_RESULTS_SUCCESS',
  FETCH_MORE_USER_RESULTS_FAILURE = 'FETCH_MORE_USER_RESULTS_FAILURE',
}

export interface SearchUserAction {
  type: string;
  payload: any;
}

export interface SearchUserState {
  results: Array<UserResult>;
  error: Error | null;
  loading: boolean;
  lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
}
