import { PlaceAction, DispatchTypes } from './types';
import { geofirestore, GeoPoint } from '../../config';
import { Place, Media } from '../../models';
import { milesToKm, kmToMiles, delay, distance } from '../../utils/functions';
import { milesRadius } from '../../config';

/* -------------------- place actions ------------------- */

export const fetchPlaces = (
  locationForSearch: {
    lat: number;
    lng: number;
  },
  currentLocation: {
    coords: { lat: number; lng: number };
    type: 'my-location' | 'default-location';
  },
) => async (dispatch: (action: PlaceAction) => void) => {
  dispatch(fetchPlacesStarted());
  try {
    // await delay(3000);
    const documentSnapshots = await geofirestore
      .collection('places')
      .near({
        center: new GeoPoint(locationForSearch.lat, locationForSearch.lng),
        radius: milesToKm(milesRadius),
      })
      .get();

    let places: Array<Place>;
    if (currentLocation.type === 'my-location') {
      places = documentSnapshots.docs.map((doc) => {
        const data = doc.data();
        const location = {
          lat: data.coordinates.latitude as number,
          lng: data.coordinates.longitude as number,
        };
        return {
          id: doc.id,
          avatar: data.avatar as string,
          name: data.name as string,
          bio: data.bio as string,
          media: data.media as Array<Media>,
          location,
          distance: distance(currentLocation.coords, location),
        };
      });
    } else {
      places = documentSnapshots.docs.map((doc) => {
        const data = doc.data();
        const location = {
          lat: data.coordinates.latitude as number,
          lng: data.coordinates.longitude as number,
        };
        return {
          id: doc.id,
          avatar: data.avatar as string,
          name: data.name as string,
          bio: data.bio as string,
          media: data.media as Array<Media>,
          location,
          distance: -1,
        };
      });
    }

    places.sort((a, b) => a.distance - b.distance);

    dispatch(fetchPlacesSuccess(places));
  } catch (err) {
    dispatch(
      fetchPlacesFailure(new Error('Error occurred. Please try again.')),
    );
  }
};

export const clearFetchPlacesError = () => (
  dispatch: (action: PlaceAction) => void,
) => {
  dispatch({
    type: DispatchTypes.CLEAR_FETCH_PLACES_ERROR,
    payload: null,
  });
};

/* -------------------- place actions ------------------- */

/* ------------------ place dispatches ------------------ */

const fetchPlacesStarted = (): PlaceAction => ({
  type: DispatchTypes.FETCH_PLACES_STARTED,
  payload: null,
});

const fetchPlacesSuccess = (places: Array<Place>): PlaceAction => ({
  type: DispatchTypes.FETCH_PLACES_SUCCESS,
  payload: places,
});

const fetchPlacesFailure = (error: Error): PlaceAction => ({
  type: DispatchTypes.FETCH_PLACES_FAILURE,
  payload: error,
});

/* ---------------- end place dispatches ---------------- */
