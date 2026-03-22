import { initializeApp } from 'firebase/app';
import { getAuth, initializeReactNativeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics } from "firebase/analytics";

// Replace the config values with the ones you copied from Firebase in Step 1.
const firebaseConfig = {
  apiKey: "AIzaSyDqc52UiAHkyuR6toNwKX894mshWocnf34",
  authDomain: "movienight-app-2e8b1.firebaseapp.com",
  projectId: "movienight-app-2e8b1",
  storageBucket: "movienight-app-2e8b1.firebasestorage.app",
  messagingSenderId: "518101468778",
  appId: "1:518101468778:web:769fbdbdf8c7960cc62c13",
  measurementId: "G-X6WHTHQE9N"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeReactNativeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
