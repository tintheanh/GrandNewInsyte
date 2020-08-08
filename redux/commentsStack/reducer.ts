import {
  CommentsStackState,
  CommentsStackAction,
  DispatchTypes,
} from './types';
import {
  NavigationStack,
  Comment,
  CurrentTabScreen,
  CommentsStackLayer,
} from '../../models';
import { FirebaseFirestoreTypes } from '../../config';
import { pendingCommentID, pendingDeleteCommentFlag } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';

const initialState: CommentsStackState = {
  homeTabStack: new NavigationStack<CommentsStackLayer>(),
  userTabStack: new NavigationStack<CommentsStackLayer>(),
  currentTab: 'homeTabStack',
};

export default function commentsStackReducer(
  state = initialState,
  action: CommentsStackAction,
): CommentsStackState {
  switch (action.type) {
    case DispatchTypes.PUSH_COMMENTS_LAYER: {
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
        commentList: [],
      };
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      newStack.push(commentsLayer);
      newState[currentTab] = newStack;
      return newState;
    }
    case DispatchTypes.POP_COMMENTS_LAYER: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      newStack.pop();
      newState[currentTab] = newStack;
      return newState;
    }
    /* ---------------- fetch comments cases ---------------- */

    case DispatchTypes.SET_CURRENT_TAB: {
      const newState = { ...state };
      newState.currentTab = action.payload as CurrentTabScreen;
      return newState;
    }
    case DispatchTypes.FETCH_NEW_COMMENTS_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.fetchLoading = true;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FETCH_NEW_COMMENTS_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        lastVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot;
        commentList: Array<Comment>;
      };
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.fetchLoading = false;
        const newCommentList = topLayer.commentList.concat(payload.commentList);
        const removedDuplicates = removeDuplicatesFromArray(newCommentList);
        topLayer.commentList = removedDuplicates;
        topLayer.lastVisible = payload.lastVisible;
        topLayer.errors.fetchError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.FETCH_NEW_COMMENTS_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.fetchLoading = false;
        topLayer.commentList = [];
        topLayer.lastVisible = null;
        topLayer.errors.fetchError = action.payload as Error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }

    /* -------------- end fetch comments cases -------------- */

    /* ---------------- create comment cases ---------------- */

    case DispatchTypes.CREATE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.createCommentLoading = true;
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
    case DispatchTypes.CREATE_COMMENT_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        newComment: Comment;
        postID: string;
      };
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer && topLayer.postID === payload.postID) {
        topLayer.loadings.createCommentLoading = false;
        topLayer.errors.createCommentError = null;
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
    case DispatchTypes.CREATE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.loadings.createCommentLoading = false;
        topLayer.errors.createCommentError = action.payload as Error;
        const filteredPending = topLayer.commentList.filter(
          (comment) => comment.id !== pendingCommentID,
        );
        topLayer.commentList = filteredPending;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }

    /* -------------- end create comment cases -------------- */

    /* ---------------- delete comment cases ---------------- */

    case DispatchTypes.DELETE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
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
    case DispatchTypes.DELETE_COMMENT_SUCCESS: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.deleteCommentError = null;
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
    case DispatchTypes.DELETE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        commentIDwithFlag: string;
        error: Error;
      };
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.deleteCommentError = payload.error;
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

    /* -------------- end delete comment cases -------------- */

    /* ----------------- like comment cases ----------------- */
    case DispatchTypes.LIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
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
    case DispatchTypes.LIKE_COMMENT_SUCCESS: {
      return state;
    }
    case DispatchTypes.LIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        commentID: string;
        error: Error;
      };
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
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
        topLayer.errors.likeCommentError = payload.error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    /* --------------- end like comment cases --------------- */

    /* ---------------- unlike comment cases ---------------- */

    case DispatchTypes.UNLIKE_COMMENT_STARTED: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
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
    case DispatchTypes.UNLIKE_COMMENT_SUCCESS: {
      return state;
    }
    case DispatchTypes.UNLIKE_COMMENT_FAILURE: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const payload = action.payload as {
        commentID: string;
        error: Error | null;
      };
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
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
        topLayer.errors.unlikeCommentError = payload.error;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }

    /* -------------- end unlike comment cases -------------- */

    /* ------------------ clear error cases ----------------- */
    case DispatchTypes.CLEAR_CREATE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.createCommentError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_DELETE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.deleteCommentError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_LIKE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.likeCommentError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_UNLIKE_COMMENT_ERROR: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        topLayer.errors.unlikeCommentError = null;
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }

    /* ---------------- end clear error cases --------------- */

    case DispatchTypes.INCREASE_REPLIES_BY_NUMBER: {
      const newState = { ...state };
      const payload = action.payload as {
        commentID: string;
        numberOfReplies: number;
      };
      const currentTab = state.currentTab;
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === payload.commentID,
        );
        if (index !== -1) {
          topLayer.commentList[index].replies += payload.numberOfReplies;
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
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
      const newStack = NavigationStack.clone(
        state[currentTab],
      ) as NavigationStack<CommentsStackLayer>;
      const topLayer = newStack.top();
      if (topLayer) {
        const index = topLayer.commentList.findIndex(
          (comment) => comment.id === payload.commentID,
        );
        if (index !== -1) {
          topLayer.commentList[index].replies -= payload.numberOfReplies;
        }
        newStack.updateTop(topLayer);
        newState[currentTab] = newStack;
      }
      return newState;
    }
    case DispatchTypes.CLEAR_STACK: {
      const newState = { ...state };
      const currentTab = state.currentTab;
      newState[currentTab] = new NavigationStack<CommentsStackLayer>();
      return newState;
    }
    default:
      return state;
  }
}
