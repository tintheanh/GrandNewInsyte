import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import postsReducer from './posts/reducer';
import authReducer from './auth/reducer';
import tagReducer from './tag_user/reducer';
import commentStackReducer from './comment_stack/reducer';
import replyStackReducer from './reply_stack/reducer';
import usersStackReducer from './user_stack/reducer';
import searchUserReducer from './search_user/reducer';
import currentViewableItemReducer from './curent_viewable_item/reducer';
import placeReducer from './places/reducer';
import { PostState } from './posts/types';
import { AuthState } from './auth/types';
import { IndexState } from './curent_viewable_item/types';
import { TagState } from './tag_user/types';
import { CommentStackState } from './comment_stack/types';
import { ReplyStackState } from './reply_stack/types';
import { UserStackState } from './user_stack/types';
import { SearchUserState } from './search_user/types';
import { PlaceState } from './places/types';

const rootReducer = combineReducers({
  allPosts: postsReducer,
  auth: authReducer,
  postListIndices: currentViewableItemReducer,
  tag: tagReducer,
  commentStack: commentStackReducer,
  replyStack: replyStackReducer,
  userStack: usersStackReducer,
  searchUser: searchUserReducer,
  allPlaces: placeReducer,
});

export interface AppState {
  allPosts: PostState;
  auth: AuthState;
  postListIndices: IndexState;
  tag: TagState;
  commentStack: CommentStackState;
  replyStack: ReplyStackState;
  userStack: UserStackState;
  searchUser: SearchUserState;
  allPlaces: PlaceState;
}

export default createStore(rootReducer, compose(applyMiddleware(thunk)));
