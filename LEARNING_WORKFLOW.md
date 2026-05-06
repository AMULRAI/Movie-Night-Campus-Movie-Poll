# MoviePoll / MovieNight Codebase Learning Workflow

To understand the codebase efficiently, it is highly recommended to use a **top-down** approach. This will help you see how the app starts, how it handles state and navigation, and finally how the UI and backend logic are pieced together.

Here is the ideal learning workflow and the folders/files you should explore, in order:

## 1. The Entry Point (Start Here)
*   **File:** `App.js` (in the root directory)
*   **Why:** This is the absolute starting point of your React Native/Expo application. Look here to see what providers (like Theme, Auth, or Data contexts) wrap your entire app and how the main navigation is initialized.

## 2. Navigation & Routing
*   **Folder:** `src/navigation/`
*   **Why:** Once you know how the app starts, you need to understand how users move around. Check this folder to see the difference between the "Auth Stack" (Login/Register) and the "Main/App Stack" (Student Dashboard, Admin Profile, etc.).

## 3. App State & Context
*   **Folder:** `src/context/`
*   **Why:** Modern React apps use Context to manage global state (like "is the user logged in?" or "is dark mode active?"). Look at the files here (likely an AuthContext or similar) to understand how user data is passed down to every screen without having to pass props manually.

## 4. Configuration & Backend Connection
*   **Folder:** `src/config/`
*   **Why:** This is where the app connects to the outside world. You will likely find your Firebase initialization here. It’s important to see how the app talks to your database.
*   **Bonus File:** Check `firestore.rules` in the root folder to understand the security rules and who is allowed to read/write data in your database.

## 5. Services (The Logic Layer)
*   **Folder:** `src/services/` (e.g., `authService.js`)
*   **Why:** Services handle the heavy lifting. Instead of writing database queries directly in the UI screens, the app abstracts them here. Look here to see the actual functions that log users in, fetch active polls, or submit votes.

## 6. The User Interface (Screens & Components)
*   **Folders:** `src/screens/` and `src/components/`
*   **Why:** Now that you understand the data and routing, look at the UI. 
    *   Start with **`screens`**: These are full pages (like `StudentDashboard`, `AdminProfile`). See how they fetch data using the `services` and `context`.
    *   Move to **`components`**: These are reusable UI pieces (like `LivePollCard.js`, custom buttons, inputs) that make up the screens.

## 7. Constants
*   **Folder:** `src/constants/`
*   **Why:** Finally, this folder usually holds things like color palettes (Theme/Colors), typography, or API URL strings. It's good for understanding the design system.

---

## 🚀 Quick Start Summary
If you only have 10 minutes, do this:
1. Open `App.js` to see the global wrapper.
2. Open `src/navigation` to see the map of the app.
3. Open `src/context` to see how user data is held globally. 
