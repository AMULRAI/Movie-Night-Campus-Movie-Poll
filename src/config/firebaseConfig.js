import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
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

// NOTE: Analytics is NOT supported in React Native — removed getAnalytics()

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
