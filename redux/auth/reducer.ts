import { AuthAction, AuthState, DispatchTypes } from './types';
import { User, Post } from '../../models';
import { FirebaseFirestoreTypes } from '../../config';

const initialState: AuthState = {
  user: undefined,
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
  loadings: {
    checkAuthLoading: false,
    signinLoading: false,
    signoutLoading: false,
    signupLoading: false,
  },
  errors: {
    checkAuthError: null,
    signinError: null,
    signoutError: null,
    signupError: null,
  },
};

const untouchedState: AuthState = {
  user: null,
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
  loadings: {
    checkAuthLoading: false,
    signinLoading: false,
    signoutLoading: false,
    signupLoading: false,
  },
  errors: {
    checkAuthError: null,
    signinError: null,
    signoutError: null,
    signupError: null,
  },
};

export default function authReducer(
  state = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case DispatchTypes.CHECK_AUTH_STARTED: {
      const newState = { ...state };
      newState.loadings.checkAuthLoading = true;
      return newState;
    }
    case DispatchTypes.CHECK_AUTH_SUCCESS: {
      const newState = { ...state };
      newState.user = action.payload as User;
      newState.errors.checkAuthError = null;
      newState.loadings.checkAuthLoading = false;
      return newState;
    }
    case DispatchTypes.CHECK_AUTH_FAILURE: {
      const newState = { ...state };
      newState.errors.checkAuthError = action.payload as Error;
      newState.loadings.checkAuthLoading = false;
      return newState;
    }
    case DispatchTypes.FETCH_USER_POSTS_STARTED: {
      const newState = { ...state };
      newState.own.fetchLoading = true;
      return newState;
    }
    case DispatchTypes.FETCH_USER_POSTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
      };
      newState.own.fetchLoading = false;
      newState.own.posts = state.own.posts.concat(payload.posts);
      newState.own.lastVisible = payload.lastVisible;
      newState.own.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_USER_POSTS_FAILURE: {
      const newState = { ...state };
      newState.own.fetchLoading = false;
      newState.own.error = action.payload as Error;
      newState.own.posts = [];
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_USER_POSTS_STARTED: {
      const newState = { ...state };
      newState.own.pullLoading = true;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_USER_POSTS_SUCCESS: {
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
    case DispatchTypes.PULL_TO_FETCH_USER_POSTS_FAILURE: {
      const newState = { ...state };
      newState.own.pullLoading = false;
      newState.own.error = action.payload as Error;
      newState.own.posts = [];
      return newState;
    }
    case DispatchTypes.FETCH_USER_TAGGED_POSTS_STARTED: {
      const newState = { ...state };
      newState.tagged.fetchLoading = true;
      return newState;
    }
    case DispatchTypes.FETCH_USER_TAGGED_POSTS_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        posts: Array<Post>;
        lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
      };
      newState.tagged.fetchLoading = false;
      newState.tagged.posts = state.tagged.posts.concat(payload.posts);
      newState.tagged.lastVisible = payload.lastVisible;
      newState.tagged.error = null;
      return newState;
    }
    case DispatchTypes.FETCH_USER_TAGGED_POSTS_FAILURE: {
      const newState = { ...state };
      newState.tagged.fetchLoading = false;
      newState.tagged.error = action.payload as Error;
      newState.tagged.posts = [];
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_USER_TAGGED_POSTS_STARTED: {
      const newState = { ...state };
      newState.tagged.pullLoading = true;
      return newState;
    }
    case DispatchTypes.PULL_TO_FETCH_USER_TAGGED_POSTS_SUCCESS: {
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
    case DispatchTypes.PULL_TO_FETCH_USER_TAGGED_POSTS_FAILURE: {
      const newState = { ...state };
      newState.tagged.pullLoading = false;
      newState.tagged.error = action.payload as Error;
      newState.tagged.posts = [];
      return newState;
    }
    case DispatchTypes.SIGN_IN_STARTED: {
      const newState = { ...state };
      newState.loadings.signinLoading = true;
      newState.errors.signinError = null;
      return newState;
    }
    case DispatchTypes.SIGN_IN_SUCCESS: {
      const newState = { ...state };
      newState.loadings.signinLoading = false;
      newState.errors.signinError = null;
      newState.user = action.payload as User;
      return newState;
    }
    case DispatchTypes.SIGN_IN_FAILURE: {
      const newState = { ...state };
      newState.loadings.signinLoading = false;
      newState.errors.signinError = action.payload as Error;
      return newState;
    }
    case DispatchTypes.SIGN_OUT_STARTED: {
      const newState = { ...state };
      newState.loadings.signoutLoading = true;
      newState.errors.signoutError = null;
      return newState;
    }
    case DispatchTypes.SIGN_OUT_SUCCESS: {
      return untouchedState;
    }
    case DispatchTypes.SIGN_OUT_FAILURE: {
      const newState = { ...state };
      newState.loadings.signoutLoading = false;
      newState.errors.signoutError = action.payload as Error;
      return newState;
    }
    case DispatchTypes.SIGN_UP_STARTED: {
      const newState = { ...state };
      newState.loadings.signupLoading = true;
      newState.errors.signupError = null;
      return newState;
    }
    case DispatchTypes.SIGN_UP_SUCCESS: {
      const newState = { ...state };
      newState.loadings.signupLoading = false;
      newState.errors.signupError = null;
      newState.user = action.payload as User;
      return newState;
    }
    case DispatchTypes.SIGN_UP_FAILURE: {
      const newState = { ...state };
      newState.loadings.signupLoading = false;
      newState.errors.signupError = action.payload as Error;
      return newState;
    }
    case DispatchTypes.CLEAR_SIGNUP_ERROR: {
      const newState = { ...state };
      newState.errors.signupError = null;
      return newState;
    }
    // case CHECK_AUTH_STARTED: {
    //   const newState = { ...state };
    //   newState.loading = true;
    //   newState.error = null;
    //   return newState;
    // }
    // case CHECK_AUTH_SUCCESS: {
    //   const newState = { ...state };
    //   newState.user = action.payload as User;
    //   newState.error = null;
    //   newState.loading = false;
    //   return newState;
    // }
    // case CHECK_AUTH_FAILURE: {
    //   const newState = { ...state };
    //   newState.error = action.payload as Error;
    //   newState.loading = false;
    //   return newState;
    // }
    // case SIGN_OUT_STARTED: {
    //   const newState = { ...state };
    //   newState.signout.loading = true;
    //   newState.signout.error = null;
    //   return newState;
    // }
    // case SIGN_OUT_SUCCESS: {
    //   return {
    //     signin: {
    //       loading: false,
    //       email: '',
    //       password: '',
    //       error: null,
    //     },
    //     signup: {
    //       loading: false,
    //       username: '',
    //       email: '',
    //       password: '',
    //       retypePassword: '',
    //       error: null,
    //     },
    //     signout: {
    //       loading: false,
    //       error: null,
    //     },
    //     loading: false,
    //     update: {
    //       loading: false,
    //       error: null,
    //     },
    //     user: null,
    //     error: null,
    //   };
    // }
    // case SIGN_OUT_FAILURE: {
    //   const newState = { ...state };
    //   newState.signout.error = action.payload as Error;
    //   newState.signout.loading = false;
    //   return newState;
    // }
    // case EDIT_PROFILE_STARTED: {
    //   const newState = { ...state };
    //   newState.update.loading = true;
    //   newState.update.error = null;
    //   return newState;
    // }
    // case EDIT_PROFILE_SUCCESS: {
    //   const newState = { ...state };
    //   const payload = action.payload as {
    //     avatar: string;
    //     name: string;
    //     bio: string;
    //   };
    //   newState.user!.avatar = payload.avatar;
    //   newState.user!.name = payload.name;
    //   newState.user!.bio = payload.bio;
    //   newState.update.error = null;
    //   newState.update.loading = false;
    //   return newState;
    // }
    // case EDIT_PROFILE_FAILURE: {
    //   const newState = { ...state };
    //   newState.update.loading = false;
    //   newState.update.error = action.payload as Error;
    //   return newState;
    // }
    // case EDIT_PROFILE_END: {
    //   const newState = { ...state };
    //   newState.update.loading = false;
    //   return newState;
    // }
    // case INCREASE_TOTAL_POSTS_BY_ONE: {
    //   const newState = { ...state };
    //   if (newState.user) {
    //     newState.user.totalPosts += 1;
    //   }
    //   return newState;
    // }
    // case DECREASE_TOTAL_POSTS_BY_ONE: {
    //   const newState = { ...state };
    //   if (newState.user) {
    //     newState.user.totalPosts -= 1;
    //   }
    //   return newState;
    // }
    // case INCREASE_FOLLOWING_BY_ONE: {
    //   const newState = { ...state };
    //   if (newState.user) {
    //     newState.user.following += 1;
    //   }
    //   return newState;
    // }
    // case DECREASE_FOLLOWING_BY_ONE: {
    //   const newState = { ...state };
    //   if (newState.user) {
    //     newState.user.following -= 1;
    //   }
    //   return newState;
    // }
    default:
      return state;
  }
}
