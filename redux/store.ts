import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import postsReducer from './posts/reducer';
import authReducer from './auth/reducer';
import tagReducer from './tag/reducer';
import currentViewableItemReducer from './curentViewableItem/reducer';
import { PostState } from './posts/types';
import { AuthState } from './auth/types';
import { IndexState } from './curentViewableItem/types';
import { TagState } from './tag/types';

const rootReducer = combineReducers({
  allPosts: postsReducer,
  auth: authReducer,
  postListIndices: currentViewableItemReducer,
  tag: tagReducer,
});

export interface AppState {
  allPosts: PostState;
  auth: AuthState;
  postListIndices: IndexState;
  tag: TagState;
}

export default createStore(rootReducer, compose(applyMiddleware(thunk)));
