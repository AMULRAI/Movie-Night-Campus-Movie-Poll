/*
 * ============================================================================
 * FILE: AppNavigator.jsx — THE APP'S NAVIGATION SYSTEM (Screen Router)
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This file defines ALL the screens in the app and how users move between them.
 * It's like the TABLE OF CONTENTS for the app — it lists every "page" and
 * gives each one a unique name (route) that other screens can navigate to.
 *
 * It uses React Navigation, which is the most popular navigation library
 * for React Native apps. React Navigation manages the "stack" of screens —
 * when you go to a new screen, it's pushed on top. When you go back,
 * it pops the top screen off.
 *
 * SCREEN FLOW:
 *   Splash → Login → Home → (Student Dashboard OR Admin Home)
 *                  → SignUp → Home
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Navigation": Moving between different screens in the app.
 *   Like clicking links on a website to go to different pages.
 *
 * - "Stack Navigator": A navigation pattern where screens are "stacked"
 *   on top of each other. When you navigate to a new screen, it slides
 *   in on top. When you go back, it slides away. Like a stack of cards.
 *
 * - "Route": A named path to a screen. For example, the route '/student/polls'
 *   leads to the StudentHome (voting) screen. Screens navigate to each
 *   other using these route names.
 *
 * - "NavigationContainer": The outermost wrapper that provides the navigation
 *   context to all screens. It must wrap the entire navigator.
 *
 * - "initialRouteName": The first screen shown when the app opens.
 *   We set it to 'Splash' so the splash screen appears first.
 *
 * - "headerShown: false": Hides the default navigation header bar at the
 *   top of each screen (we build our own custom headers instead).
 *
 * CONNECTIONS:
 * -----------
 * - This file is imported by App.js and rendered inside <AuthProvider>
 * - It imports ALL screen components from /screens/ folders
 * - Every screen uses navigation.navigate('routeName') to move between screens
 * - BottomTabBar.js also uses these route names for tab navigation
 */

// React is needed for JSX (the HTML-like syntax used to define components)
import React from 'react';

// NavigationContainer: The root wrapper that provides navigation context.
// Must wrap all navigators. Without it, navigation functions won't work.
import { NavigationContainer } from '@react-navigation/native';

// createNativeStackNavigator: Creates a "stack" navigation system.
// Screens are stacked on top of each other with smooth native transitions.
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ─── IMPORT ALL SCREEN COMPONENTS ──────────────────────

// General screens (shown to all users)
import SplashScreen from '../screens/SplashScreen';     // Welcome/landing page
import LoginScreen from '../screens/LoginScreen';       // Login form
import SignUpScreen from '../screens/SignUpScreen';      // Registration form
import HomeScreen from '../screens/HomeScreen';          // Role-based router (shows admin or student home)

// Student Screens (shown only to students)
import StudentDashboard from '../screens/student/StudentDashboard'; // Student's main dashboard
import StudentHome from '../screens/student/StudentHome';           // Voting screen with movie cards
import SuggestScreen from '../screens/student/SuggestScreen';       // Movie suggestion form
import BookSeats from '../screens/student/BookSeats';               // Seat booking for events
import VotingResults from '../screens/student/VotingResults';       // Live voting results/charts
import EventHistory from '../screens/student/EventHistory';         // Past movie night history
import StudentProfile from '../screens/student/StudentProfile';     // Student profile & settings

// Admin Screens (shown only to admins)
import AdminHome from '../screens/admin/AdminHome';                 // Admin's main home/overview
import AdminDashboard from '../screens/admin/AdminDashboard';       // Analytics & moderation dashboard
import AdminMovies from '../screens/admin/AdminMovies';             // Approve/reject movie suggestions
import AdminManagePolls from '../screens/admin/AdminManagePolls';   // Create/close polls
import AdminStudents from '../screens/admin/AdminStudents';         // View/ban students
import AdminProfile from '../screens/admin/AdminProfile';           // Admin profile & logout

/*
 * CREATE THE STACK NAVIGATOR
 * ---------------------------
 * This creates a navigator object with two properties:
 *   - Stack.Navigator: The wrapper component that holds all screens
 *   - Stack.Screen: Individual screen definitions
 */
const Stack = createNativeStackNavigator();

/*
 * THE APP NAVIGATOR COMPONENT
 * ----------------------------
 * This is the main navigation component. It defines every screen in the app.
 *
 * Each <Stack.Screen> has:
 *   - name: The route name (used by navigation.navigate('name'))
 *   - component: The React component to render for that screen
 *   - options: Configuration (we hide the default header on all screens)
 *
 * ROUTE NAMING CONVENTION:
 *   - General screens: Simple names like 'Splash', 'Login', 'Home'
 *   - Student screens: '/student/...' (e.g., '/student/dashboard')
 *   - Admin screens: '/admin/...' (e.g., '/admin/dashboard')
 *   This URL-like naming makes it clear which section each screen belongs to.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/* 
        Stack.Navigator manages the stack of screens.
        initialRouteName="Splash" means the Splash screen shows first.
      */}
      <Stack.Navigator initialRouteName="Splash">
        
        {/* ── GENERAL ROUTES (accessible by everyone) ── */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        
        {/* ── STUDENT ROUTES (for student-role users) ── */}
        <Stack.Screen name="/student/dashboard" component={StudentDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="/student/polls" component={StudentHome} options={{ headerShown: false }} />
        <Stack.Screen name="/student/suggest" component={SuggestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="/student/booking" component={BookSeats} options={{ headerShown: false }} />
        <Stack.Screen name="/student/results" component={VotingResults} options={{ headerShown: false }} />
        <Stack.Screen name="/student/history" component={EventHistory} options={{ headerShown: false }} />
        <Stack.Screen name="/student/profile" component={StudentProfile} options={{ headerShown: false }} />
        
        {/* ── ADMIN ROUTES (for admin-role users) ── */}
        <Stack.Screen name="/admin/dashboard" component={AdminDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/polls" component={AdminHome} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/movies" component={AdminMovies} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/manage-polls" component={AdminManagePolls} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/students" component={AdminStudents} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/profile" component={AdminProfile} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
