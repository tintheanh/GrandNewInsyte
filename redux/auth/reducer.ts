import { AuthAction, AuthState, DispatchTypes } from './types';
import { User } from '../../models';

const initialState: AuthState = {
  user: undefined,
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
  update: {
    loading: false,
    error: null,
  },
};

export default function authReducer(
  state = initialState,
  action: AuthAction,
): AuthState {
  const untouchedState: AuthState = {
    user: null,
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
    update: {
      loading: false,
      error: null,
    },
  };

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
    case DispatchTypes.EDIT_PROFILE_STARTED: {
      const newState = { ...state };
      newState.update.loading = true;
      return newState;
    }
    case DispatchTypes.EDIT_PROFILE_SUCCESS: {
      const newState = { ...state };
      const payload = action.payload as {
        avatar: string;
        name: string;
        bio: string;
      };
      newState.user!.avatar = payload.avatar;
      newState.user!.name = payload.name;
      newState.user!.bio = payload.bio;
      newState.update.error = null;
      newState.update.loading = false;
      return newState;
    }
    case DispatchTypes.EDIT_PROFILE_FAILURE: {
      const newState = { ...state };
      newState.update.loading = false;
      newState.update.error = action.payload as Error;
      return newState;
    }
    case DispatchTypes.REFRESH_PROFILE_SUCCESS: {
      const newState = { ...state };
      newState.user = action.payload as User;
      return newState;
    }
    case DispatchTypes.INCREASE_TOTAL_POSTS_BY_ONE: {
      const newState = { ...state };
      newState.user!.totalPosts += 1;
      return newState;
    }
    case DispatchTypes.DECREASE_TOTAL_POSTS_BY_ONE: {
      const newState = { ...state };
      newState.user!.totalPosts -= 1;
      return newState;
    }
    case DispatchTypes.INCREASE_FOLLOWING_BY_ONE: {
      const newState = { ...state };
      newState.user!.following += 1;
      return newState;
    }
    case DispatchTypes.DECREASE_FOLLOWING_BY_ONE: {
      const newState = { ...state };
      newState.user!.following -= 1;
      return newState;
    }
    case DispatchTypes.CLEAR_SIGNUP_ERROR: {
      const newState = { ...state };
      newState.errors.signupError = null;
      return newState;
    }
    default:
      return state;
  }
}
