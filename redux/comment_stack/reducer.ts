import { CommentStackState, CommentStackAction, DispatchTypes } from './types';
import {
  NavigationStack,
  Comment,
  CurrentTabScreen,
  CommentStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';

const initialState: CommentStackState = {
  homeTabStack: new NavigationStack<CommentStackLayer>(),
  userTabStack: new NavigationStack<CommentStackLayer>(),
  currentTab: 'homeTabStack',
  currentLoadingInTab: '',
};

export default function commentStackReducer(
  state = initialState,
  action: CommentStackAction,
): CommentStackState {
  const untouchedState: CommentStackState = {
    homeTabStack: new NavigationStack<CommentStackLayer>(),
    userTabStack: new NavigationStack<CommentStackLayer>(),
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

    case DispatchTypes.PUSH_COMMENT_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const commentsLayer = {
        postID: action.payload as string,
        loadings: {
          fetchLoading: false,
          createCommentLoading: false,
        },
        errors: {
          fetchError: null,
          createCommentError: null,
          deleteCommentError: null,
          likeCommentError: null,
          unlikeCommentError: null,
        },
        lastVisible: null,
        comments: [],
      };

      newState[currentTab].push(commentsLayer);
      return newState;
    }
    case DispatchTypes.POP_COMMENT_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab].pop();
      return newState;
    }
    case DispatchTypes.INCREASE_REPLIES_BY_NUMBER: {
      const newState = { ...state };
      const payload = action.payload as {
        commentID: string;
        numberOfReplies: number;
      };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === payload.commentID,
        );
        if (index !== -1) {
          topLayer.comments[index].replies += payload.numberOfReplies;
        }
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.DECREASE_REPLIES_BY_NUMBER: {
      const newState = { ...state };
      const payload = action.payload as {
        commentID: string;
        numberOfReplies: number;
      };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === payload.commentID,
        );
        if (index !== -1) {
          topLayer.comments[index].replies -= payload.numberOfReplies;
        }
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new NavigationStack<CommentStackLayer>();
      return newState;
    }
    case DispatchTypes.RESET_ALL_STACKS:
      return untouchedState;

    case DispatchTypes.CLEAR_CREATE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.errors.createCommentError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_DELETE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.errors.deleteCommentError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_LIKE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.errors.likeCommentError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }
    case DispatchTypes.CLEAR_UNLIKE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.errors.unlikeCommentError = null;
        newState[currentTab].updateTop(topLayer);
      }
      return newState;
    }

    /* ----------------- end ultility cases ----------------- */

    /* ---------------- fetch comments cases ---------------- */

    case DispatchTypes.FETCH_COMMENTS_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      if (newState[currentTab]) {
        const topLayer = newState[
          currentTab
        ].getTopClone() as CommentStackLayer | null;
        if (topLayer) {
          topLayer.loadings.fetchLoading = true;
          newState[currentTab].updateTop(topLayer);
          newState.currentLoadingInTab = currentTab;
        }
      }
      return newState;
    }
    case DispatchTypes.FETCH_COMMENTS_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        comments: Array<Comment>;
      };
      if (newState[currentTab]) {
        const topLayer = newState[
          currentTab
        ].getTopClone() as CommentStackLayer | null;
        if (topLayer) {
          topLayer.loadings.fetchLoading = false;
          const newComments = topLayer.comments.concat(payload.comments);
          newComments.sort((a, b) => a.datePosted - b.datePosted);
          topLayer.comments = removeDuplicatesFromArray(newComments);
          topLayer.lastVisible = payload.lastVisible;
          topLayer.errors.fetchError = null;
          newState[currentTab].updateTop(topLayer);
        }
        newState.currentLoadingInTab = '';
      }
      return newState;
    }
    case DispatchTypes.FETCH_COMMENTS_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      if (newState[currentTab]) {
        const topLayer = newState[
          currentTab
        ].getTopClone() as CommentStackLayer | null;
        if (topLayer) {
          topLayer.loadings.fetchLoading = false;
          topLayer.comments = [];
          topLayer.lastVisible = null;
          topLayer.errors.fetchError = action.payload as Error;
          newState[currentTab].updateTop(topLayer);
        }
        newState.currentLoadingInTab = '';
      }
      return newState;
    }

    /* -------------- end fetch comments cases -------------- */

    /* ---------------- create comment cases ---------------- */

    case DispatchTypes.CREATE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.loadings.createCommentLoading = true;
        const filteredPending = topLayer.comments.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        filteredPending.push(action.payload as Comment);
        topLayer.comments = filteredPending;
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.CREATE_COMMENT_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        newComment: Comment;
        postID: string;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer && topLayer.postID === payload.postID) {
        topLayer.loadings.createCommentLoading = false;
        topLayer.errors.createCommentError = null;
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === pendingCommentID,
        );
        if (index !== -1) {
          topLayer.comments[index] = payload.newComment;
        }
        const filteredPending = topLayer.comments.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        const removedDuplicates = removeDuplicatesFromArray(filteredPending);
        topLayer.comments = removedDuplicates;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.CREATE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.loadings.createCommentLoading = false;
        topLayer.errors.createCommentError = action.payload as Error;
        const filteredPending = topLayer.comments.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        topLayer.comments = filteredPending;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }

    /* -------------- end create comment cases -------------- */

    /* ---------------- delete comment cases ---------------- */

    case DispatchTypes.DELETE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.comments[index].id += pendingDeleteCommentFlag;
        }
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.DELETE_COMMENT_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.errors.deleteCommentError = null;
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.comments.splice(index, 1);
        }
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.DELETE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        commentIDwithFlag: string;
        error: Error;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        topLayer.errors.deleteCommentError = payload.error;
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === payload.commentIDwithFlag,
        );
        if (index !== -1) {
          const splitted = topLayer.comments[index].id.split(
            pendingDeleteCommentFlag,
          );
          topLayer.comments[index].id = splitted[0];
        }
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }

    /* -------------- end delete comment cases -------------- */

    /* ----------------- like comment cases ----------------- */
    case DispatchTypes.LIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.comments[index].likes += 1;
          topLayer.comments[index].isLiked = true;
        }
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.LIKE_COMMENT_SUCCESS: {
      const newState = { ...state };
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.LIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        commentID: string;
        error: Error;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        if (payload.commentID.length) {
          const index = topLayer.comments.findIndex(
            (comment) => comment.id === payload.commentID,
          );
          if (index !== -1) {
            topLayer.comments[index].likes -= 1;
            topLayer.comments[index].isLiked = false;
          }
        }
        topLayer.errors.likeCommentError = payload.error;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }
    /* --------------- end like comment cases --------------- */

    /* ---------------- unlike comment cases ---------------- */

    case DispatchTypes.UNLIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        const index = topLayer.comments.findIndex(
          (comment) => comment.id === (action.payload as string),
        );
        if (index !== -1) {
          topLayer.comments[index].likes -= 1;
          topLayer.comments[index].isLiked = false;
        }
        newState[currentTab].updateTop(topLayer);
        newState.currentLoadingInTab = currentTab;
      }
      return newState;
    }
    case DispatchTypes.UNLIKE_COMMENT_SUCCESS: {
      const newState = { ...state };
      newState.currentLoadingInTab = '';
      return newState;
    }
    case DispatchTypes.UNLIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentLoadingInTab as CurrentTabScreen;
      const payload = action.payload as {
        commentID: string;
        error: Error | null;
      };
      const topLayer = newState[
        currentTab
      ].getTopClone() as CommentStackLayer | null;
      if (topLayer) {
        if (payload.commentID.length) {
          const index = topLayer.comments.findIndex(
            (comment) => comment.id === payload.commentID,
          );
          if (index !== -1) {
            topLayer.comments[index].likes += 1;
            topLayer.comments[index].isLiked = true;
          }
        }
        topLayer.errors.unlikeCommentError = payload.error;
        newState[currentTab].updateTop(topLayer);
      }
      newState.currentLoadingInTab = '';
      return newState;
    }

    /* -------------- end unlike comment cases -------------- */

    default:
      return state;
  }
}
