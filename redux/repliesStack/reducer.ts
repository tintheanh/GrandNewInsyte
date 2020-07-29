import {
  SET_CURRENT_TAB,
  PUSH_REPLIES_LAYER,
  CurrentTab,
  RepliesStackState,
  RepliesStackAction,
  POP_REPLIES_LAYER,
  FETCH_REPLIES_STARTED,
  FETCH_REPLIES_SUCCESS,
  FETCH_REPLIES_FAILURE,
  FETCH_REPLIES_END,
  CREATE_REPLY_FAILURE,
  CREATE_REPLY_STARTED,
  CREATE_REPLY_SUCCESS,
  DELETE_REPLY_FAILURE,
  DELETE_REPLY_STARTED,
  DELETE_REPLY_SUCCESS,
  LIKE_REPLY_FAILURE,
  LIKE_REPLY_STARTED,
  LIKE_REPLY_SUCCESS,
  UNLIKE_REPLY_FAILURE,
  UNLIKE_REPLY_STARTED,
  UNLIKE_REPLY_SUCCESS,
  CLEAR_STACK,
  CLEAR_CREATE_REPLY_ERROR,
  CLEAR_DELETE_REPLY_ERROR,
  CLEAR_INTERACT_REPLY_ERROR,
} from './types';
import { RepliesStack, Reply } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { pendingReplyID, pendingDeleteReplyFlag } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';

const initialState: RepliesStackState = {
  homeTabStack: new RepliesStack(),
  userTabStack: new RepliesStack(),
  currentTab: 'homeTabStack',
};

export default function commentsStackReducer(
  state = initialState,
  action: RepliesStackAction,
): RepliesStackState {
  switch (action.type) {
    case SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTab;
      return newState;
    }
    case PUSH_REPLIES_LAYER: {
      const newState = { ...state };
      const payload = action.payload as { postID: string; commentID: string };
      const currentTab = state.currentTab;
      const repliesLayer = {
        postID: payload.postID,
        commentID: payload.commentID,
        loading: false,
        error: null,
        createReplyLoading: false,
        createReplyError: null,
        deleteReplyError: null,
        interactReplyError: null,
        lastVisible: null,
        replyList: [],
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      newStack.push(repliesLayer);
      newState[currentTab] = newStack;
      return newState;
    }
    case POP_REPLIES_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      newStack.pop();
      newState[currentTab] = newStack;
      return newState;
    }
    case FETCH_REPLIES_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = true;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_REPLIES_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        replyList: Array<Reply>;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        const newCommentList = topLayer.replyList.concat(payload.replyList);
        const removedDuplicates = removeDuplicatesFromArray(newCommentList);
        removedDuplicates.sort((a, b) => a.datePosted - b.datePosted);
        topLayer.replyList = removedDuplicates;
        topLayer.lastVisible = payload.lastVisible;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_REPLIES_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.replyList = [];
        topLayer.lastVisible = null;
        topLayer.error = action.payload as Error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case FETCH_REPLIES_END: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loading = false;
        topLayer.error = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CREATE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createReplyLoading = true;
        topLayer.createReplyError = null;
        const filteredPending = topLayer.replyList.filter(
          (reply) => reply.id !== pendingReplyID,
        );
        filteredPending.push(action.payload as Reply);
        topLayer.replyList = filteredPending;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CREATE_REPLY_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        newReply: Reply;
        commentID: string;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer && topLayer.commentID === payload.commentID) {
        topLayer.createReplyLoading = false;
        topLayer.createReplyError = null;
        const index = topLayer.replyList.findIndex(
          (reply) => reply.id === pendingReplyID,
        );
        if (index !== -1) {
          topLayer.replyList[index] = payload.newReply;
        }
        const filteredPending = topLayer.replyList.filter(
          (reply) => reply.id !== pendingReplyID,
        );
        const removedDuplicates = removeDuplicatesFromArray(filteredPending);
        topLayer.replyList = removedDuplicates;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CREATE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createReplyLoading = false;
        topLayer.createReplyError = action.payload as Error;
        const filteredPending = topLayer.replyList.filter(
          (reply) => reply.id !== pendingReplyID,
        );
        topLayer.replyList = filteredPending;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DELETE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteReplyError = null;
        const index = topLayer.replyList.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replyList[index].id += pendingDeleteReplyFlag;
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DELETE_REPLY_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteReplyError = null;
        const index = topLayer.replyList.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replyList.splice(index, 1);
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DELETE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        replyIDwithFlag: string;
        error: Error;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteReplyError = payload.error;
        const index = topLayer.replyList.findIndex(
          (reply) => reply.id === payload.replyIDwithFlag,
        );
        if (index !== -1) {
          const splitted = topLayer.replyList[index].id.split(
            pendingDeleteReplyFlag,
          );
          topLayer.replyList[index].id = splitted[0];
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case LIKE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        const index = topLayer.replyList.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replyList[index].likes += 1;
          topLayer.replyList[index].isLiked = true;
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case LIKE_REPLY_SUCCESS: {
      return state;
    }
    case LIKE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        replyID: string;
        error: Error | null;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        if (payload.replyID.length) {
          const index = topLayer.replyList.findIndex(
            (reply) => reply.id === payload.replyID,
          );
          if (index !== -1) {
            topLayer.replyList[index].likes -= 1;
            topLayer.replyList[index].isLiked = false;
          }
        }
        topLayer.interactReplyError = payload.error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case UNLIKE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        const index = topLayer.replyList.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replyList[index].likes -= 1;
          topLayer.replyList[index].isLiked = false;
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case UNLIKE_REPLY_SUCCESS: {
      return state;
    }
    case UNLIKE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        replyID: string;
        error: Error | null;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        if (payload.replyID.length) {
          const index = topLayer.replyList.findIndex(
            (reply) => reply.id === payload.replyID,
          );
          if (index !== -1) {
            topLayer.replyList[index].likes += 1;
            topLayer.replyList[index].isLiked = true;
          }
        }
        topLayer.interactReplyError = payload.error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_CREATE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.createReplyError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_DELETE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.deleteReplyError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_INTERACT_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.interactReplyError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new RepliesStack();
      return newState;
    }
    default:
      return state;
  }
}
