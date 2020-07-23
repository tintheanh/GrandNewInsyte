import {
  PostCommentsState,
  PostCommentsAction,
  FETCH_NEW_COMMENTS_FAILURE,
  FETCH_NEW_COMMENTS_STARTED,
  FETCH_NEW_COMMENTS_SUCCESS,
  FETCH_TOP_COMMENTS_END,
  FETCH_TOP_COMMENTS_FAILURE,
  FETCH_TOP_COMMENTS_STARTED,
  FETCH_TOP_COMMENTS_SUCCESS,
  PUSH_POSTLAYER,
  POP_POSTLAYER,
  FETCH_NEW_COMMENTS_END,
  SET_SORT_COMMENTS,
  CLEAR_STACK,
} from './types';
import { PostStack, PostComment } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { removeDuplicatesFromCommentsArray } from '../../utils/functions';

const initialState: PostCommentsState = {
  stack: new PostStack(),
};

export default function postCommentsReducer(
  state = initialState,
  action: PostCommentsAction,
): PostCommentsState {
  switch (action.type) {
    case FETCH_NEW_COMMENTS_STARTED:
    case FETCH_TOP_COMMENTS_STARTED: {
      const newState = { ...state };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.loading = true;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case FETCH_NEW_COMMENTS_SUCCESS:
    case FETCH_TOP_COMMENTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        commentList: Array<PostComment>;
      };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.loading = false;
        const newCommentList = topLayer.commentList.concat(payload.commentList);
        const removedDuplicates = removeDuplicatesFromCommentsArray(
          newCommentList,
        );
        topLayer.commentList = removedDuplicates;
        topLayer.lastVisible = payload.lastVisible;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case FETCH_NEW_COMMENTS_FAILURE:
    case FETCH_TOP_COMMENTS_FAILURE: {
      const newState = { ...state };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.loading = false;
        topLayer.commentList = [];
        topLayer.lastVisible = null;
        topLayer.error = action.payload as Error;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case FETCH_NEW_COMMENTS_END:
    case FETCH_TOP_COMMENTS_END: {
      const newState = { ...state };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.loading = false;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case PUSH_POSTLAYER: {
      const newState = { ...state };
      const postLayer = {
        postID: action.payload as string,
        loading: false,
        error: null,
        lastVisible: null,
        type: 'new' as 'new',
        commentList: [],
      };
      const newStack = PostStack.clone(state.stack);
      newStack.push(postLayer);
      newState.stack = newStack;
      return newState;
    }
    case POP_POSTLAYER: {
      const newState = { ...state };
      const newStack = PostStack.clone(state.stack);
      newStack.pop();
      newState.stack = newStack;
      return newState;
    }
    case SET_SORT_COMMENTS: {
      const newState = { ...state };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.type = action.payload as 'new' | 'top';
        topLayer.error = null;
        topLayer.lastVisible = null;
        topLayer.commentList = [];
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case CLEAR_STACK: {
      const newState = { ...state };
      newState.stack = new PostStack();
      return newState;
    }
    default:
      return state;
  }
}
