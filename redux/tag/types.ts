import { FirebaseFirestoreTypes } from '../../config';

export const CREATE_POST_TAG_STARTED = 'CREATE_POST_TAG_STARTED';
export const CREATE_POST_TAG_SUCCESS = 'CREATE_POST_TAG_SUCCESS';
export const CREATE_POST_TAG_FAILURE = 'CREATE_POST_TAG_FAILURE';
export const CREATE_POST_TAG_END = 'CREATE_POST_TAG_END';

export const CREATE_POST_TAG_NEW_STARTED = 'CREATE_POST_TAG_NEW_STARTED';
export const CREATE_POST_TAG_NEW_SUCCESS = 'CREATE_POST_TAG_NEW_SUCCESS';
export const CREATE_POST_TAG_NEW_FAILURE = 'CREATE_POST_TAG_NEW_FAILURE';
export const CREATE_POST_TAG_NEW_END = 'CREATE_POST_TAG_NEW_END';

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
