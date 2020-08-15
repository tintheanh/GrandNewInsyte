import { ReplyStackState, ReplyStackAction, DispatchTypes } from './types';
import {
  Reply,
  CurrentTabScreen,
  NavigationStack,
  ReplyStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { pendingReplyID, pendingDeleteReplyFlag } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';

const initialState: ReplyStackState = {
  homeTabStack: new NavigationStack<ReplyStackLayer>(),
  userTabStack: new NavigationStack<ReplyStackLayer>(),
  currentTab: 'homeTabStack',
  currentLoadingInTab: '',
};

export default function replyStackReducer(
  state = initialState,
  action: ReplyStackAction,
): ReplyStackState {
  const untouchedState: ReplyStackState = {
    homeTabStack: new NavigationStack<ReplyStackLayer>(),
    userTabStack: new NavigationStack<ReplyStackLayer>(),
    currentTab: 'homeTabStack',
    currentLoadingInTab: '',
  };
  switch (action.type) {
    /* ------------------- ultility cases ------------------- */

    case DispatchTypes.SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTabScreen;
      return newState;
    }
    case DispatchTypes.PUSH_REPLY_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const replyLayer = {
        commentID: action.payload as string,
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
        replies: [],
      };
      newState[currentTab].push(replyLayer);
      return newState;
    }
    case DispatchTypes.POP_REPLY_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab].pop();
      return newState;
    }
    case DispatchTypes.CLEAR_CREATE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.errors.createReplyError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_DELETE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.errors.deleteReplyError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_LIKE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.errors.likeReplyError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_UNLIKE_REPLY_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.errors.unlikeReplyError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new NavigationStack<ReplyStackLayer>();
      return newState;
    }
    case DispatchTypes.RESET_ALL_STACKS:
      return untouchedState;

    /* ----------------- end ultility cases ----------------- */

    /* ----------------- fetch replies cases ---------------- */

    case DispatchTypes.FETCH_REPLIES_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      if (newState[currentTab]) {
        const topLayer = newState[
          currentTab
        ].getTopClone() as ReplyStackLayer | null;
        if (topLayer) {
          topLayer.loadings.fetchLoading = true;
          newState[currentTab].updateTop(topLayer);
          newState.currentLoadingInTab = currentTab;
        }
      }
      return newState;
    }
    case DispatchTypes.FETCH_REPLIES_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        replies: Array<Reply>;
      };
      if (newState[currentTab]) {
        const topLayer = newState[
          currentTab
        ].getTopClone() as ReplyStackLayer | null;
        if (topLayer) {
          topLayer.loadings.fetchLoading = false;
          const newReplies = topLayer.replies.concat(payload.replies);
          newReplies.sort((a, b) => a.datePosted - b.datePosted);
          topLayer.replies = removeDuplicatesFromArray(newReplies);
          topLayer.lastVisible = payload.lastVisible;
          topLayer.errors.fetchError = null;
          newState[currentTab].updateTop(topLayer);
        }
        newState.currentLoadingInTab = '';
      }
      return newState;
    }
    case DispatchTypes.FETCH_REPLIES_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      if (newState[currentTab]) {
        const topLayer = newState[
          currentTab
        ].getTopClone() as ReplyStackLayer | null;
        if (topLayer) {
          topLayer.loadings.fetchLoading = false;
          topLayer.replies = [];
          topLayer.lastVisible = null;
          topLayer.errors.fetchError = action.payload as Error;
          newState[currentTab].updateTop(topLayer);
        }
        newState.currentLoadingInTab = '';
      }
      return newState;
    }

    /* --------------- end fetch replies cases -------------- */

    /* ----------------- create reply cases ----------------- */

    case DispatchTypes.CREATE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.loadings.createReplyLoading = true;
        const filteredPending = topLayer.replies.filter(
          (reply) => reply.id !== pendingReplyID,
        );
        filteredPending.push(action.payload as Reply);
        topLayer.replies = filteredPending;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.CREATE_REPLY_SUCCESS: {
      const newState = { ...state };
      const currentTab = newState.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        newReply: Reply;
        commentID: string;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer && topLayer.commentID === payload.commentID) {
        topLayer.loadings.createReplyLoading = false;
        topLayer.errors.createReplyError = null;
        const index = topLayer.replies.findIndex(
          (reply) => reply.id === pendingReplyID,
        );
        if (index !== -1) {
          topLayer.replies[index] = payload.newReply;
        }
        const filteredPending = topLayer.replies.filter(
          (reply) => reply.id !== pendingReplyID,
        );
        const removedDuplicates = removeDuplicatesFromArray(filteredPending);
        topLayer.replies = removedDuplicates;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.CREATE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = newState.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.loadings.createReplyLoading = false;
        topLayer.errors.createReplyError = action.payload as Error;
        const filteredPending = topLayer.replies.filter(
          (reply) => reply.id !== pendingReplyID,
        );
        topLayer.replies = filteredPending;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }

    /* --------------- end create reply cases --------------- */

    /* ----------------- delete reply cases ----------------- */

    case DispatchTypes.DELETE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        const index = topLayer.replies.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replies[index].id += pendingDeleteReplyFlag;
        }
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.DELETE_REPLY_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.errors.deleteReplyError = null;
        const index = topLayer.replies.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replies.splice(index, 1);
        }
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.DELETE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        replyIDwithFlag: string;
        error: Error;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        topLayer.errors.deleteReplyError = payload.error;
        const index = topLayer.replies.findIndex(
          (reply) => reply.id === payload.replyIDwithFlag,
        );
        if (index !== -1) {
          const splitted = topLayer.replies[index].id.split(
            pendingDeleteReplyFlag,
          );
          topLayer.replies[index].id = splitted[0];
        }
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }

    /* --------------- end delete reply cases --------------- */

    /* ------------------ like reply cases ------------------ */

    case DispatchTypes.LIKE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        const index = topLayer.replies.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replies[index].likes += 1;
          topLayer.replies[index].isLiked = true;
        }
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.LIKE_REPLY_SUCCESS: {
      const newState = { ...state };
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.LIKE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        replyID: string;
        error: Error;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        if (payload.replyID.length) {
          const index = topLayer.replies.findIndex(
            (reply) => reply.id === payload.replyID,
          );
          if (index !== -1) {
            topLayer.replies[index].likes -= 1;
            topLayer.replies[index].isLiked = false;
          }
        }
        topLayer.errors.likeReplyError = payload.error;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }

    /* ---------------- end like reply cases ---------------- */

    /* ----------------- unlike reply cases ----------------- */

    case DispatchTypes.UNLIKE_REPLY_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        const index = topLayer.replies.findIndex(
          (reply) => reply.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.replies[index].likes -= 1;
          topLayer.replies[index].isLiked = false;
        }
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.UNLIKE_REPLY_SUCCESS: {
      const newState = { ...state };
      newState.currentLoadingInTab = '';
      return state;
    }
    case DispatchTypes.UNLIKE_REPLY_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        replyID: string;
        error: Error | null;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as ReplyStackLayer | null;
      if (topLayer) {
        if (payload.replyID.length) {
          const index = topLayer.replies.findIndex(
            (reply) => reply.id === payload.replyID,
          );
          if (index !== -1) {
            topLayer.replies[index].likes += 1;
            topLayer.replies[index].isLiked = true;
          }
        }
        topLayer.errors.unlikeReplyError = payload.error;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }

    /* --------------- end unlike reply cases --------------- */

    default:
      return state;
  }
}
