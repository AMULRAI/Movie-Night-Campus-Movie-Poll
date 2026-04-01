import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BottomTabBar({ activeTab, role }) {
  const navigation = useNavigation();

  let tabs = [];
  if (role === 'student') {
    tabs = [
      { key:'home',    icon:'🏠', label:'Home',    route:'/student/dashboard' },
      { key:'suggest', icon:'➕', label:'Suggest', route:'/student/suggest', badge: 3 },
      { key:'event',   icon:'🔷', label:'Event',   route:'/student/events' },
      { key:'history', icon:'🕐', label:'History', route:'/student/history' },
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

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
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
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, { color: isActive ? '#ff3c3c' : '#6b6b88' }]}>{tab.label}</Text>
            {tab.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
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
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: '50%',
    marginRight: -20, // moves it effectively center+8px (assuming icon is ~20px width)
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
});
