import {
  FETCH_PUBLIC_NEWPOSTS_STARTED,
  FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  FETCH_PUBLIC_NEWPOSTS_FAILURE,
  FETCH_PUBLIC_NEWPOSTS_END,
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE,
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED,
  PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS,
  FETCH_PUBLIC_HOTPOSTS_END,
  FETCH_PUBLIC_HOTPOSTS_FAILURE,
  FETCH_PUBLIC_HOTPOSTS_STARTED,
  FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE,
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED,
  PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS,
  FETCH_FOLLOWING_NEWPOSTS_STARTED,
  FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  FETCH_FOLLOWING_NEWPOSTS_END,
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE,
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED,
  PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS,
  FETCH_FOLLOWING_HOTPOSTS_END,
  FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  FETCH_FOLLOWING_HOTPOSTS_STARTED,
  FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE,
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED,
  PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS,
  FETCH_USER_POSTS_FAILURE,
  FETCH_USER_POSTS_STARTED,
  FETCH_USER_POSTS_SUCCESS,
  FETCH_USER_POSTS_END,
  PULL_TO_FETCH_USER_POSTS_FAILURE,
  PULL_TO_FETCH_USER_POSTS_STARTED,
  PULL_TO_FETCH_USER_POSTS_SUCCESS,
  SET_PUBLIC_HOTTIME,
  SET_FOLLOWING_HOTTIME,
  CREATE_POST_FAILURE,
  CREATE_POST_STARTED,
  CREATE_POST_SUCCESS,
  CLEAR,
  PostState,
  PostAction,
  SET_PUBLIC_FEED_CHOICE,
  SET_FOLLOWING_FEED_CHOICE,
} from './types';
import { oneWeek } from '../../constants';
import { Post } from '../../models';

const initialState: PostState = {
  public: {
    posts: [],
    loading: false,
    pullLoading: false,
    lastNewVisible: 0,
    lastHotVisible: 0,
    hotTime: oneWeek,
    feedChoice: 'new',
    error: null,
  },
  following: {
    posts: [],
    loading: false,
    pullLoading: false,
    lastNewVisible: 0,
    lastHotVisible: 0,
    hotTime: oneWeek,
    feedChoice: 'new',
    error: null,
  },
  userPosts: {
    posts: [],
    lastVisible: 0,
    pullLoading: false,
    loading: false,
    error: null,
  },
  createPost: {
    loading: false,
    error: null,
  },
};

export default function postsReducer(
  state = initialState,
  action: PostAction,
): PostState {
  switch (action.type) {
    /* ----------------- public posts cases ----------------- */

    case FETCH_PUBLIC_NEWPOSTS_STARTED: {
      const newState = { ...state };
      newState.public.loading = true;
      newState.public.error = null;
      newState.public.lastHotVisible = 0;
      if (newState.public.lastNewVisible === 0) {
        newState.public.posts = [];
      }
      return newState;
    }
    case FETCH_PUBLIC_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      const publicPosts = newState.public.posts.concat(payload.posts);
      newState.public.posts = publicPosts;
      newState.public.lastNewVisible = payload.lastVisible;
      newState.public.loading = false;
      return newState;
    }
    case FETCH_PUBLIC_NEWPOSTS_FAILURE:
    case FETCH_PUBLIC_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.public.error = action.payload as Error;
      newState.public.loading = false;
      newState.public.posts = [];
      newState.public.lastHotVisible = 0;
      newState.public.lastNewVisible = 0;
      return newState;
    }
    case FETCH_PUBLIC_NEWPOSTS_END:
    case FETCH_PUBLIC_HOTPOSTS_END: {
      const newState = { ...state };
      newState.public.loading = false;
      return newState;
    }
    case PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED:
    case PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.public.pullLoading = true;
      return newState;
    }
    case PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.public.posts = payload.posts;
      newState.public.lastNewVisible = payload.lastVisible;
      newState.public.pullLoading = false;
      return newState;
    }
    case PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE:
    case PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.public.error = action.payload as Error;
      newState.public.posts = [];
      newState.public.pullLoading = false;
      return newState;
    }
    case FETCH_PUBLIC_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.public.loading = true;
      newState.public.error = null;
      newState.public.lastNewVisible = 0;
      if (newState.public.lastHotVisible === 0) {
        newState.public.posts = [];
      }
      return newState;
    }
    case FETCH_PUBLIC_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      const publicPosts = newState.public.posts.concat(payload.posts);
      newState.public.posts = publicPosts;
      newState.public.lastHotVisible = payload.lastVisible;
      newState.public.loading = false;
      return newState;
    }
    case PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.public.posts = payload.posts;
      newState.public.lastHotVisible = payload.lastVisible;
      newState.public.pullLoading = false;
      return newState;
    }

    /* --------------- end public posts cases --------------- */

    /* ---------------- following posts cases --------------- */

    case FETCH_FOLLOWING_NEWPOSTS_STARTED: {
      const newState = { ...state };
      newState.following.loading = true;
      newState.following.error = null;
      newState.following.lastHotVisible = 0;
      if (newState.following.lastNewVisible === 0) {
        newState.following.posts = [];
      }
      return newState;
    }
    case FETCH_FOLLOWING_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      const followingPosts = newState.following.posts.concat(payload.posts);
      newState.following.posts = followingPosts;
      newState.following.lastNewVisible = payload.lastVisible;
      newState.following.loading = false;
      return newState;
    }
    case FETCH_FOLLOWING_NEWPOSTS_FAILURE:
    case FETCH_FOLLOWING_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.following.error = action.payload as Error;
      newState.following.loading = false;
      newState.following.posts = [];
      newState.following.lastHotVisible = 0;
      newState.following.lastNewVisible = 0;
      return newState;
    }
    case FETCH_FOLLOWING_NEWPOSTS_END:
    case FETCH_FOLLOWING_HOTPOSTS_END: {
      const newState = { ...state };
      newState.following.loading = false;
      return newState;
    }
    case PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED:
    case PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.following.pullLoading = true;
      return newState;
    }
    case PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.following.posts = payload.posts;
      newState.following.lastNewVisible = payload.lastVisible;
      newState.following.pullLoading = false;
      return newState;
    }
    case PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE:
    case PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.following.error = action.payload as Error;
      newState.following.posts = [];
      newState.following.pullLoading = false;
      return newState;
    }
    case FETCH_FOLLOWING_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.following.loading = true;
      newState.following.error = null;
      newState.following.lastNewVisible = 0;
      if (newState.following.lastHotVisible === 0) {
        newState.following.posts = [];
      }
      return newState;
    }
    case FETCH_FOLLOWING_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      const publicPosts = newState.following.posts.concat(payload.posts);
      newState.following.posts = publicPosts;
      newState.following.lastHotVisible = payload.lastVisible;
      newState.following.loading = false;
      return newState;
    }

    case PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.following.posts = payload.posts;
      newState.following.lastHotVisible = payload.lastVisible;
      newState.following.pullLoading = false;
      return newState;
    }

    /* -------------- end following posts cases ------------- */

    /* ------------------ user posts cases ------------------ */

    case FETCH_USER_POSTS_STARTED: {
      const newState = { ...state };
      newState.userPosts.loading = true;
      newState.userPosts.error = null;
      return newState;
    }
    case FETCH_USER_POSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };

      const newState = { ...state };
      newState.userPosts.posts = newState.userPosts.posts.concat(payload.posts);
      newState.userPosts.lastVisible = payload.lastVisible;
      newState.userPosts.loading = false;
      return newState;
    }
    case FETCH_USER_POSTS_FAILURE: {
      const newState = { ...state };
      newState.userPosts.error = action.payload as Error;
      newState.userPosts.posts = [];
      newState.userPosts.loading = false;
      return newState;
    }
    case FETCH_USER_POSTS_END: {
      const newState = { ...state };
      newState.userPosts.loading = false;
      return newState;
    }
    case PULL_TO_FETCH_USER_POSTS_STARTED: {
      const newState = { ...state };
      newState.userPosts.pullLoading = true;
      return newState;
    }
    case PULL_TO_FETCH_USER_POSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<any>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.userPosts.posts = payload.posts;
      newState.userPosts.lastVisible = payload.lastVisible;
      newState.userPosts.pullLoading = false;
      return newState;
    }
    case PULL_TO_FETCH_USER_POSTS_FAILURE: {
      const newState = { ...state };
      newState.userPosts.error = action.payload as Error;
      newState.userPosts.posts = [];
      newState.userPosts.pullLoading = false;
      return newState;
    }

    /* ---------------- end user posts cases ---------------- */

    /* ------------------ create post cases ----------------- */

    case CREATE_POST_STARTED: {
      const newState = { ...state };
      newState.createPost.error = null;
      newState.createPost.loading = true;
      const newPosts = [...state.public.posts];

      // ensure only one pending post
      const filteredPending = newPosts.filter(
        (post) => post.id !== 'pending-post-69',
      );

      filteredPending.unshift(action.payload as Post);
      newState.public.posts = filteredPending;
      return newState;
    }
    case CREATE_POST_SUCCESS: {
      const newState = { ...state };
      const posts = [...state.public.posts];
      const index = posts.findIndex((post) => post.id === 'pending-post-69');
      if (index !== -1) {
        posts[index] = action.payload as Post;
      } else {
        posts.unshift(action.payload as Post);
      }
      newState.public.posts = posts;
      newState.createPost.loading = false;
      newState.createPost.error = null;
      return newState;
    }
    case CREATE_POST_FAILURE: {
      const newState = { ...state };
      const posts = [...newState.public.posts];
      const filteredPending = posts.filter(
        (post) => post.id !== 'pending-post-69',
      );
      newState.public.posts = filteredPending;
      newState.createPost.error = action.payload as Error;
      newState.createPost.loading = false;
      return newState;
    }

    /* ---------------- end create post cases --------------- */

    case SET_PUBLIC_HOTTIME: {
      const newState = { ...state };
      newState.public.hotTime = action.payload as number;
      newState.public.lastHotVisible = 0;
      newState.public.posts = [];
      return newState;
    }
    case SET_FOLLOWING_HOTTIME: {
      const newState = { ...state };
      newState.following.hotTime = action.payload as number;
      newState.following.lastHotVisible = 0;
      newState.following.posts = [];
      return newState;
    }
    case SET_PUBLIC_FEED_CHOICE: {
      const newState = { ...state };
      newState.public.feedChoice = action.payload as string;
      newState.public.hotTime = oneWeek;
      newState.public.lastHotVisible = 0;
      newState.public.posts = [];
      return newState;
    }
    case SET_FOLLOWING_FEED_CHOICE: {
      const newState = { ...state };
      newState.following.feedChoice = action.payload as string;
      newState.following.hotTime = oneWeek;
      newState.following.lastHotVisible = 0;
      newState.following.posts = [];
      return newState;
    }

    case CLEAR:
      return {
        public: {
          posts: [],
          loading: false,
          pullLoading: false,
          lastNewVisible: 0,
          lastHotVisible: 0,
          hotTime: oneWeek,
          feedChoice: 'new',
          error: null,
        },
        following: {
          posts: [],
          loading: false,
          pullLoading: false,
          lastNewVisible: 0,
          lastHotVisible: 0,
          hotTime: oneWeek,
          feedChoice: 'new',
          error: null,
        },
        userPosts: {
          posts: [],
          lastVisible: 0,
          pullLoading: false,
          loading: false,
          error: null,
        },
        createPost: {
          loading: false,
          error: null,
        },
      };
    default:
      return state;
  }
}
