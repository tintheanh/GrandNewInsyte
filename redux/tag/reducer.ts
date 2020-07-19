import {
  CREATE_POST_TAG_FAILURE,
  CREATE_POST_TAG_STARTED,
  CREATE_POST_TAG_SUCCESS,
  CREATE_POST_TAG_END,
  CREATE_POST_TAG_NEW_END,
  CREATE_POST_TAG_NEW_FAILURE,
  CREATE_POST_TAG_NEW_STARTED,
  CREATE_POST_TAG_NEW_SUCCESS,
  TagState,
  TagAction,
} from './types';
import { FirebaseFirestoreTypes } from '../../config';

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
    case CREATE_POST_TAG_NEW_STARTED:
    case CREATE_POST_TAG_STARTED: {
      const newState = { ...state };
      newState.createPost.loading = true;
      newState.createPost.error = null;
      return newState;
    }
    case CREATE_POST_TAG_SUCCESS: {
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
      newState.createPost.error = null;
      newState.createPost.loading = false;
      newState.createPost.lastVisible = payload.lastVisible;
      newState.createPost.users = newUsers;
      return newState;
    }
    case CREATE_POST_TAG_NEW_SUCCESS: {
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
      newState.createPost.error = null;
      newState.createPost.loading = false;
      newState.createPost.lastVisible = payload.lastVisible;
      newState.createPost.users = payload.users;
      return newState;
    }
    case CREATE_POST_TAG_END: {
      const newState = { ...state };
      newState.createPost.loading = false;
      return newState;
    }
    case CREATE_POST_TAG_NEW_END: {
      const newState = { ...state };
      newState.createPost.loading = false;
      newState.createPost.users = [];
      return newState;
    }
    case CREATE_POST_TAG_NEW_FAILURE:
    case CREATE_POST_TAG_FAILURE: {
      const newState = { ...state };
      newState.createPost.loading = false;
      newState.createPost.lastVisible = null;
      newState.createPost.users = [];
      return newState;
    }

    default:
      return state;
  }
}
