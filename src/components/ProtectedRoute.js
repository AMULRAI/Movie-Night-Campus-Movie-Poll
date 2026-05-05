/*
 * ============================================================================
 * FILE: ProtectedRoute.js — AUTHENTICATION GUARD COMPONENT
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This component acts as a "security gate" that protects screens from being
 * accessed by unauthorized users. It checks:
 *   1. Is the user logged in? If not → redirect to Login screen
 *   2. If adminOnly is set, is the user an admin? If not → redirect to Home
 *
 * It wraps around other components (its "children"), and only shows them
 * if the user passes the authorization checks.
 *
 * USAGE EXAMPLE:
 *   <ProtectedRoute adminOnly>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * This ensures only logged-in admins can see the AdminDashboard.
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Higher-Order Component" / "Wrapper Component": A component that wraps
 *   around other components and adds extra behavior (like security checks).
 *   It receives its inner components via the `children` prop.
 *
 * - "Redirect": A helper component that navigates to another screen.
 *   navigation.replace() is used instead of navigate() so the user can't
 *   press "back" to return to the protected screen.
 *
 * - "children" prop: In React, anything placed between <Component> and
 *   </Component> is passed as the `children` prop. For example:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   Here, <Dashboard /> is the "children" of ProtectedRoute.
 *
 * CONNECTIONS:
 * -----------
 * - Can wrap any screen that needs authentication
 * - Uses: useAuth() from AuthContext.js (to check login state)
 * - Redirects to: 'Login' or 'Home' routes defined in AppNavigator.jsx
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/*
 * REDIRECT HELPER COMPONENT
 * ---------------------------
 * A tiny component that automatically navigates to a given screen.
 * navigation.replace() replaces the current screen instead of pushing
 * a new one, so the user can't go back with the back button.
 */
const Redirect = ({ to }) => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.replace(to);
  }, [navigation, to]);
  return null; // Renders nothing visible — just performs the redirect
};

/*
 * PROTECTED ROUTE COMPONENT
 * ---------------------------
 * PROPS:
 * - children: The component(s) to show if authorized
 * - adminOnly: If true, only admins can access (default: false)
 *
 * LOGIC:
 * 1. If still loading auth state → show spinner
 * 2. If no user is logged in → redirect to Login
 * 3. If adminOnly and user is not admin → show alert + redirect to Home
 * 4. Otherwise → show the children (the protected content)
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  // Still checking if someone is logged in — show a loading spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff3c3c" />
      </View>
    );
  }

  // No user logged in → send them to the Login screen
  if (!user) {
    return <Redirect to="Login" />;
  }

  // This screen requires admin access, but the user is not an admin
  if (adminOnly && !isAdmin) {
    Alert.alert("Unauthorized", "You do not have permission to access this page.");
    return <Redirect to="Home" />;
  }

  // User is authorized → render the protected content
  // The <></> is a React Fragment (empty wrapper that doesn't add extra DOM nodes)
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f'
  }
});

export default ProtectedRoute;
