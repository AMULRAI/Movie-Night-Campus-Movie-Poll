import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BottomTabBar({ activeTab, role, theme = 'dark' }) {
  const navigation = useNavigation();

  let tabs = [];
  if (role === 'student') {
    tabs = [
      { key:'home',    icon:'🏠', label:'Home',    route:'/student/dashboard' },
      { key:'polls',   icon:'🗳️', label:'Polls',   route:'/student/polls' },
      { key:'history', icon:'🕐', label:'History', route:'/student/history' },
      { key:'suggest', icon:'💡', label:'Suggest', route:'/student/suggest', badge: '3' },
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

  const isLight = theme === 'light';

  return (
    <>
      <View style={[styles.container, isLight && styles.containerLight]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const inactiveColor = isLight ? '#8e8e93' : '#6b6b88';
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => {
                if (tab.route) {
                  navigation.navigate(tab.route);
                }
              }}
            >
              <Text style={[styles.icon, isActive && styles.activeIcon, isLight && !isActive && { opacity: 0.8 }]}>{tab.icon}</Text>
              <Text style={[styles.label, { color: isActive ? '#ff3c3c' : inactiveColor }]}>{tab.label}</Text>
              {tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Action Button purely for Suggest */}
      {role === 'student' && (
        <TouchableOpacity 
          style={styles.fabContainer} 
          onPress={() => navigation.navigate('/student/suggest')}
          activeOpacity={0.8}
        >
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

const styles = StyleSheet.create({
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
    zIndex: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
    marginBottom: 4,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    marginTop: 0,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
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
  fabContainer: {
    position: 'absolute',
    bottom: 92, // Float above the tab bar safely
    right: 24, // Bottom right corner
    zIndex: 20,
    shadowColor: '#ff3c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 34,
    color: '#ffffff',
    fontWeight: '400',
    marginTop: -4, 
  },
  containerLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#f0f0f5',
  }
});
