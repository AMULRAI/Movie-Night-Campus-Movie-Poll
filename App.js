/*
 * ============================================================================
 * FILE: App.js — THE ROOT COMPONENT OF THE ENTIRE APPLICATION
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This is the main "wrapper" for the entire MovieNight app. Everything that
 * the user sees and interacts with lives inside this component.
 *
 * It does TWO main things:
 *   1. Wraps the app in an "AuthProvider" — so that every screen can know
 *      who the current user is (logged in or not, student or admin, etc.)
 *   2. Renders the "AppNavigator" — which decides which screen to show
 *      (Splash, Login, Dashboard, etc.)
 *
 * It also silences some annoying Firebase warning messages that appear as
 * red error popups during development (even though they're not real errors).
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Component": In React, a component is a reusable piece of the UI
 *   (User Interface). Think of it like a LEGO brick — you build your app
 *   by snapping components together. App.js is the BIGGEST component that
 *   holds all other components inside it.
 *
 * - "AuthProvider": A "provider" is like a shared backpack. Instead of
 *   passing user login info to every single screen one by one, the
 *   AuthProvider makes that info available to ALL screens automatically.
 *   Any screen can "reach into the backpack" and check who's logged in.
 *   This uses a React feature called "Context API".
 *
 * - "AppNavigator": The navigation system. It manages which screen is
 *   currently visible and how users move between screens (like going from
 *   Login → Dashboard). Uses React Navigation library.
 *
 * - "LogBox.ignoreLogs": During development, React Native shows error
 *   popups (red screens) for certain warnings. Firebase sometimes
 *   triggers these warnings even when everything is working fine.
 *   This tells React Native: "Ignore these specific messages so they
 *   don't distract the developer."
 *
 * CONNECTIONS:
 * -----------
 * - This file is imported by index.js (the entry point).
 * - It imports AppNavigator from src/navigation/AppNavigator.jsx
 *   (handles screen routing / which screen to show).
 * - It imports AuthProvider from src/context/AuthContext.js
 *   (provides login/user data to all screens).
 */

// React is the library that lets us build user interfaces using components.
import React from 'react';

// LogBox is a React Native utility for controlling warning/error popups.
// We use it here to suppress noisy Firebase messages during development.
import { LogBox } from 'react-native';

// AppNavigator is our navigation setup — it defines all the screens in the
// app and how they connect to each other (Splash → Login → Dashboard, etc.)
import AppNavigator from './src/navigation/AppNavigator';

// AuthProvider is the "context provider" that wraps our entire app.
// It monitors login state (is the user signed in? what role are they?)
// and makes this info available to every screen without passing it manually.
import { AuthProvider } from './src/context/AuthContext';

/*
 * SUPPRESS FIREBASE WARNING LOGS
 * --------------------------------
 * Firebase (our backend database) sometimes throws internal warning messages
 * that show up as scary red popups on the screen during development.
 * These warnings are NOT actual errors — they're just informational messages.
 * We tell LogBox to ignore them so they don't interrupt development.
 *
 * '@firebase/firestore:' — General Firestore warning messages.
 * 'Uncaught Error in snapshot listener' — Happens when a real-time listener
 *   encounters a network issue (not a code bug).
 * 'BloomFilter error' — An internal optimization error in Firebase.
 */
LogBox.ignoreLogs([
  '@firebase/firestore:',
  'Uncaught Error in snapshot listener',
  'BloomFilter error',
]);

/*
 * THE MAIN APP COMPONENT
 * -----------------------
 * This is the top-level component. It renders (displays) the entire app.
 *
 * Structure:
 *   <AuthProvider>          ← Makes user auth data available everywhere
 *     <AppNavigator />      ← Handles all screen navigation
 *   </AuthProvider>
 *
 * The AuthProvider MUST wrap the AppNavigator so that every screen inside
 * the navigator can access the user's login state via the useAuth() hook.
 * (A "hook" is a React function that lets components use features like
 *  state management, context, etc.)
 */
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
