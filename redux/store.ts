import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import postsReducer from './posts/reducer';
import authReducer from './auth/reducer';
import tagReducer from './tag/reducer';
import commentStackReducer from './comment_stack/reducer';
import replyStackReducer from './reply_stack/reducer';
import usersStackReducer from './user_stack/reducer';
import currentViewableItemReducer from './curentViewableItem/reducer';
import { PostState } from './posts/types';
import { AuthState } from './auth/types';
import { IndexState } from './curentViewableItem/types';
import { TagState } from './tag/types';
import { CommentStackState } from './comment_stack/types';
import { ReplyStackState } from './reply_stack/types';
import { UserStackState } from './user_stack/types';

const rootReducer = combineReducers({
  allPosts: postsReducer,
  auth: authReducer,
  postListIndices: currentViewableItemReducer,
  tag: tagReducer,
  commentStack: commentStackReducer,
  replyStack: replyStackReducer,
  usersStack: usersStackReducer,
});

export interface AppState {
  allPosts: PostState;
  auth: AuthState;
  postListIndices: IndexState;
  tag: TagState;
  commentStack: CommentStackState;
  replyStack: ReplyStackState;
  usersStack: UserStackState;
}

export default createStore(rootReducer, compose(applyMiddleware(thunk)));
