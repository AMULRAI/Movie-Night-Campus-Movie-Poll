/*
 * ============================================================================
 * FILE: BottomTabBar.js — BOTTOM NAVIGATION TAB BAR COMPONENT
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This component renders the navigation bar at the BOTTOM of the screen.
 * It shows 5 tabs that let users navigate between the main sections of the app.
 *
 * The tabs are DIFFERENT for students and admins:
 *   STUDENT tabs: Home, Polls, History, Suggest, Profile
 *   ADMIN tabs:   Home, Polls, Movies, Students, Profile
 *
 * For STUDENTS ONLY: A floating "+" button (FAB = Floating Action Button) appears
 * above the tab bar. Tapping it navigates to the "Suggest a Movie" screen.
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Tab Bar": A navigation pattern common in mobile apps where icons at the
 *   bottom of the screen let users switch between main sections. Like the
 *   bottom navigation in Instagram, WhatsApp, etc.
 *
 * - "FAB" (Floating Action Button): A circular button that "floats" above
 *   other content. It's typically used for the primary action on a screen.
 *   In our app, the FAB is for suggesting movies (the primary student action).
 *
 * - "Fragment" (<>...</>): A React wrapper that groups multiple elements
 *   without adding an extra container <View>. Also called "React Fragment".
 *
 * - "activeTab": The currently selected tab (passed as a prop from each screen).
 *   It determines which tab icon is highlighted/colored.
 *
 * CONNECTIONS:
 * -----------
 * - Used by: Almost every screen in the app (at the bottom)
 * - Uses: useNavigation() to navigate when tabs are tapped
 * - Route names must match those defined in AppNavigator.jsx
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// useNavigation: Gives us the navigation object to navigate between screens
import { useNavigation } from '@react-navigation/native';

// LinearGradient: Used for the gradient FAB button (red-to-orange)
import { LinearGradient } from 'expo-linear-gradient';

/*
 * BOTTOM TAB BAR COMPONENT
 * -------------------------
 * PROPS (inputs from the parent screen):
 * - activeTab: Which tab is currently active (e.g., 'home', 'polls', 'profile')
 * - role: The user's role ('student' or 'admin') — determines which tabs to show
 * - theme: 'dark' (default) or 'light' — changes the tab bar appearance
 */
export default function BottomTabBar({ activeTab, role, theme = 'dark' }) {
  const navigation = useNavigation();

  /*
   * DEFINE TABS BASED ON ROLE
   * --------------------------
   * Each tab has:
   *   - key: Unique identifier (matched against activeTab to highlight)
   *   - icon: Emoji displayed as the tab icon
   *   - label: Text shown below the icon
   *   - route: The screen route name to navigate to when tapped
   */
  let tabs = [];
  if (role === 'student') {
    tabs = [
      { key:'home',    icon:'🏠', label:'Home',    route:'/student/dashboard' },
      { key:'polls',   icon:'🗳️', label:'Polls',   route:'/student/polls' },
      { key:'history', icon:'🕐', label:'History', route:'/student/history' },
      { key:'suggest', icon:'💡', label:'Suggest', route:'/student/suggest' },
      { key:'profile', icon:'👤', label:'Profile', route:'/student/profile' },
    ];
  } else if (role === 'admin') {
    tabs = [
      { key:'home',     icon:'🏠', label:'Home',     route:'/admin/dashboard' },
      { key:'polls',    icon:'🗳️', label:'Polls',    route:'/admin/polls' },
      { key:'movies',   icon:'🎬', label:'Movies',   route:'/admin/movies' },
      { key:'students', icon:'👥', label:'Students', route:'/admin/students' },
      { key:'profile',  icon:'👤', label:'Profile',  route:'/admin/profile' },
    ];
  }

  // Check if light theme is requested
  const isLight = theme === 'light';

  return (
    <>
      {/* ── THE TAB BAR CONTAINER ── */}
      {/* Positioned at the very bottom of the screen (position: absolute) */}
      <View style={[styles.container, isLight && styles.containerLight]}>
        {tabs.map((tab) => {
          // Check if THIS tab is the currently active one
          const isActive = activeTab === tab.key;
          // Inactive tabs use muted gray, different shade for light/dark theme
          const inactiveColor = isLight ? '#8e8e93' : '#6b6b88';
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => {
                // Navigate to the tab's screen when pressed
                if (tab.route) {
                  navigation.navigate(tab.route);
                }
              }}
            >
              {/* Tab icon: full opacity if active, dimmed if not */}
              <Text style={[styles.icon, isActive && styles.activeIcon, isLight && !isActive && { opacity: 0.8 }]}>{tab.icon}</Text>
              {/* Tab label: red if active, gray if not */}
              <Text style={[styles.label, { color: isActive ? '#ff3c3c' : inactiveColor }]}>{tab.label}</Text>
              {/* Optional badge (notification count) — not currently used */}
              {tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── FLOATING ACTION BUTTON (Students Only) ── */}
      {/* A floating "+" button above the tab bar for quick movie suggestions */}
      {role === 'student' && (
        <TouchableOpacity 
          style={styles.fabContainer} 
          onPress={() => navigation.navigate('/student/suggest')}
          activeOpacity={0.8}
        >
          {/* Gradient circle (red → orange) */}
          <LinearGradient
            colors={['#ff3c3c', '#ff8c42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Text style={styles.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </>
  );
}

/*
 * STYLES
 * -------
 * The tab bar is absolutely positioned at the bottom of the screen.
 * It uses flexDirection: 'row' to lay out tabs horizontally.
 */
const styles = StyleSheet.create({
  // Main container: fixed at bottom, dark background, horizontal layout
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#12121a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    height: 72,
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 8,
    zIndex: 10, // Ensures it stays above other content
  },
  // Each tab: equal width, centered content
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  // Tab icon: slightly transparent when inactive
  icon: {
    fontSize: 20,
    opacity: 0.6,
    marginBottom: 4,
  },
  // Active tab icon: fully opaque
  activeIcon: {
    opacity: 1,
  },
  // Tab label text
  label: {
    fontSize: 10,
    marginTop: 0,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  // Notification badge (optional, not currently used)
  badge: {
    position: 'absolute',
    top: 6,
    right: '50%',
    marginRight: -20,
    width: 17,
    height: 17,
    backgroundColor: '#ff3c3c',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  // FAB container: floats above the tab bar in bottom-right corner
  fabContainer: {
    position: 'absolute',
    bottom: 92, // Above the tab bar (72px height + 20px gap)
    right: 24,
    zIndex: 20,
    shadowColor: '#ff3c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // The circular gradient button
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // The "+" icon inside the FAB
  fabIcon: {
    fontSize: 34,
    color: '#ffffff',
    fontWeight: '400',
    marginTop: -4, 
  },
  // Light theme override for the container
  containerLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#f0f0f5',
  }
});
