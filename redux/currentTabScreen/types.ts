export const SET_CURRENT_TAB_SCREEN = 'SET_CURRENT_TAB_SCREEN';

export type CurrentTab = 'homeTabStack' | 'userTabStack';

export interface CurrentTabScreenAction {
  type: string;
  payload: CurrentTab;
}

export interface CurrentTabScreenState {
  screen: CurrentTab;
}
