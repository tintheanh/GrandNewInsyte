export const SET_CURRENT_HOMELISTPOST_INDEX = 'SET_CURRENT_HOMELISTPOST_INDEX';
export const SET_CURRENT_USERLISTPOST_INDEX = 'SET_CURRENT_USERLISTPOST_INDEX';
export const SET_CURRENT_USERTAGGEDSLISTPOST_INDEX =
  'SET_CURRENT_USERTAGGEDSLISTPOST_INDEX';

export interface SetIndexAction {
  type: string;
  payload: number;
}

export interface IndexState {
  currentHomeListPostIndex: number;
  currentUserListPostIndex: number;
  currentUserTaggedListPostIndex: number;
}
