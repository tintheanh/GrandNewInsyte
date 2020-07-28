import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import postsReducer from './posts/reducer';
import authReducer from './auth/reducer';
import tagReducer from './tag/reducer';
import commentsStackReducer from './commentsStack/reducer';
import repliesStackReducer from './repliesStack/reducer';
import currentViewableItemReducer from './curentViewableItem/reducer';
import { PostState } from './posts/types';
import { AuthState } from './auth/types';
import { IndexState } from './curentViewableItem/types';
import { TagState } from './tag/types';
import { CommentsStackState } from './commentsStack/types';
import { RepliesStackState } from './repliesStack/types';

const rootReducer = combineReducers({
  allPosts: postsReducer,
  auth: authReducer,
  postListIndices: currentViewableItemReducer,
  tag: tagReducer,
  commentsStack: commentsStackReducer,
  repliesStack: repliesStackReducer,
});

export interface AppState {
  allPosts: PostState;
  auth: AuthState;
  postListIndices: IndexState;
  tag: TagState;
  commentsStack: CommentsStackState;
  repliesStack: RepliesStackState;
}

export default createStore(rootReducer, compose(applyMiddleware(thunk)));
