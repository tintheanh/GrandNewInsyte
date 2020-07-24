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
  CREATE_COMMENT_FAILURE,
  CREATE_COMMENT_STARTED,
  CREATE_COMMENT_SUCCESS,
  LIKE_COMMENT_FAILURE,
  LIKE_COMMENT_STARTED,
  LIKE_COMMENT_SUCCESS,
  UNLIKE_COMMENT_FAILURE,
  UNLIKE_COMMENT_STARTED,
  UNLIKE_COMMENT_SUCCESS,
  CLEAR_CREATE_COMMENT_ERROR,
  CLEAR_INTERACT_COMMENT_ERROR,
  PUSH_POSTLAYER,
  POP_POSTLAYER,
  FETCH_NEW_COMMENTS_END,
  SET_SORT_COMMENTS,
  CLEAR_STACK,
} from './types';
import { PostStack, PostComment } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { pendingCommentID } from '../../constants';
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
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
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
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        const newCommentList = topLayer.commentList.concat(payload.commentList);
        const removedDuplicates = removeDuplicatesFromCommentsArray(
          newCommentList,
        );
        if (topLayer.type === 'new') {
          removedDuplicates.sort((a, b) => a.datePosted - b.datePosted);
        } else {
          removedDuplicates.sort((b, a) => a.likes - b.likes);
        }
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
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
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
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case CREATE_COMMENT_STARTED: {
      const newState = { ...state };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createCommentLoading = true;
        topLayer.createCommentError = null;
        const filteredPending = topLayer.commentList.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        filteredPending.push(action.payload as PostComment);
        topLayer.commentList = filteredPending;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case CREATE_COMMENT_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        newComment: PostComment;
        postID: string;
      };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer && topLayer.postID === payload.postID) {
        topLayer.createCommentLoading = false;
        topLayer.error = null;
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === pendingCommentID,
        );
        if (index !== -1) {
          topLayer.commentList[index] = payload.newComment;
        }
        const filteredPending = topLayer.commentList.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        const removedDuplicates = removeDuplicatesFromCommentsArray(
          filteredPending,
        );
        topLayer.commentList = removedDuplicates;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case CREATE_COMMENT_FAILURE: {
      const newState = { ...state };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createCommentLoading = false;
        topLayer.createCommentError = action.payload as Error;
        const filteredPending = topLayer.commentList.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        topLayer.commentList = filteredPending;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case LIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.commentList[index].likes += 1;
          topLayer.commentList[index].isLiked = true;
        }
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case LIKE_COMMENT_SUCCESS: {
      return state;
    }
    case LIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const payload = action.payload as {
        commentID: string;
        error: Error | null;
      };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        if (payload.commentID.length) {
          const index = topLayer.commentList.findIndex(
            (comment) => comment.id === payload.commentID,
          );
          if (index !== -1) {
            topLayer.commentList[index].likes -= 1;
            topLayer.commentList[index].isLiked = false;
          }
        }
        topLayer.interactCommentError = payload.error;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case UNLIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.commentList[index].likes -= 1;
          topLayer.commentList[index].isLiked = false;
        }
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case UNLIKE_COMMENT_SUCCESS: {
      return state;
    }
    case UNLIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const payload = action.payload as {
        commentID: string;
        error: Error | null;
      };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        if (payload.commentID.length) {
          const index = topLayer.commentList.findIndex(
            (comment) => comment.id === payload.commentID,
          );
          if (index !== -1) {
            topLayer.commentList[index].likes += 1;
            topLayer.commentList[index].isLiked = true;
          }
        }
        topLayer.interactCommentError = payload.error;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case CLEAR_CREATE_COMMENT_ERROR: {
      const newState = { ...state };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createCommentError = null;
        newStack.updateTop(topLayer);
        newState.stack = newStack;
      }
      return newState;
    }
    case CLEAR_INTERACT_COMMENT_ERROR: {
      const newState = { ...state };
      const newStack = PostStack.clone(state.stack);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.interactCommentError = null;
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
        createCommentLoading: false,
        error: null,
        createCommentError: null,
        interactCommentError: null,
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
