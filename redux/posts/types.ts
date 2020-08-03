import { Post } from '../../models';

export enum DispatchTypes {
  FETCH_PUBLIC_NEWPOSTS_STARTED = 'FETCH_PUBLIC_NEWPOSTS_STARTED',
  FETCH_PUBLIC_NEWPOSTS_SUCCESS = 'FETCH_PUBLIC_NEWPOSTS_SUCCESS',
  FETCH_PUBLIC_NEWPOSTS_FAILURE = 'FETCH_PUBLIC_NEWPOSTS_FAILURE',

  PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED = 'PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED',
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS = 'PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS',
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE = 'PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE',

  FETCH_PUBLIC_HOTPOSTS_STARTED = 'FETCH_PUBLIC_HOTPOSTS_STARTED',
  FETCH_PUBLIC_HOTPOSTS_SUCCESS = 'FETCH_PUBLIC_HOTPOSTS_SUCCESS',
  FETCH_PUBLIC_HOTPOSTS_FAILURE = 'FETCH_PUBLIC_HOTPOSTS_FAILURE',
  FETCH_PUBLIC_HOTPOSTS_END = 'FETCH_PUBLIC_HOTPOSTS_END',

  PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED = 'PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED',
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS = 'PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS',
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE = 'PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE',

  FETCH_FOLLOWING_NEWPOSTS_STARTED = 'FETCH_FOLLOWING_NEWPOSTS_STARTED',
  FETCH_FOLLOWING_NEWPOSTS_SUCCESS = 'FETCH_FOLLOWING_NEWPOSTS_SUCCESS',
  FETCH_FOLLOWING_NEWPOSTS_FAILURE = 'FETCH_FOLLOWING_NEWPOSTS_FAILURE',
  FETCH_FOLLOWING_NEWPOSTS_END = 'FETCH_FOLLOWING_NEWPOSTS_END',

  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED = 'PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED',
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS = 'PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS',
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE = 'PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE',

  FETCH_FOLLOWING_HOTPOSTS_STARTED = 'FETCH_FOLLOWING_HOTPOSTS_STARTED',
  FETCH_FOLLOWING_HOTPOSTS_SUCCESS = 'FETCH_FOLLOWING_HOTPOSTS_SUCCESS',
  FETCH_FOLLOWING_HOTPOSTS_FAILURE = 'FETCH_FOLLOWING_HOTPOSTS_FAILURE',
  FETCH_FOLLOWING_HOTPOSTS_END = 'FETCH_FOLLOWING_HOTPOSTS_END',

  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED = 'PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED',
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS = 'PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS',
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE = 'PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE',

  FETCH_USER_POSTS_STARTED = 'FETCH_USER_POSTS_STARTED',
  FETCH_USER_POSTS_SUCCESS = 'FETCH_USER_POSTS_SUCCESS',
  FETCH_USER_POSTS_FAILURE = 'FETCH_USER_POSTS_FAILURE',
  FETCH_USER_POSTS_END = 'FETCH_USER_POSTS_END',

  PULL_TO_FETCH_USER_POSTS_STARTED = 'PULL_TO_FETCH_USER_POSTS_STARTED',
  PULL_TO_FETCH_USER_POSTS_SUCCESS = 'PULL_TO_FETCH_USER_POSTS_SUCCESS',
  PULL_TO_FETCH_USER_POSTS_FAILURE = 'PULL_TO_FETCH_USER_POSTS_FAILURE',

  FETCH_TAGGED_POSTS_STARTED = 'FETCH_TAGGED_POSTS_STARTED',
  FETCH_TAGGED_POSTS_SUCCESS = 'FETCH_TAGGED_POSTS_SUCCESS',
  FETCH_TAGGED_POSTS_FAILURE = 'FETCH_TAGGED_POSTS_FAILURE',
  FETCH_TAGGED_POSTS_END = 'FETCH_TAGGED_POSTS_END',

  PULL_TO_FETCH_TAGGED_POSTS_STARTED = 'PULL_TO_FETCH_TAGGED_POSTS_STARTED',
  PULL_TO_FETCH_TAGGED_POSTS_SUCCESS = 'PULL_TO_FETCH_TAGGED_POSTS_SUCCESS',
  PULL_TO_FETCH_TAGGED_POSTS_FAILURE = 'PULL_TO_FETCH_TAGGED_POSTS_FAILURE',

  SET_PUBLIC_HOTTIME = 'SET_PUBLIC_HOTTIME',
  SET_FOLLOWING_HOTTIME = 'SET_FOLLOWING_HOTTIME',
  SET_PUBLIC_FEED_CHOICE = 'SET_PUBLIC_FEED_CHOICE',
  SET_FOLLOWING_FEED_CHOICE = 'SET_FOLLOWING_FEED_CHOICE',
  CLEAR = 'CLEAR',

  CREATE_POST_STARTED = 'CREATE_POST_STARTED',
  CREATE_POST_SUCCESS = 'CREATE_POST_SUCCESS',
  CREATE_POST_FAILURE = 'CREATE_POST_FAILURE',

  DELETE_POST_STARTED = 'DELETE_POST_STARTED',
  DELETE_POST_SUCCESS = 'DELETE_POST_SUCCESS',
  DELETE_POST_FAILURE = 'DELETE_POST_FAILURE',

  LIKE_POST_STARTED = 'LIKE_POST_STARTED',
  LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS',
  LIKE_POST_FAILURE = 'LIKE_POST_FAILURE',

  UNLIKE_POST_STARTED = 'UNLIKE_POST_STARTED',
  UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS',
  UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE',

  INCREASE_COMMENTS_BY_NUMBER = 'INCREASE_COMMENTS_BY_NUMBER',
  DECREASE_COMMENTS_BY_NUMBER = 'DECREASE_COMMENTS_BY_NUMBER',

  CLEAR_CREATE_POST_ERROR = 'CLEAR_CREATE_POST_ERROR',
  CLEAR_DELETE_POST_ERROR = 'CLEAR_DELETE_POST_ERROR',
  CLEAR_LIKE_POST_ERROR = 'CLEAR_LIKE_POST_ERROR',
  CLEAR_UNLIKE_POST_ERROR = 'CLEAR_UNLIKE_POST_ERROR',
}

export interface PostAction {
  type: string;
  payload:
    | {
        posts: Array<Post>;
        lastVisible: number;
      }
    | {
        error: Error | null;
        postID: string;
      }
    | {
        by: number;
        postID: string;
      }
    | Array<any>
    | number
    | string
    | Post
    | null
    | Error;
}

export interface PostState {
  public: {
    posts: Array<Post>;
    fetchLoading: boolean;
    pullLoading: boolean;
    lastNewVisible: number;
    lastHotVisible: number;
    hotTime: number;
    feedChoice: 'new' | 'hot';
    error: Error | null;
  };
  following: {
    posts: Array<Post>;
    fetchLoading: boolean;
    pullLoading: boolean;
    lastNewVisible: number;
    lastHotVisible: number;
    hotTime: number;
    feedChoice: 'new' | 'hot';
    error: Error | null;
  };
  userPosts: {
    posts: Array<Post>;
    fetchLoading: boolean;
    pullLoading: boolean;
    error: Error | null;
    lastVisible: number;
  };
  taggedPosts: {
    posts: Array<Post>;
    fetchLoading: boolean;
    pullLoading: boolean;
    error: Error | null;
    lastVisible: number;
  };
  createPost: {
    loading: boolean;
    error: Error | null;
  };
  deletePost: {
    loading: boolean;
    error: Error | null;
  };
  likePost: {
    error: Error | null;
  };
  unlikePost: {
    error: Error | null;
  };
}
