import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import { logoutUser } from '../../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Logout Error', error.message || 'Failed to logout');
    }
  };

  const firstName = userProfile?.firstName || 'Alex';
  const lastName = userProfile?.lastName || 'Johnson';
  const fullName = userProfile ? `${firstName} ${lastName}`.trim() : 'Alex Johnson';

  const actions = [
    { title: 'Suggest a Movie', subtitle: 'Submit a movie for the next poll', icon: '🎬', route: '/student/suggest' },
    { title: 'Active Polls', subtitle: 'Vote on current movie options', icon: '🗳️', route: '/student/polls' },
    { title: 'Book My Seat', subtitle: 'Reserve your spot for movie night', icon: '🎟️', route: '/student/booking' },
    { title: 'Past Movie Nights', subtitle: 'See history of watched movies', icon: '📜', route: '/student/history' },
    { title: 'Group Chat', subtitle: 'Discuss movies with others', icon: '💬', route: '/student/chat' },
  ];

  return (
    <RoleGuard allowedRoles={['student']} fallbackRoute="/admin/dashboard">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Good Evening 👋</Text>
              <Text style={styles.name}>{fullName}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity>
                <View style={styles.avatar} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Poll Banner */}
          <LinearGradient
            colors={['#ff3c3c', '#ff8c42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>🗳️ Tonight's Poll is LIVE!</Text>
              <Text style={styles.heroSubtitle}>Vote for the movie you want to watch</Text>
              <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('/student/polls')}>
                <Text style={styles.heroButtonText}>Vote Now →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎬</Text>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Movies Suggested</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>My Votes Cast</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎟️</Text>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Seats Booked</Text>
            </View>
          </View>

          {/* Student Actions */}
          <Text style={styles.sectionTitle}>Student Actions</Text>
          <View style={styles.actionsList}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.route)}
              >
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={[styles.tabIcon, styles.tabActive]}>🏠</Text>
            <Text style={[styles.tabLabel, styles.tabActiveText]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('/student/polls')}>
            <Text style={styles.tabIcon}>🗳️</Text>
            <Text style={styles.tabLabel}>Polls</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('/student/history')}>
            <Text style={styles.tabIcon}>🎬</Text>
            <Text style={styles.tabLabel}>Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollView: {
    backgroundColor: '#0a0a0f',
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 110, // padding to allow scrolling past bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 13,
    color: '#6b6b88',
    fontFamily: 'DM Sans',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Bebas Neue',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bellIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    backgroundColor: '#ff3c3c',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6b6b88',
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  heroButtonText: {
    color: '#ff3c3c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#1a1a26',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b6b88',
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  actionsList: {
    gap: 12, // vertical gap between elements
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 14,
    padding: 16,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 60, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b6b88',
  },
  actionArrow: {
    fontSize: 20,
    color: '#6b6b88',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#12121a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    paddingBottom: 24, // safe area padding
    paddingTop: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#6b6b88',
    fontWeight: '500',
  },
  tabActiveText: {
    color: '#ff3c3c',
  },
});
