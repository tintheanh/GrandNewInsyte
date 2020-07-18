import { Post } from '../../models';

export const FETCH_PUBLIC_NEWPOSTS_STARTED = 'FETCH_PUBLIC_NEWPOSTS_STARTED';
export const FETCH_PUBLIC_NEWPOSTS_SUCCESS = 'FETCH_PUBLIC_NEWPOSTS_SUCCESS';
export const FETCH_PUBLIC_NEWPOSTS_FAILURE = 'FETCH_PUBLIC_NEWPOSTS_FAILURE';
export const FETCH_PUBLIC_NEWPOSTS_END = 'FETCH_PUBLIC_NEWPOSTS_END';

export const PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED =
  'PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED';
export const PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS =
  'PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS';
export const PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE =
  'PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE';

export const FETCH_PUBLIC_HOTPOSTS_STARTED = 'FETCH_PUBLIC_HOTPOSTS_STARTED';
export const FETCH_PUBLIC_HOTPOSTS_SUCCESS = 'FETCH_PUBLIC_HOTPOSTS_SUCCESS';
export const FETCH_PUBLIC_HOTPOSTS_FAILURE = 'FETCH_PUBLIC_HOTPOSTS_FAILURE';
export const FETCH_PUBLIC_HOTPOSTS_END = 'FETCH_PUBLIC_HOTPOSTS_END';

export const PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED =
  'PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED';
export const PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS =
  'PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS';
export const PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE =
  'PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE';

export const FETCH_FOLLOWING_NEWPOSTS_STARTED =
  'FETCH_FOLLOWING_NEWPOSTS_STARTED';
export const FETCH_FOLLOWING_NEWPOSTS_SUCCESS =
  'FETCH_FOLLOWING_NEWPOSTS_SUCCESS';
export const FETCH_FOLLOWING_NEWPOSTS_FAILURE =
  'FETCH_FOLLOWING_NEWPOSTS_FAILURE';
export const FETCH_FOLLOWING_NEWPOSTS_END = 'FETCH_FOLLOWING_NEWPOSTS_END';

export const PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED =
  'PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED';
export const PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS =
  'PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS';
export const PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE =
  'PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE';

export const FETCH_FOLLOWING_HOTPOSTS_STARTED =
  'FETCH_FOLLOWING_HOTPOSTS_STARTED';
export const FETCH_FOLLOWING_HOTPOSTS_SUCCESS =
  'FETCH_FOLLOWING_HOTPOSTS_SUCCESS';
export const FETCH_FOLLOWING_HOTPOSTS_FAILURE =
  'FETCH_FOLLOWING_HOTPOSTS_FAILURE';
export const FETCH_FOLLOWING_HOTPOSTS_END = 'FETCH_FOLLOWING_HOTPOSTS_END';

export const PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED =
  'PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED';
export const PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS =
  'PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS';
export const PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE =
  'PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE';

export const FETCH_USER_POSTS_STARTED = 'FETCH_USER_POSTS_STARTED';
export const FETCH_USER_POSTS_SUCCESS = 'FETCH_USER_POSTS_SUCCESS';
export const FETCH_USER_POSTS_FAILURE = 'FETCH_USER_POSTS_FAILURE';
export const FETCH_USER_POSTS_END = 'FETCH_USER_POSTS_END';

export const PULL_TO_FETCH_USER_POSTS_STARTED =
  'PULL_TO_FETCH_USER_POSTS_STARTED';
export const PULL_TO_FETCH_USER_POSTS_SUCCESS =
  'PULL_TO_FETCH_USER_POSTS_SUCCESS';
export const PULL_TO_FETCH_USER_POSTS_FAILURE =
  'PULL_TO_FETCH_USER_POSTS_FAILURE';

export const SET_PUBLIC_HOTTIME = 'SET_PUBLIC_HOTTIME';
export const SET_FOLLOWING_HOTTIME = 'SET_FOLLOWING_HOTTIME';
export const SET_PUBLIC_FEED_CHOICE = 'SET_PUBLIC_FEED_CHOICE';
export const SET_FOLLOWING_FEED_CHOICE = 'SET_FOLLOWING_FEED_CHOICE';
export const CLEAR = 'CLEAR';

export const CREATE_POST_STARTED = 'CREATE_POST_STARTED';
export const CREATE_POST_SUCCESS = 'CREATE_POST_SUCCESS';
export const CREATE_POST_FAILURE = 'CREATE_POST_FAILURE';

export const DELETE_POST_STARTED = 'DELETE_POST_STARTED';
export const DELETE_POST_SUCCESS = 'DELETE_POST_SUCCESS';
export const DELETE_POST_FAILURE = 'DELETE_POST_FAILURE';

export const LIKE_POST_STARTED = 'LIKE_POST_STARTED';
export const LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS';
export const LIKE_POST_FAILURE = 'LIKE_POST_FAILURE';

export const UNLIKE_POST_STARTED = 'UNLIKE_POST_STARTED';
export const UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS';
export const UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE';

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
    loading: boolean;
    pullLoading: boolean;
    lastNewVisible: number;
    lastHotVisible: number;
    hotTime: number;
    feedChoice: string;
    error: Error | null;
  };
  following: {
    posts: Array<Post>;
    loading: boolean;
    pullLoading: boolean;
    lastNewVisible: number;
    lastHotVisible: number;
    hotTime: number;
    feedChoice: string;
    error: Error | null;
  };
  userPosts: {
    posts: Array<Post>;
    loading: boolean;
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
  // postDetails is a stack because it associates with push navigation
  // every navigation layer is a object of post detail pushed onto
  // the current view postDetails stack
  // postDetails: Array<{
  //   id: string;
  //   commentList: Array<{
  //     id: string;
  //     content: string;
  //     datePosted: number;
  //     likes: number;
  //     replies: number;
  //     user: {
  //       id: string;
  //       avatar: string;
  //       username: string;
  //     };
  //   }>;
  // }>;
}
