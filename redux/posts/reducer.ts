import { DispatchTypes, PostState, PostAction } from './types';
import { oneWeek, pendingDeletePostFlag, pendingPostID } from '../../constants';
import { removeDuplicatesFromArray } from '../../utils/functions';
import { Post } from '../../models';

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
  userPosts: {
    posts: [],
    lastVisible: 0,
    fetchLoading: false,
    pullLoading: false,
    error: null,
  },
  taggedPosts: {
    posts: [],
    lastVisible: 0,
    fetchLoading: false,
    pullLoading: false,
    error: null,
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
  userPosts: {
    posts: [],
    lastVisible: 0,
    fetchLoading: false,
    pullLoading: false,
    error: null,
  },
  taggedPosts: {
    posts: [],
    lastVisible: 0,
    fetchLoading: false,
    pullLoading: false,
    error: null,
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

    // case PULL_TO_FETCH_FOLLOWING_HOTPOSTS_SUCCESS: {
    //   const payload = action.payload as {
    //     posts: Array<Post>;
    //     lastVisible: number;
    //   };
    //   const newState = { ...state };
    //   newState.following.posts = payload.posts;
    //   newState.following.lastHotVisible = payload.lastVisible;
    //   newState.following.pullLoading = false;
    //   return newState;
    // }

    // /* -------------- end following posts cases ------------- */

    // /* ------------------ user posts cases ------------------ */

    // case FETCH_USER_POSTS_STARTED: {
    //   const newState = { ...state };
    //   newState.userPosts.loading = true;
    //   newState.userPosts.error = null;
    //   return newState;
    // }
    // case FETCH_USER_POSTS_SUCCESS: {
    //   const payload = action.payload as {
    //     posts: Array<any>;
    //     lastVisible: number;
    //   };

    //   const newState = { ...state };
    //   const newUserPosts = newState.userPosts.posts.concat(payload.posts);
    //   const filteredNewUserPosts = newUserPosts.filter(
    //     (post) =>
    //       post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
    //   );

    //   // ensure no duplicates
    //   const removedDuplicates = removeDuplicatesFromArray(filteredNewUserPosts);

    //   newState.userPosts.posts = removedDuplicates;
    //   newState.userPosts.lastVisible = payload.lastVisible;
    //   newState.userPosts.loading = false;
    //   return newState;
    // }
    // case FETCH_USER_POSTS_FAILURE: {
    //   const newState = { ...state };
    //   newState.userPosts.error = action.payload as Error;
    //   newState.userPosts.posts = [];
    //   newState.userPosts.loading = false;
    //   return newState;
    // }
    // case FETCH_USER_POSTS_END: {
    //   const newState = { ...state };
    //   newState.userPosts.loading = false;
    //   return newState;
    // }
    // case PULL_TO_FETCH_USER_POSTS_STARTED: {
    //   const newState = { ...state };
    //   newState.userPosts.pullLoading = true;
    //   return newState;
    // }
    // case PULL_TO_FETCH_USER_POSTS_SUCCESS: {
    //   const payload = action.payload as {
    //     posts: Array<any>;
    //     lastVisible: number;
    //   };
    //   const newState = { ...state };
    //   newState.userPosts.posts = payload.posts;
    //   newState.userPosts.lastVisible = payload.lastVisible;
    //   newState.userPosts.pullLoading = false;
    //   return newState;
    // }
    // case PULL_TO_FETCH_USER_POSTS_FAILURE: {
    //   const newState = { ...state };
    //   newState.userPosts.error = action.payload as Error;
    //   newState.userPosts.posts = [];
    //   newState.userPosts.pullLoading = false;
    //   return newState;
    // }

    // /* ---------------- end user posts cases ---------------- */

    // /* ----------------- tagged posts cases ----------------- */

    // case FETCH_TAGGED_POSTS_STARTED: {
    //   const newState = { ...state };
    //   newState.taggedPosts.loading = true;
    //   newState.taggedPosts.error = null;
    //   return newState;
    // }
    // case FETCH_TAGGED_POSTS_SUCCESS: {
    //   const payload = action.payload as {
    //     posts: Array<any>;
    //     lastVisible: number;
    //   };

    //   const newState = { ...state };
    //   const newTaggedPosts = newState.taggedPosts.posts.concat(payload.posts);
    //   const filteredNewTaggedPosts = newTaggedPosts.filter(
    //     (post) =>
    //       post.id !== pendingPostID && !post.id.includes(pendingDeletePostFlag),
    //   );

    //   // ensure no duplicates
    //   const removedDuplicates = removeDuplicatesFromArray(
    //     filteredNewTaggedPosts,
    //   );

    //   newState.taggedPosts.posts = removedDuplicates;
    //   newState.taggedPosts.lastVisible = payload.lastVisible;
    //   newState.taggedPosts.loading = false;
    //   return newState;
    // }
    // case FETCH_TAGGED_POSTS_FAILURE: {
    //   const newState = { ...state };
    //   newState.taggedPosts.error = action.payload as Error;
    //   newState.taggedPosts.posts = [];
    //   newState.taggedPosts.loading = false;
    //   return newState;
    // }
    // case FETCH_TAGGED_POSTS_END: {
    //   const newState = { ...state };
    //   newState.taggedPosts.loading = false;
    //   return newState;
    // }
    // case PULL_TO_FETCH_TAGGED_POSTS_STARTED: {
    //   const newState = { ...state };
    //   newState.taggedPosts.pullLoading = true;
    //   return newState;
    // }
    // case PULL_TO_FETCH_TAGGED_POSTS_SUCCESS: {
    //   const payload = action.payload as {
    //     posts: Array<any>;
    //     lastVisible: number;
    //   };
    //   const newState = { ...state };
    //   newState.taggedPosts.posts = payload.posts;
    //   newState.taggedPosts.lastVisible = payload.lastVisible;
    //   newState.taggedPosts.pullLoading = false;
    //   return newState;
    // }
    // case PULL_TO_FETCH_TAGGED_POSTS_FAILURE: {
    //   const newState = { ...state };
    //   newState.taggedPosts.error = action.payload as Error;
    //   newState.taggedPosts.posts = [];
    //   newState.taggedPosts.pullLoading = false;
    //   return newState;
    // }

    // /* --------------- end tagged posts cases --------------- */

    // /* ------------------ create post cases ----------------- */

    // case CREATE_POST_STARTED: {
    //   const newState = { ...state };
    //   const pendingPost = action.payload as Post;
    //   const publicPosts = [...state.public.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const followingPosts = [...state.following.posts];

    //   // ensure no pending post
    //   const filteredPendingPublicPosts = publicPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );
    //   const filteredPendingFollowingPosts = followingPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );
    //   const filteredPendingUserPosts = userPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );

    //   filteredPendingPublicPosts.unshift(pendingPost);
    //   filteredPendingFollowingPosts.unshift(pendingPost);
    //   filteredPendingUserPosts.unshift(pendingPost);

    //   switch (pendingPost.privacy) {
    //     case 'public': {
    //       newState.public.posts = filteredPendingPublicPosts;
    //       newState.following.posts = filteredPendingFollowingPosts;
    //       newState.userPosts.posts = filteredPendingUserPosts;
    //       break;
    //     }
    //     case 'followers': {
    //       newState.following.posts = filteredPendingFollowingPosts;
    //       newState.userPosts.posts = filteredPendingUserPosts;
    //       break;
    //     }
    //     default: {
    //       newState.userPosts.posts = filteredPendingUserPosts;
    //       break;
    //     }
    //   }

    //   newState.createPost.error = null;
    //   newState.createPost.loading = true;

    //   return newState;
    // }
    // case CREATE_POST_SUCCESS: {
    //   const newState = { ...state };
    //   const pendingPost = action.payload as Post;
    //   const publicPosts = [...state.public.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const followingPosts = [...state.following.posts];

    //   const publicPendingPostIndex = publicPosts.findIndex(
    //     (post) => post.id === pendingPostID,
    //   );
    //   const followingPendingPostIndex = followingPosts.findIndex(
    //     (post) => post.id === pendingPostID,
    //   );
    //   const userPendingPostIndex = userPosts.findIndex(
    //     (post) => post.id === pendingPostID,
    //   );

    //   if (publicPendingPostIndex !== -1) {
    //     publicPosts[publicPendingPostIndex] = pendingPost;
    //   } else {
    //     publicPosts.unshift(pendingPost);
    //   }
    //   if (followingPendingPostIndex !== -1) {
    //     followingPosts[followingPendingPostIndex] = pendingPost;
    //   } else {
    //     followingPosts.unshift(pendingPost);
    //   }
    //   if (userPendingPostIndex !== -1) {
    //     userPosts[userPendingPostIndex] = pendingPost;
    //   } else {
    //     userPosts.unshift(pendingPost);
    //   }

    //   // ensure no pending post
    //   const filteredPendingPulicPosts = publicPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );
    //   const filteredPendingFollowingPosts = followingPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );
    //   const filteredPendingUserPosts = userPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );

    //   // ensure no duplicates
    //   const removedDuplicatesFromPublicPosts = removeDuplicatesFromArray(
    //     filteredPendingPulicPosts,
    //   );
    //   const removedDuplicatesFromFollowingPosts = removeDuplicatesFromArray(
    //     filteredPendingFollowingPosts,
    //   );
    //   const removedDuplicatesFromUserPosts = removeDuplicatesFromArray(
    //     filteredPendingUserPosts,
    //   );

    //   switch (pendingPost.privacy) {
    //     case 'public': {
    //       newState.public.posts = removedDuplicatesFromPublicPosts;
    //       newState.following.posts = removedDuplicatesFromFollowingPosts;
    //       newState.userPosts.posts = removedDuplicatesFromUserPosts;
    //       break;
    //     }
    //     case 'followers': {
    //       newState.following.posts = removedDuplicatesFromFollowingPosts;
    //       newState.userPosts.posts = removedDuplicatesFromUserPosts;
    //       break;
    //     }
    //     default: {
    //       newState.userPosts.posts = removedDuplicatesFromUserPosts;
    //       break;
    //     }
    //   }

    //   newState.createPost.loading = false;
    //   newState.createPost.error = null;
    //   return newState;
    // }
    // case CREATE_POST_FAILURE: {
    //   const newState = { ...state };
    //   const publicPosts = [...state.public.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const followingPosts = [...state.following.posts];

    //   const filteredPendingPublicPosts = publicPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );
    //   const filteredPendingFollowingPosts = followingPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );
    //   const filteredPendingUserPosts = userPosts.filter(
    //     (post) => post.id !== pendingPostID,
    //   );
    //   newState.public.posts = filteredPendingPublicPosts;
    //   newState.following.posts = filteredPendingFollowingPosts;
    //   newState.userPosts.posts = filteredPendingUserPosts;
    //   newState.createPost.error = action.payload as Error;
    //   newState.createPost.loading = false;
    //   return newState;
    // }

    // /* ---------------- end create post cases --------------- */

    // /* ------------------ delete post cases ----------------- */

    // case DELETE_POST_STARTED: {
    //   const newState = { ...state };
    //   const postID = action.payload as string;
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];

    //   const publicIndex = publicPosts.findIndex((post) => post.id === postID);
    //   const followingIndex = followingPosts.findIndex(
    //     (post) => post.id === postID,
    //   );
    //   const userPostIndex = userPosts.findIndex((post) => post.id === postID);

    //   if (publicIndex !== -1) {
    //     const post = { ...publicPosts[publicIndex] };
    //     post.id += pendingDeletePostFlag;
    //     publicPosts[publicIndex] = post;
    //   }
    //   if (followingIndex !== -1) {
    //     const post = { ...followingPosts[followingIndex] };
    //     post.id += pendingDeletePostFlag;
    //     followingPosts[followingIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.id += pendingDeletePostFlag;
    //     userPosts[userPostIndex] = post;
    //   }
    //   newState.deletePost.loading = true;
    //   newState.deletePost.error = null;
    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   return newState;
    // }
    // case DELETE_POST_SUCCESS: {
    //   const newState = { ...state };
    //   const postID = action.payload as string;
    //   const postIDPlusPendingDeleteFlag = postID + pendingDeletePostFlag;
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];

    //   const publicIndex = publicPosts.findIndex(
    //     (post) => post.id === postID || post.id === postIDPlusPendingDeleteFlag,
    //   );
    //   const followingIndex = followingPosts.findIndex(
    //     (post) => post.id === postID || post.id === postIDPlusPendingDeleteFlag,
    //   );
    //   const userPostIndex = userPosts.findIndex(
    //     (post) => post.id === postID || post.id === postIDPlusPendingDeleteFlag,
    //   );
    //   if (publicIndex !== -1) {
    //     publicPosts.splice(publicIndex, 1);
    //   }
    //   if (followingIndex !== -1) {
    //     followingPosts.splice(followingIndex, 1);
    //   }
    //   if (userPostIndex !== -1) {
    //     userPosts.splice(userPostIndex, 1);
    //   }

    //   newState.deletePost.loading = false;
    //   newState.deletePost.error = null;
    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   return newState;
    // }
    // case DELETE_POST_FAILURE: {
    //   const newState = { ...state };
    //   const payload = action.payload as { error: Error | null; postID: string };
    //   newState.deletePost.loading = false;
    //   newState.deletePost.error = payload.error;
    //   if (payload.postID === '') {
    //     return newState;
    //   }

    //   const postIDPlusPendingDeleteFlag =
    //     payload.postID + pendingDeletePostFlag;

    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];

    //   const publicPostIndex = publicPosts.findIndex(
    //     (post) => post.id === postIDPlusPendingDeleteFlag,
    //   );
    //   const followingPostIndex = followingPosts.findIndex(
    //     (post) => post.id === postIDPlusPendingDeleteFlag,
    //   );
    //   const userPostIndex = userPosts.findIndex(
    //     (post) => post.id === postIDPlusPendingDeleteFlag,
    //   );

    //   if (publicPostIndex !== -1) {
    //     const post = { ...publicPosts[publicPostIndex] };
    //     post.id = payload.postID;
    //     publicPosts[publicPostIndex] = post;
    //   }
    //   if (followingPostIndex !== -1) {
    //     const post = { ...followingPosts[followingPostIndex] };
    //     post.id = payload.postID;
    //     followingPosts[followingPostIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.id = payload.postID;
    //     userPosts[userPostIndex] = post;
    //   }

    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   return newState;
    // }

    // /* ---------------- end delete post cases --------------- */

    // /* ------------------- like post cases ------------------ */

    // case LIKE_POST_STARTED: {
    //   const newState = { ...state };
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const taggedPosts = [...state.taggedPosts.posts];
    //   const postID = action.payload as string;
    //   newState.likePost.error = null;

    //   const publicPostIndex = publicPosts.findIndex(
    //     (post) => post.id === postID,
    //   );
    //   const followingPostIndex = followingPosts.findIndex(
    //     (post) => post.id === postID,
    //   );
    //   const userPostIndex = userPosts.findIndex((post) => post.id === postID);
    //   const taggedPostIndex = taggedPosts.findIndex(
    //     (post) => post.id === postID,
    //   );

    //   if (publicPostIndex !== -1) {
    //     const post = { ...publicPosts[publicPostIndex] };
    //     post.likes += 1;
    //     post.isLiked = true;
    //     publicPosts[publicPostIndex] = post;
    //   }
    //   if (followingPostIndex !== -1) {
    //     const post = { ...followingPosts[followingPostIndex] };
    //     post.likes += 1;
    //     post.isLiked = true;
    //     followingPosts[followingPostIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.likes += 1;
    //     post.isLiked = true;
    //     userPosts[userPostIndex] = post;
    //   }
    //   if (taggedPostIndex !== -1) {
    //     const post = { ...taggedPosts[taggedPostIndex] };
    //     post.likes += 1;
    //     post.isLiked = true;
    //     taggedPosts[taggedPostIndex] = post;
    //   }

    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   newState.taggedPosts.posts = taggedPosts;
    //   return newState;
    // }
    // case LIKE_POST_SUCCESS: {
    //   return state;
    // }
    // case LIKE_POST_FAILURE: {
    //   const newState = { ...state };
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const taggedPosts = [...state.taggedPosts.posts];
    //   const payload = action.payload as { error: Error | null; postID: string };

    //   newState.likePost.error = payload.error;
    //   if (payload.postID === '') {
    //     return newState;
    //   }

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
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     publicPosts[publicPostIndex] = post;
    //   }
    //   if (followingPostIndex !== -1) {
    //     const post = { ...followingPosts[followingPostIndex] };
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     followingPosts[followingPostIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     userPosts[userPostIndex] = post;
    //   }
    //   if (taggedPostIndex !== -1) {
    //     const post = { ...taggedPosts[taggedPostIndex] };
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     taggedPosts[taggedPostIndex] = post;
    //   }

    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   newState.taggedPosts.posts = taggedPosts;
    //   return newState;
    // }
    // case UNLIKE_POST_STARTED: {
    //   const newState = { ...state };
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const taggedPosts = [...state.taggedPosts.posts];
    //   const postID = action.payload as string;
    //   newState.unlikePost.error = null;

    //   const publicPostIndex = publicPosts.findIndex(
    //     (post) => post.id === postID,
    //   );
    //   const followingPostIndex = followingPosts.findIndex(
    //     (post) => post.id === postID,
    //   );
    //   const userPostIndex = userPosts.findIndex((post) => post.id === postID);
    //   const taggedPostIndex = taggedPosts.findIndex(
    //     (post) => post.id === postID,
    //   );

    //   if (publicPostIndex !== -1) {
    //     const post = { ...publicPosts[publicPostIndex] };
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     publicPosts[publicPostIndex] = post;
    //   }
    //   if (followingPostIndex !== -1) {
    //     const post = { ...followingPosts[followingPostIndex] };
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     followingPosts[followingPostIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     userPosts[userPostIndex] = post;
    //   }
    //   if (taggedPostIndex !== -1) {
    //     const post = { ...taggedPosts[taggedPostIndex] };
    //     post.likes -= 1;
    //     post.isLiked = false;
    //     taggedPosts[taggedPostIndex] = post;
    //   }

    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   newState.taggedPosts.posts = taggedPosts;
    //   return newState;
    // }
    // case UNLIKE_POST_SUCCESS: {
    //   return state;
    // }
    // case UNLIKE_POST_FAILURE: {
    //   const newState = { ...state };
    //   const publicPosts = [...state.public.posts];
    //   const followingPosts = [...state.following.posts];
    //   const userPosts = [...state.userPosts.posts];
    //   const taggedPosts = [...state.taggedPosts.posts];
    //   const payload = action.payload as { error: Error | null; postID: string };

    //   newState.unlikePost.error = payload.error;
    //   if (payload.postID === '') {
    //     return newState;
    //   }

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
    //     post.likes += 1;
    //     post.isLiked = true;
    //     publicPosts[publicPostIndex] = post;
    //   }
    //   if (followingPostIndex !== -1) {
    //     const post = { ...followingPosts[followingPostIndex] };
    //     post.likes += 1;
    //     post.isLiked = true;
    //     followingPosts[followingPostIndex] = post;
    //   }
    //   if (userPostIndex !== -1) {
    //     const post = { ...userPosts[userPostIndex] };
    //     post.likes += 1;
    //     post.isLiked = true;
    //     userPosts[userPostIndex] = post;
    //   }
    //   if (taggedPostIndex !== -1) {
    //     const post = { ...taggedPosts[taggedPostIndex] };
    //     post.likes += 1;
    //     post.isLiked = true;
    //     taggedPosts[taggedPostIndex] = post;
    //   }

    //   newState.public.posts = publicPosts;
    //   newState.following.posts = followingPosts;
    //   newState.userPosts.posts = userPosts;
    //   newState.taggedPosts.posts = taggedPosts;
    //   return newState;
    // }

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
