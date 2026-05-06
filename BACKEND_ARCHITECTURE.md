# MoviePoll Backend Architecture & Workflow

MoviePoll uses a **Hybrid Backend Architecture**. This means we rely on Firebase for most real-time, day-to-day operations, but we use a custom Node.js/Express backend server for sensitive administrative tasks.

Here is a detailed breakdown of how the backend is structured and how data flows through the application.

---

## 🏗️ 1. The Architecture (Hybrid Model)

### A. Firebase Backend-as-a-Service (BaaS)
The majority of the application connects directly from the React Native app to Firebase.
*   **Firebase Authentication:** Handles user sign-up, login, and secure session management.
*   **Cloud Firestore:** A NoSQL database that stores all our data (Users, Polls, Votes, Movies, Flags). The app connects *directly* to Firestore to fetch and update this data.

### B. Custom Node.js / Express Server (`/backend` folder)
We have a separate server running Node.js. 
*   **Why do we need this?** Some operations are too sensitive to do directly from a phone. For example, if an admin wants to **ban a user**, we need to use the `Firebase Admin SDK` (which has master privileges) to disable their authentication account.
*   **Where is it?** This code lives in the `backend/src` directory.

---

## 🔄 2. The Workflow (How Data Moves)

Here is how different actions are routed through the backend:

### Scenario 1: A Student Votes (Direct to Firebase)
1.  **Trigger:** Student presses "Vote" on a live poll in the app.
2.  **App Logic:** `src/services/firestoreService.js` creates a new vote document.
3.  **Connection:** The app sends this data *directly* to Cloud Firestore.
4.  **Security Rules:** Firebase checks `firestore.rules` to ensure the user is logged in and hasn't voted already. If valid, the vote is saved.

### Scenario 2: An Admin Bans a User (Via Node.js Server)
1.  **Trigger:** Admin presses "Ban User" in the `AdminProfile` screen.
2.  **App Logic:** `src/services/apiClient.jsx` (specifically `banUserAPI`) is triggered.
3.  **Connection:** Instead of talking to Firebase, the app makes an HTTP `POST` request to our Node.js server (`http://localhost:5000/api/admin/users/{userId}/ban`).
4.  **Server Logic:** The Express server receives the request.
5.  **Execution:** The server uses the Firebase Admin SDK to connect to Firebase securely and disable the user's account. It then sends a "Success" response back to the app.

---

## 📂 3. Key Backend Files to Know

If you want to understand or modify the backend, look at these files:

### In the React Native App (`/src`)
*   **`src/config/firebase.js`**: Initializes the Firebase connection for the app.
*   **`src/services/firestoreService.js`**: Contains functions like `getLivePoll()`, `submitVote()`, etc. These talk directly to Firestore.
*   **`src/services/apiClient.jsx`**: Contains functions like `banUserAPI()`. These talk to the custom Node.js server.
*   **`firestore.rules`** (Root Folder): The security bouncer. This file decides who is allowed to read or write specific documents in the database.

### In the Node.js Server (`/backend`)
*   **`backend/src/app.js`**: The entry point of the Express server. It sets up routes (e.g., `/api/admin`).
*   **`backend/src/routes/`**: Defines the endpoints (URLs) the server listens to.
*   **`backend/src/controllers/`**: Contains the actual logic that runs when a route is hit (e.g., the code that actually bans the user).

---

## 🚀 Summary
*   **Everyday stuff** (Voting, Suggesting Movies, Viewing Profiles) -> **App directly to Firebase.**
*   **Admin/Dangerous stuff** (Banning users, resolving moderation flags) -> **App to Node.js Server to Firebase Admin.**
