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

export enum HttpsCallableMethods {
  checkUsername = 'checkUsername',
}

export enum AuthErrorCodes {
  UserNotFound = 'auth/user-not-found',
  WrongPassword = 'auth/wrong-password',
  UsernameAlreadyExists = 'already-exists',
  EmailAlreadyExists = 'auth/email-already-in-use',
}

export { FirebaseFirestoreTypes, FirebaseAuthTypes };
