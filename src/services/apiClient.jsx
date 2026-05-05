/*
 * ============================================================================
 * FILE: apiClient.jsx — BACKEND API CLIENT (for Admin-Level Operations)
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This file handles communication with a SEPARATE backend server (Node.js/Express).
 * While most of our app talks directly to Firebase, some operations are too
 * sensitive to do from the user's phone (like banning a user). Those operations
 * go through our own backend server instead.
 *
 * Currently, it provides two functions:
 *   1. banUserAPI() → Tells the backend server to ban a user
 *   2. resolveFlagAPI() → Tells the backend to resolve a moderation flag
 *
 * WHY A SEPARATE BACKEND?
 * Firebase can be accessed directly from the app, but some admin operations
 * (like disabling a user's authentication account) require special "admin
 * privileges" that should NEVER be on a phone. The backend server has these
 * privileges and acts as a secure middleman.
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "API" (Application Programming Interface): A set of rules for how
 *   two programs talk to each other. Our app sends requests to the backend
 *   API, and the API sends back responses. Think of it like ordering food
 *   at a restaurant — you tell the waiter (API) what you want, the kitchen
 *   (backend) prepares it, and the waiter brings it back.
 *
 * - "REST API": A type of API that uses standard web addresses (URLs) and
 *   HTTP methods (GET, POST, PUT, DELETE) to perform operations.
 *
 * - "fetch()": A built-in JavaScript function for making HTTP requests
 *   (sending data to and receiving data from a server over the internet).
 *
 * - "POST request": An HTTP method used to SEND data to a server to
 *   create or trigger something. (GET = read data, POST = send/create data)
 *
 * - "JSON" (JavaScript Object Notation): A text format for exchanging data.
 *   It looks like: { "name": "Amul", "role": "student" }
 *   Both our app and the backend use JSON to communicate.
 *
 * - "Platform.OS": React Native's way of checking whether the app is
 *   running on Android or iOS. This matters for the API URL because
 *   Android emulators use a different IP address than iOS simulators.
 *
 * - "10.0.2.2": A special IP address that Android emulators use to reach
 *   the host computer's localhost (where our backend runs during development).
 *
 * CONNECTIONS:
 * -----------
 * - banUserAPI is called by: src/services/firestoreService.js → banUser()
 * - resolveFlagAPI can be called by admin screens for flag resolution
 * - The BASE_URL can be configured via environment variable
 *   EXPO_PUBLIC_API_BASE_URL for production deployment
 */

// Platform: Tells us if the app is running on 'android' or 'ios'.
// This is needed because Android emulators use a different network address.
import { Platform } from 'react-native';

/*
 * API BASE URL CONFIGURATION
 * ---------------------------
 * LOCAL_API_URL: The URL of our backend server during LOCAL DEVELOPMENT.
 *   - Android emulators can't use "localhost" directly, so they use
 *     "10.0.2.2" which is a special alias for the host computer.
 *   - iOS simulators CAN use "localhost" directly.
 *   - ":5000" is the port number where our Express backend listens.
 *   - "/api" is the base path for all API endpoints (routes).
 *
 * BASE_URL: The actual URL used for API calls.
 *   - In production, it reads from an environment variable (EXPO_PUBLIC_API_BASE_URL)
 *   - If no environment variable is set, it falls back to LOCAL_API_URL
 */
const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || LOCAL_API_URL;

/*
 * ============================================================================
 * FUNCTION: banUserAPI — BAN A USER VIA THE BACKEND SERVER
 * ============================================================================
 * Called by: firestoreService.js → banUser()
 *
 * WHAT IT DOES:
 * Sends a POST request to our backend server telling it to ban a specific user.
 * The backend then uses Firebase Admin SDK (which has elevated privileges)
 * to disable the user's account.
 *
 * PARAMETER:
 * - userId: The Firebase UID of the user to ban
 *
 * RETURNS:
 * - On success: The server's response (e.g., { success: true })
 * - On failure: An object with an error message (e.g., { error: 'Failed to ban user' })
 */
export const banUserAPI = async (userId) => {
    try {
        // Send a POST request to: /api/admin/users/{userId}/ban
        // The URL contains the userId so the backend knows WHO to ban.
        const response = await fetch(`${BASE_URL}/admin/users/${userId}/ban`, {
            method: 'POST',                                    // POST = we're telling the server to DO something
            headers: { 'Content-Type': 'application/json' }    // Tell the server we're sending/expecting JSON data
        });
        // Convert the server's response from JSON text into a JavaScript object
        return await response.json();
    } catch (error) {
        // If the request fails (server is down, no internet, etc.),
        // log a warning and return an error object instead of crashing.
        console.warn("API warning banning user:", error.message);
        return { error: 'Failed to ban user' };
    }
};

/*
 * ============================================================================
 * FUNCTION: resolveFlagAPI — RESOLVE A MODERATION FLAG VIA THE BACKEND
 * ============================================================================
 * Called by: Admin screens when an admin resolves a flagged user/content.
 *
 * WHAT IT DOES:
 * Sends a POST request to the backend to mark a moderation flag as "resolved".
 * Flags are reports about suspicious user activity (spam votes, inappropriate
 * content, etc.)
 *
 * PARAMETER:
 * - flagId: The ID of the flag document to resolve
 *
 * RETURNS:
 * - On success: The server's response
 * - On failure: An error object
 */
export const resolveFlagAPI = async (flagId) => {
    try {
        // Send a POST request to: /api/admin/flags/{flagId}/resolve
        const response = await fetch(`${BASE_URL}/admin/flags/${flagId}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.warn("API warning resolving flag:", error.message);
        return { error: 'Failed to resolve flag' };
    }
};
