/*
 * ============================================================================
 * FILE: HomeScreen.jsx — ROLE-BASED HOME ROUTER
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This is a "router" screen — it doesn't show its own content. Instead,
 * it checks the logged-in user's ROLE and shows the correct home screen:
 *   - If the user is an ADMIN → Shows the AdminHome component
 *   - If the user is a STUDENT → Shows the StudentDashboard component
 *
 * While it's checking the role (loading state), it shows a loading spinner.
 *
 * WHY THIS SCREEN EXISTS:
 * After login, the app navigates to 'Home'. But admins and students see
 * completely different dashboards. This screen acts as a "traffic controller"
 * that directs users to the right place based on their role.
 *
 * CONNECTIONS:
 * -----------
 * - Route name: 'Home' (defined in AppNavigator.jsx)
 * - Navigated to from: LoginScreen.jsx and SignUpScreen.jsx (after successful auth)
 * - Uses: useAuth() to check the user's role
 * - Renders: AdminHome or StudentDashboard based on role
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// useAuth: Gets the current user's role (admin or student) from AuthContext
import { useAuth } from '../context/AuthContext';

// The two possible home screens based on role
import StudentDashboard from './student/StudentDashboard';
import AdminHome from './admin/AdminHome';

export default function HomeScreen() {
    // Get the user's role and loading state from the auth context
    const { role, isAdmin, loading } = useAuth();

    // LOADING STATE: Show a spinner while checking the user's role
    // (This happens briefly when the app first loads and is verifying auth)
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#ff3c3c" />
            </View>
        );
    }

    // ADMIN: If the user is an admin, show the AdminHome screen
    if (isAdmin || role === 'admin') {
        return <AdminHome />;
    }

    // STUDENT (default): Show the StudentDashboard
    return <StudentDashboard />;
}

/* STYLES: Simple centered container for the loading spinner */
const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#0a0a0f' 
    }
});
