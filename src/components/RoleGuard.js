/*
 * ============================================================================
 * FILE: RoleGuard.js — ROLE-BASED ACCESS CONTROL COMPONENT
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * Similar to ProtectedRoute, but more flexible. It checks if the current
 * user's role is in a list of "allowed roles". If not, it redirects them.
 *
 * USAGE EXAMPLE:
 *   <RoleGuard allowedRoles={['admin', 'organizer']}>
 *     <AdminDashboard />
 *   </RoleGuard>
 * This allows both admins AND organizers to see the dashboard.
 *
 * DIFFERENCE FROM PROTECTEDROUTE:
 * - ProtectedRoute: Binary check (admin or not admin)
 * - RoleGuard: Flexible check (any list of allowed roles)
 *
 * CONNECTIONS:
 * -----------
 * - Can wrap any screen that needs role-based access control
 * - Uses: useAuth() from AuthContext.js (to check user role)
 * - Redirects to: 'Login' if not logged in, or fallbackRoute if wrong role
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/*
 * ROLE GUARD COMPONENT
 * ---------------------
 * PROPS:
 * - children: The component(s) to show if the user has the right role
 * - allowedRoles: An array of role strings (e.g., ['admin', 'organizer'])
 * - fallbackRoute: Where to redirect if the user's role isn't allowed (default: 'Login')
 */
export default function RoleGuard({ children, allowedRoles, fallbackRoute = 'Login' }) {
  const { user, role, loading } = useAuth();
  const navigation = useNavigation();

  /*
   * AUTHORIZATION CHECK (runs when auth state changes)
   * ---------------------------------------------------
   * useEffect watches for changes in loading, user, role, etc.
   * Once loading is complete:
   *   - If no user → reset navigation to Login (clears the entire stack)
   *   - If user's role is NOT in allowedRoles → navigate to the fallback route
   *
   * navigation.reset() clears ALL screens from the stack, preventing
   * the user from pressing "back" to reach the protected screen.
   *
   * .includes() checks if the user's role is in the allowedRoles array.
   * Example: ['admin', 'organizer'].includes('student') → false
   */
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in — reset to Login screen
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else if (!allowedRoles.includes(role)) {
        // Logged in but wrong role — navigate to fallback
        const routeName = fallbackRoute === '/login' ? 'Login' : fallbackRoute;
        navigation.navigate(routeName);
      }
    }
  }, [loading, user, role, allowedRoles, fallbackRoute, navigation]);

  // Show loading spinner while checking auth OR if user doesn't have the right role
  if (loading || !user || !allowedRoles.includes(role)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff3c3c" />
      </View>
    );
  }

  // User is authorized — show the protected content
  return <>{children}</>;
}
