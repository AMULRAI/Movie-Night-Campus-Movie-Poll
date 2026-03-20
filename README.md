# MovieNight: Campus Movie Poll 🍿

A scalable full-stack application for university/campus movie night polling, event scheduling, and real-time seat reservations.

## Tech Stack
- **Frontend**: React Native, Expo, React Navigation 
- **Backend**: Node.js, Express.js
- **Database**: Firebase (Firestore JSON DB) & Firebase Authentication
- **Styling**: To be added based on preference (Tailwind / NativeWind UI)

## Monorepo Architecture
Our clean separation of concerns:
```
movie-poll/
├── backend/                  # The Node.js Express server + REST API
│   ├── src/
│   │   ├── config/           # App/DB configurations
│   │   ├── controllers/      # API Logic flow
│   │   ├── middleware/       # Express global middlewares (i.e. auth, error)
│   │   ├── routes/           # REST endpoint definitions
│   │   └── services/         # Core business logic (Firestore interactions)
│   └── .env.example          # Template for backend credentials
│
├── src/                      # The React Native (Expo) Frontend app
│   ├── components/           # Reusable UI elements (PollCard, VoteButton)
│   ├── context/              # Global state (AuthContext, PollContext)
│   ├── navigation/           # React navigation routing wrappers
│   ├── screens/              # Large view components representing specific pages
│   ├── services/             # Helper abstractions for API REST calls (apiClient.js)
│   └── utils/                # Constants and generic helpers
│
└── App.js                    # Mobile frontend entrypoint  
```

## Setup Instructions

### 1. Frontend (Mobile App)
The root directory of the `movie-poll` folder acts as the React Native entry point.
1. Run `npm install` in the ROOT folder.
2. Install the navigation libraries required for the architecture:
   ```bash
   npm install @react-navigation/native @react-navigation/native-stack
   npx expo install react-native-screens react-native-safe-area-context
   ```
3. Start the app: 
   ```bash
   npm start
   ```

### 2. Backend (Express API)
All backend server files are stored in the nested `backend/` directory.
1. Form a new terminal and change path to backend: `cd backend`
2. Run `npm install` to install Express, Firebase, etc.
3. Make a copy of `.env.example` named `.env` and fill out your Firebase details.
4. Run `npm run dev` to start the backend with nodemon hot-reload.
   The backend runs by default on **http://localhost:5000**.
   Test the endpoint: `http://localhost:5000/health`

## Extending the App
- When adding a new feature (e.g., chat), add `chat.routes.js` to the backend routes, corresponding controllers, and `ChatScreen` to your React Native `src/screens` array.
- Admin capabilities are designed to be enforced through custom middleware referencing `roles` fetched alongside auth tokens.
