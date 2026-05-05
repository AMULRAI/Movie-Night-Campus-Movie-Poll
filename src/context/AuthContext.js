/*
 * ============================================================================
 * FILE: AuthContext.js — GLOBAL AUTHENTICATION STATE MANAGER
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This file creates a "shared space" where the current user's login
 * information is stored and made available to EVERY screen in the app.
 *
 * Instead of each screen separately checking "is the user logged in?"
 * and "what is their role?", this file does it ONCE and shares the
 * answer with everyone.
 *
 * It provides:
 *   - `user` → The raw Firebase user object (has uid, email)
 *   - `userProfile` → The full profile from our database (firstName, role, etc.)
 *   - `loading` → Whether we're still checking the login status
 *   - `role` → The user's role ('student' or 'admin')
 *   - `isAdmin` → true if the user is an admin
 *   - `isStudent` → true if the user is a student
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Context API" (React Context): A built-in React feature that lets you
 *   share data across many components without passing it through every level.
 *   Imagine a school PA system — instead of whispering a message from teacher
 *   to teacher, you broadcast it to everyone at once.
 *
 * - "Provider": The component that BROADCASTS the data. It wraps the entire
 *   app (in App.js). Think of it as the radio tower sending the signal.
 *
 * - "useContext" / "useAuth": The "receiver". Any component that wants to
 *   read the shared data calls useAuth() to tune in to the broadcast.
 *
 * - "onAuthStateChanged": A Firebase listener that watches for login/logout
 *   events. It's like a security camera at the door — it tells us whenever
 *   someone logs in or logs out, in real-time.
 *
 * - "useState": A React hook that creates a variable that the screen
 *   re-renders (refreshes the display) whenever the variable changes.
 *
 * - "useEffect": A React hook that runs some code when the component first
 *   appears (or when certain values change). We use it here to start
 *   listening for auth changes when the app loads.
 *
 * - "unsubscribe": When we set up a listener (like onAuthStateChanged),
 *   we get back a function to STOP listening. We call this when the
 *   component is removed from the screen, to avoid memory leaks
 *   (wasting phone memory by listening to something that no longer exists).
 *
 * CONNECTIONS:
 * -----------
 * - Wrapped around the entire app in App.js as <AuthProvider>
 * - Used by EVERY screen via the useAuth() hook to check:
 *   "Who is logged in?" and "Are they admin or student?"
 * - Depends on: src/config/firebaseConfig.js (for the `auth` object)
 * - Depends on: src/services/authService.js (for getCurrentUserProfile)
 */

// React and the hooks we need:
// createContext: Creates the shared "broadcast channel"
// useContext: Lets components "tune in" to that channel
// useState: Creates reactive variables (variables that refresh the UI when changed)
// useEffect: Runs code when the component loads or when dependencies change
import React, { createContext, useContext, useState, useEffect } from 'react';

// `auth` is the Firebase Authentication instance from our config.
// We use it to listen for login/logout events.
import { auth } from '../config/firebaseConfig';

// onAuthStateChanged: A Firebase function that calls our callback function
// whenever the user logs in, logs out, or the auth state changes.
import { onAuthStateChanged } from 'firebase/auth';

// getCurrentUserProfile: Our custom function that fetches the user's full
// profile (firstName, lastName, role, studentId, etc.) from the Firestore database.
import { getCurrentUserProfile } from '../services/authService';

/*
 * STEP 1: Create the Context
 * ---------------------------
 * This creates an empty "broadcast channel" called AuthContext.
 * Right now it has no data — we'll fill it in the AuthProvider below.
 */
const AuthContext = createContext();

/*
 * STEP 2: The AuthProvider Component (the "radio tower")
 * -------------------------------------------------------
 * This component wraps the entire app. It:
 *   1. Listens for login/logout events (using onAuthStateChanged)
 *   2. When a user logs in, fetches their profile from the database
 *   3. Stores the user data in state variables
 *   4. Broadcasts all this data to every child component
 *
 * The `children` prop represents everything inside <AuthProvider>...</AuthProvider>
 * (which is the entire app, since it wraps AppNavigator in App.js).
 */
export const AuthProvider = ({ children }) => {
  // `user` holds the Firebase user object (or null if not logged in).
  // The Firebase user object contains: uid (unique ID), email, etc.
  const [user, setUser] = useState(null);

  // `userProfile` holds the full profile from our Firestore database.
  // This includes: firstName, lastName, role, studentId, email, etc.
  const [userProfile, setUserProfile] = useState(null);

  // `loading` is true while we're checking if a user is already logged in.
  // We show a loading spinner instead of the app content during this time.
  const [loading, setLoading] = useState(true);

  /*
   * THE AUTH STATE LISTENER
   * -----------------------
   * This useEffect runs ONCE when the app first loads (because of the
   * empty dependency array []).
   *
   * onAuthStateChanged sets up a "listener" — a function that Firebase
   * calls automatically whenever:
   *   - The app starts and a user was previously logged in
   *   - A user logs in
   *   - A user logs out
   *
   * The callback receives `firebaseUser`:
   *   - If someone is logged in → firebaseUser is an object with their info
   *   - If nobody is logged in → firebaseUser is null
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // A user IS logged in → fetch their full profile from the database
        try {
          const profile = await getCurrentUserProfile(firebaseUser.uid);
          setUser(firebaseUser);        // Save the Firebase user object
          setUserProfile(profile);      // Save the full profile data
        } catch (error) {
          // If fetching the profile fails, treat as not logged in
          console.error("Error fetching user profile:", error);
          setUser(null);
          setUserProfile(null);
        }
      } else {
        // No user is logged in → clear everything
        setUser(null);
        setUserProfile(null);
      }
      // Either way, we're done checking → stop showing the loading spinner
      setLoading(false);
    });

    // CLEANUP: When this component is removed (which basically never happens
    // since it wraps the whole app), stop listening to auth changes.
    // This prevents memory leaks.
    return () => unsubscribe();
  }, []);

  /*
   * DERIVE (calculate) role-related booleans from the user profile.
   * These are convenience values so screens can easily check:
   *   "Is this person an admin?" → isAdmin
   *   "Is this person a student?" → isStudent
   *
   * The `?.` is called "optional chaining" — it safely reads a property
   * without crashing if userProfile is null. For example:
   *   null?.role → returns undefined (instead of crashing)
   */
  const role = userProfile?.role || null;
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  /*
   * STEP 3: Broadcast the data to all children
   * --------------------------------------------
   * AuthContext.Provider is the "transmitter" that sends data to all
   * components inside it. The `value` prop is the data being shared.
   *
   * Any component in the app can call useAuth() to receive:
   *   { user, userProfile, loading, role, isAdmin, isStudent }
   */
  return (
    <AuthContext.Provider value={{ user, userProfile, loading, role, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

/*
 * STEP 4: The useAuth() Hook (the "receiver")
 * ---------------------------------------------
 * This is a custom hook that any component can call to access the
 * shared auth data. For example:
 *
 *   const { user, isAdmin } = useAuth();
 *
 * It also has a safety check: if someone accidentally uses useAuth()
 * outside of the AuthProvider, it throws a helpful error message.
 *
 * A "hook" is just a special function (starting with "use") that lets
 * React components access features like state, context, effects, etc.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
