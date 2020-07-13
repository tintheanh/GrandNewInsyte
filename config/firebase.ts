import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import authentication, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import functions from '@react-native-firebase/functions';

export const fsDB = firestore();
export const fbDB = database();
export const fireStorage = storage();
export const auth = authentication();
export const fireFuncs = functions();

export { FirebaseFirestoreTypes, FirebaseAuthTypes };
