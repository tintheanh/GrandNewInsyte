import { PostStack } from '../../models';

export const FETCH_NEW_COMMENTS_STARTED = 'FETCH_NEW_COMMENTS_STARTED';
export const FETCH_NEW_COMMENTS_SUCCESS = 'FETCH_NEW_COMMENTS_SUCCESS';
export const FETCH_NEW_COMMENTS_FAILURE = 'FETCH_NEW_COMMENTS_FAILURE';
export const FETCH_NEW_COMMENTS_END = 'FETCH_NEW_COMMENTS_END';

export const FETCH_TOP_COMMENTS_STARTED = 'FETCH_TOP_COMMENTS_STARTED';
export const FETCH_TOP_COMMENTS_SUCCESS = 'FETCH_TOP_COMMENTS_SUCCESS';
export const FETCH_TOP_COMMENTS_FAILURE = 'FETCH_TOP_COMMENTS_FAILURE';
export const FETCH_TOP_COMMENTS_END = 'FETCH_TOP_COMMENTS_END';

export const PUSH_POSTLAYER = 'PUSH_POSTLAYER';
export const POP_POSTLAYER = 'POP_POSTLAYER';
export const SET_SORT_COMMENTS = 'SET_SORT_COMMENTS';

export interface PostCommentsAction {
  type: string;
  payload: any;
}

// PostCommentsState is a stack because it associates with push navigation
// every navigation layer is a object of post detail pushed onto
// the current view postDetails stack
export interface PostCommentsState {
  stack: PostStack;
}
