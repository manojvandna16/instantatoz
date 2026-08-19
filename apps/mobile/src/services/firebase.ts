import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCoT8znogqt0YJt6Fho5PsP7BTYL7HnTf4",
  authDomain: "instantatoz.firebaseapp.com",
  projectId: "instantatoz",
  storageBucket: "instantatoz.firebasestorage.app",
  messagingSenderId: "423176154131",
  appId: "1:423176154131:android:c24253ddc5ee7575dae3e6",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
