import { DispatchTypes, PlaceStackAction } from './types';
import { AppState } from '../store';
import { fsDB, placePostsPerBatch, FirebaseFirestoreTypes } from '../../config';
import { FSdocsToPostArray } from '../../utils/functions';
import { Post, CurrentTabScreen, MyError, MyErrorCodes } from '../../models';

/* --------------------- ultilities --------------------- */

/**
 * Method push new place layer before navigating to a new place screen
 * @param newPlaceLayer New user layer to push
 */
export const pushUserLayer = (newPlaceLayer: {
  placeID: string;
  username: string;
  name: string;
  avatar: string;
}) => (dispatch: (action: PlaceStackAction) => void) => {
  dispatch({
    type: DispatchTypes.PUSH_PLACE_LAYER,
    payload: newPlaceLayer,
  });
};

/**
 * Method set current viewable index of the card when list scrolling
 * @param index Current index that's being scrolled
 */
export const setCurrentViewableListIndex = (index: number) => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_VIEWABLE_POST_INDEX,
    payload: index,
  });
};

/**
 * Method pop place layer when going back
 */
export const popPlaceLayer = () => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.POP_PLACE_LAYER,
    payload: null,
  });
};

/**
 * Method set current focused tab screen
 * @param tab Tab screen to set focus
 */
export const setCurrentTabForPlaceStack = (tab: CurrentTabScreen) => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_TAB,
    payload: tab,
  });
};

/**
 * Method clear the stack when going back to the first screen
 */
export const clearPlaceStack = () => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_STACK,
    payload: null,
  });
};

/**
 * Method reset all stacks
 */
export const resetAllPlaceStacks = () => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.RESET_ALL_STACKS,
    payload: null,
  });
};

/**
 * Method clear error from follow
 */
export const clearError = () => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_ERROR,
    payload: null,
  });
};

/* ------------------- end ultilities ------------------- */

/**
 * Method fetch place from database
 * @param placeID Place's ID to fetch
 */
export const fetchPlace = (placeID: string) => async (
  dispatch: (action: PlaceStackAction) => void,
  getState: () => AppState,
) => {
  dispatch(fetchPlaceStarted());
  try {
    const placeRef = await fsDB.collection('places').doc(placeID).get();
    if (!placeRef.exists) {
      throw new MyError('Place not found.', MyErrorCodes.DataNotFound);
    }

    const placeData = placeRef.data();
    const completePostLayer = {
      avatar: placeData!.avatar,
      name: placeData!.name,
      bio: placeData!.bio,
      category: placeData!.category,
      media: placeData!.media,
      address: placeData!.address,
      openTime: placeData!.openTime,
      isOpen: true,
      location: {
        lat: placeData!.coordinates.latitude as number,
        lng: placeData!.coordinates.longitude as number,
      },
      lastVisible: null as FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
      posts: [] as Array<Post>,
    };

    // fetch place's posts
    const documentSnapshots = await fsDB
      .collection('posts')
      .where('posted_by', '==', placeID)
      .get();

    if (documentSnapshots.empty) {
      return dispatch(fetchPlaceSuccess(completePostLayer));
    }

    const posts = await FSdocsToPostArray(documentSnapshots.docs);

    if (posts.length === 0) {
      return dispatch(fetchPlaceSuccess(completePostLayer));
    }

    completePostLayer.posts = posts;
    completePostLayer.lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    dispatch(fetchPlaceSuccess(completePostLayer));
  } catch (err) {
    switch (err.code) {
      case MyErrorCodes.DataNotFound:
        return dispatch(fetchPlaceFailure(new Error(err.message)));
      default:
        return dispatch(
          fetchPlaceFailure(new Error('Error occurred. Please try again.')),
        );
    }
  }
};

/* ------------------ place dispatches ------------------ */

const fetchPlaceStarted = (): PlaceStackAction => ({
  type: DispatchTypes.FETCH_PLACE_STARTED,
  payload: null,
});

const fetchPlaceSuccess = (fetchedPlace: any): PlaceStackAction => ({
  type: DispatchTypes.FETCH_PLACE_SUCCESS,
  payload: fetchedPlace,
});

const fetchPlaceFailure = (error: Error): PlaceStackAction => ({
  type: DispatchTypes.FETCH_PLACE_FAILURE,
  payload: error,
});

/* ---------------- end place dispatches ---------------- */
