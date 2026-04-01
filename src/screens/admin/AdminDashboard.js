import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import { logoutUser } from '../../services/authService';

export default function AdminDashboard() {
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

  const name = userProfile?.firstName ? `${userProfile.firstName} ${userProfile?.lastName || ''}`.trim() : 'Admin';
  const email = userProfile?.email || '';

  const actions = [
    { title: 'Manage Polls', subtitle: 'Create and edit movie polls', icon: '📊', route: '/admin/polls' },
    { title: 'Approve Movies', subtitle: 'Review movie suggestions', icon: '🎬', route: '/admin/movies' },
    { title: 'View Students', subtitle: 'Manage student accounts', icon: '👥', route: '/admin/students' },
    { title: 'Schedule Event', subtitle: 'Plan upcoming movie nights', icon: '🗓️', route: '/admin/events' },
    { title: 'View Analytics', subtitle: 'Check voting and attendance stats', icon: '📈', route: '/admin/analytics' },
  ];

  return (
    <RoleGuard allowedRoles={['admin']} fallbackRoute="/student/dashboard">
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Welcome back, Admin 🛡️</Text>
              <Text style={styles.pollTitle}>Friday Movie Night</Text>
              <Text style={styles.pollSubtitle}>Ends in 02:45:30</Text>
            </View>
            <TouchableOpacity style={styles.manageButton} onPress={() => navigation.navigate('/admin/polls')}>
              <Text style={styles.manageButtonText}>Manage Poll →</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🗳️</Text>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Active Polls</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎬</Text>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Total Movies</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>48</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎟️</Text>
              <Text style={styles.statNumber}>31</Text>
              <Text style={styles.statLabel}>Seats Booked</Text>
            </View>
          </View>

          {/* Admin Actions */}
          <Text style={styles.sectionTitle}>Admin Actions</Text>
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
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60, // approximate safe area for header spacing
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerText: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#ff3c3c',
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b6b88',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 60, 60, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#ff3c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b6b88',
    fontWeight: '500',
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
});
