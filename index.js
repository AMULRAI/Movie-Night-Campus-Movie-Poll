/*
 * ============================================================================
 * FILE: index.js — THE VERY FIRST FILE THAT RUNS WHEN THE APP STARTS
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This is the "entry point" of the entire application. Think of it as the
 * front door of the app. When someone opens the MovieNight app on their phone,
 * this file is the first thing that runs.
 *
 * Its only job is to tell the phone's operating system (Android or iOS):
 * "Hey, THIS is my app — please show it on the screen."
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Entry point": The starting file of any program. Like opening a book — you
 *   start from the first page (index.js), then everything else follows.
 *
 * - "registerRootComponent": A function provided by Expo (our development tool).
 *   It tells the phone: "The 'App' component is the main thing to display."
 *   Under the hood, it calls React Native's AppRegistry.registerComponent(),
 *   which is how React Native apps register themselves with the phone's OS.
 *
 * - "Expo": A toolkit that makes building React Native apps easier.
 *   It handles a lot of the complicated setup for Android and iOS.
 *
 * CONNECTIONS:
 * -----------
 * This file imports `App` from './App.js' — which is the root (top-level)
 * React component of our entire application. Everything in the app lives
 * inside that `App` component.
 */

// Import the registerRootComponent function from Expo.
// This function is what "boots up" our React Native app on the device.
import { registerRootComponent } from 'expo';

// Import our main App component from the App.js file in the same folder.
// This App component wraps the entire application — it contains the
// navigation, authentication, and all the screens.
import App from './App';

// Register the App component as the "root" (main) component of this application.
// registerRootComponent internally calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go (a testing app)
// or in a native build (the final version), the environment is set up correctly.
registerRootComponent(App);
