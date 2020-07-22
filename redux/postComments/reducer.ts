import {
  PostCommentsState,
  PostCommentsAction,
  FETCH_NEW_COMMENTS_FAILURE,
  FETCH_NEW_COMMENTS_STARTED,
  FETCH_NEW_COMMENTS_SUCCESS,
} from './types';
import { PostStack, PostComment } from '../../models';

const initialState: PostCommentsState = {
  stack: new PostStack(),
};

export default function postCommentsReducer(
  state = initialState,
  action: PostCommentsAction,
): PostCommentsState {
  switch (action.type) {
    case FETCH_NEW_COMMENTS_STARTED: {
      const newState = { ...state };
      const postLayer = {
        postID: action.payload as string,
        loading: true,
        error: null,
        lastVisible: 0,
        commentList: [],
      };
      const newStack = PostStack.clone(state.stack);
      newStack.push(postLayer);
      newState.stack = newStack;
      return newState;
    }
    case FETCH_NEW_COMMENTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        lastVisible: number;
        commentList: Array<PostComment>;
      };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.loading = false;
        topLayer.commentList = payload.commentList;
        topLayer.lastVisible = payload.lastVisible;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case FETCH_NEW_COMMENTS_FAILURE: {
      const newState = { ...state };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.loading = false;
        topLayer.commentList = [];
        topLayer.lastVisible = 0;
        topLayer.error = action.payload as Error;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    default:
      return state;
  }
}
