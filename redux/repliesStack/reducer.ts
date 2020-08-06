import { RepliesStackState, RepliesStackAction, DispatchTypes } from './types';
import { RepliesStack, Reply, CurrentTabScreen } from '../../models';
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
    case DispatchTypes.SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTabScreen;
      return newState;
    }
    case DispatchTypes.PUSH_REPLIES_LAYER: {
      const newState = { ...state };
      const payload = action.payload as { postID: string; commentID: string };
      const currentTab = state.currentTab;
      const repliesLayer = {
        commentID: payload.commentID,
        loadings: {
          fetchLoading: false,
          createReplyLoading: false,
        },
        errors: {
          fetchError: null,
          createReplyError: null,
          deleteReplyError: null,
          likeReplyError: null,
          unlikeReplyError: null,
        },
        lastVisible: null,
        replyList: [],
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      newStack.push(repliesLayer);
      newState[currentTab] = newStack;
      return newState;
    }
    case DispatchTypes.POP_REPLIES_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      newStack.pop();
      newState[currentTab] = newStack;
      return newState;
    }
    case DispatchTypes.FETCH_REPLIES_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.fetchLoading = true;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FETCH_REPLIES_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        replyList: Array<Reply>;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.fetchLoading = false;
        const newCommentList = topLayer.replyList.concat(payload.replyList);
        const removedDuplicates = removeDuplicatesFromArray(newCommentList);
        removedDuplicates.sort((a, b) => a.datePosted - b.datePosted);
        topLayer.replyList = removedDuplicates;
        topLayer.lastVisible = payload.lastVisible;
        topLayer.errors.fetchError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FETCH_REPLIES_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.fetchLoading = false;
        topLayer.replyList = [];
        topLayer.lastVisible = null;
        topLayer.errors.fetchError = action.payload as Error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CREATE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.createReplyLoading = true;
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
    case DispatchTypes.CREATE_REPLY_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        newReply: Reply;
        commentID: string;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer && topLayer.commentID === payload.commentID) {
        topLayer.loadings.createReplyLoading = false;
        topLayer.errors.createReplyError = null;
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
    case DispatchTypes.CREATE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.createReplyLoading = false;
        topLayer.errors.createReplyError = action.payload as Error;
        const filteredPending = topLayer.replyList.filter(
          (reply) => reply.id !== pendingReplyID,
        );
        topLayer.replyList = filteredPending;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.DELETE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
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
    case DispatchTypes.DELETE_REPLY_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.deleteReplyError = null;
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
    case DispatchTypes.DELETE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        replyIDwithFlag: string;
        error: Error;
      };
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.deleteReplyError = payload.error;
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
    case DispatchTypes.LIKE_REPLY_STARTED: {
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
    case DispatchTypes.LIKE_REPLY_SUCCESS: {
      return state;
    }
    case DispatchTypes.LIKE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        replyID: string;
        error: Error;
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
        topLayer.errors.likeReplyError = payload.error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.UNLIKE_REPLY_STARTED: {
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
    case DispatchTypes.UNLIKE_REPLY_SUCCESS: {
      return state;
    }
    case DispatchTypes.UNLIKE_REPLY_FAILURE: {
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
        topLayer.errors.unlikeReplyError = payload.error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_CREATE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.createReplyError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_DELETE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.deleteReplyError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_LIKE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.likeReplyError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_UNLIKE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = RepliesStack.clone(state[currentTab]);
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.unlikeReplyError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new RepliesStack();
      return newState;
    }
    default:
      return state;
  }
}
