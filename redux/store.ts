import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import postsReducer from './posts/reducer';
import authReducer from './auth/reducer';
import currentViewableItemReducer from './curentViewableItem/reducer';
import { PostState } from './posts/types';
import { AuthState } from './auth/types';
import { IndexState } from './curentViewableItem/types';

const rootReducer = combineReducers({
  allPosts: postsReducer,
  auth: authReducer,
  postListIndices: currentViewableItemReducer,
});

export interface AppState {
  allPosts: PostState;
  auth: AuthState;
  postListIndices: IndexState;
}

export default createStore(rootReducer, compose(applyMiddleware(thunk)));
