/*
 * ============================================================================
 * FILE: firebaseConfig.js — FIREBASE SETUP AND INITIALIZATION
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This file sets up the connection between our app and Firebase (Google's
 * cloud backend service). Firebase provides us with:
 *   1. Authentication (login/signup — verifying who the user is)
 *   2. Firestore Database (storing data like users, movies, polls, votes)
 *
 * Think of Firebase as a "server in the cloud" that stores all our data
 * and handles user accounts — so we don't need to build our own server.
 *
 * This file creates THREE things that are used throughout the app:
 *   - `app`  → The Firebase app instance (the main connection)
 *   - `auth` → The authentication service (for login/signup/logout)
 *   - `db`   → The Firestore database (for reading/writing data)
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Firebase": A set of cloud services by Google. It provides a database,
 *   user authentication, file storage, hosting, and more — all in the cloud.
 *   We use it so we don't have to build a backend server from scratch.
 *
 * - "Firestore": Firebase's cloud database. It stores data as "documents"
 *   inside "collections". For example:
 *     Collection: "users" → contains documents for each user
 *     Collection: "polls" → contains documents for each poll
 *   It also supports "real-time" updates — meaning if someone votes,
 *   everyone else sees the updated count instantly.
 *
 * - "Auth / Authentication": The system that verifies who a user is.
 *   It handles creating accounts (signup), logging in, and logging out.
 *   Firebase Auth manages passwords securely — we never store raw passwords.
 *
 * - "Environment Variables" (process.env.EXPO_PUBLIC_...): These are secret
 *   configuration values stored in a .env file (not uploaded to GitHub).
 *   They contain API keys and project IDs that connect our app to the
 *   specific Firebase project. Using environment variables keeps secrets
 *   out of our code.
 *
 * - "AsyncStorage / Persistence": When a user logs in, we want them to
 *   STAY logged in even if they close and reopen the app. "Persistence"
 *   means saving the login session on the device. AsyncStorage is a
 *   React Native library that stores small pieces of data on the phone
 *   (like a tiny local database on the device itself).
 *
 * CONNECTIONS:
 * -----------
 * - `auth` is used by: src/services/authService.js (login, signup, logout)
 * - `db` is used by: src/services/firestoreService.js (database operations)
 * - `auth` is also used by: src/context/AuthContext.js (monitoring login state)
 * - Almost every screen in the app eventually connects to Firebase through
 *   these exported `auth` and `db` objects.
 */

// initializeApp: Creates the Firebase app instance with our project config.
// This is like dialing a phone number — it connects to OUR specific Firebase project.
import { initializeApp } from 'firebase/app';

// initializeAuth: Sets up Firebase Authentication for login/signup.
// getReactNativePersistence: Tells Firebase to save login sessions using
// AsyncStorage (so users stay logged in after closing the app).
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// ReactNativeAsyncStorage: A library for storing small data on the phone locally.
// Firebase uses it to remember the logged-in user between app restarts.
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// getFirestore: Gets a reference to the Firestore cloud database,
// so we can read and write data (users, movies, polls, votes, etc.)
import { getFirestore } from 'firebase/firestore';

/*
 * FIREBASE CONFIGURATION OBJECT
 * ------------------------------
 * This object contains all the credentials needed to connect to our
 * specific Firebase project. Each value is loaded from environment
 * variables (stored in the .env file) to keep them secret.
 *
 * - apiKey: A unique key that identifies our app to Firebase.
 * - authDomain: The URL used for authentication (login/signup pages).
 * - projectId: The unique ID of our Firebase project.
 * - storageBucket: The cloud storage location (for files/images).
 * - messagingSenderId: Used for push notifications (not used yet).
 * - appId: A unique ID for this specific app within the project.
 * - measurementId: Used for analytics/tracking (not used in React Native).
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

/*
 * STEP 1: Initialize the Firebase App
 * ------------------------------------
 * This creates the main Firebase connection using our config.
 * All other Firebase services (Auth, Firestore) use this `app` object.
 */
const app = initializeApp(firebaseConfig);

// NOTE: Firebase Analytics (for tracking user behavior) is NOT supported
// in React Native, so we do NOT call getAnalytics() here.

/*
 * STEP 2: Initialize Firebase Authentication
 * -------------------------------------------
 * This sets up the login/signup system.
 *
 * The "persistence" option tells Firebase HOW to remember the logged-in user.
 * We use ReactNativeAsyncStorage so that login sessions survive app restarts.
 * Without this, users would have to log in every time they open the app.
 */
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

/*
 * STEP 3: Initialize Firestore Database
 * --------------------------------------
 * This gets a reference to the cloud database.
 * We use `db` everywhere in the app to read/write data.
 * For example: db → collection("users") → document("user123")
 */
const db = getFirestore(app);

/*
 * EXPORT all three for use in other files:
 * - `app`  → The Firebase app (rarely used directly by other files)
 * - `auth` → Used for login, signup, logout, and checking auth state
 * - `db`   → Used for all database operations (CRUD = Create, Read, Update, Delete)
 */
export { app, auth, db };
