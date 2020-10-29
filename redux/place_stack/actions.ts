import faker from 'faker';
import { DispatchTypes, PlaceStackAction } from './types';
import { AppState } from '../store';
import { fsDB, placePostsPerBatch, FirebaseFirestoreTypes } from '../../config';
import { FSdocsToPostArray } from '../../utils/functions';
import {
  Post,
  CurrentTabScreen,
  MyError,
  MyErrorCodes,
  PlaceCategory,
} from '../../models';

const POSTS: any[] = [];

for (let i = 0; i < 20; i++) {
  POSTS.push({
    id: '3ac68afc' + i,
    user: {
      username: faker.internet.userName(),
      avatar: faker.image.avatar(),
    },
    datePosted: parseInt((faker.date.past().getTime() / 1000).toFixed(0)),
    caption: faker.lorem.sentence(),
    privacy: 'friends',
    likes: parseInt(faker.random.number().toFixed(0)),
    comments: parseInt(faker.random.number().toFixed(0)),
    media: [
      {
        id: '1',
        uri: faker.image.image(),
        type: 'image',
      },
    ],
  });
}

/* --------------------- ultilities --------------------- */

/**
 * Method push new place layer before navigating to a new place screen
 * @param newPlaceLayer New user layer to push
 */
export const pushPlaceLayer = (newPlaceLayer: {
  placeID: string;
  name: string;
  avatar: string;
}) => (dispatch: (action: PlaceStackAction) => void) => {
  dispatch({
    type: DispatchTypes.PUSH_PLACE_LAYER,
    payload: newPlaceLayer,
  });
};

/**
 * Method set current viewable index of the card when own post list scrolling
 * @param index Current index that's being scrolled
 */
export const setCurrentViewableOwnPostListIndex = (index: number) => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_VIEWABLE_OWNPOST_INDEX,
    payload: index,
  });
};

/**
 * Method set current viewable index of the card when checkin post list scrolling
 * @param index Current index that's being scrolled
 */
export const setCurrentViewableCheckinPostListIndex = (index: number) => (
  dispatch: (action: PlaceStackAction) => void,
) => {
  dispatch({
    type: DispatchTypes.SET_CURRENT_VIEWABLE_CHECKINPOST_INDEX,
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
      address: placeData!.address,
      openTime: placeData!.openTime,
      isFollowed: false,
      followers: 111,
      following: 22,
      totalPosts: 19,
      isOpen: true,
      distance: 12,
      location: {
        lat: placeData!.coordinates.latitude as number,
        lng: placeData!.coordinates.longitude as number,
      },
      lastOwnPostVisible: null as FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
      lastCheckinPostVisible: null as FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
      ownPosts: POSTS,
      checkinPosts: [],
    };

    // // fetch place's posts
    // const documentSnapshots = await fsDB
    //   .collection('posts')
    //   .where('posted_by', '==', placeID)
    //   .get();

    // if (documentSnapshots.empty) {
    //   return dispatch(fetchPlaceSuccess(completePostLayer));
    // }

    // const posts = await FSdocsToPostArray(documentSnapshots.docs);

    // if (posts.length === 0) {
    //   return dispatch(fetchPlaceSuccess(completePostLayer));
    // }

    // completePostLayer.posts = posts;
    // completePostLayer.lastVisible =
    //   documentSnapshots.docs[documentSnapshots.docs.length - 1];
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

const fetchPlaceSuccess = (fetchedPlace: {
  avatar: string;
  name: string;
  bio: string;
  category: PlaceCategory;
  address: string;
  openTime: Array<string>;
  followers: number;
  following: number;
  totalPosts: number;
  isFollowed: boolean;
  isOpen: boolean;
  distance: number;
  location: {
    lat: number;
    lng: number;
  };
  lastOwnPostVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  lastCheckinPostVisible: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  ownPosts: Array<Post>;
  checkinPosts: Array<Post>;
}): PlaceStackAction => ({
  type: DispatchTypes.FETCH_PLACE_SUCCESS,
  payload: fetchedPlace,
});

const fetchPlaceFailure = (error: Error): PlaceStackAction => ({
  type: DispatchTypes.FETCH_PLACE_FAILURE,
  payload: error,
});

/* ---------------- end place dispatches ---------------- */
