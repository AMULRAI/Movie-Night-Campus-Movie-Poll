import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import BottomTabBar from '../../components/BottomTabBar';
import { getPendingMovies, getApprovedMovies, subscribeToActivePoll } from '../../services/firestoreService';

export default function AdminHome() {
  const { userProfile } = useAuth();
  const navigation = useNavigation();

  const [pendingMovies, setPendingMovies] = useState([]);
  const [approvedMovies, setApprovedMovies] = useState([]);
  const [activePoll, setActivePoll] = useState(null);

  useEffect(() => {
    let unsubscribePoll = () => {};

    const loadData = async () => {
      try {
        const pending = await getPendingMovies();
        setPendingMovies(pending);
        const approved = await getApprovedMovies();
        setApprovedMovies(approved);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      }
    };

    loadData();

    unsubscribePoll = subscribeToActivePoll((poll) => {
      setActivePoll(poll);
    });

    return () => {
      if (unsubscribePoll) unsubscribePoll();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.navigate('Login');
    } catch (e) {
      console.error(e);
    }
  };

  const firstName = userProfile?.firstName || 'Admin';
  const lastName = userProfile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = userProfile?.email || '';

  const quickActions = [
    { icon: '📊', title: 'Manage Polls', sub: 'Create, edit, close polls', route: '/admin/manage-polls' },
    { icon: '🎬', title: 'Approve Movies', sub: 'Review student suggestions', route: '/admin/movies' },
    { icon: '👥', title: 'View Students', sub: 'Registered students', route: '/admin/students' },
    { icon: '📈', title: 'Dashboard', sub: 'Stats, moderation & reports', route: '/admin/dashboard' },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Admin Panel 🛡️</Text>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🗳️</Text>
              <Text style={styles.statValue}>{activePoll ? 1 : 0}</Text>
              <Text style={styles.statLabel}>Active Polls</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎬</Text>
              <Text style={styles.statValue}>{approvedMovies.length}</Text>
              <Text style={styles.statLabel}>Total Movies</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏳</Text>
              <Text style={styles.statValue}>{pendingMovies.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎟️</Text>
              <Text style={styles.statValue}>{activePoll?.totalVotes || 0}</Text>
              <Text style={styles.statLabel}>Votes Cast</Text>
            </View>
          </View>

          {/* Active Poll Card */}
          <Text style={styles.sectionTitleMid}>ACTIVE POLL</Text>
          <View style={styles.activePollCard}>
            <View style={styles.pollRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.livePill}>
                  <Text style={styles.liveDot}>●</Text>
                  <Text style={styles.liveText}>{activePoll ? 'LIVE POLL' : 'NO ACTIVE POLL'}</Text>
                </View>
                <Text style={styles.pollTitle}>{activePoll?.title || 'Create one below'}</Text>
              </View>
              {activePoll && (
                <View style={styles.votesPill}>
                  <Text style={styles.votesText}>{activePoll?.totalVotes || 0} votes</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.manageBtn} onPress={() => navigation.navigate('/admin/manage-polls')}>
              <LinearGradient colors={['#ff3c3c', '#ff8c42']} style={styles.manageGradient}>
                <Text style={styles.manageBtnText}>{activePoll ? 'Manage Poll →' : 'Create Poll →'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitleMid}>QUICK ACTIONS</Text>
          {quickActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.actionCard} onPress={() => navigation.navigate(action.route)}>
              <View style={styles.actionIconBox}>
                <Text style={styles.actionEmoji}>{action.icon}</Text>
              </View>
              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.sub}</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </SafeAreaView>
      <BottomTabBar activeTab="home" role="admin" />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  greeting: { fontSize: 13, color: '#6b6b88' },
  name: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  email: { fontSize: 12, color: '#6b6b88', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  logoutText: { color: '#ff3c3c', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 12 },
  sectionTitleMid: { fontSize: 11, fontWeight: '600', color: '#6b6b88', letterSpacing: 1.5, marginVertical: 20, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', paddingVertical: 18, paddingHorizontal: 16, marginBottom: 10 },
  statEmoji: { fontSize: 24, marginBottom: 10 },
  statValue: { fontSize: 32, color: '#ffffff', fontWeight: '700', lineHeight: 32 },
  statLabel: { fontSize: 12, color: '#6b6b88', marginTop: 4 },
  activePollCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 18 },
  pollRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,200,100,0.1)', borderWidth: 1, borderColor: 'rgba(0,200,100,0.25)', borderRadius: 40, paddingVertical: 5, paddingHorizontal: 12, alignSelf: 'flex-start' },
  liveDot: { color: '#00c864', fontSize: 8, marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '600', color: '#00c864', letterSpacing: 1 },
  pollTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginTop: 8 },
  votesPill: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.2)', borderRadius: 40, paddingVertical: 6, paddingHorizontal: 12 },
  votesText: { fontSize: 13, fontWeight: '600', color: '#ff3c3c' },
  manageBtn: { marginTop: 14, borderRadius: 12, overflow: 'hidden' },
  manageGradient: { padding: 14 },
  manageBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  actionCard: { backgroundColor: '#1c1c2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  actionIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.15)', justifyContent: 'center', alignItems: 'center' },
  actionEmoji: { fontSize: 20 },
  actionTextBlock: { flex: 1, paddingLeft: 14 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  actionSubtitle: { fontSize: 12, color: '#6b6b88', marginTop: 2 },
  actionArrow: { fontSize: 22, color: '#6b6b88' },
});
