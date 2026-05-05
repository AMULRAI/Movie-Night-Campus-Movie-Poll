/*
 * ============================================================================
 * FILE: AdminProfile.js — ADMIN USER PROFILE SCREEN
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This screen displays the admin user's profile information and provides
 * a logout button. It shows:
 *   - An avatar circle with the admin's initials (first letter of first & last name)
 *   - The admin's full name and email
 *   - An "ADMIN" role badge
 *   - An info card with email and role details
 *   - A logout button
 *
 * It also includes the BottomTabBar at the bottom for navigation between
 * admin screens (Home, Polls, Movies, Students, Profile).
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "SafeAreaView": A component that automatically adds padding so content
 *   doesn't overlap with the phone's status bar (battery/time area at the top)
 *   or the home indicator (the swipe bar at the bottom on newer phones).
 *
 * - "ScrollView": A container that lets content scroll up/down if it's taller
 *   than the screen. Like scrolling a web page.
 *
 * - "TouchableOpacity": A button component that becomes slightly transparent
 *   (fades) when pressed, giving visual feedback that it was tapped.
 *
 * - "StatusBar": Controls the appearance of the phone's top status bar
 *   (the area showing time, battery, signal). We set it to "light-content"
 *   so the text is white (visible on our dark background).
 *
 * - "StyleSheet.create()": Creates a set of styles (similar to CSS in web
 *   development). Styles define how components look — colors, sizes, spacing.
 *
 * - "Platform.OS": Checks if the app is running on 'android' or 'ios'.
 *   Used here because Android needs extra top padding for the status bar.
 *
 * - "Optional chaining" (?.): Safely reads a property that might not exist.
 *   userProfile?.firstName means: "If userProfile exists, get firstName.
 *   If userProfile is null/undefined, return undefined instead of crashing."
 *
 * - "navigation.reset()": Instead of just going to a screen (which adds it
 *   to the stack), reset() CLEARS the entire navigation stack and starts fresh.
 *   Used for logout so the user can't press "back" to return to the app.
 *
 * CONNECTIONS:
 * -----------
 * - Route name: '/admin/profile' (defined in AppNavigator.jsx)
 * - Uses: useAuth() from AuthContext.js (to get user profile data)
 * - Uses: logoutUser() from authService.js (to sign out)
 * - Includes: BottomTabBar component (for bottom navigation)
 * - Navigates to: 'Login' screen (after logout)
 */

// React is the library for building UI components
import React from 'react';

// React Native UI components:
// ScrollView: Scrollable container for content
// View: A basic container (like a <div> in HTML)
// Text: Displays text
// TouchableOpacity: A pressable button with opacity feedback
// StatusBar: Controls the phone's status bar appearance
// StyleSheet: Creates style objects for components
// Platform: Checks the operating system (android/ios)
import { ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform } from 'react-native';

// SafeAreaView from the safe-area-context library (better than React Native's built-in one)
// It handles the "safe area" on phones with notches, rounded corners, etc.
import { SafeAreaView } from 'react-native-safe-area-context';

// useNavigation: A React Navigation hook that gives us the navigation object.
// We use it to navigate between screens (e.g., go to Login after logout).
import { useNavigation } from '@react-navigation/native';

// useAuth: Our custom hook from AuthContext.js that provides the logged-in
// user's data (userProfile, user object, role, etc.)
import { useAuth } from '../../context/AuthContext';

// logoutUser: The function from authService.js that signs the user out of Firebase
import { logoutUser } from '../../services/authService';

// BottomTabBar: The navigation tab bar shown at the bottom of the screen
import BottomTabBar from '../../components/BottomTabBar';

/*
 * THE ADMIN PROFILE COMPONENT
 * ----------------------------
 * This is the main screen component. It's a "functional component" (a function
 * that returns JSX). It displays the admin's profile info and a logout button.
 */
export default function AdminProfile() {
  // Get the current user's profile data and Firebase user object from AuthContext.
  // userProfile: Contains firstName, lastName, email, role, etc. from Firestore
  // user: The Firebase Auth user object (contains uid, email)
  const { userProfile, user } = useAuth();

  // Get the navigation object so we can navigate to other screens
  const navigation = useNavigation();

  /*
   * EXTRACT USER INFORMATION
   * -------------------------
   * We safely extract the user's name, email, and initials.
   * The "|| 'default'" pattern provides a fallback value if the data is missing.
   */
  const firstName = userProfile?.firstName || 'Admin';      // Fallback to "Admin" if no first name
  const lastName = userProfile?.lastName || '';               // Fallback to empty string
  const fullName = `${firstName} ${lastName}`.trim();        // Combine and remove extra spaces
  const email = userProfile?.email || user?.email || '';     // Try profile email, then auth email
  // Create initials from the first letter of first and last name (e.g., "AR")
  const initials = (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase();

  /*
   * LOGOUT HANDLER
   * ---------------
   * This async function is called when the admin taps the "Logout" button.
   * It:
   *   1. Calls logoutUser() to sign out of Firebase
   *   2. Resets the navigation stack to the Login screen
   *
   * navigation.reset() clears the entire history so pressing "back"
   * won't return to the profile screen (they're logged out now).
   */
  const handleLogout = async () => {
    try {
      await logoutUser();
      // Reset navigation: clear all screens and go to Login
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error(e);
    }
  };

  /*
   * THE SCREEN UI (what the user sees)
   * ------------------------------------
   * Structure:
   *   SafeAreaView (handles phone notches/status bars)
   *     StatusBar (sets status bar to light text on dark background)
   *     ScrollView (makes content scrollable)
   *       Avatar Section (circle with initials, name, email, role badge)
   *       Info Card (email and role details)
   *       Logout Button
   *     BottomTabBar (navigation tabs at bottom)
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Set the phone's status bar to show white text (for dark backgrounds) */}
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Scrollable content area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── AVATAR SECTION: Profile picture (initials), name, email, role ── */}
        <View style={styles.avatarSection}>
          {/* Circle with the user's initials (acts as a profile picture) */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {/* User's full name */}
          <Text style={styles.name}>{fullName}</Text>
          {/* User's email */}
          <Text style={styles.email}>{email}</Text>
          {/* "ADMIN" role badge */}
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>ADMIN</Text>
          </View>
        </View>

        {/* ── INFO CARD: Shows email and role in a card format ── */}
        <View style={styles.infoCard}>
          {/* Email row */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          {/* Divider line between rows */}
          <View style={styles.divider} />
          {/* Role row */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>Administrator</Text>
          </View>
        </View>

        {/* ── LOGOUT BUTTON ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── BOTTOM NAVIGATION TAB BAR ── */}
      {/* activeTab="profile" highlights the Profile tab */}
      {/* role="admin" shows admin-specific tabs */}
      <BottomTabBar activeTab="profile" role="admin" />
    </SafeAreaView>
  );
}

/*
 * STYLES
 * -------
 * StyleSheet.create() creates an optimized style object.
 * Each property maps to a CSS-like style rule.
 *
 * STYLE NAMING CONVENTION:
 * - safeArea: The outermost container
 * - scrollContent: The scrollable inner content
 * - avatarSection/Circle/Text: The profile picture area
 * - name/email: Text styles for user info
 * - rolePill/roleText: The "ADMIN" badge
 * - infoCard/Row/Label/Value: The details card
 * - divider: A thin horizontal line
 * - logoutBtn/logoutText: The logout button
 */
const styles = StyleSheet.create({
  // Main container: fills the screen with dark background.
  // On Android, adds top padding equal to the status bar height.
  safeArea: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  // Content padding with extra bottom space so the tab bar doesn't cover content
  scrollContent: { padding: 24, paddingBottom: 100 },
  // Center-aligned section for the avatar, name, and role
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  // The circular avatar with initials — 80x80 with a red-tinted border
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1c1c2e', borderWidth: 2, borderColor: 'rgba(255,60,60,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  // The initials text inside the avatar circle
  avatarText: { fontSize: 28, fontWeight: '700', color: '#ff3c3c' },
  // User's name (large, white, bold)
  name: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  // User's email (smaller, muted gray color)
  email: { fontSize: 14, color: '#6b6b88', marginBottom: 10 },
  // The "ADMIN" pill badge — red-tinted background with red text
  rolePill: { backgroundColor: 'rgba(255,60,60,0.15)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 14 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#ff3c3c', letterSpacing: 1 },
  // The info card container — dark card with subtle border
  infoCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 18, marginBottom: 20 },
  // Each row in the info card (label on left, value on right)
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  // Label text (gray, left side)
  infoLabel: { fontSize: 14, color: '#6b6b88' },
  // Value text (white, bold, right side)
  infoValue: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  // Thin divider line between info rows
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  // Logout button — red-tinted with red border
  logoutBtn: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  // Logout button text — red and bold
  logoutText: { color: '#ff3c3c', fontSize: 16, fontWeight: '600' },
});
