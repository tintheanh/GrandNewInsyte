import {
  PostCommentsState,
  PostCommentsAction,
  FETCH_COMMENTS_FAILURE,
  FETCH_COMMENTS_STARTED,
  FETCH_COMMENTS_SUCCESS,
  PUSH_POSTLAYER,
  POP_POSTLAYER,
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
    case FETCH_COMMENTS_STARTED: {
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
    case FETCH_COMMENTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        lastVisible: number;
        commentList: Array<PostComment>;
      };
      const topLayer = state.stack.top();
      if (topLayer) {
        const newStack = PostStack.clone(state.stack);
        topLayer.loading = false;
        topLayer.commentList = topLayer.commentList.concat(payload.commentList);
        topLayer.lastVisible = payload.lastVisible;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case FETCH_COMMENTS_FAILURE: {
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
    case PUSH_POSTLAYER: {
      const newState = { ...state };
      const postLayer = {
        postID: action.payload as string,
        loading: false,
        error: null,
        lastVisible: 0,
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
    default:
      return state;
  }
}
