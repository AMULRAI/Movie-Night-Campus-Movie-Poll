/*
 * ============================================================================
 * FILE: authService.js — AUTHENTICATION HELPER FUNCTIONS
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This file contains all the functions related to USER AUTHENTICATION:
 *   - registerUser() → Creating a new account (signup)
 *   - loginUser() → Logging into an existing account
 *   - logoutUser() → Logging out
 *   - getCurrentUserProfile() → Fetching a user's profile data from the database
 *
 * These functions act as a "middleman" between the app screens and Firebase.
 * Screens call these functions instead of talking to Firebase directly,
 * which keeps the code clean and organized.
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Service": A file that contains helper functions for a specific task.
 *   It separates the "business logic" (what to do) from the UI (what to show).
 *
 * - "async / await": JavaScript keywords for handling operations that take time
 *   (like network requests). "async" marks a function as asynchronous (it won't
 *   block the app while waiting). "await" pauses execution until the operation
 *   completes. Without these, the app would freeze while waiting for Firebase.
 *
 * - "try/catch": Error handling. Code in "try" runs normally. If anything goes
 *   wrong (like wrong password, network error), the error is "caught" in "catch"
 *   so the app doesn't crash — instead, we can show a friendly error message.
 *
 * - "Firebase Auth UID": When a user signs up, Firebase gives them a unique ID
 *   (like a digital fingerprint). This UID never changes and is used to identify
 *   the user everywhere in the app and database.
 *
 * - "Firestore Document": A single record in the database. Think of it like a
 *   row in a spreadsheet. Each user has one document with their info.
 *
 * CONNECTIONS:
 * -----------
 * - Used by: LoginScreen.jsx (calls loginUser)
 * - Used by: SignUpScreen.jsx (calls registerUser)
 * - Used by: AuthContext.js (calls getCurrentUserProfile)
 * - Used by: AdminProfile.js, StudentProfile.js, AdminHome.js (calls logoutUser)
 * - Depends on: src/config/firebaseConfig.js (for `auth` and `db` objects)
 */

// Import our Firebase Auth and Firestore database instances from config.
// `auth` is used for login/signup/logout operations.
// `db` is used to read/write user profiles in the Firestore database.
import { auth, db } from '../config/firebaseConfig';

// Firebase Auth functions:
// - createUserWithEmailAndPassword: Creates a new user account with email + password
// - signInWithEmailAndPassword: Logs in an existing user with email + password
// - signOut: Logs the current user out
// - onAuthStateChanged: (imported but not used directly here — it's used in AuthContext)
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Firestore functions:
// - doc: Creates a reference (pointer) to a specific document in a collection
// - setDoc: Writes data to a specific document (creates or overwrites it)
// - getDoc: Reads a single document's data from the database
import { doc, setDoc, getDoc } from 'firebase/firestore';

/*
 * ============================================================================
 * FUNCTION: registerUser — CREATE A NEW ACCOUNT
 * ============================================================================
 * Called by: SignUpScreen.jsx when the user fills in the signup form.
 *
 * WHAT IT DOES:
 * 1. Creates a new account in Firebase Auth (handles email/password securely)
 * 2. Creates a profile document in Firestore with additional info
 *    (name, student ID, role) since Firebase Auth only stores email/password
 * 3. Returns the new user object
 *
 * WHY TWO STEPS?
 * Firebase Auth only stores email + password. But we also need to store
 * the student's name, ID, and role. So we create a Firestore document
 * with ALL their info, using their Auth UID as the document ID.
 * This links the auth account to the database profile.
 *
 * PARAMETERS:
 * - firstName: The user's first name (e.g., "Amul")
 * - lastName: The user's last name (e.g., "Rai")
 * - studentId: Their roll number (e.g., "PST-25-0122")
 * - email: Their campus email (e.g., "amul@campus.edu")
 * - password: Their chosen password (Firebase handles encryption)
 * - role: Either 'student' or 'admin'
 */
export const registerUser = async (firstName, lastName, studentId, email, password, role) => {
  try {
    // STEP 1: Create the account in Firebase Auth.
    // Firebase generates a unique UID for this user and securely stores
    // their password (we never see the actual password again).
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // The newly created user object

    // STEP 2: Create a profile document in Firestore.
    // doc(db, 'users', user.uid) creates a reference to:
    //   Database → Collection "users" → Document with ID = user.uid
    // setDoc writes the data to that document.
    await setDoc(doc(db, 'users', user.uid), {
      firstName,           // The user's first name
      lastName,            // The user's last name
      studentId,           // Their roll number
      email,               // Their email address
      role,                // 'student' or 'admin'
      createdAt: new Date() // When they signed up (timestamp)
    });

    // Return the user object so the calling screen knows signup succeeded.
    return user;
  } catch (error) {
    // If anything goes wrong (email already exists, weak password, etc.),
    // throw the error so the calling screen can show an alert.
    throw error;
  }
};

/*
 * ============================================================================
 * FUNCTION: loginUser — LOG INTO AN EXISTING ACCOUNT
 * ============================================================================
 * Called by: LoginScreen.jsx when the user submits the login form.
 *
 * WHAT IT DOES:
 * 1. Authenticates the user with Firebase Auth (checks email + password)
 * 2. Fetches their full profile from Firestore (name, role, etc.)
 * 3. Returns both the user object AND their profile data
 *
 * If the email or password is wrong, Firebase throws an error which is
 * caught and displayed as an alert on the login screen.
 */
export const loginUser = async (email, password) => {
  try {
    // STEP 1: Authenticate with Firebase Auth.
    // signInWithEmailAndPassword checks if the email exists and if
    // the password matches. If not, it throws an error.
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // The authenticated user object

    // STEP 2: Fetch the user's profile from Firestore.
    // We need their role, name, studentId, etc. for the app to work.
    const userDocRef = doc(db, 'users', user.uid);  // Reference to their document
    const userDocSnap = await getDoc(userDocRef);     // Read the document

    // Check if the document exists and extract the data.
    // userDocSnap.exists() returns true if the document was found.
    // userDocSnap.data() returns the actual data inside the document.
    let profileData = null;
    if (userDocSnap.exists()) {
      profileData = userDocSnap.data();
    }

    // Return both the Firebase user and their profile data.
    return { user, profileData };
  } catch (error) {
    throw error;
  }
};

/*
 * ============================================================================
 * FUNCTION: logoutUser — LOG OUT THE CURRENT USER
 * ============================================================================
 * Called by: AdminProfile.js, StudentProfile.js, AdminHome.js
 * when the user taps the "Logout" button.
 *
 * WHAT IT DOES:
 * Simply tells Firebase to sign out the current user.
 * After this, onAuthStateChanged (in AuthContext) will detect the
 * logout and clear all user data from the app.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth); // Firebase clears the user's login session
  } catch (error) {
    throw error;
  }
};

/*
 * ============================================================================
 * FUNCTION: getCurrentUserProfile — FETCH USER PROFILE FROM DATABASE
 * ============================================================================
 * Called by: AuthContext.js whenever a user is detected as logged in.
 *
 * WHAT IT DOES:
 * Takes a user's UID (unique ID) and fetches their full profile from
 * the "users" collection in Firestore.
 *
 * Returns the profile data (firstName, lastName, email, role, studentId, etc.)
 * or null if no profile document was found.
 *
 * PARAMETER:
 * - uid: The user's Firebase Auth UID (unique identifier string)
 */
export const getCurrentUserProfile = async (uid) => {
  try {
    // Create a reference to the user's document in the "users" collection.
    const userDocRef = doc(db, 'users', uid);

    // Read (fetch) the document from the database.
    const userDocSnap = await getDoc(userDocRef);

    // If the document exists, return its data.
    // If not, return null (this shouldn't normally happen, but it's a safety check).
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};
