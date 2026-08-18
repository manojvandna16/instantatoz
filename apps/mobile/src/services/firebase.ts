/**
 * src/services/firebase.ts
 * Firebase initialization for React Native (@react-native-firebase)
 * Firebase is auto-initialized from google-services.json — no explicit init needed
 */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';

// Typed accessors — use these throughout the app
export const getAuth = () => auth();
export const getDb = () => firestore();
export const getStorage = () => storage();
export const getFunctions = () => functions().useRegion('asia-south1');
export const getMessaging = () => messaging();

// Firestore server timestamp helper
export const serverTimestamp = () => firestore.FieldValue.serverTimestamp();
export const arrayUnion = (...items: unknown[]) => firestore.FieldValue.arrayUnion(...items);
export const arrayRemove = (...items: unknown[]) => firestore.FieldValue.arrayRemove(...items);
export const deleteField = () => firestore.FieldValue.delete();


