import {
  CommentsStackState,
  CommentsStackAction,
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
  DELETE_COMMENT_FAILURE,
  DELETE_COMMENT_STARTED,
  DELETE_COMMENT_SUCCESS,
  CLEAR_CREATE_COMMENT_ERROR,
  CLEAR_INTERACT_COMMENT_ERROR,
  CLEAR_DELETE_COMMENT_ERROR,
  PUSH_COMMENTS_LAYER,
  POP_COMMENTS_LAYER,
  FETCH_NEW_COMMENTS_END,
  SET_SORT_COMMENTS,
  CLEAR_STACK,
  SET_CURRENT_TAB,
  INCREASE_REPLIES_BY_ONE,
  CurrentTab,
} from './types';
import { CommentsStack, Comment } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';

const initialState: CommentsStackState = {
  homeTabStack: new CommentsStack(),
  userTabStack: new CommentsStack(),
  currentTab: 'homeTabStack',
};

export default function commentsStackReducer(
  state = initialState,
  action: CommentsStackAction,
): CommentsStackState {
  switch (action.type) {
    case SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTab;
      return newState;
    }
    case FETCH_NEW_COMMENTS_STARTED:
    case FETCH_TOP_COMMENTS_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = true;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_NEW_COMMENTS_SUCCESS:
    case FETCH_TOP_COMMENTS_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        commentList: Array<Comment>;
      };
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        const newCommentList = topLayer.commentList.concat(payload.commentList);
        const removedDuplicates = removeDuplicatesFromArray(newCommentList);
        if (topLayer.type === 'all') {
          removedDuplicates.sort((a, b) => a.datePosted - b.datePosted);
        } else {
          removedDuplicates.sort((b, a) => a.likes - b.likes);
        }
        topLayer.commentList = removedDuplicates;
        topLayer.lastVisible = payload.lastVisible;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_NEW_COMMENTS_FAILURE:
    case FETCH_TOP_COMMENTS_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.commentList = [];
        topLayer.lastVisible = null;
        topLayer.error = action.payload as Error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_NEW_COMMENTS_END:
    case FETCH_TOP_COMMENTS_END: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CREATE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createCommentLoading = true;
        topLayer.createCommentError = null;
        const filteredPending = topLayer.commentList.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        filteredPending.push(action.payload as Comment);
        topLayer.commentList = filteredPending;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CREATE_COMMENT_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        newComment: Comment;
        postID: string;
      };
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer && topLayer.postID === payload.postID) {
        topLayer.createCommentLoading = false;
        topLayer.createCommentError = null;
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === pendingCommentID,
        );
        if (index !== -1) {
          topLayer.commentList[index] = payload.newComment;
        }
        const filteredPending = topLayer.commentList.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        const removedDuplicates = removeDuplicatesFromArray(filteredPending);
        topLayer.commentList = removedDuplicates;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CREATE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createCommentLoading = false;
        topLayer.createCommentError = action.payload as Error;
        const filteredPending = topLayer.commentList.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        topLayer.commentList = filteredPending;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case LIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
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
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case LIKE_COMMENT_SUCCESS: {
      return state;
    }
    case LIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        commentID: string;
        error: Error | null;
      };
      const newStack = CommentsStack.clone(state[currentTab]);
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
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case UNLIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
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
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case UNLIKE_COMMENT_SUCCESS: {
      return state;
    }
    case UNLIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        commentID: string;
        error: Error | null;
      };
      const newStack = CommentsStack.clone(state[currentTab]);
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
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DELETE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteCommentError = null;
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.commentList[index].id += pendingDeleteCommentFlag;
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DELETE_COMMENT_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteCommentError = null;
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.commentList.splice(index, 1);
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DELETE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        commentIDwithFlag: string;
        error: Error;
      };
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteCommentError = payload.error;
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === payload.commentIDwithFlag,
        );
        if (index !== -1) {
          const splitted = topLayer.commentList[index].id.split(
            pendingDeleteCommentFlag,
          );
          topLayer.commentList[index].id = splitted[0];
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_CREATE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createCommentError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_DELETE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteCommentError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_INTERACT_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.interactCommentError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case PUSH_COMMENTS_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const commentsLayer = {
        postID: action.payload as string,
        loading: false,
        createCommentLoading: false,
        error: null,
        createCommentError: null,
        deleteCommentError: null,
        interactCommentError: null,
        lastVisible: null,
        type: 'all' as 'all',
        commentList: [],
      };
      const newStack = CommentsStack.clone(state[currentTab]);
      newStack.push(commentsLayer);
      newState[currentTab] = newStack;
      return newState;
    }
    case POP_COMMENTS_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      newStack.pop();
      newState[currentTab] = newStack;
      return newState;
    }
    case SET_SORT_COMMENTS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = state[currentTab].top();
      if (topLayer) {
        const newStack = CommentsStack.clone(state[currentTab]);
        topLayer.type = action.payload as 'all' | 'top';
        topLayer.error = null;
        topLayer.lastVisible = null;
        topLayer.commentList = [];
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case INCREASE_REPLIES_BY_ONE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = CommentsStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.commentList[index].replies += 1;
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new CommentsStack();
      return newState;
    }
    default:
      return state;
  }
}
