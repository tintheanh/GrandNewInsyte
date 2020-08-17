import { PlaceAction, DispatchTypes } from './types';
import { geofirestore, GeoPoint } from '../../config';
import { Place, Media } from '../../models';
import { milesToKm, kmToMiles, delay } from '../../utils/functions';
import { milesRadius } from '../../config';

/* -------------------- place actions ------------------- */

export const fetchPlaces = (geopoint: { lat: number; lng: number }) => async (
  dispatch: (action: PlaceAction) => void,
) => {
  dispatch(fetchPlacesStarted());
  try {
    // await delay(3000);
    const documentSnapshots = await geofirestore
      .collection('places')
      .near({
        center: new GeoPoint(geopoint.lat, geopoint.lng),
        radius: milesToKm(milesRadius),
      })
      .get();

    const places = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        avatar: data.avatar as string,
        name: data.name as string,
        bio: data.bio as string,
        media: data.media as Array<Media>,
        location: {
          latitude: data.coordinates.latitude as number,
          longitude: data.coordinates.longitude as number,
        },
        distance: kmToMiles(doc.distance),
      };
    });

    places.sort((a, b) => a.distance - b.distance);

    dispatch(fetchPlacesSuccess(places));
  } catch (err) {
    dispatch(
      fetchPlacesFailure(new Error('Error occurred. Please try again.')),
    );
  }
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
