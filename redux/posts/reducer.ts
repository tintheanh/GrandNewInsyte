import { DispatchTypes, PostState, PostAction } from './types';
import { oneWeek, pendingDeletePostFlag, pendingPostID } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';
import { Post } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

const initialState: PostState = {
  public: {
    posts: [],
    fetchLoading: false,
    pullLoading: false,
    lastNewVisible: 0,
    lastHotVisible: 0,
    hotTime: oneWeek,
    feedChoice: 'new',
    error: null,
  },
  following: {
    posts: [],
    fetchLoading: false,
    pullLoading: false,
    lastNewVisible: 0,
    lastHotVisible: 0,
    hotTime: oneWeek,
    feedChoice: 'new',
    error: null,
  },
  own: {
    posts: [],
    error: null,
    lastVisible: null,
    fetchLoading: false,
    pullLoading: false,
  },
  tagged: {
    posts: [],
    error: null,
    lastVisible: null,
    fetchLoading: false,
    pullLoading: false,
  },
  createPost: {
    loading: false,
    error: null,
  },
  deletePost: {
    loading: false,
    error: null,
  },
  likePost: {
    error: null,
  },
  unlikePost: {
    error: null,
  },
};

const untouchedState: PostState = {
  public: {
    posts: [],
    fetchLoading: false,
    pullLoading: false,
    lastNewVisible: 0,
    lastHotVisible: 0,
    hotTime: oneWeek,
    feedChoice: 'new',
    error: null,
  },
  following: {
    posts: [],
    fetchLoading: false,
    pullLoading: false,
    lastNewVisible: 0,
    lastHotVisible: 0,
    hotTime: oneWeek,
    feedChoice: 'new',
    error: null,
  },
  own: {
    posts: [],
    error: null,
    lastVisible: null,
    fetchLoading: false,
    pullLoading: false,
  },
  tagged: {
    posts: [],
    error: null,
    lastVisible: null,
    fetchLoading: false,
    pullLoading: false,
  },
  createPost: {
    loading: false,
    error: null,
  },
  deletePost: {
    loading: false,
    error: null,
  },
  likePost: {
    error: null,
  },
  unlikePost: {
    error: null,
  },
};

export default function postsReducer(
  state = initialState,
  action: PostAction,
): PostState {
  switch (action.type) {
    /* ----------------- public posts cases ----------------- */

    case DispatchTypes.SET_PUBLIC_FEED_CHOICE: {
      const newState = { ...state };
      newState.public.feedChoice = action.payload as 'new' | 'hot';

      // default hot time is 1 week ago
      newState.public.hotTime = oneWeek;

      // reset last visibles to 0 in order to refetch fresh posts
      newState.public.lastNewVisible = 0;
      newState.public.lastHotVisible = 0;
      newState.public.posts = [];
      return newState;
    }
    case DispatchTypes.SET_PUBLIC_HOTTIME: {
      const newState = { ...state };
      newState.public.hotTime = action.payload as number;

      // reset last hot visible to 0 in order to refetch fresh hot posts
      newState.public.lastHotVisible = 0;
      newState.public.posts = [];
      return newState;
    }
    case DispatchTypes.FETCH_PUBLIC_NEWPOSTS_STARTED: {
      const newState = { ...state };
      newState.public.fetchLoading = true;

      /**
       * When user switch from hot feed to new feed,
       * reset hot feed last visible to 0, the same
       * way also happen in hot feed. When user
       * switch, reset post list in order to
       * store freshly fetched new posts
       */
      newState.public.lastHotVisible = 0;
      if (newState.public.lastNewVisible === 0) {
        newState.public.posts = [];
      }
      return newState;
    }
    case DispatchTypes.FETCH_PUBLIC_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      const newPublicNewPosts = state.public.posts.concat(payload.posts);

      // ensure no duplicates
      newState.public.posts = removeDuplicatesFromArray(newPublicNewPosts);

      newState.public.lastNewVisible = payload.lastVisible;
      newState.public.fetchLoading = false;
      newState.public.pullLoading = false;
      newState.public.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_PUBLIC_NEWPOSTS_FAILURE: {
      const newState = { ...state };
      newState.public.error = action.payload as Error;
      newState.public.fetchLoading = false;
      newState.public.posts = [];
      newState.public.lastNewVisible = 0;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_PUBLIC_NEWPOSTS_STARTED:
    case DispatchTypes.PULL_TO_FETCH_PUBLIC_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.public.pullLoading = true;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_PUBLIC_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.public.posts = payload.posts;
      newState.public.lastNewVisible = payload.lastVisible;
      newState.public.error = null;
      newState.public.pullLoading = false;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_PUBLIC_NEWPOSTS_FAILURE:
    case DispatchTypes.PULL_TO_FETCH_PUBLIC_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.public.error = action.payload as Error;
      newState.public.posts = [];
      newState.public.pullLoading = false;
      return newState;
    }
    case DispatchTypes.FETCH_PUBLIC_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.public.fetchLoading = true;

      /**
       * When user switch from new feed to hot feed,
       * reset new feed last visible to 0, the same
       * way also happen in new feed. When user
       * switch, reset post list in order to
       * store freshly fetched hot posts
       */
      newState.public.lastNewVisible = 0;
      if (newState.public.lastHotVisible === 0) {
        newState.public.posts = [];
      }
      return newState;
    }
    case DispatchTypes.FETCH_PUBLIC_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      const newPublicHotPosts = state.public.posts.concat(payload.posts);

      // ensure no duplicates
      newState.public.posts = removeDuplicatesFromArray(newPublicHotPosts);
      newState.public.lastHotVisible = payload.lastVisible;
      newState.public.fetchLoading = false;
      newState.public.pullLoading = false;
      newState.public.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_PUBLIC_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.public.error = action.payload as Error;
      newState.public.fetchLoading = false;
      newState.public.posts = [];
      newState.public.lastHotVisible = 0;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_PUBLIC_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.public.posts = payload.posts;
      newState.public.lastHotVisible = payload.lastVisible;
      newState.public.pullLoading = false;
      newState.public.error = null;
      return newState;
    }

    /* --------------- end public posts cases --------------- */

    /* ---------------- following posts cases --------------- */
    case DispatchTypes.SET_FOLLOWING_FEED_CHOICE: {
      const newState = { ...state };
      newState.following.feedChoice = action.payload as 'new' | 'hot';

      // default hot time is 1 week ago
      newState.following.hotTime = oneWeek;

      // reset last visibles to 0 in order to refetch fresh posts
      newState.following.lastNewVisible = 0;
      newState.following.lastHotVisible = 0;
      newState.following.posts = [];
      return newState;
    }
    case DispatchTypes.SET_FOLLOWING_HOTTIME: {
      const newState = { ...state };
      newState.following.hotTime = action.payload as number;

      // reset last hot visible to 0 in order to refetch fresh hot posts
      newState.following.lastHotVisible = 0;
      newState.following.posts = [];
      return newState;
    }
    case DispatchTypes.FETCH_FOLLOWING_NEWPOSTS_STARTED: {
      const newState = { ...state };
      newState.following.fetchLoading = true;

      /**
       * When user switch from hot feed to new feed,
       * reset hot feed last visible to 0, the same
       * way also happen in hot feed. When user
       * switch, reset post list in order to
       * store freshly fetched new posts
       */
      newState.following.lastHotVisible = 0;
      if (newState.following.lastNewVisible === 0) {
        newState.following.posts = [];
      }
      return newState;
    }
    case DispatchTypes.FETCH_FOLLOWING_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      const newFollowingNewPosts = state.following.posts.concat(payload.posts);

      // ensure no duplicates
      newState.following.posts = removeDuplicatesFromArray(
        newFollowingNewPosts,
      );

      newState.following.lastNewVisible = payload.lastVisible;
      newState.following.fetchLoading = false;
      newState.following.pullLoading = false;
      newState.following.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_FOLLOWING_NEWPOSTS_FAILURE: {
      const newState = { ...state };
      newState.following.error = action.payload as Error;
      newState.following.fetchLoading = false;
      newState.following.posts = [];
      newState.following.lastNewVisible = 0;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_FOLLOWING_NEWPOSTS_STARTED:
    case DispatchTypes.PULL_TO_FETCH_FOLLOWING_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.following.pullLoading = true;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_FOLLOWING_NEWPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.following.posts = payload.posts;
      newState.following.lastNewVisible = payload.lastVisible;
      newState.following.pullLoading = false;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_FOLLOWING_NEWPOSTS_FAILURE:
    case DispatchTypes.PULL_TO_FETCH_FOLLOWING_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.following.error = action.payload as Error;
      newState.following.posts = [];
      newState.following.pullLoading = false;
      return newState;
    }
    case DispatchTypes.FETCH_FOLLOWING_HOTPOSTS_STARTED: {
      const newState = { ...state };
      newState.following.fetchLoading = true;

      /**
       * When user switch from new feed to hot feed,
       * reset new feed last visible to 0, the same
       * way also happen in new feed. When user
       * switch, reset post list in order to
       * store freshly fetched hot posts
       */
      newState.following.lastNewVisible = 0;
      if (newState.following.lastHotVisible === 0) {
        newState.following.posts = [];
      }
      return newState;
    }
    case DispatchTypes.FETCH_FOLLOWING_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      const newFollowingPosts = state.following.posts.concat(payload.posts);
      newState.following.posts = removeDuplicatesFromArray(newFollowingPosts);
      newState.following.lastHotVisible = payload.lastVisible;
      newState.following.fetchLoading = false;
      newState.following.pullLoading = false;
      newState.following.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_FOLLOWING_HOTPOSTS_FAILURE: {
      const newState = { ...state };
      newState.following.error = action.payload as Error;
      newState.following.fetchLoading = false;
      newState.following.posts = [];
      newState.following.lastHotVisible = 0;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS: {
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: number;
      };
      const newState = { ...state };
      newState.following.posts = payload.posts;
      newState.following.lastHotVisible = payload.lastVisible;
      newState.following.pullLoading = false;
      return newState;
    }
    /* -------------- end following posts cases ------------- */

    /* ------------------ own posts cases ------------------ */
    case DispatchTypes.FETCH_OWN_POSTS_STARTED: {
      const newState = { ...state };
      newState.own.fetchLoading = true;
      return newState;
    }
    case DispatchTypes.FETCH_OWN_POSTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
      };
      const newOwnPosts = state.own.posts.concat(payload.posts);

      // ensure no duplicates
      newState.own.posts = removeDuplicatesFromArray(newOwnPosts);

      newState.own.lastVisible = payload.lastVisible;
      newState.own.fetchLoading = false;
      newState.own.pullLoading = false;
      newState.own.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_OWN_POSTS_FAILURE: {
      const newState = { ...state };
      newState.own.fetchLoading = false;
      newState.own.error = action.payload as Error;
      newState.own.posts = [];
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_OWN_POSTS_STARTED: {
      const newState = { ...state };
      newState.own.pullLoading = true;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_OWN_POSTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
      };
      newState.own.pullLoading = false;
      newState.own.posts = payload.posts;
      newState.own.lastVisible = payload.lastVisible;
      newState.own.error = null;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_OWN_POSTS_FAILURE: {
      const newState = { ...state };
      newState.own.pullLoading = false;
      newState.own.error = action.payload as Error;
      newState.own.posts = [];
      return newState;
    }
    /* ---------------- end own posts cases ---------------- */

    /* ----------------- tagged posts cases ----------------- */

    case DispatchTypes.FETCH_TAGGED_POSTS_STARTED: {
      const newState = { ...state };
      newState.tagged.fetchLoading = true;
      return newState;
    }
    case DispatchTypes.FETCH_TAGGED_POSTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
      };
      newState.tagged.fetchLoading = false;
      newState.tagged.posts = state.tagged.posts.concat(payload.posts);
      newState.tagged.lastVisible = payload.lastVisible;
      newState.tagged.pullLoading = false;
      newState.tagged.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_TAGGED_POSTS_FAILURE: {
      const newState = { ...state };
      newState.tagged.fetchLoading = false;
      newState.tagged.error = action.payload as Error;
      newState.tagged.posts = [];
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_TAGGED_POSTS_STARTED: {
      const newState = { ...state };
      newState.tagged.pullLoading = true;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_TAGGED_POSTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
      };
      newState.tagged.pullLoading = false;
      newState.tagged.posts = payload.posts;
      newState.tagged.lastVisible = payload.lastVisible;
      newState.tagged.error = null;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_TAGGED_POSTS_FAILURE: {
      const newState = { ...state };
      newState.tagged.pullLoading = false;
      newState.tagged.error = action.payload as Error;
      newState.tagged.posts = [];
      return newState;
    }

    /* --------------- end tagged posts cases --------------- */

    /* ------------------ create post cases ----------------- */

    case DispatchTypes.CREATE_POST_STARTED: {
      const newState = { ...state };
      const pendingPost = action.payload as Post;
      const publicPosts = [...state.public.posts];
      const ownPosts = [...state.own.posts];
      const followingPosts = [...state.following.posts];

      // ensure no pending post
      const filteredPendingPublicPosts = publicPosts.filter(
        (post) => post.id !== pendingPostID,
      );
      const filteredPendingFollowingPosts = followingPosts.filter(
        (post) => post.id !== pendingPostID,
      );
      const filteredPendingOwnPosts = ownPosts.filter(
        (post) => post.id !== pendingPostID,
      );

      // add pending post to front of list
      filteredPendingPublicPosts.unshift(pendingPost);
      filteredPendingFollowingPosts.unshift(pendingPost);
      filteredPendingOwnPosts.unshift(pendingPost);

      switch (pendingPost.privacy) {
        case 'public': {
          newState.public.posts = filteredPendingPublicPosts;
          newState.following.posts = filteredPendingFollowingPosts;
          newState.own.posts = filteredPendingOwnPosts;
          break;
        }
        case 'followers': {
          newState.following.posts = filteredPendingFollowingPosts;
          newState.own.posts = filteredPendingOwnPosts;
          break;
        }
        default: {
          newState.own.posts = filteredPendingOwnPosts;
          break;
        }
      }

      newState.createPost.loading = true;
      return newState;
    }
    case DispatchTypes.CREATE_POST_SUCCESS: {
      const newState = { ...state };
      const newPost = action.payload as Post;
      const publicPosts = [...state.public.posts];
      const ownPosts = [...state.own.posts];
      const followingPosts = [...state.following.posts];

      const publicPendingPostIndex = publicPosts.findIndex(
        (post) => post.id === pendingPostID,
      );
      const followingPendingPostIndex = followingPosts.findIndex(
        (post) => post.id === pendingPostID,
      );
      const ownPendingPostIndex = ownPosts.findIndex(
        (post) => post.id === pendingPostID,
      );

      if (publicPendingPostIndex !== -1) {
        publicPosts[publicPendingPostIndex] = newPost;
      } else {
        publicPosts.unshift(newPost);
      }
      if (followingPendingPostIndex !== -1) {
        followingPosts[followingPendingPostIndex] = newPost;
      } else {
        followingPosts.unshift(newPost);
      }
      if (ownPendingPostIndex !== -1) {
        ownPosts[ownPendingPostIndex] = newPost;
      } else {
        ownPosts.unshift(newPost);
      }

      // ensure no pending post
      const filteredPendingPulicPosts = publicPosts.filter(
        (post) => post.id !== pendingPostID,
      );
      const filteredPendingFollowingPosts = followingPosts.filter(
        (post) => post.id !== pendingPostID,
      );
      const filteredPendingOwnPosts = ownPosts.filter(
        (post) => post.id !== pendingPostID,
      );

      // ensure no duplicates
      const removedDuplicatesFromPublicPosts = removeDuplicatesFromArray(
        filteredPendingPulicPosts,
      );
      const removedDuplicatesFromFollowingPosts = removeDuplicatesFromArray(
        filteredPendingFollowingPosts,
      );
      const removedDuplicatesFromOwnPosts = removeDuplicatesFromArray(
        filteredPendingOwnPosts,
      );

      switch (newPost.privacy) {
        case 'public': {
          newState.public.posts = removedDuplicatesFromPublicPosts;
          newState.following.posts = removedDuplicatesFromFollowingPosts;
          newState.own.posts = removedDuplicatesFromOwnPosts;
          break;
        }
        case 'followers': {
          newState.following.posts = removedDuplicatesFromFollowingPosts;
          newState.own.posts = removedDuplicatesFromOwnPosts;
          break;
        }
        default: {
          newState.own.posts = removedDuplicatesFromOwnPosts;
          break;
        }
      }

      newState.createPost.loading = false;
      newState.createPost.error = null;
      return newState;
    }
    case DispatchTypes.CREATE_POST_FAILURE: {
      const newState = { ...state };
      const publicPosts = [...state.public.posts];
      const ownPosts = [...state.own.posts];
      const followingPosts = [...state.following.posts];

      const filteredPendingPublicPosts = publicPosts.filter(
        (post) => post.id !== pendingPostID,
      );
      const filteredPendingFollowingPosts = followingPosts.filter(
        (post) => post.id !== pendingPostID,
      );
      const filteredPendingOwnPosts = ownPosts.filter(
        (post) => post.id !== pendingPostID,
      );
      newState.public.posts = filteredPendingPublicPosts;
      newState.following.posts = filteredPendingFollowingPosts;
      newState.own.posts = filteredPendingOwnPosts;
      newState.createPost.error = action.payload as Error;
      newState.createPost.loading = false;
      return newState;
    }

    /* ---------------- end create post cases --------------- */

    /* ------------------ delete post cases ----------------- */

    case DispatchTypes.DELETE_POST_STARTED: {
      const newState = { ...state };
      const postID = action.payload as string;
      const publicPosts = [...state.public.posts];
      const followingPosts = [...state.following.posts];
      const ownPosts = [...state.own.posts];

      const publicIndex = publicPosts.findIndex((post) => post.id === postID);
      const followingIndex = followingPosts.findIndex(
        (post) => post.id === postID,
      );
      const ownPostIndex = ownPosts.findIndex((post) => post.id === postID);

      if (publicIndex !== -1) {
        const post = { ...publicPosts[publicIndex] };
        post.id += pendingDeletePostFlag;
        publicPosts[publicIndex] = post;
      }
      if (followingIndex !== -1) {
        const post = { ...followingPosts[followingIndex] };
        post.id += pendingDeletePostFlag;
        followingPosts[followingIndex] = post;
      }
      if (ownPostIndex !== -1) {
        const post = { ...ownPosts[ownPostIndex] };
        post.id += pendingDeletePostFlag;
        ownPosts[ownPostIndex] = post;
      }
      newState.deletePost.loading = true;
      newState.public.posts = publicPosts;
      newState.following.posts = followingPosts;
      newState.own.posts = ownPosts;
      return newState;
    }
    case DispatchTypes.DELETE_POST_SUCCESS: {
      const newState = { ...state };
      const postID = action.payload as string;
      const postIDPlusPendingDeleteFlag = postID + pendingDeletePostFlag;
      const publicPosts = [...state.public.posts];
      const followingPosts = [...state.following.posts];
      const ownPosts = [...state.own.posts];

      const publicIndex = publicPosts.findIndex(
        (post) => post.id === postID || post.id === postIDPlusPendingDeleteFlag,
      );
      const followingIndex = followingPosts.findIndex(
        (post) => post.id === postID || post.id === postIDPlusPendingDeleteFlag,
      );
      const ownPostIndex = ownPosts.findIndex(
        (post) => post.id === postID || post.id === postIDPlusPendingDeleteFlag,
      );
      if (publicIndex !== -1) {
        publicPosts.splice(publicIndex, 1);
      }
      if (followingIndex !== -1) {
        followingPosts.splice(followingIndex, 1);
      }
      if (ownPostIndex !== -1) {
        ownPosts.splice(ownPostIndex, 1);
      }

      newState.deletePost.loading = false;
      newState.deletePost.error = null;
      newState.public.posts = publicPosts;
      newState.following.posts = followingPosts;
      newState.own.posts = ownPosts;
      return newState;
    }
    case DispatchTypes.DELETE_POST_FAILURE: {
      const newState = { ...state };
      const payload = action.payload as { error: Error; postID: string };
      newState.deletePost.loading = false;
      newState.deletePost.error = payload.error;

      const postIDPlusPendingDeleteFlag =
        payload.postID + pendingDeletePostFlag;

      const publicPosts = [...state.public.posts];
      const followingPosts = [...state.following.posts];
      const ownPosts = [...state.own.posts];

      const publicPostIndex = publicPosts.findIndex(
        (post) => post.id === postIDPlusPendingDeleteFlag,
      );
      const followingPostIndex = followingPosts.findIndex(
        (post) => post.id === postIDPlusPendingDeleteFlag,
      );
      const ownPostIndex = ownPosts.findIndex(
        (post) => post.id === postIDPlusPendingDeleteFlag,
      );

      if (publicPostIndex !== -1) {
        const post = { ...publicPosts[publicPostIndex] };
        post.id = payload.postID;
        publicPosts[publicPostIndex] = post;
      }
      if (followingPostIndex !== -1) {
        const post = { ...followingPosts[followingPostIndex] };
        post.id = payload.postID;
        followingPosts[followingPostIndex] = post;
      }
      if (ownPostIndex !== -1) {
        const post = { ...ownPosts[ownPostIndex] };
        post.id = payload.postID;
        ownPosts[ownPostIndex] = post;
      }

      newState.public.posts = publicPosts;
      newState.following.posts = followingPosts;
      newState.own.posts = ownPosts;
      return newState;
    }

    /* ---------------- end delete post cases --------------- */

    /* ------------------- like post cases ------------------ */

    case DispatchTypes.LIKE_POST_STARTED: {
      const newState = { ...state };
      const publicPosts = [...state.public.posts];
      const followingPosts = [...state.following.posts];
      const ownPosts = [...state.own.posts];
      const taggedPosts = [...state.tagged.posts];
      const postID = action.payload as string;
      newState.likePost.error = null;

      const publicPostIndex = publicPosts.findIndex(
        (post) => post.id === postID,
      );
      const followingPostIndex = followingPosts.findIndex(
        (post) => post.id === postID,
      );
      const ownPostIndex = ownPosts.findIndex((post) => post.id === postID);
      const taggedPostIndex = taggedPosts.findIndex(
        (post) => post.id === postID,
      );

      if (publicPostIndex !== -1) {
        const post = { ...publicPosts[publicPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        publicPosts[publicPostIndex] = post;
      }
      if (followingPostIndex !== -1) {
        const post = { ...followingPosts[followingPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        followingPosts[followingPostIndex] = post;
      }
      if (ownPostIndex !== -1) {
        const post = { ...ownPosts[ownPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        ownPosts[ownPostIndex] = post;
      }
      if (taggedPostIndex !== -1) {
        const post = { ...taggedPosts[taggedPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        taggedPosts[taggedPostIndex] = post;
      }

      newState.public.posts = publicPosts;
      newState.following.posts = followingPosts;
      newState.own.posts = ownPosts;
      newState.tagged.posts = taggedPosts;
      return newState;
    }
    case DispatchTypes.LIKE_POST_SUCCESS: {
      return state;
    }
    case DispatchTypes.LIKE_POST_FAILURE: {
      const newState = { ...state };
      const publicPosts = [...state.public.posts];
      const followingPosts = [...state.following.posts];
      const ownPosts = [...state.own.posts];
      const taggedPosts = [...state.tagged.posts];
      const payload = action.payload as { error: Error | null; postID: string };

      newState.likePost.error = payload.error;
      if (payload.postID === '') {
        return newState;
      }

      const publicPostIndex = publicPosts.findIndex(
        (post) => post.id === payload.postID,
      );
      const followingPostIndex = followingPosts.findIndex(
        (post) => post.id === payload.postID,
      );
      const ownPostIndex = ownPosts.findIndex(
        (post) => post.id === payload.postID,
      );
      const taggedPostIndex = taggedPosts.findIndex(
        (post) => post.id === payload.postID,
      );

      if (publicPostIndex !== -1) {
        const post = { ...publicPosts[publicPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        publicPosts[publicPostIndex] = post;
      }
      if (followingPostIndex !== -1) {
        const post = { ...followingPosts[followingPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        followingPosts[followingPostIndex] = post;
      }
      if (ownPostIndex !== -1) {
        const post = { ...ownPosts[ownPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        ownPosts[ownPostIndex] = post;
      }
      if (taggedPostIndex !== -1) {
        const post = { ...taggedPosts[taggedPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        taggedPosts[taggedPostIndex] = post;
      }

      newState.public.posts = publicPosts;
      newState.following.posts = followingPosts;
      newState.own.posts = ownPosts;
      newState.tagged.posts = taggedPosts;
      return newState;
    }

    /* ----------------- end like post cases ---------------- */

    /* ------------------ unlike post cases ----------------- */
    case DispatchTypes.UNLIKE_POST_STARTED: {
      const newState = { ...state };
      const publicPosts = [...state.public.posts];
      const followingPosts = [...state.following.posts];
      const ownPosts = [...state.own.posts];
      const taggedPosts = [...state.tagged.posts];
      const postID = action.payload as string;
      newState.unlikePost.error = null;

      const publicPostIndex = publicPosts.findIndex(
        (post) => post.id === postID,
      );
      const followingPostIndex = followingPosts.findIndex(
        (post) => post.id === postID,
      );
      const ownPostIndex = ownPosts.findIndex((post) => post.id === postID);
      const taggedPostIndex = taggedPosts.findIndex(
        (post) => post.id === postID,
      );

      if (publicPostIndex !== -1) {
        const post = { ...publicPosts[publicPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        publicPosts[publicPostIndex] = post;
      }
      if (followingPostIndex !== -1) {
        const post = { ...followingPosts[followingPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        followingPosts[followingPostIndex] = post;
      }
      if (ownPostIndex !== -1) {
        const post = { ...ownPosts[ownPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        ownPosts[ownPostIndex] = post;
      }
      if (taggedPostIndex !== -1) {
        const post = { ...taggedPosts[taggedPostIndex] };
        post.likes -= 1;
        post.isLiked = false;
        taggedPosts[taggedPostIndex] = post;
      }

      newState.public.posts = publicPosts;
      newState.following.posts = followingPosts;
      newState.own.posts = ownPosts;
      newState.tagged.posts = taggedPosts;
      return newState;
    }
    case DispatchTypes.UNLIKE_POST_SUCCESS: {
      return state;
    }
    case DispatchTypes.UNLIKE_POST_FAILURE: {
      const newState = { ...state };
      const publicPosts = [...state.public.posts];
      const followingPosts = [...state.following.posts];
      const ownPosts = [...state.own.posts];
      const taggedPosts = [...state.tagged.posts];
      const payload = action.payload as { error: Error | null; postID: string };

      newState.unlikePost.error = payload.error;
      if (payload.postID === '') {
        return newState;
      }

      const publicPostIndex = publicPosts.findIndex(
        (post) => post.id === payload.postID,
      );
      const followingPostIndex = followingPosts.findIndex(
        (post) => post.id === payload.postID,
      );
      const ownPostIndex = ownPosts.findIndex(
        (post) => post.id === payload.postID,
      );
      const taggedPostIndex = taggedPosts.findIndex(
        (post) => post.id === payload.postID,
      );

      if (publicPostIndex !== -1) {
        const post = { ...publicPosts[publicPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        publicPosts[publicPostIndex] = post;
      }
      if (followingPostIndex !== -1) {
        const post = { ...followingPosts[followingPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        followingPosts[followingPostIndex] = post;
      }
      if (ownPostIndex !== -1) {
        const post = { ...ownPosts[ownPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        ownPosts[ownPostIndex] = post;
      }
      if (taggedPostIndex !== -1) {
        const post = { ...taggedPosts[taggedPostIndex] };
        post.likes += 1;
        post.isLiked = true;
        taggedPosts[taggedPostIndex] = post;
      }

      newState.public.posts = publicPosts;
      newState.following.posts = followingPosts;
      newState.own.posts = ownPosts;
      newState.tagged.posts = taggedPosts;
      return newState;
    }
    /* ---------------- end unlike post cases --------------- */

    /* --------------------- clear cases -------------------- */

    case DispatchTypes.CLEAR_CREATE_POST_ERROR: {
      const newState = { ...state };
      newState.createPost.error = null;
      return newState;
    }
    case DispatchTypes.CLEAR_DELETE_POST_ERROR: {
      const newState = { ...state };
      newState.deletePost.error = null;
      return newState;
    }
    case DispatchTypes.CLEAR_LIKE_POST_ERROR: {
      const newState = { ...state };
      newState.likePost.error = null;
      return newState;
    }
    case DispatchTypes.CLEAR_UNLIKE_POST_ERROR: {
      const newState = { ...state };
      newState.unlikePost.error = null;
      return newState;
    }

    /* ------------------- end clear cases ------------------ */

    // /* ----------------- end like post cases ---------------- */

    // case SET_PUBLIC_HOTTIME: {
    //   const newState = { ...state };
    //   newState.public.hotTime = action.payload as number;
    //   newState.public.lastHotVisible = 0;
    //   newState.public.posts = [];
    //   return newState;
    // }
    // case SET_FOLLOWING_HOTTIME: {
    //   const newState = { ...state };
    //   newState.following.hotTime = action.payload as number;
    //   newState.following.lastHotVisible = 0;
    //   newState.following.posts = [];
    //   return newState;
    // }
    // case SET_PUBLIC_FEED_CHOICE: {
    //   const newState = { ...state };
    //   newState.public.feedChoice = action.payload as string;
    //   newState.public.hotTime = oneWeek;
    //   newState.public.lastHotVisible = 0;
    //   newState.public.posts = [];
    //   return newState;
    // }
    // case SET_FOLLOWING_FEED_CHOICE: {
    //   const newState = { ...state };
    //   newState.following.feedChoice = action.payload as string;
    //   newState.following.hotTime = oneWeek;
    //   newState.following.lastHotVisible = 0;
    //   newState.following.posts = [];
    //   return newState;
    // }

    // case INCREASE_COMMENTS_BY_NUMBER: {
    //   const newState = { ...state };
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const taggedPosts = [...state.taggedPosts.posts];
    //   const payload = action.payload as { postID: string; by: number };
    //   newState.likePost.error = null;

    //   const publicPostIndex = publicPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );
    //   const followingPostIndex = followingPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );
    //   const userPostIndex = userPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );
    //   const taggedPostIndex = taggedPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );

    //   if (publicPostIndex !== -1) {
    //     const post = { ...publicPosts[publicPostIndex] };
    //     post.comments += payload.by;
    //     publicPosts[publicPostIndex] = post;
    //   }
    //   if (followingPostIndex !== -1) {
    //     const post = { ...followingPosts[followingPostIndex] };
    //     post.comments += payload.by;
    //     followingPosts[followingPostIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.comments += payload.by;
    //     userPosts[userPostIndex] = post;
    //   }
    //   if (taggedPostIndex !== -1) {
    //     const post = { ...taggedPosts[taggedPostIndex] };
    //     post.comments += payload.by;
    //     taggedPosts[taggedPostIndex] = post;
    //   }

    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   newState.taggedPosts.posts = taggedPosts;
    //   return newState;
    // }

    // case DECREASE_COMMENTS_BY_NUMBER: {
    //   const newState = { ...state };
    //   const payload = action.payload as { postID: string; by: number };
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const taggedPosts = [...state.taggedPosts.posts];
    //   newState.likePost.error = null;

    //   const publicPostIndex = publicPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );
    //   const followingPostIndex = followingPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );
    //   const userPostIndex = userPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );
    //   const taggedPostIndex = taggedPosts.findIndex(
    //     (post) => post.id === payload.postID,
    //   );

    //   if (publicPostIndex !== -1) {
    //     const post = { ...publicPosts[publicPostIndex] };
    //     post.comments -= payload.by;
    //     publicPosts[publicPostIndex] = post;
    //   }
    //   if (followingPostIndex !== -1) {
    //     const post = { ...followingPosts[followingPostIndex] };
    //     post.comments -= payload.by;
    //     followingPosts[followingPostIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.comments -= payload.by;
    //     userPosts[userPostIndex] = post;
    //   }
    //   if (taggedPostIndex !== -1) {
    //     const post = { ...taggedPosts[taggedPostIndex] };
    //     post.comments -= payload.by;
    //     taggedPosts[taggedPostIndex] = post;
    //   }

    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   newState.taggedPosts.posts = taggedPosts;
    //   return newState;
    // }
    // case CLEAR_CREATE_POST_ERROR: {
    //   const newState = { ...state };
    //   newState.createPost.error = null;
    //   return newState;
    // }
    // case CLEAR_DELETE_POST_ERROR: {
    //   const newState = { ...state };
    //   newState.deletePost.error = null;
    //   return newState;
    // }
    // case CLEAR_LIKE_POST_ERROR: {
    //   const newState = { ...state };
    //   newState.likePost.error = null;
    //   return newState;
    // }
    // case CLEAR_UNLIKE_POST_ERROR: {
    //   const newState = { ...state };
    //   newState.unlikePost.error = null;
    //   return newState;
    // }
    case DispatchTypes.CLEAR:
      return untouchedState;
    default:
      return state;
  }
}
